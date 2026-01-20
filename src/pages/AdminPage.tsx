import { useState, useEffect, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  LogOut, Play, RefreshCw, Database, Loader2, 
  CheckCircle, XCircle, Clock, Zap, FileText, TestTube
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
  scrape_status: string;
  scraped_at: string | null;
  processed_at: string | null;
  processing_error: string | null;
}

const AdminPage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<PipelineStats>({
    pending: 0, scraped: 0, processed: 0, failed: 0, total: 0, hasContent: 0, hasSeo: 0
  });
  const [recentLeads, setRecentLeads] = useState<RecentLead[]>([]);
  const [processing, setProcessing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const loadPipelineStats = useCallback(async () => {
    try {
      // Get status counts
      const { data: statusData } = await supabase
        .from('dentist_scrapes')
        .select('scrape_status, text_content, seo_title')
        .not('website', 'is', null);

      if (statusData) {
        const pending = statusData.filter(d => !d.scrape_status || d.scrape_status === 'pending').length;
        const scraped = statusData.filter(d => d.scrape_status === 'scraped').length;
        const processed = statusData.filter(d => d.scrape_status === 'processed').length;
        const failed = statusData.filter(d => d.scrape_status === 'failed').length;
        const hasContent = statusData.filter(d => d.text_content).length;
        const hasSeo = statusData.filter(d => d.seo_title).length;

        setStats({
          pending,
          scraped,
          processed,
          failed,
          total: statusData.length,
          hasContent,
          hasSeo
        });
      }

      // Get recent leads
      const { data: leads } = await supabase
        .from('dentist_scrapes')
        .select('id, business_name, city, scrape_status, scraped_at, processed_at, processing_error')
        .order('id', { ascending: false })
        .limit(20);

      setRecentLeads(leads || []);
      setLastRefresh(new Date());
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  }, []);

  useEffect(() => {
    const checkAuthAndLoadData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        navigate('/auth');
        return;
      }

      setUser(session.user);

      // Check if user has admin role
      const { data: roles } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', session.user.id)
        .eq('role', 'admin')
        .single();

      if (!roles) {
        navigate('/dashboard');
        toast.error("Access denied. Admin privileges required.");
        return;
      }

      await loadPipelineStats();
      setLoading(false);
    };

    checkAuthAndLoadData();
  }, [navigate, loadPipelineStats]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(loadPipelineStats, 30000);
    return () => clearInterval(interval);
  }, [loadPipelineStats]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
    toast.success("Logged out successfully");
  };

  const triggerPipeline = async (stage: 'scrape' | 'generate') => {
    setProcessing(true);
    try {
      const { data, error } = await supabase.functions.invoke('process-lead-queue', {
        body: { stage, maxLeads: 5 }
      });

      if (error) throw error;

      toast.success(`Pipeline ${stage} stage triggered: ${data.processed} leads processed`);
      await loadPipelineStats();
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
      await loadPipelineStats();
    } catch (error: any) {
      toast.error(`Failed to reset leads: ${error.message}`);
    } finally {
      setProcessing(false);
    }
  };

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

  const progressPercent = stats.total > 0 ? Math.round((stats.processed / stats.total) * 100) : 0;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Pipeline Dashboard</h1>
            <p className="text-muted-foreground">
              Dentist scraping & SEO generation pipeline
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" asChild>
              <Link to="/admin/scrape-test">
                <TestTube className="h-4 w-4 mr-2" />
                Test Tool
              </Link>
            </Button>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>

        {/* Pipeline Progress */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Pipeline Progress</CardTitle>
                <CardDescription>
                  Overall completion: {stats.processed} of {stats.total} leads fully processed
                </CardDescription>
              </div>
              <Button variant="ghost" size="sm" onClick={loadPipelineStats}>
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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
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

        {/* Action Buttons & Tabs */}
        <Tabs defaultValue="controls" className="space-y-6">
          <TabsList>
            <TabsTrigger value="controls">Pipeline Controls</TabsTrigger>
            <TabsTrigger value="leads">Recent Leads</TabsTrigger>
            <TabsTrigger value="architecture">Architecture</TabsTrigger>
          </TabsList>

          <TabsContent value="controls" className="space-y-6">
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

            {/* Pipeline Info */}
            <Card>
              <CardHeader>
                <CardTitle>Pipeline Configuration</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-6 text-sm">
                  <div>
                    <h4 className="font-medium mb-2">Rate Limits</h4>
                    <ul className="space-y-1 text-muted-foreground">
                      <li>• Firecrawl: 2000ms delay</li>
                      <li>• Lovable AI: 1000ms delay</li>
                      <li>• Batch size: 5 leads</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Auto-Continuation</h4>
                    <ul className="space-y-1 text-muted-foreground">
                      <li>• Pipeline self-triggers next batch</li>
                      <li>• Runs until queue is empty</li>
                      <li>• Stage 1 → Stage 2 automatic</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Data Source</h4>
                    <ul className="space-y-1 text-muted-foreground">
                      <li>• GitHub Actions (3x daily)</li>
                      <li>• Google Maps scraper</li>
                      <li>• 20 cities per batch</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="leads" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Leads</CardTitle>
                <CardDescription>
                  Latest 20 leads in the pipeline
                </CardDescription>
              </CardHeader>
              <CardContent>
                {recentLeads.length === 0 ? (
                  <div className="text-center py-8">
                    <Database className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No leads in pipeline</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recentLeads.map((lead) => (
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
                          {lead.scrape_status === 'processed' && lead.id && (
                            <Button variant="ghost" size="sm" asChild>
                              <Link to={`/dentist/${lead.id}`}>View</Link>
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="architecture" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Pipeline Architecture</CardTitle>
                <CardDescription>
                  Data flow from Google Maps to SEO-ready profiles
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-muted/50 rounded-lg p-6 font-mono text-sm overflow-x-auto">
                  <pre>{`
┌─────────────────┐    ┌──────────────────┐    ┌───────────────────┐
│  GitHub Actions │───►│ github-sync-     │───►│  dentist_scrapes  │
│  (3x daily)     │    │ webhook          │    │  (pending)        │
└─────────────────┘    └──────────────────┘    └───────────────────┘
                                                        │
                              ┌──────────────────────────┘
                              ▼
                    ┌──────────────────┐
                    │ process-lead-    │
                    │ queue (Stage 1)  │
                    │ Firecrawl API    │
                    └──────────────────┘
                              │
                              ▼
                    ┌───────────────────┐
                    │  dentist_scrapes  │
                    │  (scraped)        │
                    └───────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │ process-lead-    │
                    │ queue (Stage 2)  │
                    │ Lovable AI       │
                    └──────────────────┘
                              │
                              ▼
                    ┌───────────────────┐
                    │  dentist_scrapes  │
                    │  (processed)      │
                    │  + SEO content    │
                    └───────────────────┘
                              │
                              ▼
                    ┌───────────────────┐
                    │  Public Profile   │
                    │  /dentist/:id     │
                    └───────────────────┘
                  `}</pre>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>State Machine</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap items-center gap-4 justify-center py-4">
                  <Badge variant="outline" className="text-base py-2 px-4">pending</Badge>
                  <span className="text-muted-foreground">→ Firecrawl →</span>
                  <Badge variant="secondary" className="text-base py-2 px-4">scraped</Badge>
                  <span className="text-muted-foreground">→ Lovable AI →</span>
                  <Badge className="bg-primary/10 text-primary border-primary/20 text-base py-2 px-4">processed</Badge>
                </div>
                <div className="text-center mt-4">
                  <span className="text-muted-foreground">On error: </span>
                  <Badge variant="destructive">failed</Badge>
                  <span className="text-muted-foreground"> (can retry)</span>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminPage;
