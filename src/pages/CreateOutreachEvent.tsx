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
import { ArrowLeft, ArrowRight, Check, Users, Ticket } from "lucide-react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Checkbox } from "@/components/ui/checkbox";

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
    maxGuests: "",
    isUnlimitedGuests: false,
    allowAccompanies: false,
    maxAccompaniesPerGuest: "1",
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

    // Validate guest settings
    if (!formData.isUnlimitedGuests && (!formData.maxGuests || parseInt(formData.maxGuests) < 1)) {
      toast({
        title: "Validation Error",
        description: "Please specify maximum guests or enable unlimited guests",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    if (formData.allowAccompanies && (!formData.maxAccompaniesPerGuest || parseInt(formData.maxAccompaniesPerGuest) < 1)) {
      toast({
        title: "Validation Error",
        description: "Please specify maximum companions per guest",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

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
        max_guests: formData.isUnlimitedGuests ? null : parseInt(formData.maxGuests),
        is_unlimited_guests: formData.isUnlimitedGuests,
        allow_accompanies: formData.allowAccompanies,
        max_accompanies_per_guest: formData.allowAccompanies ? parseInt(formData.maxAccompaniesPerGuest) : null,
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

                  {/* Guest Management Section */}
                  <Card className="border-dashed">
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        Guest Management
                      </CardTitle>
                      <CardDescription>
                        Configure guest capacity and accompanies policy
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Guest Capacity */}
                      <div className="space-y-4">
                        <h4 className="text-sm font-medium flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          Guest Capacity
                        </h4>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="unlimitedGuests"
                            checked={formData.isUnlimitedGuests}
                            onCheckedChange={(checked) =>
                              setFormData({
                                ...formData,
                                isUnlimitedGuests: checked === true,
                                maxGuests: checked === true ? "" : formData.maxGuests,
                              })
                            }
                          />
                          <Label
                            htmlFor="unlimitedGuests"
                            className="text-sm font-normal cursor-pointer"
                          >
                            Unlimited guests
                          </Label>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="maxGuests">
                            Maximum Guests {!formData.isUnlimitedGuests && "*"}
                          </Label>
                          <Input
                            id="maxGuests"
                            type="number"
                            min="1"
                            placeholder="Enter maximum capacity (e.g., 100)"
                            value={formData.maxGuests}
                            onChange={(e) =>
                              setFormData({ ...formData, maxGuests: e.target.value })
                            }
                            disabled={formData.isUnlimitedGuests}
                            required={!formData.isUnlimitedGuests}
                          />
                          <p className="text-xs text-muted-foreground">
                            {formData.isUnlimitedGuests
                              ? "No limit on attendees"
                              : "Specify the maximum number of guests allowed"}
                          </p>
                        </div>
                      </div>

                      {/* Accompanies Policy */}
                      <div className="space-y-4">
                        <h4 className="text-sm font-medium flex items-center gap-2">
                          <Ticket className="h-4 w-4" />
                          Accompanies Policy
                        </h4>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="allowAccompanies"
                            checked={formData.allowAccompanies}
                            onCheckedChange={(checked) =>
                              setFormData({
                                ...formData,
                                allowAccompanies: checked === true,
                                maxAccompaniesPerGuest: checked === true ? "1" : "1",
                              })
                            }
                          />
                          <Label
                            htmlFor="allowAccompanies"
                            className="text-sm font-normal cursor-pointer"
                          >
                            Allow guests to bring companions (plus-ones)
                          </Label>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="maxAccompaniesPerGuest">
                            Maximum companions per guest {formData.allowAccompanies && "*"}
                          </Label>
                          <Input
                            id="maxAccompaniesPerGuest"
                            type="number"
                            min="1"
                            max="10"
                            value={formData.maxAccompaniesPerGuest}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                maxAccompaniesPerGuest: e.target.value,
                              })
                            }
                            disabled={!formData.allowAccompanies}
                            required={formData.allowAccompanies}
                          />
                          <p className="text-xs text-muted-foreground">
                            {formData.allowAccompanies
                              ? "How many additional guests can each invitee bring?"
                              : "Guests cannot bring companions"}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

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
