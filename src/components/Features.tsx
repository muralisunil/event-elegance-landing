import { CheckCircle2, Clock, Shield, Users } from "lucide-react";

const features = [
  {
    icon: CheckCircle2,
    title: "Easy Booking Process",
    description: "Streamlined booking system that saves you time and eliminates complexity",
  },
  {
    icon: Clock,
    title: "24/7 Support",
    description: "Round-the-clock assistance to ensure your event planning goes smoothly",
  },
  {
    icon: Shield,
    title: "Secure Transactions",
    description: "Bank-level security for all your bookings and sensitive information",
  },
  {
    icon: Users,
    title: "Expert Coordinators",
    description: "Professional event coordinators dedicated to making your vision a reality",
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
