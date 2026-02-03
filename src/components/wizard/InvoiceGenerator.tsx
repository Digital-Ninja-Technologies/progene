import { useState } from "react";
import { FileText, Download, Send, Plus, Trash2 } from "lucide-react";
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
import { ProposalData, CURRENCIES, InvoiceData, InvoiceItem } from "@/types/project";
import { toast } from "sonner";

interface InvoiceGeneratorProps {
  proposal: ProposalData;
}

export function InvoiceGenerator({ proposal }: InvoiceGeneratorProps) {
  const currencySymbol =
    CURRENCIES.find((c) => c.value === proposal.config.currency)?.symbol || "$";

  const generateInvoiceNumber = () => {
    const date = new Date();
    return `INV-${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, "0")}${String(date.getDate()).padStart(2, "0")}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
  };

  const formatDate = (date: Date) => {
    return date.toISOString().split("T")[0];
  };

  const today = new Date();
  const dueDate = new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000); // 14 days from now

  const [invoice, setInvoice] = useState<InvoiceData>({
    invoiceNumber: generateInvoiceNumber(),
    issueDate: formatDate(today),
    dueDate: formatDate(dueDate),
    clientName: "",
    clientEmail: "",
    clientAddress: "",
    yourName: "",
    yourEmail: "",
    yourAddress: "",
    items: [
      {
        description: `${proposal.scopeOfWork[0] || "Project Development"}`,
        quantity: 1,
        rate: proposal.pricing.recommendedPrice * 0.5,
        amount: proposal.pricing.recommendedPrice * 0.5,
      },
    ],
    notes: "Payment due within 14 days of invoice date. Thank you for your business!",
    taxRate: 0,
  });

  const [isOpen, setIsOpen] = useState(false);

  const updateInvoice = <K extends keyof InvoiceData>(
    key: K,
    value: InvoiceData[K]
  ) => {
    setInvoice((prev) => ({ ...prev, [key]: value }));
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
    
    // Recalculate amount
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

  const handleExportInvoice = () => {
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Invoice ${invoice.invoiceNumber}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: 'Inter', system-ui, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; color: #1a1a1a; font-size: 14px; }
            .header { display: flex; justify-content: space-between; margin-bottom: 40px; }
            .invoice-title { font-size: 32px; font-weight: 700; color: #000; }
            .invoice-number { color: #666; margin-top: 4px; }
            .addresses { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-bottom: 40px; }
            .address-block h3 { font-size: 12px; text-transform: uppercase; color: #666; margin-bottom: 8px; letter-spacing: 0.5px; }
            .address-block p { line-height: 1.6; }
            .dates { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 40px; background: #f8f8f8; padding: 20px; border-radius: 8px; }
            .date-item label { font-size: 12px; text-transform: uppercase; color: #666; display: block; margin-bottom: 4px; }
            .date-item span { font-weight: 600; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
            th { text-align: left; padding: 12px 8px; border-bottom: 2px solid #000; font-size: 12px; text-transform: uppercase; color: #666; }
            td { padding: 16px 8px; border-bottom: 1px solid #eee; }
            .text-right { text-align: right; }
            .totals { margin-left: auto; width: 280px; }
            .total-row { display: flex; justify-content: space-between; padding: 8px 0; }
            .total-row.final { border-top: 2px solid #000; margin-top: 8px; padding-top: 16px; font-size: 18px; font-weight: 700; }
            .notes { margin-top: 40px; padding: 20px; background: #f8f8f8; border-radius: 8px; }
            .notes h3 { font-size: 12px; text-transform: uppercase; color: #666; margin-bottom: 8px; }
            .footer { margin-top: 60px; text-align: center; color: #999; font-size: 12px; }
            @media print { body { padding: 20px; } }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="invoice-title">INVOICE</div>
              <div class="invoice-number">${invoice.invoiceNumber}</div>
            </div>
          </div>
          
          <div class="addresses">
            <div class="address-block">
              <h3>From</h3>
              <p><strong>${invoice.yourName || "Your Name"}</strong><br/>
              ${invoice.yourEmail || "your@email.com"}<br/>
              ${invoice.yourAddress.replace(/\n/g, "<br/>") || "Your Address"}</p>
            </div>
            <div class="address-block">
              <h3>Bill To</h3>
              <p><strong>${invoice.clientName || "Client Name"}</strong><br/>
              ${invoice.clientEmail || "client@email.com"}<br/>
              ${invoice.clientAddress.replace(/\n/g, "<br/>") || "Client Address"}</p>
            </div>
          </div>
          
          <div class="dates">
            <div class="date-item">
              <label>Issue Date</label>
              <span>${invoice.issueDate}</span>
            </div>
            <div class="date-item">
              <label>Due Date</label>
              <span>${invoice.dueDate}</span>
            </div>
          </div>
          
          <table>
            <thead>
              <tr>
                <th>Description</th>
                <th class="text-right">Qty</th>
                <th class="text-right">Rate</th>
                <th class="text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${invoice.items.map((item) => `
                <tr>
                  <td>${item.description}</td>
                  <td class="text-right">${item.quantity}</td>
                  <td class="text-right">${formatCurrency(item.rate)}</td>
                  <td class="text-right">${formatCurrency(item.amount)}</td>
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
              <span>Total</span>
              <span>${formatCurrency(total)}</span>
            </div>
          </div>
          
          ${invoice.notes ? `
            <div class="notes">
              <h3>Notes</h3>
              <p>${invoice.notes}</p>
            </div>
          ` : ""}
          
          <div class="footer">
            Generated with ScopeGen
          </div>
        </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const handleSendInvoice = () => {
    if (!invoice.clientEmail) {
      toast.error("Please enter a client email address");
      return;
    }
    
    const subject = encodeURIComponent(`Invoice ${invoice.invoiceNumber}`);
    const body = encodeURIComponent(`Hi ${invoice.clientName || "there"},

Please find attached invoice ${invoice.invoiceNumber} for ${formatCurrency(total)}.

Due Date: ${invoice.dueDate}

Thank you for your business!

Best regards,
${invoice.yourName || "Your Name"}`);
    
    window.open(`mailto:${invoice.clientEmail}?subject=${subject}&body=${body}`);
    toast.success("Email client opened!");
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="pill-outline" size="lg">
          <FileText className="mr-2 h-4 w-4" />
          Generate Invoice
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Generate Invoice</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Invoice Details */}
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="invoiceNumber">Invoice Number</Label>
              <Input
                id="invoiceNumber"
                value={invoice.invoiceNumber}
                onChange={(e) => updateInvoice("invoiceNumber", e.target.value)}
              />
            </div>
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
              <Label htmlFor="dueDate">Due Date</Label>
              <Input
                id="dueDate"
                type="date"
                value={invoice.dueDate}
                onChange={(e) => updateInvoice("dueDate", e.target.value)}
              />
            </div>
          </div>

          <Separator />

          {/* Your Details */}
          <div>
            <h3 className="font-semibold mb-4">Your Details</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="yourName">Your Name / Business</Label>
                <Input
                  id="yourName"
                  placeholder="John Doe / Acme Design"
                  value={invoice.yourName}
                  onChange={(e) => updateInvoice("yourName", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="yourEmail">Your Email</Label>
                <Input
                  id="yourEmail"
                  type="email"
                  placeholder="you@example.com"
                  value={invoice.yourEmail}
                  onChange={(e) => updateInvoice("yourEmail", e.target.value)}
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="yourAddress">Your Address</Label>
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
                <Label htmlFor="clientName">Client Name / Company</Label>
                <Input
                  id="clientName"
                  placeholder="Client Company Inc."
                  value={invoice.clientName}
                  onChange={(e) => updateInvoice("clientName", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="clientEmail">Client Email</Label>
                <Input
                  id="clientEmail"
                  type="email"
                  placeholder="client@company.com"
                  value={invoice.clientEmail}
                  onChange={(e) => updateInvoice("clientEmail", e.target.value)}
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="clientAddress">Client Address</Label>
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

          <Separator />

          {/* Line Items */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Line Items</h3>
              <Button variant="ghost" size="sm" onClick={addItem}>
                <Plus className="h-4 w-4 mr-1" />
                Add Item
              </Button>
            </div>
            
            <div className="space-y-3">
              {invoice.items.map((item, index) => (
                <div key={index} className="grid gap-3 grid-cols-12 items-end p-3 rounded-lg bg-muted/50">
                  <div className="col-span-12 sm:col-span-5 space-y-1">
                    <Label className="text-xs">Description</Label>
                    <Input
                      placeholder="Service description"
                      value={item.description}
                      onChange={(e) => updateItem(index, "description", e.target.value)}
                    />
                  </div>
                  <div className="col-span-4 sm:col-span-2 space-y-1">
                    <Label className="text-xs">Qty</Label>
                    <Input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => updateItem(index, "quantity", parseInt(e.target.value) || 1)}
                    />
                  </div>
                  <div className="col-span-4 sm:col-span-2 space-y-1">
                    <Label className="text-xs">Rate</Label>
                    <Input
                      type="number"
                      min="0"
                      value={item.rate}
                      onChange={(e) => updateItem(index, "rate", parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div className="col-span-3 sm:col-span-2 space-y-1">
                    <Label className="text-xs">Amount</Label>
                    <div className="h-10 flex items-center px-3 rounded-md bg-background font-medium">
                      {formatCurrency(item.amount)}
                    </div>
                  </div>
                  <div className="col-span-1 flex justify-center">
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

          {/* Tax & Totals */}
          <div className="flex flex-col items-end">
            <div className="w-full sm:w-72 space-y-2">
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
                  className="w-20 text-right"
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
              <div className="flex justify-between pt-2 border-t border-border">
                <span className="font-semibold">Total</span>
                <span className="text-xl font-bold">{formatCurrency(total)}</span>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Payment terms, bank details, or other notes..."
              value={invoice.notes}
              onChange={(e) => updateInvoice("notes", e.target.value)}
              rows={3}
            />
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-3 pt-4">
            <Button variant="pill" onClick={handleExportInvoice}>
              <Download className="mr-2 h-4 w-4" />
              Export PDF
            </Button>
            <Button variant="pill-outline" onClick={handleSendInvoice}>
              <Send className="mr-2 h-4 w-4" />
              Send via Email
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
