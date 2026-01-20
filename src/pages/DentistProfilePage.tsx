import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { 
  MapPin, Star, Phone, Globe, ArrowLeft, 
  CheckCircle, Quote, Shield, Award
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface DentistData {
  id: number;
  place_id: string;
  business_name: string;
  city: string;
  phone: string;
  website: string;
  rating: number;
  review_count: number;
  seo_title: string;
  seo_description: string;
  profile_content: string;
  faq: Array<{ question: string; answer: string }>;
  services: string[];
  unique_features: string[];
}

const DentistProfilePage = () => {
  const { placeId } = useParams<{ placeId: string }>();
  const navigate = useNavigate();
  const [dentist, setDentist] = useState<DentistData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDentist = async () => {
      if (!placeId) return;

      try {
        const { data, error } = await supabase
          .from("dentist_scrapes")
          .select("*")
          .eq("place_id", placeId)
          .single();

        if (error) throw error;
        
        // Parse JSON fields if they're strings
        const parsedData = {
          ...data,
          faq: typeof data.faq === 'string' ? JSON.parse(data.faq) : data.faq || [],
          services: typeof data.services === 'string' ? JSON.parse(data.services) : data.services || [],
          unique_features: typeof data.unique_features === 'string' ? JSON.parse(data.unique_features) : data.unique_features || [],
        };
        
        setDentist(parsedData);
      } catch (error) {
        console.error("Error fetching dentist:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDentist();
  }, [placeId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!dentist) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Dentist not found</h1>
          <Button onClick={() => navigate(-1)}>Go Back</Button>
        </div>
      </div>
    );
  }

  const citySlug = dentist.city?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* SEO Meta - would be set via react-helmet in production */}
      
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Back Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(citySlug ? `/${citySlug}` : '/')}
          className="flex items-center gap-2 mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to {dentist.city || 'Search'}
        </Button>

        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-3">
            {dentist.seo_title || dentist.business_name}
          </h1>
          <p className="text-lg text-muted-foreground mb-4">
            {dentist.seo_description}
          </p>
          
          {/* Quick Info Badges */}
          <div className="flex flex-wrap gap-3 items-center">
            {dentist.rating && (
              <Badge variant="secondary" className="flex items-center gap-1 text-sm py-1">
                <Star className="h-4 w-4 text-primary fill-primary" />
                {dentist.rating} ({dentist.review_count} reviews)
              </Badge>
            )}
            {dentist.city && (
              <Badge variant="outline" className="flex items-center gap-1 text-sm py-1">
                <MapPin className="h-4 w-4" />
                {dentist.city}
              </Badge>
            )}
          </div>
        </div>

        {/* Contact Card */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-4">
              {dentist.phone && (
                <a href={`tel:${dentist.phone}`} className="flex items-center gap-2 text-primary hover:underline">
                  <Phone className="h-5 w-5" />
                  {dentist.phone}
                </a>
              )}
              {dentist.website && (
                <a 
                  href={dentist.website} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-primary hover:underline"
                >
                  <Globe className="h-5 w-5" />
                  Visit Website
                </a>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Profile Content */}
        {dentist.profile_content && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                About This Practice
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm max-w-none text-muted-foreground leading-relaxed">
                {dentist.profile_content.split('\n\n').map((paragraph, idx) => (
                  <p key={idx} className="mb-4">{paragraph}</p>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Services */}
        {dentist.services && dentist.services.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5 text-primary" />
                Services Offered
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {dentist.services.map((service, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span>{service}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Unique Features */}
        {dentist.unique_features && dentist.unique_features.length > 0 && (
          <Card className="mb-8 bg-primary/5 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Quote className="h-5 w-5 text-primary" />
                What Sets {dentist.business_name} Apart
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {dentist.unique_features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <span className="text-primary font-bold">•</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* FAQ Section */}
        {dentist.faq && dentist.faq.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Frequently Asked Questions</CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {dentist.faq.map((item, idx) => (
                  <AccordionItem key={idx} value={`faq-${idx}`}>
                    <AccordionTrigger className="text-left">
                      {item.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      {item.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        )}

        <Separator className="my-8" />

        {/* CTA Section */}
        <div className="text-center py-8">
          <h2 className="text-2xl font-bold mb-4">Ready to Book Your Appointment?</h2>
          <div className="flex flex-wrap justify-center gap-4">
            {dentist.phone && (
              <Button size="lg" asChild>
                <a href={`tel:${dentist.phone}`}>
                  <Phone className="h-5 w-5 mr-2" />
                  Call Now
                </a>
              </Button>
            )}
            {dentist.website && (
              <Button size="lg" variant="outline" asChild>
                <a href={dentist.website} target="_blank" rel="noopener noreferrer">
                  <Globe className="h-5 w-5 mr-2" />
                  Visit Website
                </a>
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DentistProfilePage;
