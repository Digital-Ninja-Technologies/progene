import { useState } from "react";
import { Plus, Pencil, Trash2, Users, Mail, Phone, Building } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useClients } from "@/hooks/useClients";
import { Client } from "@/types/database";
import { toast } from "sonner";

interface ClientFormData {
  name: string;
  email: string;
  phone: string;
  company: string;
  notes: string;
}

const defaultFormData: ClientFormData = {
  name: "",
  email: "",
  phone: "",
  company: "",
  notes: "",
};

interface ClientsManagerProps {
  onSelectClient?: (client: Client) => void;
  selectedClientId?: string | null;
}

export function ClientsManager({ onSelectClient, selectedClientId }: ClientsManagerProps) {
  const { clients, loading, createClient, updateClient, deleteClient } = useClients();
  const [isOpen, setIsOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [formData, setFormData] = useState<ClientFormData>(defaultFormData);
  const [saving, setSaving] = useState(false);

  const handleOpenCreate = () => {
    setEditingClient(null);
    setFormData(defaultFormData);
    setIsOpen(true);
  };

  const handleOpenEdit = (client: Client) => {
    setEditingClient(client);
    setFormData({
      name: client.name,
      email: client.email || "",
      phone: client.phone || "",
      company: client.company || "",
      notes: client.notes || "",
    });
    setIsOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name.trim()) return;
    
    setSaving(true);
    
    const clientData = {
      name: formData.name.trim(),
      email: formData.email.trim() || null,
      phone: formData.phone.trim() || null,
      company: formData.company.trim() || null,
      notes: formData.notes.trim() || null,
    };

    if (editingClient) {
      const { error } = await updateClient(editingClient.id, clientData);
      if (error) {
        toast.error("Failed to update client");
      } else {
        toast.success("Client updated!");
        setIsOpen(false);
      }
    } else {
      const { error } = await createClient(clientData);
      if (error) {
        toast.error("Failed to create client");
      } else {
        toast.success("Client created!");
        setIsOpen(false);
      }
    }
    
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    const { error } = await deleteClient(id);
    if (error) {
      toast.error("Failed to delete client");
    } else {
      toast.success("Client deleted");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Clients</h3>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button size="sm" onClick={handleOpenCreate}>
              <Plus className="mr-2 h-4 w-4" />
              Add Client
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingClient ? "Edit Client" : "Add Client"}</DialogTitle>
              <DialogDescription>
                {editingClient ? "Update client information" : "Add a new client to your CRM"}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <label className="text-sm font-medium">Name *</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Client name"
                  className="mt-1.5"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Email</label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="client@example.com"
                  className="mt-1.5"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Phone</label>
                <Input
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="+1 234 567 8900"
                  className="mt-1.5"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Company</label>
                <Input
                  value={formData.company}
                  onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                  placeholder="Company name"
                  className="mt-1.5"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Notes</label>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Additional notes..."
                  className="mt-1.5"
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={!formData.name.trim() || saving}>
                {saving ? "Saving..." : editingClient ? "Update" : "Add Client"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="text-center py-8 text-muted-foreground">Loading clients...</div>
      ) : clients.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-8 text-center text-muted-foreground">
            <Users className="mx-auto h-10 w-10 mb-3 opacity-50" />
            <p>No clients yet</p>
            <p className="text-sm mt-1">Add your first client to get started</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {clients.map((client) => (
            <Card 
              key={client.id} 
              className={`cursor-pointer hover:border-primary/30 transition-colors ${
                selectedClientId === client.id ? "border-primary bg-primary/5" : ""
              }`}
              onClick={() => onSelectClient?.(client)}
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  {client.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {client.company && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Building className="h-3.5 w-3.5" />
                    <span>{client.company}</span>
                  </div>
                )}
                {client.email && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="h-3.5 w-3.5" />
                    <span className="truncate">{client.email}</span>
                  </div>
                )}
                {client.phone && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="h-3.5 w-3.5" />
                    <span>{client.phone}</span>
                  </div>
                )}
                <div className="flex gap-2 pt-2" onClick={e => e.stopPropagation()}>
                  <Button 
                    size="icon-sm" 
                    variant="ghost"
                    onClick={() => handleOpenEdit(client)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button size="icon-sm" variant="ghost" className="text-destructive hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete client?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently delete "{client.name}" from your CRM.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          onClick={() => handleDelete(client.id)}
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
