import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Building2 } from "lucide-react";
import { useEventVenueBookings } from "@/hooks/useEventVenueBookings";
import { useVenues } from "@/hooks/useVenues";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface BookVenueDialogProps {
  eventId: string;
}

export const BookVenueDialog = ({ eventId }: BookVenueDialogProps) => {
  const [open, setOpen] = useState(false);
  const [venueId, setVenueId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [totalCost, setTotalCost] = useState("");
  const [specialRequirements, setSpecialRequirements] = useState("");
  const [notes, setNotes] = useState("");

  const { createBooking } = useEventVenueBookings(eventId);
  const { venues } = useVenues();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!venueId || !startDate || !endDate) {
      return;
    }

    await createBooking.mutateAsync({
      event_id: eventId,
      venue_id: venueId,
      start_date: startDate,
      end_date: endDate,
      total_cost: totalCost ? parseFloat(totalCost) : undefined,
      special_requirements: specialRequirements || undefined,
      notes: notes || undefined,
    });

    setOpen(false);
    setVenueId("");
    setStartDate("");
    setEndDate("");
    setTotalCost("");
    setSpecialRequirements("");
    setNotes("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Building2 className="w-4 h-4 mr-2" />
          Book Venue
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Book Venue for Event</DialogTitle>
          <DialogDescription>
            Reserve a venue for your event. You can book the entire venue or individual halls.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="venue">Venue</Label>
            <Select value={venueId} onValueChange={setVenueId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a venue" />
              </SelectTrigger>
              <SelectContent>
                {venues?.map((venue) => (
                  <SelectItem key={venue.id} value={venue.id}>
                    {venue.name} - {venue.city}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="totalCost">Total Cost (optional)</Label>
            <Input
              id="totalCost"
              type="number"
              step="0.01"
              placeholder="0.00"
              value={totalCost}
              onChange={(e) => setTotalCost(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="specialRequirements">Special Requirements</Label>
            <Textarea
              id="specialRequirements"
              placeholder="Any special setup or requirements..."
              value={specialRequirements}
              onChange={(e) => setSpecialRequirements(e.target.value)}
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Additional notes..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createBooking.isPending}>
              {createBooking.isPending ? "Booking..." : "Book Venue"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
