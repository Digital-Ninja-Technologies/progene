import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@clerk/react";
import { apiFetch } from "@/lib/api";

export interface Client {
  id: string;
  userId: string;
  name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export function useClients() {
  const { getToken, isSignedIn } = useAuth();
  const qc = useQueryClient();

  const { data: clients = [], isLoading: loading } = useQuery<Client[]>({
    queryKey: ["clients"],
    queryFn: async () => apiFetch("/api/clients", { token: (await getToken()) ?? undefined }),
    enabled: !!isSignedIn,
  });

  const createClient = useMutation({
    mutationFn: async (client: Partial<Client>) =>
      apiFetch<Client>("/api/clients", { method: "POST", token: (await getToken()) ?? undefined, body: client }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["clients"] }),
  });

  const updateClient = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Client> }) =>
      apiFetch<Client>(`/api/clients/${id}`, { method: "PUT", token: (await getToken()) ?? undefined, body: updates }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["clients"] }),
  });

  const deleteClient = useMutation({
    mutationFn: async (id: string) =>
      apiFetch(`/api/clients/${id}`, { method: "DELETE", token: (await getToken()) ?? undefined }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["clients"] }),
  });

  return {
    clients,
    loading,
    createClient: (client: Partial<Client>) => createClient.mutateAsync(client),
    updateClient: (id: string, updates: Partial<Client>) => updateClient.mutateAsync({ id, updates }),
    deleteClient: (id: string) => deleteClient.mutateAsync(id),
    refetch: () => qc.invalidateQueries({ queryKey: ["clients"] }),
  };
}
