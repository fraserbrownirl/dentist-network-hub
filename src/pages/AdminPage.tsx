import { useState, useEffect, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  LogOut, Activity, BarChart3, DollarSign, TestTube
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { PipelineTab } from "@/components/admin/PipelineTab";
import { MetricsTab } from "@/components/admin/MetricsTab";
import { CostsTab } from "@/components/admin/CostsTab";

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

const AdminPage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<PipelineStats>({
    pending: 0, scraped: 0, processed: 0, failed: 0, total: 0, hasContent: 0, hasSeo: 0
  });
  const [allLeads, setAllLeads] = useState<RecentLead[]>([]);
  const [scrapedLeads, setScrapedLeads] = useState<RecentLead[]>([]);
  const [processedLeads, setProcessedLeads] = useState<RecentLead[]>([]);
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

      // Get leads for each tab separately
      const [allResult, scrapedResult, processedResult] = await Promise.all([
        supabase
          .from('dentist_scrapes')
          .select('id, business_name, city, place_id, scrape_status, scraped_at, processed_at, processing_error')
          .order('id', { ascending: false })
          .limit(20),
        supabase
          .from('dentist_scrapes')
          .select('id, business_name, city, place_id, scrape_status, scraped_at, processed_at, processing_error')
          .eq('scrape_status', 'scraped')
          .order('id', { ascending: false })
          .limit(20),
        supabase
          .from('dentist_scrapes')
          .select('id, business_name, city, place_id, scrape_status, scraped_at, processed_at, processing_error')
          .eq('scrape_status', 'processed')
          .order('id', { ascending: false })
          .limit(20)
      ]);

      setAllLeads(allResult.data || []);
      setScrapedLeads(scrapedResult.data || []);
      setProcessedLeads(processedResult.data || []);
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
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground">
              Pipeline, metrics, and cost management
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

        {/* Main Tabs */}
        <Tabs defaultValue="pipeline" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-grid">
            <TabsTrigger value="pipeline" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Pipeline
            </TabsTrigger>
            <TabsTrigger value="metrics" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Metrics
            </TabsTrigger>
            <TabsTrigger value="costs" className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Costs
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pipeline">
            <PipelineTab
              stats={stats}
              allLeads={allLeads}
              scrapedLeads={scrapedLeads}
              processedLeads={processedLeads}
              lastRefresh={lastRefresh}
              onRefresh={loadPipelineStats}
            />
          </TabsContent>

          <TabsContent value="metrics">
            <MetricsTab />
          </TabsContent>

          <TabsContent value="costs">
            <CostsTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminPage;
