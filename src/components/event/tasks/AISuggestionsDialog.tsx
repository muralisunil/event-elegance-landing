import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Sparkles, Loader2 } from "lucide-react";

interface AISuggestionsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  eventId: string;
  onSuccess: () => void;
}

interface AISuggestion {
  title: string;
  description: string;
  priority: string;
  category: string;
  estimated_hours?: number;
  due_date_type?: string;
  relative_days?: number;
  reasoning: string;
}

export const AISuggestionsDialog = ({ open, onOpenChange, eventId, onSuccess }: AISuggestionsDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([]);
  const [selectedSuggestions, setSelectedSuggestions] = useState<Set<number>>(new Set());
  const [analyzing, setAnalyzing] = useState(false);

  const handleAnalyze = async () => {
    setAnalyzing(true);
    setLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('analyze-event-tasks', {
        body: { eventId }
      });

      if (error) throw error;

      if (data?.suggestions && Array.isArray(data.suggestions)) {
        setSuggestions(data.suggestions);
        // Select all by default
        setSelectedSuggestions(new Set(data.suggestions.map((_: any, i: number) => i)));
        toast.success(`Found ${data.suggestions.length} AI-suggested tasks`);
      } else {
        toast.info('No new task suggestions at this time');
        setSuggestions([]);
      }
    } catch (error: any) {
      console.error('Error analyzing tasks:', error);
      toast.error(error.message || 'Failed to analyze event');
    } finally {
      setLoading(false);
      setAnalyzing(false);
    }
  };

  const handleCreateTasks = async () => {
    if (selectedSuggestions.size === 0) {
      toast.error('Please select at least one task to create');
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const tasksToCreate = Array.from(selectedSuggestions).map(index => {
        const suggestion = suggestions[index];
        return {
          event_id: eventId,
          title: suggestion.title,
          description: suggestion.description,
          priority: (suggestion.priority || 'medium') as 'low' | 'medium' | 'high' | 'urgent',
          category: suggestion.category || null,
          estimated_hours: suggestion.estimated_hours || null,
          due_date_type: (suggestion.due_date_type || 'relative_to_event') as 'fixed_datetime' | 'relative_to_event' | 'relative_to_session' | 'relative_to_food_session',
          relative_days: suggestion.relative_days || -7,
          is_ai_suggested: true,
          ai_suggestion_reason: suggestion.reasoning,
          created_by: user.id,
        };
      });

      const { error } = await supabase
        .from('event_tasks')
        .insert(tasksToCreate);

      if (error) throw error;

      toast.success(`Created ${tasksToCreate.length} tasks successfully`);
      onSuccess();
      onOpenChange(false);
      setSuggestions([]);
      setSelectedSuggestions(new Set());
    } catch (error: any) {
      console.error('Error creating tasks:', error);
      toast.error(error.message || 'Failed to create tasks');
    } finally {
      setLoading(false);
    }
  };

  const toggleSuggestion = (index: number) => {
    const newSelected = new Set(selectedSuggestions);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedSuggestions(newSelected);
  };

  const priorityColors = {
    low: "bg-blue-500/10 text-blue-700 border-blue-200",
    medium: "bg-yellow-500/10 text-yellow-700 border-yellow-200",
    high: "bg-orange-500/10 text-orange-700 border-orange-200",
    urgent: "bg-red-500/10 text-red-700 border-red-200",
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            AI Task Suggestions
          </DialogTitle>
          <DialogDescription>
            Let AI analyze your event and suggest actionable tasks based on your schedule, guests, and logistics.
          </DialogDescription>
        </DialogHeader>

        {suggestions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 gap-4">
            <Sparkles className="h-12 w-12 text-muted-foreground" />
            <p className="text-muted-foreground text-center">
              Click below to analyze your event and get AI-powered task suggestions
            </p>
            <Button onClick={handleAnalyze} disabled={analyzing} size="lg">
              {analyzing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Analyzing Event...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Analyze Event
                </>
              )}
            </Button>
          </div>
        ) : (
          <>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  {selectedSuggestions.size} of {suggestions.length} tasks selected
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    if (selectedSuggestions.size === suggestions.length) {
                      setSelectedSuggestions(new Set());
                    } else {
                      setSelectedSuggestions(new Set(suggestions.map((_, i) => i)));
                    }
                  }}
                >
                  {selectedSuggestions.size === suggestions.length ? 'Deselect All' : 'Select All'}
                </Button>
              </div>

              {suggestions.map((suggestion, index) => (
                <Card key={index} className="p-4">
                  <div className="flex gap-3">
                    <Checkbox
                      checked={selectedSuggestions.has(index)}
                      onCheckedChange={() => toggleSuggestion(index)}
                      className="mt-1"
                    />
                    <div className="flex-1 space-y-2">
                      <div className="flex items-start gap-2">
                        <Badge className={priorityColors[suggestion.priority as keyof typeof priorityColors]}>
                          {suggestion.priority.toUpperCase()}
                        </Badge>
                        {suggestion.category && (
                          <Badge variant="outline">{suggestion.category}</Badge>
                        )}
                      </div>
                      <h4 className="font-medium">{suggestion.title}</h4>
                      <p className="text-sm text-muted-foreground">{suggestion.description}</p>
                      <div className="bg-accent/50 p-3 rounded-md">
                        <p className="text-xs font-medium text-muted-foreground mb-1">AI Reasoning:</p>
                        <p className="text-sm">{suggestion.reasoning}</p>
                      </div>
                      {suggestion.estimated_hours && (
                        <p className="text-xs text-muted-foreground">
                          Estimated: {suggestion.estimated_hours} hours
                        </p>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            <div className="flex justify-between gap-2 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => {
                  setSuggestions([]);
                  setSelectedSuggestions(new Set());
                }}
              >
                Clear & Re-analyze
              </Button>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateTasks}
                  disabled={loading || selectedSuggestions.size === 0}
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    `Create ${selectedSuggestions.size} Task${selectedSuggestions.size !== 1 ? 's' : ''}`
                  )}
                </Button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};