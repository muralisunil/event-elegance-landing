import Header from "@/components/Header";
import Hero from "@/components/Hero";
import EventCategories from "@/components/EventCategories";
import AttendeeServices from "@/components/AttendeeServices";
import VendorHub from "@/components/VendorHub";
import SponsorshipOpportunities from "@/components/SponsorshipOpportunities";
import SocialProof from "@/components/SocialProof";
import Features from "@/components/Features";
import CTASection from "@/components/CTASection";
import Footer from "@/components/Footer";

const Home = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <Hero />
        <EventCategories />
        <AttendeeServices />
        <VendorHub />
        <SponsorshipOpportunities />
        <SocialProof />
        <Features />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
};

export default Home;
