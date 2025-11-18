import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Star, MessageSquare } from "lucide-react";
import { useVendorReviews } from "@/hooks/useVendorReviews";
import { format } from "date-fns";

interface VendorReviewManagementProps {
  vendorId: string;
}

export const VendorReviewManagement = ({ vendorId }: VendorReviewManagementProps) => {
  const { reviews, loading, respondToReview } = useVendorReviews(vendorId);
  const [respondingTo, setRespondingTo] = useState<string | null>(null);
  const [response, setResponse] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmitResponse = async (reviewId: string) => {
    if (!response.trim()) return;

    setSubmitting(true);
    try {
      await respondToReview(reviewId, response);
      setRespondingTo(null);
      setResponse("");
    } catch (error) {
      console.error('Error submitting response:', error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Customer Reviews</CardTitle>
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
          <CardTitle>Customer Reviews</CardTitle>
          <CardDescription>
            No reviews yet. Reviews will appear here after customers leave feedback.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Customer Reviews ({reviews.length})</CardTitle>
        <CardDescription>
          Respond to customer feedback to build trust and improve your service
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {reviews.map((review) => (
          <div key={review.id} className="border rounded-lg p-4 space-y-4">
            <div className="flex items-start gap-4">
              <Avatar>
                <AvatarFallback>C</AvatarFallback>
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
              </div>
            </div>

            {review.vendor_response ? (
              <div className="pl-12 pt-2 border-t">
                <p className="text-sm font-medium text-primary mb-1">Your Response</p>
                <p className="text-sm text-muted-foreground">{review.vendor_response}</p>
                {review.vendor_responded_at && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Responded on {format(new Date(review.vendor_responded_at), "MMM d, yyyy")}
                  </p>
                )}
              </div>
            ) : (
              <div className="pl-12">
                {respondingTo === review.id ? (
                  <div className="space-y-2">
                    <Textarea
                      placeholder="Write your response..."
                      value={response}
                      onChange={(e) => setResponse(e.target.value)}
                      rows={3}
                    />
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleSubmitResponse(review.id)}
                        disabled={!response.trim() || submitting}
                        size="sm"
                      >
                        {submitting ? "Submitting..." : "Submit Response"}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setRespondingTo(null);
                          setResponse("");
                        }}
                        size="sm"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setRespondingTo(review.id)}
                  >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Respond
                  </Button>
                )}
              </div>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
