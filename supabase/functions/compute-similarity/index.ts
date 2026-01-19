import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Max-Age': '86400',
};

// Simple text chunking (300-500 tokens approx)
function chunkText(text: string, targetSize = 400): string[] {
  const sentences = text.split(/(?<=[.!?])\s+/);
  const chunks: string[] = [];
  let currentChunk = '';
  
  for (const sentence of sentences) {
    const words = (currentChunk + ' ' + sentence).split(/\s+/).length;
    if (words > targetSize && currentChunk) {
      chunks.push(currentChunk.trim());
      currentChunk = sentence;
    } else {
      currentChunk = currentChunk ? currentChunk + ' ' + sentence : sentence;
    }
  }
  
  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim());
  }
  
  return chunks.length > 0 ? chunks : [text];
}

// Compute simple hash for source tracking
function computeHash(text: string): string {
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    const char = text.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16);
}

// Simple word-based similarity (Jaccard-like) as fallback
function computeWordSimilarity(text1: string, text2: string): number {
  const words1 = new Set(text1.toLowerCase().split(/\W+/).filter(w => w.length > 2));
  const words2 = new Set(text2.toLowerCase().split(/\W+/).filter(w => w.length > 2));
  
  const intersection = new Set([...words1].filter(w => words2.has(w)));
  const union = new Set([...words1, ...words2]);
  
  return union.size > 0 ? intersection.size / union.size : 0;
}

// N-gram based similarity for better accuracy
function computeNgramSimilarity(text1: string, text2: string, n = 3): number {
  const getNgrams = (text: string, n: number): Set<string> => {
    const ngrams = new Set<string>();
    const normalized = text.toLowerCase().replace(/\s+/g, ' ');
    for (let i = 0; i <= normalized.length - n; i++) {
      ngrams.add(normalized.substring(i, i + n));
    }
    return ngrams;
  };
  
  const ngrams1 = getNgrams(text1, n);
  const ngrams2 = getNgrams(text2, n);
  
  const intersection = new Set([...ngrams1].filter(ng => ngrams2.has(ng)));
  const union = new Set([...ngrams1, ...ngrams2]);
  
  return union.size > 0 ? intersection.size / union.size : 0;
}

// Combined similarity score
function computeSimilarity(text1: string, text2: string): number {
  const wordSim = computeWordSimilarity(text1, text2);
  const ngramSim = computeNgramSimilarity(text1, text2);
  
  // Weight n-gram higher as it catches phrase copying
  return wordSim * 0.3 + ngramSim * 0.7;
}

interface SimilarityResult {
  source_hash: string;
  max_similarity: number;
  worst_chunk_pair: {
    source_chunk: string;
    generated_chunk: string;
    similarity: number;
  } | null;
  status: 'passed' | 'flagged';
  rewrite_mode: string;
}

const SIMILARITY_THRESHOLD = 0.85;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    const { sourceContent, generatedContent, rewriteMode = 'patient_experience' } = await req.json();

    if (!sourceContent || !generatedContent) {
      return new Response(
        JSON.stringify({ success: false, error: 'Both sourceContent and generatedContent are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Computing similarity...');

    // Chunk both texts
    const sourceChunks = chunkText(sourceContent);
    const generatedChunks = chunkText(generatedContent);

    console.log(`Source chunks: ${sourceChunks.length}, Generated chunks: ${generatedChunks.length}`);

    // Compute similarity matrix and find max
    let maxSimilarity = 0;
    let worstPair: SimilarityResult['worst_chunk_pair'] = null;

    for (const sourceChunk of sourceChunks) {
      for (const generatedChunk of generatedChunks) {
        const similarity = computeSimilarity(sourceChunk, generatedChunk);
        
        if (similarity > maxSimilarity) {
          maxSimilarity = similarity;
          worstPair = {
            source_chunk: sourceChunk.substring(0, 200) + (sourceChunk.length > 200 ? '...' : ''),
            generated_chunk: generatedChunk.substring(0, 200) + (generatedChunk.length > 200 ? '...' : ''),
            similarity
          };
        }
      }
    }

    const result: SimilarityResult = {
      source_hash: computeHash(sourceContent),
      max_similarity: Math.round(maxSimilarity * 1000) / 1000,
      worst_chunk_pair: worstPair,
      status: maxSimilarity >= SIMILARITY_THRESHOLD ? 'flagged' : 'passed',
      rewrite_mode: rewriteMode
    };

    console.log(`Similarity check complete: ${result.status} (max: ${result.max_similarity})`);

    return new Response(
      JSON.stringify({ success: true, data: result }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error computing similarity:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to compute similarity';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
