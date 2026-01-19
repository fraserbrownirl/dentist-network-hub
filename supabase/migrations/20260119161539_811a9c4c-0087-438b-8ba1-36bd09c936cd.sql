-- GEO System Tables for LLM-Optimized Content Generation

-- 1. Authority Signals: Confidence-weighted credibility assertions
CREATE TABLE public.authority_signals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES public.business_leads(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  statement TEXT NOT NULL,
  value NUMERIC,
  unit TEXT,
  source TEXT NOT NULL,
  confidence NUMERIC NOT NULL CHECK (confidence >= 0 AND confidence <= 1),
  computed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(lead_id, type, source)
);

CREATE INDEX idx_authority_signals_lead ON public.authority_signals(lead_id);
CREATE INDEX idx_authority_signals_confidence ON public.authority_signals(confidence DESC);

-- Enable RLS
ALTER TABLE public.authority_signals ENABLE ROW LEVEL SECURITY;

-- RLS Policies for authority_signals
CREATE POLICY "Admins can manage all authority signals"
ON public.authority_signals FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Dentists can view authority signals for their leads"
ON public.authority_signals FOR SELECT
USING (
  lead_id IN (
    SELECT bl.id FROM public.business_leads bl
    JOIN public.lead_extraction_jobs lej ON bl.job_id = lej.id
    WHERE lej.dentist_id IN (
      SELECT id FROM public.dentists WHERE user_id = auth.uid()
    )
  )
  OR has_role(auth.uid(), 'admin'::app_role)
);

-- 2. Comparative Positioning: Bounded percentile claims with population context
CREATE TABLE public.comparative_positioning (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES public.business_leads(id) ON DELETE CASCADE,
  scope TEXT NOT NULL,
  metric TEXT NOT NULL,
  percentile INTEGER CHECK (percentile >= 0 AND percentile <= 100),
  peer_count INTEGER NOT NULL,
  statement TEXT NOT NULL,
  threshold_met BOOLEAN NOT NULL DEFAULT false,
  computed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(lead_id, scope, metric)
);

CREATE INDEX idx_comparative_lead ON public.comparative_positioning(lead_id);
CREATE INDEX idx_comparative_scope ON public.comparative_positioning(scope);

-- Enable RLS
ALTER TABLE public.comparative_positioning ENABLE ROW LEVEL SECURITY;

-- RLS Policies for comparative_positioning
CREATE POLICY "Admins can manage all comparative positioning"
ON public.comparative_positioning FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Dentists can view comparative positioning for their leads"
ON public.comparative_positioning FOR SELECT
USING (
  lead_id IN (
    SELECT bl.id FROM public.business_leads bl
    JOIN public.lead_extraction_jobs lej ON bl.job_id = lej.id
    WHERE lej.dentist_id IN (
      SELECT id FROM public.dentists WHERE user_id = auth.uid()
    )
  )
  OR has_role(auth.uid(), 'admin'::app_role)
);

-- 3. Content Integrity: Similarity scores and rewrite provenance
CREATE TABLE public.content_integrity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES public.business_leads(id) ON DELETE CASCADE,
  source_hash TEXT NOT NULL,
  max_similarity NUMERIC NOT NULL CHECK (max_similarity >= 0 AND max_similarity <= 1),
  worst_chunk_pair JSONB,
  status TEXT NOT NULL DEFAULT 'pending',
  rewrite_mode TEXT NOT NULL,
  checked_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  generation_id UUID
);

CREATE INDEX idx_integrity_lead ON public.content_integrity(lead_id);
CREATE INDEX idx_integrity_status ON public.content_integrity(status);

-- Enable RLS
ALTER TABLE public.content_integrity ENABLE ROW LEVEL SECURITY;

-- RLS Policies for content_integrity
CREATE POLICY "Admins can manage all content integrity"
ON public.content_integrity FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Dentists can view content integrity for their leads"
ON public.content_integrity FOR SELECT
USING (
  lead_id IN (
    SELECT bl.id FROM public.business_leads bl
    JOIN public.lead_extraction_jobs lej ON bl.job_id = lej.id
    WHERE lej.dentist_id IN (
      SELECT id FROM public.dentists WHERE user_id = auth.uid()
    )
  )
  OR has_role(auth.uid(), 'admin'::app_role)
);

-- 4. Generated Content: Presentation-layer prose only
CREATE TABLE public.generated_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES public.business_leads(id) ON DELETE CASCADE,
  seo_title TEXT NOT NULL,
  seo_description TEXT NOT NULL,
  profile_content TEXT NOT NULL,
  faq JSONB NOT NULL,
  quotable_facts JSONB NOT NULL,
  schema_json_ld JSONB NOT NULL,
  rewrite_mode TEXT NOT NULL,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  is_active BOOLEAN NOT NULL DEFAULT true
);

CREATE INDEX idx_generated_lead ON public.generated_content(lead_id);
CREATE INDEX idx_generated_active ON public.generated_content(is_active) WHERE is_active = true;

-- Enable RLS
ALTER TABLE public.generated_content ENABLE ROW LEVEL SECURITY;

-- RLS Policies for generated_content
CREATE POLICY "Admins can manage all generated content"
ON public.generated_content FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Dentists can view generated content for their leads"
ON public.generated_content FOR SELECT
USING (
  lead_id IN (
    SELECT bl.id FROM public.business_leads bl
    JOIN public.lead_extraction_jobs lej ON bl.job_id = lej.id
    WHERE lej.dentist_id IN (
      SELECT id FROM public.dentists WHERE user_id = auth.uid()
    )
  )
  OR has_role(auth.uid(), 'admin'::app_role)
);