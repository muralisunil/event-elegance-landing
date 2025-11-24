import { useEffect, useRef, useState } from "react";
import { Canvas as FabricCanvas, Rect, Circle, FabricObject, Text, Group } from "fabric";
import { Card, CardContent } from "@/components/ui/card";
import { LayoutEditorToolbar } from "./LayoutEditorToolbar";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { StageVisibilityCalculator } from "@/lib/stageVisibilityCalculator";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface ExtendedFabricObject extends FabricObject {
  isGridLine?: boolean;
  isStage?: boolean;
  isObstruction?: boolean;
  visibilityLabel?: Text;
  visibilityPercentage?: number;
  itemLabel?: Text;
  itemType?: 'table' | 'chair' | 'row';
  itemName?: string;
  chairNumber?: string;
  rowName?: string;
}

interface HallLayoutEditorProps {
  hallId: string;
  hallWidth: number;
  hallLength: number;
  existingLayout?: string | null;
  stagePosition?: string | null;
  hasStage?: boolean;
  obstructions?: Array<{
    id: string;
    hall_id: string;
    obstruction_type: string;
    position_data: string;
    dimensions: string | null;
  }>;
  onLayoutSaved?: () => void;
}

export const HallLayoutEditor = ({
  hallId,
  hallWidth,
  hallLength,
  existingLayout,
  stagePosition = null,
  hasStage = false,
  obstructions = [],
  onLayoutSaved,
}: HallLayoutEditorProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [fabricCanvas, setFabricCanvas] = useState<FabricCanvas | null>(null);
  const [gridEnabled, setGridEnabled] = useState(true);
  const [panMode, setPanMode] = useState(false);
  const [hasSelection, setHasSelection] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [isSaving, setIsSaving] = useState(false);
  const visibilityCalculatorRef = useRef<StageVisibilityCalculator | null>(null);
  const [chairCounter, setChairCounter] = useState(1);
  const [rowCounter, setRowCounter] = useState(1);
  const [editingLabel, setEditingLabel] = useState(false);
  const [labelInput, setLabelInput] = useState("");

  const GRID_SIZE = 20;
  const SCALE_FACTOR = 5; // 5 pixels per foot
  const canvasWidth = hallLength * SCALE_FACTOR;
  const canvasHeight = hallWidth * SCALE_FACTOR;

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = new FabricCanvas(canvasRef.current, {
      width: Math.min(canvasWidth, 1000),
      height: Math.min(canvasHeight, 600),
      backgroundColor: "#f8f9fa",
      selection: true,
    });

    // Initialize visibility calculator
    visibilityCalculatorRef.current = new StageVisibilityCalculator(
      hallWidth,
      hallLength,
      stagePosition,
      hasStage,
      obstructions,
      SCALE_FACTOR
    );

    // Enable object snapping to grid and update visibility
    canvas.on("object:moving", (e) => {
      if (gridEnabled && e.target) {
        e.target.set({
          left: Math.round((e.target.left || 0) / GRID_SIZE) * GRID_SIZE,
          top: Math.round((e.target.top || 0) / GRID_SIZE) * GRID_SIZE,
        });
      }
      const extObj = e.target as ExtendedFabricObject;
      updateVisibilityForObject(extObj);
      
      // Update label position if it exists
      if (extObj.itemLabel) {
        if (extObj.itemType === 'chair') {
          extObj.itemLabel.set({
            left: extObj.left || 0,
            top: extObj.top || 0,
          });
        } else if (extObj.itemType === 'row') {
          extObj.itemLabel.set({
            left: (extObj.left || 0) + (extObj.width || 0) / 2,
            top: (extObj.top || 0) + (extObj.height || 0) / 2,
          });
        }
      }
    });

    canvas.on("object:modified", (e) => {
      updateVisibilityForObject(e.target as ExtendedFabricObject);
    });

    // Track selection
    canvas.on("selection:created", () => setHasSelection(true));
    canvas.on("selection:updated", () => setHasSelection(true));
    canvas.on("selection:cleared", () => setHasSelection(false));

    // Draw stage if present
    if (hasStage && stagePosition) {
      drawStage(canvas);
    }

    // Draw obstructions
    drawObstructions(canvas);

    // Load existing layout if available
    if (existingLayout) {
      try {
        const layoutData = JSON.parse(existingLayout);
        canvas.loadFromJSON(layoutData, () => {
          // Update visibility for all loaded objects
          const objects = canvas.getObjects();
          objects.forEach((obj) => {
            const extObj = obj as ExtendedFabricObject;
            if (!extObj.isGridLine && !extObj.isStage && !extObj.isObstruction) {
              updateVisibilityForObject(extObj);
            }
          });
          canvas.renderAll();
          toast.success("Layout loaded successfully");
        });
      } catch (error) {
        console.error("Error loading layout:", error);
        toast.error("Failed to load existing layout");
      }
    }

    setFabricCanvas(canvas);

    return () => {
      canvas.dispose();
    };
  }, [hallId, canvasWidth, canvasHeight, existingLayout]);

  // Draw grid
  useEffect(() => {
    if (!fabricCanvas || !gridEnabled) return;

    const drawGrid = () => {
      const width = fabricCanvas.width || 0;
      const height = fabricCanvas.height || 0;

      // Remove existing grid lines
      const objects = fabricCanvas.getObjects();
      objects.forEach((obj) => {
        const extObj = obj as ExtendedFabricObject;
        if (extObj.isGridLine) {
          fabricCanvas.remove(obj);
        }
      });

      // Draw vertical lines
      for (let i = 0; i < width; i += GRID_SIZE) {
        const line = new Rect({
          left: i,
          top: 0,
          width: 1,
          height: height,
          fill: "#e5e7eb",
          opacity: 0.3,
          selectable: false,
          evented: false,
        }) as ExtendedFabricObject;
        line.isGridLine = true;
        fabricCanvas.add(line);
        fabricCanvas.sendObjectToBack(line);
      }

      // Draw horizontal lines
      for (let i = 0; i < height; i += GRID_SIZE) {
        const line = new Rect({
          left: 0,
          top: i,
          width: width,
          height: 1,
          fill: "#e5e7eb",
          opacity: 0.3,
          selectable: false,
          evented: false,
        }) as ExtendedFabricObject;
        line.isGridLine = true;
        fabricCanvas.add(line);
        fabricCanvas.sendObjectToBack(line);
      }

      fabricCanvas.renderAll();
    };

    drawGrid();
  }, [fabricCanvas, gridEnabled]);

  const drawStage = (canvas: FabricCanvas) => {
    if (!stagePosition) return;

    const width = canvas.width || 0;
    const height = canvas.height || 0;
    const stageDepth = 60;
    const stageWidth = Math.min(width * 0.6, 300);

    let stageRect: Rect;
    switch (stagePosition) {
      case 'front':
        stageRect = new Rect({
          left: (width - stageWidth) / 2,
          top: 10,
          width: stageWidth,
          height: stageDepth,
          fill: "#f59e0b",
          stroke: "#d97706",
          strokeWidth: 2,
          selectable: false,
          evented: false,
          opacity: 0.7,
        });
        break;
      case 'back':
        stageRect = new Rect({
          left: (width - stageWidth) / 2,
          top: height - stageDepth - 10,
          width: stageWidth,
          height: stageDepth,
          fill: "#f59e0b",
          stroke: "#d97706",
          strokeWidth: 2,
          selectable: false,
          evented: false,
          opacity: 0.7,
        });
        break;
      case 'left':
        stageRect = new Rect({
          left: 10,
          top: (height - stageWidth) / 2,
          width: stageDepth,
          height: stageWidth,
          fill: "#f59e0b",
          stroke: "#d97706",
          strokeWidth: 2,
          selectable: false,
          evented: false,
          opacity: 0.7,
        });
        break;
      case 'right':
        stageRect = new Rect({
          left: width - stageDepth - 10,
          top: (height - stageWidth) / 2,
          width: stageDepth,
          height: stageWidth,
          fill: "#f59e0b",
          stroke: "#d97706",
          strokeWidth: 2,
          selectable: false,
          evented: false,
          opacity: 0.7,
        });
        break;
      default:
        return;
    }

    const extStageRect = stageRect as ExtendedFabricObject;
    extStageRect.isStage = true;
    canvas.add(stageRect);

    const stageLabel = new Text("STAGE", {
      left: (stageRect.left || 0) + (stageRect.width || 0) / 2,
      top: (stageRect.top || 0) + (stageRect.height || 0) / 2,
      fontSize: 14,
      fontWeight: "bold",
      fill: "hsl(var(--accent-foreground))",
      originX: "center",
      originY: "center",
      selectable: false,
      evented: false,
    });
    canvas.add(stageLabel);
  };

  const drawObstructions = (canvas: FabricCanvas) => {
    obstructions.forEach((obs) => {
      try {
        const position = JSON.parse(obs.position_data);
        const dimensions = obs.dimensions ? JSON.parse(obs.dimensions) : null;

        if (!dimensions) return;

        const obstruction = new Rect({
          left: (position.x || 0) * SCALE_FACTOR,
          top: (position.y || 0) * SCALE_FACTOR,
          width: (dimensions.width || 20) * SCALE_FACTOR,
          height: (dimensions.height || 20) * SCALE_FACTOR,
          fill: "hsl(var(--muted-foreground))",
          stroke: "hsl(var(--border))",
          strokeWidth: 2,
          selectable: false,
          evented: false,
          opacity: 0.5,
        }) as ExtendedFabricObject;

        obstruction.isObstruction = true;
        canvas.add(obstruction);
      } catch (error) {
        console.error("Error drawing obstruction:", error);
      }
    });
  };

  const updateVisibilityForObject = (obj: ExtendedFabricObject) => {
    if (!visibilityCalculatorRef.current || !fabricCanvas) return;
    if (obj.isGridLine || obj.isStage || obj.isObstruction) return;

    const visibility = visibilityCalculatorRef.current.calculateVisibility(
      obj.left || 0,
      obj.top || 0,
      obj.width || 80,
      obj.height || 80
    );

    obj.visibilityPercentage = visibility;

    // Remove old label if exists
    if (obj.visibilityLabel) {
      fabricCanvas.remove(obj.visibilityLabel);
    }

    // Create new visibility label
    const label = new Text(`${visibility}%`, {
      left: (obj.left || 0) + (obj.width || 80) / 2,
      top: (obj.top || 0) + (obj.height || 80) / 2,
      fontSize: 12,
      fontWeight: "bold",
      fill: "white",
      backgroundColor: StageVisibilityCalculator.getVisibilityColor(visibility),
      originX: "center",
      originY: "center",
      selectable: false,
      evented: false,
      padding: 4,
    });

    obj.visibilityLabel = label;
    fabricCanvas.add(label);
    fabricCanvas.renderAll();
  };

  const addTable = () => {
    if (!fabricCanvas) return;

    const rowName = `Row ${rowCounter}`;
    const table = new Rect({
      left: 100,
      top: 100,
      fill: "hsl(var(--primary))",
      width: 120,
      height: 40,
      stroke: "hsl(var(--primary-foreground))",
      strokeWidth: 2,
      opacity: 0.8,
    }) as ExtendedFabricObject;

    table.itemType = 'row';
    table.rowName = rowName;

    const label = new Text(rowName, {
      left: 100 + 60,
      top: 100 + 20,
      fontSize: 14,
      fontWeight: "bold",
      fill: "white",
      originX: "center",
      originY: "center",
      selectable: false,
      evented: false,
    });

    table.itemLabel = label;

    fabricCanvas.add(table);
    fabricCanvas.add(label);
    fabricCanvas.setActiveObject(table);
    updateVisibilityForObject(table);
    fabricCanvas.renderAll();
    
    setRowCounter(rowCounter + 1);
    toast.success(`${rowName} added - Click to rename`);
  };

  const addChair = () => {
    if (!fabricCanvas) return;

    const chairNumber = `${chairCounter}`;
    const chair = new Circle({
      left: 100,
      top: 100,
      fill: "#10b981",
      radius: 20,
      stroke: "#059669",
      strokeWidth: 2,
      opacity: 0.8,
    }) as ExtendedFabricObject;

    chair.itemType = 'chair';
    chair.chairNumber = chairNumber;

    const label = new Text(chairNumber, {
      left: 100,
      top: 100,
      fontSize: 12,
      fontWeight: "bold",
      fill: "white",
      originX: "center",
      originY: "center",
      selectable: false,
      evented: false,
    });

    chair.itemLabel = label;

    fabricCanvas.add(chair);
    fabricCanvas.add(label);
    fabricCanvas.setActiveObject(chair);
    updateVisibilityForObject(chair);
    fabricCanvas.renderAll();
    
    setChairCounter(chairCounter + 1);
    toast.success(`Chair #${chairNumber} added - Click to rename`);
  };

  const deleteSelected = () => {
    if (!fabricCanvas) return;

    const activeObjects = fabricCanvas.getActiveObjects();
    if (activeObjects.length === 0) return;

    activeObjects.forEach((obj) => {
      const extObj = obj as ExtendedFabricObject;
      // Remove visibility label if exists
      if (extObj.visibilityLabel) {
        fabricCanvas.remove(extObj.visibilityLabel);
      }
      // Remove item label if exists
      if (extObj.itemLabel) {
        fabricCanvas.remove(extObj.itemLabel);
      }
      fabricCanvas.remove(obj);
    });

    fabricCanvas.discardActiveObject();
    fabricCanvas.renderAll();
    toast.success("Object(s) deleted");
  };

  const renameSelected = () => {
    if (!fabricCanvas) return;
    const activeObject = fabricCanvas.getActiveObject() as ExtendedFabricObject;
    if (!activeObject || (!activeObject.itemType)) return;

    const currentName = activeObject.itemType === 'chair' 
      ? activeObject.chairNumber 
      : activeObject.rowName;
    
    setLabelInput(currentName || "");
    setEditingLabel(true);
  };

  const applyLabelChange = () => {
    if (!fabricCanvas || !labelInput.trim()) {
      setEditingLabel(false);
      return;
    }

    const activeObject = fabricCanvas.getActiveObject() as ExtendedFabricObject;
    if (!activeObject || !activeObject.itemType) {
      setEditingLabel(false);
      return;
    }

    // Update the item name
    if (activeObject.itemType === 'chair') {
      activeObject.chairNumber = labelInput;
    } else if (activeObject.itemType === 'row') {
      activeObject.rowName = labelInput;
    }

    // Update the label text
    if (activeObject.itemLabel) {
      activeObject.itemLabel.set({ text: labelInput });
    }

    fabricCanvas.renderAll();
    toast.success(`Renamed to "${labelInput}"`);
    setEditingLabel(false);
    setLabelInput("");
  };

  const handleZoomIn = () => {
    if (!fabricCanvas) return;
    const newZoom = Math.min(zoom + 0.1, 2);
    fabricCanvas.setZoom(newZoom);
    setZoom(newZoom);
    fabricCanvas.renderAll();
  };

  const handleZoomOut = () => {
    if (!fabricCanvas) return;
    const newZoom = Math.max(zoom - 0.1, 0.5);
    fabricCanvas.setZoom(newZoom);
    setZoom(newZoom);
    fabricCanvas.renderAll();
  };

  const toggleGrid = () => {
    setGridEnabled(!gridEnabled);
  };

  const togglePan = () => {
    if (!fabricCanvas) return;
    const newPanMode = !panMode;
    setPanMode(newPanMode);
    fabricCanvas.selection = !newPanMode;

    if (newPanMode) {
      fabricCanvas.defaultCursor = "grab";
      fabricCanvas.hoverCursor = "grab";
      
      let isDragging = false;
      let lastPosX = 0;
      let lastPosY = 0;

      fabricCanvas.on("mouse:down", function (opt) {
        const evt = opt.e as MouseEvent;
        isDragging = true;
        lastPosX = evt.clientX;
        lastPosY = evt.clientY;
        fabricCanvas.defaultCursor = "grabbing";
      });

      fabricCanvas.on("mouse:move", function (opt) {
        if (isDragging) {
          const evt = opt.e as MouseEvent;
          const vpt = fabricCanvas.viewportTransform;
          if (vpt) {
            vpt[4] += evt.clientX - lastPosX;
            vpt[5] += evt.clientY - lastPosY;
            fabricCanvas.requestRenderAll();
            lastPosX = evt.clientX;
            lastPosY = evt.clientY;
          }
        }
      });

      fabricCanvas.on("mouse:up", function () {
        isDragging = false;
        fabricCanvas.defaultCursor = "grab";
      });
    } else {
      fabricCanvas.defaultCursor = "default";
      fabricCanvas.hoverCursor = "move";
      fabricCanvas.off("mouse:down");
      fabricCanvas.off("mouse:move");
      fabricCanvas.off("mouse:up");
    }
  };

  const rotateSelected = () => {
    if (!fabricCanvas) return;
    const activeObject = fabricCanvas.getActiveObject();
    if (!activeObject) return;

    activeObject.rotate((activeObject.angle || 0) + 45);
    fabricCanvas.renderAll();
    toast.success("Object rotated");
  };

  const duplicateSelected = async () => {
    if (!fabricCanvas) return;
    const activeObject = fabricCanvas.getActiveObject() as ExtendedFabricObject;
    if (!activeObject) return;

    const cloned = (await activeObject.clone()) as ExtendedFabricObject;
    cloned.set({
      left: (cloned.left || 0) + 20,
      top: (cloned.top || 0) + 20,
    });
    fabricCanvas.add(cloned);
    fabricCanvas.setActiveObject(cloned);
    updateVisibilityForObject(cloned);
    fabricCanvas.renderAll();
    toast.success("Object duplicated");
  };

  const saveLayout = async () => {
    if (!fabricCanvas) return;

    setIsSaving(true);
    try {
      const objectsToSave = fabricCanvas.getObjects().filter((obj) => {
        const extObj = obj as ExtendedFabricObject;
        return !extObj.isGridLine && !extObj.isStage && !extObj.isObstruction && !(obj instanceof Text);
      });

      // Serialize with custom properties
      const serializedObjects = objectsToSave.map(obj => {
        const extObj = obj as ExtendedFabricObject;
        const json = obj.toJSON();
        return {
          ...json,
          itemType: extObj.itemType,
          chairNumber: extObj.chairNumber,
          rowName: extObj.rowName,
          itemName: extObj.itemName,
          visibilityPercentage: extObj.visibilityPercentage
        };
      });

      const layoutData = {
        version: '5.3.0',
        objects: serializedObjects
      };
      
      const { error } = await supabase
        .from("venue_halls")
        .update({ custom_layout_data: JSON.stringify(layoutData) })
        .eq("id", hallId);

      if (error) throw error;

      toast.success("Hall layout saved successfully!");
      onLayoutSaved?.();
    } catch (error) {
      console.error("Error saving layout:", error);
      toast.error("Failed to save layout");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <LayoutEditorToolbar
          onAddTable={addTable}
          onAddChair={addChair}
          onDelete={deleteSelected}
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          onToggleGrid={toggleGrid}
          onTogglePan={togglePan}
          onSave={saveLayout}
          onRotate={rotateSelected}
          onDuplicate={duplicateSelected}
          gridEnabled={gridEnabled}
          panMode={panMode}
          hasSelection={hasSelection}
          zoom={zoom}
        />
        <CardContent className="p-6 bg-muted/30 space-y-4">
          {editingLabel && (
            <div className="flex items-center gap-2 p-4 bg-card border border-border rounded-lg">
              <Label className="font-semibold">Rename:</Label>
              <Input
                value={labelInput}
                onChange={(e) => setLabelInput(e.target.value)}
                placeholder="Enter name or number"
                className="flex-1"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') applyLabelChange();
                  if (e.key === 'Escape') setEditingLabel(false);
                }}
              />
              <Button onClick={applyLabelChange} size="sm">Apply</Button>
              <Button onClick={() => setEditingLabel(false)} size="sm" variant="outline">Cancel</Button>
            </div>
          )}
          
          {hasSelection && !editingLabel && (
            <div className="flex justify-center">
              <Button onClick={renameSelected} size="sm" variant="secondary">
                Rename Selected Item
              </Button>
            </div>
          )}

          <div className="flex justify-center items-center overflow-auto">
            <canvas ref={canvasRef} className="border-2 border-border rounded-lg shadow-lg" />
          </div>
          <div className="mt-4 text-sm text-muted-foreground text-center">
            <p>
              Hall dimensions: {hallLength}' × {hallWidth}' • 
              {gridEnabled ? " Grid snapping enabled" : " Free placement"} • 
              {panMode ? " Pan mode active" : " Selection mode"}
            </p>
            <p className="mt-2 text-xs">
              💡 <strong>Tip:</strong> Add rows and chairs, then select any item and click "Rename Selected Item" to customize labels
            </p>
            {hasStage && (
              <div className="mt-4 p-3 bg-card rounded-lg">
                <p className="font-semibold mb-2">Stage Visibility Legend:</p>
                <div className="flex justify-center gap-4 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: StageVisibilityCalculator.getVisibilityColor(100) }}></div>
                    <span>Excellent (80-100%)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: StageVisibilityCalculator.getVisibilityColor(70) }}></div>
                    <span>Good (60-80%)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: StageVisibilityCalculator.getVisibilityColor(50) }}></div>
                    <span>Fair (40-60%)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: StageVisibilityCalculator.getVisibilityColor(30) }}></div>
                    <span>Poor (&lt;40%)</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
