'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
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

type ContentType = 'hero_slide' | 'testimonial' | 'brand_value' | 'shipping_info';

type ContentBlock = {
  id: string;
  type: ContentType;
  sortOrder: number;
  active: boolean;
  data: Record<string, unknown>;
};

type ApiSuccess<T> = { success: true; data: T; meta?: Record<string, unknown> };
type ApiError = { success: false; error: string };

export default function ContentPage() {
  const [blocks, setBlocks] = useState<ContentBlock[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formValues, setFormValues] = useState({
    type: 'hero_slide' as ContentType,
    sortOrder: '0',
    active: true,
    dataJson: '{\n  \n}',
  });

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch('/api/content?page=1&pageSize=100');
        const json = (await res.json()) as ApiSuccess<ContentBlock[]> | ApiError;
        if (!json.success) throw new Error(json.error);
        setBlocks(json.data);
      } catch (e: unknown) {
        const errorMessage = e instanceof Error ? e.message : 'Failed to load content blocks';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const resetForm = () =>
    setFormValues({
      type: 'hero_slide',
      sortOrder: '0',
      active: true,
      dataJson: '{\n  \n}',
    });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError(null);

      let data: Record<string, unknown>;
      try {
        data = JSON.parse(formValues.dataJson) as Record<string, unknown>;
      } catch {
        throw new Error('Data must be valid JSON');
      }

      const payload = {
        type: formValues.type,
        sortOrder: Number(formValues.sortOrder || '0'),
        active: formValues.active,
        data,
      };

      const res = await fetch('/api/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = (await res.json()) as ApiSuccess<ContentBlock> | ApiError;
      if (!json.success) throw new Error(json.error);

      setBlocks((prev) => [...prev, json.data].sort((a, b) => a.sortOrder - b.sortOrder));
      setDialogOpen(false);
      resetForm();
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : 'Failed to save content block';
      setError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (block: ContentBlock) => {
    try {
      setError(null);
      const res = await fetch(`/api/content/${block.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !block.active }),
      });
      const json = (await res.json()) as ApiSuccess<ContentBlock> | ApiError;
      if (!json.success) throw new Error(json.error);
      setBlocks((prev) => prev.map((b) => (b.id === block.id ? json.data : b)));
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : 'Failed to update content block';
      setError(errorMessage);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this content block?')) return;
    try {
      setError(null);
      const res = await fetch(`/api/content/${id}`, { method: 'DELETE' });
      const json = (await res.json()) as ApiSuccess<unknown> | ApiError;
      if (!json.success) throw new Error(json.error);
      setBlocks((prev) => prev.filter((b) => b.id !== id));
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : 'Failed to delete content block';
      setError(errorMessage);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-stone-900">
            Homepage Content
          </h1>
          <p className="text-sm text-stone-500 mt-1">
            Manage hero slides, testimonials, and brand content.
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" onClick={resetForm}>
              + Add Block
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add Content Block</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-stone-700">
                  Type
                </label>
                <select
                  className="h-9 w-full rounded-md border border-stone-200 bg-white px-3 text-sm"
                  value={formValues.type}
                  onChange={(e) =>
                    setFormValues((v) => ({
                      ...v,
                      type: e.target.value as ContentType,
                    }))
                  }
                >
                  <option value="hero_slide">Hero slide</option>
                  <option value="testimonial">Testimonial</option>
                  <option value="brand_value">Brand value</option>
                  <option value="shipping_info">Shipping info</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-stone-700">
                  Sort order
                </label>
                <Input
                  type="number"
                  value={formValues.sortOrder}
                  onChange={(e) =>
                    setFormValues((v) => ({
                      ...v,
                      sortOrder: e.target.value,
                    }))
                  }
                />
              </div>
              <label className="flex items-center gap-2 text-xs font-medium text-stone-700">
                <input
                  type="checkbox"
                  checked={formValues.active}
                  onChange={(e) =>
                    setFormValues((v) => ({
                      ...v,
                      active: e.target.checked,
                    }))
                  }
                />
                Active
              </label>
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-stone-700">
                  Data (JSON)
                </label>
                <textarea
                  className="w-full min-h-35 rounded-md border border-stone-200 px-3 py-2 text-sm"
                  value={formValues.dataJson}
                  onChange={(e) =>
                    setFormValues((v) => ({
                      ...v,
                      dataJson: e.target.value,
                    }))
                  }
                />
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
                  {saving ? 'Saving...' : 'Save'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {error && (
        <div className="text-sm text-red-600 border border-red-100 bg-red-50 rounded-md px-3 py-2">
          {error}
        </div>
      )}

      <div className="admin-card">
        <div className="p-4 border-b border-stone-100 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-stone-900">
            Content Blocks
          </h2>
          <span className="text-xs text-stone-500">
            {blocks.length} total
          </span>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Type</TableHead>
              <TableHead>Sort</TableHead>
              <TableHead>Active</TableHead>
              <TableHead>Preview</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading && (
              <TableRow>
                <TableCell colSpan={5} className="text-sm text-stone-500">
                  Loading content blocks...
                </TableCell>
              </TableRow>
            )}
            {!loading &&
              blocks
                .slice()
                .sort((a, b) => a.sortOrder - b.sortOrder)
                .map((b) => (
                  <TableRow key={b.id}>
                    <TableCell className="text-xs capitalize">
                      {b.type.replace('_', ' ')}
                    </TableCell>
                    <TableCell className="text-xs">{b.sortOrder}</TableCell>
                    <TableCell className="text-xs">
                      {b.active ? 'Yes' : 'No'}
                    </TableCell>
                    <TableCell className="text-xs text-stone-500 max-w-xs truncate">
                      {JSON.stringify(b.data)}
                    </TableCell>
                    <TableCell className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="xs"
                        onClick={() => toggleActive(b)}
                      >
                        {b.active ? 'Deactivate' : 'Activate'}
                      </Button>
                      <Button
                        variant="destructive"
                        size="xs"
                        onClick={() => handleDelete(b.id)}
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

