import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Play, RefreshCw, Database, Loader2, 
  CheckCircle, XCircle, Clock, Zap, FileText
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface PipelineStats {
  pending: number;
  scraped: number;
  processed: number;
  failed: number;
  total: number;
  hasContent: number;
  hasSeo: number;
}

interface RecentLead {
  id: number;
  business_name: string;
  city: string;
  place_id: string | null;
  scrape_status: string;
  scraped_at: string | null;
  processed_at: string | null;
  processing_error: string | null;
}

interface PipelineTabProps {
  stats: PipelineStats;
  allLeads: RecentLead[];
  scrapedLeads: RecentLead[];
  processedLeads: RecentLead[];
  lastRefresh: Date;
  onRefresh: () => Promise<void>;
}

const LeadsList = ({ 
  leads, 
  showProfileLink 
}: { 
  leads: RecentLead[]; 
  showProfileLink: boolean;
}) => {
  const getStatusIcon = (status: string | null) => {
    switch (status) {
      case 'processed': return <CheckCircle className="h-4 w-4 text-primary" />;
      case 'scraped': return <FileText className="h-4 w-4 text-primary/70" />;
      case 'failed': return <XCircle className="h-4 w-4 text-destructive" />;
      default: return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case 'processed': return <Badge className="bg-primary/10 text-primary border-primary/20">Processed</Badge>;
      case 'scraped': return <Badge variant="secondary">Scraped</Badge>;
      case 'failed': return <Badge variant="destructive">Failed</Badge>;
      default: return <Badge variant="outline">Pending</Badge>;
    }
  };

  if (leads.length === 0) {
    return (
      <div className="text-center py-8">
        <Database className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <p className="text-muted-foreground">No leads found</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {leads.map((lead) => (
        <div 
          key={lead.id} 
          className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            {getStatusIcon(lead.scrape_status)}
            <div>
              <p className="font-medium text-sm">
                {lead.business_name || `Lead #${lead.id}`}
              </p>
              <p className="text-xs text-muted-foreground">
                {lead.city || 'Unknown city'}
                {lead.processing_error && (
                  <span className="text-destructive ml-2">
                    • {lead.processing_error}
                  </span>
                )}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {getStatusBadge(lead.scrape_status)}
            {showProfileLink && lead.place_id && (
              <Button variant="outline" size="sm" asChild>
                <Link to={`/dentist/${lead.place_id}`}>
                  View Listing
                </Link>
              </Button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export const PipelineTab = ({
  stats,
  allLeads,
  scrapedLeads,
  processedLeads,
  lastRefresh,
  onRefresh
}: PipelineTabProps) => {
  const [processing, setProcessing] = useState(false);
  const [leadsTab, setLeadsTab] = useState("all");

  const progressPercent = stats.total > 0 ? Math.round((stats.processed / stats.total) * 100) : 0;

  const triggerPipeline = async (stage: 'scrape' | 'generate') => {
    setProcessing(true);
    try {
      const { data, error } = await supabase.functions.invoke('process-lead-queue', {
        body: { stage, maxLeads: 5 }
      });

      if (error) throw error;

      toast.success(`Pipeline ${stage} stage triggered: ${data.processed} leads processed`);
      await onRefresh();
    } catch (error: any) {
      toast.error(`Failed to trigger pipeline: ${error.message}`);
    } finally {
      setProcessing(false);
    }
  };

  const retryFailedLeads = async () => {
    setProcessing(true);
    try {
      const { error } = await supabase
        .from('dentist_scrapes')
        .update({ scrape_status: 'pending', processing_error: null, retry_count: 0 })
        .eq('scrape_status', 'failed');

      if (error) throw error;

      toast.success('Failed leads reset to pending');
      await onRefresh();
    } catch (error: any) {
      toast.error(`Failed to reset leads: ${error.message}`);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Pipeline Progress */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Pipeline Progress</CardTitle>
              <CardDescription>
                Overall completion: {stats.processed} of {stats.total} leads fully processed
              </CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={onRefresh}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Progress value={progressPercent} className="h-3" />
            <p className="text-sm text-muted-foreground text-right">
              {progressPercent}% complete • Last updated: {lastRefresh.toLocaleTimeString()}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              Pending
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.pending}</div>
            <p className="text-xs text-muted-foreground">Awaiting scrape</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary/70" />
              Scraped
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.scraped}</div>
            <p className="text-xs text-muted-foreground">Awaiting SEO</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-primary" />
              Processed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.processed}</div>
            <p className="text-xs text-muted-foreground">SEO complete</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <XCircle className="h-4 w-4 text-destructive" />
              Failed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.failed}</div>
            <p className="text-xs text-muted-foreground">Need retry</p>
          </CardContent>
        </Card>
      </div>

      {/* Pipeline Controls */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Stage 1: Scrape</CardTitle>
            <CardDescription>
              Fetch website content via Firecrawl for pending leads
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span>Queue:</span>
                <span className="font-medium">{stats.pending} leads</span>
              </div>
              <Button 
                className="w-full" 
                onClick={() => triggerPipeline('scrape')}
                disabled={processing || stats.pending === 0}
              >
                {processing ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Play className="h-4 w-4 mr-2" />
                )}
                Run Scrape Stage
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Stage 2: Generate SEO</CardTitle>
            <CardDescription>
              Generate SEO content via Lovable AI for scraped leads
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span>Queue:</span>
                <span className="font-medium">{stats.scraped} leads</span>
              </div>
              <Button 
                className="w-full" 
                onClick={() => triggerPipeline('generate')}
                disabled={processing || stats.scraped === 0}
              >
                {processing ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Zap className="h-4 w-4 mr-2" />
                )}
                Run SEO Stage
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Retry Failed</CardTitle>
            <CardDescription>
              Reset failed leads back to pending for reprocessing
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span>Failed:</span>
                <span className="font-medium">{stats.failed} leads</span>
              </div>
              <Button 
                className="w-full" 
                variant="outline"
                onClick={retryFailedLeads}
                disabled={processing || stats.failed === 0}
              >
                {processing ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-2" />
                )}
                Reset Failed Leads
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Leads */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Leads</CardTitle>
          <CardDescription>
            Latest 20 leads in the pipeline
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Tabs value={leadsTab} onValueChange={setLeadsTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="all">All ({allLeads.length})</TabsTrigger>
              <TabsTrigger value="scraped">Scraped ({scrapedLeads.length})</TabsTrigger>
              <TabsTrigger value="processed">SEO Complete ({processedLeads.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-4">
              <LeadsList leads={allLeads} showProfileLink={false} />
            </TabsContent>

            <TabsContent value="scraped" className="mt-4">
              <LeadsList leads={scrapedLeads} showProfileLink={false} />
            </TabsContent>

            <TabsContent value="processed" className="mt-4">
              <LeadsList leads={processedLeads} showProfileLink={true} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
