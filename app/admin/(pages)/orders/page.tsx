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

type OrderStatus =
  | 'pending'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled';

type OrderSummary = {
  id: string;
  total: number;
  status: OrderStatus;
  createdAt: string;
  customer: {
    id: string;
    name: string;
    email: string;
  } | null;
};

type OrderItem = {
  id: string;
  productId: string | null;
  productName: string;
  quantity: number;
  price: number;
  size?: string | null;
  color?: string | null;
};

type OrderDetail = {
  id: string;
  total: number;
  status: OrderStatus;
  createdAt: string;
  customer: {
    id: string;
    name: string;
    email: string;
  } | null;
  items: OrderItem[];
};

type ApiSuccess<T> = { success: true; data: T; meta?: Record<string, unknown> };
type ApiError = { success: false; error: string };

const STATUS_OPTIONS: OrderStatus[] = [
  'pending',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
];

export default function OrdersPage() {
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [detailOpen, setDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<OrderDetail | null>(null);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch('/api/orders?page=1&pageSize=50');
        const json = (await res.json()) as ApiSuccess<OrderSummary[]> | ApiError;
        if (!json.success) throw new Error(json.error);
        setOrders(json.data);
      } catch (e: unknown) {
        const errorMessage = e instanceof Error ? e.message : 'Failed to load orders';
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
      setSelectedOrder(null);
      const res = await fetch(`/api/orders/${id}`);
      const json = (await res.json()) as ApiSuccess<OrderDetail> | ApiError;
      if (!json.success) throw new Error(json.error);
      setSelectedOrder(json.data);
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : 'Failed to load order';
      setError(errorMessage);
      setDetailOpen(false);
    } finally {
      setDetailLoading(false);
    }
  };

  const updateStatus = async (id: string, status: OrderStatus) => {
    try {
      setError(null);
      const res = await fetch(`/api/orders/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      const json = (await res.json()) as ApiSuccess<{ id: string; status: OrderStatus }> | ApiError;
      if (!json.success) throw new Error(json.error);

      setOrders((prev) =>
        prev.map((o) => (o.id === id ? { ...o, status: json.data.status } : o)),
      );
      if (selectedOrder && selectedOrder.id === id) {
        setSelectedOrder({ ...selectedOrder, status: json.data.status });
      }
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : 'Failed to update order status';
      setError(errorMessage);
    }
  };

  const cancelOrder = async (id: string) => {
    if (!window.confirm('Cancel this order?')) return;
    try {
      setError(null);
      const res = await fetch(`/api/orders/${id}`, { method: 'DELETE' });
      const json = (await res.json()) as
        | ApiSuccess<{ id: string; status: OrderStatus }>
        | ApiError;
      if (!json.success) throw new Error(json.error);

      setOrders((prev) =>
        prev.map((o) =>
          o.id === id ? { ...o, status: json.data.status } : o,
        ),
      );
      if (selectedOrder && selectedOrder.id === id) {
        setSelectedOrder({ ...selectedOrder, status: json.data.status });
      }
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : 'Failed to cancel order';
      setError(errorMessage);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-stone-900">Orders</h1>
          <p className="text-sm text-stone-500 mt-1">
            Review, update, and manage customer orders.
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
          <h2 className="text-sm font-semibold text-stone-900">All Orders</h2>
          <span className="text-xs text-stone-500">
            {orders.length} total
          </span>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Placed</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading && (
              <TableRow>
                <TableCell colSpan={6} className="text-sm text-stone-500">
                  Loading orders...
                </TableCell>
              </TableRow>
            )}
            {!loading &&
              orders.map((o) => (
                <TableRow key={o.id}>
                  <TableCell className="font-mono text-xs text-stone-700">
                    {o.id}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-stone-900">
                        {o.customer?.name ?? 'Guest'}
                      </span>
                      <span className="text-xs text-stone-500">
                        {o.customer?.email ?? '—'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: 'USD',
                    }).format(o.total)}
                  </TableCell>
                  <TableCell className="text-xs capitalize">
                    {o.status}
                  </TableCell>
                  <TableCell className="text-xs text-stone-500">
                    {new Date(o.createdAt).toLocaleString()}
                  </TableCell>
                  <TableCell className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="xs"
                      onClick={() => openDetail(o.id)}
                    >
                      View
                    </Button>
                    {o.status !== 'cancelled' && (
                      <Button
                        variant="destructive"
                        size="xs"
                        onClick={() => cancelOrder(o.id)}
                      >
                        Cancel
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
          </DialogHeader>
          {detailLoading && (
            <p className="text-sm text-stone-500">Loading order...</p>
          )}
          {!detailLoading && selectedOrder && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-mono text-stone-700">
                    {selectedOrder.id}
                  </p>
                  <p className="text-xs text-stone-500">
                    {selectedOrder.customer?.name ?? 'Guest'} •{' '}
                    {selectedOrder.customer?.email ?? '—'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-stone-900">
                    {new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: 'USD',
                    }).format(selectedOrder.total)}
                  </p>
                  <select
                    className="mt-1 h-8 rounded-md border border-stone-200 bg-white px-2 text-xs"
                    value={selectedOrder.status}
                    onChange={(e) =>
                      updateStatus(
                        selectedOrder.id,
                        e.target.value as OrderStatus,
                      )
                    }
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="border-t border-stone-100 pt-3">
                <h3 className="text-xs font-semibold text-stone-700 mb-2">
                  Items
                </h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Qty</TableHead>
                      <TableHead>Price</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedOrder.items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="text-xs">
                          {item.productName}
                        </TableCell>
                        <TableCell className="text-xs">
                          {item.quantity}
                        </TableCell>
                        <TableCell className="text-xs">
                          {new Intl.NumberFormat('en-US', {
                            style: 'currency',
                            currency: 'USD',
                          }).format(item.price)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

