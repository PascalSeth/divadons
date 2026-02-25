'use client'

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useWishlist } from '@/app/contexts/WishlistContext'
import { useCart } from '@/app/contexts/CartContext'

export default function WishlistPage() {
  const { items, itemCount, removeFromWishlist, clearWishlist } = useWishlist()
  const { addToCart } = useCart()

  const handleAddToCart = (item: typeof items[0]) => {
    addToCart({
      productId: item.productId,
      name: item.name,
      price: item.price,
      image: item.image,
      quantity: 1,
    })
  }

  const handleMoveToCart = (item: typeof items[0]) => {
    handleAddToCart(item)
    removeFromWishlist(item.productId)
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-stone-50 pt-24">
        <div className="max-w-4xl mx-auto px-4 py-16">
          <div className="text-center">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-stone-100 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bodoni font-semibold text-stone-900 mb-2">Your Wishlist is Empty</h1>
            <p className="text-stone-600 mb-8">Save items you love by clicking the heart icon on any product.</p>
            <Link
              href="/shop"
              className="inline-block px-8 py-3 bg-stone-900 text-white rounded-lg font-medium hover:bg-stone-800 transition-colors"
            >
              Explore Products
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
            My Wishlist ({itemCount} {itemCount === 1 ? 'item' : 'items'})
          </h1>
          <button
            onClick={clearWishlist}
            className="text-sm text-stone-500 hover:text-red-600 transition-colors"
          >
            Clear All
          </button>
        </div>

        {/* Wishlist Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {items.map((item) => (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-lg border border-stone-200 overflow-hidden group"
            >
              {/* Product Image */}
              <Link href={`/products/${item.productId}`} className="relative aspect-square block overflow-hidden bg-stone-100">
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {/* Remove Button */}
                <button
                  onClick={(e) => {
                    e.preventDefault()
                    removeFromWishlist(item.productId)
                  }}
                  className="absolute top-3 right-3 w-8 h-8 bg-white rounded-full shadow flex items-center justify-center text-red-500 hover:bg-red-50 transition-colors"
                  aria-label="Remove from wishlist"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </button>
              </Link>

              {/* Product Details */}
              <div className="p-4">
                <Link href={`/products/${item.productId}`}>
                  <h3 className="font-dm font-medium text-stone-900 truncate hover:text-stone-700 transition-colors">
                    {item.name}
                  </h3>
                </Link>
                <p className="font-dm font-semibold text-stone-900 mt-1">
                  GHS {item.price.toFixed(2)}
                </p>

                {/* Action Buttons */}
                <div className="mt-4 space-y-2">
                  <button
                    onClick={() => handleMoveToCart(item)}
                    className="w-full py-2 bg-stone-900 text-white text-sm font-medium rounded-lg hover:bg-stone-800 transition-colors"
                  >
                    Move to Cart
                  </button>
                  <button
                    onClick={() => handleAddToCart(item)}
                    className="w-full py-2 border border-stone-300 text-stone-700 text-sm font-medium rounded-lg hover:border-stone-400 transition-colors"
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
