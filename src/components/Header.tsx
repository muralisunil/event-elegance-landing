import { Button } from "@/components/ui/button";
import { Calendar, ChevronDown } from "lucide-react";
import { Link } from "react-router-dom";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";

const Header = () => {
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
          
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuTrigger className="text-foreground hover:text-primary transition-colors bg-transparent">
                  Create Event
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-[200px] gap-3 p-4 bg-background border border-border z-50">
                    <li>
                      <NavigationMenuLink asChild>
                        <Link
                          to="/outreach-events"
                          className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                        >
                          <div className="text-sm font-medium leading-none">Outreach Events</div>
                          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                            Create community and public events
                          </p>
                        </Link>
                      </NavigationMenuLink>
                    </li>
                    <li>
                      <NavigationMenuLink asChild>
                        <Link
                          to="/personal-events"
                          className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                        >
                          <div className="text-sm font-medium leading-none">Personal Events</div>
                          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                            Plan private and personal celebrations
                          </p>
                        </Link>
                      </NavigationMenuLink>
                    </li>
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </nav>
        
        <div className="flex items-center gap-3">
          <Button variant="outline" asChild>
            <Link to="/auth">Sign In</Link>
          </Button>
          <Button variant="default">Contact Us</Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
