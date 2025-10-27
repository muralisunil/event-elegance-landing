import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface StatusChangeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: "blocked" | "complete" | null;
  onConfirm: (data: { reason?: string; actualHours?: number }) => void;
}

export const StatusChangeDialog = ({ open, onOpenChange, type, onConfirm }: StatusChangeDialogProps) => {
  const [reason, setReason] = useState("");
  const [actualHours, setActualHours] = useState("");

  const handleConfirm = () => {
    if (type === "blocked") {
      onConfirm({ reason });
    } else if (type === "complete") {
      onConfirm({ actualHours: actualHours ? parseFloat(actualHours) : undefined });
    }
    setReason("");
    setActualHours("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {type === "blocked" ? "Mark Task as Blocked" : "Mark Task as Complete"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {type === "blocked" && (
            <div className="space-y-2">
              <Label htmlFor="reason">What's blocking this task?</Label>
              <Textarea
                id="reason"
                placeholder="Describe the blocker..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="min-h-[100px]"
              />
            </div>
          )}

          {type === "complete" && (
            <div className="space-y-2">
              <Label htmlFor="actualHours">Actual Hours Worked (optional)</Label>
              <Input
                id="actualHours"
                type="number"
                step="0.5"
                min="0"
                placeholder="e.g., 3.5"
                value={actualHours}
                onChange={(e) => setActualHours(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Track how long this task actually took to complete
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleConfirm}>
            Confirm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
