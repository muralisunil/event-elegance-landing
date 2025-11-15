import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import Index from "./pages/Index";
import Welcome from "./pages/Welcome";
import PlanEvent from "./pages/PlanEvent";
import BrowseEvents from "./pages/BrowseEvents";
import RSVPEvent from "./pages/RSVPEvent";
import Auth from "./pages/Auth";
import OutreachEvents from "./pages/OutreachEvents";
import CreateOutreachEvent from "./pages/CreateOutreachEvent";
import ManageEvent from "./pages/ManageEvent";
import PersonalEvents from "./pages/PersonalEvents";
import CreatePersonalEvent from "./pages/CreatePersonalEvent";
import ManagePersonalEvent from "./pages/ManagePersonalEvent";
import ViewPersonalEvent from "./pages/ViewPersonalEvent";
import MyCalendar from "./pages/MyCalendar";
import NotFound from "./pages/NotFound";
import Settings from "./pages/Settings";
import ManageEvents from "./pages/ManageEvents";
import AdminPermissions from "./pages/AdminPermissions";
import OrganizationDetails from "./pages/OrganizationDetails";
import VendorRegistration from "./pages/VendorRegistration";
import VendorOnboarding from "./pages/VendorOnboarding";
import VendorDashboard from "./pages/VendorDashboard";
import VendorProfile from "./pages/VendorProfile";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      storageKey="book-my-event-theme"
    >
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/welcome" element={<Welcome />} />
          <Route path="/plan-event" element={<PlanEvent />} />
          <Route path="/browse-events" element={<BrowseEvents />} />
          <Route path="/rsvp" element={<RSVPEvent />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/outreach-events" element={<OutreachEvents />} />
          <Route path="/create-outreach-event" element={<CreateOutreachEvent />} />
          <Route path="/manage-event/:eventId" element={<ManageEvent />} />
          <Route path="/personal-events" element={<PersonalEvents />} />
          <Route path="/create-personal-event" element={<CreatePersonalEvent />} />
          <Route path="/manage-personal-event/:eventId" element={<ManagePersonalEvent />} />
          <Route path="/view-event/:invitationCode" element={<ViewPersonalEvent />} />
          <Route path="/my-calendar" element={<MyCalendar />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/manage-events" element={<ManageEvents />} />
          <Route path="/admin" element={<AdminPermissions />} />
          <Route path="/admin/organizations/:id" element={<OrganizationDetails />} />
          <Route path="/vendor/register" element={<VendorRegistration />} />
          <Route path="/vendor/onboarding" element={<VendorOnboarding />} />
          <Route path="/vendor/dashboard" element={<VendorDashboard />} />
          <Route path="/vendor/profile" element={<VendorProfile />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
