import { VenueHall } from "@/hooks/useVenueDetails";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Maximize2, Users, DollarSign, Layers, MapPin, 
  LayoutGrid, Square, Pencil, Eye, Store
} from "lucide-react";
import { HallLayoutVisualizer } from "./HallLayoutVisualizer";
import { HallLayoutEditor } from "./HallLayoutEditor";
import { LobbyBoothEditor } from "./LobbyBoothEditor";
import { Button } from "@/components/ui/button";
import { useVenueLobbyAreas } from "@/hooks/useVenueLobbyAreas";

interface HallDetailCardProps {
  hall: VenueHall;
  obstructions?: Array<{
    id: string;
    hall_id: string;
    obstruction_type: string;
    position_data: string;
    dimensions: string | null;
  }>;
}

export const HallDetailCard = ({ hall, obstructions = [] }: HallDetailCardProps) => {
  const hallObstructions = obstructions.filter(o => o.hall_id === hall.id);
  const { data: lobbyAreas } = useVenueLobbyAreas(hall.venue_id);
  const lobbyArea = hall.has_lobby && lobbyAreas && lobbyAreas.length > 0 ? lobbyAreas[0] : null;
  
  const getLayoutIcon = () => {
    switch (hall.layout_type) {
      case 'fixed':
        return <LayoutGrid className="h-4 w-4" />;
      case 'configurable':
        return <Pencil className="h-4 w-4" />;
      case 'blank':
        return <Square className="h-4 w-4" />;
      default:
        return <Layers className="h-4 w-4" />;
    }
  };

  const getLayoutDescription = () => {
    switch (hall.layout_type) {
      case 'fixed':
        return 'Pre-configured seating arrangement. Ideal for standardized events.';
      case 'configurable':
        return 'Flexible layout options available. Customize to your needs.';
      case 'blank':
        return 'Empty space for complete creative freedom. Design your own layout.';
      default:
        return '';
    }
  };

  return (
    <Card className="border-2 hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <CardTitle className="text-xl">{hall.hall_name}</CardTitle>
              {!hall.is_available && (
                <Badge variant="destructive">Currently Unavailable</Badge>
              )}
            </div>
            <CardDescription className="mt-2">
              {hall.description || getLayoutDescription()}
            </CardDescription>
          </div>
          <Badge 
            variant={
              hall.layout_type === 'fixed' ? 'default' :
              hall.layout_type === 'configurable' ? 'secondary' : 'outline'
            }
            className="flex items-center gap-1 ml-2"
          >
            {getLayoutIcon()}
            {hall.layout_type.charAt(0).toUpperCase() + hall.layout_type.slice(1)}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Key Specifications */}
        <div>
          <h4 className="text-sm font-semibold mb-3">Key Specifications</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <Maximize2 className="h-4 w-4" />
                <span>Dimensions</span>
              </div>
              <p className="font-semibold">
                {hall.dimensions_length}' × {hall.dimensions_width}'
                {hall.dimensions_height && ` × ${hall.dimensions_height}'H`}
              </p>
              <p className="text-xs text-muted-foreground">
                {(hall.dimensions_length * hall.dimensions_width).toLocaleString()} sq ft
              </p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <Users className="h-4 w-4" />
                <span>Capacity</span>
              </div>
              <p className="font-semibold">{hall.capacity} guests</p>
              <p className="text-xs text-muted-foreground">Maximum occupancy</p>
            </div>

            {hall.pricing_per_day && (
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                  <DollarSign className="h-4 w-4" />
                  <span>Pricing</span>
                </div>
                <p className="font-semibold">${hall.pricing_per_day}/day</p>
                <p className="text-xs text-muted-foreground">Base rate</p>
              </div>
            )}
          </div>
        </div>

        <Separator />

        {/* Features */}
        <div>
          <h4 className="text-sm font-semibold mb-3">Features & Layout</h4>
          <div className="space-y-2">
            {/* Stage Information */}
            <div className="flex items-start justify-between p-3 rounded-lg bg-muted/30">
              <div className="flex items-start gap-3">
                <Layers className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium text-sm">
                    {hall.has_stage ? 'Stage Included' : 'No Stage'}
                  </p>
                  {hall.has_stage && hall.stage_position && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Position: {hall.stage_position.charAt(0).toUpperCase() + hall.stage_position.slice(1)}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Lobby Information */}
            {hall.has_lobby && (
              <div className="flex items-start justify-between p-3 rounded-lg bg-muted/30">
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-accent-foreground mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">Lobby Area Included</p>
                    {hall.lobby_dimensions && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Dimensions: {hall.lobby_dimensions}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Obstructions Warning */}
            {hallObstructions.length > 0 && (
              <div className="flex items-start justify-between p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                <div className="flex items-start gap-3">
                  <Square className="h-5 w-5 text-destructive mt-0.5" />
                  <div>
                    <p className="font-medium text-sm text-destructive">
                      {hallObstructions.length} Obstruction{hallObstructions.length > 1 ? 's' : ''}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Pillars or structural elements present in hall
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <Separator />

        {/* Visual Layout with Tabs */}
        <div>
          <h4 className="text-sm font-semibold mb-3">Hall Layout</h4>
          <Tabs defaultValue="preview" className="w-full">
            <TabsList className={`grid w-full ${hall.has_lobby ? 'grid-cols-3' : 'grid-cols-2'}`}>
              <TabsTrigger value="preview">
                <Eye className="w-4 h-4 mr-2" />
                Preview
              </TabsTrigger>
              <TabsTrigger value="editor">
                <Pencil className="w-4 h-4 mr-2" />
                Interactive Editor
              </TabsTrigger>
              {hall.has_lobby && (
                <TabsTrigger value="lobby">
                  <Store className="w-4 h-4 mr-2" />
                  Lobby & Booths
                </TabsTrigger>
              )}
            </TabsList>
            <TabsContent value="preview" className="mt-4">
              <HallLayoutVisualizer hall={hall} obstructions={hallObstructions} />
            </TabsContent>
            <TabsContent value="editor" className="mt-4">
              <HallLayoutEditor
                hallId={hall.id}
                hallWidth={hall.dimensions_width}
                hallLength={hall.dimensions_length}
                existingLayout={hall.custom_layout_data}
                stagePosition={hall.stage_position}
                hasStage={hall.has_stage}
                obstructions={hallObstructions}
              />
            </TabsContent>
            {hall.has_lobby && lobbyArea && (
              <TabsContent value="lobby" className="mt-4">
                <LobbyBoothEditor
                  lobbyAreaId={lobbyArea.id}
                  lobbyWidth={Number(hall.dimensions_width)}
                  lobbyLength={Number(hall.dimensions_length)}
                  existingLayout={lobbyArea.custom_booth_layout_data}
                  onLayoutSaved={() => {}}
                />
              </TabsContent>
            )}
          </Tabs>
        </div>
      </CardContent>
    </Card>
  );
};
