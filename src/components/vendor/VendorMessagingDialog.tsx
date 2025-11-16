import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useVendorMessages } from "@/hooks/useVendorMessages";
import { Send } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface VendorMessagingDialogProps {
  booking: any;
  userType: 'vendor' | 'organizer';
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const VendorMessagingDialog = ({ booking, userType, open, onOpenChange }: VendorMessagingDialogProps) => {
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const { messages, loading, sendMessage } = useVendorMessages(booking.id);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!message.trim()) return;

    setSending(true);
    try {
      await sendMessage(message, userType);
      setMessage("");
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[600px] flex flex-col">
        <DialogHeader>
          <DialogTitle>
            Messages with {userType === 'vendor' ? booking.event?.name : booking.vendor?.business_name}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-4" ref={scrollRef}>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading messages...
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No messages yet. Start the conversation!
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((msg) => {
                const isCurrentUser = msg.sender_type === userType;
                return (
                  <div
                    key={msg.id}
                    className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-lg p-3 ${
                        isCurrentUser
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                      <p className={`text-xs mt-1 ${isCurrentUser ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                        {new Date(msg.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>

        <div className="flex gap-2 pt-4 border-t">
          <Textarea
            placeholder="Type your message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            rows={3}
            className="flex-1"
          />
          <Button
            onClick={handleSend}
            disabled={sending || !message.trim()}
            size="icon"
            className="self-end"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
