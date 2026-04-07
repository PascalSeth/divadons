'use client';

import { useEffect, useState } from 'react';
import { Currency } from '@/lib/currency';
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
  DialogTrigger,
} from '@/components/ui/dialog';
import { toast } from 'sonner';

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
  trackingId?: string;
  carrierName?: string;
  shippedAt?: string;
  createdAt: string;
  customer: {
    id: string;
    name: string;
    email: string;
  } | null;
  items: OrderItem[];
  transactions: {
    id: string;
    stripePaymentIntentId: string;
    amount: number;
    status: string;
    createdAt: string;
  }[];
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
  const [activeTab, setActiveTab] = useState<string>('all');

  const [detailOpen, setDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<OrderDetail | null>(null);

  // Fulfillment form local state
  const [fulfillmentForm, setFulfillmentForm] = useState<{
    status: OrderStatus;
    trackingId: string;
    carrierName: string;
  }>({ status: 'pending', trackingId: '', carrierName: '' });

  const [isUpdating, setIsUpdating] = useState(false);
  const [isUpdatingFulfillment, setIsUpdatingFulfillment] = useState(false);

  useEffect(() => {
    if (selectedOrder) {
      setFulfillmentForm({
        status: selectedOrder.status,
        trackingId: selectedOrder.trackingId || '',
        carrierName: selectedOrder.carrierName || '',
      });
    }
  }, [selectedOrder]);

  const handleFulfillmentUpdate = async () => {
    if (!selectedOrder) return;
    
    // Special validation for Shipped status
    if (fulfillmentForm.status === 'shipped' && (!fulfillmentForm.trackingId.trim() || !fulfillmentForm.carrierName.trim())) {
      toast.error('CARRIER NAME AND TRACKING ID ARE REQUIRED FOR SHIPPING');
      return;
    }

    try {
      setIsUpdatingFulfillment(true);
      await updateOrder(selectedOrder.id, {
        status: fulfillmentForm.status,
        trackingId: fulfillmentForm.trackingId.trim(),
        carrierName: fulfillmentForm.carrierName.trim(),
      });
    } finally {
      setIsUpdatingFulfillment(false);
    }
  };

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const res = await fetch('/api/orders?page=1&pageSize=100');
        const json = (await res.json()) as ApiSuccess<OrderSummary[]> | ApiError;
        if (!json.success) throw new Error(json.error);
        setOrders(json.data);
      } catch (e: unknown) {
        const errorMessage = e instanceof Error ? e.message : 'Failed to load orders';
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // Stats Derived from Data
  const today = new Date().toLocaleDateString();
  const stats = {
    todayRevenue: orders
      .filter(o => new Date(o.createdAt).toLocaleDateString() === today && o.status !== 'cancelled' && o.status !== 'pending')
      .reduce((acc, o) => acc + Number(o.total), 0),
    pendingFulfillment: orders.filter(o => o.status === 'processing').length,
    unpaidCount: orders.filter(o => o.status === 'pending').length,
    totalActive: orders.length,
  };

  const filteredOrders = activeTab === 'all' 
    ? orders // Show ALL orders by default, including pending ones.
    : orders.filter((o) => o.status === activeTab);

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
      toast.error(errorMessage);
      setDetailOpen(false);
    } finally {
      setDetailLoading(false);
    }
  };

  const updateOrder = async (id: string, data: Partial<OrderDetail>) => {
    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const json = (await res.json()) as ApiSuccess<OrderDetail> | ApiError;
      if (!json.success) {
        toast.error(json.error);
        return;
      }

      // Merge data to prevent state corruption
      setOrders((prev) =>
        prev.map((o) => (o.id === id ? { ...o, ...json.data } : o)),
      );
      if (selectedOrder && selectedOrder.id === id) {
        setSelectedOrder((prev) => prev ? { ...prev, ...json.data } : json.data);
      }
      toast.success('Order status updated');
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : 'Failed to update order';
      toast.error(errorMessage);
    }
  };

  const cancelOrder = async (id: string) => {
    if (!window.confirm('Cancel this order?')) return;
    try {
      const res = await fetch(`/api/orders/${id}`, { method: 'DELETE' });
      const json = (await res.json()) as ApiSuccess<OrderDetail> | ApiError;
      if (!json.success) {
        toast.error(json.error);
        return;
      }

      setOrders((prev) =>
        prev.map((o) => (o.id === id ? { ...o, ...json.data } : o)),
      );
      if (selectedOrder && selectedOrder.id === id) {
        setSelectedOrder((prev) => prev ? { ...prev, ...json.data } : json.data);
      }
      toast.success('Order successfully cancelled');
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : 'Failed to cancel order';
      toast.error(errorMessage);
    }
  };

  const confirmManualPayment = async (id: string) => {
    if (!window.confirm('Are you sure you want to manually mark this order as PAID? This will trigger inventory deduction and notifications.')) return;
    try {
      setIsUpdating(true);
      const res = await fetch(`/api/orders/${id}/confirm`, { 
        method: 'POST'
      });
      const json = (await res.json()) as ApiSuccess<OrderDetail> | ApiError;
      
      if (!json.success) throw new Error(json.error);
      
      toast.success('Order marked as paid & processed!');
      
      // Update local state
      setOrders(prev => prev.map(o => o.id === id ? { ...o, status: 'processing' } : o));
      if (selectedOrder?.id === id) {
        setSelectedOrder(prev => prev ? { ...prev, status: 'processing' } : null);
      }
    } catch (e: any) {
      toast.error(e.message || 'Failed to confirm payment');
    } finally {
      setIsUpdating(false);
    }
  };

  const handlePrint = () => {
      window.print();
  };

  return (
    <div className="space-y-6">
      {/* 1. Header & Quick Stats */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 print:hidden">
        <div>
          <h1 className="text-3xl font-serif text-stone-900 leading-tight">Order Management</h1>
          <p className="text-sm text-stone-500 font-light mt-1 uppercase tracking-widest">Fulfillment & Revenue Hub</p>
        </div>
        
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 w-full lg:w-auto">
           <div className="bg-white border border-stone-200 px-5 py-3 rounded-xl shadow-sm">
             <p className="text-[10px] uppercase tracking-tighter text-stone-400 font-bold mb-1">Today's Revenue</p>
             <p className="text-xl font-mono text-stone-900">${stats.todayRevenue.toFixed(2)}</p>
           </div>
           <div className="bg-white border border-stone-200 px-5 py-3 rounded-xl shadow-sm">
             <p className="text-[10px] uppercase tracking-tighter text-stone-400 font-bold mb-1">To Fulfill</p>
             <p className="text-xl font-mono text-amber-600 font-bold">{stats.pendingFulfillment}</p>
           </div>
           <div className="bg-white border border-stone-200 px-5 py-3 rounded-xl shadow-sm">
             <p className="text-[10px] uppercase tracking-tighter text-stone-400 font-bold mb-1">Unpaid orders</p>
             <p className="text-xl font-mono text-stone-500">{stats.unpaidCount}</p>
           </div>
           <div className="bg-white border border-stone-200 px-5 py-3 rounded-xl shadow-sm">
             <p className="text-[10px] uppercase tracking-tighter text-stone-400 font-bold mb-1">Active Sales</p>
             <p className="text-xl font-mono text-stone-900">{stats.totalActive}</p>
           </div>
        </div>
      </div>

      {/* 2. Workspace Tabs */}
      <div className="print:hidden">
         <div className="flex items-center gap-1 bg-stone-100/50 p-1 rounded-xl border border-stone-200 w-fit">
            {[
               { id: 'all', label: 'All Activity' },
               { id: 'processing', label: 'Processing' },
               { id: 'shipped', label: 'Shipped' },
               { id: 'delivered', label: 'Delivered' },
               { id: 'pending', label: 'Unpaid (Pending)' },
               { id: 'cancelled', label: 'Cancelled' },
             ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 text-[11px] uppercase tracking-wider font-bold rounded-lg transition-all ${
                  activeTab === tab.id 
                  ? 'bg-white text-stone-900 shadow-sm border border-stone-200' 
                  : 'text-stone-400 hover:text-stone-600'
                }`}
              >
                {tab.label}
              </button>
            ))}
         </div>
      </div>

      {/* 3. Main Orders Workspace */}
      <div className="admin-card overflow-hidden print:hidden">
        <Table>
          <TableHeader className="bg-stone-50/50">
            <TableRow>
              <TableHead className="text-[10px] uppercase tracking-widest font-bold">Ref</TableHead>
              <TableHead className="text-[10px] uppercase tracking-widest font-bold">Details</TableHead>
              <TableHead className="text-[10px] uppercase tracking-widest font-bold">Revenue</TableHead>
              <TableHead className="text-[10px] uppercase tracking-widest font-bold">State</TableHead>
              <TableHead className="text-[10px] uppercase tracking-widest font-bold">Placed</TableHead>
              <TableHead className="text-right text-[10px] uppercase tracking-widest font-bold">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading && (
              <TableRow>
                <TableCell colSpan={6} className="h-64 text-center">
                   <div className="flex flex-col items-center gap-3">
                      <div className="w-6 h-6 border-2 border-stone-200 border-t-amber-600 rounded-full animate-spin"></div>
                      <span className="text-xs text-stone-400 uppercase tracking-widest">Syncing Orders...</span>
                   </div>
                </TableCell>
              </TableRow>
            )}
            {!loading && filteredOrders.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="h-64 text-center text-stone-400 text-xs italic">
                  No orders found in this category.
                </TableCell>
              </TableRow>
            )}
            {!loading && filteredOrders.map((o) => (
              <TableRow key={o.id} className="group hover:bg-stone-50/50 transition-colors">
                <TableCell className="font-mono text-[11px] text-stone-500">
                  {o.id}
                </TableCell>
                <TableCell>
                  <div className="space-y-0.5">
                    <p className="text-sm font-medium text-stone-900">{o.customer?.name ?? 'Guest User'}</p>
                    <p className="text-[10px] text-stone-400 font-mono tracking-tight">{o.customer?.email ?? '—'}</p>
                  </div>
                </TableCell>
                <TableCell className="font-mono text-sm font-semibold text-stone-900">
                  ${Number(o.total).toFixed(2)}
                </TableCell>
                <TableCell>
                   <span className={`px-2.5 py-1 rounded-full text-[10px] uppercase tracking-tight font-bold ${
                     o.status === 'delivered' ? 'bg-green-50 text-green-700' :
                     o.status === 'shipped' ? 'bg-blue-50 text-blue-700' :
                     o.status === 'processing' ? 'bg-amber-50 text-amber-700' :
                     o.status === 'pending' ? 'bg-stone-100 text-stone-500' :
                     'bg-red-50 text-red-700'
                   }`}>
                     {o.status}
                   </span>
                </TableCell>
                <TableCell className="text-[11px] text-stone-500 font-mono">
                  {new Date(o.createdAt).toLocaleDateString()}
                  <span className="block text-[9px] text-stone-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    {new Date(o.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                   <div className="flex justify-end gap-2 pr-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="outline" size="xs" onClick={() => openDetail(o.id)} className="h-7 px-3 text-[10px] uppercase tracking-tighter hover:bg-stone-900 hover:text-white transition-all">Profile</Button>
                      {o.status !== 'cancelled' && (
                        <button onClick={() => cancelOrder(o.id)} className="p-1.5 text-stone-300 hover:text-red-500 transition-colors">
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                      )}
                   </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* 4. Professional Detail Slide-Over (Custom styling for Dialog) */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="sm:max-w-2xl h-screen top-0 right-0 left-auto translate-x-0 translate-y-0 rounded-none border-l border-stone-200 shadow-2xl p-0 overflow-hidden flex flex-col bg-[#fdfcf9] print:bg-white print:shadow-none print:border-none print:w-full print:h-auto print:static" showCloseButton={false}>
          <DialogTitle className="sr-only">Order Details - {selectedOrder?.id}</DialogTitle>
          <div className="flex-1 overflow-y-auto custom-scrollbar">
              {detailLoading ? (
                <div className="h-full flex items-center justify-center p-12">
                   <div className="w-8 h-8 border-2 border-stone-200 border-t-amber-600 rounded-full animate-spin"></div>
                </div>
              ) : selectedOrder && (
                <div className="p-8 space-y-8">
                  {/* DETAIL HEADER */}
                  <div className="flex justify-between items-start border-b border-stone-100 pb-8">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                           <h2 className="text-2xl font-serif text-stone-900">{selectedOrder.id}</h2>
                           <span className={`px-2.5 py-1 rounded-md text-[10px] uppercase tracking-widest font-bold ${
                              selectedOrder.status === 'delivered' ? 'bg-green-100 text-green-700' :
                              selectedOrder.status === 'shipped' ? 'bg-blue-100 text-blue-700' :
                              selectedOrder.status === 'processing' ? 'bg-amber-100 text-amber-700' :
                              'bg-stone-200 text-stone-600'
                           }`}>
                             {selectedOrder.status}
                           </span>
                        </div>
                        <p className="text-xs text-stone-400 font-mono">Placed on {new Date(selectedOrder.createdAt).toLocaleString()}</p>
                    </div>
                    <div className="flex gap-2 print:hidden">
                       <Button onClick={handlePrint} variant="outline" size="sm" className="h-9 px-4 text-xs font-bold border-stone-200 hover:bg-stone-50">Print Invoice</Button>
                       <Button variant="outline" size="sm" className="h-9 w-9 p-0 border-stone-200" onClick={() => setDetailOpen(false)}>×</Button>
                    </div>
                  </div>

                  {/* 1. VISUAL ORDER TIMELINE */}
                  <div className="relative print:hidden">
                     <p className="text-[10px] uppercase tracking-widest text-stone-400 font-bold mb-6">Order Journey</p>
                     <div className="flex items-center justify-between">
                        {[
                          { id: 'pending', label: 'Placed', icon: '✨' },
                          { id: 'processing', label: 'Paid', icon: '💰' },
                          { id: 'shipped', label: 'Shipped', icon: '📦' },
                          { id: 'delivered', label: 'Delivered', icon: '🤝' },
                        ].map((step, idx, arr) => {
                           const activeIndex = arr.findIndex(s => s.id === selectedOrder.status);
                           const isDone = idx <= activeIndex || (selectedOrder.status === 'processing' && idx === 0);
                           return (
                             <div key={step.id} className="flex flex-col items-center gap-3 relative z-10">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm transition-all duration-500 ${
                                  isDone ? 'bg-stone-900 text-white shadow-lg shadow-stone-200 scale-110' : 'bg-stone-100 text-stone-300'
                                }`}>
                                   {step.icon}
                                </div>
                                <span className={`text-[10px] font-bold uppercase tracking-tight ${isDone ? 'text-stone-900' : 'text-stone-300'}`}>{step.label}</span>
                                {idx < arr.length - 1 && (
                                   <div className={`absolute top-4 left-1/2 w-full h-[2px] -z-10 transition-colors duration-1000 ${
                                     isDone ? 'bg-stone-900/10' : 'bg-stone-100'
                                   }`} style={{ width: '100vw', maxWidth: '120px' }} />
                                )}
                             </div>
                           )
                        })}
                     </div>
                  </div>

                  <div className="grid grid-cols-2 gap-8">
                     {/* 2. CUSTOMER DETAILS */}
                     <div className="space-y-4">
                        <p className="text-[10px] uppercase tracking-widest text-stone-400 font-bold">Customer Details</p>
                        <div className="bg-white border border-stone-100 p-4 rounded-xl shadow-sm space-y-3">
                           <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-stone-900 text-amber-500 flex items-center justify-center font-bold text-xs">
                                {selectedOrder.customer?.name?.[0].toUpperCase() || 'G'}
                              </div>
                              <div>
                                 <p className="text-sm font-medium text-stone-900">{selectedOrder.customer?.name || 'Guest Customer'}</p>
                                 <p className="text-[10px] text-stone-500 font-mono">{selectedOrder.customer?.email || 'No email'}</p>
                              </div>
                           </div>
                           <div className="pt-2 border-t border-stone-50 flex items-center gap-2">
                              <span className="text-[10px] uppercase font-bold text-stone-400">Auth Method:</span>
                              <span className="text-[10px] font-mono text-stone-600">Stripe/NextAuth</span>
                           </div>
                        </div>

                        {/* MANUAL OVERRIDE (Only for Pending Orders) */}
                        {selectedOrder.status === 'pending' && (
                           <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl space-y-3">
                              <div className="flex items-center gap-2">
                                 <span className="text-sm">⚠️</span>
                                 <p className="text-[10px] uppercase font-bold text-blue-900">Manual Payment Override</p>
                              </div>
                              <p className="text-[10px] text-blue-700/80 leading-relaxed font-medium">
                                 Payment hasn't been confirmed via Stripe yet. If you've received payment manually or the webhook failed, you can force-fulfill this order.
                              </p>
                              <Button 
                                 onClick={() => confirmManualPayment(selectedOrder.id)}
                                 disabled={isUpdating}
                                 className="w-full h-8 bg-blue-600 hover:bg-blue-700 text-white text-[9px] uppercase tracking-wider font-bold shadow-sm"
                              >
                                 {isUpdating ? 'Unlocking Order...' : 'Confirm Payment Received'}
                              </Button>
                           </div>
                        )}
                     </div>

                     {/* 3. FULFILLMENT ACTIONS */}
                     <div className="space-y-4 print:hidden">
                        <p className="text-[10px] uppercase tracking-widest text-stone-400 font-bold">Quick Workflow</p>
                        <div className="bg-amber-50/50 border border-amber-100 p-4 rounded-xl space-y-4">
                             <div className="space-y-1">
                                <label className="text-[10px] uppercase font-bold text-amber-900/60">Update Status</label>
                                <select
                                  className="w-full h-10 px-3 bg-white border border-amber-100 rounded-lg text-xs font-bold outline-none ring-amber-200 focus:ring-2 transition-all"
                                  value={fulfillmentForm.status}
                                  onChange={(e) => setFulfillmentForm(prev => ({ ...prev, status: e.target.value as OrderStatus }))}
                                >
                                  {STATUS_OPTIONS.map((s) => (
                                    <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                                  ))}
                                </select>
                             </div>

                             <div className="space-y-1">
                                <label className="text-[10px] uppercase font-bold text-amber-900/60">Tracking ID</label>
                                <input
                                   type="text"
                                   className={`w-full h-10 px-3 bg-white border rounded-lg text-xs font-mono outline-none ring-amber-200 focus:ring-2 transition-all ${
                                     fulfillmentForm.status === 'shipped' && !fulfillmentForm.trackingId 
                                     ? 'border-amber-400 bg-amber-50/10' 
                                     : 'border-amber-100'
                                   }`}
                                   placeholder="Enter Tracking ID..."
                                   value={fulfillmentForm.trackingId}
                                   onChange={(e) => setFulfillmentForm(prev => ({ ...prev, trackingId: e.target.value }))}
                                />
                             </div>

                             <div className="space-y-1">
                                <label className="text-[10px] uppercase font-bold text-amber-900/60">Carrier Name</label>
                                <input
                                   type="text"
                                   className={`w-full h-10 px-3 bg-white border rounded-lg text-xs font-bold outline-none ring-amber-200 focus:ring-2 transition-all ${
                                     fulfillmentForm.status === 'shipped' && !fulfillmentForm.carrierName 
                                     ? 'border-amber-400 bg-amber-50/10' 
                                     : 'border-amber-100'
                                   }`}
                                   placeholder="FedEx, UPS, DHL..."
                                   value={fulfillmentForm.carrierName}
                                   onChange={(e) => setFulfillmentForm(prev => ({ ...prev, carrierName: e.target.value }))}
                                />
                             </div>

                             <Button 
                               onClick={handleFulfillmentUpdate}
                               disabled={isUpdatingFulfillment}
                               className="w-full h-10 bg-amber-600 hover:bg-amber-700 text-white text-[10px] uppercase tracking-widest font-black shadow-lg shadow-amber-900/10 disabled:opacity-50 disabled:cursor-not-allowed"
                             >
                               {isUpdatingFulfillment ? (
                                 <span className="flex items-center gap-2">
                                   <svg className="animate-spin h-3 w-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                     <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                     <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                   </svg>
                                   Applying...
                                 </span>
                               ) : (
                                 "Apply Fulfillment Setup"
                               )}
                             </Button>
                        </div>
                     </div>
                  </div>

                  {/* 4. ITEMS TABLE */}
                  <div className="space-y-4">
                     <div className="flex items-center justify-between">
                        <p className="text-[10px] uppercase tracking-widest text-stone-400 font-bold font-mono">Invoice Items</p>
                        <span className="text-[10px] font-mono font-bold text-stone-900 bg-stone-100 px-2 py-0.5 rounded">{selectedOrder.items.length} units</span>
                     </div>
                     <div className="bg-white border border-stone-200 rounded-xl overflow-hidden shadow-sm">
                        <Table>
                          <TableHeader className="bg-stone-50/50">
                             <TableRow>
                               <TableHead className="text-[9px] uppercase font-bold">Product</TableHead>
                               <TableHead className="text-[9px] uppercase font-bold text-center">Attributes</TableHead>
                               <TableHead className="text-[9px] uppercase font-bold text-right">Price</TableHead>
                             </TableRow>
                          </TableHeader>
                          <TableBody>
                             {selectedOrder.items.map((item) => (
                               <TableRow key={item.id} className="border-stone-100">
                                 <TableCell className="py-4">
                                   <div className="flex items-center gap-3">
                                      <div className="w-10 h-10 bg-stone-50 rounded-lg flex items-center justify-center text-xs font-bold text-stone-300">PFG</div>
                                      <div>
                                         <p className="text-xs font-bold text-stone-900">{item.productName}</p>
                                         <p className="text-[9px] text-stone-400 font-mono">Qty: {item.quantity}</p>
                                      </div>
                                   </div>
                                 </TableCell>
                                 <TableCell className="py-4 text-center">
                                    <div className="flex flex-col gap-1 items-center">
                                       {item.size && <span className="text-[9px] bg-stone-100 px-1.5 py-0.5 rounded font-bold text-stone-600">SZ: {item.size}</span>}
                                       {item.color && <span className="text-[9px] bg-stone-100 px-1.5 py-0.5 rounded font-bold text-stone-600">CL: {item.color}</span>}
                                    </div>
                                 </TableCell>
                                 <TableCell className="py-4 text-right font-mono text-xs font-bold text-stone-900">
                                   ${Number(item.price).toFixed(2)}
                                 </TableCell>
                               </TableRow>
                             ))}
                          </TableBody>
                        </Table>
                        <div className="bg-stone-50/80 p-6 flex justify-end">
                           <div className="w-full max-w-[200px] space-y-2">
                              <div className="flex justify-between text-xs text-stone-500">
                                 <span>Subtotal</span>
                                 <span className="font-mono font-medium">${Number(selectedOrder.total).toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between text-xs text-stone-500">
                                 <span>Shipping</span>
                                 <span className="font-mono font-medium">$0.00</span>
                              </div>
                              <div className="flex justify-between text-sm font-bold text-stone-900 border-t border-stone-200 pt-2">
                                 <span className="uppercase tracking-tighter">Total</span>
                                 <span className="font-mono leading-none">${Number(selectedOrder.total).toFixed(2)}</span>
                              </div>
                           </div>
                        </div>
                     </div>
                  </div>

                  {/* 5. PAYMENT HISTORY */}
                  <div className="space-y-4 print:hidden">
                    <p className="text-[10px] uppercase tracking-widest text-stone-400 font-bold">Stripe Transaction History</p>
                    <div className="space-y-2">
                      {selectedOrder.transactions && selectedOrder.transactions.length > 0 ? (
                        selectedOrder.transactions.map((t) => (
                           <div key={t.id} className="bg-[#f0ebe0]/50 border border-stone-200 p-4 rounded-xl flex items-center justify-between group">
                              <div className="flex items-center gap-3">
                                 <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-stone-400">⚡</div>
                                 <div>
                                    <p className="text-[10px] font-mono font-bold text-stone-900">{t.stripePaymentIntentId}</p>
                                    <p className="text-[9px] text-stone-400 uppercase tracking-tighter font-bold">{new Date(t.createdAt).toLocaleString()}</p>
                                 </div>
                              </div>
                              <div className="text-right">
                                 <p className="text-xs font-bold text-stone-900 font-mono">${(Number(t.amount) / 100).toFixed(2)}</p>
                                 <span className="text-[8px] uppercase tracking-widest font-black text-green-600">{t.status}</span>
                              </div>
                           </div>
                        ))
                      ) : (
                        <div className="p-8 text-center border-2 border-dashed border-stone-200 rounded-2xl text-xs text-stone-400 italic">
                           No live transactions recorded for this profile.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
          </div>
        </DialogContent>
      </Dialog>

      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print-content, .print-content * {
            visibility: visible;
          }
          .print-content {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .print-hidden {
            display: none !important;
          }
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e5e5e5;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #d4d4d4;
        }
      `}</style>
    </div>
  );
}

