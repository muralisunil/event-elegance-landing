import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Mail, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const RSVPEvent = () => {
  const navigate = useNavigate();
  const [inviteCode, setInviteCode] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle RSVP logic here
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <h1 className="text-xl font-bold">Book My Event</h1>
          <div className="w-20" />
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
              <Mail className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-4xl font-bold mb-4">RSVP to Event</h1>
            <p className="text-muted-foreground text-lg">
              Enter your invitation code to confirm your attendance
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Invitation Code</CardTitle>
              <CardDescription>
                Please enter the unique code from your invitation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Input
                    type="text"
                    placeholder="Enter invitation code"
                    value={inviteCode}
                    onChange={(e) => setInviteCode(e.target.value)}
                    className="text-lg"
                  />
                </div>

                <Button type="submit" className="w-full" size="lg">
                  <Check className="w-4 h-4 mr-2" />
                  Confirm Attendance
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="mt-8 text-center">
            <p className="text-sm text-muted-foreground">
              Don't have an invitation code?{" "}
              <button
                onClick={() => navigate("/browse-events")}
                className="text-primary hover:underline"
              >
                Browse public events
              </button>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default RSVPEvent;
