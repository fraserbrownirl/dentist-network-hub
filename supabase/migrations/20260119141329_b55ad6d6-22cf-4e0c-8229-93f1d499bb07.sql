-- 1. Create app_role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'dentist', 'user');

-- 2. Create user_roles table
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    role app_role NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 3. Create has_role function
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = 'public' AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

-- 4. Create cities table
CREATE TABLE public.cities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    state TEXT,
    meta_title TEXT,
    meta_description TEXT,
    json_data JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.cities ENABLE ROW LEVEL SECURITY;

-- 5. Create dentists table
CREATE TABLE public.dentists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    practice_name TEXT NOT NULL,
    contact_name TEXT,
    email TEXT,
    phone TEXT,
    address TEXT,
    city_id UUID REFERENCES public.cities(id),
    is_approved BOOLEAN DEFAULT false,
    profile_data JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.dentists ENABLE ROW LEVEL SECURITY;

-- 6. Create lead_extraction_jobs table
CREATE TABLE public.lead_extraction_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dentist_id UUID NOT NULL REFERENCES public.dentists(id),
    keyword TEXT NOT NULL,
    country TEXT NOT NULL,
    company_segment TEXT NOT NULL,
    location_url TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    total_leads INTEGER DEFAULT 0,
    processed_leads INTEGER DEFAULT 0,
    bright_data_snapshot_id TEXT,
    error_message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.lead_extraction_jobs ENABLE ROW LEVEL SECURITY;

-- 7. Create business_leads table
CREATE TABLE public.business_leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID NOT NULL REFERENCES public.lead_extraction_jobs(id),
    place_id TEXT NOT NULL,
    name TEXT,
    category TEXT,
    address TEXT,
    phone_number TEXT,
    website TEXT,
    google_url TEXT,
    description TEXT,
    rating NUMERIC,
    reviews_count INTEGER,
    top_reviews JSONB,
    services_provided TEXT[],
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.business_leads ENABLE ROW LEVEL SECURITY;

-- 8. Create ai_generated_content table
CREATE TABLE public.ai_generated_content (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID NOT NULL REFERENCES public.business_leads(id),
    opening_message TEXT,
    talking_points TEXT[],
    page_summary TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.ai_generated_content ENABLE ROW LEVEL SECURITY;

-- 9. Create offers table
CREATE TABLE public.offers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dentist_id UUID NOT NULL REFERENCES public.dentists(id),
    city_id UUID NOT NULL REFERENCES public.cities(id),
    title TEXT NOT NULL,
    description TEXT,
    price NUMERIC NOT NULL,
    original_price NUMERIC,
    duration_weeks INTEGER NOT NULL,
    terms_conditions TEXT,
    is_active BOOLEAN DEFAULT true,
    max_subscribers INTEGER,
    current_subscribers INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.offers ENABLE ROW LEVEL SECURITY;

-- 10. Create subscribers table
CREATE TABLE public.subscribers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL,
    city_id UUID REFERENCES public.cities(id),
    offer_id UUID REFERENCES public.offers(id),
    is_active BOOLEAN DEFAULT true,
    subscribed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;

-- 11. Create outreach_campaigns table
CREATE TABLE public.outreach_campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dentist_id UUID NOT NULL REFERENCES public.dentists(id),
    job_id UUID NOT NULL REFERENCES public.lead_extraction_jobs(id),
    name TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'draft',
    total_contacts INTEGER DEFAULT 0,
    contacted INTEGER DEFAULT 0,
    responded INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.outreach_campaigns ENABLE ROW LEVEL SECURITY;

-- 12. Create dentist_scrapes table
CREATE TABLE public.dentist_scrapes (
    id SERIAL PRIMARY KEY,
    website TEXT NOT NULL,
    city TEXT NOT NULL,
    city_id INTEGER,
    batch_number INTEGER,
    email TEXT,
    has_email BOOLEAN DEFAULT false,
    text_content TEXT,
    has_content BOOLEAN DEFAULT false,
    scraped_at TIMESTAMP DEFAULT now(),
    created_at TIMESTAMP DEFAULT now()
);
ALTER TABLE public.dentist_scrapes ENABLE ROW LEVEL SECURITY;

-- 13. Create update_updated_at function and triggers
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public' AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- 14. Create handle_new_user function (for auth trigger)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public' AS $$
BEGIN
  IF NEW.raw_user_meta_data ->> 'practice_name' IS NOT NULL THEN
    INSERT INTO public.dentists (user_id, practice_name, contact_name, email)
    VALUES (NEW.id, NEW.raw_user_meta_data ->> 'practice_name', NEW.raw_user_meta_data ->> 'contact_name', NEW.email);
  END IF;
  RETURN NEW;
END; $$;