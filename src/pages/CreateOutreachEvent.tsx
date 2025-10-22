import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

const outreachEventTypes = [
  { value: "workshop", label: "Workshop" },
  { value: "seminar", label: "Seminar" },
  { value: "community_service", label: "Community Service" },
  { value: "awareness_campaign", label: "Awareness Campaign" },
  { value: "fundraiser", label: "Fundraiser" },
  { value: "networking", label: "Networking" },
  { value: "training", label: "Training" },
  { value: "volunteer", label: "Volunteer" },
];

const CreateOutreachEvent = () => {
  const [step, setStep] = useState(1);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    eventDate: "",
    eventTime: "",
    location: "",
    description: "",
    purpose: "",
    goal: "",
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleTypeSelection = (values: string[]) => {
    setSelectedTypes(values);
  };

  const handleNextStep = () => {
    if (step === 1 && selectedTypes.length === 0) {
      toast({
        title: "Selection Required",
        description: "Please select at least one event type",
        variant: "destructive",
      });
      return;
    }
    setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.from("outreach_events").insert([{
        user_id: user.id,
        name: formData.name,
        event_types: selectedTypes as any,
        event_date: formData.eventDate,
        event_time: formData.eventTime,
        location: formData.location,
        description: formData.description,
        purpose: formData.purpose,
        goal: formData.goal,
      }]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Outreach event created successfully!",
      });
      navigate("/outreach-events");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <Button
              variant="ghost"
              onClick={() => step === 1 ? navigate("/outreach-events") : setStep(1)}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>
                {step === 1 ? "Select Event Types" : "Event Details"}
              </CardTitle>
              <CardDescription>
                {step === 1
                  ? "Choose one or more event types for your outreach event"
                  : "Fill in the details for your outreach event"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {step === 1 ? (
                <div className="space-y-6">
                  <ToggleGroup
                    type="multiple"
                    value={selectedTypes}
                    onValueChange={handleTypeSelection}
                    className="flex flex-wrap gap-2 justify-start"
                  >
                    {outreachEventTypes.map((type) => (
                      <ToggleGroupItem
                        key={type.value}
                        value={type.value}
                        className="px-4 py-2"
                      >
                        {type.label}
                      </ToggleGroupItem>
                    ))}
                  </ToggleGroup>
                  <Button
                    onClick={handleNextStep}
                    className="w-full"
                    disabled={selectedTypes.length === 0}
                  >
                    Next
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Event Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="eventDate">Date *</Label>
                      <Input
                        id="eventDate"
                        type="date"
                        value={formData.eventDate}
                        onChange={(e) =>
                          setFormData({ ...formData, eventDate: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="eventTime">Time *</Label>
                      <Input
                        id="eventTime"
                        type="time"
                        value={formData.eventTime}
                        onChange={(e) =>
                          setFormData({ ...formData, eventTime: e.target.value })
                        }
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location">Location *</Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) =>
                        setFormData({ ...formData, location: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({ ...formData, description: e.target.value })
                      }
                      rows={4}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="purpose">Purpose/Goal</Label>
                    <Textarea
                      id="purpose"
                      value={formData.purpose}
                      onChange={(e) =>
                        setFormData({ ...formData, purpose: e.target.value })
                      }
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="goal">Key Objectives</Label>
                    <Input
                      id="goal"
                      value={formData.goal}
                      onChange={(e) =>
                        setFormData({ ...formData, goal: e.target.value })
                      }
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Creating..." : "Create Event"}
                    <Check className="ml-2 h-4 w-4" />
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CreateOutreachEvent;
