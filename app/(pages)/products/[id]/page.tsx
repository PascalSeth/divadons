'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useCart } from '@/app/contexts/CartContext'
import { useWishlist } from '@/app/contexts/WishlistContext'

interface Product {
  id: string
  name: string
  price: number
  description?: string
  images: string[]
  category?: { id: string; name: string }
  categoryId?: string
  subcategory?: string
  color?: string
  sizes?: string[]
  featured?: boolean
  bestseller?: boolean
  stock?: number
  vegan?: boolean
  concern?: string
  createdAt?: string
}

interface RelatedProduct {
  id: string
  name: string
  price: number | string
  images: string[]
}

interface Review {
  id: string
  customerName: string
  rating: number
  title: string
  comment: string
  verified?: boolean
  createdAt: string
}

export default function ProductDetailPage() {
  const params = useParams()
  const productId = params.id as string
  const { addToCart } = useCart()
  const { isInWishlist, toggleWishlist } = useWishlist()
  const [product, setProduct] = useState<Product | null>(null)
  const [relatedProducts, setRelatedProducts] = useState<RelatedProduct[]>([])
  const [selectedImage, setSelectedImage] = useState(0)
  const [selectedSize, setSelectedSize] = useState('')
  const [selectedColor] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [loading, setLoading] = useState(true)
  const [addedToCart, setAddedToCart] = useState(false)
  const [wishlistAnimating, setWishlistAnimating] = useState(false)
  const [reviews, setReviews] = useState<Review[]>([])
  const [averageRating, setAverageRating] = useState(0)
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [reviewForm, setReviewForm] = useState({
    customerName: '',
    email: '',
    rating: 5,
    title: '',
    comment: '',
  })
  const [submittingReview, setSubmittingReview] = useState(false)

  // Fetch product details
  useEffect(() => {
    async function loadProduct() {
      try {
        const res = await fetch(`/api/products/${encodeURIComponent(productId)}`)
        const json = await res.json()
        if (json.success && json.data) {
          const product = json.data
          setProduct({
            id: product.id,
            name: product.name,
            price: typeof product.price === 'number' ? product.price : parseFloat(String(product.price)) || 0,
            description: product.description || '',
            images: Array.isArray(product.images) ? product.images : [product.images || ''].filter(Boolean),
            category: product.category,
            categoryId: product.categoryId,
            subcategory: product.subcategory,
            color: product.color,
            sizes: Array.isArray(product.sizes) ? product.sizes : [],
            featured: product.featured,
            bestseller: product.bestseller,
            stock: product.stock,
            vegan: product.vegan,
            concern: product.concern,
            createdAt: product.createdAt,
          })
          setSelectedImage(0)

          // Fetch related products from same category
          if (product.categoryId) {
            try {
              const relRes = await fetch(`/api/products?category=${product.categoryId}&pageSize=4`)
              const relJson = await relRes.json()
              if (relJson.success && Array.isArray(relJson.data)) {
                const filtered = relJson.data
                  .filter((p: Product) => p.id !== productId)
                  .slice(0, 3)
                  .map((p: Product) => ({
                    id: p.id,
                    name: p.name,
                    price: p.price,
                    images: Array.isArray(p.images) ? p.images : [p.images || ''].filter(Boolean),
                  }))
                setRelatedProducts(filtered)
              }
            } catch {
              // ignore
            }
          }
        }
      } catch {
        // ignore
      } finally {
        setLoading(false)
      }
    }

    if (productId) loadProduct()
  }, [productId])

  // Fetch reviews
  useEffect(() => {
    async function loadReviews() {
      try {
        const res = await fetch(`/api/reviews?productId=${encodeURIComponent(productId)}`)
        const json = await res.json()
        if (json.success && Array.isArray(json.data)) {
          setReviews(json.data)
          setAverageRating(json.averageRating || 0)
        }
      } catch {
        // ignore
      }
    }

    if (productId) loadReviews()
  }, [productId])

  const handleAddToCart = () => {
    if (!product) return
    
    addToCart({
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.images?.[0] || '/placeholder.jpg',
      quantity,
      size: selectedSize || undefined,
      color: selectedColor || undefined,
    })
    
    setAddedToCart(true)
    setTimeout(() => setAddedToCart(false), 2000)
  }

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!reviewForm.customerName || !reviewForm.email || !reviewForm.title || !reviewForm.comment) {
      alert('Please fill in all fields')
      return
    }

    setSubmittingReview(true)
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId,
          ...reviewForm,
        }),
      })

      const json = await res.json()
      if (json.success) {
        setReviews([json.data, ...(reviews || [])])
        const currentReviews = reviews || []
        const newAvg =
          (averageRating * currentReviews.length + reviewForm.rating) /
          (currentReviews.length + 1)
        setAverageRating(parseFloat(newAvg.toFixed(1)))
        setReviewForm({
          customerName: '',
          email: '',
          rating: 5,
          title: '',
          comment: '',
        })
        setShowReviewForm(false)
      }
    } catch {
      alert('Failed to submit review')
    } finally {
      setSubmittingReview(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FDFCFB]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-stone-200 border-t-stone-900 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-stone-500 font-dm">Loading product...</p>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FDFCFB]">
        <div className="text-center">
          <h1 className="text-2xl font-baskerville font-bold text-stone-900 mb-4">Product Not Found</h1>
          <Link href="/shop" className="text-[#D4A574] hover:text-[#C49464] font-dm">
            ← Back to Shop
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FDFCFB]">
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Bodoni+Moda:ital,wght@0,400;0,500;0,600;1,400&family=DM+Sans:wght@300;400;500&display=swap');
        .font-bodoni { font-family: 'Bodoni Moda', serif; }
        .font-dm { font-family: 'DM Sans', sans-serif; }
      `}</style>

      {/* Breadcrumb */}
      <div className="border-b border-stone-200 pt-20 bg-[#FDFCFB]/50 backdrop-blur">
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-4">
          <div className="flex items-center gap-2 text-sm font-dm text-stone-600">
            <Link href="/shop" className="hover:text-stone-900">Shop</Link>
            <span>/</span>
            {product.category && (
              <>
                <Link href={`/shop?category=${product.category.name}`} className="hover:text-stone-900">
                  {product.category.name}
                </Link>
                <span>/</span>
              </>
            )}
            <span className="text-stone-900 font-medium">{product.name}</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Image Gallery */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-4"
          >
            {/* Main Image */}
            <div className="relative bg-stone-100 rounded-xl overflow-hidden aspect-square">
              <AnimatePresence mode="wait">
                <motion.div
                  key={selectedImage}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="w-full h-full relative"
                >
                  {product.images[selectedImage] && (
                    <Image
                      src={product.images[selectedImage]}
                      alt={product.name}
                      fill
                      className="object-cover"
                      priority
                    />
                  )}
                </motion.div>
              </AnimatePresence>

              {/* Featured Badge */}
              {product.featured && (
                <div className="absolute top-4 left-4 bg-[#D4A574] text-white! px-3 py-1 rounded-full text-xs font-dm font-medium">
                  Featured
                </div>
              )}

              {/* Bestseller Badge */}
              {product.bestseller && (
                <div className="absolute top-4 right-4 bg-orange-500 text-white! px-3 py-1 rounded-full text-xs font-dm font-medium">
                  Bestseller
                </div>
              )}
            </div>

            {/* Thumbnail Gallery */}
            {product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-3">
                {product.images.map((img, idx) => (
                  <motion.button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImage === idx
                        ? 'border-[#D4A574] bg-stone-50'
                        : 'border-stone-200 bg-stone-50 hover:border-stone-300'
                    }`}
                    whileHover={{ scale: 1.05 }}
                  >
                    <Image
                      src={img}
                      alt={`${product.name} ${idx + 1}`}
                      fill
                      className="object-cover"
                    />
                  </motion.button>
                ))}
              </div>
            )}
          </motion.div>

          {/* Product Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="space-y-8"
          >
            {/* Title & Category */}
            <div className="space-y-2">
              <h1 className="text-4xl md:text-5xl font-bodoni font-semibold text-stone-900">
                {product.name}
              </h1>
              {product.category && (
                <p className="text-sm font-dm text-stone-600">
                  Category: <span className="text-stone-900 font-medium">{product.category.name}</span>
                </p>
              )}
            </div>

            {/* Price & Stock */}
            <div className="space-y-3 pb-6 border-b border-stone-200">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bodoni font-semibold text-stone-900">
                  ${product.price.toFixed(2)}
                </span>
                {product.vegan && (
                  <span className="text-xs font-dm bg-green-100 text-green-700 px-2 py-1 rounded">
                    Vegan
                  </span>
                )}
              </div>

              {product.stock !== undefined && (
                <p className={`text-sm font-dm ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                </p>
              )}
            </div>

            {/* Description */}
            {product.description && (
              <div className="space-y-3">
                <h3 className="font-bodoni font-semibold text-stone-900">About this product</h3>
                <p className="font-dm text-stone-700 leading-relaxed">
                  {product.description}
                </p>
              </div>
            )}

            {/* Size Selection */}
            {product.sizes && product.sizes.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-bodoni font-semibold text-stone-900">Size</h3>
                <div className="grid grid-cols-4 gap-2">
                  {product.sizes.map((size) => (
                    <motion.button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`py-2 px-3 rounded-lg border-2 font-dm text-sm font-medium transition-all ${
                        selectedSize === size
                          ? 'border-[#D4A574] bg-[#D4A574] text-white!'
                          : 'border-stone-200 hover:border-stone-300'
                      }`}
                      whileHover={{ scale: 1.05 }}
                    >
                      {size}
                    </motion.button>
                  ))}
                </div>
              </div>
            )}

            {/* Color Selection */}
            {product.color && (
              <div className="space-y-3">
                <h3 className="font-bodoni font-semibold text-stone-900">Color</h3>
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-full border-2 border-stone-300"
                    style={{ backgroundColor: product.color }}
                  />
                  <span className="font-dm text-stone-700">{product.color}</span>
                </div>
              </div>
            )}

            {/* Quantity & Add to Cart */}
            <div className="space-y-4 pt-6 border-t border-stone-200">
              <div className="flex items-center gap-4">
                <label className="font-dm font-medium text-stone-900">Quantity:</label>
                <div className="flex items-center border border-stone-300 rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-4 py-2 text-stone-600 hover:text-stone-900"
                  >
                    −
                  </button>
                  <span className="px-6 py-2 font-dm font-medium">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-4 py-2 text-stone-600 hover:text-stone-900"
                  >
                    +
                  </button>
                </div>
              </div>

              <motion.button
                onClick={handleAddToCart}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`w-full py-4 rounded-lg font-bodoni font-semibold text-lg transition-all ${
                  addedToCart
                    ? 'bg-green-500 text-white!'
                    : 'bg-stone-900 text-white! hover:bg-stone-800'
                }`}
              >
                {addedToCart ? '✓ Added to Cart' : 'Add to Cart'}
              </motion.button>

              <motion.button
                onClick={() => {
                  if (!product) return
                  setWishlistAnimating(true)
                  toggleWishlist({
                    productId: product.id,
                    name: product.name,
                    price: product.price,
                    image: product.images?.[0] || '/placeholder.jpg',
                  })
                  setTimeout(() => setWishlistAnimating(false), 300)
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`w-full py-3 rounded-lg border-2 font-dm font-medium transition-all ${
                  product && isInWishlist(product.id)
                    ? 'border-red-400 bg-red-50 text-red-600'
                    : 'border-stone-300 text-stone-900 hover:border-stone-400'
                }`}
              >
                <span className={`inline-block transition-transform ${wishlistAnimating ? 'scale-125' : ''}`}>
                  {product && isInWishlist(product.id) ? '♥ In Wishlist' : '♡ Add to Wishlist'}
                </span>
              </motion.button>
            </div>

            {/* Product Info */}
            <div className="grid grid-cols-2 gap-4 pt-6 border-t border-stone-200">
              {product.concern && (
                <div>
                  <p className="text-xs font-dm text-stone-600 uppercase">Concern</p>
                  <p className="font-dm font-medium text-stone-900">{product.concern}</p>
                </div>
              )}
              {product.subcategory && (
                <div>
                  <p className="text-xs font-dm text-stone-600 uppercase">Type</p>
                  <p className="font-dm font-medium text-stone-900">{product.subcategory}</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="mt-20 pt-12 border-t border-stone-200"
          >
            <h2 className="text-3xl md:text-4xl font-bodoni font-semibold text-stone-900 mb-8">
              You might also like
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {relatedProducts.map((relProduct, idx) => (
                <motion.div
                  key={relProduct.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Link
                    href={`/products/${relProduct.id}`}
                    className="group block space-y-4"
                  >
                    <div className="relative bg-stone-100 rounded-xl overflow-hidden aspect-square">
                      {relProduct.images[0] && (
                        <Image
                          src={relProduct.images[0]}
                          alt={relProduct.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      )}
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-bodoni font-semibold text-stone-900 group-hover:text-[#D4A574] transition-colors">
                        {relProduct.name}
                      </h3>
                      <p className="font-dm text-lg font-medium text-stone-900">
                        ${typeof relProduct.price === 'number' ? relProduct.price.toFixed(2) : relProduct.price}
                      </p>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}

        {/* Reviews Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mt-20 pt-12 border-t border-stone-200"
        >
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-3xl md:text-4xl font-bodoni font-semibold text-stone-900 mb-2">
                Customer Reviews
              </h2>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <span
                      key={i}
                      className={`text-xl ${
                        i < Math.round(averageRating)
                          ? 'text-yellow-400'
                          : 'text-stone-300'
                      }`}
                    >
                      ★
                    </span>
                  ))}
                </div>
                <span className="font-dm text-stone-700">
                  {averageRating.toFixed(1)} ({reviews.length} reviews)
                </span>
              </div>
            </div>
            <motion.button
              onClick={() => setShowReviewForm(!showReviewForm)}
              whileHover={{ scale: 1.05 }}
              className="bg-stone-900 text-white! px-6 py-3 rounded-lg font-dm font-medium hover:bg-stone-800 transition-all"
            >
              Write a Review
            </motion.button>
          </div>

          {/* Review Form */}
          {showReviewForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-stone-50 rounded-lg p-8 mb-8 border border-stone-200"
            >
              <form onSubmit={handleSubmitReview} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block font-dm font-medium text-stone-900">
                      Name
                    </label>
                    <input
                      type="text"
                      value={reviewForm.customerName}
                      onChange={(e) =>
                        setReviewForm({
                          ...reviewForm,
                          customerName: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border border-stone-300 rounded-lg font-dm focus:outline-none focus:border-stone-900"
                      placeholder="Your name"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block font-dm font-medium text-stone-900">
                      Email
                    </label>
                    <input
                      type="email"
                      value={reviewForm.email}
                      onChange={(e) =>
                        setReviewForm({
                          ...reviewForm,
                          email: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border border-stone-300 rounded-lg font-dm focus:outline-none focus:border-stone-900"
                      placeholder="your@email.com"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block font-dm font-medium text-stone-900">
                    Rating
                  </label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() =>
                          setReviewForm({
                            ...reviewForm,
                            rating: star,
                          })
                        }
                        className={`text-3xl transition-all ${
                          star <= reviewForm.rating
                            ? 'text-yellow-400'
                            : 'text-stone-300 hover:text-yellow-200'
                        }`}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block font-dm font-medium text-stone-900">
                    Review Title
                  </label>
                  <input
                    type="text"
                    value={reviewForm.title}
                    onChange={(e) =>
                      setReviewForm({
                        ...reviewForm,
                        title: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-stone-300 rounded-lg font-dm focus:outline-none focus:border-stone-900"
                    placeholder="e.g., Amazing quality!"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block font-dm font-medium text-stone-900">
                    Your Review
                  </label>
                  <textarea
                    value={reviewForm.comment}
                    onChange={(e) =>
                      setReviewForm({
                        ...reviewForm,
                        comment: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-stone-300 rounded-lg font-dm focus:outline-none focus:border-stone-900 resize-none"
                    rows={4}
                    placeholder="Share your experience with this product..."
                  />
                </div>

                <div className="flex gap-4">
                  <motion.button
                    type="submit"
                    disabled={submittingReview}
                    whileHover={{ scale: 1.02 }}
                    className="px-6 py-2 bg-stone-900 text-white! rounded-lg font-dm font-medium hover:bg-stone-800 transition-all disabled:bg-stone-400"
                  >
                    {submittingReview ? 'Submitting...' : 'Submit Review'}
                  </motion.button>
                  <button
                    type="button"
                    onClick={() => setShowReviewForm(false)}
                    className="px-6 py-2 border border-stone-300 rounded-lg font-dm font-medium hover:bg-stone-50 transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          )}

          {/* Reviews List */}
          <div className="space-y-6">
            {reviews.length > 0 ? (
              reviews.map((review, idx) => (
                <motion.div
                  key={review.id}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: idx * 0.05 }}
                  viewport={{ once: true }}
                  className="bg-stone-50 rounded-lg p-6 border border-stone-200"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-bodoni font-semibold text-stone-900">
                        {review.title}
                      </h4>
                      <p className="text-sm font-dm text-stone-600">
                        by {review.customerName}
                        {review.verified && (
                          <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                            Verified Purchase
                          </span>
                        )}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, i) => (
                        <span
                          key={i}
                          className={`text-lg ${
                            i < review.rating
                              ? 'text-yellow-400'
                              : 'text-stone-300'
                          }`}
                        >
                          ★
                        </span>
                      ))}
                    </div>
                  </div>

                  <p className="font-dm text-stone-700 mb-2">
                    {review.comment}
                  </p>

                  <p className="text-xs font-dm text-stone-500">
                    {new Date(review.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-12">
                <p className="font-dm text-stone-600 mb-4">
                  No reviews yet. Be the first to review this product!
                </p>
              </div>
            )}
          </div>
        </motion.section>
      </div>
    </div>
  )
}
