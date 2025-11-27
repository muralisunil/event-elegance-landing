import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { RecipientPicker } from "./RecipientPicker";
import { TemplateForm } from "./TemplateForm";
import { CommunicationPreview } from "./CommunicationPreview";
import { communicationTemplates } from "@/lib/communicationTemplates";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Send, Eye } from "lucide-react";

interface Recipient {
  type: 'organization' | 'individual';
  id: string;
  name: string;
  email?: string;
  memberCount?: number;
}

interface MeetingInvitationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  eventId: string;
  eventName: string;
}

export const MeetingInvitationDialog = ({
  isOpen,
  onClose,
  eventId,
  eventName,
}: MeetingInvitationDialogProps) => {
  const { toast } = useToast();
  const [subject, setSubject] = useState("");
  const [selectedRecipients, setSelectedRecipients] = useState<Recipient[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [showPreview, setShowPreview] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const handleTemplateChange = (templateType: string) => {
    setSelectedTemplate(templateType);
    setFormData({});
    
    const template = communicationTemplates[templateType];
    if (template) {
      const defaultSubject = template.defaultSubject.replace('{eventName}', eventName);
      setSubject(defaultSubject);
    }
  };

  // Silent validation for button disabled state (no toasts)
  const isFormValid = () => {
    if (!subject.trim()) return false;
    if (selectedRecipients.length === 0) return false;
    if (!selectedTemplate) return false;

    const template = communicationTemplates[selectedTemplate];
    if (template) {
      const requiredFields = template.fields.filter((f) => f.required);
      const missingFields = requiredFields.filter((f) => !formData[f.name]);
      if (missingFields.length > 0) return false;
    }

    return true;
  };

  // Validation with toast messages (for submit action)
  const validateForm = () => {
    if (!subject.trim()) {
      toast({
        title: "Subject Required",
        description: "Please enter a subject for your communication",
        variant: "destructive",
      });
      return false;
    }

    if (selectedRecipients.length === 0) {
      toast({
        title: "Recipients Required",
        description: "Please select at least one recipient",
        variant: "destructive",
      });
      return false;
    }

    if (!selectedTemplate) {
      toast({
        title: "Template Required",
        description: "Please select a template",
        variant: "destructive",
      });
      return false;
    }

    const template = communicationTemplates[selectedTemplate];
    if (template) {
      const requiredFields = template.fields.filter((f) => f.required);
      const missingFields = requiredFields.filter((f) => !formData[f.name]);
      
      if (missingFields.length > 0) {
        toast({
          title: "Required Fields Missing",
          description: `Please fill in: ${missingFields.map((f) => f.label).join(', ')}`,
          variant: "destructive",
        });
        return false;
      }
    }

    return true;
  };

  const handleSend = async () => {
    if (!validateForm()) return;

    setIsSending(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Create communication record
      const { data: communication, error: commError } = await supabase
        .from("outreach_communications")
        .insert({
          event_id: eventId,
          sender_id: user.id,
          subject,
          template_type: selectedTemplate,
          content: formData,
        })
        .select()
        .single();

      if (commError) throw commError;

      // Create recipient records
      const recipientRecords = selectedRecipients.map((recipient) => ({
        communication_id: communication.id,
        recipient_type: recipient.type,
        organization_id: recipient.type === 'organization' ? recipient.id : null,
        user_id: recipient.type === 'individual' ? recipient.id : null,
        sent_status: 'sent',
      }));

      const { error: recipientError } = await supabase
        .from("outreach_communication_recipients")
        .insert(recipientRecords);

      if (recipientError) throw recipientError;

      toast({
        title: "Communication Sent",
        description: `Successfully sent to ${selectedRecipients.length} recipient(s)`,
      });

      // Reset form and close
      setSubject("");
      setSelectedRecipients([]);
      setSelectedTemplate("");
      setFormData({});
      onClose();
    } catch (error: any) {
      console.error("Error sending communication:", error);
      toast({
        title: "Send Failed",
        description: error.message || "Failed to send communication",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  const currentTemplate = selectedTemplate ? communicationTemplates[selectedTemplate] : null;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Send Communication</DialogTitle>
            <DialogDescription>
              Send a message to organizations and individuals about {eventName}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Subject */}
            <div className="space-y-2">
              <Label htmlFor="subject">Subject *</Label>
              <Input
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Enter subject line"
              />
            </div>

            <Separator />

            {/* Recipients */}
            <div className="space-y-2">
              <Label>To: *</Label>
              <RecipientPicker
                selectedRecipients={selectedRecipients}
                onChange={setSelectedRecipients}
              />
            </div>

            <Separator />

            {/* Template Selection */}
            <div className="space-y-2">
              <Label htmlFor="template">Template *</Label>
              <Select value={selectedTemplate} onValueChange={handleTemplateChange}>
                <SelectTrigger id="template">
                  <SelectValue placeholder="Select a template" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(communicationTemplates).map(([key, template]) => {
                    const Icon = template.icon;
                    return (
                      <SelectItem key={key} value={key}>
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4" />
                          {template.name}
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            {/* Template Form */}
            {currentTemplate && (
              <>
                <Separator />
                <div className="space-y-2">
                  <Label className="text-lg font-semibold">Message Details</Label>
                  <TemplateForm
                    fields={currentTemplate.fields}
                    formData={formData}
                    onChange={setFormData}
                  />
                </div>
              </>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPreview(true)} disabled={!isFormValid()}>
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </Button>
            <Button onClick={handleSend} disabled={isSending}>
              <Send className="h-4 w-4 mr-2" />
              {isSending ? "Sending..." : "Send"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <CommunicationPreview
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        subject={subject}
        recipients={selectedRecipients}
        templateType={selectedTemplate}
        formData={formData}
        eventName={eventName}
      />
    </>
  );
};
