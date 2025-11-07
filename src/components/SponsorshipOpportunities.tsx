import { Button } from "@/components/ui/button";
import { Trophy, TrendingUp, Gift, Target } from "lucide-react";

const benefits = [
  {
    icon: Trophy,
    title: "Brand Visibility",
    description: "Showcase your brand at events with custom sponsorship tiers and premium placement",
  },
  {
    icon: Target,
    title: "Tiered Packages",
    description: "Choose from Gold, Silver, Bronze, or create custom sponsorship levels that fit your budget",
  },
  {
    icon: TrendingUp,
    title: "ROI Tracking",
    description: "Monitor your sponsorship impact, reach, and engagement with detailed analytics",
  },
  {
    icon: Gift,
    title: "Flexible Contributions",
    description: "Support events with monetary sponsorships or in-kind contributions of products and services",
  },
];

const SponsorshipOpportunities = () => {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4 text-foreground">Sponsorship Opportunities</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Partner with events to amplify your brand and connect with engaged audiences
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {benefits.map((benefit, index) => (
            <div key={index} className="text-center">
              <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
                <benefit.icon className="w-8 h-8 text-accent" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-foreground">{benefit.title}</h3>
              <p className="text-muted-foreground">{benefit.description}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-4 justify-center">
          <Button size="lg">
            Become a Sponsor
          </Button>
          <Button variant="outline" size="lg">
            View Packages
          </Button>
        </div>
      </div>
    </section>
  );
};

export default SponsorshipOpportunities;
