import { Users, Calendar, Store, Trophy } from "lucide-react";

const stats = [
  {
    icon: Calendar,
    number: "10,000+",
    label: "Events Created",
  },
  {
    icon: Users,
    number: "50,000+",
    label: "Tickets Sold",
  },
  {
    icon: Store,
    number: "500+",
    label: "Vendors Registered",
  },
  {
    icon: Trophy,
    number: "100+",
    label: "Sponsor Partners",
  },
];

const testimonials = [
  {
    quote: "This platform made organizing our annual conference incredibly easy. The task management and guest tracking features are outstanding.",
    author: "Sarah Johnson",
    role: "Event Organizer",
  },
  {
    quote: "As a vendor, I've connected with so many event organizers. My catering business has grown 40% since joining.",
    author: "Michael Chen",
    role: "Catering Service Owner",
  },
  {
    quote: "The sponsorship ROI tracking helped us justify our event marketing budget and double our investment.",
    author: "Amanda Rodriguez",
    role: "Marketing Director",
  },
];

const SocialProof = () => {
  return (
    <section className="py-20 bg-primary text-primary-foreground">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">Trusted by Thousands</h2>
          <p className="text-xl text-primary-foreground/90 max-w-2xl mx-auto">
            Join our thriving community of event organizers, attendees, vendors, and sponsors
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="w-16 h-16 rounded-full bg-primary-foreground/10 flex items-center justify-center mx-auto mb-4">
                <stat.icon className="w-8 h-8 text-primary-foreground" />
              </div>
              <div className="text-4xl font-bold mb-2">{stat.number}</div>
              <div className="text-lg text-primary-foreground/80">{stat.label}</div>
            </div>
          ))}
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-primary-foreground/10 p-6 rounded-lg backdrop-blur-sm">
              <p className="text-primary-foreground/90 mb-4 italic">"{testimonial.quote}"</p>
              <div className="border-t border-primary-foreground/20 pt-4">
                <div className="font-semibold">{testimonial.author}</div>
                <div className="text-sm text-primary-foreground/70">{testimonial.role}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SocialProof;
