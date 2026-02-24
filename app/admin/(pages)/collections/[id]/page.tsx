'use client';

import { useEffect, useState, useCallback } from 'react';
import { use } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

type Collection = {
  id: string;
  name: string;
  subtitle?: string | null;
  description?: string | null;
  color?: string | null;
  gradient?: string | null;
  image?: string | null;
};

type ApiSuccess<T> = { success: true; data: T };
type ApiError = { success: false; error: string };

export default function CollectionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { id: collectionId } = use(params);

  const [collection, setCollection] = useState<Collection | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.back()}
            className="mb-4"
          >
            ← Back
          </Button>
          <div className="text-xs text-stone-500 mb-2">
            Admin / <span className="font-medium text-stone-700">Collections</span> / <span className="font-medium text-stone-700">{collection.name}</span>
          </div>
          <h1 className="text-2xl font-semibold text-stone-900">
            {collection.name}
          </h1>
          <p className="text-sm text-stone-500 mt-1">
            {collection.subtitle || collection.description || 'No description'}
          </p>
        </div>
      </div>

      {error && (
        <div className="text-sm text-red-600 border border-red-100 bg-red-50 rounded-md px-3 py-2">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button
          onClick={() => router.push(`/admin/collections/${collectionId}/categories`)}
          className="admin-card p-6 hover:shadow-md transition-shadow cursor-pointer border border-stone-200"
        >
          <h2 className="text-lg font-semibold text-stone-900 mb-2">
            Manage Categories
          </h2>
          <p className="text-sm text-stone-600 mb-4">
            Link categories to this collection
          </p>
          <Button variant="outline" className="w-full">
            Go to Categories →
          </Button>
        </button>

        <button
          onClick={() => router.push(`/admin/collections/${collectionId}/products`)}
          className="admin-card p-6 hover:shadow-md transition-shadow cursor-pointer border border-stone-200"
        >
          <h2 className="text-lg font-semibold text-stone-900 mb-2">
            Manage Products
          </h2>
          <p className="text-sm text-stone-600 mb-4">
            Add hand-picked products to this collection
          </p>
          <Button variant="outline" className="w-full">
            Go to Products →
          </Button>
        </button>
      </div>
    </div>
  );
}
