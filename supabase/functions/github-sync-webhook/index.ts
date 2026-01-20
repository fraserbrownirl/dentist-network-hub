import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ScrapedDentist {
  input_id: string;
  link: string;
  title: string;
  category: string;
  address: string;
  open_hours: string;
  website: string;
  phone: string;
  review_count: string;
  review_rating: string;
  latitude: string;
  longitude: string;
  place_id: string;
  emails: string;
  complete_address: string;
}

function parseCSV(csvText: string): ScrapedDentist[] {
  const lines = csvText.trim().split('\n');
  if (lines.length < 2) return [];
  
  const headers = lines[0].split(',').map(h => h.trim());
  const results: ScrapedDentist[] = [];
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    // Handle CSV with quoted fields containing commas
    const values: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (const char of line) {
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current.trim());
    
    const row: Record<string, string> = {};
    headers.forEach((header, index) => {
      row[header] = values[index] || '';
    });
    
    results.push(row as unknown as ScrapedDentist);
  }
  
  return results;
}

function extractCity(address: string, inputId: string): string {
  // Try to extract city from the input query (format: "dentists City, Country")
  if (inputId) {
    // The input_id might contain the original query reference
    // For now, extract from address
  }
  
  // Parse from complete_address or address field
  // Typical format: "123 Main St, City, State ZIP, Country"
  const parts = address.split(',').map(p => p.trim());
  if (parts.length >= 2) {
    // Usually city is the second-to-last or third-to-last part
    return parts[parts.length - 3] || parts[parts.length - 2] || parts[0];
  }
  return address;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify authorization
    const authHeader = req.headers.get("Authorization");
    const webhookSecret = Deno.env.get("WEBHOOK_SECRET");
    
    if (webhookSecret && authHeader !== `Bearer ${webhookSecret}`) {
      console.error("Unauthorized request");
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get CSV content
    const contentType = req.headers.get("Content-Type") || "";
    let csvText: string;
    
    if (contentType.includes("text/csv")) {
      csvText = await req.text();
    } else if (contentType.includes("application/json")) {
      const body = await req.json();
      csvText = body.csv || body.data || "";
    } else {
      csvText = await req.text();
    }

    if (!csvText) {
      return new Response(
        JSON.stringify({ error: "No CSV data provided" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Received CSV with ${csvText.length} bytes`);

    // Parse CSV
    const dentists = parseCSV(csvText);
    console.log(`Parsed ${dentists.length} dentist records`);

    if (dentists.length === 0) {
      return new Response(
        JSON.stringify({ success: true, message: "No records to process", processed: 0 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get current batch number
    const { data: maxBatch } = await supabase
      .from("dentist_scrapes")
      .select("batch_number")
      .order("batch_number", { ascending: false })
      .limit(1)
      .single();
    
    const batchNumber = (maxBatch?.batch_number || 0) + 1;
    console.log(`Using batch number: ${batchNumber}`);

    // Insert records
    let inserted = 0;
    let errors = 0;

    for (const dentist of dentists) {
      try {
        // Skip if no website (required field)
        if (!dentist.website) {
          console.log(`Skipping record without website: ${dentist.title}`);
          continue;
        }

        const city = extractCity(dentist.complete_address || dentist.address || "", dentist.input_id);
        
        // Extract first email if multiple
        let email: string | null = null;
        if (dentist.emails) {
          try {
            const emailsArr = JSON.parse(dentist.emails);
            email = Array.isArray(emailsArr) && emailsArr.length > 0 ? emailsArr[0] : null;
          } catch {
            email = dentist.emails || null;
          }
        }

        // Parse numeric values
        const rating = dentist.review_rating ? parseFloat(dentist.review_rating) : null;
        const reviewCount = dentist.review_count ? parseInt(dentist.review_count, 10) : null;
        const latitude = dentist.latitude ? parseFloat(dentist.latitude) : null;
        const longitude = dentist.longitude ? parseFloat(dentist.longitude) : null;

        const { error } = await supabase
          .from("dentist_scrapes")
          .upsert({
            // Use place_id as primary conflict target if available, fallback to website
            place_id: dentist.place_id || null,
            website: dentist.website,
            business_name: dentist.title || null,
            city: city,
            email: email,
            phone: dentist.phone || null,
            latitude: latitude,
            longitude: longitude,
            rating: rating,
            review_count: reviewCount,
            category: dentist.category || null,
            open_hours: dentist.open_hours || null,
            google_maps_link: dentist.link || null,
            batch_number: batchNumber,
            scraped_at: new Date().toISOString(),
            has_email: !!email,
            has_content: false,
            scrape_status: 'pending',
          }, {
            onConflict: dentist.place_id ? "place_id" : "website",
            ignoreDuplicates: false
          });

        if (error) {
          console.error(`Error inserting ${dentist.title}:`, error);
          errors++;
        } else {
          inserted++;
        }
      } catch (err) {
        console.error(`Error processing record:`, err);
        errors++;
      }
    }

    console.log(`Sync complete: ${inserted} inserted, ${errors} errors`);

    // Trigger the processing queue to start processing new leads
    if (inserted > 0) {
      try {
        const processUrl = `${supabaseUrl}/functions/v1/process-lead-queue`;
        console.log(`Triggering processing queue at: ${processUrl}`);
        
        // Fire and forget - don't wait for processing to complete
        fetch(processUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${supabaseServiceKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ stage: 'scrape', batch_size: 5 }),
        }).catch(err => console.error('Failed to trigger processing:', err));
      } catch (triggerError) {
        console.error('Error triggering processing queue:', triggerError);
        // Don't fail the webhook response if trigger fails
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        batch_number: batchNumber,
        total_records: dentists.length,
        inserted: inserted,
        errors: errors,
        processing_triggered: inserted > 0
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
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
