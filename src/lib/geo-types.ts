// GEO System Types for LLM-Optimized Content Generation

export type AuthoritySignalType = 
  | 'longevity' 
  | 'review_rating' 
  | 'review_velocity' 
  | 'verification_status' 
  | 'certification' 
  | 'membership' 
  | 'specialization';

export type AuthoritySignalSource = 
  | 'google_reviews' 
  | 'google_business' 
  | 'website_declared' 
  | 'inferred';

export type ComparativeScope = 
  | 'city' 
  | 'neighborhood' 
  | 'service_cluster';

export type ContentIntegrityStatus = 
  | 'pending' 
  | 'passed' 
  | 'flagged' 
  | 'regenerated';

export type RewriteMode = 
  | 'community_outcomes' 
  | 'patient_experience' 
  | 'clinical_scope' 
  | 'local_context';

export interface AuthoritySignal {
  type: AuthoritySignalType;
  statement: string;
  value?: number;
  unit?: string;
  source: AuthoritySignalSource;
  confidence: number;
}

export interface ComparativePosition {
  scope: ComparativeScope;
  metric: string;
  percentile?: number;
  peer_count: number;
  statement: string;
  threshold_met: boolean;
}

export interface WorstChunkPair {
  source_chunk: string;
  generated_chunk: string;
  similarity: number;
}

export interface ContentIntegrity {
  source_hash: string;
  max_similarity: number;
  worst_chunk_pair?: WorstChunkPair;
  status: ContentIntegrityStatus;
  rewrite_mode: RewriteMode;
}

export interface FAQ {
  question: string;
  answer: string;
}

export interface SEOContent {
  seo_title: string;
  seo_description: string;
  profile_content: string;
  faq: FAQ[];
  quotable_facts: string[];
  authority_signals: AuthoritySignal[];
  schema_json_ld: object;
}

export interface GEOGenerationResult {
  seo_content: SEOContent;
  authority_signals: AuthoritySignal[];
  content_integrity?: ContentIntegrity;
  comparative_positioning?: ComparativePosition[];
  rewrite_mode: RewriteMode;
}

// Confidence heuristics
export const CONFIDENCE_HEURISTICS = {
  longevity: {
    description: 'min(1.0, review_count / 50) capped at 0.9-1.0',
    calculate: (reviewCount: number) => Math.min(1.0, reviewCount / 50) * 0.9 + 0.1
  },
  review_response: {
    description: '% of reviews replied to, capped at ~0.7',
    calculate: (responseRate: number) => Math.min(0.7, responseRate)
  },
  verification_status: {
    description: 'Binary → 1.0 if verified',
    calculate: (isVerified: boolean) => isVerified ? 1.0 : 0.3
  },
  website_declared: {
    description: 'Only if explicitly stated → 0.6-0.8',
    calculate: (isExplicit: boolean) => isExplicit ? 0.8 : 0.6
  }
};

// Minimum peer thresholds for comparative claims
export const PEER_THRESHOLDS: Record<ComparativeScope, number> = {
  city: 50,
  neighborhood: 25,
  service_cluster: 30
};

// Similarity threshold for content integrity
export const SIMILARITY_THRESHOLD = 0.85;

// Rewrite mode descriptions
export const REWRITE_MODE_DESCRIPTIONS: Record<RewriteMode, string> = {
  community_outcomes: 'Focus on patient success stories and community impact',
  patient_experience: 'Emphasize comfort, communication, and convenience',
  clinical_scope: 'Highlight technical capabilities, equipment, and procedures',
  local_context: 'Neighborhood integration, accessibility, and local partnerships'
};
