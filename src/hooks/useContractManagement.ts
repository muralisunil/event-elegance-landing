import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useContractManagement = () => {
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const uploadContract = async (
    bookingId: string,
    file: File,
    expiresAt?: string
  ): Promise<string | null> => {
    try {
      setUploading(true);

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Upload file to storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${bookingId}-${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('vendor-contracts')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('vendor-contracts')
        .getPublicUrl(filePath);

      // Update booking with contract info
      const { error: updateError } = await supabase
        .from('event_vendor_bookings')
        .update({
          contract_url: publicUrl,
          contract_uploaded_at: new Date().toISOString(),
          contract_expires_at: expiresAt || null,
        })
        .eq('id', bookingId);

      if (updateError) throw updateError;

      toast({
        title: "Success",
        description: "Contract uploaded successfully",
      });

      return publicUrl;
    } catch (error: any) {
      console.error('Error uploading contract:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to upload contract",
        variant: "destructive",
      });
      return null;
    } finally {
      setUploading(false);
    }
  };

  const signContract = async (bookingId: string) => {
    try {
      const { error } = await supabase
        .from('event_vendor_bookings')
        .update({
          contract_signed_at: new Date().toISOString(),
        })
        .eq('id', bookingId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Contract marked as signed",
      });
    } catch (error: any) {
      console.error('Error signing contract:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to sign contract",
        variant: "destructive",
      });
    }
  };

  const downloadContract = async (contractUrl: string) => {
    try {
      window.open(contractUrl, '_blank');
    } catch (error: any) {
      console.error('Error downloading contract:', error);
      toast({
        title: "Error",
        description: "Failed to download contract",
        variant: "destructive",
      });
    }
  };

  return {
    uploadContract,
    signContract,
    downloadContract,
    uploading,
  };
};
