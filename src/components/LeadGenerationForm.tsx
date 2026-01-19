import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";

interface LeadGenerationFormProps {
  dentistId: string;
  onJobCreated: () => void;
}

export const LeadGenerationForm = ({ dentistId, onJobCreated }: LeadGenerationFormProps) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    keyword: "",
    country: "",
    city: ""
  });

  // Extract city from Google Maps URL
  const extractCityFromURL = (url: string): string => {
    try {
      // Pattern 1: /place/Location+Name/
      const placeMatch = url.match(/\/place\/([^/@]+)/);
      if (placeMatch) {
        const placeName = decodeURIComponent(placeMatch[1].replace(/\+/g, ' '));
        return placeName.split(',')[0].trim();
      }
      
      // Pattern 2: ?q=keyword,City,State
      const queryMatch = url.match(/[?&]q=([^&]+)/);
      if (queryMatch) {
        const query = decodeURIComponent(queryMatch[1].replace(/\+/g, ' '));
        const parts = query.split(',');
        if (parts.length >= 2) {
          return parts[1].trim();
        }
      }
      
      // Pattern 3: /search/keyword+in+City/
      const searchMatch = url.match(/\/search\/[^\/]*\+in\+([^\/\+]+)/);
      if (searchMatch) {
        return decodeURIComponent(searchMatch[1].replace(/\+/g, ' '));
      }
      
      return "Unknown City";
    } catch (error) {
      console.error('Error extracting city:', error);
      return "Unknown City";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Create job record in database
      const { data: job, error } = await supabase
        .from("lead_extraction_jobs")
        .insert({
          dentist_id: dentistId,
          keyword: formData.keyword,
          country: formData.country,
          location_url: `${formData.city}, ${formData.country}`,
          company_segment: "N/A"
        })
        .select()
        .single();

      if (error) throw error;

      // Submit to webhook via Supabase edge function
      const { error: webhookError } = await supabase.functions.invoke('webhook-receiver', {
        body: {
          job_id: job.id,
          keyword: formData.keyword,
          country: formData.country,
          city: formData.city
        },
      });

      if (webhookError) {
        console.warn('Webhook trigger failed:', webhookError);
        // Job was created, just webhook failed - still show success
      }

      toast({
        title: "Success",
        description: "Lead extraction job started successfully",
      });

      // Reset form
      setFormData({
        keyword: "",
        country: "",
        city: ""
      });

      onJobCreated();
    } catch (error) {
      console.error("Error starting lead extraction:", error);
      toast({
        title: "Error",
        description: "Failed to start lead extraction job",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Google Maps Lead Extraction</CardTitle>
        <CardDescription>
          Extract business leads from Google Maps with AI-generated outreach content
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="keyword">Keyword Search</Label>
            <Input
              id="keyword"
              value={formData.keyword}
              onChange={(e) => setFormData(prev => ({ ...prev, keyword: e.target.value }))}
              placeholder="restaurants, dentists, coffee shops"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="country">Country</Label>
            <Input
              id="country"
              value={formData.country}
              onChange={(e) => setFormData(prev => ({ ...prev, country: e.target.value }))}
              placeholder="USA, UK, Canada"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="city">City</Label>
            <Input
              id="city"
              value={formData.city}
              onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
              placeholder="New York, London, Toronto"
              required
            />
          </div>

          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? "Starting Extraction..." : "Start Lead Extraction"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};