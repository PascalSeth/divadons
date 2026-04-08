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
import { 
  Shapes, 
  Store, 
  MapPin, 
  Settings2, 
  Save, 
  Globe, 
  CreditCard, 
  Share2,
  CheckCircle2,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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
  socialLinks?: { platform: string; url: string }[];
  brandValues?: { title: string; description: string }[];
  metaTitle?: string;
  metaDescription?: string;
  stripePublishableKey?: string;
  stripeSecretKey?: string;
  stripeWebhookSecret?: string;
};

type TabId = 'identity' | 'storefront' | 'contact' | 'technical';

export default function SettingsPage() {
  const [settings, setSettings] = useState<Setting | null>(null);
  const [loading, setLoading] = useState(true);
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>('identity');
  const [selectedLogo, setSelectedLogo] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [selectedFavicon, setSelectedFavicon] = useState<File | null>(null);
  const [faviconPreview, setFaviconPreview] = useState<string | null>(null);

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
        stripePublishableKey: settings.stripePublishableKey?.trim(),
        stripeSecretKey: settings.stripeSecretKey?.trim(),
        stripeWebhookSecret: settings.stripeWebhookSecret?.trim(),
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
    <div className="pb-20">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-stone-900 tracking-tight">
            Store Settings
          </h1>
          <p className="text-stone-500 mt-2 max-w-lg">
            Manage your boutique&apos;s digital presence, from brand identity to payment configurations.
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-stone-100 rounded-lg border border-stone-200 text-[11px] font-medium text-stone-600 uppercase tracking-wider">
          <Info className="w-3.5 h-3.5" />
          Boutique Owner View
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-1 p-1 bg-stone-100/50 rounded-xl border border-stone-200 mb-8 w-fit">
        {[
          { id: 'identity', label: 'Identity', icon: Shapes },
          { id: 'storefront', label: 'Storefront', icon: Store },
          { id: 'contact', label: 'Contact', icon: MapPin },
          { id: 'technical', label: 'Technical', icon: Settings2 },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as TabId)}
            className={`
              flex items-center gap-2.5 px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
              ${activeTab === tab.id 
                ? 'bg-white text-stone-900 shadow-sm border border-stone-200' 
                : 'text-stone-500 hover:text-stone-700 hover:bg-stone-200/50'}
            `}
          >
            <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? 'text-amber-600' : ''}`} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Settings Form */}
      <form onSubmit={handleSettingsSave} className="space-y-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'identity' && (
              <div className="space-y-8">
                <div className="admin-card overflow-hidden">
                  <div className="p-8">
                    <SectionHeader 
                      icon={Shapes} 
                      title="Brand Identity" 
                      description="Your boutique&apos;s name and logo are the first thing customers see. Choose high-quality assets to build trust."
                    />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-stone-700 uppercase tracking-wider">Site Name</label>
                        <Input
                          value={settings?.siteName || ''}
                          onChange={(e) => setSettings(s => s ? { ...s, siteName: e.target.value } : null)}
                          placeholder="e.g. My Boutique"
                          className="h-11 bg-stone-50/50 border-stone-200 focus:bg-white transition-colors"
                        />
                        <p className="text-[11px] text-stone-400">This appears in browser tabs and emails sent to customers.</p>
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-stone-700 uppercase tracking-wider">Storefront Currency</label>
                        <select
                          className="h-11 w-full rounded-md border border-stone-200 bg-stone-50/50 px-3 text-sm focus:bg-white focus:outline-none focus:ring-1 focus:ring-stone-400 transition-colors"
                          value={settings?.currency || DEFAULT_CURRENCY}
                          onChange={(e) => setSettings(s => s ? { ...s, currency: e.target.value as Currency } : null)}
                        >
                          <option value="USD">USD ($) - United States Dollar</option>
                          <option value="EUR">EUR (€) - Euro</option>
                          <option value="GBP">GBP (£) - British Pound</option>
                          <option value="NGN">NGN (₦) - Nigerian Naira</option>
                        </select>
                        <p className="text-[11px] text-stone-400">The primary currency used for pricing and settlements.</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mt-12 pb-4">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-semibold text-stone-700 uppercase tracking-wider">Main Logo</label>
                          <label className="text-[11px] font-medium text-amber-600 hover:text-amber-700 cursor-pointer underline underline-offset-4 transition-colors">
                            Change File
                            <input type="file" className="hidden" accept="image/*" onChange={onLogoChange} />
                          </label>
                        </div>
                        <div className="aspect-[3/1] bg-stone-50 rounded-2xl border-2 border-dashed border-stone-200 flex items-center justify-center overflow-hidden transition-all hover:border-stone-300">
                          {logoPreview || settings?.logoUrl ? (
                            <img
                              src={logoPreview || settings?.logoUrl}
                              alt="Logo Preview"
                              className="max-w-[80%] max-h-[80%] object-contain drop-shadow-sm"
                            />
                          ) : (
                            <div className="text-center">
                              <Shapes className="w-8 h-8 text-stone-300 mx-auto mb-2" />
                              <p className="text-[10px] text-stone-400 uppercase tracking-widest">Upload Logo</p>
                            </div>
                          )}
                        </div>
                        <p className="text-[11px] text-stone-400 text-center italic">Transparent PNG recommended (approx 200x80px).</p>
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-semibold text-stone-700 uppercase tracking-wider">Browser Favicon</label>
                          <label className="text-[11px] font-medium text-amber-600 hover:text-amber-700 cursor-pointer underline underline-offset-4 transition-colors">
                            Update
                            <input type="file" className="hidden" accept="image/x-icon,image/png,image/jpeg" onChange={onFaviconChange} />
                          </label>
                        </div>
                        <div className="aspect-square w-32 mx-auto bg-stone-50 rounded-2xl border-2 border-dashed border-stone-200 flex items-center justify-center overflow-hidden transition-all hover:border-stone-300">
                          {faviconPreview || settings?.faviconUrl ? (
                            <img
                              src={faviconPreview || settings?.faviconUrl}
                              alt="Favicon Preview"
                              className="w-12 h-12 object-contain shadow-sm"
                            />
                          ) : (
                            <div className="text-center">
                              <Globe className="w-6 h-6 text-stone-300 mx-auto mb-1" />
                              <p className="text-[9px] text-stone-400 uppercase tracking-widest">Favicon</p>
                            </div>
                          )}
                        </div>
                        <p className="text-[11px] text-stone-400 text-center italic">Small icon shown in browser tabs.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'storefront' && (
              <div className="space-y-8">
                <div className="admin-card p-8">
                  <div className="flex items-center justify-between mb-8">
                    <SectionHeader 
                      icon={CheckCircle2} 
                      title="Our Brand Values" 
                      description="These are the core pillars of your boutique. They appear as a dedicated section on your homepage."
                    />
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm" 
                      className="rounded-lg shadow-sm"
                      onClick={() => setSettings(s => s ? { ...s, brandValues: [...(s.brandValues || []), { title: '', description: '' }] } : null)}
                    >
                      + Add New Value
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {!settings?.brandValues || settings.brandValues.length === 0 ? (
                      <div className="lg:col-span-2 py-12 text-center bg-stone-50 rounded-2xl border border-dashed border-stone-200">
                        <CheckCircle2 className="w-8 h-8 text-stone-300 mx-auto mb-3" />
                        <p className="text-sm text-stone-500">No brand values added yet.</p>
                      </div>
                    ) : (
                      settings.brandValues.map((value, idx) => (
                        <div key={idx} className="group relative transition-all duration-300">
                          <div className="p-6 bg-white border border-stone-200 rounded-2xl shadow-sm hover:border-amber-200 hover:shadow-md transition-all">
                            <button
                              type="button"
                              className="absolute top-4 right-4 text-stone-300 hover:text-red-500 transition-colors"
                              onClick={() => {
                                const next = (settings.brandValues || []).filter((_, i) => i !== idx);
                                setSettings(s => s ? { ...s, brandValues: next } : null);
                              }}
                            >
                              <Save className="hidden" /> {/* just to ensure no layout shift */}
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                            <div className="space-y-4">
                              <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Value Title</label>
                                <Input
                                  placeholder="e.g. Sustainable"
                                  value={value.title}
                                  onChange={(e) => {
                                    const next = [...(settings.brandValues || [])];
                                    next[idx] = { ...next[idx], title: e.target.value };
                                    setSettings(s => s ? { ...s, brandValues: next } : null);
                                  }}
                                  className="h-9 text-sm border-stone-100 bg-stone-50/30 focus:bg-white"
                                />
                              </div>
                              <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Full Description</label>
                                <textarea
                                  className="w-full h-24 rounded-xl border border-stone-100 bg-stone-50/30 px-4 py-3 text-sm focus:bg-white focus:outline-none focus:ring-1 focus:ring-stone-400 transition-all"
                                  placeholder="Explain why this value matters to your customers..."
                                  value={value.description}
                                  onChange={(e) => {
                                    const next = [...(settings.brandValues || [])];
                                    next[idx] = { ...next[idx], description: e.target.value };
                                    setSettings(s => s ? { ...s, brandValues: next } : null);
                                  }}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="admin-card p-8">
                  <div className="flex items-center justify-between mb-8">
                    <SectionHeader 
                      icon={Share2} 
                      title="Social Media Presence" 
                      description="Connect your boutique with your community. These links appear in your storefront footer."
                    />
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm" 
                      className="rounded-lg shadow-sm"
                      onClick={() => setSettings(s => s ? { ...s, socialLinks: [...(s.socialLinks || []), { platform: '', url: '' }] } : null)}
                    >
                      + Add Link
                    </Button>
                  </div>
                  
                  <div className="space-y-4">
                    {!settings?.socialLinks || settings.socialLinks.length === 0 ? (
                      <div className="py-12 text-center bg-stone-50 rounded-2xl border border-dashed border-stone-200">
                        <Share2 className="w-8 h-8 text-stone-300 mx-auto mb-3" />
                        <p className="text-sm text-stone-500">Add your Instagram, Facebook, or TikTok here.</p>
                      </div>
                    ) : (
                      settings.socialLinks.map((link, idx) => (
                        <div key={idx} className="flex items-center gap-4 p-4 bg-white border border-stone-200 rounded-xl shadow-sm group">
                          <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <select
                              className="h-10 w-full rounded-lg border border-stone-100 bg-stone-50/50 px-3 text-sm focus:bg-white focus:outline-none focus:ring-1 focus:ring-stone-300"
                              value={link.platform}
                              onChange={(e) => {
                                const next = [...(settings?.socialLinks || [])];
                                next[idx] = { ...next[idx], platform: e.target.value };
                                setSettings(s => s ? { ...s, socialLinks: next } : null);
                              }}
                            >
                              <option value="" disabled>Select Platform</option>
                              <option value="Instagram">Instagram</option>
                              <option value="Facebook">Facebook</option>
                              <option value="Twitter">Twitter / X</option>
                              <option value="Pinterest">Pinterest</option>
                              <option value="YouTube">YouTube</option>
                              <option value="TikTok">TikTok</option>
                              <option value="Other">Other</option>
                            </select>
                            <div className="sm:col-span-2">
                              <Input
                                placeholder="Paste your full profile link here (e.g. https://instagram.com/yourbrand)"
                                value={link.url}
                                onChange={(e) => {
                                  const next = [...(settings.socialLinks || [])];
                                  next[idx] = { ...next[idx], url: e.target.value };
                                  setSettings(s => s ? { ...s, socialLinks: next } : null);
                                }}
                                className="h-10 border-stone-100 bg-stone-50/50 focus:bg-white"
                              />
                            </div>
                          </div>
                          <button
                            type="button"
                            className="w-10 h-10 flex items-center justify-center rounded-lg text-stone-300 hover:text-red-500 hover:bg-red-50 transition-all"
                            onClick={() => {
                              const next = (settings.socialLinks || []).filter((_, i) => i !== idx);
                              setSettings(s => s ? { ...s, socialLinks: next } : null);
                            }}
                          >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'contact' && (
              <div className="space-y-8">
                <div className="admin-card p-8">
                  <SectionHeader 
                    icon={MapPin} 
                    title="Store & Contact Info" 
                    description="Professional contact details for your boutique. These help customers reach you for support or visits."
                  />
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-10">
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-stone-700 uppercase tracking-wider">Business Support Email</label>
                        <Input
                          type="email"
                          value={settings?.supportEmail || ''}
                          onChange={(e) => setSettings(s => s ? { ...s, supportEmail: e.target.value } : null)}
                          placeholder="hello@yourboutique.com"
                          className="h-11 bg-stone-50/50 border-stone-200"
                        />
                        <p className="text-[11px] text-stone-400">Where customer inquiries will be sent.</p>
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-stone-700 uppercase tracking-wider">Support Phone Number</label>
                        <Input
                          value={settings?.supportPhone || ''}
                          onChange={(e) => setSettings(s => s ? { ...s, supportPhone: e.target.value } : null)}
                          placeholder="+1 (555) 000-0000"
                          className="h-11 bg-stone-50/50 border-stone-200"
                        />
                        <p className="text-[11px] text-stone-400">Optional: For direct customer phone support.</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-stone-700 uppercase tracking-wider">Store Location / Address</label>
                      <textarea
                        className="w-full h-[126px] rounded-xl border border-stone-200 bg-stone-50/50 px-4 py-3 text-sm focus:bg-white focus:outline-none focus:ring-1 focus:ring-stone-400 transition-all"
                        placeholder="e.g. 101 Fashion Blvd, Suite 400&#10;Metropolis, NY 10001"
                        value={settings?.storeAddress || ''}
                        onChange={(e) => setSettings(s => s ? { ...s, storeAddress: e.target.value } : null)}
                      />
                      <p className="text-[11px] text-stone-400">Your physical store or office headquarters.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'technical' && (
              <div className="space-y-8">
                <div className="admin-card p-8">
                  <SectionHeader 
                    icon={Globe} 
                    title="Search Engine Optimization (SEO)" 
                    description="Control how your boutique appear in Google searches and when shared on social media."
                  />
                  
                  <div className="grid grid-cols-1 gap-8 mt-10">
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-stone-700 uppercase tracking-wider">Default Meta Title</label>
                      <Input
                        value={settings?.metaTitle || ''}
                        onChange={(e) => setSettings(s => s ? { ...s, metaTitle: e.target.value } : null)}
                        placeholder="e.g. Diva Dons | Premium Boutique Experience"
                        className="h-11 bg-stone-50/50 border-stone-100"
                      />
                      <p className="text-[11px] text-stone-400">The title tag used for your homepage (approx 50-60 characters).</p>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-stone-700 uppercase tracking-wider">Default Meta Description</label>
                      <textarea
                        className="w-full h-24 rounded-xl border border-stone-200 bg-stone-50/50 px-4 py-3 text-sm focus:bg-white transition-all"
                        placeholder="Summarize what makes your boutique special in 1-2 short sentences..."
                        value={settings?.metaDescription || ''}
                        onChange={(e) => setSettings(s => s ? { ...s, metaDescription: e.target.value } : null)}
                      />
                      <p className="text-[11px] text-stone-400">The snippet shown below your site name in search results (keep around 150-160 characters).</p>
                    </div>
                  </div>
                </div>

                <div className="admin-card p-8">
                  <div className="flex items-center justify-between mb-8">
                    <SectionHeader 
                      icon={CreditCard} 
                      title="Payment & Stripe Configuration" 
                    description="Safely manage your live payment keys. Never share these with anyone else."
                    />
                    <div className="flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-700 border border-green-200 rounded-full text-[10px] font-bold uppercase tracking-wider">
                      <Save className="w-3 h-3" /> Secure Connection
                    </div>
                  </div>
                  
                  <div className="space-y-8 mt-10">
                    <div className="p-5 bg-amber-50 border border-amber-200 rounded-2xl flex gap-4">
                      <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-semibold text-amber-900">Developer Action Required</p>
                        <p className="text-[11px] text-amber-800 mt-1 leading-relaxed">
                          These keys connect your store to Stripe. Ensure you are using the correct Publishable and Secret keys for the current environment.
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-stone-700 uppercase tracking-wider">Stripe Publishable Key</label>
                      <Input
                        value={settings?.stripePublishableKey || ''}
                        onChange={(e) => setSettings(s => s ? { ...s, stripePublishableKey: e.target.value } : null)}
                        placeholder="pk_test_..."
                        className="h-11 bg-stone-50/50 font-mono text-xs border-stone-100"
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-stone-700 uppercase tracking-wider">Stripe Secret Key</label>
                        <Input
                          type="password"
                          value={settings?.stripeSecretKey || ''}
                          onChange={(e) => setSettings(s => s ? { ...s, stripeSecretKey: e.target.value } : null)}
                          placeholder="sk_test_..."
                          className="h-11 bg-stone-50/50 font-mono text-xs border-stone-100"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-stone-700 uppercase tracking-wider">Stripe Webhook Secret</label>
                        <Input
                          type="password"
                          value={settings?.stripeWebhookSecret || ''}
                          onChange={(e) => setSettings(s => s ? { ...s, stripeWebhookSecret: e.target.value } : null)}
                          placeholder="whsec_..."
                          className="h-11 bg-stone-50/50 font-mono text-xs border-stone-100"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Global Action Bar (Sticky Footer) */}
        <div className="fixed bottom-0 left-0 lg:left-55 right-0 z-40 p-4 bg-white/80 backdrop-blur-md border-t border-stone-200 shadow-lg">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            <div className="hidden sm:flex items-center gap-2 text-[10px] font-bold text-stone-400 uppercase tracking-widest">
              <span className="w-1.5 h-1.5 rounded-full bg-stone-300" />
              Auto-saved locally
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <Button 
                type="button" 
                variant="ghost" 
                size="sm" 
                className="text-stone-500 rounded-lg hover:bg-stone-100 px-6 font-medium text-xs transition-all"
                onClick={() => window.location.reload()}
              >
                Discard Changes
              </Button>
              <Button 
                type="submit" 
                disabled={settingsSaving} 
                className="bg-stone-900 border-stone-800 text-white hover:bg-stone-800 px-8 py-5 rounded-xl shadow-xl shadow-stone-900/10 flex items-center gap-2 active:scale-95 transition-all text-sm font-semibold"
              >
                {settingsSaving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Update Settings
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

// Internal Helper Component
function SectionHeader({ icon: Icon, title, description }: { icon: any, title: string, description: string }) {
  return (
    <div className="flex items-start gap-4">
      <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shrink-0 shadow-sm">
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <h2 className="text-xl font-bold text-stone-900 leading-tight">{title}</h2>
        <p className="text-sm text-stone-500 mt-1 max-w-xl leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

