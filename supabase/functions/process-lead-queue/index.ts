import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Rate limiting configuration
const FIRECRAWL_DELAY_MS = 2000; // 2 seconds between Firecrawl calls
const AI_DELAY_MS = 1000; // 1 second between AI calls
const BATCH_SIZE = 5; // Process 5 leads per invocation

interface ProcessingResult {
  lead_id: number;
  website: string;
  scrape_status: 'scraped' | 'processed' | 'failed';
  error?: string;
}

async function scrapeWebsite(website: string, apiKey: string): Promise<{ markdown?: string; error?: string }> {
  try {
    let formattedUrl = website.trim();
    if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
      formattedUrl = `https://${formattedUrl}`;
    }

    console.log(`Scraping: ${formattedUrl}`);

    const response = await fetch('https://api.firecrawl.dev/v1/scrape', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: formattedUrl,
        formats: ['markdown'],
        onlyMainContent: true,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return { error: data.error || `Firecrawl failed with status ${response.status}` };
    }

    const markdown = data.data?.markdown || data.markdown;
    return { markdown };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown scrape error';
    return { error: message };
  }
}

async function generateSeoContent(
  markdown: string,
  businessName: string,
  address: string,
  aiApiKey: string
): Promise<{ content?: any; error?: string }> {
  try {
    const systemPrompt = `You are an expert SEO content writer specializing in local business optimization and GEO (Generative Engine Optimization). Generate compelling, factual content for dentist profiles that will rank well in both traditional search and AI-powered search engines.`;

    const userPrompt = `Based on the following website content for "${businessName}" located at "${address}", generate SEO-optimized content.

Website Content:
${markdown.substring(0, 8000)}

Generate a JSON response with:
1. "seo_title": A compelling title under 60 characters with main keyword
2. "seo_description": Meta description under 160 characters
3. "profile_content": 2-3 paragraphs of unique, engaging content about this practice (200-300 words)
4. "services": Array of services offered (extract from content)
5. "unique_features": Array of what makes this practice stand out
6. "faq": Array of 3 FAQ items with "question" and "answer" fields`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${aiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        response_format: { type: 'json_object' }
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return { error: errorData.error?.message || `AI API failed with status ${response.status}` };
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    if (!content) {
      return { error: 'No content generated' };
    }

    try {
      return { content: JSON.parse(content) };
    } catch {
      return { content: { raw_content: content } };
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown AI error';
    return { error: message };
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const firecrawlKey = Deno.env.get("FIRECRAWL_API_KEY");
    const lovableAiKey = Deno.env.get("LOVABLE_API_KEY");

    if (!firecrawlKey) {
      return new Response(
        JSON.stringify({ error: "FIRECRAWL_API_KEY not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!lovableAiKey) {
      return new Response(
        JSON.stringify({ error: "LOVABLE_API_KEY not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Parse request body for optional parameters
    let stage = 'scrape'; // Default to scrape stage
    let maxLeads = BATCH_SIZE;
    
    try {
      const body = await req.json();
      stage = body.stage || 'scrape';
      maxLeads = body.batch_size || BATCH_SIZE;
    } catch {
      // Use defaults if no body
    }

    const results: ProcessingResult[] = [];

    if (stage === 'scrape') {
      // STAGE 1: Scrape websites that haven't been scraped yet
      const { data: pendingLeads, error: fetchError } = await supabase
        .from("dentist_scrapes")
        .select("id, website, city, retry_count")
        .or("scrape_status.is.null,scrape_status.eq.pending")
        .is("text_content", null)
        .order("id", { ascending: true })
        .limit(maxLeads);

      if (fetchError) {
        console.error("Error fetching pending leads:", fetchError);
        return new Response(
          JSON.stringify({ error: fetchError.message }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      if (!pendingLeads || pendingLeads.length === 0) {
        console.log("No pending leads to scrape");
        return new Response(
          JSON.stringify({ 
            success: true, 
            message: "No pending leads to scrape",
            stage: 'scrape',
            processed: 0,
            should_continue: false
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      console.log(`Processing ${pendingLeads.length} leads for scraping`);

      for (const lead of pendingLeads) {
        const result: ProcessingResult = {
          lead_id: lead.id,
          website: lead.website,
          scrape_status: 'scraped'
        };

        // Scrape the website
        const { markdown, error: scrapeError } = await scrapeWebsite(lead.website, firecrawlKey);

        if (scrapeError) {
          result.scrape_status = 'failed';
          result.error = scrapeError;
          
          const { error: updateError } = await supabase
            .from("dentist_scrapes")
            .update({ 
              scrape_status: 'failed',
              processing_error: scrapeError,
              retry_count: (lead as any).retry_count ? (lead as any).retry_count + 1 : 1,
              scraped_at: new Date().toISOString()
            })
            .eq("id", lead.id);
          
          if (updateError) {
            console.error(`Failed to update lead ${lead.id} as failed:`, updateError);
          }
        } else if (markdown && markdown.trim().length > 0) {
          const { error: updateError } = await supabase
            .from("dentist_scrapes")
            .update({ 
              text_content: markdown,
              has_content: true,
              scrape_status: 'scraped',
              scraped_at: new Date().toISOString()
            })
            .eq("id", lead.id);
          
          if (updateError) {
            console.error(`Failed to update lead ${lead.id} as scraped:`, updateError);
            result.scrape_status = 'failed';
            result.error = `DB update failed: ${updateError.message}`;
          }
        } else {
          // Empty content - mark as failed
          result.scrape_status = 'failed';
          result.error = 'No content returned from scrape';
          
          const { error: updateError } = await supabase
            .from("dentist_scrapes")
            .update({ 
              scrape_status: 'failed',
              processing_error: 'Empty content returned',
              retry_count: (lead as any).retry_count ? (lead as any).retry_count + 1 : 1,
              scraped_at: new Date().toISOString()
            })
            .eq("id", lead.id);
          
          if (updateError) {
            console.error(`Failed to update lead ${lead.id} as empty:`, updateError);
          }
        }

        results.push(result);

        // Rate limiting delay between requests
        if (pendingLeads.indexOf(lead) < pendingLeads.length - 1) {
          await new Promise(resolve => setTimeout(resolve, FIRECRAWL_DELAY_MS));
        }
      }
    } else if (stage === 'generate') {
      // STAGE 2: Generate SEO content for scraped leads
      const { data: scrapedLeads, error: fetchError } = await supabase
        .from("dentist_scrapes")
        .select("id, website, city, text_content")
        .eq("scrape_status", "scraped")
        .not("text_content", "is", null)
        .limit(maxLeads);

      if (fetchError) {
        console.error("Error fetching scraped leads:", fetchError);
        return new Response(
          JSON.stringify({ error: fetchError.message }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      if (!scrapedLeads || scrapedLeads.length === 0) {
        console.log("No scraped leads to process for SEO generation");
        return new Response(
          JSON.stringify({ 
            success: true, 
            message: "No scraped leads to process",
            stage: 'generate',
            processed: 0,
            should_continue: false
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      console.log(`Processing ${scrapedLeads.length} leads for SEO generation`);

      for (const lead of scrapedLeads) {
        const result: ProcessingResult = {
          lead_id: lead.id,
          website: lead.website,
          scrape_status: 'processed'
        };

        // Generate SEO content
        const { content, error: aiError } = await generateSeoContent(
          lead.text_content || '',
          lead.website,
          lead.city || '',
          lovableAiKey
        );

        if (aiError) {
          result.scrape_status = 'failed';
          result.error = aiError;
          
          // Keep as scraped so we can retry later
          console.error(`AI generation failed for ${lead.website}:`, aiError);
        } else if (content) {
          // Store SEO content in dedicated columns, keep original markdown in text_content
          await supabase
            .from("dentist_scrapes")
            .update({ 
              seo_title: content.seo_title || null,
              seo_description: content.seo_description || null,
              profile_content: content.profile_content || null,
              services: content.services || null,
              unique_features: content.unique_features || null,
              faq: content.faq || null,
              scrape_status: 'processed',
              processed_at: new Date().toISOString()
            })
            .eq("id", lead.id);
        }

        results.push(result);

        // Rate limiting delay between requests
        if (scrapedLeads.indexOf(lead) < scrapedLeads.length - 1) {
          await new Promise(resolve => setTimeout(resolve, AI_DELAY_MS));
        }
      }
    }

    // Check remaining counts for each stage
    const { count: pendingScrapeCount } = await supabase
      .from("dentist_scrapes")
      .select("*", { count: 'exact', head: true })
      .or("scrape_status.is.null,scrape_status.eq.pending")
      .is("text_content", null);

    const { count: pendingGenerateCount } = await supabase
      .from("dentist_scrapes")
      .select("*", { count: 'exact', head: true })
      .eq("scrape_status", "scraped")
      .not("text_content", "is", null);

    const totalRemaining = (pendingScrapeCount || 0) + (pendingGenerateCount || 0);
    const shouldContinue = totalRemaining > 0;

    console.log(`Processed ${results.length} leads. Pending scrape: ${pendingScrapeCount}, Pending generate: ${pendingGenerateCount}`);

    // AUTO-CONTINUATION: Self-invoke if there's more work to do
    if (shouldContinue && results.length > 0) {
      // Determine next stage: prioritize scraping, then generation
      const nextStage = (pendingScrapeCount || 0) > 0 ? 'scrape' : 'generate';
      
      console.log(`Auto-continuing with stage: ${nextStage}`);
      
      // Fire-and-forget: trigger next batch without waiting
      const functionUrl = `${supabaseUrl}/functions/v1/process-lead-queue`;
      fetch(functionUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseServiceKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ stage: nextStage, batch_size: BATCH_SIZE }),
      }).catch(err => console.error('Auto-continuation failed:', err));
    }

    return new Response(
      JSON.stringify({
        success: true,
        stage,
        processed: results.length,
        results,
        remaining: {
          scrape: pendingScrapeCount || 0,
          generate: pendingGenerateCount || 0,
          total: totalRemaining
        },
        should_continue: shouldContinue,
        auto_continued: shouldContinue && results.length > 0
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Processing error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

