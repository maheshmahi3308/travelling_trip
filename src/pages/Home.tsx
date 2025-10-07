import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Star, Calendar, TrendingUp, Loader2 } from "lucide-react";
import heroImage from "@/assets/hero-beach.jpg";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Destination {
  id: string;
  name: string;
  image_url: string | null;
  rating: number;
  review_count: number;
  price: number;
  type: string;
  trending: boolean;
}

const Home = () => {
  const [featuredDestinations, setFeaturedDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeaturedDestinations();
  }, []);

  const fetchFeaturedDestinations = async () => {
    try {
      const { data, error } = await supabase
        .from("destinations")
        .select("*")
        .limit(4)
        .order("trending", { ascending: false });

      if (error) throw error;
      setFeaturedDestinations(data || []);
    } catch (error: any) {
      toast.error("Failed to load destinations");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[600px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={heroImage}
            alt="Travel Hero"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 gradient-overlay" />
        </div>
        
        <div className="relative z-10 text-center text-white px-4 max-w-4xl mx-auto animate-fade-in-up">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            Discover Your Next
            <span className="block gradient-sunset bg-clip-text text-transparent">
              Adventure
            </span>
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-white/90 max-w-2xl mx-auto">
            Explore breathtaking destinations, plan unforgettable trips, and create memories that last a lifetime
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="hero" size="lg" asChild>
              <Link to="/destinations">
                Explore Destinations
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" className="bg-white/10 backdrop-blur border-white text-white hover:bg-white/20" asChild>
              <Link to="/planner">
                Plan Your Trip
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-5xl mx-auto">
            {[
              { label: "Destinations", value: "1000+" },
              { label: "Happy Travelers", value: "50K+" },
              { label: "Countries", value: "150+" },
              { label: "Reviews", value: "25K+" },
            ].map((stat, index) => (
              <div key={index} className="text-center animate-scale-in" style={{ animationDelay: `${index * 0.1}s` }}>
                <div className="text-3xl md:text-4xl font-bold gradient-ocean bg-clip-text text-transparent mb-2">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Destinations */}
      <section className="py-20 container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">Featured Destinations</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Discover our handpicked selection of the world's most stunning locations
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {featuredDestinations.map((destination, index) => (
            <Card
              key={destination.id}
              className="group overflow-hidden border-border hover:shadow-large transition-smooth cursor-pointer animate-scale-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="relative h-48 overflow-hidden">
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
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-lg">{destination.name}</h3>
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
              <CardFooter className="p-4 pt-0">
                <Button variant="default" className="w-full" asChild>
                  <Link to={`/destinations`}>
                    Book Now
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <Button variant="outline" size="lg" asChild>
            <Link to="/destinations">
              View All Destinations
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
          </>
        )}
      </section>

      {/* CTA Section */}
      <section className="py-20 gradient-tropical">
        <div className="container mx-auto px-4 text-center text-white">
          <Calendar className="h-16 w-16 mx-auto mb-6 opacity-90" />
          <h2 className="text-4xl font-bold mb-4">Ready to Start Your Journey?</h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Join thousands of travelers who trust us to make their dream vacations a reality
          </p>
          <Button variant="hero" size="lg" className="bg-white text-primary hover:bg-white/90" asChild>
            <Link to="/planner">
              Create Your Trip
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Home;
