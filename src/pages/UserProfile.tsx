import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Star, ArrowLeft, MapPin } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { format } from "date-fns";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const StarRating = ({
  rating,
  onRate,
  interactive = false,
  size = "sm",
}: {
  rating: number;
  onRate?: (r: number) => void;
  interactive?: boolean;
  size?: "sm" | "md";
}) => {
  const [hover, setHover] = useState(0);
  const cls = size === "md" ? "h-6 w-6" : "h-4 w-4";
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`${cls} transition-colors ${
            star <= (hover || rating)
              ? "fill-primary text-primary"
              : "text-muted-foreground/30"
          } ${interactive ? "cursor-pointer" : ""}`}
          onClick={() => interactive && onRate?.(star)}
          onMouseEnter={() => interactive && setHover(star)}
          onMouseLeave={() => interactive && setHover(0)}
        />
      ))}
    </div>
  );
};

const UserProfile = () => {
  const { userId } = useParams();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [newRating, setNewRating] = useState(0);
  const [newComment, setNewComment] = useState("");

  const { data: profile, isLoading } = useQuery({
    queryKey: ["user-profile", userId],
    queryFn: async () => {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", userId!)
        .single();
      return data;
    },
    enabled: !!userId,
  });

  const { data: userReviews } = useQuery({
    queryKey: ["user-reviews", userId],
    queryFn: async () => {
      const { data } = await supabase
        .from("user_reviews")
        .select("*")
        .eq("reviewed_user_id", userId!)
        .order("created_at", { ascending: false });
      if (!data) return [];
      const reviewerIds = [...new Set(data.map((r: any) => r.reviewer_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, first_name, last_name, avatar_url")
        .in("user_id", reviewerIds);
      const profileMap = new Map(profiles?.map((p) => [p.user_id, p]) ?? []);
      return data.map((r: any) => ({ ...r, reviewer: profileMap.get(r.reviewer_id) }));
    },
    enabled: !!userId,
  });

  const { data: existingReview } = useQuery({
    queryKey: ["my-user-review", userId, user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("user_reviews")
        .select("id")
        .eq("reviewer_id", user!.id)
        .eq("reviewed_user_id", userId!)
        .maybeSingle();
      return data;
    },
    enabled: !!user && !!userId && user.id !== userId,
  });

  const submitReview = useMutation({
    mutationFn: async () => {
      if (!user || !userId) throw new Error("Cannot submit review");
      if (newRating === 0) throw new Error("Please select a rating");
      const { error } = await supabase.from("user_reviews").insert({
        reviewer_id: user.id,
        reviewed_user_id: userId,
        rating: newRating,
        comment: newComment.trim() || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Review submitted!");
      setNewRating(0);
      setNewComment("");
      queryClient.invalidateQueries({ queryKey: ["user-reviews", userId] });
      queryClient.invalidateQueries({ queryKey: ["my-user-review", userId] });
    },
    onError: (e: any) => toast.error(e.message),
  });

  const avgRating =
    userReviews && userReviews.length > 0
      ? userReviews.reduce((sum: number, r: any) => sum + r.rating, 0) / userReviews.length
      : 0;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">User not found</p>
      </div>
    );
  }

  const fullName = `${profile.first_name || ""} ${profile.last_name || ""}`.trim() || "User";
  const canReview = user && user.id !== userId && !existingReview;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 container mx-auto px-4 md:px-8 pb-16 max-w-2xl">
        <Link
          to="/messages"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to messages
        </Link>

        {/* Profile Header */}
        <div className="bg-card rounded-2xl shadow-card p-6 mb-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={profile.avatar_url ?? ""} />
              <AvatarFallback className="text-lg">{fullName[0]}</AvatarFallback>
            </Avatar>
            <div>
              <h1 className="font-heading text-xl font-bold">{fullName}</h1>
              {profile.location && (
                <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                  <MapPin className="h-3.5 w-3.5" /> {profile.location}
                </p>
              )}
              {userReviews && userReviews.length > 0 && (
                <div className="flex items-center gap-2 mt-2">
                  <StarRating rating={Math.round(avgRating)} />
                  <span className="text-sm font-medium">{avgRating.toFixed(1)}</span>
                  <span className="text-sm text-muted-foreground">
                    ({userReviews.length} review{userReviews.length !== 1 && "s"})
                  </span>
                </div>
              )}
            </div>
          </div>
          {profile.bio && (
            <p className="text-sm text-muted-foreground mt-4 leading-relaxed">{profile.bio}</p>
          )}
        </div>

        {/* Leave a Review */}
        {canReview && (
          <div className="bg-secondary/30 rounded-xl p-5 space-y-3 mb-6">
            <p className="text-sm font-medium">Leave a review for {profile.first_name || "this user"}</p>
            <StarRating rating={newRating} onRate={setNewRating} interactive size="md" />
            <Textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Share your experience..."
              className="rounded-xl resize-none"
              maxLength={1000}
            />
            <Button
              onClick={() => submitReview.mutate()}
              disabled={submitReview.isPending || newRating === 0}
              className="rounded-xl"
            >
              {submitReview.isPending ? "Submitting..." : "Submit Review"}
            </Button>
          </div>
        )}

        {/* Reviews List */}
        <div className="space-y-4">
          <h3 className="font-heading text-lg font-semibold">Reviews</h3>
          {userReviews && userReviews.length > 0 ? (
            userReviews.map((review: any) => (
              <div key={review.id} className="border-b border-border pb-4 last:border-0">
                <div className="flex items-center gap-3 mb-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-xs">
                      {review.reviewer?.first_name?.[0] ?? "?"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">
                      {review.reviewer
                        ? `${review.reviewer.first_name ?? ""} ${review.reviewer.last_name ?? ""}`.trim() || "User"
                        : "User"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(review.created_at), "MMM d, yyyy")}
                    </p>
                  </div>
                </div>
                <StarRating rating={review.rating} />
                {review.comment && (
                  <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                    {review.comment}
                  </p>
                )}
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">No reviews yet.</p>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default UserProfile;
