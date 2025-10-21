import { Button } from "@/components/ui/button";

const CTASection = () => {
  return (
    <section className="py-20 bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-4xl font-bold mb-6">Ready to Plan Your Perfect Event?</h2>
        <p className="text-xl mb-8 text-primary-foreground/90 max-w-2xl mx-auto">
          Join thousands of satisfied clients who trusted us with their most important moments. 
          Let's create something extraordinary together.
        </p>
        <div className="flex flex-wrap gap-4 justify-center">
          <Button variant="hero" size="lg">
            Start Booking Now
          </Button>
          <Button variant="outline" size="lg" className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground/10">
            Schedule Consultation
          </Button>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
