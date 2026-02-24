'use client';

import { useEffect, useState } from 'react';
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

type ProductStatus = 'active' | 'inactive' | 'out_of_stock';

type Product = {
  id: string;
  name: string;
  categoryId: string;
  price: number;
  stock: number;
  status: ProductStatus;
  featured: boolean;
  bestseller: boolean;
  images?: string[];
};

type Category = {
  id: string;
  name: string;
};

type ApiSuccess<T> = { success: true; data: T; meta?: Record<string, unknown> };
type ApiError = { success: false; error: string };

const STATUS_OPTIONS: ProductStatus[] = ['active', 'inactive', 'out_of_stock'];

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [formValues, setFormValues] = useState({
    name: '',
    categoryId: '',
    price: '',
    stock: '',
    status: 'active' as ProductStatus,
    featured: false,
    bestseller: false,
    imagesCsv: '',
  });

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError(null);

        const [prodRes, catRes] = await Promise.all([
          fetch('/api/products?page=1&pageSize=50'),
          fetch('/api/categories?page=1&pageSize=100'),
        ]);

        const prodJson = (await prodRes.json()) as
          | ApiSuccess<Product[]>
          | ApiError;
        const catJson = (await catRes.json()) as
          | ApiSuccess<Category[]>
          | ApiError;

        if (!prodJson.success) throw new Error(prodJson.error);
        if (!catJson.success) throw new Error(catJson.error);

        setProducts(prodJson.data);
        setCategories(catJson.data);
      } catch (e: unknown) {
        const errorMessage = e instanceof Error ? e.message : 'Failed to load products';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  const resetForm = () => {
    setFormValues({
      name: '',
      categoryId: categories[0]?.id ?? '',
      price: '',
      stock: '',
      status: 'active',
      featured: false,
      bestseller: false,
      imagesCsv: '',
    });
    setImageFiles([]);
  };

  const openCreate = () => {
    setEditingId(null);
    resetForm();
    setDialogOpen(true);
  };

  const openEdit = (product: Product) => {
    setEditingId(product.id);
    setFormValues({
      name: product.name,
      categoryId: product.categoryId,
      price: String(product.price),
      stock: String(product.stock),
      status: product.status,
      featured: product.featured,
      bestseller: product.bestseller,
      imagesCsv: '',
    });
    setImageFiles([]);
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError(null);

      // Require at least one image for new products
      if (!editingId && imageFiles.length === 0) {
        throw new Error('At least one image is required for new products');
      }

      const imageUrls: string[] = [];

      // Upload images if files are selected
      if (imageFiles.length > 0) {
        for (const file of imageFiles) {
          const formData = new FormData();
          formData.append('file', file);
          formData.append('product', formValues.name.trim());
          
          const uploadRes = await fetch('/api/upload', {
            method: 'POST',
            body: formData,
          });
          
          const uploadJson = (await uploadRes.json()) as { success: boolean; data?: { url?: string }; error?: string };
          if (!uploadJson.success) throw new Error(uploadJson.error || 'Image upload failed');
          if (uploadJson.data?.url) imageUrls.push(uploadJson.data.url);
        }
      }

      const payload: Record<string, unknown> = {
        name: formValues.name.trim(),
        categoryId: formValues.categoryId,
        price: Number(formValues.price),
        stock: Number(formValues.stock || '0'),
        status: formValues.status,
        featured: formValues.featured,
        bestseller: formValues.bestseller,
      };

      if (imageUrls.length > 0) {
        payload.images = imageUrls;
      }

      const url = editingId ? `/api/products/${editingId}` : '/api/products';
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = (await res.json()) as ApiSuccess<Product> | ApiError;
      if (!json.success) throw new Error(json.error);

      setProducts((prev) =>
        editingId
          ? prev.map((p) => (p.id === editingId ? json.data : p))
          : [json.data, ...prev],
      );

      setDialogOpen(false);
      setEditingId(null);
      resetForm();
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : 'Failed to save product';
      setError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Deactivate this product?')) return;
    try {
      setError(null);
      const res = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
      });
      const json = (await res.json()) as ApiSuccess<unknown> | ApiError;
      if (!json.success) throw new Error(json.error);

      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : 'Failed to delete product';
      setError(errorMessage);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-xs text-stone-500 mb-2">
        Admin / <span className="font-medium text-stone-700">Products</span>
      </div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-stone-900">Products</h1>
          <p className="text-sm text-stone-500 mt-1">
            Create and manage products. Assign them to collections separately in the collection detail page.
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" onClick={openCreate}>
              + Add Product
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingId ? 'Edit Product' : 'Add Product'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
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
                  Category
                </label>
                <select
                  className="h-9 w-full rounded-md border border-stone-200 bg-white px-3 text-sm"
                  value={formValues.categoryId}
                  onChange={(e) =>
                    setFormValues((v) => ({
                      ...v,
                      categoryId: e.target.value,
                    }))
                  }
                  required
                >
                  <option value="" disabled>
                    Select category
                  </option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-stone-700">
                    Price
                  </label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formValues.price}
                    onChange={(e) =>
                      setFormValues((v) => ({ ...v, price: e.target.value }))
                    }
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-stone-700">
                    Stock
                  </label>
                  <Input
                    type="number"
                    min="0"
                    step="1"
                    value={formValues.stock}
                    onChange={(e) =>
                      setFormValues((v) => ({ ...v, stock: e.target.value }))
                    }
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-stone-700">
                    Status
                  </label>
                  <select
                    className="h-9 w-full rounded-md border border-stone-200 bg-white px-3 text-sm"
                    value={formValues.status}
                    onChange={(e) =>
                      setFormValues((v) => ({
                        ...v,
                        status: e.target.value as ProductStatus,
                      }))
                    }
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
                <label className="flex items-center gap-2 text-xs font-medium text-stone-700">
                  <input
                    type="checkbox"
                    checked={formValues.featured}
                    onChange={(e) =>
                      setFormValues((v) => ({
                        ...v,
                        featured: e.target.checked,
                      }))
                    }
                  />
                  Featured
                </label>
                <label className="flex items-center gap-2 text-xs font-medium text-stone-700">
                  <input
                    type="checkbox"
                    checked={formValues.bestseller}
                    onChange={(e) =>
                      setFormValues((v) => ({
                        ...v,
                        bestseller: e.target.checked,
                      }))
                    }
                  />
                  Bestseller
                </label>
              </div>
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-stone-700">
                  Images {!editingId && <span className="text-red-600">*</span>}
                </label>
                <Input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => setImageFiles(Array.from(e.target.files || []))}
                  disabled={saving}
                />
                {imageFiles.length > 0 && (
                  <div className="text-xs text-stone-500 mt-2">
                    <p className="font-medium mb-1">{imageFiles.length} file(s) selected:</p>
                    <ul className="list-disc list-inside">
                      {imageFiles.map((file, idx) => (
                        <li key={idx}>{file.name}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {!editingId && imageFiles.length === 0 && (
                  <p className="text-xs text-stone-500 mt-1">At least one image is required</p>
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
                <Button
                  type="submit"
                  size="sm"
                  disabled={saving || (!editingId && imageFiles.length === 0)}
                >
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
          <h2 className="text-sm font-semibold text-stone-900">All Products</h2>
          <span className="text-xs text-stone-500">
            {products.length} total
          </span>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Image</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Flags</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading && (
              <TableRow>
                <TableCell colSpan={8} className="text-sm text-stone-500">
                  Loading products...
                </TableCell>
              </TableRow>
            )}
            {!loading &&
              products.map((p) => {
                const category = categories.find((c) => c.id === p.categoryId);
                const firstImage = p.images?.[0];
                return (
                  <TableRow key={p.id}>
                    <TableCell>
                      {firstImage ? (
                        <div className="relative w-12 h-12 rounded overflow-hidden bg-stone-100">
                          <Image
                            src={firstImage}
                            alt={p.name}
                            fill
                            className="object-cover"
                            sizes="48px"
                          />
                        </div>
                      ) : (
                        <span className="text-xs text-stone-400">No image</span>
                      )}
                    </TableCell>
                    <TableCell className="font-medium text-stone-900">
                      {p.name}
                    </TableCell>
                    <TableCell>{category?.name ?? p.categoryId}</TableCell>
                    <TableCell>
                      {new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: 'USD',
                      }).format(p.price)}
                    </TableCell>
                    <TableCell>{p.stock}</TableCell>
                    <TableCell className="text-xs capitalize">
                      {p.status.replace('_', ' ')}
                    </TableCell>
                    <TableCell className="text-xs text-stone-600">
                      {p.featured && <span className="mr-1">Featured</span>}
                      {p.bestseller && <span>Bestseller</span>}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="xs" className="h-8 w-8 p-0">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEdit(p)}>
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => handleDelete(p.id)}
                          >
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

