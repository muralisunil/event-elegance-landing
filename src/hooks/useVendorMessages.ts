import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface VendorMessage {
  id: string;
  booking_id: string;
  sender_id: string;
  sender_type: 'organizer' | 'vendor';
  message: string;
  read_at: string | null;
  created_at: string;
}

export const useVendorMessages = (bookingId: string) => {
  const [messages, setMessages] = useState<VendorMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (bookingId) {
      fetchMessages();
      subscribeToMessages();
    }
  }, [bookingId]);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('vendor_messages')
        .select('*')
        .eq('booking_id', bookingId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages((data || []) as VendorMessage[]);
    } catch (error: any) {
      console.error('Error fetching messages:', error);
      toast({
        title: "Error",
        description: "Failed to load messages",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const subscribeToMessages = () => {
    const channel = supabase
      .channel(`messages-${bookingId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'vendor_messages',
          filter: `booking_id=eq.${bookingId}`,
        },
        (payload) => {
          setMessages((current) => [...current, payload.new as VendorMessage]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const sendMessage = async (message: string, senderType: 'organizer' | 'vendor') => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { error } = await supabase
        .from('vendor_messages')
        .insert({
          booking_id: bookingId,
          sender_id: user.id,
          sender_type: senderType,
          message,
        });

      if (error) throw error;
    } catch (error: any) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to send message",
        variant: "destructive",
      });
      throw error;
    }
  };

  const markAsRead = async (messageId: string) => {
    try {
      await supabase
        .from('vendor_messages')
        .update({ read_at: new Date().toISOString() })
        .eq('id', messageId);
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  };

  return {
    messages,
    loading,
    sendMessage,
    markAsRead,
    refetch: fetchMessages,
  };
};
