import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Star } from "lucide-react";
import { useVendorReviews } from "@/hooks/useVendorReviews";
import { format } from "date-fns";

interface VendorReviewsProps {
  vendorId: string;
}

export const VendorReviews = ({ vendorId }: VendorReviewsProps) => {
  const { reviews, loading } = useVendorReviews(vendorId);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Reviews</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Loading reviews...</p>
        </CardContent>
      </Card>
    );
  }

  if (reviews.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Reviews</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No reviews yet</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Reviews ({reviews.length})</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {reviews.map((review) => (
          <div key={review.id} className="border-b last:border-0 pb-4 last:pb-0">
            <div className="flex items-start gap-4">
              <Avatar>
                <AvatarFallback>U</AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="flex items-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-4 h-4 ${
                          star <= review.rating
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-muted"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {format(new Date(review.created_at), "MMM d, yyyy")}
                  </span>
                </div>
                {review.review_text && (
                  <p className="text-sm">{review.review_text}</p>
                )}
                {review.vendor_response && (
                  <div className="mt-3 pl-4 border-l-2 border-primary/20">
                    <p className="text-sm font-medium text-primary mb-1">Vendor Response</p>
                    <p className="text-sm text-muted-foreground">{review.vendor_response}</p>
                    {review.vendor_responded_at && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {format(new Date(review.vendor_responded_at), "MMM d, yyyy")}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
