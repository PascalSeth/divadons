'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useCart } from '@/app/contexts/CartContext'
import { useSession } from 'next-auth/react'
import { formatCurrency } from '@/lib/currency'
import { useSettings } from '@/app/contexts/SettingsContext'

import { toast } from 'sonner'

export default function CartPage() {
  const { items, itemCount, total, removeFromCart, updateQuantity, clearCart } = useCart()
  const { data: session } = useSession()
  const { settings } = useSettings()
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false)

  const handleCheckout = async () => {
    try {
      setIsCheckoutLoading(true)
      
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items,
          customerEmail: session?.user?.email || undefined,
        }),
      })

      const data = await response.json()

      if (data.success && data.url) {
        toast.success('Redirecting to secure checkout...')
        window.location.href = data.url
      } else {
        throw new Error(data.error || 'Failed to initiate checkout')
      }
    } catch (error: unknown) {
      console.error('Checkout error:', error)
      const message = error instanceof Error ? error.message : 'Something went wrong with the checkout process.'
      toast.error(message)
    } finally {
      setIsCheckoutLoading(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-stone-50 pt-24">
        <div className="max-w-4xl mx-auto px-4 py-16">
          <div className="text-center">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-stone-100 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bodoni font-semibold text-stone-900 mb-2">Your Cart is Empty</h1>
            <p className="text-stone-600 mb-8">Looks like you haven&apos;t added anything to your cart yet.</p>
            <Link
              href="/shop"
              className="inline-block px-8 py-3 bg-stone-900 text-white rounded-lg font-medium hover:bg-stone-800 transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-stone-50 pt-24">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bodoni font-semibold text-stone-900">
            Shopping Cart ({itemCount} {itemCount === 1 ? 'item' : 'items'})
          </h1>
          <button
            onClick={clearCart}
            className="text-sm text-stone-500 hover:text-red-600 transition-colors"
          >
            Clear Cart
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-white rounded-lg border border-stone-200 p-4 flex gap-4"
              >
                {/* Product Image */}
                <div className="relative w-24 h-24 sm:w-32 sm:h-32 flex-shrink-0 rounded-lg overflow-hidden bg-stone-100">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover"
                  />
                </div>

                {/* Product Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between gap-2">
                    <h3 className="font-dm font-medium text-stone-900 truncate">{item.name}</h3>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-stone-400 hover:text-red-600 transition-colors flex-shrink-0"
                      aria-label="Remove item"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  {/* Variants */}
                  <div className="mt-1 flex flex-wrap gap-2 text-sm text-stone-500">
                    {item.size && <span>Size: {item.size}</span>}
                    {item.color && (
                      <span className="flex items-center gap-1">
                        Color: 
                        <span 
                          className="inline-block w-4 h-4 rounded-full border border-stone-300" 
                          style={{ backgroundColor: item.color }}
                        />
                      </span>
                    )}
                  </div>

                  {/* Price & Quantity */}
                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-center border border-stone-300 rounded-lg">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="px-3 py-1 text-stone-600 hover:text-stone-900"
                      >
                        −
                      </button>
                      <span className="px-3 py-1 font-dm font-medium text-sm">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="px-3 py-1 text-stone-600 hover:text-stone-900"
                      >
                        +
                      </button>
                    </div>
                    <p className="font-dm font-semibold text-stone-900">
                      {formatCurrency(item.price * item.quantity, settings.currency)}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg border border-stone-200 p-6 sticky top-24">
              <h2 className="text-lg font-bodoni font-semibold text-stone-900 mb-4">Order Summary</h2>
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-stone-600">Subtotal</span>
                  <span className="font-medium">{formatCurrency(total, settings.currency)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-600">Shipping</span>
                  <span className="text-stone-500">Calculated at checkout</span>
                </div>
                <div className="border-t border-stone-200 pt-3 flex justify-between">
                  <span className="font-medium text-stone-900">Total</span>
                  <span className="font-semibold text-lg text-stone-900">{formatCurrency(total, settings.currency)}</span>
                </div>
              </div>

              <button 
                onClick={handleCheckout}
                disabled={isCheckoutLoading}
                className="w-full mt-6 py-3 bg-stone-900 text-white rounded-lg font-medium hover:bg-stone-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isCheckoutLoading ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </>
                ) : (
                  'Proceed to Checkout'
                )}
              </button>

              <Link
                href="/shop"
                className="block text-center mt-4 text-sm text-stone-600 hover:text-stone-900 transition-colors"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
