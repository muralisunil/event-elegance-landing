import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { Upload, Image as ImageIcon, Sparkles } from "lucide-react";
import { CreateInvitationModal } from "./CreateInvitationModal";

interface InvitationUploadProps {
  invitationUrl: string | null;
  onUploadSuccess: (url: string) => void;
}

export const InvitationUpload = ({ invitationUrl, onUploadSuccess }: InvitationUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid File",
        description: "Please upload an image file (JPG, PNG, etc.)",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Please upload an image smaller than 5MB",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);

    // For now, create a local URL since we haven't set up storage bucket yet
    // In production, this would upload to Supabase Storage
    const url = URL.createObjectURL(file);
    
    toast({
      title: "Success",
      description: "Invitation image uploaded successfully.",
    });
    
    onUploadSuccess(url);
    setUploading(false);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Event Invitation</CardTitle>
          <CardDescription>
            Upload your invitation design or create one using AI
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {invitationUrl ? (
            <div className="space-y-4">
              <div className="border rounded-lg p-4 bg-muted">
                <img
                  src={invitationUrl}
                  alt="Event Invitation"
                  className="w-full h-auto rounded"
                />
              </div>
              <div className="flex gap-2">
                <Label htmlFor="invitation-upload" className="flex-1">
                  <Button variant="outline" className="w-full" disabled={uploading} asChild>
                    <span>
                      <Upload className="mr-2 h-4 w-4" />
                      Replace Image
                    </span>
                  </Button>
                </Label>
                <Input
                  id="invitation-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="border-2 border-dashed rounded-lg p-8 text-center">
                <ImageIcon className="mx-auto h-12 w-12 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground mb-4">
                  No invitation uploaded yet
                </p>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="invitation-upload">
                    <Button variant="outline" className="w-full" disabled={uploading} asChild>
                      <span>
                        <Upload className="mr-2 h-4 w-4" />
                        {uploading ? "Uploading..." : "Upload Image"}
                      </span>
                    </Button>
                  </Label>
                  <Input
                    id="invitation-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  
                  <Button
                    variant="secondary"
                    onClick={() => setCreateModalOpen(true)}
                    className="w-full"
                  >
                    <Sparkles className="mr-2 h-4 w-4" />
                    Create with AI
                  </Button>
                </div>
              </div>
              <p className="text-xs text-muted-foreground text-center">
                Supported formats: JPG, PNG (Max 5MB)
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <CreateInvitationModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
      />
    </>
  );
};
