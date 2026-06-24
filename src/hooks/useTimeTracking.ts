import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@clerk/react";
import { apiFetch } from "@/lib/api";

export interface TimeEntry {
  id: string;
  userId: string;
  proposalId: string | null;
  description: string;
  hours: number;
  date: string;
  billable: boolean;
  createdAt: string;
}

export function useTimeTracking() {
  const { getToken, isSignedIn } = useAuth();
  const qc = useQueryClient();

  const { data: entries = [], isLoading: loading } = useQuery<TimeEntry[]>({
    queryKey: ["time-entries"],
    queryFn: async () => apiFetch("/api/time", { token: (await getToken()) ?? undefined }),
    enabled: !!isSignedIn,
  });

  const createMutation = useMutation({
    mutationFn: async (entry: Omit<TimeEntry, "id" | "userId" | "createdAt">) =>
      apiFetch<TimeEntry>("/api/time", {
        method: "POST",
        token: (await getToken()) ?? undefined,
        body: entry,
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["time-entries"] }),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<TimeEntry> }) =>
      apiFetch<TimeEntry>(`/api/time/${id}`, {
        method: "PUT",
        token: (await getToken()) ?? undefined,
        body: updates,
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["time-entries"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) =>
      apiFetch(`/api/time/${id}`, { method: "DELETE", token: (await getToken()) ?? undefined }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["time-entries"] }),
  });

  const createEntry = async (entry: Omit<TimeEntry, "id" | "userId" | "createdAt">) => {
    try {
      const data = await createMutation.mutateAsync(entry);
      return { error: null, data };
    } catch (error) {
      return { error: error as Error, data: null };
    }
  };

  const updateEntry = async (id: string, updates: Partial<TimeEntry>) => {
    try {
      await updateMutation.mutateAsync({ id, updates });
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const deleteEntry = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id);
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const getTotalHours = (billableOnly = false) =>
    entries.filter((e) => !billableOnly || e.billable).reduce((sum, e) => sum + Number(e.hours), 0);

  const getHoursByProposal = (proposalId: string) =>
    entries.filter((e) => e.proposalId === proposalId).reduce((sum, e) => sum + Number(e.hours), 0);

  return {
    entries,
    loading,
    createEntry,
    updateEntry,
    deleteEntry,
    getTotalHours,
    getHoursByProposal,
    refetch: () => qc.invalidateQueries({ queryKey: ["time-entries"] }),
  };
}
