import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { UtensilsCrossed, Calendar } from "lucide-react";
import { format } from "date-fns";

interface GuestViewFoodProps {
  foodSessions: any[];
  isPotLuck?: boolean;
  onBringItem?: (sessionId: string) => void;
}

export const GuestViewFood = ({ foodSessions, isPotLuck, onBringItem }: GuestViewFoodProps) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Food Planning</h2>
        {isPotLuck && (
          <Badge variant="secondary">
            <UtensilsCrossed className="h-3 w-3 mr-1" />
            Pot Luck
          </Badge>
        )}
      </div>

      {foodSessions.map((session) => (
        <Card key={session.id}>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-lg">{session.meal_type}</CardTitle>
                <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>{format(new Date(session.session_date), 'MMM d, yyyy')}</span>
                  {session.session_time && <span>at {session.session_time}</span>}
                </div>
              </div>
              {isPotLuck && onBringItem && (
                <Button onClick={() => onBringItem(session.id)} variant="outline" size="sm">
                  I'll Bring Something
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {session.food_items && session.food_items.length > 0 ? (
              <div className="space-y-2">
                {session.food_items.map((item: any) => (
                  <div key={item.id} className="flex items-center justify-between py-2 border-b last:border-0">
                    <div>
                      <p className="font-medium">{item.item_name}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Badge variant="outline" className="text-xs">{item.food_type}</Badge>
                        {item.quantity && <span>Qty: {item.quantity}</span>}
                      </div>
                    </div>
                    {item.source && (
                      <Badge variant="secondary">{item.source}</Badge>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No items planned yet</p>
            )}
          </CardContent>
        </Card>
      ))}

      {foodSessions.length === 0 && (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No food sessions planned yet
          </CardContent>
        </Card>
      )}
    </div>
  );
};
