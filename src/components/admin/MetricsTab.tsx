import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, Users, Eye, Globe, Calendar
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface MetricsData {
  totalListings: number;
  listingsWithSeo: number;
  citiesCovered: number;
  totalReviews: number;
  avgRating: number;
}

export const MetricsTab = () => {
  const [metrics, setMetrics] = useState<MetricsData>({
    totalListings: 0,
    listingsWithSeo: 0,
    citiesCovered: 0,
    totalReviews: 0,
    avgRating: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMetrics = async () => {
      try {
        // Get total listings and SEO status
        const { data: listings } = await supabase
          .from('dentist_scrapes')
          .select('seo_title, city, review_count, rating');

        if (listings) {
          const uniqueCities = new Set(listings.map(l => l.city?.toLowerCase()).filter(Boolean));
          const withSeo = listings.filter(l => l.seo_title).length;
          const totalReviews = listings.reduce((sum, l) => sum + (l.review_count || 0), 0);
          const ratingsArray = listings.filter(l => l.rating).map(l => l.rating as number);
          const avgRating = ratingsArray.length > 0 
            ? ratingsArray.reduce((sum, r) => sum + r, 0) / ratingsArray.length 
            : 0;

          setMetrics({
            totalListings: listings.length,
            listingsWithSeo: withSeo,
            citiesCovered: uniqueCities.size,
            totalReviews,
            avgRating
          });
        }
      } catch (error) {
        console.error('Error loading metrics:', error);
      } finally {
        setLoading(false);
      }
    };

    loadMetrics();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const seoPercentage = metrics.totalListings > 0 
    ? Math.round((metrics.listingsWithSeo / metrics.totalListings) * 100) 
    : 0;

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Globe className="h-4 w-4 text-primary" />
              Total Listings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{metrics.totalListings.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Dentist profiles</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Eye className="h-4 w-4 text-primary" />
              SEO Ready
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{metrics.listingsWithSeo.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">{seoPercentage}% of total</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              Cities Covered
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{metrics.citiesCovered}</div>
            <p className="text-xs text-muted-foreground">Unique locations</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              Avg Rating
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{metrics.avgRating.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">{metrics.totalReviews.toLocaleString()} reviews</p>
          </CardContent>
        </Card>
      </div>

      {/* Content Quality */}
      <Card>
        <CardHeader>
          <CardTitle>Content Coverage</CardTitle>
          <CardDescription>
            SEO content generation status across all listings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">SEO Title & Description</span>
              <Badge variant={seoPercentage >= 80 ? "default" : "secondary"}>
                {seoPercentage}%
              </Badge>
            </div>
            <div className="w-full bg-muted rounded-full h-3">
              <div 
                className="bg-primary h-3 rounded-full transition-all"
                style={{ width: `${seoPercentage}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Traffic Note */}
      <Card className="border-dashed">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Traffic Analytics
          </CardTitle>
          <CardDescription>
            Detailed traffic analytics coming soon
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Page views, unique visitors, and search rankings will be tracked once the site is live 
            and integrated with analytics services.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
