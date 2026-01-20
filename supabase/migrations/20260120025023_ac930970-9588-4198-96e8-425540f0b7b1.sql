-- Create scrape_usage table to track Firecrawl API calls
CREATE TABLE public.scrape_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  url TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('success', 'error')),
  error_message TEXT,
  scraped_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for efficient date-based queries
CREATE INDEX idx_scrape_usage_date ON public.scrape_usage(scraped_at DESC);

-- Enable RLS but allow public inserts from edge functions
ALTER TABLE public.scrape_usage ENABLE ROW LEVEL SECURITY;

-- Policy to allow edge functions to insert (using service role)
CREATE POLICY "Allow service role insert" ON public.scrape_usage
  FOR INSERT WITH CHECK (true);

-- Policy to allow authenticated users to view usage
CREATE POLICY "Allow authenticated read" ON public.scrape_usage
  FOR SELECT USING (auth.role() = 'authenticated');