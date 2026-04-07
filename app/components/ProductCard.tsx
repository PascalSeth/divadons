import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { formatCurrency } from '@/lib/currency'
import { useSettings } from '@/app/contexts/SettingsContext'
import { useWishlist } from '@/app/contexts/WishlistContext'
import { Heart } from 'lucide-react'
import { QuickAddModal } from './QuickAddModal'
import { toast } from 'sonner'

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
}: ProductCardProps) {
  const { settings } = useSettings();
  const { toggleWishlist, isInWishlist } = useWishlist();
  
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  
  const inWishlist = isInWishlist(product.id);
  
  const imageUrl = Array.isArray(product.images) && product.images.length > 0
    ? product.images[0]
    : product.image || ''

  const altImageUrl = Array.isArray(product.images) && product.images.length > 1
    ? product.images[1]
    : imageUrl

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const isAdded = toggleWishlist({
      productId: product.id,
      name: product.name,
      price: Number(product.price),
      image: imageUrl,
    });
    
    if (isAdded) {
      toast.success('Added to Wishlist!');
    } else {
      toast.info('Removed from Wishlist.');
    }
  };

  const handleQuickAddClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsQuickAddOpen(true);
  };

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ delay: index * 0.05, duration: 0.3 }}
        onHoverStart={onHoverStart}
        onHoverEnd={onHoverEnd}
        className="group relative flex flex-col"
      >
        {/* Image Container - Borderless and clean */}
        <div className="relative aspect-[3/4] w-full overflow-hidden bg-stone-100 mb-4 rounded-xl shadow-sm transition-shadow duration-300 group-hover:shadow-md">
          {/* Wishlist Button - Top Right Floating */}
          <button 
            onClick={handleWishlistToggle}
            className="absolute top-3 right-3 z-20 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center shadow-sm hover:scale-110 transition-all focus:outline-none"
            title="Add to Wishlist"
          >
            <Heart 
              className={`w-4 h-4 transition-colors ${inWishlist ? 'fill-pink-500 text-pink-500' : 'text-stone-500 group-hover:text-stone-900'}`} 
            />
          </button>
          
          <Link href={`/products/${product.id}`} className="block w-full h-full group/link">
            <div className="w-full h-full relative">
              {/* Primary Image */}
              {imageUrl && (
                <Image
                  src={imageUrl}
                  alt={product.name}
                  fill
                  className={`object-cover transition-all duration-700 ease-[0.25,0.1,0.25,1.0] ${
                    isHovered && altImageUrl !== imageUrl ? 'opacity-0 scale-105' : 'opacity-100 scale-100'
                  }`}
                  unoptimized
                />
              )}

              {/* Alternate Image (Hidden strictly via opacity unless hovered) */}
              {altImageUrl && altImageUrl !== imageUrl && (
                <Image
                  src={altImageUrl}
                  alt={`${product.name} alt`}
                  fill
                  className={`object-cover absolute inset-0 transition-all duration-700 ease-[0.25,0.1,0.25,1.0] ${
                    isHovered ? 'opacity-100 scale-100' : 'opacity-0 scale-[0.97]'
                  }`}
                  unoptimized
                />
              )}
            </div>
          </Link>

          {/* Quick Add Bottom Slide-Up Action */}
          <motion.div
            className="absolute bottom-0 left-0 right-0 p-3 z-10"
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: isHovered ? 0 : '100%', opacity: isHovered ? 1 : 0 }}
            transition={{ duration: 0.3, ease: "backOut" }}
          >
            <button
              onClick={handleQuickAddClick}
              className="w-full bg-black/80 backdrop-blur-md text-white font-dm text-xs uppercase tracking-[0.15em] font-medium py-3.5 px-4 rounded-lg hover:bg-black transition-colors shadow-lg flex items-center justify-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 9h14l1 10H4L5 9z"/><path d="M9 9V5a3 3 0 0 1 6 0v4"/></svg>
              Quick Add
            </button>
          </motion.div>
        </div>

        {/* Product Info below image */}
        <Link href={`/products/${product.id}`} className="block space-y-1.5 focus:outline-none">
          <div className="flex justify-between items-start gap-4">
            <h3 className="text-sm font-dm font-medium text-stone-900 leading-tight group-hover:text-amber-700 transition-colors line-clamp-2 pr-2">
              {product.name}
            </h3>
            <span className="font-mono font-medium text-sm text-stone-900 shrink-0">
              {formatCurrency(product.price, product.currency || settings.currency)}
            </span>
          </div>
          
          {/* Subtle Subtitle/Category */}
          {(product.subcategory || product.category) && (
             <p className="text-[10px] uppercase tracking-widest text-stone-400 font-medium">
               {product.subcategory || product.category}
             </p>
          )}

          {/* Elegant Hover Line underneath the title area (replacing old generic line) */}
          <motion.div
            className="h-[1px] bg-amber-700/30 origin-left mt-2"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: isHovered ? 1 : 0 }}
            transition={{ duration: 0.3 }}
          />
        </Link>
      </motion.div>

      {/* The Modal */}
      <QuickAddModal
        isOpen={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
        productId={product.id}
        productName={product.name}
        productPrice={product.price}
        productImage={imageUrl}
        currency={product.currency || settings.currency}
      />
    </>
  )
}
