import { useEffect, useRef, useState } from "react";
import { Canvas as FabricCanvas, Rect, Text, FabricObject } from "fabric";
import { Card, CardContent } from "@/components/ui/card";
import { LayoutEditorToolbar } from "./LayoutEditorToolbar";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface ExtendedFabricObject extends FabricObject {
  isGridLine?: boolean;
  isBooth?: boolean;
  boothNumber?: string;
  boothLabel?: Text;
}

interface LobbyBoothEditorProps {
  lobbyAreaId: string;
  lobbyWidth: number;
  lobbyLength: number;
  existingLayout?: string | null;
  onLayoutSaved?: () => void;
}

export const LobbyBoothEditor = ({
  lobbyAreaId,
  lobbyWidth,
  lobbyLength,
  existingLayout,
  onLayoutSaved,
}: LobbyBoothEditorProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [fabricCanvas, setFabricCanvas] = useState<FabricCanvas | null>(null);
  const [gridEnabled, setGridEnabled] = useState(true);
  const [panMode, setPanMode] = useState(false);
  const [hasSelection, setHasSelection] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [isSaving, setIsSaving] = useState(false);
  const [boothCounter, setBoothCounter] = useState(1);
  const [editingLabel, setEditingLabel] = useState(false);
  const [labelInput, setLabelInput] = useState("");

  const GRID_SIZE = 20;
  const SCALE_FACTOR = 5;
  const canvasWidth = lobbyLength * SCALE_FACTOR;
  const canvasHeight = lobbyWidth * SCALE_FACTOR;

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = new FabricCanvas(canvasRef.current, {
      width: Math.min(canvasWidth, 1000),
      height: Math.min(canvasHeight, 600),
      backgroundColor: "hsl(var(--muted))",
      selection: true,
    });

    canvas.on("object:moving", (e) => {
      if (gridEnabled && e.target) {
        e.target.set({
          left: Math.round((e.target.left || 0) / GRID_SIZE) * GRID_SIZE,
          top: Math.round((e.target.top || 0) / GRID_SIZE) * GRID_SIZE,
        });
      }
      
      const extObj = e.target as ExtendedFabricObject;
      // Update label position if it exists
      if (extObj.boothLabel) {
        extObj.boothLabel.set({
          left: (extObj.left || 0) + (extObj.width || 0) / 2,
          top: (extObj.top || 0) + (extObj.height || 0) / 2,
        });
      }
    });

    canvas.on("selection:created", () => setHasSelection(true));
    canvas.on("selection:updated", () => setHasSelection(true));
    canvas.on("selection:cleared", () => setHasSelection(false));

    if (existingLayout) {
      try {
        const layoutData = JSON.parse(existingLayout);
        canvas.loadFromJSON(layoutData, () => {
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
  }, [lobbyAreaId, canvasWidth, canvasHeight, existingLayout]);

  useEffect(() => {
    if (!fabricCanvas || !gridEnabled) return;

    const drawGrid = () => {
      const width = fabricCanvas.width || 0;
      const height = fabricCanvas.height || 0;

      const objects = fabricCanvas.getObjects();
      objects.forEach((obj) => {
        const extObj = obj as ExtendedFabricObject;
        if (extObj.isGridLine) {
          fabricCanvas.remove(obj);
        }
      });

      for (let i = 0; i < width; i += GRID_SIZE) {
        const line = new Rect({
          left: i,
          top: 0,
          width: 1,
          height: height,
          fill: "hsl(var(--border))",
          opacity: 0.3,
          selectable: false,
          evented: false,
        }) as ExtendedFabricObject;
        line.isGridLine = true;
        fabricCanvas.add(line);
        fabricCanvas.sendObjectToBack(line);
      }

      for (let i = 0; i < height; i += GRID_SIZE) {
        const line = new Rect({
          left: 0,
          top: i,
          width: width,
          height: 1,
          fill: "hsl(var(--border))",
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

  const addBooth = () => {
    if (!fabricCanvas) return;

    const boothNumber = `Booth ${boothCounter}`;
    const boothRect = new Rect({
      left: 100,
      top: 100,
      fill: "hsl(var(--accent))",
      width: 100,
      height: 100,
      stroke: "hsl(var(--accent-foreground))",
      strokeWidth: 2,
      opacity: 0.8,
    }) as ExtendedFabricObject;

    boothRect.isBooth = true;
    boothRect.boothNumber = boothNumber;

    const label = new Text(boothNumber, {
      left: 100 + 50,
      top: 100 + 50,
      fontSize: 14,
      fontWeight: "bold",
      fill: "white",
      originX: "center",
      originY: "center",
      selectable: false,
      evented: false,
    });

    boothRect.boothLabel = label;

    fabricCanvas.add(boothRect);
    fabricCanvas.add(label);
    fabricCanvas.setActiveObject(boothRect);
    fabricCanvas.renderAll();
    
    setBoothCounter(boothCounter + 1);
    toast.success(`${boothNumber} added - Select and rename as needed`);
  };

  const deleteSelected = () => {
    if (!fabricCanvas) return;

    const activeObjects = fabricCanvas.getActiveObjects();
    if (activeObjects.length === 0) return;

    activeObjects.forEach((obj) => {
      const extObj = obj as ExtendedFabricObject;
      // Remove booth label if exists
      if (extObj.boothLabel) {
        fabricCanvas.remove(extObj.boothLabel);
      }
      fabricCanvas.remove(obj);
    });

    fabricCanvas.discardActiveObject();
    fabricCanvas.renderAll();
    toast.success("Object(s) deleted");
  };

  const renameBooth = () => {
    if (!fabricCanvas) return;
    const activeObject = fabricCanvas.getActiveObject() as ExtendedFabricObject;
    if (!activeObject || !activeObject.isBooth) return;

    setLabelInput(activeObject.boothNumber || "");
    setEditingLabel(true);
  };

  const applyLabelChange = () => {
    if (!fabricCanvas || !labelInput.trim()) {
      setEditingLabel(false);
      return;
    }

    const activeObject = fabricCanvas.getActiveObject() as ExtendedFabricObject;
    if (!activeObject || !activeObject.isBooth) {
      setEditingLabel(false);
      return;
    }

    // Update the booth number
    activeObject.boothNumber = labelInput;

    // Update the label text
    if (activeObject.boothLabel) {
      activeObject.boothLabel.set({ text: labelInput });
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
    fabricCanvas.renderAll();
    toast.success("Object duplicated");
  };

  const saveLayout = async () => {
    if (!fabricCanvas) return;

    setIsSaving(true);
    try {
      const objectsToSave = fabricCanvas.getObjects().filter((obj) => {
        const extObj = obj as ExtendedFabricObject;
        return !extObj.isGridLine && !(obj instanceof Text);
      });

      // Serialize with custom properties
      const serializedObjects = objectsToSave.map(obj => {
        const extObj = obj as ExtendedFabricObject;
        const json = obj.toJSON();
        return {
          ...json,
          isBooth: extObj.isBooth,
          boothNumber: extObj.boothNumber,
        };
      });

      const layoutData = {
        version: '5.3.0',
        objects: serializedObjects
      };
      
      const { error } = await supabase
        .from("venue_lobby_areas")
        .update({ custom_booth_layout_data: JSON.stringify(layoutData) })
        .eq("id", lobbyAreaId);

      if (error) throw error;

      toast.success("Booth layout saved successfully!");
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
          onAddTable={addBooth}
          onAddChair={() => {}}
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
              <Label className="font-semibold">Rename Booth:</Label>
              <Input
                value={labelInput}
                onChange={(e) => setLabelInput(e.target.value)}
                placeholder="Enter booth name"
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
              <Button onClick={renameBooth} size="sm" variant="secondary">
                Rename Selected Booth
              </Button>
            </div>
          )}

          <div className="flex justify-center items-center overflow-auto">
            <canvas ref={canvasRef} className="border-2 border-border rounded-lg shadow-lg" />
          </div>
          <div className="mt-4 text-sm text-muted-foreground text-center">
            <p>
              Lobby dimensions: {lobbyLength}' × {lobbyWidth}' • 
              {gridEnabled ? " Grid snapping enabled" : " Free placement"} • 
              {panMode ? " Pan mode active" : " Selection mode"}
            </p>
            <p className="mt-2 text-xs">
              💡 <strong>Tip:</strong> Click "Add Table" to add booths, then select any booth and click "Rename Selected Booth" to customize
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
