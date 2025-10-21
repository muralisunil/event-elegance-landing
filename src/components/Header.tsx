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
          <Link to="#personal" className="text-foreground hover:text-primary transition-colors">
            Personal
          </Link>
          <Link to="#commercial" className="text-foreground hover:text-primary transition-colors">
            Commercial
          </Link>
          <Link to="#corporate" className="text-foreground hover:text-primary transition-colors">
            Corporate
          </Link>
          <Link to="#about" className="text-foreground hover:text-primary transition-colors">
            About Us
          </Link>
        </nav>
        
        <Button variant="default">Contact Us</Button>
      </div>
    </header>
  );
};

export default Header;
