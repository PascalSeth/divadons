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

type Summary = {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  pendingOrders: number;
};

type RecentOrder = {
  id: string;
  total: number;
  status: string;
  createdAt: string;
  customer: {
    name: string;
    email: string;
  } | null;
};

type TopProduct = {
  productId: string | null;
  productName: string;
  totalQuantity: number;
};

type ApiSuccess<T> = { success: true; data: T; meta?: Record<string, unknown> };
type ApiError = { success: false; error: string };

export default function AnalyticsPage() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError(null);

        const [summaryRes, recentRes, topRes] = await Promise.all([
          fetch('/api/analytics/summary'),
          fetch('/api/analytics/recent-orders'),
          fetch('/api/analytics/top-products'),
        ]);

        const summaryJson = (await summaryRes.json()) as
          | ApiSuccess<Summary>
          | ApiError;
        const recentJson = (await recentRes.json()) as
          | ApiSuccess<RecentOrder[]>
          | ApiError;
        const topJson = (await topRes.json()) as
          | ApiSuccess<TopProduct[]>
          | ApiError;

        if (!summaryJson.success) throw new Error(summaryJson.error);
        if (!recentJson.success) throw new Error(recentJson.error);
        if (!topJson.success) throw new Error(topJson.error);

        setSummary(summaryJson.data);
        setRecentOrders(recentJson.data);
        setTopProducts(topJson.data);
      } catch (e: unknown) {
        const errorMessage = e instanceof Error ? e.message : 'Failed to load analytics';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-stone-900">Analytics</h1>
          <p className="text-sm text-stone-500 mt-1">
            Sales, customers, and product performance.
          </p>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={() => window.location.reload()}
        >
          Refresh
        </Button>
      </div>

      {error && (
        <div className="text-sm text-red-600 border border-red-100 bg-red-50 rounded-md px-3 py-2">
          {error}
        </div>
      )}

      {/* Summary cards */}
      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="admin-card p-4">
            <p className="text-xs font-medium text-stone-500 uppercase tracking-wider">
              Total Revenue
            </p>
            <p className="text-xl font-semibold text-stone-900 mt-1">
              {new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
              }).format(summary.totalRevenue)}
            </p>
          </div>
          <div className="admin-card p-4">
            <p className="text-xs font-medium text-stone-500 uppercase tracking-wider">
              Total Orders
            </p>
            <p className="text-xl font-semibold text-stone-900 mt-1">
              {summary.totalOrders}
            </p>
          </div>
          <div className="admin-card p-4">
            <p className="text-xs font-medium text-stone-500 uppercase tracking-wider">
              Total Customers
            </p>
            <p className="text-xl font-semibold text-stone-900 mt-1">
              {summary.totalCustomers}
            </p>
          </div>
          <div className="admin-card p-4">
            <p className="text-xs font-medium text-stone-500 uppercase tracking-wider">
              Pending Orders
            </p>
            <p className="text-xl font-semibold text-stone-900 mt-1">
              {summary.pendingOrders}
            </p>
          </div>
        </div>
      )}

      {/* Top products & recent orders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="admin-card">
          <div className="p-4 border-b border-stone-100 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-stone-900">
              Top Products
            </h2>
          </div>
          <div className="p-4 space-y-3">
            {topProducts.map((p, index) => (
              <div key={`${p.productId ?? p.productName}-${index}`}>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-stone-900">
                    {p.productName}
                  </span>
                  <span className="text-stone-500">
                    {p.totalQuantity} sold
                  </span>
                </div>
                <div className="mt-1 h-1.5 bg-stone-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-500 rounded-full"
                    style={{
                      width: `${
                        (p.totalQuantity /
                          (topProducts[0]?.totalQuantity || 1)) *
                        100
                      }%`,
                    }}
                  />
                </div>
              </div>
            ))}
            {topProducts.length === 0 && !loading && (
              <p className="text-xs text-stone-500">No sales yet.</p>
            )}
          </div>
        </div>

        <div className="admin-card">
          <div className="p-4 border-b border-stone-100 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-stone-900">
              Recent Orders
            </h2>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading && (
                <TableRow>
                  <TableCell colSpan={3} className="text-xs text-stone-500">
                    Loading...
                  </TableCell>
                </TableRow>
              )}
              {!loading &&
                recentOrders.map((o) => (
                  <TableRow key={o.id}>
                    <TableCell className="font-mono text-[11px] text-stone-700">
                      {o.id}
                    </TableCell>
                    <TableCell className="text-xs">
                      {o.customer?.name ?? 'Guest'}
                    </TableCell>
                    <TableCell className="text-xs">
                      {new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: 'USD',
                      }).format(o.total)}
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

