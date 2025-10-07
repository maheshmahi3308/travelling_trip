import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  User, 
  MapPin, 
  Calendar, 
  Heart, 
  Star,
  Plane,
  Clock,
  Edit,
  Loader2,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Booking {
  id: string;
  start_date: string;
  end_date: string;
  status: string;
  destinations: {
    name: string;
    image_url: string | null;
  } | null;
}

const Profile = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchUserData();
    }
  }, [user]);

  const fetchUserData = async () => {
    try {
      const { data: bookingsData, error } = await supabase
        .from("bookings")
        .select(`
          *,
          destinations (name, image_url)
        `)
        .order("start_date", { ascending: true });

      if (error) throw error;
      setBookings(bookingsData || []);
    } catch (error: any) {
      toast.error("Failed to load profile data");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getDaysDifference = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const userStats = [
    { label: "Trips Completed", value: bookings.filter(b => b.status === "confirmed" && new Date(b.end_date) < new Date()).length.toString(), icon: Plane },
    { label: "Upcoming Trips", value: bookings.filter(b => b.status === "confirmed" && new Date(b.start_date) > new Date()).length.toString(), icon: Calendar },
    { label: "Countries Visited", value: "8", icon: MapPin },
    { label: "Saved Destinations", value: "24", icon: Heart },
  ];

  const upcomingTrips = bookings.filter(b => 
    b.status === "confirmed" && new Date(b.start_date) > new Date()
  );

  const pastTrips = bookings.filter(b => 
    b.status === "confirmed" && new Date(b.end_date) < new Date()
  );

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Profile Header */}
        <Card className="mb-8 border-border shadow-soft animate-fade-in-up">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                  <Avatar className="h-24 w-24">
                    <AvatarFallback className="gradient-ocean text-white text-3xl font-bold">
                      {user?.email?.charAt(0).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 text-center md:text-left">
                    <div className="flex flex-col md:flex-row md:items-center gap-3 mb-2">
                      <h1 className="text-3xl font-bold">{user?.email?.split("@")[0] || "Traveler"}</h1>
                  <Badge variant="secondary" className="w-fit mx-auto md:mx-0">
                    Travel Enthusiast
                  </Badge>
                </div>
                <p className="text-muted-foreground mb-4">
                  Adventure seeker | Culture lover | Always planning the next trip
                </p>
                <div className="flex flex-wrap gap-4 justify-center md:justify-start text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    San Francisco, CA
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    Joined January 2023
                  </span>
                </div>
              </div>
              <Button variant="outline" className="gap-2">
                <Edit className="h-4 w-4" />
                Edit Profile
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {userStats.map((stat, index) => (
            <Card
              key={stat.label}
              className="border-border shadow-soft hover:shadow-medium transition-smooth animate-scale-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardContent className="p-6 text-center">
                <stat.icon className="h-8 w-8 mx-auto mb-2 text-primary" />
                <div className="text-3xl font-bold gradient-ocean bg-clip-text text-transparent mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tabs */}
        <Tabs defaultValue="upcoming" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="upcoming">Upcoming Trips</TabsTrigger>
            <TabsTrigger value="past">Past Trips</TabsTrigger>
            <TabsTrigger value="saved">Saved</TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="space-y-4">
            {upcomingTrips.length === 0 ? (
              <Card className="border-border shadow-soft">
                <CardContent className="p-12 text-center">
                  <Calendar className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <h3 className="text-xl font-semibold mb-2">No upcoming trips</h3>
                  <p className="text-muted-foreground mb-4">Start planning your next adventure!</p>
                  <Button variant="hero" asChild>
                    <a href="/planner">Plan a Trip</a>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              upcomingTrips.map((trip) => (
              <Card key={trip.id} className="border-border shadow-soft hover:shadow-medium transition-smooth">
                <CardContent className="p-0">
                  <div className="flex flex-col md:flex-row">
                    <div className="md:w-48 h-48 md:h-auto">
                      <img
                        src={trip.destinations?.image_url || ""}
                        alt={trip.destinations?.name || "Destination"}
                        className="w-full h-full object-cover rounded-t-lg md:rounded-l-lg md:rounded-t-none"
                        onError={(e) => {
                          e.currentTarget.src = "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800";
                        }}
                      />
                    </div>
                    <div className="flex-1 p-6">
                      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
                        <div>
                          <h3 className="text-xl font-semibold mb-2">{trip.destinations?.name || "Unknown Destination"}</h3>
                          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {new Date(trip.start_date).toLocaleDateString()}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {getDaysDifference(trip.start_date, trip.end_date)} days
                            </span>
                          </div>
                        </div>
                        <Badge
                          variant={trip.status === "confirmed" ? "default" : "secondary"}
                        >
                          {trip.status.charAt(0).toUpperCase() + trip.status.slice(1)}
                        </Badge>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="default">View Details</Button>
                        <Button variant="outline">Modify Booking</Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
            )}
          </TabsContent>

          <TabsContent value="past" className="space-y-4">
            {pastTrips.length === 0 ? (
              <Card className="border-border shadow-soft">
                <CardContent className="p-12 text-center">
                  <Star className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <h3 className="text-xl font-semibold mb-2">No past trips yet</h3>
                  <p className="text-muted-foreground">Your travel memories will appear here</p>
                </CardContent>
              </Card>
            ) : (
              pastTrips.map((trip) => (
              <Card key={trip.id} className="border-border shadow-soft hover:shadow-medium transition-smooth">
                <CardContent className="p-0">
                  <div className="flex flex-col md:flex-row">
                    <div className="md:w-48 h-48 md:h-auto">
                      <img
                        src={trip.destinations?.image_url || ""}
                        alt={trip.destinations?.name || "Destination"}
                        className="w-full h-full object-cover rounded-t-lg md:rounded-l-lg md:rounded-t-none"
                        onError={(e) => {
                          e.currentTarget.src = "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800";
                        }}
                      />
                    </div>
                    <div className="flex-1 p-6">
                      <h3 className="text-xl font-semibold mb-2">{trip.destinations?.name || "Unknown Destination"}</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        {new Date(trip.end_date).toLocaleDateString()}
                      </p>
                      <div className="flex gap-2">
                        <Button variant="outline">Write Review</Button>
                        <Button variant="ghost">View Photos</Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
            )}
          </TabsContent>

          <TabsContent value="saved">
            <Card className="border-border shadow-soft">
              <CardContent className="p-12 text-center">
                <Heart className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-xl font-semibold mb-2">No saved destinations yet</h3>
                <p className="text-muted-foreground mb-4">Start exploring and save your favorite places!</p>
                <Button variant="hero" asChild>
                  <a href="/destinations">Browse Destinations</a>
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Profile;
