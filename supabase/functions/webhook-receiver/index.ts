import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body = await req.json();
    console.log("Webhook received:", JSON.stringify(body, null, 2));

    const { job_id, keyword, country, city, company_segment, workflow_type, leads } = body;

    // If this is incoming leads data from n8n callback
    if (leads && Array.isArray(leads) && job_id) {
      console.log(`Processing ${leads.length} leads for job ${job_id}`);

      // Insert leads into database
      for (const lead of leads) {
        const { data: insertedLead, error: leadError } = await supabase
          .from("business_leads")
          .insert({
            job_id,
            place_id: lead.place_id || crypto.randomUUID(),
            name: lead.name,
            category: lead.category,
            address: lead.address,
            phone_number: lead.phone_number || lead.phone,
            website: lead.website,
            google_url: lead.google_url,
            description: lead.description,
            rating: lead.rating,
            reviews_count: lead.reviews_count,
            top_reviews: lead.top_reviews,
            services_provided: lead.services_provided,
          })
          .select()
          .single();

        if (leadError) {
          console.error("Error inserting lead:", leadError);
        } else if (lead.ai_content && insertedLead) {
          // Insert AI generated content if provided
          await supabase.from("ai_generated_content").insert({
            lead_id: insertedLead.id,
            opening_message: lead.ai_content.opening_message,
            talking_points: lead.ai_content.talking_points,
            page_summary: lead.ai_content.page_summary,
          });
        }
      }

      // Update job status
      await supabase
        .from("lead_extraction_jobs")
        .update({
          status: "completed",
          total_leads: leads.length,
          processed_leads: leads.length,
        })
        .eq("id", job_id);

      return new Response(
        JSON.stringify({ success: true, processed: leads.length }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // If this is a new job trigger request
    if (job_id) {
      // Update job to running status
      await supabase
        .from("lead_extraction_jobs")
        .update({ status: "running" })
        .eq("id", job_id);

      // Here you would forward to your n8n webhook
      // For now, we'll just log and return success
      const n8nWebhookUrl = Deno.env.get("N8N_WEBHOOK_URL");
      
      if (n8nWebhookUrl) {
        try {
          const n8nResponse = await fetch(n8nWebhookUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              job_id,
              keyword,
              country,
              city,
              company_segment,
              workflow_type,
              callback_url: `${supabaseUrl}/functions/v1/webhook-receiver`,
            }),
          });
          
          console.log("n8n response status:", n8nResponse.status);
        } catch (n8nError) {
          console.error("Error calling n8n:", n8nError);
          // Don't fail the request, just log the error
        }
      } else {
        console.log("N8N_WEBHOOK_URL not configured, skipping n8n trigger");
      }

      return new Response(
        JSON.stringify({ success: true, job_id, message: "Job triggered" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Invalid request body" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Webhook error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
