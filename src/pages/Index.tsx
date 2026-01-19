import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, MapPin } from "lucide-react";

const Index = () => {
  const [cityInput, setCityInput] = useState("");
  const navigate = useNavigate();

  const handleSearch = () => {
    if (cityInput.trim()) {
      const citySlug = cityInput.toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-');
      navigate(`/${citySlug}`);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <header className="text-center mb-16">
          <div className="flex items-center justify-center gap-2 mb-4">
            <MapPin className="h-8 w-8 text-primary" />
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Dentist.Deals
            </h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Find exclusive dental hygiene offers in your city.
          </p>
        </header>

        {/* Main Search */}
        <div className="max-w-lg mx-auto">
          <div className="bg-card rounded-2xl p-8 shadow-lg border border-border/50">
            <h2 className="text-2xl font-semibold text-center mb-6">
              Enter Your City
            </h2>
            <div className="space-y-4">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="e.g., New York, Los Angeles..."
                  value={cityInput}
                  onChange={(e) => setCityInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="pl-12 h-14 text-lg rounded-xl"
                />
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              </div>
              <Button 
                onClick={handleSearch}
                className="w-full h-14 text-lg rounded-xl bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary"
                disabled={!cityInput.trim()}
              >
                Find Dental Offers
              </Button>
            </div>
          </div>
        </div>

        {/* Dentist Portal Link */}
        <div className="text-center mt-8">
          <Button 
            variant="outline" 
            onClick={() => navigate('/auth')}
            className="hover:bg-primary/5 hover:border-primary/30"
          >
            Are you a dentist? Join our platform
          </Button>
        </div>

        {/* Popular Cities */}
        <div className="max-w-2xl mx-auto mt-12">
          <h3 className="text-lg font-medium text-center mb-6 text-muted-foreground">
            Popular Cities
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {["New York", "Los Angeles", "Chicago", "Houston", "Phoenix", "Philadelphia", "San Antonio", "San Diego"].map((city) => (
              <Button
                key={city}
                variant="outline"
                className="h-12 rounded-lg hover:bg-primary/5 hover:border-primary/30"
                onClick={() => {
                  setCityInput(city);
                  const citySlug = city.toLowerCase().replace(/\s+/g, '-');
                  navigate(`/${citySlug}`);
                }}
              >
                {city}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
