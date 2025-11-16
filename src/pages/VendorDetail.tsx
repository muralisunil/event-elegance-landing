import { useParams, useNavigate } from "react-router-dom";
import { useVendorDetails } from "@/hooks/useVendorDetails";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ArrowLeft, MapPin, Mail, Phone, Globe, Star } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const VendorDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { vendor, reviews, stats, loading, addReview } = useVendorDetails(id!);
  const { toast } = useToast();
  
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmitReview = async () => {
    if (!reviewText.trim()) {
      toast({
        title: "Error",
        description: "Please write a review",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      await addReview(rating, reviewText);
      setReviewText("");
      setRating(5);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading vendor details...</p>
        </div>
      </div>
    );
  }

  if (!vendor) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Vendor not found</p>
          <Button onClick={() => navigate("/vendors")} className="mt-4">
            Back to Directory
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="container max-w-5xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate("/vendors")}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Directory
        </Button>

        {/* Vendor Header */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-3xl mb-2">{vendor.business_name}</CardTitle>
                {vendor.business_type && (
                  <Badge variant="secondary" className="mb-3">
                    {vendor.business_type}
                  </Badge>
                )}
                {stats.totalReviews > 0 && (
                  <div className="flex items-center gap-2 text-sm">
                    <div className="flex items-center">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="ml-1 font-semibold">{stats.averageRating.toFixed(1)}</span>
                    </div>
                    <span className="text-muted-foreground">
                      ({stats.totalReviews} review{stats.totalReviews !== 1 ? 's' : ''})
                    </span>
                  </div>
                )}
              </div>
              {vendor.logo_url && (
                <img
                  src={vendor.logo_url}
                  alt={vendor.business_name}
                  className="w-24 h-24 object-cover rounded-lg"
                />
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {vendor.description && (
              <p className="text-foreground">{vendor.description}</p>
            )}

            <Separator />

            {/* Contact Information */}
            <div className="space-y-3">
              <h3 className="font-semibold">Contact Information</h3>
              
              {vendor.address && (
                <div className="flex items-start gap-2 text-sm">
                  <MapPin className="w-4 h-4 mt-0.5 text-muted-foreground" />
                  <span>
                    {vendor.address}
                    {(vendor.city || vendor.state || vendor.postal_code) && (
                      <>, {[vendor.city, vendor.state, vendor.postal_code].filter(Boolean).join(', ')}</>
                    )}
                  </span>
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                {vendor.contact_email && (
                  <Button variant="outline" size="sm" onClick={() => window.location.href = `mailto:${vendor.contact_email}`}>
                    <Mail className="w-4 h-4 mr-2" />
                    {vendor.contact_email}
                  </Button>
                )}
                {vendor.contact_phone && (
                  <Button variant="outline" size="sm" onClick={() => window.location.href = `tel:${vendor.contact_phone}`}>
                    <Phone className="w-4 h-4 mr-2" />
                    {vendor.contact_phone}
                  </Button>
                )}
                {vendor.website && (
                  <Button variant="outline" size="sm" onClick={() => window.open(vendor.website, '_blank')}>
                    <Globe className="w-4 h-4 mr-2" />
                    Visit Website
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Reviews Section */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Reviews</CardTitle>
            <CardDescription>
              See what others are saying about this vendor
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Add Review */}
            <div className="space-y-4 p-4 border rounded-lg">
              <h4 className="font-semibold">Write a Review</h4>
              
              <div className="space-y-2">
                <Label>Rating</Label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setRating(star)}
                      className="transition-colors"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          star <= rating
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="review">Your Review</Label>
                <Textarea
                  id="review"
                  placeholder="Share your experience with this vendor..."
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  rows={4}
                />
              </div>

              <Button onClick={handleSubmitReview} disabled={submitting}>
                {submitting ? "Submitting..." : "Submit Review"}
              </Button>
            </div>

            {/* Reviews List */}
            {reviews.length === 0 ? (
              <p className="text-muted-foreground text-center py-6">
                No reviews yet. Be the first to review!
              </p>
            ) : (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <div key={review.id} className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-4 h-4 ${
                              star <= review.rating
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {new Date(review.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    {review.review_text && (
                      <p className="text-sm">{review.review_text}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default VendorDetail;
