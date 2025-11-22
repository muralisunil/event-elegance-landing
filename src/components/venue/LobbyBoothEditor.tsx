import { useEffect, useRef, useState } from "react";
import { Canvas as FabricCanvas, Rect, Text, FabricObject } from "fabric";
import { Card, CardContent } from "@/components/ui/card";
import { LayoutEditorToolbar } from "./LayoutEditorToolbar";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface ExtendedFabricObject extends FabricObject {
  isGridLine?: boolean;
  isBooth?: boolean;
  boothNumber?: string;
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
  }, [lobbyAreaId, canvasWidth, canvasHeight, existingLayout, gridEnabled]);

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

    const boothNumber = `B${boothCounter}`;
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
      left: 150,
      top: 150,
      fontSize: 14,
      fontWeight: "bold",
      fill: "hsl(var(--accent-foreground))",
      originX: "center",
      originY: "center",
      selectable: false,
      evented: false,
    });

    fabricCanvas.add(boothRect);
    fabricCanvas.add(label);
    fabricCanvas.setActiveObject(boothRect);
    fabricCanvas.renderAll();
    
    setBoothCounter(boothCounter + 1);
    toast.success(`Booth ${boothNumber} added`);
  };

  const deleteSelected = () => {
    if (!fabricCanvas) return;

    const activeObjects = fabricCanvas.getActiveObjects();
    if (activeObjects.length === 0) return;

    activeObjects.forEach((obj) => {
      fabricCanvas.remove(obj);
    });

    fabricCanvas.discardActiveObject();
    fabricCanvas.renderAll();
    toast.success("Object(s) deleted");
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

      const layoutData = {
        version: '5.3.0',
        objects: objectsToSave.map(obj => obj.toJSON())
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
        <CardContent className="p-6 bg-muted/30">
          <div className="flex justify-center items-center overflow-auto">
            <canvas ref={canvasRef} className="border-2 border-border rounded-lg shadow-lg" />
          </div>
          <div className="mt-4 text-sm text-muted-foreground text-center">
            <p>
              Lobby dimensions: {lobbyLength}' × {lobbyWidth}' • 
              {gridEnabled ? " Grid snapping enabled" : " Free placement"} • 
              {panMode ? " Pan mode active" : " Selection mode"}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
