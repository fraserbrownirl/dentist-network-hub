import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  DollarSign, Cpu, Zap, Database, TrendingUp
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface CostMetrics {
  totalScrapes: number;
  successfulScrapes: number;
  failedScrapes: number;
  aiGenerations: number;
  estimatedFirecrawlCost: number;
  estimatedAiCost: number;
}

export const CostsTab = () => {
  const [costs, setCosts] = useState<CostMetrics>({
    totalScrapes: 0,
    successfulScrapes: 0,
    failedScrapes: 0,
    aiGenerations: 0,
    estimatedFirecrawlCost: 0,
    estimatedAiCost: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCosts = async () => {
      try {
        // Get scrape usage stats
        const { data: scrapeUsage } = await supabase
          .from('scrape_usage')
          .select('status');

        // Get processed leads (AI generations)
        const { data: processed } = await supabase
          .from('dentist_scrapes')
          .select('id')
          .eq('scrape_status', 'processed');

        if (scrapeUsage) {
          const successful = scrapeUsage.filter(s => s.status === 'success').length;
          const failed = scrapeUsage.filter(s => s.status === 'error').length;
          
          // Estimate costs (Firecrawl ~$0.01/page, Lovable AI usage-based)
          const firecrawlCost = successful * 0.01;
          const aiGenerations = processed?.length || 0;
          const aiCost = aiGenerations * 0.005; // Estimated per generation

          setCosts({
            totalScrapes: scrapeUsage.length,
            successfulScrapes: successful,
            failedScrapes: failed,
            aiGenerations,
            estimatedFirecrawlCost: firecrawlCost,
            estimatedAiCost: aiCost
          });
        }
      } catch (error) {
        console.error('Error loading costs:', error);
      } finally {
        setLoading(false);
      }
    };

    loadCosts();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const totalEstimatedCost = costs.estimatedFirecrawlCost + costs.estimatedAiCost;
  const successRate = costs.totalScrapes > 0 
    ? Math.round((costs.successfulScrapes / costs.totalScrapes) * 100) 
    : 0;

  return (
    <div className="space-y-6">
      {/* Cost Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-primary" />
              Total Estimated
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">${totalEstimatedCost.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">All services</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Database className="h-4 w-4 text-primary" />
              Firecrawl
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">${costs.estimatedFirecrawlCost.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">{costs.successfulScrapes} scrapes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Cpu className="h-4 w-4 text-primary" />
              Lovable AI
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">${costs.estimatedAiCost.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">{costs.aiGenerations} generations</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              Success Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{successRate}%</div>
            <p className="text-xs text-muted-foreground">{costs.failedScrapes} failed</p>
          </CardContent>
        </Card>
      </div>

      {/* Cost Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Cost Breakdown</CardTitle>
          <CardDescription>
            Estimated costs based on API usage
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-3">
                <Database className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Firecrawl Scraping</p>
                  <p className="text-sm text-muted-foreground">~$0.01 per page scraped</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold">${costs.estimatedFirecrawlCost.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground">{costs.successfulScrapes} pages</p>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-3">
                <Zap className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Lovable AI Generation</p>
                  <p className="text-sm text-muted-foreground">~$0.005 per SEO content</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold">${costs.estimatedAiCost.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground">{costs.aiGenerations} profiles</p>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 border-t pt-4">
              <p className="font-bold">Total Estimated Cost</p>
              <p className="text-xl font-bold text-primary">${totalEstimatedCost.toFixed(2)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cost Efficiency */}
      <Card>
        <CardHeader>
          <CardTitle>Cost Efficiency</CardTitle>
          <CardDescription>
            Cost per successfully published listing
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <p className="text-sm font-medium">Cost per Listing</p>
              <p className="text-3xl font-bold">
                ${costs.aiGenerations > 0 
                  ? (totalEstimatedCost / costs.aiGenerations).toFixed(3) 
                  : '0.00'}
              </p>
              <p className="text-xs text-muted-foreground">
                Includes scraping + AI generation
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">Scrape Efficiency</p>
              <div className="flex items-center gap-2">
                <Badge variant={successRate >= 90 ? "default" : successRate >= 70 ? "secondary" : "destructive"}>
                  {successRate}% success
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                {costs.failedScrapes} of {costs.totalScrapes} scrapes failed
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Note */}
      <Card className="border-dashed">
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground">
            <strong>Note:</strong> These are estimated costs based on typical API pricing. 
            Actual costs may vary based on your service plans and usage patterns. 
            Lovable AI costs are included in your Lovable subscription.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
