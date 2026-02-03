import { useState } from "react";
import { FileText, Download, Send, Plus, Trash2, AlertCircle, CheckCircle2, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProposalData, PROJECT_TYPES, CURRENCIES, InvoiceData, InvoiceItem } from "@/types/project";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuthContext } from "@/contexts/AuthContext";
import type { Json } from "@/integrations/supabase/types";

interface InvoiceGeneratorProps {
  proposal: ProposalData;
  proposalId?: string;
  onSaved?: () => void;
}

interface ValidationErrors {
  yourName?: string;
  yourEmail?: string;
  clientName?: string;
  clientEmail?: string;
  projectName?: string;
}

interface DocumentDetails {
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  startDate: string;
  projectName: string;
  projectDescription: string;
  clientName: string;
  clientEmail: string;
  clientAddress: string;
  yourName: string;
  yourEmail: string;
  yourAddress: string;
  items: InvoiceItem[];
  notes: string;
  taxRate: number;
  subtotal: number;
  taxAmount: number;
  total: number;
}

export function InvoiceGenerator({ proposal, proposalId, onSaved }: InvoiceGeneratorProps) {
  const { user } = useAuthContext();
  const currencySymbol =
    CURRENCIES.find((c) => c.value === proposal.config.currency)?.symbol || "$";
  
  const projectTypeLabel =
    PROJECT_TYPES.find((p) => p.value === proposal.config.type)?.label || "Website Project";

  const generateInvoiceNumber = () => {
    const date = new Date();
    return `PRO-${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, "0")}${String(date.getDate()).padStart(2, "0")}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
  };

  const formatDate = (date: Date) => {
    return date.toISOString().split("T")[0];
  };

  const formatDisplayDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  };

  const today = new Date();
  const validUntil = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days validity
  const projectStartDate = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000); // Start in 1 week

  const [invoice, setInvoice] = useState<InvoiceData>({
    invoiceNumber: generateInvoiceNumber(),
    issueDate: formatDate(today),
    dueDate: formatDate(validUntil),
    clientName: "",
    clientEmail: "",
    clientAddress: "",
    yourName: "",
    yourEmail: "",
    yourAddress: "",
    items: proposal.paymentStructure.map((payment) => ({
      description: payment.label,
      quantity: 1,
      rate: payment.amount,
      amount: payment.amount,
    })),
    notes: "This proposal is valid for 30 days from the issue date. Please sign and return to proceed.",
    taxRate: 0,
  });

  const [projectName, setProjectName] = useState(projectTypeLabel);
  const [projectDescription, setProjectDescription] = useState("");
  const [startDate, setStartDate] = useState(formatDate(projectStartDate));
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("details");
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const updateInvoice = <K extends keyof InvoiceData>(
    key: K,
    value: InvoiceData[K]
  ) => {
    setInvoice((prev) => ({ ...prev, [key]: value }));
    // Clear error when field is updated
    if (key in errors) {
      setErrors((prev) => ({ ...prev, [key]: undefined }));
    }
  };

  const addItem = () => {
    const newItem: InvoiceItem = {
      description: "",
      quantity: 1,
      rate: 0,
      amount: 0,
    };
    updateInvoice("items", [...invoice.items, newItem]);
  };

  const updateItem = (index: number, field: keyof InvoiceItem, value: string | number) => {
    const newItems = [...invoice.items];
    newItems[index] = { ...newItems[index], [field]: value };
    
    if (field === "quantity" || field === "rate") {
      newItems[index].amount = newItems[index].quantity * newItems[index].rate;
    }
    
    updateInvoice("items", newItems);
  };

  const removeItem = (index: number) => {
    if (invoice.items.length > 1) {
      updateInvoice("items", invoice.items.filter((_, i) => i !== index));
    }
  };

  const subtotal = invoice.items.reduce((sum, item) => sum + item.amount, 0);
  const taxAmount = subtotal * (invoice.taxRate / 100);
  const total = subtotal + taxAmount;

  const formatCurrency = (amount: number) => {
    return `${currencySymbol}${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};
    
    if (!invoice.yourName.trim()) {
      newErrors.yourName = "Your name/business is required";
    }
    if (!invoice.yourEmail.trim()) {
      newErrors.yourEmail = "Your email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(invoice.yourEmail)) {
      newErrors.yourEmail = "Please enter a valid email";
    }
    if (!invoice.clientName.trim()) {
      newErrors.clientName = "Client name is required";
    }
    if (!invoice.clientEmail.trim()) {
      newErrors.clientEmail = "Client email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(invoice.clientEmail)) {
      newErrors.clientEmail = "Please enter a valid email";
    }
    if (!projectName.trim()) {
      newErrors.projectName = "Project name is required";
    }
    
    setErrors(newErrors);
    
    if (Object.keys(newErrors).length > 0) {
      // Switch to the tab with the first error
      if (newErrors.yourName || newErrors.yourEmail || newErrors.clientName || newErrors.clientEmail) {
        setActiveTab("details");
      }
      toast.error("Please fill in all required fields");
      return false;
    }
    
    return true;
  };

  const isFormComplete = (): boolean => {
    return Boolean(
      invoice.yourName.trim() &&
      invoice.yourEmail.trim() &&
      invoice.clientName.trim() &&
      invoice.clientEmail.trim() &&
      projectName.trim()
    );
  };

  const handleSaveDocument = async () => {
    if (!validateForm()) return;
    if (!user || !proposalId) {
      toast.error("Unable to save - please ensure you're logged in");
      return;
    }

    setIsSaving(true);

    const documentDetails: DocumentDetails = {
      invoiceNumber: invoice.invoiceNumber,
      issueDate: invoice.issueDate,
      dueDate: invoice.dueDate,
      startDate,
      projectName,
      projectDescription,
      clientName: invoice.clientName,
      clientEmail: invoice.clientEmail,
      clientAddress: invoice.clientAddress,
      yourName: invoice.yourName,
      yourEmail: invoice.yourEmail,
      yourAddress: invoice.yourAddress,
      items: invoice.items,
      notes: invoice.notes,
      taxRate: invoice.taxRate,
      subtotal,
      taxAmount,
      total,
    };

    const { error } = await supabase
      .from("proposals")
      .update({ document_details: documentDetails as unknown as Json })
      .eq("id", proposalId)
      .eq("user_id", user.id);

    setIsSaving(false);

    if (error) {
      console.error("Error saving document:", error);
      toast.error("Failed to save proposal document");
      return;
    }

    setIsSaved(true);
    toast.success("Proposal document saved successfully!");
    onSaved?.();
  };

  const handleExportDocument = () => {
    if (!validateForm()) return;

    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Project Proposal - ${projectName}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: 'Inter', system-ui, sans-serif; padding: 50px; max-width: 850px; margin: 0 auto; color: #1a1a1a; font-size: 14px; line-height: 1.6; }
            .header { margin-bottom: 50px; padding-bottom: 30px; border-bottom: 3px solid #000; }
            .document-title { font-size: 36px; font-weight: 800; color: #000; margin-bottom: 8px; }
            .document-number { color: #666; font-size: 14px; }
            .project-name { font-size: 24px; font-weight: 600; color: #333; margin-top: 16px; }
            
            .meta-section { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-bottom: 40px; }
            .meta-block h3 { font-size: 11px; text-transform: uppercase; color: #666; margin-bottom: 10px; letter-spacing: 1px; font-weight: 600; }
            .meta-block p { line-height: 1.7; }
            .meta-block strong { font-weight: 600; }
            
            .dates-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 40px; background: #f8f9fa; padding: 20px; border-radius: 8px; }
            .date-item { text-align: center; }
            .date-item label { font-size: 11px; text-transform: uppercase; color: #666; display: block; margin-bottom: 6px; letter-spacing: 0.5px; }
            .date-item span { font-weight: 600; font-size: 15px; }
            
            .section { margin-bottom: 35px; }
            .section-title { font-size: 18px; font-weight: 700; color: #000; margin-bottom: 16px; padding-bottom: 8px; border-bottom: 2px solid #eee; }
            .section-subtitle { font-size: 14px; font-weight: 600; color: #333; margin-bottom: 10px; margin-top: 20px; }
            
            .summary-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 30px; }
            .summary-item { background: #f8f9fa; padding: 16px; border-radius: 8px; text-align: center; }
            .summary-item label { font-size: 11px; text-transform: uppercase; color: #666; display: block; margin-bottom: 6px; }
            .summary-item .value { font-size: 20px; font-weight: 700; color: #000; }
            .summary-item.highlight { background: #000; color: #fff; }
            .summary-item.highlight label { color: #aaa; }
            .summary-item.highlight .value { color: #fff; }
            
            ul { padding-left: 0; list-style: none; }
            ul li { padding: 10px 0; padding-left: 24px; position: relative; border-bottom: 1px solid #f0f0f0; }
            ul li:last-child { border-bottom: none; }
            ul li::before { content: "✓"; position: absolute; left: 0; color: #22c55e; font-weight: bold; }
            
            .timeline-table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            .timeline-table th { text-align: left; padding: 12px; background: #f8f9fa; font-size: 11px; text-transform: uppercase; color: #666; letter-spacing: 0.5px; }
            .timeline-table td { padding: 14px 12px; border-bottom: 1px solid #eee; }
            .timeline-table .milestone-name { font-weight: 600; }
            
            .pricing-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            .pricing-table th { text-align: left; padding: 14px 12px; background: #000; color: #fff; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; }
            .pricing-table th:last-child { text-align: right; }
            .pricing-table td { padding: 16px 12px; border-bottom: 1px solid #eee; }
            .pricing-table td:last-child { text-align: right; font-weight: 600; }
            
            .totals { margin-left: auto; width: 300px; margin-top: 20px; }
            .total-row { display: flex; justify-content: space-between; padding: 10px 0; }
            .total-row.final { border-top: 3px solid #000; margin-top: 10px; padding-top: 16px; font-size: 20px; font-weight: 700; }
            
            .terms { background: #f8f9fa; padding: 24px; border-radius: 8px; margin-top: 30px; }
            .terms h3 { font-size: 14px; font-weight: 600; margin-bottom: 12px; }
            .terms p { color: #666; font-size: 13px; }
            
            .signature-section { display: grid; grid-template-columns: 1fr 1fr; gap: 60px; margin-top: 50px; padding-top: 30px; }
            .signature-block { }
            .signature-block h4 { font-size: 11px; text-transform: uppercase; color: #666; margin-bottom: 20px; letter-spacing: 0.5px; }
            .signature-line { border-bottom: 1px solid #000; height: 50px; margin-bottom: 8px; }
            .signature-label { font-size: 12px; color: #666; }
            
            .footer { margin-top: 60px; text-align: center; color: #999; font-size: 12px; padding-top: 20px; border-top: 1px solid #eee; }
            
            @media print { 
              body { padding: 30px; }
              .section { page-break-inside: avoid; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="document-title">PROJECT PROPOSAL</div>
            <div class="document-number">${invoice.invoiceNumber}</div>
            <div class="project-name">${projectName}</div>
          </div>
          
          <div class="meta-section">
            <div class="meta-block">
              <h3>From</h3>
              <p>
                <strong>${invoice.yourName}</strong><br/>
                ${invoice.yourEmail}<br/>
                ${invoice.yourAddress ? invoice.yourAddress.replace(/\n/g, "<br/>") : ""}
              </p>
            </div>
            <div class="meta-block">
              <h3>Prepared For</h3>
              <p>
                <strong>${invoice.clientName}</strong><br/>
                ${invoice.clientEmail}<br/>
                ${invoice.clientAddress ? invoice.clientAddress.replace(/\n/g, "<br/>") : ""}
              </p>
            </div>
          </div>
          
          <div class="dates-row">
            <div class="date-item">
              <label>Issue Date</label>
              <span>${formatDisplayDate(invoice.issueDate)}</span>
            </div>
            <div class="date-item">
              <label>Valid Until</label>
              <span>${formatDisplayDate(invoice.dueDate)}</span>
            </div>
            <div class="date-item">
              <label>Project Start</label>
              <span>${formatDisplayDate(startDate)}</span>
            </div>
          </div>
          
          ${projectDescription ? `
            <div class="section">
              <div class="section-title">Project Overview</div>
              <p>${projectDescription}</p>
            </div>
          ` : ""}
          
          <div class="section">
            <div class="section-title">Project Summary</div>
            <div class="summary-grid">
              <div class="summary-item">
                <label>Project Type</label>
                <div class="value">${projectTypeLabel.split(" ")[0]}</div>
              </div>
              <div class="summary-item">
                <label>Est. Hours</label>
                <div class="value">${proposal.pricing.estimatedHours}</div>
              </div>
              <div class="summary-item">
                <label>Timeline</label>
                <div class="value">${proposal.pricing.timelineWeeks} wks</div>
              </div>
              <div class="summary-item highlight">
                <label>Investment</label>
                <div class="value">${formatCurrency(total)}</div>
              </div>
            </div>
          </div>
          
          <div class="section">
            <div class="section-title">Scope of Work</div>
            <ul>
              ${proposal.scopeOfWork.map((item) => `<li>${item}</li>`).join("")}
            </ul>
          </div>
          
          <div class="section">
            <div class="section-title">Deliverables</div>
            <ul>
              ${proposal.deliverables.map((item) => `<li>${item}</li>`).join("")}
            </ul>
          </div>
          
          <div class="section">
            <div class="section-title">Project Timeline</div>
            <table class="timeline-table">
              <thead>
                <tr>
                  <th>Phase</th>
                  <th>Duration</th>
                  <th>Payment Due</th>
                </tr>
              </thead>
              <tbody>
                ${proposal.milestones.map((milestone) => `
                  <tr>
                    <td class="milestone-name">${milestone.name}</td>
                    <td>${milestone.duration}</td>
                    <td>${milestone.payment}%</td>
                  </tr>
                `).join("")}
              </tbody>
            </table>
          </div>
          
          <div class="section">
            <div class="section-title">Investment & Payment Schedule</div>
            <table class="pricing-table">
              <thead>
                <tr>
                  <th>Description</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                ${invoice.items.map((item) => `
                  <tr>
                    <td>${item.description}</td>
                    <td>${formatCurrency(item.amount)}</td>
                  </tr>
                `).join("")}
              </tbody>
            </table>
            
            <div class="totals">
              <div class="total-row">
                <span>Subtotal</span>
                <span>${formatCurrency(subtotal)}</span>
              </div>
              ${invoice.taxRate > 0 ? `
                <div class="total-row">
                  <span>Tax (${invoice.taxRate}%)</span>
                  <span>${formatCurrency(taxAmount)}</span>
                </div>
              ` : ""}
              <div class="total-row final">
                <span>Total Investment</span>
                <span>${formatCurrency(total)}</span>
              </div>
            </div>
          </div>
          
          ${invoice.notes ? `
            <div class="terms">
              <h3>Terms & Conditions</h3>
              <p>${invoice.notes}</p>
            </div>
          ` : ""}
          
          <div class="signature-section">
            <div class="signature-block">
              <h4>Client Approval</h4>
              <div class="signature-line"></div>
              <div class="signature-label">${invoice.clientName} / Date</div>
            </div>
            <div class="signature-block">
              <h4>Provider</h4>
              <div class="signature-line"></div>
              <div class="signature-label">${invoice.yourName} / Date</div>
            </div>
          </div>
          
          <div class="footer">
            Generated with ScopeGen • ${formatDisplayDate(invoice.issueDate)}
          </div>
        </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const handleSendDocument = () => {
    if (!validateForm()) return;
    
    const subject = encodeURIComponent(`Project Proposal: ${projectName} - ${invoice.invoiceNumber}`);
    const body = encodeURIComponent(`Hi ${invoice.clientName},

I'm pleased to share the project proposal for ${projectName}.

Project Summary:
• Estimated Hours: ${proposal.pricing.estimatedHours} hours
• Timeline: ${proposal.pricing.timelineWeeks} weeks
• Total Investment: ${formatCurrency(total)}

Scope of Work:
${proposal.scopeOfWork.map((item) => `• ${item}`).join("\n")}

This proposal is valid until ${formatDisplayDate(invoice.dueDate)}. Please let me know if you have any questions or would like to discuss further.

Looking forward to working with you!

Best regards,
${invoice.yourName}
${invoice.yourEmail}`);
    
    window.open(`mailto:${invoice.clientEmail}?subject=${subject}&body=${body}`);
    toast.success("Email client opened!");
  };

  const RequiredLabel = ({ children, error }: { children: React.ReactNode; error?: string }) => (
    <div className="flex items-center gap-1">
      <span>{children}</span>
      <span className="text-destructive">*</span>
      {error && (
        <span className="text-xs text-destructive ml-2 flex items-center gap-1">
          <AlertCircle className="h-3 w-3" />
          {error}
        </span>
      )}
    </div>
  );

  const CompletionIndicator = ({ complete }: { complete: boolean }) => (
    <span className={cn(
      "inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full",
      complete ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-muted text-muted-foreground"
    )}>
      {complete ? <CheckCircle2 className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
      {complete ? "Complete" : "Required fields missing"}
    </span>
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="pill-outline" size="lg">
          <FileText className="mr-2 h-4 w-4" />
          Generate Proposal
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center justify-between">
            <span>Generate Proposal Document</span>
            <CompletionIndicator complete={isFormComplete()} />
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="details">Contact Details</TabsTrigger>
            <TabsTrigger value="project">Project Info</TabsTrigger>
            <TabsTrigger value="pricing">Pricing</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-6 py-4">
            {/* Your Details */}
            <div>
              <h3 className="font-semibold mb-4">Your Details</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="yourName">
                    <RequiredLabel error={errors.yourName}>Your Name / Business</RequiredLabel>
                  </Label>
                  <Input
                    id="yourName"
                    placeholder="John Doe / Acme Design"
                    value={invoice.yourName}
                    onChange={(e) => updateInvoice("yourName", e.target.value)}
                    className={errors.yourName ? "border-destructive" : ""}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="yourEmail">
                    <RequiredLabel error={errors.yourEmail}>Your Email</RequiredLabel>
                  </Label>
                  <Input
                    id="yourEmail"
                    type="email"
                    placeholder="you@example.com"
                    value={invoice.yourEmail}
                    onChange={(e) => updateInvoice("yourEmail", e.target.value)}
                    className={errors.yourEmail ? "border-destructive" : ""}
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="yourAddress">Your Address (Optional)</Label>
                  <Textarea
                    id="yourAddress"
                    placeholder="123 Main St, City, Country"
                    value={invoice.yourAddress}
                    onChange={(e) => updateInvoice("yourAddress", e.target.value)}
                    rows={2}
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Client Details */}
            <div>
              <h3 className="font-semibold mb-4">Client Details</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="clientName">
                    <RequiredLabel error={errors.clientName}>Client Name / Company</RequiredLabel>
                  </Label>
                  <Input
                    id="clientName"
                    placeholder="Client Company Inc."
                    value={invoice.clientName}
                    onChange={(e) => updateInvoice("clientName", e.target.value)}
                    className={errors.clientName ? "border-destructive" : ""}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="clientEmail">
                    <RequiredLabel error={errors.clientEmail}>Client Email</RequiredLabel>
                  </Label>
                  <Input
                    id="clientEmail"
                    type="email"
                    placeholder="client@company.com"
                    value={invoice.clientEmail}
                    onChange={(e) => updateInvoice("clientEmail", e.target.value)}
                    className={errors.clientEmail ? "border-destructive" : ""}
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="clientAddress">Client Address (Optional)</Label>
                  <Textarea
                    id="clientAddress"
                    placeholder="456 Business Ave, City, Country"
                    value={invoice.clientAddress}
                    onChange={(e) => updateInvoice("clientAddress", e.target.value)}
                    rows={2}
                  />
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="project" className="space-y-6 py-4">
            {/* Project Details */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="projectName">
                  <RequiredLabel error={errors.projectName}>Project Name</RequiredLabel>
                </Label>
                <Input
                  id="projectName"
                  placeholder="Website Redesign Project"
                  value={projectName}
                  onChange={(e) => {
                    setProjectName(e.target.value);
                    if (errors.projectName) {
                      setErrors((prev) => ({ ...prev, projectName: undefined }));
                    }
                  }}
                  className={errors.projectName ? "border-destructive" : ""}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="invoiceNumber">Proposal Number</Label>
                <Input
                  id="invoiceNumber"
                  value={invoice.invoiceNumber}
                  onChange={(e) => updateInvoice("invoiceNumber", e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="projectDescription">Project Description (Optional)</Label>
              <Textarea
                id="projectDescription"
                placeholder="Brief overview of the project goals and objectives..."
                value={projectDescription}
                onChange={(e) => setProjectDescription(e.target.value)}
                rows={3}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="issueDate">Issue Date</Label>
                <Input
                  id="issueDate"
                  type="date"
                  value={invoice.issueDate}
                  onChange={(e) => updateInvoice("issueDate", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="startDate">Project Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dueDate">Valid Until</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={invoice.dueDate}
                  onChange={(e) => updateInvoice("dueDate", e.target.value)}
                />
              </div>
            </div>

            <Separator />

            {/* Auto-included from proposal */}
            <div className="space-y-4">
              <h3 className="font-semibold">Included from Proposal</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="p-4 rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground mb-2">Scope of Work</p>
                  <ul className="text-sm space-y-1">
                    {proposal.scopeOfWork.slice(0, 3).map((item, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                        <span className="line-clamp-1">{item}</span>
                      </li>
                    ))}
                    {proposal.scopeOfWork.length > 3 && (
                      <li className="text-muted-foreground">+{proposal.scopeOfWork.length - 3} more items</li>
                    )}
                  </ul>
                </div>
                <div className="p-4 rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground mb-2">Timeline & Milestones</p>
                  <ul className="text-sm space-y-1">
                    {proposal.milestones.map((milestone, i) => (
                      <li key={i} className="flex items-center justify-between">
                        <span>{milestone.name}</span>
                        <span className="text-muted-foreground">{milestone.duration}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Terms & Conditions</Label>
              <Textarea
                id="notes"
                placeholder="Payment terms, revision policy, or other terms..."
                value={invoice.notes}
                onChange={(e) => updateInvoice("notes", e.target.value)}
                rows={3}
              />
            </div>
          </TabsContent>

          <TabsContent value="pricing" className="space-y-6 py-4">
            {/* Payment Items */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Payment Schedule</h3>
                <Button variant="ghost" size="sm" onClick={addItem}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add Item
                </Button>
              </div>
              
              <div className="space-y-3">
                {invoice.items.map((item, index) => (
                  <div key={index} className="grid gap-3 grid-cols-12 items-end p-3 rounded-lg bg-muted/50">
                    <div className="col-span-12 sm:col-span-7 space-y-1">
                      <Label className="text-xs">Description</Label>
                      <Input
                        placeholder="Payment description"
                        value={item.description}
                        onChange={(e) => updateItem(index, "description", e.target.value)}
                      />
                    </div>
                    <div className="col-span-5 sm:col-span-2 space-y-1">
                      <Label className="text-xs">Amount</Label>
                      <Input
                        type="number"
                        min="0"
                        value={item.rate}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value) || 0;
                          updateItem(index, "rate", val);
                          updateItem(index, "amount", val);
                        }}
                      />
                    </div>
                    <div className="col-span-5 sm:col-span-2 space-y-1">
                      <Label className="text-xs">Total</Label>
                      <div className="h-10 flex items-center px-3 rounded-md bg-background font-medium">
                        {formatCurrency(item.amount)}
                      </div>
                    </div>
                    <div className="col-span-2 sm:col-span-1 flex justify-center">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => removeItem(index)}
                        disabled={invoice.items.length === 1}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Totals */}
            <div className="flex flex-col items-end">
              <div className="w-full sm:w-80 space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <Label htmlFor="taxRate" className="text-muted-foreground whitespace-nowrap">
                    Tax Rate (%)
                  </Label>
                  <Input
                    id="taxRate"
                    type="number"
                    min="0"
                    max="100"
                    className="w-24 text-right"
                    value={invoice.taxRate}
                    onChange={(e) => updateInvoice("taxRate", parseFloat(e.target.value) || 0)}
                  />
                </div>
                {invoice.taxRate > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tax</span>
                    <span className="font-medium">{formatCurrency(taxAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between pt-3 border-t-2 border-foreground">
                  <span className="font-bold text-lg">Total Investment</span>
                  <span className="text-2xl font-bold">{formatCurrency(total)}</span>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Actions */}
        <div className="flex flex-wrap gap-3 pt-4 border-t">
          {proposalId && user && (
            <Button 
              variant="pill" 
              onClick={handleSaveDocument} 
              disabled={!isFormComplete() || isSaving}
            >
              {isSaving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : isSaved ? (
                <CheckCircle2 className="mr-2 h-4 w-4" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              {isSaving ? "Saving..." : isSaved ? "Saved" : "Save Proposal"}
            </Button>
          )}
          <Button variant="pill-outline" onClick={handleExportDocument} disabled={!isFormComplete()}>
            <Download className="mr-2 h-4 w-4" />
            Export PDF
          </Button>
          <Button variant="pill-outline" onClick={handleSendDocument} disabled={!isFormComplete()}>
            <Send className="mr-2 h-4 w-4" />
            Send via Email
          </Button>
          {!isFormComplete() && (
            <p className="text-sm text-muted-foreground flex items-center gap-2 ml-auto">
              <AlertCircle className="h-4 w-4" />
              Complete required fields to generate document
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
