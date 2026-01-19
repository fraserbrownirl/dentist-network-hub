import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Loader2, Globe, Sparkles, ArrowRight, Quote, Shield, Code, ChevronDown, Copy, Check } from 'lucide-react';

interface ScrapedData {
  markdown?: string;
  metadata?: {
    title?: string;
    description?: string;
    sourceURL?: string;
  };
  branding?: {
    logo?: string;
    colors?: Record<string, string>;
    fonts?: Array<{ family: string }>;
  };
}

interface SEOContent {
  seo_title: string;
  seo_description: string;
  profile_content: string;
  faq: Array<{ question: string; answer: string }>;
  quotable_facts?: string[];
  authority_signals?: string[];
  schema_json_ld?: object;
}

function assertEnv(value: string | undefined, name: string): string {
  if (!value) throw new Error(`${name} is not configured`);
  return value;
}

async function invokeBackendFunction<T>(functionName: string, body: unknown): Promise<T> {
  const baseUrl = assertEnv(import.meta.env.VITE_SUPABASE_URL, 'VITE_SUPABASE_URL');
  const publishableKey = assertEnv(
    import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
    'VITE_SUPABASE_PUBLISHABLE_KEY'
  );

  const resp = await fetch(`${baseUrl}/functions/v1/${functionName}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${publishableKey}`,
    },
    body: JSON.stringify(body),
  });

  let json: any = null;
  try {
    json = await resp.json();
  } catch {
    json = null;
  }

  if (!resp.ok) {
    const msg = json?.error || json?.message || `Request failed (${resp.status})`;
    throw new Error(msg);
  }

  return json as T;
}

