import { useVendorAnalytics } from "@/hooks/useVendorAnalytics";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, Star, Calendar, DollarSign, TrendingUp, Clock } from "lucide-react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface VendorAnalyticsDashboardProps {
  vendorId: string;
}

export const VendorAnalyticsDashboard = ({ vendorId }: VendorAnalyticsDashboardProps) => {
  const { analytics, loading } = useVendorAnalytics(vendorId);

  if (loading) {
    return <div>Loading analytics...</div>;
  }

  if (!analytics) {
    return <div>No analytics data available</div>;
  }

  const statsCards = [
    {
      title: "Total Views",
      value: analytics.totalViews,
      icon: Eye,
      description: "Profile page views",
      color: "text-blue-500",
    },
    {
      title: "Average Rating",
      value: analytics.averageRating.toFixed(1),
      icon: Star,
      description: `${analytics.totalReviews} reviews`,
      color: "text-yellow-500",
    },
    {
      title: "Total Bookings",
      value: analytics.totalBookings,
      icon: Calendar,
      description: "All time bookings",
      color: "text-green-500",
    },
    {
      title: "Total Revenue",
      value: `$${analytics.totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      description: "From completed bookings",
      color: "text-purple-500",
    },
    {
      title: "Pending Bookings",
      value: analytics.pendingBookings,
      icon: Clock,
      description: "Awaiting response",
      color: "text-orange-500",
    },
    {
      title: "Active Bookings",
      value: analytics.activeBookings,
      icon: TrendingUp,
      description: "Confirmed bookings",
      color: "text-teal-500",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Analytics Dashboard</h3>
        <p className="text-sm text-muted-foreground">Track your performance and growth</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {statsCards.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Views Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Profile Views</CardTitle>
            <CardDescription>Last 30 days</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={analytics.recentViews}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  fontSize={12}
                  tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                />
                <YAxis fontSize={12} />
                <Tooltip 
                  labelFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                />
                <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Bookings Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Bookings by Month</CardTitle>
            <CardDescription>Monthly booking trends</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={analytics.bookingsByMonth}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="month" 
                  fontSize={12}
                  tickFormatter={(value) => new Date(value + '-01').toLocaleDateString('en-US', { month: 'short' })}
                />
                <YAxis fontSize={12} />
                <Tooltip 
                  labelFormatter={(value) => new Date(value + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                />
                <Bar dataKey="count" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
