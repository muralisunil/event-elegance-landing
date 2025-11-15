import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useVendorProfile } from "@/hooks/useVendorProfile";
import { 
  Store, 
  Settings, 
  BarChart3, 
  Users, 
  Calendar, 
  Star,
  Package,
  TrendingUp,
  FileText,
  ArrowLeft
} from "lucide-react";

const VendorDashboard = () => {
  const navigate = useNavigate();
  const { vendor, loading, isVendor } = useVendorProfile();

  useEffect(() => {
    if (!loading && !isVendor) {
      navigate("/vendor/register");
    }
  }, [loading, isVendor, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!vendor) return null;

  const stats = [
    { label: "Total Views", value: "0", icon: BarChart3, trend: "+0%" },
    { label: "Active Bookings", value: "0", icon: Calendar, trend: "0" },
    { label: "Reviews", value: "0", icon: Star, trend: "0.0" },
    { label: "Services", value: "0", icon: Package, trend: "+0" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={() => navigate("/")}
                size="sm"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Home
              </Button>
              <div className="h-6 w-px bg-border" />
              <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                  <Store className="w-6 h-6" />
                  {vendor.business_name}
                </h1>
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  {vendor.business_type}
                  {vendor.is_verified && (
                    <Badge variant="secondary" className="ml-2">
                      Verified
                    </Badge>
                  )}
                </p>
              </div>
            </div>
            <Button variant="outline" onClick={() => navigate("/vendor/profile")}>
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>
      </div>

      <div className="container py-8">
        {/* Welcome Alert */}
        {!vendor.onboarding_completed && (
          <Card className="mb-8 border-primary">
            <CardHeader>
              <CardTitle>Complete Your Profile</CardTitle>
              <CardDescription>
                Finish setting up your profile to start receiving bookings and opportunities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => navigate("/vendor/onboarding")}>
                Continue Setup
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Stats Grid */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <stat.icon className="w-5 h-5 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    {stat.trend}
                  </span>
                </div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <Package className="w-8 h-8 text-primary mb-2" />
              <CardTitle>Services</CardTitle>
              <CardDescription>
                Manage your service offerings and pricing
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full" disabled>
                Coming in Phase 2
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <Star className="w-8 h-8 text-primary mb-2" />
              <CardTitle>Portfolio</CardTitle>
              <CardDescription>
                Showcase your work and testimonials
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full" disabled>
                Coming in Phase 3
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <FileText className="w-8 h-8 text-primary mb-2" />
              <CardTitle>Bookings</CardTitle>
              <CardDescription>
                View and manage your bookings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full" disabled>
                Coming in Phase 4
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <Users className="w-8 h-8 text-primary mb-2" />
              <CardTitle>Opportunities</CardTitle>
              <CardDescription>
                Browse events seeking your services
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full" disabled>
                Coming in Phase 5
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <BarChart3 className="w-8 h-8 text-primary mb-2" />
              <CardTitle>Analytics</CardTitle>
              <CardDescription>
                Track your performance and growth
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full" disabled>
                Coming in Phase 6
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate("/vendor/profile")}>
            <CardHeader>
              <Settings className="w-8 h-8 text-primary mb-2" />
              <CardTitle>Profile Settings</CardTitle>
              <CardDescription>
                Update your business information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full">
                Manage Profile
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default VendorDashboard;
