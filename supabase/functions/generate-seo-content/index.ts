const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Max-Age': '86400',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    const { markdown, businessName, address, rating, reviewsCount } = await req.json();

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

    const systemPrompt = `You are an expert SEO content writer specializing in local business profiles. Your task is to create COMPLETELY ORIGINAL content based on the source material provided. 

CRITICAL RULES:
1. DO NOT copy any sentences directly from the source
2. Rewrite everything in your own words while keeping facts accurate
3. Use natural, engaging language optimized for local SEO
4. Include location-specific context when available
5. Structure content with proper headers
6. Create an FAQ section based on services offered

Generate unique, compelling content that would rank well in search engines while providing genuine value to readers.`;

    const userPrompt = `Create SEO-optimized content for a dental practice using this source material:

SOURCE MATERIAL:
${markdown}

${businessName ? `BUSINESS NAME: ${businessName}` : ''}
${address ? `ADDRESS: ${address}` : ''}
${rating ? `RATING: ${rating}${reviewsCount ? ` (${reviewsCount} reviews)` : ''}` : ''}

Generate the following:
1. SEO Title: Compelling title under 60 characters
2. Meta Description: Under 155 characters
3. Profile Content: 500-800 words of unique practice description with H2 headers
4. FAQ: 3-5 Q&A pairs about services offered`;

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
            description: 'Generate SEO-optimized content for a business profile',
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
                }
              },
              required: ['seo_title', 'seo_description', 'profile_content', 'faq']
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
      JSON.stringify({ success: true, data: seoContent }),
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
