import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import PlanEvent from "./pages/PlanEvent";
import BrowseEvents from "./pages/BrowseEvents";
import RSVPEvent from "./pages/RSVPEvent";
import Auth from "./pages/Auth";
import OutreachEvents from "./pages/OutreachEvents";
import CreateOutreachEvent from "./pages/CreateOutreachEvent";
import ManageEvent from "./pages/ManageEvent";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/plan-event" element={<PlanEvent />} />
          <Route path="/browse-events" element={<BrowseEvents />} />
          <Route path="/rsvp" element={<RSVPEvent />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/outreach-events" element={<OutreachEvents />} />
          <Route path="/create-outreach-event" element={<CreateOutreachEvent />} />
          <Route path="/manage-event/:eventId" element={<ManageEvent />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
