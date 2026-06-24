import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@clerk/react";
import { apiFetch } from "@/lib/api";
import { ProjectConfig } from "@/types/project";

export interface ProposalTemplate {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  projectConfig: ProjectConfig;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export function useTemplates() {
  const { getToken, isSignedIn } = useAuth();
  const qc = useQueryClient();

  const { data: templates = [], isLoading: loading } = useQuery<ProposalTemplate[]>({
    queryKey: ["templates"],
    queryFn: async () => apiFetch("/api/templates", { token: (await getToken()) ?? undefined }),
    enabled: !!isSignedIn,
  });

  const createMutation = useMutation({
    mutationFn: async (body: { name: string; description: string; projectConfig: ProjectConfig }) =>
      apiFetch<ProposalTemplate>("/api/templates", {
        method: "POST",
        token: (await getToken()) ?? undefined,
        body,
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["templates"] }),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<ProposalTemplate> }) =>
      apiFetch<ProposalTemplate>(`/api/templates/${id}`, {
        method: "PUT",
        token: (await getToken()) ?? undefined,
        body: updates,
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["templates"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) =>
      apiFetch(`/api/templates/${id}`, { method: "DELETE", token: (await getToken()) ?? undefined }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["templates"] }),
  });

  const saveTemplate = async (name: string, description: string, config: ProjectConfig) => {
    try {
      const data = await createMutation.mutateAsync({ name, description, projectConfig: config });
      return { error: null, data };
    } catch (error) {
      return { error: error as Error, data: null };
    }
  };

  const updateTemplate = async (id: string, updates: Partial<ProposalTemplate>) => {
    try {
      await updateMutation.mutateAsync({ id, updates });
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const deleteTemplate = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id);
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  return {
    templates,
    loading,
    saveTemplate,
    updateTemplate,
    deleteTemplate,
    refetch: () => qc.invalidateQueries({ queryKey: ["templates"] }),
  };
}
