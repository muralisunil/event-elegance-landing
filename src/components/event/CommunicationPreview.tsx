import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Building2, User, Calendar } from "lucide-react";

interface Recipient {
  type: 'organization' | 'individual';
  id: string;
  name: string;
  email?: string;
  memberCount?: number;
}

interface CommunicationPreviewProps {
  isOpen: boolean;
  onClose: () => void;
  subject: string;
  recipients: Recipient[];
  templateType: string;
  formData: Record<string, any>;
  eventName: string;
}

export const CommunicationPreview = ({
  isOpen,
  onClose,
  subject,
  recipients,
  templateType,
  formData,
  eventName,
}: CommunicationPreviewProps) => {
  const formatFieldValue = (key: string, value: any) => {
    if (!value) return null;

    if (key.includes('date') || key.includes('deadline')) {
      try {
        return new Date(value).toLocaleString();
      } catch {
        return value;
      }
    }

    if (key === 'content' && typeof value === 'string' && value.includes('<')) {
      return <div dangerouslySetInnerHTML={{ __html: value }} />;
    }

    return value;
  };

  const getTotalRecipientCount = () => {
    let count = 0;
    recipients.forEach((r) => {
      if (r.type === 'organization') {
        count += r.memberCount || 0;
      } else {
        count += 1;
      }
    });
    return count;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Preview Communication</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Subject */}
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground mb-2">Subject</h3>
            <p className="text-lg font-medium">{subject}</p>
          </div>

          {/* Recipients Summary */}
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground mb-2">
              Recipients ({getTotalRecipientCount()} total)
            </h3>
            <div className="flex flex-wrap gap-2">
              {recipients.map((recipient) => (
                <Badge
                  key={`${recipient.type}-${recipient.id}`}
                  variant="secondary"
                  className="flex items-center gap-2"
                >
                  {recipient.type === 'organization' ? (
                    <>
                      <Building2 className="h-3 w-3" />
                      {recipient.name} ({recipient.memberCount} members)
                    </>
                  ) : (
                    <>
                      <User className="h-3 w-3" />
                      {recipient.name}
                    </>
                  )}
                </Badge>
              ))}
            </div>
          </div>

          {/* Content Preview */}
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground mb-2">Message Content</h3>
            <div className="border border-border rounded-md p-4 bg-muted/30 space-y-3">
              {Object.entries(formData).map(([key, value]) => {
                const formattedValue = formatFieldValue(key, value);
                if (!formattedValue) return null;

                return (
                  <div key={key}>
                    <div className="text-xs font-semibold text-muted-foreground uppercase mb-1">
                      {key.replace(/_/g, ' ')}
                    </div>
                    <div className="text-sm">{formattedValue}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Metadata */}
          <div className="text-xs text-muted-foreground border-t border-border pt-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-3 w-3" />
              Will be sent on {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
