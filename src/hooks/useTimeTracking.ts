import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/AuthContext';
import { TimeEntry } from '@/types/database';

export function useTimeTracking() {
  const { user } = useAuthContext();
  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEntries = useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    const { data, error } = await supabase
      .from('time_entries')
      .select('*')
      .order('date', { ascending: false });

    if (!error && data) {
      setEntries(data as TimeEntry[]);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchEntries();
    }
  }, [user, fetchEntries]);

  const createEntry = async (entry: Omit<TimeEntry, 'id' | 'user_id' | 'created_at'>) => {
    if (!user) return { error: new Error('Not authenticated') };

    const { data, error } = await supabase
      .from('time_entries')
      .insert([{
        user_id: user.id,
        ...entry,
      }])
      .select()
      .single();

    if (!error && data) {
      setEntries(prev => [data as TimeEntry, ...prev]);
    }

    return { error, data };
  };

  const updateEntry = async (id: string, updates: Partial<Omit<TimeEntry, 'id' | 'user_id' | 'created_at'>>) => {
    const { error } = await supabase
      .from('time_entries')
      .update(updates)
      .eq('id', id);

    if (!error) {
      setEntries(prev => prev.map(e => e.id === id ? { ...e, ...updates } : e));
    }

    return { error };
  };

  const deleteEntry = async (id: string) => {
    const { error } = await supabase
      .from('time_entries')
      .delete()
      .eq('id', id);

    if (!error) {
      setEntries(prev => prev.filter(e => e.id !== id));
    }

    return { error };
  };

  // Calculate totals
  const getTotalHours = (billableOnly = false) => {
    return entries
      .filter(e => !billableOnly || e.billable)
      .reduce((sum, e) => sum + Number(e.hours), 0);
  };

  const getHoursByProposal = (proposalId: string) => {
    return entries
      .filter(e => e.proposal_id === proposalId)
      .reduce((sum, e) => sum + Number(e.hours), 0);
  };

  return {
    entries,
    loading,
    createEntry,
    updateEntry,
    deleteEntry,
    getTotalHours,
    getHoursByProposal,
    refetch: fetchEntries,
  };
}
