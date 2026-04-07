'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { toast } from 'sonner';

type Coupon = {
  id: string;
  code: string;
  description?: string;
  discountType: 'percentage' | 'fixed';
  value: number;
  minSpend?: number;
  usageLimit?: number;
  usedCount: number;
  expiresAt?: string;
  active: boolean;
  createdAt: string;
};

type ApiSuccess<T> = { success: true; data: T; meta?: Record<string, unknown> };
type ApiError = { success: false; error: string };

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const [formValues, setFormValues] = useState({
    code: '',
    description: '',
    discountType: 'percentage' as 'percentage' | 'fixed',
    value: '',
    minSpend: '',
    usageLimit: '',
    expiresAt: '',
    active: true,
  });

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const res = await fetch('/api/coupons');
        const json = (await res.json()) as ApiSuccess<Coupon[]> | ApiError;
        if (!json.success) throw new Error(json.error);
        setCoupons(json.data);
      } catch (e: unknown) {
        toast.error(e instanceof Error ? e.message : 'Failed to load coupons');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      const res = await fetch('/api/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formValues,
          value: Number(formValues.value),
          minSpend: formValues.minSpend ? Number(formValues.minSpend) : undefined,
          usageLimit: formValues.usageLimit ? Number(formValues.usageLimit) : undefined,
          expiresAt: formValues.expiresAt || undefined,
        }),
      });
      const json = (await res.json()) as ApiSuccess<Coupon> | ApiError;
      if (!json.success) throw new Error(json.error);
      setCoupons((prev) => [json.data, ...prev]);
      setDialogOpen(false);
      setFormValues({
        code: '',
        description: '',
        discountType: 'percentage',
        value: '',
        minSpend: '',
        usageLimit: '',
        expiresAt: '',
        active: true,
      });
      toast.success('Coupon created successfully!');
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Failed to create coupon');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-stone-900">Coupons & Discounts</h1>
          <p className="text-sm text-stone-500 mt-1">Manage promotional codes for your store.</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm">+ Create Coupon</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>New Coupon</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-stone-700">Code</label>
                <Input
                  value={formValues.code}
                  onChange={(e) => setFormValues(v => ({ ...v, code: e.target.value.toUpperCase() }))}
                  placeholder="e.g. SUMMER25"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-stone-700">Type</label>
                  <select
                    className="h-9 w-full rounded-md border border-stone-200 bg-white px-3 text-sm"
                    value={formValues.discountType}
                    onChange={(e) => setFormValues(v => ({ ...v, discountType: e.target.value as any }))}
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-stone-700">Value</label>
                  <Input
                    type="number"
                    value={formValues.value}
                    onChange={(e) => setFormValues(v => ({ ...v, value: e.target.value }))}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-stone-700">Min. Spend</label>
                  <Input
                    type="number"
                    value={formValues.minSpend}
                    onChange={(e) => setFormValues(v => ({ ...v, minSpend: e.target.value }))}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-stone-700">Usage Limit</label>
                  <Input
                    type="number"
                    value={formValues.usageLimit}
                    onChange={(e) => setFormValues(v => ({ ...v, usageLimit: e.target.value }))}
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-stone-700">Expires At</label>
                <Input
                  type="date"
                  value={formValues.expiresAt}
                  onChange={(e) => setFormValues(v => ({ ...v, expiresAt: e.target.value }))}
                />
              </div>
              <Button type="submit" className="w-full" disabled={saving}>
                {saving ? 'Creating...' : 'Create Coupon'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="admin-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Value</TableHead>
              <TableHead>Usage</TableHead>
              <TableHead>Expires</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading && <TableRow><TableCell colSpan={6}>Loading coupons...</TableCell></TableRow>}
            {!loading && coupons.map((c) => (
              <TableRow key={c.id}>
                <TableCell className="font-bold text-stone-900">{c.code}</TableCell>
                <TableCell className="capitalize">{c.discountType}</TableCell>
                <TableCell>{c.discountType === 'percentage' ? `${c.value}%` : `$${c.value}`}</TableCell>
                <TableCell>{c.usedCount} / {c.usageLimit || '∞'}</TableCell>
                <TableCell>{c.expiresAt ? new Date(c.expiresAt).toLocaleDateString() : 'Never'}</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${c.active ? 'bg-green-100 text-green-700' : 'bg-stone-100 text-stone-500'}`}>
                    {c.active ? 'Active' : 'Inactive'}
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
