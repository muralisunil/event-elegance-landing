import { Button } from "@/components/ui/button";

const CTASection = () => {
  return (
    <section className="py-20 bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-4xl font-bold mb-6">Join Our Thriving Event Community</h2>
        <p className="text-xl mb-8 text-primary-foreground/90 max-w-2xl mx-auto">
          Whether you're planning, attending, providing services, or sponsoring - 
          there's a place for you in our ecosystem.
        </p>
        <div className="flex flex-wrap gap-4 justify-center">
          <Button variant="hero" size="lg">
            Start Planning Events
          </Button>
          <Button variant="outline" size="lg" className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground/10">
            Browse Events
          </Button>
          <Button variant="outline" size="lg" className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground/10">
            Become a Vendor
          </Button>
          <Button variant="outline" size="lg" className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground/10">
            Explore Sponsorships
          </Button>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
