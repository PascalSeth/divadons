import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { formatCurrency } from '@/lib/currency'

interface Product {
  id: string
  name: string
  price: number | string
  currency?: string
  images?: string[]
  image?: string
  subcategory?: string
  category?: string
}

interface ProductCardProps {
  product: Product
  isHovered: boolean
  onHoverStart: () => void
  onHoverEnd: () => void
  index: number
  categoryColor?: string
  categoryName?: string
}

export function ProductCard({
  product,
  isHovered,
  onHoverStart,
  onHoverEnd,
  index,
  categoryColor = '#78716c',
  categoryName,
}: ProductCardProps) {
  const imageUrl = Array.isArray(product.images) && product.images.length > 0
    ? product.images[0]
    : product.image || ''

  const altImageUrl = Array.isArray(product.images) && product.images.length > 1
    ? product.images[1]
    : imageUrl

  return (
    <Link href={`/products/${product.id}`}>
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ delay: index * 0.05, duration: 0.3 }}
        onHoverStart={onHoverStart}
        onHoverEnd={onHoverEnd}
        className="group relative flex flex-col cursor-pointer"
      >
        {/* Image Container */}
        <div className="relative aspect-[3/4] w-full overflow-hidden bg-stone-100 mb-4 rounded-lg">
          <motion.div
            className="w-full h-full relative"
            initial={{ opacity: 1 }}
            animate={{ opacity: isHovered ? 0 : 1 }}
            transition={{ duration: 0.3 }}
          >
            {imageUrl && (
              <Image
                src={imageUrl}
                alt={product.name}
                fill
                className="object-cover"
                unoptimized
              />
            )}
          </motion.div>

          {isHovered && (
            <motion.div
              className="absolute inset-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              {altImageUrl && (
                <Image
                  src={altImageUrl}
                  alt={`${product.name} alt`}
                  fill
                  className="object-cover"
                  unoptimized
                />
              )}
            </motion.div>
          )}

          {/* Category Badge */}
          <motion.div
            className="absolute bottom-0 left-0 right-0 p-4"
            initial={{ y: '100%' }}
            animate={{ y: isHovered ? 0 : '100%' }}
            transition={{ duration: 0.3 }}
          >
            <div
              className="inline-block px-3 py-1.5 rounded-full text-xs font-dm font-medium uppercase tracking-wider text-white!"
              style={{ backgroundColor: categoryColor }}
            >
              {categoryName || product.category || 'Collection'}
            </div>
          </motion.div>

          {/* Quick View Button */}
          <motion.div
            className="absolute inset-0 flex items-center justify-center bg-black/20"
            initial={{ opacity: 0 }}
            animate={{ opacity: isHovered ? 1 : 0 }}
            transition={{ duration: 0.3 }}
          >
            <motion.button
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: isHovered ? 0 : 10, opacity: isHovered ? 1 : 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white text-stone-900 px-6 py-3 text-xs uppercase tracking-wider font-medium hover:bg-stone-100 transition-colors"
            >
              View Details
            </motion.button>
          </motion.div>
        </div>

        {/* Product Info */}
        <div className="space-y-2 flex-1">
          <h3 className="text-lg font-dm font-medium text-stone-900 group-hover:text-[#D4A574] transition-colors">
            {product.name}
          </h3>
          <div className="flex justify-between items-center text-sm font-dm text-stone-600">
            <span>{product.subcategory || product.category || ''}</span>
            <span className="font-medium text-stone-900">
              {formatCurrency(product.price, product.currency || 'USD')}
            </span>
          </div>

          {/* Hover Line */}
          <motion.div
            className="h-px bg-stone-300 origin-left"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: isHovered ? 1 : 0 }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </motion.div>
    </Link>
  )
}
