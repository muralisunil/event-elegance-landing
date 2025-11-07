import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar, Menu, X } from "lucide-react";
import { Link } from "react-router-dom";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="bg-background border-b border-border sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <Calendar className="w-6 h-6 text-primary" />
          <div className="flex flex-col">
            <span className="text-primary font-bold text-xl leading-tight">
              Book My Event
            </span>
            <span className="text-xs text-muted-foreground">
              by Metro Hub
            </span>
          </div>
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
        </nav>
        
        <div className="flex items-center gap-3">
          <Button variant="outline" asChild className="hidden md:flex">
            <Link to="/auth">Sign In</Link>
          </Button>
          <Button variant="default" className="hidden md:flex">Contact Us</Button>
          
          {/* Mobile Menu */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary" />
                  <div className="flex flex-col items-start">
                    <span className="text-primary font-bold text-lg leading-tight">
                      Book My Event
                    </span>
                    <span className="text-xs text-muted-foreground">
                      by Metro Hub
                    </span>
                  </div>
                </SheetTitle>
              </SheetHeader>
              
              <nav className="flex flex-col gap-4 mt-8">
                <Link 
                  to="/" 
                  className="text-lg text-foreground hover:text-primary transition-colors py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Home
                </Link>
                <Link 
                  to="/welcome" 
                  className="text-lg text-foreground hover:text-primary transition-colors py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Quick Start
                </Link>
                <Link 
                  to="/browse-events" 
                  className="text-lg text-foreground hover:text-primary transition-colors py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Browse Events
                </Link>
                
                <div className="flex flex-col gap-3 mt-4 pt-4 border-t border-border">
                  <Button variant="outline" asChild className="w-full">
                    <Link to="/auth" onClick={() => setMobileMenuOpen(false)}>
                      Sign In
                    </Link>
                  </Button>
                  <Button variant="default" className="w-full" onClick={() => setMobileMenuOpen(false)}>
                    Contact Us
                  </Button>
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default Header;
