import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { MapPin, Clock, Star, Mail, ArrowLeft, Phone, Calendar, Globe, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Offer {
  id: string;
  title: string;
  description: string;
  duration_weeks: number;
  price: number;
  original_price?: number;
  dentist: {
    practice_name: string;
    contact_name: string;
    phone: string;
    address: string;
  };
}

interface DentistListing {
  id: number;
  place_id: string;
  business_name: string;
  seo_title: string;
  seo_description: string;
  rating: number;
  review_count: number;
  phone: string;
  website: string;
}

const CityPage = () => {
  const { citySlug } = useParams<{ citySlug: string }>();
  const navigate = useNavigate();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [dentists, setDentists] = useState<DentistListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [subscribing, setSubscribing] = useState(false);
  const [cityData, setCityData] = useState<any>(null);

  const cityName = citySlug?.split('-').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ') || '';

  useEffect(() => {
    const fetchCityDataAndOffers = async () => {
      if (!citySlug) return;

      try {
        // Fetch city data from cities table
        const { data: cityInfo } = await supabase
          .from('cities')
          .select('*')
          .eq('slug', citySlug)
          .single();

        setCityData(cityInfo);

        // Fetch dentists from dentist_scrapes for this city
        const { data: dentistData, error: dentistError } = await supabase
          .from('dentist_scrapes')
          .select('id, place_id, business_name, seo_title, seo_description, rating, review_count, phone, website')
          .ilike('city', `%${cityName}%`)
          .not('seo_title', 'is', null)
          .order('rating', { ascending: false })
          .limit(50);

        if (dentistError) {
          console.error('Error fetching dentists:', dentistError);
        } else {
          setDentists(dentistData || []);
        }

        // Fetch active offers for this city (if city exists in cities table)
        if (cityInfo) {
          const { data: offersData, error } = await supabase
            .from('offers')
            .select(`
              *,
              dentists:dentist_id (
                practice_name,
                contact_name,
                phone,
                address
              )
            `)
            .eq('is_active', true)
            .eq('city_id', cityInfo.id);

          if (error) {
            console.error('Error fetching offers:', error);
          } else {
            setOffers(offersData?.map(offer => ({
              ...offer,
              dentist: offer.dentists
            })) || []);
          }
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCityDataAndOffers();
  }, [citySlug, cityName]);

  const handleEmailSubscribe = async () => {
    if (!email || !cityData?.id) return;

    setSubscribing(true);
    try {
      const { error } = await supabase
        .from('subscribers')
        .insert({
          email,
          city_id: cityData.id
        });

      if (error) throw error;

      toast.success("Thanks! We'll notify you when new offers become available.");
      setEmail("");
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
      console.error('Error subscribing:', error);
    } finally {
      setSubscribing(false);
    }
  };

  const formatPrice = (price: number) => `$${price.toFixed(0)}`;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading offers for {cityName}...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Search
          </Button>
        </div>

        {/* City Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <MapPin className="h-6 w-6 text-primary" />
            <h1 className="text-4xl md:text-5xl font-bold">
              Dental Hygiene Offers in {cityName}
            </h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Discover professional dental cleaning services from trusted local dentists. 
            Save money while maintaining excellent oral health.
          </p>
        </div>

        {offers.length > 0 ? (
          // Show available offers
          <div className="space-y-8">
            <div className="text-center">
              <Badge variant="secondary" className="text-lg px-4 py-2">
                {offers.length} Active Offer{offers.length !== 1 ? 's' : ''} Available
              </Badge>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {offers.map((offer) => (
                <Card key={offer.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-xl">{offer.title}</CardTitle>
                        <CardDescription className="flex items-center gap-1 mt-1">
                          <Star className="h-4 w-4 text-primary" />
                          {offer.dentist.practice_name}
                        </CardDescription>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-primary">
                          {formatPrice(offer.price)}
                        </div>
                        {offer.original_price && (
                          <div className="text-sm text-muted-foreground line-through">
                            {formatPrice(offer.original_price)}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">{offer.description}</p>
                    
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>{offer.duration_weeks} week{offer.duration_weeks !== 1 ? 's' : ''} treatment</span>
                    </div>

                    <Separator />

                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span>{offer.dentist.phone}</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <span className="text-muted-foreground">{offer.dentist.address}</span>
                      </div>
                    </div>

                    <Button className="w-full" size="lg">
                      <Calendar className="h-4 w-4 mr-2" />
                      Book Appointment
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ) : (
          // No offers available - show email collection
          <div className="max-w-lg mx-auto">
            <Card className="text-center p-8">
              <CardHeader>
                <CardTitle className="text-2xl mb-4">
                  No offers available yet in {cityName}
                </CardTitle>
                <CardDescription className="text-lg">
                  Be the first to know when dental offers become available in your area.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <Input
                    type="email"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-12 text-center text-lg"
                  />
                  <Button 
                    onClick={handleEmailSubscribe}
                    className="w-full h-12 text-lg"
                    disabled={!email || subscribing}
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    {subscribing ? 'Subscribing...' : 'Notify Me of New Offers'}
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  We'll email you as soon as dentists in {cityName} start offering deals.
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Dentist Listings Section */}
        {dentists.length > 0 && (
          <div className="mt-16">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-2">Dentists in {cityName}</h2>
              <p className="text-muted-foreground">
                {dentists.length} dental practices with verified profiles
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {dentists.map((dentist) => (
                <Link 
                  key={dentist.id} 
                  to={`/dentist/${dentist.place_id}`}
                  className="block"
                >
                  <Card className="h-full hover:shadow-lg transition-all hover:border-primary/50">
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start gap-2">
                        <CardTitle className="text-lg leading-tight">
                          {dentist.business_name}
                        </CardTitle>
                        <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                      </div>
                      {dentist.rating && (
                        <div className="flex items-center gap-1 text-sm">
                          <Star className="h-4 w-4 text-primary fill-primary" />
                          <span className="font-medium">{dentist.rating}</span>
                          {dentist.review_count && (
                            <span className="text-muted-foreground">
                              ({dentist.review_count} reviews)
                            </span>
                          )}
                        </div>
                      )}
                    </CardHeader>
                    <CardContent className="pt-0">
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {dentist.seo_description || 'Professional dental care services'}
                      </p>
                      <div className="flex flex-wrap gap-2 mt-3">
                        {dentist.phone && (
                          <Badge variant="outline" className="text-xs">
                            <Phone className="h-3 w-3 mr-1" />
                            Has Phone
                          </Badge>
                        )}
                        {dentist.website && (
                          <Badge variant="outline" className="text-xs">
                            <Globe className="h-3 w-3 mr-1" />
                            Has Website
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* SEO Content Section */}
        <div className="mt-16 max-w-4xl mx-auto">
          <div className="bg-card rounded-lg p-8 shadow-sm border">
            <h2 className="text-2xl font-bold mb-6">Why Choose Professional Dental Cleaning in {cityName}?</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold mb-3">Health Benefits</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• Prevent gum disease and tooth decay</li>
                  <li>• Remove plaque and tartar buildup</li>
                  <li>• Early detection of oral health issues</li>
                  <li>• Fresher breath and brighter smile</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-3">Local Advantages</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• Trusted {cityName} dental professionals</li>
                  <li>• Convenient location and scheduling</li>
                  <li>• Competitive pricing and special offers</li>
                  <li>• Personalized care from local experts</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CityPage;