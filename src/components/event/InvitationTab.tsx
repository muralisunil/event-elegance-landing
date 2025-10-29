import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Upload, Sparkles, Eye } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { CreateInvitationModal } from "./CreateInvitationModal";

interface InvitationTabProps {
  eventId: string;
  event: any;
}

const InvitationTab = ({ eventId, event }: InvitationTabProps) => {
  const [invitationUrl, setInvitationUrl] = useState<string | null>(null);
  const [invitationTitle, setInvitationTitle] = useState("");
  const [invitationMessage, setInvitationMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  useEffect(() => {
    fetchInvitation();
  }, [eventId]);

  const fetchInvitation = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('event_configurations')
      .select('invitation_image_url, invitation_title, invitation_message')
      .eq('event_id', eventId)
      .maybeSingle();

    if (error) {
      console.error("Error fetching invitation:", error);
    } else if (data) {
      setInvitationUrl(data.invitation_image_url);
      setInvitationTitle(data.invitation_title || "");
      setInvitationMessage(data.invitation_message || "");
    }
    setLoading(false);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file.",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload an image smaller than 5MB.",
        variant: "destructive",
      });
      return;
    }

    const url = URL.createObjectURL(file);
    await handleInvitationSave(url);
  };

  const handleInvitationSave = async (url: string) => {
    setSaving(true);
    const { error } = await supabase
      .from('event_configurations')
      .update({ invitation_image_url: url })
      .eq('event_id', eventId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to save invitation image.",
        variant: "destructive",
      });
    } else {
      setInvitationUrl(url);
      toast({
        title: "Success",
        description: "Invitation image saved successfully.",
      });
    }
    setSaving(false);
  };

  const handleContentSave = async () => {
    setSaving(true);
    const { error } = await supabase
      .from('event_configurations')
      .update({
        invitation_title: invitationTitle || null,
        invitation_message: invitationMessage || null,
      })
      .eq('event_id', eventId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to save invitation content.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Invitation content saved successfully.",
      });
    }
    setSaving(false);
  };

  if (loading) {
    return <div className="text-center py-8">Loading invitation...</div>;
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold">Event Invitation</h2>
        <p className="text-sm text-muted-foreground">
          Create and customize your event invitation
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Invitation Image</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {invitationUrl ? (
              <div className="space-y-4">
                <img 
                  src={invitationUrl} 
                  alt="Event Invitation" 
                  className="w-full rounded-lg border"
                />
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1" asChild>
                    <label className="cursor-pointer">
                      <Upload className="h-4 w-4 mr-2" />
                      Replace Image
                      <input 
                        type="file" 
                        className="hidden" 
                        accept="image/*"
                        onChange={handleFileUpload}
                      />
                    </label>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => setCreateModalOpen(true)}
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    Regenerate with AI
                  </Button>
                </div>
              </div>
            ) : (
              <div className="border-2 border-dashed rounded-lg p-12 text-center space-y-4">
                <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                  <Upload className="h-6 w-6 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-medium">No invitation image yet</p>
                  <p className="text-sm text-muted-foreground">Upload an image or create one with AI</p>
                </div>
                <div className="flex gap-2 justify-center">
                  <Button variant="outline" asChild>
                    <label className="cursor-pointer">
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Image
                      <input 
                        type="file" 
                        className="hidden" 
                        accept="image/*"
                        onChange={handleFileUpload}
                      />
                    </label>
                  </Button>
                  <Button onClick={() => setCreateModalOpen(true)}>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Create with AI
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Invitation Content</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="invitation_title">Invitation Title</Label>
              <Input
                id="invitation_title"
                value={invitationTitle}
                onChange={(e) => setInvitationTitle(e.target.value)}
                placeholder={`You're Invited to ${event.name}!`}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="invitation_message">Invitation Message</Label>
              <Textarea
                id="invitation_message"
                value={invitationMessage}
                onChange={(e) => setInvitationMessage(e.target.value)}
                placeholder="Add a personal message to your guests..."
                rows={6}
              />
            </div>

            <Button onClick={handleContentSave} disabled={saving} className="w-full">
              {saving ? "Saving..." : "Save Content"}
            </Button>

            {invitationUrl && (
              <Button variant="outline" className="w-full">
                <Eye className="h-4 w-4 mr-2" />
                Preview Invitation
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      <CreateInvitationModal 
        open={createModalOpen} 
        onOpenChange={setCreateModalOpen}
      />
    </div>
  );
};

export default InvitationTab;
