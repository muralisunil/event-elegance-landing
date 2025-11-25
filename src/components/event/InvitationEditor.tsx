import { useEffect, useRef, useState } from "react";
import { Canvas as FabricCanvas, FabricImage, Textbox } from "fabric";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Save, Trash2, Download } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface InvitationEditorProps {
  imageUrl: string;
  initialPlaceholders?: PlaceholderData[];
  onSave: (placeholders: PlaceholderData[]) => void;
}

export interface PlaceholderData {
  id: string;
  type: string;
  label: string;
  left: number;
  top: number;
  fontSize: number;
  color: string;
}

const PLACEHOLDER_TYPES = [
  { type: "first_name", label: "First Name" },
  { type: "last_name", label: "Last Name" },
  { type: "full_name", label: "Full Name" },
  { type: "event_name", label: "Event Name" },
  { type: "event_date", label: "Event Date" },
  { type: "event_time", label: "Event Time" },
  { type: "venue", label: "Venue" },
  { type: "location", label: "Location" },
  { type: "description", label: "Description" },
];

export const InvitationEditor = ({ imageUrl, initialPlaceholders = [], onSave }: InvitationEditorProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [canvas, setCanvas] = useState<FabricCanvas | null>(null);
  const [placeholders, setPlaceholders] = useState<PlaceholderData[]>(initialPlaceholders);
  const [selectedPlaceholder, setSelectedPlaceholder] = useState<string | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const fabricCanvas = new FabricCanvas(canvasRef.current, {
      width: 800,
      height: 600,
      backgroundColor: "#ffffff",
      selection: true,
    });

    // Load the invitation image
    FabricImage.fromURL(imageUrl, {
      crossOrigin: "anonymous",
    }).then((img) => {
      const scale = Math.min(800 / (img.width || 1), 600 / (img.height || 1));
      img.scale(scale);
      img.set({
        left: 0,
        top: 0,
        selectable: false,
        evented: false,
      });
      fabricCanvas.add(img);
      fabricCanvas.sendObjectToBack(img);

      // Load initial placeholders
      initialPlaceholders.forEach((ph) => {
        addPlaceholderToCanvas(fabricCanvas, ph);
      });
    });

    fabricCanvas.on("selection:created", (e) => {
      const obj = e.selected?.[0] as any;
      if (obj?.placeholderId) {
        setSelectedPlaceholder(obj.placeholderId);
      }
    });

    fabricCanvas.on("selection:updated", (e) => {
      const obj = e.selected?.[0] as any;
      if (obj?.placeholderId) {
        setSelectedPlaceholder(obj.placeholderId);
      }
    });

    fabricCanvas.on("selection:cleared", () => {
      setSelectedPlaceholder(null);
    });

    setCanvas(fabricCanvas);

    return () => {
      fabricCanvas.dispose();
    };
  }, [imageUrl]);

  const addPlaceholderToCanvas = (fabricCanvas: FabricCanvas, ph: PlaceholderData) => {
    const text = new Textbox(`{{${ph.type}}}`, {
      left: ph.left,
      top: ph.top,
      fontSize: ph.fontSize,
      fill: ph.color,
      fontFamily: "Arial",
      backgroundColor: "rgba(255, 255, 255, 0.7)",
      padding: 5,
    }) as any;

    text.placeholderId = ph.id;
    text.placeholderType = ph.type;
    fabricCanvas.add(text);
  };

  const addPlaceholder = (type: string, label: string) => {
    if (!canvas) return;

    const newPlaceholder: PlaceholderData = {
      id: `${type}_${Date.now()}`,
      type,
      label,
      left: 100,
      top: 100,
      fontSize: 24,
      color: "#000000",
    };

    addPlaceholderToCanvas(canvas, newPlaceholder);
    setPlaceholders([...placeholders, newPlaceholder]);

    toast({
      title: "Placeholder Added",
      description: `${label} placeholder has been added to the invitation.`,
    });
  };

  const deleteSelected = () => {
    if (!canvas || !selectedPlaceholder) return;

    const objects = canvas.getObjects();
    const objToDelete = objects.find((obj: any) => obj.placeholderId === selectedPlaceholder);

    if (objToDelete) {
      canvas.remove(objToDelete);
      setPlaceholders(placeholders.filter((ph) => ph.id !== selectedPlaceholder));
      setSelectedPlaceholder(null);

      toast({
        title: "Placeholder Deleted",
        description: "The placeholder has been removed from the invitation.",
      });
    }
  };

  const handleSave = () => {
    if (!canvas) return;

    const updatedPlaceholders: PlaceholderData[] = [];
    const objects = canvas.getObjects();

    objects.forEach((obj: any) => {
      if (obj.placeholderId) {
        const ph = placeholders.find((p) => p.id === obj.placeholderId);
        if (ph) {
          updatedPlaceholders.push({
            ...ph,
            left: obj.left || 0,
            top: obj.top || 0,
            fontSize: obj.fontSize || 24,
            color: obj.fill || "#000000",
          });
        }
      }
    });

    onSave(updatedPlaceholders);

    toast({
      title: "Layout Saved",
      description: "Your invitation layout has been saved successfully.",
    });
  };

  const handleExport = () => {
    if (!canvas) return;

    const dataURL = canvas.toDataURL({
      format: "png",
      quality: 1,
      multiplier: 1,
    });

    const link = document.createElement("a");
    link.download = "invitation-template.png";
    link.href = dataURL;
    link.click();

    toast({
      title: "Exported",
      description: "Invitation template downloaded successfully.",
    });
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Available Placeholders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {PLACEHOLDER_TYPES.map((placeholder) => (
              <Badge
                key={placeholder.type}
                variant="outline"
                className="cursor-pointer hover:bg-accent"
                onClick={() => addPlaceholder(placeholder.type, placeholder.label)}
              >
                {placeholder.label}
              </Badge>
            ))}
          </div>
          <p className="text-sm text-muted-foreground mt-4">
            Click on a placeholder to add it to your invitation. Then drag it to position.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Invitation Canvas</CardTitle>
            <div className="flex gap-2">
              {selectedPlaceholder && (
                <Button variant="destructive" size="sm" onClick={deleteSelected}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Selected
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={handleExport}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button size="sm" onClick={handleSave}>
                <Save className="h-4 w-4 mr-2" />
                Save Layout
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-hidden bg-muted">
            <canvas ref={canvasRef} />
          </div>
          <p className="text-sm text-muted-foreground mt-4">
            Drag placeholders to position them. When sending invitations, these will be replaced with
            actual guest and event information.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
