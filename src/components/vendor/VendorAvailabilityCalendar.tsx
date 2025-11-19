import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useVendorAvailability } from "@/hooks/useVendorAvailability";
import { format } from "date-fns";

interface VendorAvailabilityCalendarProps {
  vendorId: string;
  canEdit?: boolean;
}

export const VendorAvailabilityCalendar = ({ vendorId, canEdit = false }: VendorAvailabilityCalendarProps) => {
  const { availability, loading, setDateAvailability, isDateAvailable } = useVendorAvailability(vendorId);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [notes, setNotes] = useState("");

  const handleDateSelect = (date: Date | undefined) => {
    if (!canEdit || !date) return;
    setSelectedDate(date);
    setDialogOpen(true);
  };

  const handleSetUnavailable = async () => {
    if (!selectedDate) return;
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    await setDateAvailability(dateStr, false, notes);
    setDialogOpen(false);
    setNotes("");
  };

  const handleSetAvailable = async () => {
    if (!selectedDate) return;
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    await setDateAvailability(dateStr, true);
    setDialogOpen(false);
  };

  const modifiers = {
    unavailable: (date: Date) => {
      const dateStr = format(date, 'yyyy-MM-dd');
      return !isDateAvailable(dateStr);
    },
  };

  const modifiersClassNames = {
    unavailable: "bg-destructive text-destructive-foreground",
  };

  if (loading) {
    return <div>Loading availability...</div>;
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Availability Calendar</CardTitle>
          <CardDescription>
            {canEdit 
              ? "Click on dates to set your availability" 
              : "View vendor's available dates"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleDateSelect}
            modifiers={modifiers}
            modifiersClassNames={modifiersClassNames}
            className="rounded-md border"
            disabled={!canEdit}
          />
          {!canEdit && (
            <div className="mt-4 text-sm text-muted-foreground">
              <span className="inline-block w-4 h-4 bg-destructive rounded mr-2"></span>
              Unavailable dates
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Set Availability</DialogTitle>
            <DialogDescription>
              Set your availability for {selectedDate && format(selectedDate, 'MMMM dd, yyyy')}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="E.g., Booked for another event"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSetUnavailable} variant="destructive" className="flex-1">
                Mark Unavailable
              </Button>
              <Button onClick={handleSetAvailable} className="flex-1">
                Mark Available
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
