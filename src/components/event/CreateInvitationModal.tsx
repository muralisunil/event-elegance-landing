import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Sparkles, Rocket } from "lucide-react";

interface CreateInvitationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CreateInvitationModal = ({ open, onOpenChange }: CreateInvitationModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            AI Invitation Designer
          </DialogTitle>
          <DialogDescription>
            Create stunning event invitations powered by AI
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 rounded-lg p-8 text-center">
            <Rocket className="h-16 w-16 mx-auto mb-4 text-primary animate-pulse" />
            <h3 className="text-2xl font-bold mb-2">Coming Soon!</h3>
            <p className="text-muted-foreground">
              Our AI-powered invitation designer is currently in development. 
              Soon you'll be able to create beautiful, custom event invitations 
              with just a few clicks.
            </p>
          </div>

          <div className="space-y-3 text-sm text-muted-foreground">
            <p className="font-medium">What to expect:</p>
            <ul className="space-y-2 list-disc list-inside">
              <li>Choose from dozens of professional templates</li>
              <li>Customize colors, fonts, and layouts</li>
              <li>AI-generated design suggestions</li>
              <li>Instant preview and download</li>
            </ul>
          </div>

          <Button onClick={() => onOpenChange(false)} className="w-full">
            Got It!
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
