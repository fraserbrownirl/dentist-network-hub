import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LogOut, Plus, Users, DollarSign, TrendingUp, Edit } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { LeadGenerationDashboard } from "@/components/LeadGenerationDashboard";

const DashboardPage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [dentistProfile, setDentistProfile] = useState<any>(null);
  const [offers, setOffers] = useState<any[]>([]);
  const [subscribers, setSubscribers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuthAndLoadData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        navigate('/auth');
        return;
      }

      setUser(session.user);
      await loadDentistData(session.user.id);
    };

    checkAuthAndLoadData();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session?.user) {
        navigate('/auth');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const loadDentistData = async (userId: string) => {
    try {
      // Get dentist profile
      const { data: dentist } = await supabase
        .from('dentists')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (dentist) {
        setDentistProfile(dentist);

        // Get offers
        const { data: offersData } = await supabase
          .from('offers')
          .select('*')
          .eq('dentist_id', dentist.id);

        setOffers(offersData || []);

        // Get subscribers for this dentist's offers
        const { data: subscribersData } = await supabase
          .from('subscribers')
          .select('*')
          .in('offer_id', offersData?.map(o => o.id) || []);

        setSubscribers(subscribersData || []);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
    toast.success("Logged out successfully");
  };

  const totalRevenue = offers.reduce((sum, offer) => 
    sum + (offer.current_subscribers * offer.price), 0
  );

  const totalSubscribers = offers.reduce((sum, offer) => 
    sum + offer.current_subscribers, 0
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!dentistProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Complete Your Profile</CardTitle>
            <CardDescription>
              Please complete your dentist profile to access the dashboard.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/profile-setup')} className="w-full">
              Setup Profile
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back, {dentistProfile.contact_name}
            </p>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Offers</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{offers.filter(o => o.is_active).length}</div>
              <p className="text-xs text-muted-foreground">
                {offers.length} total offers
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Subscribers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalSubscribers}</div>
              <p className="text-xs text-muted-foreground">
                Across all offers
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalRevenue.toFixed(0)}</div>
              <p className="text-xs text-muted-foreground">
                From current offers
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="offers" className="space-y-6">
          <TabsList>
            <TabsTrigger value="offers">My Offers</TabsTrigger>
            <TabsTrigger value="subscribers">Subscribers</TabsTrigger>
            <TabsTrigger value="leads">Lead Generation</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
          </TabsList>

          <TabsContent value="offers" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Your Offers</h2>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create New Offer
              </Button>
            </div>

            {offers.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <p className="text-muted-foreground mb-4">
                    You haven't created any offers yet.
                  </p>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Offer
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6">
                {offers.map((offer) => (
                  <Card key={offer.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            {offer.title}
                            <Badge variant={offer.is_active ? "default" : "secondary"}>
                              {offer.is_active ? "Active" : "Inactive"}
                            </Badge>
                          </CardTitle>
                          <CardDescription>{offer.description}</CardDescription>
                        </div>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Price</p>
                          <p className="font-semibold">${offer.price}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Duration</p>
                          <p className="font-semibold">{offer.duration_weeks} weeks</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Subscribers</p>
                          <p className="font-semibold">{offer.current_subscribers}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Revenue</p>
                          <p className="font-semibold">${(offer.current_subscribers * offer.price).toFixed(0)}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="subscribers">
            <h2 className="text-2xl font-bold mb-6">Subscribers</h2>
            <Card>
              <CardContent className="text-center py-12">
                <p className="text-muted-foreground">
                  Subscriber management coming soon...
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="leads">
            <LeadGenerationDashboard dentistId={dentistProfile.id} />
          </TabsContent>

          <TabsContent value="profile">
            <h2 className="text-2xl font-bold mb-6">Practice Profile</h2>
            <Card>
              <CardHeader>
                <CardTitle>{dentistProfile.practice_name}</CardTitle>
                <CardDescription>
                  Status: {dentistProfile.is_approved ? (
                    <Badge>Approved</Badge>
                  ) : (
                    <Badge variant="secondary">Pending Approval</Badge>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Contact Name</p>
                  <p className="font-medium">{dentistProfile.contact_name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{user?.email}</p>
                </div>
                {dentistProfile.phone && (
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p className="font-medium">{dentistProfile.phone}</p>
                  </div>
                )}
                {dentistProfile.address && (
                  <div>
                    <p className="text-sm text-muted-foreground">Address</p>
                    <p className="font-medium">{dentistProfile.address}</p>
                  </div>
                )}
                <Button variant="outline">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default DashboardPage;