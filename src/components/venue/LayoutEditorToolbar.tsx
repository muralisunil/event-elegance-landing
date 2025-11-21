import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { 
  Square, 
  Circle, 
  Trash2, 
  ZoomIn, 
  ZoomOut, 
  Grid3x3, 
  Move,
  Save,
  RotateCw,
  Copy
} from "lucide-react";

interface LayoutEditorToolbarProps {
  onAddTable: () => void;
  onAddChair: () => void;
  onDelete: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onToggleGrid: () => void;
  onTogglePan: () => void;
  onSave: () => void;
  onRotate: () => void;
  onDuplicate: () => void;
  gridEnabled: boolean;
  panMode: boolean;
  hasSelection: boolean;
  zoom: number;
}

export const LayoutEditorToolbar = ({
  onAddTable,
  onAddChair,
  onDelete,
  onZoomIn,
  onZoomOut,
  onToggleGrid,
  onTogglePan,
  onSave,
  onRotate,
  onDuplicate,
  gridEnabled,
  panMode,
  hasSelection,
  zoom,
}: LayoutEditorToolbarProps) => {
  return (
    <div className="flex items-center gap-2 p-3 bg-card border-b border-border flex-wrap">
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="sm"
          onClick={onAddTable}
          title="Add Table (Square)"
        >
          <Square className="w-4 h-4 mr-1" />
          Table
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onAddChair}
          title="Add Chair (Circle)"
        >
          <Circle className="w-4 h-4 mr-1" />
          Chair
        </Button>
      </div>

      <Separator orientation="vertical" className="h-8" />

      <div className="flex items-center gap-1">
        <Button
          variant={panMode ? "secondary" : "outline"}
          size="sm"
          onClick={onTogglePan}
          title="Pan Mode"
        >
          <Move className="w-4 h-4" />
        </Button>
        <Button
          variant={gridEnabled ? "secondary" : "outline"}
          size="sm"
          onClick={onToggleGrid}
          title="Toggle Grid"
        >
          <Grid3x3 className="w-4 h-4" />
        </Button>
      </div>

      <Separator orientation="vertical" className="h-8" />

      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="sm"
          onClick={onZoomIn}
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onZoomOut}
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </Button>
        <Badge variant="secondary" className="text-xs">
          {Math.round(zoom * 100)}%
        </Badge>
      </div>

      <Separator orientation="vertical" className="h-8" />

      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="sm"
          onClick={onRotate}
          disabled={!hasSelection}
          title="Rotate Selected"
        >
          <RotateCw className="w-4 h-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onDuplicate}
          disabled={!hasSelection}
          title="Duplicate Selected"
        >
          <Copy className="w-4 h-4" />
        </Button>
        <Button
          variant="destructive"
          size="sm"
          onClick={onDelete}
          disabled={!hasSelection}
          title="Delete Selected"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>

      <Separator orientation="vertical" className="h-8" />

      <Button
        variant="default"
        size="sm"
        onClick={onSave}
        title="Save Layout"
      >
        <Save className="w-4 h-4 mr-1" />
        Save Layout
      </Button>
    </div>
  );
};
