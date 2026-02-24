'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { MoreVertical } from 'lucide-react';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';

type Collection = {
  id: string;
  name: string;
  subtitle?: string | null;
  description?: string | null;
  color?: string | null;
  gradient?: string | null;
  image?: string | null;
};

type ApiSuccess<T> = { success: true; data: T; meta?: Record<string, unknown> };
type ApiError = { success: false; error: string };

export default function CollectionsPage() {
  const router = useRouter();
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [formValues, setFormValues] = useState({
    id: '',
    name: '',
    subtitle: '',
    description: '',
    color: '',
    gradient: '',
  });
  const [imageFile, setImageFile] = useState<File | null>(null);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch('/api/collections?page=1&pageSize=50');
        const json = (await res.json()) as ApiSuccess<Collection[]> | ApiError;
        if (!json.success) throw new Error(json.error);

        setCollections(json.data);
      } catch (e: unknown) {
        const errorMessage = e instanceof Error ? e.message : 'Failed to load collections';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  const resetForm = () => {
    setFormValues({
      id: '',
      name: '',
      subtitle: '',
      description: '',
      color: '',
      gradient: '',
    });
    setImageFile(null);
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9\-]/g, '')
      .replace(/\-+/g, '-')
      .replace(/^\-|\-$/g, '');
  };

  const openCreate = () => {
    setEditingId(null);
    resetForm();
    setDialogOpen(true);
  };

  const openEdit = (collection: Collection) => {
    setEditingId(collection.id);
    setFormValues({
      id: collection.id,
      name: collection.name,
      subtitle: collection.subtitle ?? '',
      description: collection.description ?? '',
      color: collection.color ?? '',
      gradient: collection.gradient ?? '',
    });
    setImageFile(null);
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError(null);

      let imageUrl: string | undefined;

      // Upload image if file is selected
      if (imageFile) {
        const formData = new FormData();
        formData.append('file', imageFile);
        formData.append('collection', formValues.id.trim());
        
        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });
        
        const uploadJson = (await uploadRes.json()) as { success: boolean; data?: { url?: string }; error?: string };
        if (!uploadJson.success) throw new Error(uploadJson.error || 'Image upload failed');
        imageUrl = uploadJson.data?.url;
      }

      const payload = {
        id: formValues.id.trim(),
        name: formValues.name.trim(),
        subtitle: formValues.subtitle || undefined,
        description: formValues.description || undefined,
        color: formValues.color || undefined,
        gradient: formValues.gradient || undefined,
        image: imageUrl,
      };

      const url = editingId
        ? `/api/collections/${editingId}`
        : '/api/collections';
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = (await res.json()) as ApiSuccess<Collection> | ApiError;
      if (!json.success) throw new Error(json.error);

      setCollections((prev) =>
        editingId
          ? prev.map((c) => (c.id === editingId ? json.data : c))
          : [json.data, ...prev],
      );

      setDialogOpen(false);
      setEditingId(null);
      resetForm();
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : 'Failed to save collection';
      setError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this collection?')) return;
    try {
      setError(null);
      const res = await fetch(`/api/collections/${id}`, { method: 'DELETE' });
      const json = (await res.json()) as ApiSuccess<unknown> | ApiError;
      if (!json.success) throw new Error(json.error);

      setCollections((prev) => prev.filter((c) => c.id !== id));
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : 'Failed to delete collection';
      setError(errorMessage);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="text-xs text-stone-500 mb-2">
            Admin / <span className="font-medium text-stone-700">Collections</span>
          </div>
          <h1 className="text-2xl font-semibold text-stone-900">Collections</h1>
          <p className="text-sm text-stone-500 mt-1">
            Manage curated groupings. Create and organize collections, then manage their categories and products separately.
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" onClick={openCreate}>
              + Add Collection
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingId ? 'Edit Collection' : 'Add Collection'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-stone-700">
                  Name
                </label>
                <Input
                  value={formValues.name}
                  onChange={(e) => {
                    const newName = e.target.value;
                    setFormValues((v) => ({
                      ...v,
                      name: newName,
                      id: editingId ? v.id : generateSlug(newName),
                      subtitle: editingId ? v.subtitle : generateSlug(newName),
                    }));
                  }}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-stone-700">
                  Description
                </label>
                <Input
                  value={formValues.description}
                  onChange={(e) =>
                    setFormValues((v) => ({
                      ...v,
                      description: e.target.value,
                    }))
                  }
                  placeholder="Describe this collection"
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-stone-700">
                  Image
                </label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                  disabled={saving}
                />
                {imageFile && (
                  <p className="text-xs text-stone-500">
                    Selected: {imageFile.name}
                  </p>
                )}
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setDialogOpen(false);
                    setEditingId(null);
                  }}
                  disabled={saving}
                >
                  Cancel
                </Button>
                <Button type="submit" size="sm" disabled={saving}>
                  {saving ? 'Saving...' : editingId ? 'Save changes' : 'Save'}
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
            All Collections
          </h2>
          <span className="text-xs text-stone-500">
            {collections.length} total
          </span>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Image</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading && (
              <TableRow>
                <TableCell colSpan={4} className="text-sm text-stone-500">
                  Loading collections...
                </TableCell>
              </TableRow>
            )}
            {!loading &&
              collections.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-mono text-xs text-stone-700">
                    {c.id}
                  </TableCell>
                  <TableCell className="font-medium text-stone-900">
                    {c.name}
                  </TableCell>
                  <TableCell>
                    {c.image ? (
                      <div className="relative w-12 h-12 rounded overflow-hidden bg-stone-100">
                        <Image
                          src={c.image}
                          alt={c.name}
                          fill
                          className="object-cover"
                          sizes="48px"
                        />
                      </div>
                    ) : (
                      <span className="text-xs text-stone-400">No image</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="xs" className="h-8 w-8 p-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => router.push(`/admin/collections/${c.id}`)}
                        >
                          Manage
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => openEdit(c)}>
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => handleDelete(c.id)}
                        >
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

