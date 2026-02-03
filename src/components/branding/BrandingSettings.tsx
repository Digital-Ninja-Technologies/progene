import { useState } from "react";
import { Save, Palette, Building, Globe, Mail, Phone, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useBranding } from "@/hooks/useBranding";
import { toast } from "sonner";

export function BrandingSettings() {
  const { branding, loading, saveBranding } = useBranding();
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    company_name: branding?.company_name || "",
    tagline: branding?.tagline || "",
    primary_color: branding?.primary_color || "#6366f1",
    secondary_color: branding?.secondary_color || "#8b5cf6",
    website: branding?.website || "",
    email: branding?.email || "",
    phone: branding?.phone || "",
    address: branding?.address || "",
  });

  // Update form when branding loads
  useState(() => {
    if (branding) {
      setFormData({
        company_name: branding.company_name || "",
        tagline: branding.tagline || "",
        primary_color: branding.primary_color || "#6366f1",
        secondary_color: branding.secondary_color || "#8b5cf6",
        website: branding.website || "",
        email: branding.email || "",
        phone: branding.phone || "",
        address: branding.address || "",
      });
    }
  });

  const handleSave = async () => {
    setSaving(true);
    const { error } = await saveBranding({
      company_name: formData.company_name || null,
      tagline: formData.tagline || null,
      primary_color: formData.primary_color,
      secondary_color: formData.secondary_color,
      website: formData.website || null,
      email: formData.email || null,
      phone: formData.phone || null,
      address: formData.address || null,
    });
    setSaving(false);

    if (error) {
      toast.error("Failed to save branding settings");
    } else {
      toast.success("Branding settings saved!");
    }
  };

  if (loading) {
    return <div className="text-center py-8 text-muted-foreground">Loading branding settings...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Branding & Company Details</h3>
          <p className="text-sm text-muted-foreground">
            Customize how your proposals appear to clients
          </p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          <Save className="mr-2 h-4 w-4" />
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Company Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Building className="h-4 w-4" />
              Company Information
            </CardTitle>
            <CardDescription>Your business details shown on proposals</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="company_name">Company Name</Label>
              <Input
                id="company_name"
                value={formData.company_name}
                onChange={(e) => setFormData(prev => ({ ...prev, company_name: e.target.value }))}
                placeholder="Your Company Name"
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="tagline">Tagline</Label>
              <Input
                id="tagline"
                value={formData.tagline}
                onChange={(e) => setFormData(prev => ({ ...prev, tagline: e.target.value }))}
                placeholder="Your company tagline"
                className="mt-1.5"
              />
            </div>
          </CardContent>
        </Card>

        {/* Brand Colors */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Palette className="h-4 w-4" />
              Brand Colors
            </CardTitle>
            <CardDescription>Colors used in your proposal exports</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="primary_color">Primary Color</Label>
              <div className="flex gap-2 mt-1.5">
                <Input
                  type="color"
                  id="primary_color"
                  value={formData.primary_color}
                  onChange={(e) => setFormData(prev => ({ ...prev, primary_color: e.target.value }))}
                  className="w-16 h-10 p-1 cursor-pointer"
                />
                <Input
                  value={formData.primary_color}
                  onChange={(e) => setFormData(prev => ({ ...prev, primary_color: e.target.value }))}
                  placeholder="#6366f1"
                  className="flex-1"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="secondary_color">Secondary Color</Label>
              <div className="flex gap-2 mt-1.5">
                <Input
                  type="color"
                  id="secondary_color"
                  value={formData.secondary_color}
                  onChange={(e) => setFormData(prev => ({ ...prev, secondary_color: e.target.value }))}
                  className="w-16 h-10 p-1 cursor-pointer"
                />
                <Input
                  value={formData.secondary_color}
                  onChange={(e) => setFormData(prev => ({ ...prev, secondary_color: e.target.value }))}
                  placeholder="#8b5cf6"
                  className="flex-1"
                />
              </div>
            </div>
            {/* Color Preview */}
            <div className="flex gap-2 pt-2">
              <div 
                className="w-12 h-12 rounded-lg shadow-inner" 
                style={{ backgroundColor: formData.primary_color }}
              />
              <div 
                className="w-12 h-12 rounded-lg shadow-inner" 
                style={{ backgroundColor: formData.secondary_color }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Contact Info */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Mail className="h-4 w-4" />
              Contact Information
            </CardTitle>
            <CardDescription>Your contact details for proposals</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="website">
                  <Globe className="inline-block h-3.5 w-3.5 mr-1" />
                  Website
                </Label>
                <Input
                  id="website"
                  value={formData.website}
                  onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                  placeholder="https://yoursite.com"
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="email">
                  <Mail className="inline-block h-3.5 w-3.5 mr-1" />
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="hello@yoursite.com"
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="phone">
                  <Phone className="inline-block h-3.5 w-3.5 mr-1" />
                  Phone
                </Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="+1 234 567 8900"
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="address">
                  <MapPin className="inline-block h-3.5 w-3.5 mr-1" />
                  Address
                </Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="123 Main St, City, Country"
                  className="mt-1.5"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
