import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Play, Globe, MapPin, Search, Building } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AdminWorkflowFormProps {
  onWorkflowTriggered: () => void;
}

export const AdminWorkflowForm = ({ onWorkflowTriggered }: AdminWorkflowFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    keyword: "",
    country: "",
    city: "",
    locationUrl: "",
    companySegment: "",
    workflowType: "maps-extraction"
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Get the first available dentist ID for admin-triggered workflows
      const { data: dentists, error: dentistError } = await supabase
        .from("dentists")
        .select("id")
        .limit(1);

      if (dentistError || !dentists || dentists.length === 0) {
        throw new Error("No dentist found in the system. Please create a dentist profile first.");
      }

      const adminDentistId = dentists[0].id;

      // Create job record in database
      const { data: job, error } = await supabase
        .from("lead_extraction_jobs")
        .insert({
          dentist_id: adminDentistId,
          location_url: formData.locationUrl,
          keyword: formData.keyword,
          country: formData.country,
          company_segment: formData.companySegment,
          status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;

      // Prepare webhook payload
      const webhookPayload = {
        job_id: job.id,
        keyword: formData.keyword,
        country: formData.country,
        city: formData.city,
        location_url: formData.locationUrl,
        company_segment: formData.companySegment,
        workflow_type: formData.workflowType,
        triggered_by: "admin",
        timestamp: new Date().toISOString()
      };

      // Submit to Supabase edge function which will forward to n8n
      const { data: result, error: functionError } = await supabase.functions.invoke('webhook-receiver', {
        body: webhookPayload,
      });

      if (functionError) {
        throw new Error(`Webhook function failed: ${functionError.message}`);
      }
      
      toast.success("Scraping started 🚀", {
        description: `Job ID: ${job.id.slice(0, 8)}...`
      });

      // Reset form
      setFormData({
        keyword: "",
        country: "",
        city: "",
        locationUrl: "",
        companySegment: "",
        workflowType: "maps-extraction"
      });

      onWorkflowTriggered();
    } catch (error) {
      console.error("Error triggering workflow:", error);
      toast.error("Failed to trigger workflow", {
        description: error instanceof Error ? error.message : "Unknown error occurred"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Play className="h-5 w-5" />
          Trigger n8n Workflow
        </CardTitle>
        <CardDescription>
          Manually trigger data extraction workflows for testing or specific requirements
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Workflow Type Selection */}
          <div className="space-y-2">
            <Label htmlFor="workflowType">Workflow Type</Label>
            <Select value={formData.workflowType} onValueChange={(value) => 
              setFormData(prev => ({ ...prev, workflowType: value }))
            }>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="maps-extraction">Google Maps Extraction</SelectItem>
                <SelectItem value="business-scraping">Business Data Scraping</SelectItem>
                <SelectItem value="lead-enrichment">Lead Enrichment</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Location URL - Required */}
          <div className="space-y-2">
            <Label htmlFor="locationUrl">Location URL (Required)</Label>
            <Input
              id="locationUrl"
              type="url"
              value={formData.locationUrl}
              onChange={(e) => setFormData(prev => ({ ...prev, locationUrl: e.target.value }))}
              placeholder="https://www.google.com.br/maps/@-27.0969036,-52.6273034,14z?hl=pt-BR&entry=ttu&g_ep=EgoyMDI1MDcwOS4wIKXMDSoASAFQAw%3D%3D"
              required
            />
            <p className="text-sm text-muted-foreground">
              Copy the URL from your browser address bar. DO NOT use the Share feature in Google Maps.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Keyword Search */}
            <div className="space-y-2">
              <Label htmlFor="keyword" className="flex items-center gap-2">
                <Search className="h-4 w-4" />
                Keyword Search (Required)
              </Label>
              <Input
                id="keyword"
                value={formData.keyword}
                onChange={(e) => setFormData(prev => ({ ...prev, keyword: e.target.value }))}
                placeholder="Restaurant"
                required
              />
              <p className="text-sm text-muted-foreground">
                What type of business are you looking for?
              </p>
            </div>

            {/* Country */}
            <div className="space-y-2">
              <Label htmlFor="country" className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                Country (Required)
              </Label>
              <Input
                id="country"
                value={formData.country}
                onChange={(e) => setFormData(prev => ({ ...prev, country: e.target.value }))}
                placeholder="US"
                required
              />
              <p className="text-sm text-muted-foreground">
                Country code (e.g., US, CA, UK)
              </p>
            </div>
          </div>

          {/* Company Segment */}
          <div className="space-y-2">
            <Label htmlFor="companySegment" className="flex items-center gap-2">
              <Building className="h-4 w-4" />
              My company's segment (Required)
            </Label>
            <Input
              id="companySegment"
              value={formData.companySegment}
              onChange={(e) => setFormData(prev => ({ ...prev, companySegment: e.target.value }))}
              placeholder="Marketing Agency"
              required
            />
            <p className="text-sm text-muted-foreground">
              Your company's industry or segment
            </p>
          </div>

          {/* Workflow Info */}
          <div className="bg-muted p-4 rounded-lg">
            <h4 className="font-medium mb-2">Workflow Configuration</h4>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">Auto AI Enrichment</Badge>
              <Badge variant="outline">Real-time Processing</Badge>
              <Badge variant="outline">Webhook Callbacks</Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              This workflow will extract business data, enrich it with AI-generated content, 
              and store results in the database via webhook callbacks.
            </p>
          </div>

          <Button type="submit" disabled={isLoading} className="w-full" size="lg">
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Triggering Workflow...
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                Start Workflow Execution
              </>
            )}
          </Button>
        </form>

        {/* Webhook URL Info */}
        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
          <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
            Workflow Integration
          </h4>
          <code className="text-sm bg-white dark:bg-gray-800 p-2 rounded border block">
            Supabase Edge Function → n8n Webhook → Results Callback
          </code>
          <p className="text-xs text-blue-700 dark:text-blue-300 mt-2">
            Workflow is triggered via Supabase edge function which forwards to your n8n instance
          </p>
        </div>
      </CardContent>
    </Card>
  );
};