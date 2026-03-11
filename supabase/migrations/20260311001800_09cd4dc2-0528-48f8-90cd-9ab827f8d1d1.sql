
CREATE TABLE public.user_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reviewer_id uuid NOT NULL,
  reviewed_user_id uuid NOT NULL,
  rating integer NOT NULL,
  comment text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT rating_range CHECK (rating >= 1 AND rating <= 5),
  CONSTRAINT no_self_review CHECK (reviewer_id != reviewed_user_id),
  UNIQUE (reviewer_id, reviewed_user_id)
);

ALTER TABLE public.user_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "User reviews are viewable by everyone"
  ON public.user_reviews FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create user reviews"
  ON public.user_reviews FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = reviewer_id);
