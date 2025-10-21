import { Calendar, Facebook, Twitter, Instagram, Linkedin } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-primary text-primary-foreground py-12">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="w-6 h-6" />
              <span className="font-bold text-lg">Book My Event</span>
            </div>
            <p className="text-primary-foreground/80">
              Your trusted partner in creating memorable events across all occasions.
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">Event Types</h3>
            <ul className="space-y-2 text-primary-foreground/80">
              <li><Link to="#" className="hover:text-primary-foreground transition-colors">Personal Events</Link></li>
              <li><Link to="#" className="hover:text-primary-foreground transition-colors">Commercial Events</Link></li>
              <li><Link to="#" className="hover:text-primary-foreground transition-colors">Corporate Events</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">Company</h3>
            <ul className="space-y-2 text-primary-foreground/80">
              <li><Link to="#" className="hover:text-primary-foreground transition-colors">About Us</Link></li>
              <li><Link to="#" className="hover:text-primary-foreground transition-colors">Contact</Link></li>
              <li><Link to="#" className="hover:text-primary-foreground transition-colors">Careers</Link></li>
              <li><Link to="#" className="hover:text-primary-foreground transition-colors">Blog</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">Connect With Us</h3>
            <div className="flex gap-4">
              <a href="#" className="hover:text-primary-foreground/80 transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="hover:text-primary-foreground/80 transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="hover:text-primary-foreground/80 transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="hover:text-primary-foreground/80 transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
        
        <div className="border-t border-primary-foreground/20 pt-8 text-center text-primary-foreground/80">
          <p>&copy; {new Date().getFullYear()} Book My Event. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