export default function ScrapeTestPage() {
  const { toast } = useToast();
  const [url, setUrl] = useState('https://www.209nycdental.com/');
  const [isScrapingLoading, setIsScrapingLoading] = useState(false);
  const [isSeoLoading, setIsSeoLoading] = useState(false);
  const [scrapedData, setScrapedData] = useState<ScrapedData | null>(null);
  const [seoContent, setSeoContent] = useState<SEOContent | null>(null);
  const [schemaOpen, setSchemaOpen] = useState(false);
  const [copiedFact, setCopiedFact] = useState<number | null>(null);
  const [copiedSchema, setCopiedSchema] = useState(false);

  const copyToClipboard = async (text: string, factIndex?: number) => {
    await navigator.clipboard.writeText(text);
    if (factIndex !== undefined) {
      setCopiedFact(factIndex);
      setTimeout(() => setCopiedFact(null), 2000);
    } else {
      setCopiedSchema(true);
      setTimeout(() => setCopiedSchema(false), 2000);
    }
  };

  const handleScrape = async () => {
    if (!url) {
      toast({ title: 'Error', description: 'Please enter a URL', variant: 'destructive' });
      return;
    }

    setIsScrapingLoading(true);
    setScrapedData(null);
    setSeoContent(null);

    try {
      const result = await invokeBackendFunction<any>('scrape-website', { url });

      if (result?.success === false) {
        throw new Error(result.error || 'Scraping failed');
      }

      const scraped = result?.data ?? result;
      setScrapedData(scraped);
      toast({ title: 'Success', description: 'Website scraped successfully!' });
    } catch (error) {
      console.error('Scrape error:', error);
      toast({
        title: 'Scraping Failed',
        description: error instanceof Error ? error.message : 'Failed to scrape website',
        variant: 'destructive'
      });
    } finally {
      setIsScrapingLoading(false);
    }
  };

  const handleGenerateSEO = async () => {
    if (!scrapedData?.markdown) {
      toast({ title: 'Error', description: 'Please scrape a website first', variant: 'destructive' });
      return;
    }

    setIsSeoLoading(true);

    try {
      const result = await invokeBackendFunction<any>('generate-seo-content', {
        markdown: scrapedData.markdown,
        businessName: scrapedData.metadata?.title,
        address: '209 E 56th St, New York, NY 10022',
        rating: 4.3,
        reviewsCount: 150,
      });

      if (result?.success === false) {
        throw new Error(result.error || 'SEO generation failed');
      }

      setSeoContent(result.data);
      toast({ title: 'Success', description: 'SEO content generated!' });
    } catch (error) {
      console.error('SEO generation error:', error);
      toast({
        title: 'Generation Failed',
        description: error instanceof Error ? error.message : 'Failed to generate SEO content',
        variant: 'destructive'
      });
    } finally {
      setIsSeoLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Firecrawl + AI Demo</h1>
          <p className="text-muted-foreground">
            Scrape a dental website and generate unique SEO content with AI
          </p>
        </div>

        {/* Controls */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex gap-4 items-end flex-wrap">
              <div className="flex-1 min-w-[300px]">
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Website URL
                </label>
                <Input
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://example.com"
                  className="w-full"
                />
              </div>
              <Button
                onClick={handleScrape}
                disabled={isScrapingLoading}
                className="gap-2"
              >
                {isScrapingLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Globe className="h-4 w-4" />
                )}
                Scrape Website
              </Button>
              <ArrowRight className="h-4 w-4 text-muted-foreground hidden sm:block" />
              <Button
                onClick={handleGenerateSEO}
                disabled={isSeoLoading || !scrapedData}
                variant="secondary"
                className="gap-2"
              >
                {isSeoLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4" />
                )}
                Generate SEO Content
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Split View Results */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Panel - Original Content */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Original Scraped Content
            </h2>

            {/* Metadata */}
            {scrapedData?.metadata && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Metadata
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div>
                    <span className="text-xs text-muted-foreground">Title:</span>
                    <p className="text-sm text-foreground">{scrapedData.metadata.title || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground">Description:</span>
                    <p className="text-sm text-foreground">{scrapedData.metadata.description || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground">Source:</span>
                    <p className="text-sm text-foreground truncate">{scrapedData.metadata.sourceURL || 'N/A'}</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Branding */}
            {scrapedData?.branding && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Branding
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {scrapedData.branding.logo && (
                    <div>
                      <span className="text-xs text-muted-foreground">Logo:</span>
                      <img 
                        src={scrapedData.branding.logo} 
                        alt="Logo" 
                        className="h-12 mt-1 object-contain"
                        onError={(e) => (e.currentTarget.style.display = 'none')}
                      />
                    </div>
                  )}
                  {scrapedData.branding.colors && Object.keys(scrapedData.branding.colors).length > 0 && (
                    <div>
                      <span className="text-xs text-muted-foreground">Colors:</span>
                      <div className="flex gap-2 mt-1 flex-wrap">
                        {Object.entries(scrapedData.branding.colors).map(([name, color]) => (
                          <div key={name} className="flex items-center gap-1">
                            <div 
                              className="w-6 h-6 rounded border border-border"
                              style={{ backgroundColor: color }}
                            />
                            <span className="text-xs text-muted-foreground">{name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {scrapedData.branding.fonts && scrapedData.branding.fonts.length > 0 && (
                    <div>
                      <span className="text-xs text-muted-foreground">Fonts:</span>
                      <p className="text-sm text-foreground">
                        {scrapedData.branding.fonts.map(f => f.family).join(', ')}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Raw Markdown */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Raw Markdown Content
                </CardTitle>
              </CardHeader>
              <CardContent>
                {scrapedData?.markdown ? (
                  <pre className="text-xs text-foreground bg-muted p-4 rounded-md overflow-auto max-h-[500px] whitespace-pre-wrap">
                    {scrapedData.markdown}
                  </pre>
                ) : (
                  <p className="text-sm text-muted-foreground italic">
                    {isScrapingLoading ? 'Scraping...' : 'No content scraped yet. Click "Scrape Website" to start.'}
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Panel - AI Rewritten Content */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              AI-Rewritten SEO Content
            </h2>

            {seoContent ? (
              <>
                {/* SEO Title & Description */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      SEO Meta Tags
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <span className="text-xs text-muted-foreground">Title ({seoContent.seo_title.length} chars):</span>
                      <p className="text-sm font-medium text-foreground">{seoContent.seo_title}</p>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground">Description ({seoContent.seo_description.length} chars):</span>
                      <p className="text-sm text-foreground">{seoContent.seo_description}</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Profile Content */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Rewritten Profile Content
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="prose prose-sm max-w-none dark:prose-invert text-foreground">
                      <pre className="text-xs bg-muted p-4 rounded-md overflow-auto max-h-[300px] whitespace-pre-wrap">
                        {seoContent.profile_content}
                      </pre>
                    </div>
                  </CardContent>
                </Card>

                {/* FAQ */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Generated FAQ ({seoContent.faq.length} questions)
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {seoContent.faq.map((item, index) => (
                      <div key={index} className="border-l-2 border-primary pl-3">
                        <p className="text-sm font-medium text-foreground">Q: {item.question}</p>
                        <p className="text-sm text-muted-foreground mt-1">A: {item.answer}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* LLM Optimization Section */}
                <div className="pt-4 border-t border-border">
                  <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-primary" />
                    LLM Search Optimization (GEO)
                  </h3>

                  {/* Quotable Facts */}
                  {seoContent.quotable_facts && seoContent.quotable_facts.length > 0 && (
                    <Card className="mb-4">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                          <Quote className="h-4 w-4" />
                          Quotable Facts ({seoContent.quotable_facts.length})
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {seoContent.quotable_facts.map((fact, index) => (
                          <div 
                            key={index} 
                            className="relative bg-muted/50 border-l-4 border-primary p-3 rounded-r-md group"
                          >
                            <blockquote className="text-sm text-foreground italic pr-8">
                              "{fact}"
                            </blockquote>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => copyToClipboard(fact, index)}
                            >
                              {copiedFact === index ? (
                                <Check className="h-3 w-3 text-green-500" />
                              ) : (
                                <Copy className="h-3 w-3" />
                              )}
                            </Button>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  )}

                  {/* Authority Signals */}
                  {seoContent.authority_signals && seoContent.authority_signals.length > 0 && (
                    <Card className="mb-4">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                          <Shield className="h-4 w-4" />
                          Authority Signals
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-2">
                          {seoContent.authority_signals.map((signal, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {signal}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Schema JSON-LD Preview */}
                  {seoContent.schema_json_ld && (
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                          <Code className="h-4 w-4" />
                          Schema.org JSON-LD
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Collapsible open={schemaOpen} onOpenChange={setSchemaOpen}>
                          <div className="flex items-center justify-between">
                            <CollapsibleTrigger asChild>
                              <Button variant="ghost" size="sm" className="gap-2">
                                <ChevronDown className={`h-4 w-4 transition-transform ${schemaOpen ? 'rotate-180' : ''}`} />
                                {schemaOpen ? 'Hide' : 'Show'} Schema
                              </Button>
                            </CollapsibleTrigger>
                            <Button
                              variant="outline"
                              size="sm"
                              className="gap-2"
                              onClick={() => copyToClipboard(JSON.stringify(seoContent.schema_json_ld, null, 2))}
                            >
                              {copiedSchema ? (
                                <Check className="h-3 w-3 text-green-500" />
                              ) : (
                                <Copy className="h-3 w-3" />
                              )}
                              Copy Schema
                            </Button>
                          </div>
                          <CollapsibleContent>
                            <pre className="mt-3 text-xs bg-muted p-4 rounded-md overflow-auto max-h-[300px] whitespace-pre-wrap">
                              {JSON.stringify(seoContent.schema_json_ld, null, 2)}
                            </pre>
                          </CollapsibleContent>
                        </Collapsible>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </>
            ) : (
              <Card>
                <CardContent className="py-12">
                  <p className="text-sm text-muted-foreground italic text-center">
                    {isSeoLoading 
                      ? 'Generating SEO content with AI...' 
                      : scrapedData 
                        ? 'Click "Generate SEO Content" to create unique content.'
                        : 'Scrape a website first, then generate SEO content.'}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
