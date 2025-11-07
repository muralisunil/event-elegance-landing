import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";
import { Link } from "react-router-dom";

const Header = () => {
  return (
    <header className="bg-background border-b border-border sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-primary font-bold text-xl">
          <Calendar className="w-6 h-6" />
          <span>Book My Event</span>
        </Link>
        
        <nav className="hidden md:flex items-center gap-8">
          <Link to="/" className="text-foreground hover:text-primary transition-colors">
            Home
          </Link>
          <Link to="/welcome" className="text-foreground hover:text-primary transition-colors">
            Quick Start
          </Link>
          <Link to="/browse-events" className="text-foreground hover:text-primary transition-colors">
            Browse Events
          </Link>
          <Link to="/outreach-events" className="text-foreground hover:text-primary transition-colors">
            Outreach
          </Link>
        </nav>
        
        <Button variant="default">Contact Us</Button>
      </div>
    </header>
  );
};

export default Header;
