import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Star, Phone, Globe, MapPin, MessageSquare } from "lucide-react";

interface BusinessLead {
  id: string;
  name: string;
  category: string;
  address: string;
  phone_number: string;
  website: string;
  rating: number;
  reviews_count: number;
  google_url: string;
  ai_generated_content?: {
    opening_message: string;
    talking_points: string[];
    page_summary: string;
  }[];
}

interface LeadsListProps {
  jobId: string;
}

export const LeadsList = ({ jobId }: LeadsListProps) => {
  const [leads, setLeads] = useState<BusinessLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLead, setSelectedLead] = useState<BusinessLead | null>(null);

  useEffect(() => {
    const loadLeads = async () => {
      try {
        const { data, error } = await supabase
          .from("business_leads")
          .select(`
            *,
            ai_generated_content (
              opening_message,
              talking_points,
              page_summary
            )
          `)
          .eq("job_id", jobId);

        if (error) throw error;
        setLeads(data || []);
      } catch (error) {
        console.error("Error loading leads:", error);
      } finally {
        setLoading(false);
      }
    };

    loadLeads();
  }, [jobId]);

  if (loading) {
    return <div>Loading leads...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Business Leads ({leads.length})</h3>
      </div>

      <div className="grid gap-4">
        {leads.map((lead) => (
          <Card key={lead.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{lead.name}</CardTitle>
                  <CardDescription>{lead.category}</CardDescription>
                </div>
                {lead.rating && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <Star className="w-3 h-3 fill-current" />
                    {lead.rating} ({lead.reviews_count})
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {lead.address && (
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span>{lead.address}</span>
                  </div>
                )}
                
                {lead.phone_number && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <span>{lead.phone_number}</span>
                  </div>
                )}

                {lead.website && (
                  <div className="flex items-center gap-2 text-sm">
                    <Globe className="w-4 h-4 text-muted-foreground" />
                    <a 
                      href={lead.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      {lead.website}
                    </a>
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  {lead.google_url && (
                    <Button variant="outline" size="sm" asChild>
                      <a href={lead.google_url} target="_blank" rel="noopener noreferrer">
                        View on Google Maps
                      </a>
                    </Button>
                  )}

                  {lead.ai_generated_content?.[0] && (
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <MessageSquare className="w-4 h-4 mr-2" />
                          AI Sales Content
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>AI-Generated Sales Content for {lead.name}</DialogTitle>
                          <DialogDescription>
                            Personalized cold call script and talking points
                          </DialogDescription>
                        </DialogHeader>
                        
                        <div className="space-y-4">
                          {lead.ai_generated_content[0].opening_message && (
                            <div>
                              <Label className="text-base font-semibold">Opening Message</Label>
                              <Textarea 
                                value={lead.ai_generated_content[0].opening_message}
                                readOnly
                                className="mt-2"
                                rows={4}
                              />
                            </div>
                          )}

                          {lead.ai_generated_content[0].talking_points && (
                            <div>
                              <Label className="text-base font-semibold">Talking Points</Label>
                              <div className="mt-2 space-y-2">
                                {lead.ai_generated_content[0].talking_points.map((point, index) => (
                                  <div key={index} className="p-3 bg-muted rounded-lg">
                                    <p className="text-sm">{point}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {lead.ai_generated_content[0].page_summary && (
                            <div>
                              <Label className="text-base font-semibold">Company Summary</Label>
                              <Textarea 
                                value={lead.ai_generated_content[0].page_summary}
                                readOnly
                                className="mt-2"
                                rows={6}
                              />
                            </div>
                          )}
                        </div>
                      </DialogContent>
                    </Dialog>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {leads.length === 0 && (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-muted-foreground">No leads found for this job.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};