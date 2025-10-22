import { useNavigate } from "react-router-dom";
import { Calendar, Ticket, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";

const Welcome = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-primary/95 to-secondary flex items-center justify-center p-4">
      <div className="max-w-6xl w-full">
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-4">
            Book My Event
          </h1>
          <p className="text-xl md:text-2xl text-white/90">
            What would you like to do today?
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {/* Book Tickets Card */}
          <button
            onClick={() => navigate("/browse-events")}
            className="group relative overflow-hidden rounded-2xl bg-white/10 backdrop-blur-sm border-2 border-white/20 p-12 hover:bg-white/15 hover:border-white/40 transition-all duration-300 hover:scale-105 hover:shadow-2xl"
          >
            <div className="flex flex-col items-center text-center space-y-6">
              <div className="w-24 h-24 rounded-full bg-secondary/30 flex items-center justify-center group-hover:bg-secondary/40 transition-colors">
                <Ticket className="w-12 h-12 text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-white mb-3">
                  Book Tickets
                </h2>
                <p className="text-white/80 text-lg">
                  Discover and book tickets for amazing events
                </p>
              </div>
            </div>
          </button>

          {/* Plan/Manage Event Card */}
          <button
            onClick={() => navigate("/plan-event")}
            className="group relative overflow-hidden rounded-2xl bg-white/10 backdrop-blur-sm border-2 border-white/20 p-12 hover:bg-white/15 hover:border-white/40 transition-all duration-300 hover:scale-105 hover:shadow-2xl"
          >
            <div className="flex flex-col items-center text-center space-y-6">
              <div className="w-24 h-24 rounded-full bg-secondary/30 flex items-center justify-center group-hover:bg-secondary/40 transition-colors">
                <Calendar className="w-12 h-12 text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-white mb-3">
                  Plan or Manage Event
                </h2>
                <p className="text-white/80 text-lg">
                  Create and manage your personal, commercial or corporate events
                </p>
              </div>
            </div>
          </button>

          {/* RSVP Card */}
          <button
            onClick={() => navigate("/rsvp")}
            className="group relative overflow-hidden rounded-2xl bg-white/10 backdrop-blur-sm border-2 border-white/20 p-12 hover:bg-white/15 hover:border-white/40 transition-all duration-300 hover:scale-105 hover:shadow-2xl"
          >
            <div className="flex flex-col items-center text-center space-y-6">
              <div className="w-24 h-24 rounded-full bg-secondary/30 flex items-center justify-center group-hover:bg-secondary/40 transition-colors">
                <Mail className="w-12 h-12 text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-white mb-3">
                  RSVP
                </h2>
                <p className="text-white/80 text-lg">
                  Confirm your presence to invite-only events
                </p>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Welcome;
