-- Processing status columns (CRITICAL - needed for queue to work)
ALTER TABLE dentist_scrapes ADD COLUMN IF NOT EXISTS scrape_status TEXT DEFAULT 'pending';
ALTER TABLE dentist_scrapes ADD COLUMN IF NOT EXISTS processing_error TEXT;
ALTER TABLE dentist_scrapes ADD COLUMN IF NOT EXISTS retry_count INTEGER DEFAULT 0;

-- SEO content storage columns (needed for generate stage)
ALTER TABLE dentist_scrapes ADD COLUMN IF NOT EXISTS seo_title TEXT;
ALTER TABLE dentist_scrapes ADD COLUMN IF NOT EXISTS seo_description TEXT;
ALTER TABLE dentist_scrapes ADD COLUMN IF NOT EXISTS profile_content TEXT;
ALTER TABLE dentist_scrapes ADD COLUMN IF NOT EXISTS faq JSONB;
ALTER TABLE dentist_scrapes ADD COLUMN IF NOT EXISTS services JSONB;
ALTER TABLE dentist_scrapes ADD COLUMN IF NOT EXISTS unique_features JSONB;
ALTER TABLE dentist_scrapes ADD COLUMN IF NOT EXISTS processed_at TIMESTAMPTZ;

-- Google Maps enrichment columns (from scraper CSV)
ALTER TABLE dentist_scrapes ADD COLUMN IF NOT EXISTS business_name TEXT;
ALTER TABLE dentist_scrapes ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE dentist_scrapes ADD COLUMN IF NOT EXISTS place_id TEXT UNIQUE;
ALTER TABLE dentist_scrapes ADD COLUMN IF NOT EXISTS latitude NUMERIC;
ALTER TABLE dentist_scrapes ADD COLUMN IF NOT EXISTS longitude NUMERIC;
ALTER TABLE dentist_scrapes ADD COLUMN IF NOT EXISTS rating NUMERIC;
ALTER TABLE dentist_scrapes ADD COLUMN IF NOT EXISTS review_count INTEGER;
ALTER TABLE dentist_scrapes ADD COLUMN IF NOT EXISTS category TEXT;
ALTER TABLE dentist_scrapes ADD COLUMN IF NOT EXISTS open_hours TEXT;
ALTER TABLE dentist_scrapes ADD COLUMN IF NOT EXISTS google_maps_link TEXT;

-- Index for efficient queue processing
CREATE INDEX IF NOT EXISTS idx_dentist_scrapes_status ON dentist_scrapes(scrape_status);
CREATE INDEX IF NOT EXISTS idx_dentist_scrapes_place_id ON dentist_scrapes(place_id);