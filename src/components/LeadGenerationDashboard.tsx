import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LeadGenerationForm } from "./LeadGenerationForm";
import { LeadsList } from "./LeadsList";
import { Eye, Download } from "lucide-react";

interface LeadJob {
  id: string;
  status: string;
  location_url: string;
  keyword: string;
  country: string;
  company_segment: string;
  total_leads: number;
  processed_leads: number;
  error_message?: string;
  created_at: string;
}

interface LeadGenerationDashboardProps {
  dentistId: string;
}

export const LeadGenerationDashboard = ({ dentistId }: LeadGenerationDashboardProps) => {
  const [jobs, setJobs] = useState<LeadJob[]>([]);
  const [selectedJob, setSelectedJob] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const loadJobs = async () => {
    try {
      const { data, error } = await supabase
        .from("lead_extraction_jobs")
        .select("*")
        .eq("dentist_id", dentistId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setJobs(data || []);
    } catch (error) {
      console.error("Error loading jobs:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadJobs();
  }, [dentistId]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500";
      case "running":
        return "bg-blue-500";
      case "failed":
        return "bg-red-500";
      default:
        return "bg-yellow-500";
    }
  };

  const exportLeads = async (jobId: string) => {
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

      // Convert to CSV
      const headers = [
        "Name", "Category", "Address", "Phone", "Website", 
        "Rating", "Reviews Count", "Opening Message", "Page Summary"
      ];
      
      const csvContent = [
        headers.join(","),
        ...data.map(lead => [
          `"${lead.name || ""}"`,
          `"${lead.category || ""}"`,
          `"${lead.address || ""}"`,
          `"${lead.phone_number || ""}"`,
          `"${lead.website || ""}"`,
          lead.rating || "",
          lead.reviews_count || "",
          `"${lead.ai_generated_content?.[0]?.opening_message || ""}"`,
          `"${lead.ai_generated_content?.[0]?.page_summary || ""}"`
        ].join(","))
      ].join("\n");

      // Download CSV
      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `leads-${jobId}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error exporting leads:", error);
    }
  };

  if (loading) {
    return <div>Loading lead generation dashboard...</div>;
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="create">
        <TabsList>
          <TabsTrigger value="create">Create Job</TabsTrigger>
          <TabsTrigger value="jobs">Jobs ({jobs.length})</TabsTrigger>
          {selectedJob && <TabsTrigger value="leads">View Leads</TabsTrigger>}
        </TabsList>

        <TabsContent value="create">
          <LeadGenerationForm 
            dentistId={dentistId} 
            onJobCreated={loadJobs}
          />
        </TabsContent>

        <TabsContent value="jobs">
          <div className="space-y-4">
            {jobs.map((job) => (
              <Card key={job.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{job.keyword} in {job.country}</CardTitle>
                      <CardDescription>
                        Created {new Date(job.created_at).toLocaleDateString()}
                      </CardDescription>
                    </div>
                    <Badge className={getStatusColor(job.status)}>
                      {job.status.toUpperCase()}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Leads</p>
                      <p className="text-2xl font-bold">{job.total_leads}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Processed</p>
                      <p className="text-2xl font-bold">{job.processed_leads}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Company Segment</p>
                      <p className="text-sm">{job.company_segment}</p>
                    </div>
                  </div>
                  
                  {job.error_message && (
                    <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded">
                      <p className="text-red-700 text-sm">{job.error_message}</p>
                    </div>
                  )}

                  {job.status === "completed" && job.total_leads > 0 && (
                    <div className="mt-4 flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setSelectedJob(job.id)}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View Leads
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => exportLeads(job.id)}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Export CSV
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}

            {jobs.length === 0 && (
              <Card>
                <CardContent className="text-center py-8">
                  <p className="text-muted-foreground">No lead extraction jobs yet. Create your first job to get started.</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {selectedJob && (
          <TabsContent value="leads">
            <LeadsList jobId={selectedJob} />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};