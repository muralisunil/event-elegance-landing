import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useVendorProfile } from "@/hooks/useVendorProfile";
import { CheckCircle, Store, Award, Briefcase } from "lucide-react";

const steps = [
  {
    title: "Welcome to the Marketplace",
    description: "You're now part of our vendor community",
    icon: Store,
    content: "As a verified vendor, you can showcase your services, connect with event organizers, and grow your business through our platform."
  },
  {
    title: "Next: Build Your Portfolio",
    description: "Showcase your best work",
    icon: Award,
    content: "Add photos, testimonials, and achievements to attract more clients. A complete portfolio increases your visibility by 300%."
  },
  {
    title: "Get Connected",
    description: "Start receiving opportunities",
    icon: Briefcase,
    content: "Event organizers actively search for vendors like you. Complete your profile to start appearing in search results and receiving booking requests."
  }
];

const VendorOnboarding = () => {
  const navigate = useNavigate();
  const { updateVendorProfile, vendor } = useVendorProfile();
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = async () => {
    try {
      await updateVendorProfile({ onboarding_completed: true });
      navigate("/vendor/dashboard");
    } catch (error) {
      console.error("Error completing onboarding:", error);
    }
  };

  const CurrentIcon = steps[currentStep].icon;
  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="container max-w-2xl mx-auto">
        <div className="mb-8">
          <Progress value={progress} className="h-2" />
          <p className="text-sm text-muted-foreground mt-2 text-center">
            Step {currentStep + 1} of {steps.length}
          </p>
        </div>

        <Card>
          <CardHeader className="text-center">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <CurrentIcon className="w-10 h-10 text-primary" />
            </div>
            <CardTitle className="text-2xl">{steps[currentStep].title}</CardTitle>
            <CardDescription>{steps[currentStep].description}</CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <p className="text-center text-muted-foreground">
              {steps[currentStep].content}
            </p>

            {currentStep === 0 && (
              <div className="bg-muted p-4 rounded-lg space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-primary" />
                  <span>Profile Created</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-primary" />
                  <span>Contact Information Added</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-primary" />
                  <span>Business Details Saved</span>
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-4">
              {currentStep > 0 && (
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep(currentStep - 1)}
                  className="flex-1"
                >
                  Back
                </Button>
              )}
              <Button onClick={handleNext} className="flex-1">
                {currentStep === steps.length - 1 ? "Go to Dashboard" : "Next"}
              </Button>
            </div>

            {currentStep === steps.length - 1 && (
              <Button
                variant="link"
                onClick={() => navigate("/vendor/dashboard")}
                className="w-full"
              >
                Skip for now
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default VendorOnboarding;
