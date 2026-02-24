'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { MoreVertical } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
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

type Category = {
  id: string;
  name: string;
  subtitle?: string | null;
  description?: string | null;
  color?: string | null;
  gradient?: string | null;
  image?: string | null;
  productCount: number;
};

type Collection = {
  id: string;
  name: string;
};

type ApiSuccess<T> = { success: true; data: T; meta?: Record<string, unknown> };
type ApiError = { success: false; error: string };

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
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
    collectionId: '',
  });
  const [imageFile, setImageFile] = useState<File | null>(null);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError(null);

        const [catRes, colRes] = await Promise.all([
          fetch('/api/categories?page=1&pageSize=50'),
          fetch('/api/collections?page=1&pageSize=100'),
        ]);

        const catJson = (await catRes.json()) as ApiSuccess<Category[]> | ApiError;
        const colJson = (await colRes.json()) as ApiSuccess<Collection[]> | ApiError;

        if (!catJson.success) throw new Error(catJson.error);
        if (!colJson.success) throw new Error(colJson.error);

        setCategories(catJson.data);
        setCollections(colJson.data);
      } catch (e: unknown) {
        const errorMessage = e instanceof Error ? e.message : 'Failed to load data';
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
      collectionId: '',
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

  const openEdit = (category: Category) => {
    setEditingId(category.id);
    setFormValues({
      id: category.id,
      name: category.name,
      subtitle: category.subtitle ?? '',
      description: category.description ?? '',
      color: category.color ?? '',
      gradient: category.gradient ?? '',
      collectionId: '',
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
        formData.append('category', formValues.id.trim());
        
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
        ? `/api/categories/${editingId}`
        : '/api/categories';
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = (await res.json()) as ApiSuccess<Category> | ApiError;
      if (!json.success) throw new Error(json.error);

      setCategories((prev) =>
        editingId
          ? prev.map((c) => (c.id === editingId ? json.data : c))
          : [json.data, ...prev],
      );

      // Link to collection if selected during creation
      if (!editingId && formValues.collectionId) {
        try {
          const linkRes = await fetch(
            `/api/collections/${formValues.collectionId}/categories`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                categoryId: formValues.id.trim(),
                sortOrder: 0,
              }),
            }
          );
          const linkJson = (await linkRes.json()) as
            | ApiSuccess<unknown>
            | ApiError;
          if (!linkJson.success) {
            console.warn('Failed to link category to collection');
          }
        } catch (e) {
          console.warn('Error linking category:', e);
        }
      }

      setDialogOpen(false);
      setEditingId(null);
      resetForm();
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : 'Failed to save category';
      setError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this category?')) return;
    try {
      setError(null);
      const res = await fetch(`/api/categories/${id}`, { method: 'DELETE' });
      const json = (await res.json()) as ApiSuccess<unknown> | ApiError;
      if (!json.success) throw new Error(json.error);

      setCategories((prev) => prev.filter((c) => c.id !== id));
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : 'Failed to delete category';
      setError(errorMessage);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="text-xs text-stone-500 mb-2">
            Admin / <span className="font-medium text-stone-700">Categories</span>
          </div>
          <h1 className="text-2xl font-semibold text-stone-900">Categories</h1>
          <p className="text-sm text-stone-500 mt-1">
            Create and manage product categories. Link them to collections during creation or manage relationships in the collection detail page.
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" onClick={openCreate}>
              + Add Category
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingId ? 'Edit Category' : 'Add Category'}
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
                  placeholder="Describe this category"
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
              {!editingId && (
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-stone-700">
                    Link to Collection (Optional)
                  </label>
                  <select
                    value={formValues.collectionId}
                    onChange={(e) =>
                      setFormValues((v) => ({
                        ...v,
                        collectionId: e.target.value,
                      }))
                    }
                    className="w-full h-9 rounded-md border border-stone-200 bg-white px-3 text-sm"
                  >
                    <option value="">None - Add later</option>
                    {collections.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-stone-500 mt-1">
                    Select a collection to automatically link this category when created.
                  </p>
                </div>
              )}
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
            All Categories
          </h2>
          <span className="text-xs text-stone-500">
            {categories.length} total
          </span>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Products</TableHead>
                <TableHead>Image</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading && (
                <TableRow>
                  <TableCell colSpan={5} className="text-sm text-stone-500">
                    Loading categories...
                  </TableCell>
                </TableRow>
              )}
              {!loading &&
                categories.map((cat) => (
                  <TableRow key={cat.id}>
                    <TableCell className="font-mono text-xs text-stone-700">
                      {cat.id}
                    </TableCell>
                    <TableCell className="font-medium text-stone-900">
                      {cat.name}
                    </TableCell>
                    <TableCell>
                      <span className="inline-block bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                        {cat.productCount}
                      </span>
                    </TableCell>
                    <TableCell>
                      {cat.image ? (
                        <div className="relative w-12 h-12 rounded overflow-hidden bg-stone-100">
                          <Image
                            src={cat.image}
                            alt={cat.name}
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
                          <DropdownMenuItem onClick={() => openEdit(cat)}>
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => handleDelete(cat.id)}
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
    </div>
  );
}

