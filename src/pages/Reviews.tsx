import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Star, MessageSquare, ThumbsUp, Send, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface Review {
  id: string;
  user_id: string;
  destination_id: string;
  rating: number;
  content: string;
  likes: number;
  created_at: string;
  profiles: {
    display_name: string | null;
  } | null;
  destinations: {
    name: string;
    type: string;
  } | null;
}

const Reviews = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [newReview, setNewReview] = useState("");
  const [newRating, setNewRating] = useState(5);
  const { user } = useAuth();

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const { data, error } = await supabase
        .from("reviews")
        .select(`
          *,
          profiles (display_name),
          destinations (name, type)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setReviews(data || []);
    } catch (error: any) {
      toast.error("Failed to load reviews");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const filteredReviews =
    selectedFilter === "all"
      ? reviews
      : reviews.filter((review) => review.destinations?.type === selectedFilter);

  const handleSubmitReview = async () => {
    if (!user) {
      toast.error("Please login to submit a review");
      return;
    }

    if (!newReview.trim()) {
      toast.error("Please write a review");
      return;
    }

    toast.info("Review feature coming soon! Connect it to a destination first.");
    setNewReview("");
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return "Today";
    if (diffInDays === 1) return "Yesterday";
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    return `${Math.floor(diffInDays / 30)} months ago`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="text-center mb-12 animate-fade-in-up">
          <div className="gradient-sunset w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <MessageSquare className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Community <span className="gradient-ocean bg-clip-text text-transparent">Reviews</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Real stories from real travelers. Share your adventures and inspire others!
          </p>
        </div>

        {/* Write Review Section */}
        <Card className="mb-8 border-border shadow-soft animate-scale-in">
          <CardHeader>
            <h3 className="text-xl font-semibold">Share Your Experience</h3>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="Tell us about your recent trip..."
              value={newReview}
              onChange={(e) => setNewReview(e.target.value)}
              rows={4}
            />
            <div className="flex justify-between items-center">
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-6 w-6 cursor-pointer transition-smooth ${
                      star <= newRating
                        ? "text-secondary fill-secondary"
                        : "text-muted"
                    } hover:scale-110`}
                    onClick={() => setNewRating(star)}
                  />
                ))}
              </div>
              <Button variant="hero" onClick={handleSubmitReview}>
                <Send className="h-4 w-4 mr-2" />
                Post Review
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Filter */}
        <div className="flex justify-between items-center mb-6">
          <div className="text-muted-foreground">
            <span className="font-semibold text-foreground">{filteredReviews.length}</span> reviews
          </div>
          <Select value={selectedFilter} onValueChange={setSelectedFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="City">City</SelectItem>
              <SelectItem value="Beach">Beach</SelectItem>
              <SelectItem value="Cultural">Cultural</SelectItem>
              <SelectItem value="Adventure">Adventure</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Reviews List */}
        <div className="space-y-6">
          {filteredReviews.map((review, index) => (
            <Card
              key={review.id}
              className="border-border shadow-soft hover:shadow-medium transition-smooth animate-scale-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="gradient-ocean text-white font-semibold">
                      {review.profiles?.display_name?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-semibold text-lg">{review.profiles?.display_name || "Anonymous"}</h4>
                        <p className="text-sm text-muted-foreground">{getTimeAgo(review.created_at)}</p>
                      </div>
                      <Badge variant="secondary">{review.destinations?.type || "Travel"}</Badge>
                    </div>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < review.rating
                                ? "text-secondary fill-secondary"
                                : "text-muted"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm font-medium text-primary">
                        {review.destinations?.name || "Unknown Destination"}
                      </span>
                    </div>
                    <p className="text-muted-foreground mb-4 leading-relaxed">
                      {review.content}
                    </p>
                    <div className="flex items-center gap-4">
                      <Button variant="ghost" size="sm" className="gap-2">
                        <ThumbsUp className="h-4 w-4" />
                        <span>{review.likes}</span>
                      </Button>
                      <Button variant="ghost" size="sm">
                        Reply
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Reviews;
