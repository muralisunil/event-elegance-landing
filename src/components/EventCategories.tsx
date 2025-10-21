import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, Briefcase, Building2 } from "lucide-react";

const categories = [
  {
    icon: Heart,
    title: "Personal Events",
    description: "From intimate gatherings to milestone celebrations, create unforgettable memories with your loved ones.",
    features: ["Weddings & Anniversaries", "Birthday Parties", "Family Reunions", "Private Celebrations"],
  },
  {
    icon: Briefcase,
    title: "Commercial Events",
    description: "Showcase your brand and connect with your audience through impactful commercial experiences.",
    features: ["Product Launches", "Trade Shows", "Brand Activations", "Retail Events"],
  },
  {
    icon: Building2,
    title: "Corporate Events",
    description: "Professional venues and services for your business events that inspire and engage.",
    features: ["Conferences & Seminars", "Team Building", "Annual Meetings", "Executive Retreats"],
  },
];

const EventCategories = () => {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4 text-foreground">Event Solutions for Every Occasion</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Choose from our specialized event categories designed to meet your unique needs
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {categories.map((category, index) => (
            <Card key={index} className="border-border hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-accent flex items-center justify-center mb-4">
                  <category.icon className="w-6 h-6 text-accent-foreground" />
                </div>
                <CardTitle className="text-2xl">{category.title}</CardTitle>
                <CardDescription className="text-base">{category.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 mb-6">
                  {category.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-muted-foreground">
                      <span className="text-secondary">•</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button className="w-full" variant="outline">
                  Explore {category.title}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default EventCategories;
