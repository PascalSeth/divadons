'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { toast } from 'sonner';

type OrderItem = {
  id: string;
  productName: string;
  quantity: number;
  price: number;
  size?: string;
  color?: string;
};

type Order = {
  id: string;
  status: string;
  total: number;
  trackingId?: string;
  carrierName?: string;
  createdAt: string;
  items: OrderItem[];
};

export default function MyOrdersPage() {
  const { status, data: session } = useSession();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [retryingId, setRetryingId] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'authenticated') {
      fetch('/api/user/orders')
        .then(res => res.json())
        .then(json => {
          if (json.success) setOrders(json.data);
          setLoading(false);
        })
        .catch(err => {
          console.error(err);
          setLoading(false);
        });
    } else if (status === 'unauthenticated') {
      setLoading(false);
    }
  }, [status]);

  const handleRetryPayment = async (orderId: string) => {
    try {
      setRetryingId(orderId);
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          orderId,
          customerEmail: session?.user?.email 
        })
      });
      const data = await res.json();
      if (data.success && data.url) {
        toast.success("Payment session re-initiated. Redirecting...");
        window.location.href = data.url;
      } else {
        toast.error(data.error || 'Failed to re-initiate payment');
      }
    } catch (error) {
      console.error('Retry payment error:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setRetryingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 flex justify-center pt-32">
        <div className="w-8 h-8 rounded-full border-2 border-stone-300 border-t-amber-600 animate-spin"></div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <h1 className="font-serif text-3xl mb-4 text-stone-900">Sign In Required</h1>
          <p className="text-stone-600 mb-8 font-light">Please sign in to view your order history and tracking details.</p>
          <Link href="/login" className="inline-block px-8 py-4 bg-stone-900 text-white text-xs uppercase tracking-widest hover:bg-amber-600 transition-colors">
            Sign In Now
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 pt-32 pb-20 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
          <h1 className="font-serif text-4xl text-stone-900 mb-3">Order History</h1>
          <p className="font-light text-stone-600">Track your recent shipments and view past purchases.</p>
        </motion.div>

        {orders.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-2xl border border-stone-100 shadow-sm">
            <h2 className="font-serif text-2xl text-stone-900 mb-3">No Orders Yet</h2>
            <p className="text-stone-500 mb-8 font-light">Your order history is empty. Start exploring our collections.</p>
            <Link href="/shop" className="inline-block px-8 py-4 border border-stone-900 text-stone-900 text-xs uppercase tracking-widest hover:bg-stone-900 hover:text-white transition-colors">
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <motion.div 
                key={order.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white border border-stone-100 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                {/* Header */}
                <div className="bg-stone-50/50 px-6 py-4 border-b border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <p className="text-xs text-stone-500 uppercase tracking-wider mb-1">Order Placed</p>
                    <p className="font-medium text-stone-900">{new Date(order.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-stone-500 uppercase tracking-wider mb-1">Total Amount</p>
                    <p className="font-medium text-stone-900">
                      {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(order.total)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-stone-500 uppercase tracking-wider mb-1">Order #</p>
                    <p className="font-mono text-stone-700 text-sm">{order.id}</p>
                  </div>
                </div>

                {/* Body */}
                <div className="p-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-6 mb-6">
                    <div className="flex-1">
                      <div className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium capitalize mb-3 ${
                        order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                        order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                        order.status === 'processing' ? 'bg-amber-100 text-amber-800' :
                        'bg-stone-100 text-stone-800'
                      }`}>
                        {order.status === 'pending' ? 'Unpaid' : order.status}
                      </div>
                      
                      {order.trackingId && (
                        <div className="mt-2 text-sm">
                          <span className="text-stone-500">Tracking via {order.carrierName || 'Carrier'}: </span>
                          <span className="font-mono text-stone-900 font-medium">{order.trackingId}</span>
                        </div>
                      )}
                    </div>

                    {order.status === 'pending' && (
                      <button
                        onClick={() => handleRetryPayment(order.id)}
                        disabled={retryingId === order.id}
                        className="px-6 py-2.5 bg-stone-900 text-white text-xs uppercase tracking-widest hover:bg-stone-800 transition-all shadow-sm hover:shadow flex items-center gap-2 disabled:opacity-50"
                      >
                        {retryingId === order.id ? (
                          <>
                            <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            Processing...
                          </>
                        ) : 'Complete Payment'}
                      </button>
                    )}
                  </div>

                  {/* Items list */}
                  <div className="divide-y divide-stone-100 border-t border-stone-100 pt-4 mt-4">
                    {order.items.map((item) => (
                      <div key={item.id} className="py-3 flex justify-between items-center group">
                        <div>
                          <p className="font-medium text-stone-900 group-hover:text-amber-600 transition-colors">{item.productName}</p>
                          <div className="flex gap-3 text-xs text-stone-500 mt-1">
                            {item.size && <span>Size: {item.size}</span>}
                            {item.color && <span>Color: {item.color}</span>}
                            <span>Qty: {item.quantity}</span>
                          </div>
                        </div>
                        <p className="text-sm font-medium text-stone-900">
                           {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(item.price)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
