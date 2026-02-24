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

type Product = {
  id: string;
  name: string;
  price: number;
  images?: string[];
};

type CollectionProduct = {
  sortOrder: number;
  product: Product;
};

type Collection = {
  id: string;
  name: string;
  products: CollectionProduct[];
};

type ApiSuccess<T> = { success: true; data: T };
type ApiError = { success: false; error: string };

export default function ManageProductsPage({
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
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<string>('');
  const [productLoading, setProductLoading] = useState(false);

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

  const loadProducts = async () => {
    try {
      setProductLoading(true);
      const res = await fetch('/api/products?page=1&pageSize=100');
      const json = (await res.json()) as ApiSuccess<Product[]> | ApiError;
      if (!json.success) throw new Error(json.error);
      setAllProducts(json.data);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to load products';
      setError(msg);
    } finally {
      setProductLoading(false);
    }
  };

  const handleAddProduct = async () => {
    if (!selectedProduct) return;
    try {
      setError(null);
      const res = await fetch(
        `/api/collections/${collectionId}/products`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            productId: selectedProduct,
            sortOrder: (collection?.products.length || 0) + 1,
          }),
        }
      );

      const json = (await res.json()) as
        | ApiSuccess<CollectionProduct>
        | ApiError;
      if (!json.success) throw new Error(json.error);

      await loadCollection();
      setDialogOpen(false);
      setSelectedProduct('');
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to add product';
      setError(msg);
    }
  };

  const handleRemoveProduct = async (productId: string) => {
    if (!window.confirm('Remove this product from collection?')) return;
    try {
      setError(null);
      const res = await fetch(
        `/api/collections/${collectionId}/products/${productId}`,
        {
          method: 'DELETE',
        }
      );

      const json = (await res.json()) as ApiSuccess<null> | ApiError;
      if (!json.success) throw new Error(json.error);

      await loadCollection();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to remove product';
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
            Admin / <span className="font-medium text-stone-700">Collections</span> / <span className="font-medium text-stone-700">Manage Products</span>
          </div>
          <h1 className="text-2xl font-semibold text-stone-900">
            {collection.name}
          </h1>
          <p className="text-sm text-stone-500 mt-1">
            Manage which products are featured in this collection.
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
            Products in Collection
          </h2>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button
                size="sm"
                onClick={loadProducts}
                disabled={productLoading}
              >
                + Add Product
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Product to Collection</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-2">
                    Select Product
                  </label>
                  <select
                    value={selectedProduct}
                    onChange={(e) => setSelectedProduct(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-stone-500"
                    disabled={productLoading}
                  >
                    <option value="">Choose a product...</option>
                    {allProducts
                      .filter(
                        (p) =>
                          !collection.products.some(
                            (cp) => cp.product.id === p.id
                          )
                      )
                      .map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
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
                      setSelectedProduct('');
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleAddProduct}
                    disabled={!selectedProduct}
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
              <TableHead>Product ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Sort Order</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {collection.products.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-sm text-stone-500">
                  No products added. Add one to get started.
                </TableCell>
              </TableRow>
            ) : (
              collection.products.map((cp) => (
                <TableRow key={cp.product.id}>
                  <TableCell className="font-mono text-xs text-stone-700">
                    {cp.product.id}
                  </TableCell>
                  <TableCell className="font-medium text-stone-900">
                    {cp.product.name}
                  </TableCell>
                  <TableCell className="text-sm text-stone-600">
                    ${cp.product.price}
                  </TableCell>
                  <TableCell className="text-sm text-stone-600">
                    {cp.sortOrder}
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
                          onClick={() => handleRemoveProduct(cp.product.id)}
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
          onClick={() => router.back()}
        >
          Back to Categories
        </Button>
        <Button
          variant="outline"
          onClick={() => router.push('/admin/collections')}
        >
          Back to Collections
        </Button>
      </div>
    </div>
  );
}
