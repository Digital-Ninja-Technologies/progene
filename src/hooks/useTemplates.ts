import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/AuthContext';
import { ProposalTemplate } from '@/types/database';
import { ProjectConfig } from '@/types/project';
import type { Json } from '@/integrations/supabase/types';

export function useTemplates() {
  const { user } = useAuthContext();
  const [templates, setTemplates] = useState<ProposalTemplate[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTemplates = useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    const { data, error } = await supabase
      .from('proposal_templates')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setTemplates(data as unknown as ProposalTemplate[]);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchTemplates();
    }
  }, [user, fetchTemplates]);

  const saveTemplate = async (name: string, description: string, config: ProjectConfig) => {
    if (!user) return { error: new Error('Not authenticated') };

    const { data, error } = await supabase
      .from('proposal_templates')
      .insert([{
        user_id: user.id,
        name,
        description,
        project_config: JSON.parse(JSON.stringify(config)) as Json,
      }])
      .select()
      .single();

    if (!error && data) {
      setTemplates(prev => [data as unknown as ProposalTemplate, ...prev]);
    }

    return { error, data };
  };

  const updateTemplate = async (id: string, updates: Partial<Pick<ProposalTemplate, 'name' | 'description' | 'is_default'>>) => {
    const { error } = await supabase
      .from('proposal_templates')
      .update(updates)
      .eq('id', id);

    if (!error) {
      setTemplates(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
    }

    return { error };
  };

  const deleteTemplate = async (id: string) => {
    const { error } = await supabase
      .from('proposal_templates')
      .delete()
      .eq('id', id);

    if (!error) {
      setTemplates(prev => prev.filter(t => t.id !== id));
    }

    return { error };
  };

  return {
    templates,
    loading,
    saveTemplate,
    updateTemplate,
    deleteTemplate,
    refetch: fetchTemplates,
  };
}
