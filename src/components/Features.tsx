import { CheckCircle2, Clock, Shield, Users } from "lucide-react";

const features = [
  {
    icon: CheckCircle2,
    title: "For Organizers",
    description: "Easy planning tools, task management, guest tracking, and comprehensive event analytics",
  },
  {
    icon: Users,
    title: "For Attendees",
    description: "Easy discovery, secure booking, RSVP management, and personalized event dashboard",
  },
  {
    icon: Shield,
    title: "For Vendors",
    description: "Business growth opportunities, event connections, portfolio showcase, and secure contracts",
  },
  {
    icon: Clock,
    title: "For Sponsors",
    description: "Brand visibility, ROI tracking, flexible partnership opportunities, and analytics",
  },
];

const Features = () => {
  return (
    <section className="py-20" style={{ backgroundColor: 'hsl(var(--section-light))' }}>
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4 text-foreground">Why Choose Book My Event</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            We combine technology and expertise to deliver exceptional event experiences
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="text-center">
              <div className="w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center mx-auto mb-4">
                <feature.icon className="w-8 h-8 text-secondary" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-foreground">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
