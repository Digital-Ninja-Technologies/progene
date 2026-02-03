import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/AuthContext';
import { BrandingSettings } from '@/types/database';

const defaultBranding: Omit<BrandingSettings, 'id' | 'user_id' | 'created_at' | 'updated_at'> = {
  logo_url: null,
  company_name: null,
  tagline: null,
  primary_color: '#6366f1',
  secondary_color: '#8b5cf6',
  website: null,
  email: null,
  phone: null,
  address: null,
};

export function useBranding() {
  const { user } = useAuthContext();
  const [branding, setBranding] = useState<BrandingSettings | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchBranding = useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    const { data, error } = await supabase
      .from('branding_settings')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (!error && data) {
      setBranding(data as BrandingSettings);
    } else if (error?.code === 'PGRST116') {
      // No branding settings yet, create default
      setBranding(null);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchBranding();
    }
  }, [user, fetchBranding]);

  const saveBranding = async (settings: Partial<Omit<BrandingSettings, 'id' | 'user_id' | 'created_at' | 'updated_at'>>) => {
    if (!user) return { error: new Error('Not authenticated') };

    if (branding) {
      // Update existing
      const { error } = await supabase
        .from('branding_settings')
        .update(settings)
        .eq('id', branding.id);

      if (!error) {
        setBranding(prev => prev ? { ...prev, ...settings } : null);
      }

      return { error };
    } else {
      // Create new
      const { data, error } = await supabase
        .from('branding_settings')
        .insert([{
          user_id: user.id,
          ...defaultBranding,
          ...settings,
        }])
        .select()
        .single();

      if (!error && data) {
        setBranding(data as BrandingSettings);
      }

      return { error, data };
    }
  };

  return {
    branding,
    loading,
    saveBranding,
    refetch: fetchBranding,
  };
}
