import Header from "@/components/Header";
import Hero from "@/components/Hero";
import EventCategories from "@/components/EventCategories";
import Features from "@/components/Features";
import CTASection from "@/components/CTASection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <Hero />
        <EventCategories />
        <Features />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
