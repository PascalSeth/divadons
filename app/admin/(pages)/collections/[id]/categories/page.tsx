'use client';

import { useEffect, useState, useCallback } from 'react';
import { use } from 'react';
import { useRouter } from 'next/navigation';
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

type Category = {
  id: string;
  name: string;
  image?: string | null;
};

type CollectionCategory = {
  sortOrder: number;
  category: Category;
};

type Collection = {
  id: string;
  name: string;
  categories: CollectionCategory[];
};

type ApiSuccess<T> = { success: true; data: T };
type ApiError = { success: false; error: string };

export default function ManageCategoriesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const collectionId = use(params).id;

  const [collection, setCollection] = useState<Collection | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [categoryLoading, setCategoryLoading] = useState(false);

  const loadCollection = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch(`/api/collections/${collectionId}`);
      const json = (await res.json()) as ApiSuccess<Collection> | ApiError;
      if (!json.success) throw new Error(json.error);

      setCollection(json.data);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to load collection';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [collectionId]);

  useEffect(() => {
    loadCollection();
  }, [loadCollection]);

  const loadCategories = async () => {
    try {
      setCategoryLoading(true);
      const res = await fetch('/api/categories?page=1&pageSize=100');
      const json = (await res.json()) as ApiSuccess<Category[]> | ApiError;
      if (!json.success) throw new Error(json.error);
      setAllCategories(json.data);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to load categories';
      setError(msg);
    } finally {
      setCategoryLoading(false);
    }
  };

  const handleAddCategory = async () => {
    if (!selectedCategory) return;
    try {
      setError(null);
      const res = await fetch(`/api/collections/${collectionId}/categories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          categoryId: selectedCategory,
          sortOrder: (collection?.categories.length || 0) + 1,
        }),
      });

      const json = (await res.json()) as
        | ApiSuccess<CollectionCategory>
        | ApiError;
      if (!json.success) throw new Error(json.error);

      await loadCollection();
      setDialogOpen(false);
      setSelectedCategory('');
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to add category';
      setError(msg);
    }
  };

  const handleRemoveCategory = async (categoryId: string) => {
    if (!window.confirm('Remove this category from collection?')) return;
    try {
      setError(null);
      const res = await fetch(
        `/api/collections/${collectionId}/categories/${categoryId}`,
        {
          method: 'DELETE',
        }
      );

      const json = (await res.json()) as ApiSuccess<null> | ApiError;
      if (!json.success) throw new Error(json.error);

      await loadCollection();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to remove category';
      setError(msg);
    }
  };

  if (loading) {
    return <div className="p-6 text-stone-500">Loading collection...</div>;
  }

  if (!collection) {
    return (
      <div className="p-6 text-red-600">
        Collection not found
        <Button
          size="sm"
          variant="outline"
          onClick={() => router.back()}
          className="mt-4"
        >
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs text-stone-500 mb-2">
            Admin / <span className="font-medium text-stone-700">Collections</span> / <span className="font-medium text-stone-700">Manage Categories</span>
          </div>
          <h1 className="text-2xl font-semibold text-stone-900">
            {collection.name}
          </h1>
          <p className="text-sm text-stone-500 mt-1">
            Manage which categories are part of this collection.
          </p>
        </div>
      </div>

      {error && (
        <div className="text-sm text-red-600 border border-red-100 bg-red-50 rounded-md px-3 py-2">
          {error}
        </div>
      )}

      <div className="admin-card">
        <div className="p-4 border-b border-stone-100 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-stone-900">
            Linked Categories
          </h2>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button
                size="sm"
                onClick={loadCategories}
                disabled={categoryLoading}
              >
                + Add Category
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Category to Collection</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-2">
                    Select Category
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-stone-500"
                    disabled={categoryLoading}
                  >
                    <option value="">Choose a category...</option>
                    {allCategories
                      .filter(
                        (c) =>
                          !collection.categories.some(
                            (cc) => cc.category.id === c.id
                          )
                      )
                      .map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                  </select>
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setDialogOpen(false);
                      setSelectedCategory('');
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleAddCategory}
                    disabled={!selectedCategory}
                  >
                    Add
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Category ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Sort Order</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {collection.categories.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-sm text-stone-500">
                  No categories linked. Add one to get started.
                </TableCell>
              </TableRow>
            ) : (
              collection.categories.map((cc) => (
                <TableRow key={cc.category.id}>
                  <TableCell className="font-mono text-xs text-stone-700">
                    {cc.category.id}
                  </TableCell>
                  <TableCell className="font-medium text-stone-900">
                    {cc.category.name}
                  </TableCell>
                  <TableCell className="text-sm text-stone-600">
                    {cc.sortOrder}
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
                          className="text-red-600"
                          onClick={() => handleRemoveCategory(cc.category.id)}
                        >
                          Remove
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex gap-2">
        <Button
          variant="outline"
          onClick={() => router.push(`/admin/collections/${collectionId}/products`)}
        >
          Next: Manage Products
        </Button>
        <Button
          variant="outline"
          onClick={() => router.back()}
        >
          Back
        </Button>
      </div>
    </div>
  );
}
