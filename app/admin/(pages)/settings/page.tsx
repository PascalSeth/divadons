'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Currency, DEFAULT_CURRENCY } from '@/lib/currency';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

type UserRole = 'admin' | 'editor' | 'viewer';

type AdminUser = {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string | null;
  createdAt: string;
};

type ApiSuccess<T> = { success: true; data: T; meta?: Record<string, unknown> };
type ApiError = { success: false; error: string };

type Setting = {
  id: string;
  currency: Currency;
  siteName?: string;
  logoUrl?: string;
  faviconUrl?: string;
  supportEmail?: string;
  supportPhone?: string;
  storeAddress?: string;
  socialLinks?: any;
  metaTitle?: string;
  metaDescription?: string;
  stripePublishableKey?: string;
  stripeSecretKey?: string;
  stripeWebhookSecret?: string;
};

export default function SettingsPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [settings, setSettings] = useState<Setting | null>(null);
  const [loading, setLoading] = useState(true);
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [selectedLogo, setSelectedLogo] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [selectedFavicon, setSelectedFavicon] = useState<File | null>(null);
  const [faviconPreview, setFaviconPreview] = useState<string | null>(null);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formValues, setFormValues] = useState({
    name: '',
    email: '',
    password: '',
    role: 'admin' as UserRole,
  });

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        
        // Load settings
        const settingsRes = await fetch('/api/settings');
        const settingsJson = (await settingsRes.json()) as ApiSuccess<Setting> | ApiError;
        if (settingsJson.success) {
          setSettings(settingsJson.data);
        }
        
        // Load users
        const res = await fetch('/api/users?page=1&pageSize=50');
        const json = (await res.json()) as ApiSuccess<AdminUser[]> | ApiError;
        if (!json.success) throw new Error(json.error);
        setUsers(json.data);
      } catch (e: unknown) {
        const errorMessage = e instanceof Error ? e.message : 'Failed to load data';
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // Cleanup object URLs to avoid memory leaks
  useEffect(() => {
    return () => {
      if (logoPreview) URL.revokeObjectURL(logoPreview);
      if (faviconPreview) URL.revokeObjectURL(faviconPreview);
    };
  }, [logoPreview, faviconPreview]);

  const resetForm = () =>
    setFormValues({
      name: '',
      email: '',
      password: '',
      role: 'admin',
    });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      const payload = {
        name: formValues.name.trim(),
        email: formValues.email.trim(),
        password: formValues.password,
        role: formValues.role,
      };
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = (await res.json()) as ApiSuccess<AdminUser> | ApiError;
      if (!json.success) throw new Error(json.error);
      setUsers((prev) => [json.data, ...prev]);
      setDialogOpen(false);
      resetForm();
      toast.success('Admin user created successfully');
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : 'Failed to create admin user';
      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this admin user?')) return;
    try {
      const res = await fetch(`/api/users/${id}`, { method: 'DELETE' });
      const json = (await res.json()) as ApiSuccess<unknown> | ApiError;
      if (!json.success) throw new Error(json.error);
      setUsers((prev) => prev.filter((u) => u.id !== id));
      toast.success('Admin user removed');
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : 'Failed to delete admin user';
      toast.error(errorMessage);
    }
  };

  const handleSettingsSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    
    try {
      setSettingsSaving(true);

      let finalLogoUrl = settings.logoUrl;
      let finalFaviconUrl = settings.faviconUrl;

      // Upload Logo if changed
      if (selectedLogo) {
        const formData = new FormData();
        formData.append('file', selectedLogo);
        formData.append('product', 'site-branding');
        const res = await fetch('/api/upload', { method: 'POST', body: formData });
        const json = await res.json();
        if (json.success) finalLogoUrl = json.data.url;
      }

      // Upload Favicon if changed
      if (selectedFavicon) {
        const formData = new FormData();
        formData.append('file', selectedFavicon);
        formData.append('product', 'site-branding');
        const res = await fetch('/api/upload', { method: 'POST', body: formData });
        const json = await res.json();
        if (json.success) finalFaviconUrl = json.data.url;
      }

      const payload = {
        ...settings,
        logoUrl: finalLogoUrl,
        faviconUrl: finalFaviconUrl,
      };

      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = (await res.json()) as ApiSuccess<Setting> | ApiError;
      if (!json.success) throw new Error(json.error);
      
      setSettings(json.data);
      setSelectedLogo(null);
      setLogoPreview(null);
      setSelectedFavicon(null);
      setFaviconPreview(null);
      toast.success('Settings saved successfully');
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : 'Failed to save settings';
      toast.error(errorMessage);
    } finally {
      setSettingsSaving(false);
    }
  };

  const onLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedLogo(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const onFaviconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFavicon(file);
      setFaviconPreview(URL.createObjectURL(file));
    }
  };

  return (
    <div className="space-y-6">
      {/* Store Settings Form */}
      <form onSubmit={handleSettingsSave} className="space-y-6">
        <div className="admin-card">
          <div className="p-4 border-b border-stone-100">
            <h2 className="text-sm font-semibold text-stone-900">Branding & Identity</h2>
            <p className="text-xs text-stone-500 mt-1">Configure your store's name, logo, and core identity.</p>
          </div>
          <div className="p-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-stone-700">Site Name</label>
                <Input
                  value={settings?.siteName || ''}
                  onChange={(e) => setSettings(s => s ? { ...s, siteName: e.target.value } : null)}
                  placeholder="e.g. Diva & Dons"
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-stone-700">Currency</label>
                <select
                  className="h-9 w-full rounded-md border border-stone-200 bg-white px-3 text-sm"
                  value={settings?.currency || DEFAULT_CURRENCY}
                  onChange={(e) => setSettings(s => s ? { ...s, currency: e.target.value as Currency } : null)}
                >
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="NGN">NGN (₦)</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider">Logo Asset</label>
                <div className="flex items-start gap-4 p-4 bg-stone-50 rounded-lg border border-stone-200">
                  <div className="w-20 h-20 bg-white rounded border border-stone-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                    {logoPreview || settings?.logoUrl ? (
                      <img 
                        src={logoPreview || settings?.logoUrl} 
                        alt="Logo Preview" 
                        className="max-w-full max-h-full object-contain"
                      />
                    ) : (
                      <span className="text-[10px] text-stone-400">No Logo</span>
                    )}
                  </div>
                  <div className="flex-1 space-y-2">
                    <p className="text-[10px] text-stone-500">Recommended: Transparent PNG, approx 200x80px.</p>
                    <label className="inline-block px-3 py-1.5 bg-white border border-stone-300 rounded text-[11px] font-medium text-stone-700 cursor-pointer hover:bg-stone-50 transition-colors">
                      Choose Logo File
                      <input type="file" className="hidden" accept="image/*" onChange={onLogoChange} />
                    </label>
                    {selectedLogo && <p className="text-[10px] text-amber-600 font-medium">New file selected: {selectedLogo.name}</p>}
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider">Favicon Asset</label>
                <div className="flex items-start gap-4 p-4 bg-stone-50 rounded-lg border border-stone-200">
                  <div className="w-12 h-12 bg-white rounded border border-stone-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                    {faviconPreview || settings?.faviconUrl ? (
                      <img 
                        src={faviconPreview || settings?.faviconUrl} 
                        alt="Favicon Preview" 
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <span className="text-[8px] text-stone-400">None</span>
                    )}
                  </div>
                  <div className="flex-1 space-y-2">
                    <p className="text-[10px] text-stone-500">Recommended: .ico or .png, 32x32px.</p>
                    <label className="inline-block px-3 py-1.5 bg-white border border-stone-300 rounded text-[11px] font-medium text-stone-700 cursor-pointer hover:bg-stone-50 transition-colors">
                      Choose Favicon
                      <input type="file" className="hidden" accept="image/x-icon,image/png" onChange={onFaviconChange} />
                    </label>
                    {selectedFavicon && <p className="text-[10px] text-amber-600 font-medium">New file selected: {selectedFavicon.name}</p>}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="admin-card">
          <div className="p-4 border-b border-stone-100">
            <h2 className="text-sm font-semibold text-stone-900">Support & Contact</h2>
            <p className="text-xs text-stone-500 mt-1">Information for customer communication.</p>
          </div>
          <div className="p-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-stone-700">Support Email</label>
                <Input
                  type="email"
                  value={settings?.supportEmail || ''}
                  onChange={(e) => setSettings(s => s ? { ...s, supportEmail: e.target.value } : null)}
                  placeholder="support@example.com"
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-stone-700">Support Phone</label>
                <Input
                  value={settings?.supportPhone || ''}
                  onChange={(e) => setSettings(s => s ? { ...s, supportPhone: e.target.value } : null)}
                  placeholder="+1..."
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-stone-700">Store Address</label>
              <Input
                value={settings?.storeAddress || ''}
                onChange={(e) => setSettings(s => s ? { ...s, storeAddress: e.target.value } : null)}
                placeholder="physical store location..."
              />
            </div>
          </div>
        </div>

        <div className="admin-card">
          <div className="p-4 border-b border-stone-100">
            <h2 className="text-sm font-semibold text-stone-900">Global SEO</h2>
            <p className="text-xs text-stone-500 mt-1">Default metadata for search engines and social sharing.</p>
          </div>
          <div className="p-4 space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-stone-700">Meta Title (Brand)</label>
              <Input
                value={settings?.metaTitle || ''}
                onChange={(e) => setSettings(s => s ? { ...s, metaTitle: e.target.value } : null)}
                placeholder="Diva & Dons | Luxury Skin & Body Care"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-stone-700">Meta Description</label>
              <Input
                value={settings?.metaDescription || ''}
                onChange={(e) => setSettings(s => s ? { ...s, metaDescription: e.target.value } : null)}
                placeholder="Brief summary and keywords..."
              />
            </div>
          </div>
        </div>

        <div className="admin-card">
          <div className="p-4 border-b border-stone-100 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-stone-900">Payment Configuration</h2>
              <p className="text-xs text-stone-500 mt-1">Manage your Stripe payment credentials and webhooks.</p>
            </div>
            <div className="px-2 py-1 bg-stone-100 rounded text-[10px] font-medium text-stone-600 flex items-center gap-1.5 uppercase tracking-wider">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Encrypted
            </div>
          </div>
          <div className="p-4 space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-stone-700">Stripe Publishable Key</label>
              <Input
                value={settings?.stripePublishableKey || ''}
                onChange={(e) => setSettings(s => s ? { ...s, stripePublishableKey: e.target.value } : null)}
                placeholder="pk_test_..."
              />
              <p className="text-[10px] text-stone-500">Identifies your account with Stripe, shown in client-side code.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-stone-700">Stripe Secret Key</label>
                <Input
                  type="password"
                  value={settings?.stripeSecretKey || ''}
                  onChange={(e) => setSettings(s => s ? { ...s, stripeSecretKey: e.target.value } : null)}
                  placeholder="sk_test_..."
                />
                <p className="text-[10px] text-stone-500">Server-side secret. Never share this key.</p>
              </div>
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-stone-700">Stripe Webhook Secret</label>
                <Input
                  type="password"
                  value={settings?.stripeWebhookSecret || ''}
                  onChange={(e) => setSettings(s => s ? { ...s, stripeWebhookSecret: e.target.value } : null)}
                  placeholder="whsec_..."
                />
                <p className="text-[10px] text-stone-500">Used to verify that events come from Stripe.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <Button type="submit" disabled={settingsSaving}>
            {settingsSaving ? 'Saving...' : 'Save All Settings'}
          </Button>
        </div>
      </form>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-stone-900">
            Settings &amp; Admin Users
          </h1>
          <p className="text-sm text-stone-500 mt-1">
            Manage dashboard access and roles.
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" onClick={resetForm}>
              + Add Admin
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>New Admin User</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-stone-700">
                  Name
                </label>
                <Input
                  value={formValues.name}
                  onChange={(e) =>
                    setFormValues((v) => ({ ...v, name: e.target.value }))
                  }
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-stone-700">
                  Email
                </label>
                <Input
                  type="email"
                  value={formValues.email}
                  onChange={(e) =>
                    setFormValues((v) => ({ ...v, email: e.target.value }))
                  }
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-stone-700">
                  Password
                </label>
                <Input
                  type="password"
                  value={formValues.password}
                  onChange={(e) =>
                    setFormValues((v) => ({ ...v, password: e.target.value }))
                  }
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-stone-700">
                  Role
                </label>
                <select
                  className="h-9 w-full rounded-md border border-stone-200 bg-white px-3 text-sm"
                  value={formValues.role}
                  onChange={(e) =>
                    setFormValues((v) => ({
                      ...v,
                      role: e.target.value as UserRole,
                    }))
                  }
                >
                  <option value="admin">Admin</option>
                  <option value="editor">Editor</option>
                  <option value="viewer">Viewer</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setDialogOpen(false)}
                  disabled={saving}
                >
                  Cancel
                </Button>
                <Button type="submit" size="sm" disabled={saving}>
                  {saving ? 'Saving...' : 'Create'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="admin-card">
        <div className="p-4 border-b border-stone-100 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-stone-900">Admin Users</h2>
          <span className="text-xs text-stone-500">{users.length} total</span>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Created</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading && (
              <TableRow>
                <TableCell colSpan={5} className="text-sm text-stone-500">
                  Loading admin users...
                </TableCell>
              </TableRow>
            )}
            {!loading &&
              users.map((u) => (
                <TableRow key={u.id}>
                  <TableCell className="font-medium text-stone-900">
                    {u.name}
                  </TableCell>
                  <TableCell className="text-xs text-stone-700">
                    {u.email}
                  </TableCell>
                  <TableCell className="text-xs capitalize">{u.role}</TableCell>
                  <TableCell className="text-xs text-stone-500">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="flex justify-end">
                    <Button
                      variant="destructive"
                      size="xs"
                      onClick={() => handleDelete(u.id)}
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

