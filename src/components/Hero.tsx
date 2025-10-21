import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-event.jpg";

const Hero = () => {
  return (
    <section className="relative bg-primary text-primary-foreground overflow-hidden">
      {/* Background image with overlay */}
      <div className="absolute inset-0">
        <img 
          src={heroImage} 
          alt="Professional event venue" 
          className="w-full h-full object-cover opacity-20"
        />
        {/* Dotted pattern overlay */}
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)',
            backgroundSize: '20px 20px',
            backgroundPosition: '0 0, 10px 10px'
          }}
        />
      </div>
      
      <div className="container mx-auto px-4 py-32 relative z-10">
        <div className="max-w-3xl">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
            Transform Your Event Vision Into Reality
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-primary-foreground/90">
            Whether it's a personal celebration, commercial showcase, or corporate gathering, 
            we make event booking seamless and stress-free.
          </p>
          <div className="flex flex-wrap gap-4">
            <Button variant="hero" size="lg">
              Get Started
            </Button>
            <Button variant="outline" size="lg" className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground/10">
              Learn More
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
