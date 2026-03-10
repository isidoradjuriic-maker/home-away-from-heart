import { useState } from "react";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { format } from "date-fns";

interface ReviewSectionProps {
  propertyId: string;
  isDbProperty: boolean;
}

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

const ReviewSection = ({ propertyId, isDbProperty }: ReviewSectionProps) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [newRating, setNewRating] = useState(0);
  const [newComment, setNewComment] = useState("");

  // Fetch reviews with reviewer profile
  const { data: reviews } = useQuery({
    queryKey: ["reviews", propertyId],
    queryFn: async () => {
      const { data } = await supabase
        .from("reviews")
        .select("*")
        .eq("property_id", propertyId)
        .order("created_at", { ascending: false });
      if (!data) return [];
      // Fetch reviewer profiles
      const reviewerIds = [...new Set(data.map((r) => r.reviewer_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, first_name, last_name")
        .in("user_id", reviewerIds);
      const profileMap = new Map(profiles?.map((p) => [p.user_id, p]) ?? []);
      return data.map((r) => ({
        ...r,
        reviewer: profileMap.get(r.reviewer_id),
      }));
    },
    enabled: isDbProperty,
  });

  // Check if user has a completed booking they can review
  const { data: reviewableBooking } = useQuery({
    queryKey: ["reviewable-booking", propertyId, user?.id],
    queryFn: async () => {
      if (!user) return null;
      // Find accepted bookings where check_out is in the past
      const { data: bookings } = await supabase
        .from("bookings")
        .select("id")
        .eq("property_id", propertyId)
        .eq("guest_id", user.id)
        .eq("status", "accepted")
        .lte("check_out", new Date().toISOString().split("T")[0]);
      if (!bookings?.length) return null;
      // Check if already reviewed any of these
      const bookingIds = bookings.map((b) => b.id);
      const { data: existingReviews } = await supabase
        .from("reviews")
        .select("booking_id")
        .eq("reviewer_id", user.id)
        .in("booking_id", bookingIds);
      const reviewedIds = new Set(existingReviews?.map((r) => r.booking_id) ?? []);
      return bookings.find((b) => !reviewedIds.has(b.id)) ?? null;
    },
    enabled: isDbProperty && !!user,
  });

  const submitReview = useMutation({
    mutationFn: async () => {
      if (!user || !reviewableBooking) throw new Error("Cannot submit review");
      if (newRating === 0) throw new Error("Please select a rating");
      const { error } = await supabase.from("reviews").insert({
        property_id: propertyId,
        reviewer_id: user.id,
        booking_id: reviewableBooking.id,
        rating: newRating,
        comment: newComment.trim() || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Review submitted!");
      setNewRating(0);
      setNewComment("");
      queryClient.invalidateQueries({ queryKey: ["reviews", propertyId] });
      queryClient.invalidateQueries({ queryKey: ["reviewable-booking", propertyId] });
      queryClient.invalidateQueries({ queryKey: ["property-reviews-avg"] });
    },
    onError: (e: any) => toast.error(e.message),
  });

  const avgRating =
    reviews && reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

  if (!isDbProperty) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <h3 className="font-heading text-lg font-semibold">Reviews</h3>
        {reviews && reviews.length > 0 && (
          <div className="flex items-center gap-2">
            <StarRating rating={Math.round(avgRating)} />
            <span className="text-sm font-medium">{avgRating.toFixed(1)}</span>
            <span className="text-sm text-muted-foreground">
              ({reviews.length} review{reviews.length !== 1 && "s"})
            </span>
          </div>
        )}
      </div>

      {/* Submit review form */}
      {reviewableBooking && (
        <div className="bg-secondary/30 rounded-xl p-5 space-y-3">
          <p className="text-sm font-medium">Leave a review for your stay</p>
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

      {/* Reviews list */}
      {reviews && reviews.length > 0 ? (
        <div className="space-y-4">
          {reviews.map((review) => (
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
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">No reviews yet.</p>
      )}
    </div>
  );
};

export default ReviewSection;
