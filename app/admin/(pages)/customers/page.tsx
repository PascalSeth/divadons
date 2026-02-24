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
} from '@/components/ui/dialog';

type CustomerSummary = {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  createdAt: string;
};

type CustomerDetail = {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  createdAt: string;
  addresses: {
    id: string;
    street: string;
    city: string;
    country: string;
    isDefault: boolean;
  }[];
  orders: {
    id: string;
    total: number;
    status: string;
    createdAt: string;
  }[];
};

type ApiSuccess<T> = { success: true; data: T; meta?: Record<string, unknown> };
type ApiError = { success: false; error: string };

export default function CustomersPage() {
  const [customers, setCustomers] = useState<CustomerSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [detailOpen, setDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [selected, setSelected] = useState<CustomerDetail | null>(null);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch('/api/customers?page=1&pageSize=50');
        const json = (await res.json()) as
          | ApiSuccess<CustomerSummary[]>
          | ApiError;
        if (!json.success) throw new Error(json.error);
        setCustomers(json.data);
      } catch (e: unknown) {
        const errorMessage = e instanceof Error ? e.message : 'Failed to load customers';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const openDetail = async (id: string) => {
    try {
      setDetailOpen(true);
      setDetailLoading(true);
      setSelected(null);
      const res = await fetch(`/api/customers/${id}`);
      const json = (await res.json()) as ApiSuccess<CustomerDetail> | ApiError;
      if (!json.success) throw new Error(json.error);
      setSelected(json.data);
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : 'Failed to load customer details';
      setError(errorMessage);
      setDetailOpen(false);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this customer?')) return;
    try {
      setError(null);
      const res = await fetch(`/api/customers/${id}`, { method: 'DELETE' });
      const json = (await res.json()) as ApiSuccess<unknown> | ApiError;
      if (!json.success) throw new Error(json.error);
      setCustomers((prev) => prev.filter((c) => c.id !== id));
      if (selected && selected.id === id) {
        setDetailOpen(false);
        setSelected(null);
      }
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : 'Failed to delete customer';
      setError(errorMessage);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-stone-900">Customers</h1>
          <p className="text-sm text-stone-500 mt-1">
            View customer profiles, orders, and addresses.
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
            All Customers
          </h2>
          <span className="text-xs text-stone-500">
            {customers.length} total
          </span>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Since</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading && (
              <TableRow>
                <TableCell colSpan={5} className="text-sm text-stone-500">
                  Loading customers...
                </TableCell>
              </TableRow>
            )}
            {!loading &&
              customers.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium text-stone-900">
                    {c.name}
                  </TableCell>
                  <TableCell className="text-xs text-stone-700">
                    {c.email}
                  </TableCell>
                  <TableCell className="text-xs text-stone-600">
                    {c.phone ?? '—'}
                  </TableCell>
                  <TableCell className="text-xs text-stone-500">
                    {new Date(c.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="xs"
                      onClick={() => openDetail(c.id)}
                    >
                      View
                    </Button>
                    <Button
                      variant="destructive"
                      size="xs"
                      onClick={() => handleDelete(c.id)}
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Customer Details</DialogTitle>
          </DialogHeader>
          {detailLoading && (
            <p className="text-sm text-stone-500">Loading customer...</p>
          )}
          {!detailLoading && selected && (
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-stone-900">
                    {selected.name}
                  </p>
                  <p className="text-xs text-stone-700">{selected.email}</p>
                  <p className="text-xs text-stone-500">
                    {selected.phone ?? 'No phone'}
                  </p>
                </div>
                <Button
                  variant="destructive"
                  size="xs"
                  onClick={() => handleDelete(selected.id)}
                >
                  Delete
                </Button>
              </div>

              <div className="border-t border-stone-100 pt-3 space-y-2">
                <h3 className="text-xs font-semibold text-stone-700">
                  Addresses
                </h3>
                {selected.addresses.length === 0 && (
                  <p className="text-xs text-stone-500">No addresses.</p>
                )}
                {selected.addresses.map((a) => (
                  <div
                    key={a.id}
                    className="text-xs text-stone-700 flex items-center justify-between"
                  >
                    <span>
                      {a.street}, {a.city}, {a.country}
                    </span>
                    {a.isDefault && (
                      <span className="ml-2 text-[10px] uppercase text-amber-600">
                        Default
                      </span>
                    )}
                  </div>
                ))}
              </div>

              <div className="border-t border-stone-100 pt-3 space-y-2">
                <h3 className="text-xs font-semibold text-stone-700">Orders</h3>
                {selected.orders.length === 0 && (
                  <p className="text-xs text-stone-500">No orders yet.</p>
                )}
                {selected.orders.map((o) => (
                  <div
                    key={o.id}
                    className="flex items-center justify-between text-xs text-stone-700"
                  >
                    <span className="font-mono text-[11px]">{o.id}</span>
                    <span className="text-stone-500">
                      {new Date(o.createdAt).toLocaleDateString()}
                    </span>
                    <span className="capitalize">{o.status}</span>
                    <span>
                      {new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: 'USD',
                      }).format(o.total)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

