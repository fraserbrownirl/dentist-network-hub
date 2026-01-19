-- RLS Policies for all tables

-- user_roles policies (only admins can manage roles, users can read their own)
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles"
ON public.user_roles
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- cities policies (public read, admin write)
CREATE POLICY "Anyone can view cities"
ON public.cities
FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Admins can manage cities"
ON public.cities
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- dentists policies
CREATE POLICY "Dentists can view their own profile"
ON public.dentists
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Dentists can update their own profile"
ON public.dentists
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Dentists can insert their own profile"
ON public.dentists
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all dentists"
ON public.dentists
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- lead_extraction_jobs policies
CREATE POLICY "Dentists can view their own jobs"
ON public.lead_extraction_jobs
FOR SELECT
TO authenticated
USING (
  dentist_id IN (SELECT id FROM public.dentists WHERE user_id = auth.uid())
  OR public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Dentists can create jobs"
ON public.lead_extraction_jobs
FOR INSERT
TO authenticated
WITH CHECK (
  dentist_id IN (SELECT id FROM public.dentists WHERE user_id = auth.uid())
  OR public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Admins can manage all jobs"
ON public.lead_extraction_jobs
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- business_leads policies
CREATE POLICY "Dentists can view leads from their jobs"
ON public.business_leads
FOR SELECT
TO authenticated
USING (
  job_id IN (
    SELECT id FROM public.lead_extraction_jobs 
    WHERE dentist_id IN (SELECT id FROM public.dentists WHERE user_id = auth.uid())
  )
  OR public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Admins can manage all leads"
ON public.business_leads
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- ai_generated_content policies
CREATE POLICY "Dentists can view AI content for their leads"
ON public.ai_generated_content
FOR SELECT
TO authenticated
USING (
  lead_id IN (
    SELECT bl.id FROM public.business_leads bl
    JOIN public.lead_extraction_jobs lej ON bl.job_id = lej.id
    WHERE lej.dentist_id IN (SELECT id FROM public.dentists WHERE user_id = auth.uid())
  )
  OR public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Admins can manage all AI content"
ON public.ai_generated_content
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- offers policies
CREATE POLICY "Anyone can view active offers"
ON public.offers
FOR SELECT
TO anon, authenticated
USING (is_active = true);

CREATE POLICY "Dentists can manage their own offers"
ON public.offers
FOR ALL
TO authenticated
USING (
  dentist_id IN (SELECT id FROM public.dentists WHERE user_id = auth.uid())
);

CREATE POLICY "Admins can manage all offers"
ON public.offers
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- subscribers policies
CREATE POLICY "Anyone can subscribe"
ON public.subscribers
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Dentists can view subscribers of their offers"
ON public.subscribers
FOR SELECT
TO authenticated
USING (
  offer_id IN (
    SELECT id FROM public.offers 
    WHERE dentist_id IN (SELECT id FROM public.dentists WHERE user_id = auth.uid())
  )
  OR public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Admins can manage all subscribers"
ON public.subscribers
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- outreach_campaigns policies
CREATE POLICY "Dentists can view their own campaigns"
ON public.outreach_campaigns
FOR SELECT
TO authenticated
USING (
  dentist_id IN (SELECT id FROM public.dentists WHERE user_id = auth.uid())
  OR public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Dentists can create campaigns"
ON public.outreach_campaigns
FOR INSERT
TO authenticated
WITH CHECK (
  dentist_id IN (SELECT id FROM public.dentists WHERE user_id = auth.uid())
);

CREATE POLICY "Dentists can update their own campaigns"
ON public.outreach_campaigns
FOR UPDATE
TO authenticated
USING (
  dentist_id IN (SELECT id FROM public.dentists WHERE user_id = auth.uid())
);

CREATE POLICY "Admins can manage all campaigns"
ON public.outreach_campaigns
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- dentist_scrapes policies (admin only)
CREATE POLICY "Admins can manage dentist scrapes"
ON public.dentist_scrapes
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));