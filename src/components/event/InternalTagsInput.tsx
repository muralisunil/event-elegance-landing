import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";

interface InternalTagsInputProps {
  value: string;
  onChange: (value: string) => void;
}

const SUGGESTED_TAGS = [
  "VIP Confirmed",
  "Requires Follow-up",
  "Special Needs",
  "Media",
  "Speaker",
  "Staff",
  "Family",
  "High Priority",
  "Last Minute",
  "Dietary Restriction",
  "Accessibility Required",
  "VIP Seating",
];

export const InternalTagsInput = ({ value, onChange }: InternalTagsInputProps) => {
  const [inputValue, setInputValue] = useState("");
  const tags = value ? value.split(",").filter(Boolean) : [];

  const addTag = (tag: string) => {
    const trimmedTag = tag.trim();
    if (trimmedTag && !tags.includes(trimmedTag)) {
      const newTags = [...tags, trimmedTag];
      onChange(newTags.join(","));
      setInputValue("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    const newTags = tags.filter((tag) => tag !== tagToRemove);
    onChange(newTags.join(","));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(inputValue);
    } else if (e.key === "Backspace" && !inputValue && tags.length > 0) {
      removeTag(tags[tags.length - 1]);
    }
  };

  return (
    <div className="space-y-3">
      <div>
        <Label htmlFor="internal_tags" className="flex items-center gap-2">
          <Lock className="h-3 w-3" />
          Internal Classifications
        </Label>
        <p className="text-xs text-muted-foreground mb-2">
          Private tags for organizer tracking (not visible to guests)
        </p>
        
        {/* Current Tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-2 p-2 bg-muted/30 rounded-md">
            {tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="gap-1">
                <Lock className="h-3 w-3" />
                {tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="ml-1 hover:bg-background/20 rounded-full"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}

        {/* Input Field */}
        <Input
          id="internal_tags"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type and press Enter to add tag"
        />
      </div>

      {/* Suggested Tags */}
      <div>
        <p className="text-xs text-muted-foreground mb-2">Quick Add:</p>
        <div className="flex flex-wrap gap-2">
          {SUGGESTED_TAGS.filter((tag) => !tags.includes(tag)).map((tag) => (
            <Button
              key={tag}
              type="button"
              variant="outline"
              size="sm"
              onClick={() => addTag(tag)}
              className="h-7 text-xs"
            >
              {tag}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};