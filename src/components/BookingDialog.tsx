import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Users, DollarSign } from "lucide-react";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

interface BookingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  destination: {
    id: string;
    name: string;
    price: number;
  };
}

export const BookingDialog = ({ open, onOpenChange, destination }: BookingDialogProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [travelers, setTravelers] = useState(1);
  const [loading, setLoading] = useState(false);

  const calculateTotalPrice = () => {
    if (!startDate || !endDate) return 0;
    const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    return destination.price * travelers * (days > 0 ? days : 1);
  };

  const handleBooking = async () => {
    if (!user) {
      toast.error("Please sign in to book");
      navigate("/auth");
      return;
    }

    if (!startDate || !endDate) {
      toast.error("Please select both start and end dates");
      return;
    }

    if (startDate >= endDate) {
      toast.error("End date must be after start date");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from("bookings").insert({
        destination_id: destination.id,
        user_id: user.id,
        start_date: format(startDate, "yyyy-MM-dd"),
        end_date: format(endDate, "yyyy-MM-dd"),
        travelers,
        total_price: calculateTotalPrice(),
        status: "pending",
      });

      if (error) throw error;

      toast.success("Booking created successfully!");
      onOpenChange(false);
      navigate("/profile");
    } catch (error: any) {
      toast.error("Failed to create booking");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Book {destination.name}</DialogTitle>
          <DialogDescription>
            Complete your booking details below
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Start Date */}
          <div className="space-y-2">
            <Label>Start Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {startDate ? format(startDate, "PPP") : "Select start date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={setStartDate}
                  disabled={(date) => date < new Date()}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* End Date */}
          <div className="space-y-2">
            <Label>End Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {endDate ? format(endDate, "PPP") : "Select end date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={endDate}
                  onSelect={setEndDate}
                  disabled={(date) => !startDate || date <= startDate}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Number of Travelers */}
          <div className="space-y-2">
            <Label>Number of Travelers</Label>
            <div className="relative">
              <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="number"
                min="1"
                max="20"
                value={travelers}
                onChange={(e) => setTravelers(Math.max(1, parseInt(e.target.value) || 1))}
                className="pl-10"
              />
            </div>
          </div>

          {/* Total Price */}
          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Price per person</span>
              <span className="font-medium">${destination.price}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Travelers</span>
              <span className="font-medium">{travelers}</span>
            </div>
            {startDate && endDate && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Days</span>
                <span className="font-medium">
                  {Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))}
                </span>
              </div>
            )}
            <div className="pt-2 border-t border-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-primary" />
                <span className="font-semibold">Total Price</span>
              </div>
              <span className="text-2xl font-bold gradient-ocean bg-clip-text text-transparent">
                ${calculateTotalPrice().toFixed(2)}
              </span>
            </div>
          </div>

          <Button 
            onClick={handleBooking} 
            disabled={loading || !startDate || !endDate}
            className="w-full"
          >
            {loading ? "Processing..." : "Confirm Booking"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
