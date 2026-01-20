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

// Sanitize city name to prevent SQL pattern injection
function sanitizeCityName(input: string): string | null {
  // Only allow letters, spaces, hyphens, and apostrophes (common in city names)
  const sanitized = input.trim();
  if (!/^[a-zA-Z\s\-']+$/.test(sanitized)) {
    return null;
  }
  if (sanitized.length > 100) {
    return null;
  }
  // Escape SQL LIKE wildcards
  return sanitized.replace(/[%_]/g, '\\$&');
}

// Minimum peer thresholds for valid percentile claims
const PEER_THRESHOLDS: Record<string, number> = {
  city: 50,
  neighborhood: 25,
  service_cluster: 30
};

interface ComparativeResult {
  scope: string;
  metric: string;
  percentile?: number;
  peer_count: number;
  statement: string;
  threshold_met: boolean;
}

// Calculate percentile position
function calculatePercentile(value: number, allValues: number[]): number {
  const sorted = [...allValues].sort((a, b) => a - b);
  const position = sorted.filter(v => v < value).length;
  return Math.round((position / sorted.length) * 100);
}

// Generate fallback statement when threshold not met
function generateFallbackStatement(
  metric: string,
  value: number,
  unit: string,
  scope: string,
  peerCount: number
): string {
  switch (metric) {
    case 'rating':
      return `Maintains a ${value.toFixed(1)}-star rating, reflecting consistent patient satisfaction.`;
    case 'reviews':
      return `Has received ${value} patient reviews, demonstrating established community presence.`;
    case 'years_active':
      return `Has been serving the community for ${value} ${unit}.`;
    default:
      return `Demonstrates strong performance in ${metric}.`;
  }
}

// Generate percentile statement when threshold is met
function generatePercentileStatement(
  metric: string,
  percentile: number,
  scope: string,
  peerCount: number
): string {
  const scopeLabel = scope === 'city' ? 'city-wide' : scope === 'neighborhood' ? 'neighborhood' : 'category';
  const percentileLabel = percentile >= 90 ? 'top 10%' : percentile >= 75 ? 'top 25%' : percentile >= 50 ? 'above average' : 'competitive';
  
  switch (metric) {
    case 'rating':
      return `Ranks in the ${percentileLabel} for patient ratings ${scopeLabel} (compared to ${peerCount} practices).`;
    case 'reviews':
      return `Has ${percentileLabel} review volume ${scopeLabel} (among ${peerCount} practices).`;
    case 'years_active':
      return `Among the most established practices ${scopeLabel} (${percentileLabel} for longevity).`;
    default:
      return `Performs in the ${percentileLabel} for ${metric} ${scopeLabel}.`;
  }
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
      leadId,
      businessData,
      scope = 'city',
      metrics = ['rating', 'reviews']
    } = await req.json();

    if (!businessData) {
      return new Response(
        JSON.stringify({ success: false, error: 'Business data is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate scope parameter
    const validScopes = ['city', 'neighborhood', 'service_cluster'];
    if (!validScopes.includes(scope)) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid scope parameter' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate metrics parameter
    const validMetrics = ['rating', 'reviews', 'years_active'];
    if (!Array.isArray(metrics) || !metrics.every(m => validMetrics.includes(m))) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid metrics parameter' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log(`Computing comparative positioning for scope: ${scope}`);

    const results: ComparativeResult[] = [];
    const threshold = PEER_THRESHOLDS[scope] || 25;

    // Query peer businesses for comparison
    let query = supabase
      .from('business_leads')
      .select('rating, reviews_count, created_at');

    // Add scope-based filtering with sanitized input
    if (scope === 'city' && businessData.address && typeof businessData.address === 'string') {
      // Extract city from address for filtering
      const cityMatch = businessData.address.match(/,\s*([^,]+),?\s*[A-Z]{2}/);
      if (cityMatch) {
        const sanitizedCity = sanitizeCityName(cityMatch[1]);
        if (sanitizedCity) {
          query = query.ilike('address', `%${sanitizedCity}%`);
        }
        // If sanitization fails, skip the filter (query all peers)
      }
    }

    const { data: peers, error } = await query;

    if (error) {
      console.error('Error fetching peers:', error);
      // Continue with fallback statements
    }

    const peerCount = peers?.length || 0;
    const thresholdMet = peerCount >= threshold;

    console.log(`Found ${peerCount} peers (threshold: ${threshold}, met: ${thresholdMet})`);

    // Process each metric
    for (const metric of metrics) {
      let result: ComparativeResult;

      if (metric === 'rating' && businessData.rating) {
        const ratings = peers?.map(p => p.rating).filter(r => r != null) as number[] || [];
        
        if (thresholdMet && ratings.length >= threshold) {
          const percentile = calculatePercentile(businessData.rating, ratings);
          result = {
            scope,
            metric,
            percentile,
            peer_count: ratings.length,
            statement: generatePercentileStatement(metric, percentile, scope, ratings.length),
            threshold_met: true
          };
        } else {
          result = {
            scope,
            metric,
            peer_count: ratings.length,
            statement: generateFallbackStatement(metric, businessData.rating, 'stars', scope, ratings.length),
            threshold_met: false
          };
        }
        results.push(result);
      }

      if (metric === 'reviews' && businessData.reviewsCount) {
        const reviewCounts = peers?.map(p => p.reviews_count).filter(r => r != null) as number[] || [];
        
        if (thresholdMet && reviewCounts.length >= threshold) {
          const percentile = calculatePercentile(businessData.reviewsCount, reviewCounts);
          result = {
            scope,
            metric,
            percentile,
            peer_count: reviewCounts.length,
            statement: generatePercentileStatement(metric, percentile, scope, reviewCounts.length),
            threshold_met: true
          };
        } else {
          result = {
            scope,
            metric,
            peer_count: reviewCounts.length,
            statement: generateFallbackStatement(metric, businessData.reviewsCount, 'reviews', scope, reviewCounts.length),
            threshold_met: false
          };
        }
        results.push(result);
      }
    }

    console.log(`Generated ${results.length} comparative positions`);

    return new Response(
      JSON.stringify({ success: true, data: results }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error computing comparative positioning:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to compute positioning';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
