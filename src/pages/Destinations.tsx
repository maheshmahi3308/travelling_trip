import { useState, useEffect } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Star, Search, MapPin, TrendingUp, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { BookingDialog } from "@/components/BookingDialog";

interface Destination {
  id: string;
  name: string;
  country: string;
  description: string | null;
  image_url: string | null;
  price: number;
  type: string;
  rating: number;
  review_count: number;
  trending: boolean;
}

const Destinations = () => {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const [priceRange, setPriceRange] = useState("all");
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false);
  const [selectedDestination, setSelectedDestination] = useState<Destination | null>(null);

  useEffect(() => {
    fetchDestinations();
  }, []);

  const fetchDestinations = async () => {
    try {
      const { data, error } = await supabase
        .from("destinations")
        .select("*")
        .order("trending", { ascending: false });

      if (error) throw error;
      setDestinations(data || []);
    } catch (error: any) {
      toast.error("Failed to load destinations");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const filteredDestinations = destinations.filter((dest) => {
    const matchesSearch = dest.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCountry = selectedCountry === "all" || dest.country === selectedCountry;
    const matchesType = selectedType === "all" || dest.type === selectedType;
    const matchesPrice =
      priceRange === "all" ||
      (priceRange === "low" && dest.price < 1000) ||
      (priceRange === "medium" && dest.price >= 1000 && dest.price < 1500) ||
      (priceRange === "high" && dest.price >= 1500);

    return matchesSearch && matchesCountry && matchesType && matchesPrice;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in-up">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Explore <span className="gradient-ocean bg-clip-text text-transparent">Destinations</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Discover amazing places around the world for your next adventure
          </p>
        </div>

        {/* Filters */}
        <div className="bg-card border border-border rounded-lg p-6 mb-8 shadow-soft animate-scale-in">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search destinations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={selectedCountry} onValueChange={setSelectedCountry}>
              <SelectTrigger>
                <SelectValue placeholder="Select Country" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Countries</SelectItem>
                <SelectItem value="France">France</SelectItem>
                <SelectItem value="Japan">Japan</SelectItem>
                <SelectItem value="Greece">Greece</SelectItem>
                <SelectItem value="Peru">Peru</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger>
                <SelectValue placeholder="Trip Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="City">City</SelectItem>
                <SelectItem value="Beach">Beach</SelectItem>
                <SelectItem value="Cultural">Cultural</SelectItem>
                <SelectItem value="Adventure">Adventure</SelectItem>
              </SelectContent>
            </Select>

            <Select value={priceRange} onValueChange={setPriceRange}>
              <SelectTrigger>
                <SelectValue placeholder="Price Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Prices</SelectItem>
                <SelectItem value="low">Under $1,000</SelectItem>
                <SelectItem value="medium">$1,000 - $1,500</SelectItem>
                <SelectItem value="high">Above $1,500</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6 text-muted-foreground">
          Showing <span className="font-semibold text-foreground">{filteredDestinations.length}</span> destinations
        </div>

        {/* Destinations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDestinations.map((destination, index) => (
            <Card
              key={destination.id}
              className="group overflow-hidden border-border hover:shadow-large transition-smooth cursor-pointer animate-scale-in"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div className="relative h-56 overflow-hidden">
                <img
                  src={destination.image_url || ""}
                  alt={destination.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-smooth"
                  onError={(e) => {
                    e.currentTarget.src = "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800";
                  }}
                />
                {destination.trending && (
                  <Badge className="absolute top-3 right-3 bg-secondary text-secondary-foreground">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    Trending
                  </Badge>
                )}
                <Badge className="absolute top-3 left-3 bg-accent text-accent-foreground">
                  {destination.type}
                </Badge>
              </div>
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-semibold text-xl mb-1">{destination.name}</h3>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      <span>{destination.country}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-sm text-muted-foreground mb-3">
                  <Star className="h-4 w-4 fill-secondary text-secondary" />
                  <span className="font-medium text-foreground">{destination.rating}</span>
                  <span>({destination.review_count} reviews)</span>
                </div>
                <div className="text-2xl font-bold gradient-ocean bg-clip-text text-transparent">
                  ${destination.price.toFixed(2)}
                </div>
                <p className="text-xs text-muted-foreground">per person</p>
              </CardContent>
              <CardFooter className="p-5 pt-0">
                <Button 
                  variant="default" 
                  className="w-full"
                  onClick={() => {
                    setSelectedDestination(destination);
                    setBookingDialogOpen(true);
                  }}
                >
                  Book Now
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        {filteredDestinations.length === 0 && (
          <div className="text-center py-20">
            <MapPin className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-xl font-semibold mb-2">No destinations found</h3>
            <p className="text-muted-foreground">Try adjusting your filters to see more results</p>
          </div>
        )}
      </div>

      {selectedDestination && (
        <BookingDialog
          open={bookingDialogOpen}
          onOpenChange={setBookingDialogOpen}
          destination={selectedDestination}
        />
      )}
    </div>
  );
};

export default Destinations;
