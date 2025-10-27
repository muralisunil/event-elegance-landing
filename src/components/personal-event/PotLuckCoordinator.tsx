import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { calculateFoodCoverage, getGuestContributions, getMissingCategories, foodCategories } from "@/lib/potLuckHelpers";

interface PotLuckCoordinatorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  eventId: string;
  sessions: any[];
}

export const PotLuckCoordinator = ({ open, onOpenChange, eventId, sessions }: PotLuckCoordinatorProps) => {
  const [allItems, setAllItems] = useState<any[]>([]);
  const [guests, setGuests] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      fetchData();
    }
  }, [open, eventId]);

  const fetchData = async () => {
    setLoading(true);
    
    // Fetch all food items for pot luck sessions
    const sessionIds = sessions.filter(s => s.is_pot_luck_style).map(s => s.id);
    
    if (sessionIds.length > 0) {
      const { data: items } = await supabase
        .from('personal_event_food_items')
        .select(`
          *,
          assigned_guest:personal_event_guests!personal_event_food_items_assigned_guest_id_fkey(id, name)
        `)
        .in('food_session_id', sessionIds);
      
      setAllItems(items || []);
    }

    // Fetch guests
    const { data: guestData } = await supabase
      .from('personal_event_guests')
      .select('*')
      .eq('event_id', eventId);
    
    setGuests(guestData || []);
    setLoading(false);
  };

  const coverage = calculateFoodCoverage(allItems);
  const contributions = getGuestContributions(allItems, guests);
  const missingCategories = getMissingCategories(coverage);

  const getCoveragePercentage = (cat: { total: number; confirmed: number; pending: number }) => {
    if (cat.total === 0) return 0;
    return (cat.confirmed / cat.total) * 100;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>🥘 Pot Luck Coordination Dashboard</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="text-center py-8">Loading...</div>
        ) : (
          <div className="space-y-6">
            {/* Coverage Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Food Category Coverage</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {foodCategories.map((category) => {
                  const cat = coverage[category.value];
                  const percentage = getCoveragePercentage(cat);
                  
                  return (
                    <div key={category.value} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{category.label}</span>
                        <div className="flex gap-2">
                          {cat.confirmed > 0 && (
                            <Badge variant="default" className="text-xs">
                              {cat.confirmed} confirmed
                            </Badge>
                          )}
                          {cat.pending > 0 && (
                            <Badge variant="secondary" className="text-xs">
                              {cat.pending} pending
                            </Badge>
                          )}
                          {cat.total === 0 && (
                            <Badge variant="outline" className="text-xs">
                              None yet
                            </Badge>
                          )}
                        </div>
                      </div>
                      <Progress value={percentage} className="h-2" />
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {/* Missing Categories */}
            {missingCategories.length > 0 && (
              <Card className="border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-950/20">
                <CardHeader>
                  <CardTitle className="text-yellow-900 dark:text-yellow-200">Still Needed</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-yellow-800 dark:text-yellow-300">
                    These categories don't have any items yet: <strong>{missingCategories.join(', ')}</strong>
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Guest Contributions */}
            <Card>
              <CardHeader>
                <CardTitle>Guest Contributions</CardTitle>
              </CardHeader>
              <CardContent>
                {Object.keys(contributions).length === 0 ? (
                  <p className="text-sm text-muted-foreground">No guest assignments yet.</p>
                ) : (
                  <div className="space-y-3">
                    {Object.entries(contributions).map(([guestId, items]) => {
                      const guest = guests.find(g => g.id === guestId);
                      if (!guest) return null;
                      
                      return (
                        <div key={guestId} className="flex items-start justify-between p-3 rounded-lg border">
                          <div>
                            <p className="font-medium">{guest.name}</p>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {(items as any[]).map((item: any) => (
                                <Badge key={item.id} variant="outline" className="text-xs">
                                  {item.status === 'confirmed' ? '✅' : '⏳'} {item.item_name}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <Badge variant="secondary">
                            {(items as any[]).length} item{(items as any[]).length !== 1 ? 's' : ''}
                          </Badge>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Summary Stats */}
            <div className="grid grid-cols-3 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold">{allItems.length}</div>
                    <div className="text-xs text-muted-foreground">Total Items</div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {allItems.filter(i => i.status === 'confirmed').length}
                    </div>
                    <div className="text-xs text-muted-foreground">Confirmed</div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-600">
                      {allItems.filter(i => i.status === 'pending').length}
                    </div>
                    <div className="text-xs text-muted-foreground">Pending</div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
