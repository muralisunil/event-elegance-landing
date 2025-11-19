import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useVendorProfile } from "@/hooks/useVendorProfile";
import { VendorBookingsTab } from "@/components/vendor/VendorBookingsTab";
import { VendorAnalyticsDashboard } from "@/components/vendor/VendorAnalyticsDashboard";
import { VendorServicesManager } from "@/components/vendor/VendorServicesManager";
import { VendorPortfolioManager } from "@/components/vendor/VendorPortfolioManager";
import { VendorReviewManagement } from "@/components/vendor/VendorReviewManagement";
import { VendorAvailabilityCalendar } from "@/components/vendor/VendorAvailabilityCalendar";
import { VendorNotificationSettings } from "@/components/vendor/VendorNotificationSettings";
import { supabase } from "@/integrations/supabase/client";
import { Session } from "@supabase/supabase-js";
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
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

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

        {/* Tabs Navigation */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-8">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="bookings">Bookings</TabsTrigger>
            <TabsTrigger value="services">Services</TabsTrigger>
            <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
            <TabsTrigger value="availability">Availability</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Quick Actions Grid */}
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => {
                const element = document.querySelector('[value="services"]');
                if (element instanceof HTMLElement) element.click();
              }}>
                <CardHeader>
                  <Package className="w-8 h-8 text-primary mb-2" />
                  <CardTitle>Services</CardTitle>
                  <CardDescription>
                    Manage your service offerings and pricing
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full">
                    Manage Services
                  </Button>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => {
                const element = document.querySelector('[value="portfolio"]');
                if (element instanceof HTMLElement) element.click();
              }}>
                <CardHeader>
                  <Star className="w-8 h-8 text-primary mb-2" />
                  <CardTitle>Portfolio</CardTitle>
                  <CardDescription>
                    Showcase your work and testimonials
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full">
                    View Portfolio
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

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>
                  Latest updates and bookings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  No recent activity to display
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="bookings" className="space-y-4">
            <VendorBookingsTab userType="vendor" />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <VendorAnalyticsDashboard vendorId={vendor.id} />
          </TabsContent>

          <TabsContent value="services" className="space-y-4">
            <VendorServicesManager vendorId={vendor.id} />
          </TabsContent>

          <TabsContent value="portfolio" className="space-y-4">
            <VendorPortfolioManager vendorId={vendor.id} userId={session?.user?.id || ''} />
          </TabsContent>

            <TabsContent value="reviews" className="space-y-4">
              <VendorReviewManagement vendorId={vendor.id} />
            </TabsContent>

            <TabsContent value="availability" className="space-y-4">
              <VendorAvailabilityCalendar vendorId={vendor.id} canEdit={true} />
            </TabsContent>

            <TabsContent value="settings" className="space-y-4">
              <VendorNotificationSettings vendorId={vendor.id} />
            </TabsContent>
          </Tabs>
      </div>
    </div>
  );
};

export default VendorDashboard;
