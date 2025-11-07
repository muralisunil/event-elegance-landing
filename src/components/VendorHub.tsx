import { Button } from "@/components/ui/button";
import { Store, Package, Briefcase, Award, Handshake } from "lucide-react";

const services = [
  {
    icon: Store,
    title: "Service Marketplace",
    description: "Offer your services including catering, photography, venues, entertainment, and more",
  },
  {
    icon: Package,
    title: "Business Categories",
    description: "Register in multiple categories to showcase your diverse offerings and expertise",
  },
  {
    icon: Briefcase,
    title: "Event Connections",
    description: "Get matched with events actively seeking your services and grow your business",
  },
  {
    icon: Award,
    title: "Portfolio Showcase",
    description: "Display your work, testimonials, and achievements to attract more clients",
  },
  {
    icon: Handshake,
    title: "Contract Management",
    description: "Handle bookings, payments, and agreements securely through our platform",
  },
];

const VendorHub = () => {
  return (
    <section className="py-20" style={{ backgroundColor: 'hsl(var(--section-light))' }}>
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4 text-foreground">For Vendors & Merchants</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Grow your business by connecting with event organizers who need your services
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {services.map((service, index) => (
            <div key={index} className="bg-background p-6 rounded-lg border border-border">
              <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center mb-4">
                <service.icon className="w-6 h-6 text-secondary" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-foreground">{service.title}</h3>
              <p className="text-muted-foreground">{service.description}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-4 justify-center">
          <Button size="lg">
            Register as Vendor
          </Button>
          <Button variant="outline" size="lg">
            Learn More
          </Button>
        </div>
      </div>
    </section>
  );
};

export default VendorHub;
