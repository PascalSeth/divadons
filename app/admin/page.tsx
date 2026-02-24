'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

type SummaryResponse = {
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

type ApiSuccess<T> = { success: true; data: T };
type ApiError = { success: false; error: string };

export default function AdminDashboard() {
  const [summary, setSummary] = useState<SummaryResponse | null>(null);
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

        const summaryJson = (await summaryRes.json()) as ApiSuccess<SummaryResponse> | ApiError;
        const recentJson = (await recentRes.json()) as ApiSuccess<RecentOrder[]> | ApiError;
        const topJson = (await topRes.json()) as ApiSuccess<TopProduct[]> | ApiError;

        if (!summaryJson.success) throw new Error(summaryJson.error);
        if (!recentJson.success) throw new Error(recentJson.error);
        if (!topJson.success) throw new Error(topJson.error);

        setSummary(summaryJson.data);
        setRecentOrders(recentJson.data);
        setTopProducts(topJson.data);
      } catch (e: unknown) {
        const errorMessage = e instanceof Error ? e.message : 'Failed to load dashboard data';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  const stats = summary
    ? [
        {
          title: 'Total Revenue',
          value: new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
          }).format(summary.totalRevenue),
          icon: RevenueIcon,
          gradient: 'stat-card-gradient-1',
        },
        {
          title: 'Total Orders',
          value: summary.totalOrders.toString(),
          icon: OrdersIcon,
          gradient: 'stat-card-gradient-2',
        },
        {
          title: 'Total Customers',
          value: summary.totalCustomers.toString(),
          icon: CustomersIcon,
          gradient: 'stat-card-gradient-3',
        },
        {
          title: 'Pending Orders',
          value: summary.pendingOrders.toString(),
          icon: PendingIcon,
          gradient: 'stat-card-gradient-4',
        },
      ]
    : [];
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-stone-900">Dashboard</h1>
          <p className="text-sm text-stone-500 mt-1">Welcome back! Here&apos;s what&apos;s happening with your store.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm">
            Export
          </Button>
          <Button size="sm">
            + Add Product
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {loading && !summary && (
          <div className="col-span-1 sm:col-span-2 lg:col-span-4 text-sm text-stone-500">
            Loading analytics...
          </div>
        )}
        {error && (
          <div className="col-span-1 sm:col-span-2 lg:col-span-4 text-sm text-red-600">
            {error}
          </div>
        )}
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`admin-card p-5 ${stat.gradient}`}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-stone-500 uppercase tracking-wider">
                  {stat.title}
                </p>
                <p className="text-2xl font-semibold text-stone-900 mt-2">
                  {stat.value}
                </p>
              </div>
              <div className="p-3 bg-white/60 rounded-lg">
                <stat.icon className="w-6 h-6 text-stone-700" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <div className="lg:col-span-2 admin-card">
          <div className="p-5 border-b border-stone-100 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-stone-900">Recent Orders</h2>
            <a href="/admin/orders" className="text-sm text-amber-600 hover:text-amber-700 font-medium">
              View all
            </a>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium text-stone-900">
                      {order.id}
                    </TableCell>
                    <TableCell>{order.customer?.name ?? 'Guest'}</TableCell>
                    <TableCell className="text-stone-600">
                      {order.customer?.email ?? '—'}
                    </TableCell>
                    <TableCell className="font-medium">
                      {new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: 'USD',
                      }).format(order.total)}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`admin-badge ${
                          order.status === 'delivered'
                            ? 'admin-badge-success'
                            : order.status === 'processing'
                            ? 'admin-badge-info'
                            : order.status === 'shipped' ||
                              order.status === 'pending'
                            ? 'admin-badge-warning'
                            : 'admin-badge-error'
                        }`}
                      >
                        {order.status}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Top Products */}
        <div className="admin-card">
          <div className="p-5 border-b border-stone-100 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-stone-900">Top Products</h2>
            <a href="/admin/products" className="text-sm text-amber-600 hover:text-amber-700 font-medium">
              View all
            </a>
          </div>
          <div className="p-5 space-y-4">
            {topProducts.map((product, index) => (
              <div
                key={`${product.productId ?? product.productName}-${index}`}
                className="flex items-center gap-4"
              >
                <span className="text-sm font-medium text-stone-400 w-4">{index + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-stone-900 truncate">
                    {product.productName}
                  </p>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs text-stone-500">
                      {product.totalQuantity} sold
                    </span>
                  </div>
                  <div className="mt-2 h-1.5 bg-stone-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-500 rounded-full"
                      style={{
                        width: `${
                          (product.totalQuantity /
                            (topProducts[0]?.totalQuantity || 1)) *
                          100
                        }%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { title: 'Add Product', icon: AddProductIcon, color: 'bg-amber-100 text-amber-600' },
          { title: 'View Orders', icon: ViewOrdersIcon, color: 'bg-blue-100 text-blue-600' },
          { title: 'Manage Blog', icon: ManageBlogIcon, color: 'bg-green-100 text-green-600' },
          { title: 'Settings', icon: SettingsIcon, color: 'bg-purple-100 text-purple-600' },
        ].map((action, index) => (
          <motion.button
            key={action.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 + index * 0.1 }}
            className="admin-card p-4 flex flex-col items-center gap-3 hover:border-amber-300 group"
          >
            <div className={`p-3 rounded-lg ${action.color} group-hover:scale-110 transition-transform`}>
              <action.icon className="w-5 h-5" />
            </div>
            <span className="text-sm font-medium text-stone-700">{action.title}</span>
          </motion.button>
        ))}
      </div>
    </div>
  );
}

// Icons
function RevenueIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function OrdersIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
    </svg>
  );
}

function CustomersIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  );
}

function PendingIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function AddProductIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
    </svg>
  );
}

function ViewOrdersIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
    </svg>
  );
}

function ManageBlogIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
    </svg>
  );
}

function SettingsIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}
