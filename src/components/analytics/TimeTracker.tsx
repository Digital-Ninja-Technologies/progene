import { useState } from "react";
import { Plus, Trash2, Clock, Calendar, DollarSign, FileText } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useTimeTracking } from "@/hooks/useTimeTracking";
import { useClients } from "@/hooks/useClients";
import { toast } from "sonner";

interface TimeEntryFormData {
  description: string;
  hours: string;
  date: string;
  billable: boolean;
  client_id: string | null;
  proposal_id: string | null;
}

const defaultFormData: TimeEntryFormData = {
  description: "",
  hours: "",
  date: new Date().toISOString().split('T')[0],
  billable: true,
  client_id: null,
  proposal_id: null,
};

export function TimeTracker() {
  const { entries, loading, createEntry, deleteEntry, getTotalHours } = useTimeTracking();
  const { clients } = useClients();
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState<TimeEntryFormData>(defaultFormData);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!formData.description.trim() || !formData.hours) return;
    
    setSaving(true);
    const { error } = await createEntry({
      description: formData.description.trim(),
      hours: parseFloat(formData.hours),
      date: formData.date,
      billable: formData.billable,
      client_id: formData.client_id,
      proposal_id: formData.proposal_id,
    });
    setSaving(false);

    if (error) {
      toast.error("Failed to log time");
    } else {
      toast.success("Time logged!");
      setFormData(defaultFormData);
      setIsOpen(false);
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await deleteEntry(id);
    if (error) {
      toast.error("Failed to delete entry");
    } else {
      toast.success("Entry deleted");
    }
  };

  const totalHours = getTotalHours();
  const billableHours = getTotalHours(true);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Time Tracking</h3>
          <p className="text-sm text-muted-foreground">
            Log hours against projects and clients
          </p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Log Time
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Log Time Entry</DialogTitle>
              <DialogDescription>
                Record time spent on a project or task
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <label className="text-sm font-medium">Description *</label>
                <Input
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="What did you work on?"
                  className="mt-1.5"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Hours *</label>
                  <Input
                    type="number"
                    step="0.25"
                    min="0.25"
                    value={formData.hours}
                    onChange={(e) => setFormData(prev => ({ ...prev, hours: e.target.value }))}
                    placeholder="2.5"
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Date</label>
                  <Input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                    className="mt-1.5"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Client (optional)</label>
                <Select
                  value={formData.client_id || "none"}
                  onValueChange={(v) => setFormData(prev => ({ ...prev, client_id: v === "none" ? null : v }))}
                >
                  <SelectTrigger className="mt-1.5">
                    <SelectValue placeholder="Select a client" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No client</SelectItem>
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="billable"
                  checked={formData.billable}
                  onCheckedChange={(checked) => 
                    setFormData(prev => ({ ...prev, billable: checked === true }))
                  }
                />
                <label htmlFor="billable" className="text-sm font-medium cursor-pointer">
                  Billable time
                </label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleSave} 
                disabled={!formData.description.trim() || !formData.hours || saving}
              >
                {saving ? "Saving..." : "Log Time"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Total Hours
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{totalHours.toFixed(1)}h</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Billable Hours
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-primary">{billableHours.toFixed(1)}h</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Entries
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{entries.length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Time Entries Table */}
      {loading ? (
        <div className="text-center py-8 text-muted-foreground">Loading time entries...</div>
      ) : entries.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-8 text-center text-muted-foreground">
            <Clock className="mx-auto h-10 w-10 mb-3 opacity-50" />
            <p>No time entries yet</p>
            <p className="text-sm mt-1">Start logging your work hours</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Hours</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {entries.slice(0, 20).map((entry) => {
                const client = clients.find(c => c.id === entry.client_id);
                return (
                  <TableRow key={entry.id}>
                    <TableCell className="text-muted-foreground">
                      {format(new Date(entry.date), "MMM d")}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{entry.description}</p>
                        {client && (
                          <p className="text-xs text-muted-foreground">{client.name}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="font-mono">{Number(entry.hours).toFixed(1)}h</TableCell>
                    <TableCell>
                      <Badge variant={entry.billable ? "default" : "secondary"}>
                        {entry.billable ? "Billable" : "Non-billable"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="icon-sm" variant="ghost" className="text-destructive hover:text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete time entry?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will permanently delete this time entry.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              onClick={() => handleDelete(entry.id)}
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}
