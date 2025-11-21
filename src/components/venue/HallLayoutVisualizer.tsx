import { VenueHall } from "@/hooks/useVenueDetails";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface HallLayoutVisualizerProps {
  hall: VenueHall;
  obstructions?: Array<{
    id: string;
    obstruction_type: string;
    position_data: string;
    dimensions: string | null;
  }>;
}

export const HallLayoutVisualizer = ({ hall, obstructions = [] }: HallLayoutVisualizerProps) => {
  // Calculate scale to fit visualization (max 400px width)
  const maxWidth = 400;
  const scale = Math.min(maxWidth / hall.dimensions_length, maxWidth / hall.dimensions_width);
  const scaledWidth = hall.dimensions_length * scale;
  const scaledHeight = hall.dimensions_width * scale;

  // Stage dimensions (approximately 15% of length)
  const stageWidth = hall.dimensions_length * 0.15;
  const stageDepth = 10; // Default stage depth
  const scaledStageWidth = stageWidth * scale;
  const scaledStageDepth = stageDepth * scale;

  // Parse obstruction data
  const parsedObstructions = obstructions.map(obs => {
    try {
      const position = JSON.parse(obs.position_data);
      const dims = obs.dimensions ? JSON.parse(obs.dimensions) : { width: 2, height: 2 };
      return {
        ...obs,
        position_x: position.x || 0,
        position_y: position.y || 0,
        width: dims.width || 2,
        height: dims.height || 2,
      };
    } catch {
      return null;
    }
  }).filter(Boolean) as Array<{
    id: string;
    obstruction_type: string;
    position_x: number;
    position_y: number;
    width: number;
    height: number;
  }>;

  // Determine stage position
  const getStagePosition = () => {
    const position = hall.stage_position?.toLowerCase() || 'front';
    switch (position) {
      case 'back':
        return { x: (scaledWidth - scaledStageWidth) / 2, y: scaledHeight - scaledStageDepth };
      case 'left':
        return { x: 0, y: (scaledHeight - scaledStageWidth) / 2, rotated: true };
      case 'right':
        return { x: scaledWidth - scaledStageDepth, y: (scaledHeight - scaledStageWidth) / 2, rotated: true };
      default: // 'front' or 'center'
        return { x: (scaledWidth - scaledStageWidth) / 2, y: 0 };
    }
  };

  const stagePos = hall.has_stage ? getStagePosition() : null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-medium text-muted-foreground">Hall Layout Preview</h4>
          <p className="text-xs text-muted-foreground">2D visualization • Not to exact scale</p>
        </div>
        <Badge variant="outline" className="text-xs">
          {hall.dimensions_length}' × {hall.dimensions_width}'
          {hall.dimensions_height && ` × ${hall.dimensions_height}'H`}
        </Badge>
      </div>

      <Card className="bg-muted/30">
        <CardContent className="p-6">
          <div className="flex justify-center">
            <svg
              width={scaledWidth + 40}
              height={scaledHeight + 40}
              className="border-2 border-border rounded-lg bg-background"
            >
              {/* Hall outline */}
              <rect
                x="20"
                y="20"
                width={scaledWidth}
                height={scaledHeight}
                fill="hsl(var(--muted))"
                stroke="hsl(var(--border))"
                strokeWidth="2"
              />

              {/* Grid pattern for layout reference */}
              <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path
                  d="M 20 0 L 0 0 0 20"
                  fill="none"
                  stroke="hsl(var(--border))"
                  strokeWidth="0.5"
                  opacity="0.3"
                />
              </pattern>
              <rect x="20" y="20" width={scaledWidth} height={scaledHeight} fill="url(#grid)" />

              {/* Stage */}
              {stagePos && (
                <g>
                  {stagePos.rotated ? (
                    <rect
                      x={20 + stagePos.x}
                      y={20 + stagePos.y}
                      width={scaledStageDepth}
                      height={scaledStageWidth}
                      fill="hsl(var(--primary))"
                      opacity="0.7"
                      stroke="hsl(var(--primary))"
                      strokeWidth="2"
                    />
                  ) : (
                    <rect
                      x={20 + stagePos.x}
                      y={20 + stagePos.y}
                      width={scaledStageWidth}
                      height={scaledStageDepth}
                      fill="hsl(var(--primary))"
                      opacity="0.7"
                      stroke="hsl(var(--primary))"
                      strokeWidth="2"
                    />
                  )}
                  <text
                    x={20 + (stagePos.rotated ? stagePos.x + scaledStageDepth / 2 : stagePos.x + scaledStageWidth / 2)}
                    y={20 + (stagePos.rotated ? stagePos.y + scaledStageWidth / 2 : stagePos.y + scaledStageDepth / 2)}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="text-xs fill-primary-foreground font-medium"
                  >
                    Stage
                  </text>
                </g>
              )}

              {/* Obstructions (Pillars) */}
              {parsedObstructions.map((obstruction) => {
                const scaledX = (obstruction.position_x / hall.dimensions_length) * scaledWidth;
                const scaledY = (obstruction.position_y / hall.dimensions_width) * scaledHeight;
                const scaledObsWidth = (obstruction.width / hall.dimensions_length) * scaledWidth;
                const scaledObsHeight = (obstruction.height / hall.dimensions_width) * scaledHeight;

                return (
                  <g key={obstruction.id}>
                    <rect
                      x={20 + scaledX}
                      y={20 + scaledY}
                      width={scaledObsWidth}
                      height={scaledObsHeight}
                      fill="hsl(var(--destructive))"
                      opacity="0.5"
                      stroke="hsl(var(--destructive))"
                      strokeWidth="1"
                    />
                  </g>
                );
              })}

              {/* Lobby indicator if present */}
              {hall.has_lobby && hall.lobby_dimensions && (
                <g>
                  <rect
                    x={scaledWidth - 40}
                    y={scaledHeight - 20}
                    width="60"
                    height="30"
                    fill="hsl(var(--accent))"
                    opacity="0.6"
                    stroke="hsl(var(--accent-foreground))"
                    strokeWidth="1"
                    rx="2"
                  />
                  <text
                    x={scaledWidth - 10}
                    y={scaledHeight - 5}
                    textAnchor="middle"
                    className="text-xs fill-accent-foreground font-medium"
                  >
                    Lobby
                  </text>
                </g>
              )}

              {/* Dimension labels */}
              <text
                x={20 + scaledWidth / 2}
                y="15"
                textAnchor="middle"
                className="text-xs fill-muted-foreground font-medium"
              >
                {hall.dimensions_length} ft
              </text>
              <text
                x="12"
                y={20 + scaledHeight / 2}
                textAnchor="middle"
                dominantBaseline="middle"
                transform={`rotate(-90, 12, ${20 + scaledHeight / 2})`}
                className="text-xs fill-muted-foreground font-medium"
              >
                {hall.dimensions_width} ft
              </text>
            </svg>
          </div>

          {/* Legend */}
          <div className="mt-4 flex flex-wrap gap-4 text-xs">
            {hall.has_stage && (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-primary opacity-70 rounded" />
                <span className="text-muted-foreground">Stage</span>
              </div>
            )}
            {parsedObstructions.length > 0 && (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-destructive opacity-50 rounded" />
                <span className="text-muted-foreground">Obstructions ({parsedObstructions.length})</span>
              </div>
            )}
            {hall.has_lobby && (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-accent opacity-60 rounded" />
                <span className="text-muted-foreground">Lobby Area</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-muted border-2 border-border rounded" />
              <span className="text-muted-foreground">Main Hall</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
