import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Package } from "lucide-react";

interface GuestViewLogisticsProps {
  logistics: any[];
}

export const GuestViewLogistics = ({ logistics }: GuestViewLogisticsProps) => {
  const groupedByCategory: Record<string, any[]> = logistics.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, any[]>);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Logistics</h2>
        <Badge variant="secondary">
          <Package className="h-3 w-3 mr-1" />
          {logistics.length} item{logistics.length !== 1 ? 's' : ''}
        </Badge>
      </div>

      {Object.entries(groupedByCategory).map(([category, items]) => (
        <Card key={category}>
          <CardHeader>
            <CardTitle className="text-lg capitalize">{category}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {items.map((item) => (
                <div key={item.id} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div className="flex-1">
                    <p className="font-medium">{item.item_name}</p>
                    {item.quantity && (
                      <p className="text-sm text-muted-foreground">Quantity: {item.quantity}</p>
                    )}
                  </div>
                  <Badge 
                    variant={item.status === 'completed' ? 'default' : 'outline'}
                    className="capitalize"
                  >
                    {item.status || 'planned'}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}

      {logistics.length === 0 && (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No logistics items yet
          </CardContent>
        </Card>
      )}
    </div>
  );
};
