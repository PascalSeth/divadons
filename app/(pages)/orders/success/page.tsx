'use client'

import React, { useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useCart } from '@/app/contexts/CartContext'

export default function SuccessPage() {
  const { clearCart } = useCart()
  const [orderRef, setOrderRef] = React.useState<string>('')

  useEffect(() => {
    // Clear cart on successful purchase
    clearCart()
    
    // Safely pull the real order_id from Stripe's redirect URL without throwing SSR errors
    const params = new URLSearchParams(window.location.search)
    const urlOrderId = params.get('order_id')
    
    setOrderRef(urlOrderId || new Date().getTime().toString(36).toUpperCase())
  }, [clearCart])

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center border border-stone-100"
      >
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        
        <h1 className="font-bodoni text-3xl font-semibold text-stone-900 mb-4">Payment Successful!</h1>
        <p className="font-dm text-stone-600 mb-8">
          Thank you for your purchase. We&apos;ve sent a confirmation email to you, and we&apos;ll start preparing your luxury items right away.
        </p>

        <div className="space-y-4">
          <Link 
            href="/shop"
            className="block w-full py-3 bg-stone-900 text-white rounded-lg font-medium hover:bg-stone-800 transition-all shadow-md hover:shadow-lg"
          >
            Continue Shopping
          </Link>
          <Link 
            href="/"
            className="block w-full py-3 bg-white text-stone-900 border border-stone-200 rounded-lg font-medium hover:bg-stone-50 transition-all"
          >
            Back to Home
          </Link>
        </div>
        
        {orderRef && (
          <p className="mt-8 text-xs text-stone-400 font-dm">
            Order reference: {orderRef}
          </p>
        )}
      </motion.div>
    </div>
  )
}
