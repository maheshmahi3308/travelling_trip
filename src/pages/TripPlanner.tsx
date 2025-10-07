import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar, MapPin, Users, DollarSign, Plane, Plus, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface Activity {
  id: number;
  name: string;
  time: string;
}

const TripPlanner = () => {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activities, setActivities] = useState<Activity[]>([
    { id: 1, name: "", time: "" },
  ]);
  const [formData, setFormData] = useState({
    destination: "",
    tripType: "",
    startDate: "",
    endDate: "",
    travelers: "2",
    budget: "",
    notes: "",
  });

  const addActivity = () => {
    setActivities([...activities, { id: Date.now(), name: "", time: "" }]);
  };

  const removeActivity = (id: number) => {
    setActivities(activities.filter((activity) => activity.id !== id));
  };

  const updateActivity = (id: number, field: "name" | "time", value: string) => {
    setActivities(activities.map(activity => 
      activity.id === id ? { ...activity, [field]: value } : activity
    ));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error("Please login to create a trip plan");
      return;
    }

    // Validate required fields
    if (!formData.destination || !formData.tripType || !formData.startDate || 
        !formData.endDate || !formData.budget) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase.from("trip_plans").insert([{
        user_id: user.id,
        destination: formData.destination,
        trip_type: formData.tripType,
        start_date: formData.startDate,
        end_date: formData.endDate,
        travelers: parseInt(formData.travelers),
        budget: formData.budget,
        notes: formData.notes || null,
        activities: activities.filter(a => a.name || a.time) as any,
      }]);

      if (error) throw error;

      toast.success("Trip plan saved successfully!");
      
      // Reset form
      setFormData({
        destination: "",
        tripType: "",
        startDate: "",
        endDate: "",
        travelers: "2",
        budget: "",
        notes: "",
      });
      setActivities([{ id: 1, name: "", time: "" }]);
    } catch (error: any) {
      toast.error("Failed to save trip plan");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-12 animate-fade-in-up">
          <div className="gradient-ocean w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Plane className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Plan Your <span className="gradient-tropical bg-clip-text text-transparent">Dream Trip</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Create a custom itinerary tailored to your preferences and budget
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 animate-scale-in">
          {/* Basic Information */}
          <Card className="border-border shadow-soft">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                Trip Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="destination">Destination</Label>
                  <Input id="destination" placeholder="Where do you want to go?" required 
                    value={formData.destination} onChange={(e) => setFormData({...formData, destination: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="trip-type">Trip Type</Label>
                  <Select required value={formData.tripType} onValueChange={(value) => setFormData({...formData, tripType: value})}>
                    <SelectTrigger id="trip-type">
                      <SelectValue placeholder="Select trip type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beach">Beach</SelectItem>
                      <SelectItem value="city">City</SelectItem>
                      <SelectItem value="cultural">Cultural</SelectItem>
                      <SelectItem value="adventure">Adventure</SelectItem>
                      <SelectItem value="relaxation">Relaxation</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start-date">Start Date</Label>
                  <Input id="start-date" type="date" required value={formData.startDate} onChange={(e) => setFormData({...formData, startDate: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end-date">End Date</Label>
                  <Input id="end-date" type="date" required value={formData.endDate} onChange={(e) => setFormData({...formData, endDate: e.target.value})} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="travelers" className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Number of Travelers
                  </Label>
                  <Input id="travelers" type="number" min="1" value={formData.travelers} onChange={(e) => setFormData({...formData, travelers: e.target.value})} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="budget" className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Budget (per person)
                  </Label>
                  <Select required value={formData.budget} onValueChange={(value) => setFormData({...formData, budget: value})}>
                    <SelectTrigger id="budget">
                      <SelectValue placeholder="Select budget" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Under $1,000</SelectItem>
                      <SelectItem value="medium">$1,000 - $3,000</SelectItem>
                      <SelectItem value="high">$3,000 - $5,000</SelectItem>
                      <SelectItem value="luxury">Above $5,000</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Activities */}
          <Card className="border-border shadow-soft">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Daily Activities
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {activities.map((activity, index) => (
                <div key={activity.id} className="flex gap-3 items-end">
                  <div className="flex-1 space-y-2">
                    <Label htmlFor={`activity-${activity.id}`}>
                      Activity {index + 1}
                    </Label>
                    <Input
                      id={`activity-${activity.id}`}
                      placeholder="e.g., Visit Eiffel Tower"
                      value={activity.name}
                      onChange={(e) => updateActivity(activity.id, "name", e.target.value)}
                    />
                  </div>
                  <div className="w-32 space-y-2">
                    <Label htmlFor={`time-${activity.id}`}>Time</Label>
                    <Input
                      id={`time-${activity.id}`}
                      type="time"
                      value={activity.time}
                      onChange={(e) => updateActivity(activity.id, "time", e.target.value)}
                    />
                  </div>
                  {activities.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeActivity(activity.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  )}
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={addActivity}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Activity
              </Button>
            </CardContent>
          </Card>

          {/* Additional Notes */}
          <Card className="border-border shadow-soft">
            <CardHeader>
              <CardTitle>Additional Preferences</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="notes">Special Requests or Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Any dietary restrictions, accessibility needs, or special interests?"
                  rows={4}
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                />
              </div>
            </CardContent>
          </Card>

          {/* Submit */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Button type="submit" variant="hero" size="lg" className="flex-1" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Create My Itinerary"
              )}
            </Button>
            <Button type="button" variant="outline" size="lg" disabled={isSubmitting}>
              Save Draft
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TripPlanner;
