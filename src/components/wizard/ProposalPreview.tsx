import { Copy, Download, FileText, Check, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProposalData, PROJECT_TYPES, CURRENCIES } from "@/types/project";
import { useState } from "react";
import { toast } from "sonner";
import { InvoiceGenerator } from "./InvoiceGenerator";

interface ProposalPreviewProps {
  proposal: ProposalData;
  proposalId?: string;
}

export function ProposalPreview({ proposal, proposalId }: ProposalPreviewProps) {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const projectTypeLabel =
    PROJECT_TYPES.find((p) => p.value === proposal.config.type)?.label || 'Website';
  const currencySymbol =
    CURRENCIES.find((c) => c.value === proposal.config.currency)?.symbol || '$';

  const formatCurrency = (amount: number) => {
    return `${currencySymbol}${amount.toLocaleString()}`;
  };

  const copyToClipboard = async (text: string, section: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedSection(section);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const generateFullProposalText = () => {
    return `
PROJECT PROPOSAL
================

Project: ${projectTypeLabel}
Estimated Hours: ${proposal.pricing.estimatedHours} hours
Timeline: ${proposal.pricing.timelineWeeks} weeks
Complexity: ${proposal.pricing.complexityLevel}

PRICING
-------
Minimum: ${formatCurrency(proposal.pricing.minPrice)}
Recommended: ${formatCurrency(proposal.pricing.recommendedPrice)}
Premium: ${formatCurrency(proposal.pricing.premiumPrice)}

SCOPE OF WORK
-------------
${proposal.scopeOfWork.map((item) => `• ${item}`).join('\n')}

DELIVERABLES
------------
${proposal.deliverables.map((item) => `• ${item}`).join('\n')}

PAYMENT STRUCTURE
-----------------
${proposal.paymentStructure.map((p) => `• ${p.label}: ${formatCurrency(p.amount)} (${p.percentage}%)`).join('\n')}

---
Generated with ProposalGene
    `.trim();
  };

  const handleCopyAll = () => {
    copyToClipboard(generateFullProposalText(), 'all');
  };

  const handleExportPDF = () => {
    // Create a printable version
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Project Proposal - ${projectTypeLabel}</title>
          <style>
            body { font-family: 'Inter', system-ui, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; color: #000; }
            h1 { color: #000; border-bottom: 2px solid #000; padding-bottom: 10px; }
            h2 { color: #000; margin-top: 30px; }
            ul { line-height: 1.8; }
            .price-box { background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .price-recommended { font-size: 32px; font-weight: bold; color: #000; }
            .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <h1>Project Proposal</h1>
          <p><strong>Project Type:</strong> ${projectTypeLabel}</p>
          <p><strong>Estimated Hours:</strong> ${proposal.pricing.estimatedHours} hours</p>
          <p><strong>Timeline:</strong> ${proposal.pricing.timelineWeeks} weeks</p>
          <p><strong>Complexity:</strong> ${proposal.pricing.complexityLevel}</p>
          
          <div class="price-box">
            <p>Recommended Investment</p>
            <p class="price-recommended">${formatCurrency(proposal.pricing.recommendedPrice)}</p>
            <p>Range: ${formatCurrency(proposal.pricing.minPrice)} - ${formatCurrency(proposal.pricing.premiumPrice)}</p>
          </div>
          
          <h2>Scope of Work</h2>
          <ul>
            ${proposal.scopeOfWork.map((item) => `<li>${item}</li>`).join('')}
          </ul>
          
          <h2>Deliverables</h2>
          <ul>
            ${proposal.deliverables.map((item) => `<li>${item}</li>`).join('')}
          </ul>
          
          <h2>Payment Structure</h2>
          <ul>
            ${proposal.paymentStructure.map((p) => `<li>${p.label}: ${formatCurrency(p.amount)} (${p.percentage}%)</li>`).join('')}
          </ul>
          
          <div class="footer">
            Generated with ProposalGene
          </div>
        </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-semibold sm:text-3xl mb-2">
          Your proposal is ready
        </h2>
        <p className="text-muted-foreground">
          Review, customize, and export your client-ready proposal.
        </p>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3 justify-center">
        <Button variant="pill" size="lg" onClick={handleExportPDF}>
          <Download className="mr-2 h-4 w-4" />
          Export PDF
        </Button>
        <Button variant="pill-outline" size="lg" onClick={handleCopyAll}>
          {copiedSection === 'all' ? (
            <Check className="mr-2 h-4 w-4" />
          ) : (
            <Copy className="mr-2 h-4 w-4" />
          )}
          Copy All
        </Button>
        <InvoiceGenerator proposal={proposal} proposalId={proposalId} />
        <Button variant="pill-outline" size="lg">
          <Mail className="mr-2 h-4 w-4" />
          Email Draft
        </Button>
      </div>

      {/* Pricing Summary */}
      <div className="glass-card p-8">
        <div className="flex items-center gap-2 mb-6">
          <FileText className="h-5 w-5 text-muted-foreground" />
          <h3 className="text-xl font-semibold">Pricing Summary</h3>
        </div>

        <div className="grid gap-4 sm:grid-cols-3 mb-6">
          <div className="text-center p-4 rounded-xl bg-muted/50">
            <p className="text-sm text-muted-foreground mb-1">Minimum</p>
            <p className="text-2xl font-semibold">{formatCurrency(proposal.pricing.minPrice)}</p>
          </div>
          <div className="text-center p-4 rounded-xl bg-muted ring-1 ring-foreground/20">
            <p className="text-sm text-muted-foreground mb-1">Recommended</p>
            <p className="text-3xl font-semibold">
              {formatCurrency(proposal.pricing.recommendedPrice)}
            </p>
          </div>
          <div className="text-center p-4 rounded-xl bg-muted/50">
            <p className="text-sm text-muted-foreground mb-1">Premium</p>
            <p className="text-2xl font-semibold">{formatCurrency(proposal.pricing.premiumPrice)}</p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3 text-center">
          <div>
            <p className="text-sm text-muted-foreground">Estimated Hours</p>
            <p className="text-lg font-semibold">{proposal.pricing.estimatedHours} hours</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Timeline</p>
            <p className="text-lg font-semibold">{proposal.pricing.timelineWeeks} weeks</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Complexity</p>
            <p className="text-lg font-semibold">{proposal.pricing.complexityLevel}</p>
          </div>
        </div>
      </div>

      {/* Scope of Work */}
      <div className="proposal-section">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Scope of Work</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              copyToClipboard(proposal.scopeOfWork.join('\n'), 'scope')
            }
          >
            {copiedSection === 'scope' ? (
              <Check className="h-4 w-4" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
        </div>
        <ul className="space-y-2">
          {proposal.scopeOfWork.map((item, index) => (
            <li key={index} className="flex items-start gap-2">
              <span className="text-muted-foreground mt-1">•</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Deliverables */}
      <div className="proposal-section">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Deliverables</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              copyToClipboard(proposal.deliverables.join('\n'), 'deliverables')
            }
          >
            {copiedSection === 'deliverables' ? (
              <Check className="h-4 w-4" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
        </div>
        <ul className="space-y-2">
          {proposal.deliverables.map((item, index) => (
            <li key={index} className="flex items-start gap-2">
              <span className="text-muted-foreground mt-1">✓</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Payment Structure */}
      <div className="proposal-section">
        <h3 className="text-lg font-semibold mb-4">Payment Structure</h3>
        <div className="space-y-3">
          {proposal.paymentStructure.map((payment, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 rounded-lg bg-background"
            >
              <div>
                <p className="font-medium">{payment.label}</p>
                <p className="text-sm text-muted-foreground">{payment.percentage}%</p>
              </div>
              <p className="text-lg font-semibold">{formatCurrency(payment.amount)}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
