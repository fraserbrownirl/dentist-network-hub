import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Max-Age': '86400',
};

// Verify authenticated user from JWT
async function verifyAuth(req: Request): Promise<{ userId: string } | null> {
  const authHeader = req.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return null;
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');
  
  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: authHeader } }
  });

  const token = authHeader.replace('Bearer ', '');
  const { data, error } = await supabase.auth.getUser(token);
  
  if (error || !data?.user) {
    return null;
  }

  return { userId: data.user.id };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  // Verify authentication
  const auth = await verifyAuth(req);
  if (!auth) {
    return new Response(
      JSON.stringify({ success: false, error: 'Unauthorized' }),
      { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    const { 
      markdown, 
      businessName, 
      address, 
      rating, 
      reviewsCount
    } = await req.json();

    if (!markdown) {
      return new Response(
        JSON.stringify({ success: false, error: 'Markdown content is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const apiKey = Deno.env.get('LOVABLE_API_KEY');
    if (!apiKey) {
      console.error('LOVABLE_API_KEY not configured');
      return new Response(
        JSON.stringify({ success: false, error: 'AI gateway not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }


    const systemPrompt = `You are an expert SEO content writer specializing in local business profiles and LLM search optimization (Generative Engine Optimization). Your task is to create COMPLETELY ORIGINAL content optimized for both traditional search engines AND AI assistants like ChatGPT, Perplexity, and Google AI Overviews.

CRITICAL RULES:
1. DO NOT copy any sentences directly from the source
2. Rewrite everything in your own words while keeping facts accurate
3. Use natural, engaging language optimized for local SEO
4. Include location-specific context when available
5. Structure content with proper headers
6. Create an FAQ section based on services offered

LLM OPTIMIZATION REQUIREMENTS:

1. QUOTABLE FACTS: Generate 3-5 single-sentence statements that can be directly quoted by AI assistants. Each must include a specific statistic or verifiable fact. Format: "[Business] [verb] [specific claim]."
   Good: "209 NYC Dental maintains a 4.3-star rating from 150+ patient reviews."
   Bad: "This is a great dental practice." (too vague)

2. AUTHORITY SIGNALS WITH CONFIDENCE: Extract or infer credibility markers with explicit confidence scoring.
   Each signal must include:
   - type: One of [longevity, review_rating, review_velocity, verification_status, certification, membership, specialization]
   - statement: Human-readable assertion
   - value: Numeric value if applicable
   - unit: Unit of measurement if applicable (years, reviews, etc.)
   - source: One of [google_reviews, google_business, website_declared, inferred]
   - confidence: Score from 0.0 to 1.0 based on these heuristics:
     * Years active: min(1.0, review_count / 50) capped at 0.9-1.0
     * Review data from Google: 0.85-0.95
     * Website-declared certifications: 0.6-0.8 (unless externally verifiable)
     * Inferred from context: 0.3-0.5

3. SCHEMA.ORG DATA: Generate valid JSON-LD structured data for LocalBusiness + Dentist type with FAQPage.

Generate unique, compelling content that would rank well in search engines, be cited by AI assistants, and provide genuine value to readers.`;

    const userPrompt = `Create SEO and LLM-optimized content for a dental practice using this source material:

SOURCE MATERIAL:
${markdown}

${businessName ? `BUSINESS NAME: ${businessName}` : ''}
${address ? `ADDRESS: ${address}` : ''}
${rating ? `RATING: ${rating}${reviewsCount ? ` (${reviewsCount} reviews)` : ''}` : ''}

Generate the following:
1. SEO Title: Compelling title under 60 characters
2. Meta Description: Under 155 characters
3. Profile Content: 500-800 words of unique practice description with H2 headers. Naturally incorporate patient experience, clinical capabilities, and local context based on what's in the source material.
4. FAQ: 3-5 Q&A pairs about services offered
5. Quotable Facts: 3-5 citation-ready single-sentence facts with statistics
6. Authority Signals: Structured credibility markers with confidence scores
7. Schema JSON-LD: Valid LocalBusiness + Dentist + FAQPage structured data`;

    console.log('Calling Lovable AI for SEO content generation...');

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        tools: [{
          type: 'function',
          function: {
            name: 'generate_seo_content',
            description: 'Generate SEO and LLM-optimized content for a business profile',
            parameters: {
              type: 'object',
              properties: {
                seo_title: { 
                  type: 'string',
                  description: 'SEO title under 60 characters'
                },
                seo_description: { 
                  type: 'string',
                  description: 'Meta description under 155 characters'
                },
                profile_content: { 
                  type: 'string',
                  description: 'Full profile content in markdown format, 500-800 words'
                },
                faq: { 
                  type: 'array',
                  description: 'Array of FAQ objects with question and answer',
                  items: {
                    type: 'object',
                    properties: {
                      question: { type: 'string' },
                      answer: { type: 'string' }
                    },
                    required: ['question', 'answer']
                  }
                },
                quotable_facts: {
                  type: 'array',
                  description: 'Citation-ready single-sentence facts with statistics that LLMs can quote directly',
                  items: { type: 'string' }
                },
                authority_signals: {
                  type: 'array', 
                  description: 'Confidence-weighted credibility markers with explicit provenance',
                  items: {
                    type: 'object',
                    properties: {
                      type: { 
                        type: 'string',
                        enum: ['longevity', 'review_rating', 'review_velocity', 'verification_status', 'certification', 'membership', 'specialization']
                      },
                      statement: { type: 'string' },
                      value: { type: 'number' },
                      unit: { type: 'string' },
                      source: {
                        type: 'string',
                        enum: ['google_reviews', 'google_business', 'website_declared', 'inferred']
                      },
                      confidence: { 
                        type: 'number',
                        minimum: 0,
                        maximum: 1
                      }
                    },
                    required: ['type', 'statement', 'source', 'confidence']
                  }
                },
                schema_json_ld: {
                  type: 'object',
                  description: 'Schema.org LocalBusiness + Dentist + FAQPage structured data for search engines and LLMs'
                }
              },
              required: ['seo_title', 'seo_description', 'profile_content', 'faq', 'quotable_facts', 'authority_signals', 'schema_json_ld']
            }
          }
        }],
        tool_choice: { type: 'function', function: { name: 'generate_seo_content' } }
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ success: false, error: 'Rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ success: false, error: 'Payment required. Please add credits to your workspace.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      return new Response(
        JSON.stringify({ success: false, error: 'AI gateway error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const aiResponse = await response.json();
    console.log('AI response received');

    // Extract the tool call arguments
    const toolCall = aiResponse.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall || !toolCall.function?.arguments) {
      console.error('No tool call in response:', aiResponse);
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to parse AI response' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const seoContent = JSON.parse(toolCall.function.arguments);

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: seoContent
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error generating SEO content:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to generate content';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
