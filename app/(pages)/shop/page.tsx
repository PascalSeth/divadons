'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { formatCurrency } from '@/lib/currency'

// Type definitions
interface Product {
  id: string;
  name: string;
  image?: string;
  images?: string[];
  price: number | string;
  currency?: string;
  subcategory?: string;
  category?: string;
  categoryId?: string;
  featured?: boolean;
  bestseller?: boolean;
  status?: string;
}

interface Category {
  id: string;
  name: string;
  color?: string;
}

function ShopPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [sortBy, setSortBy] = useState('Featured')
  const [priceRange, setPriceRange] = useState([0, 1000])
  const [hoveredProduct, setHoveredProduct] = useState<string | null>(null)
  const [filtersOpen, setFiltersOpen] = useState(false)

  // Fetch products and categories from API
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        
        // Fetch products
        const productsRes = await fetch('/api/products?page=1&pageSize=100')
        const productsJson = await productsRes.json()
        
        // Fetch categories
        const categoriesRes = await fetch('/api/categories?page=1&pageSize=50')
        const categoriesJson = await categoriesRes.json()
        
        if (productsJson.success && Array.isArray(productsJson.data)) {
          const normalizedProducts: Product[] = productsJson.data.map((p: Record<string, unknown>) => ({
            id: String(p['id'] ?? ''),
            name: String(p['name'] ?? ''),
            image: Array.isArray(p['images']) && p['images'].length > 0 
              ? String(p['images'][0]) 
              : String(p['image'] ?? ''),
            images: Array.isArray(p['images']) ? p['images'] as string[] : undefined,
            price: typeof p['price'] === 'number' ? p['price'] : String(p['price'] ?? '0'),
            subcategory: String(p['subcategory'] ?? ''),
            category: String(p['category'] ?? ''),
            categoryId: String(p['categoryId'] ?? ''),
            featured: Boolean(p['featured']),
            bestseller: Boolean(p['bestseller']),
            status: String(p['status'] ?? 'active'),
          }))
          setProducts(normalizedProducts)
        }
        
        if (categoriesJson.success && Array.isArray(categoriesJson.data)) {
          const normalizedCategories: Category[] = categoriesJson.data.map((c: Record<string, unknown>) => ({
            id: String(c['id'] ?? ''),
            name: String(c['name'] ?? ''),
            color: String(c['color'] ?? '#78716c'),
          }))
          setCategories(normalizedCategories)
        }
      } catch {
        // ignore
      } finally {
        setLoading(false)
      }
    }
    
    fetchData()
  }, [])

  // Get unique categories from products for filter
  const productCategories = useMemo(() => {
    const cats = new Set(products.map(p => p.category).filter(Boolean))
    return ['All', ...Array.from(cats)]
  }, [products])

  // Get unique colors from products for filter
  const colors = useMemo(() => {
    const cols = new Set(products.map(p => p.subcategory).filter(Boolean))
    return ['All', ...Array.from(cols)]
  }, [products])
  
  const [selectedColor, setSelectedColor] = useState('All')

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    return products
      .filter(product => {
        const categoryMatch = selectedCategory === 'All' || product.category === selectedCategory
        const colorMatch = selectedColor === 'All' || product.subcategory === selectedColor
        const price = typeof product.price === 'number' ? product.price : parseFloat(String(product.price)) || 0
        const priceMatch = price >= priceRange[0] && price <= priceRange[1]
        return categoryMatch && colorMatch && priceMatch
      })
      .sort((a, b) => {
        const priceA = typeof a.price === 'number' ? a.price : parseFloat(String(a.price)) || 0
        const priceB = typeof b.price === 'number' ? b.price : parseFloat(String(b.price)) || 0
        switch(sortBy) {
          case 'Price: Low to High':
            return priceA - priceB
          case 'Price: High to Low':
            return priceB - priceA
          case 'Featured':
            return (b.featured ? 1 : 0) - (a.featured ? 1 : 0)
          default:
            return 0
        }
      })
  }, [products, selectedCategory, selectedColor, priceRange, sortBy])

  const sortOptions = ['Featured', 'Price: Low to High', 'Price: High to Low', 'Newest']

  // Get category color by name
  const getCategoryColor = (categoryName: string) => {
    const cat = categories.find(c => c.name === categoryName)
    return cat?.color || '#78716c'
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FDFCFB]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-stone-200 border-t-stone-900 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-stone-500 font-dm">Loading products...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative pt-15 bg-[#FDFCFB] min-h-screen">
      
      {/* Custom Fonts */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=DM+Sans:wght@300;400;500;600;700&display=swap');
        
        .font-baskerville { font-family: 'Libre Baskerville', serif; }
        .font-dm { font-family: 'DM Sans', sans-serif; }
        
        @keyframes float-gentle {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(3deg); }
        }
        
        @keyframes pulse-subtle {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.7; }
        }

        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .float-gentle { animation: float-gentle 8s ease-in-out infinite; }
        .pulse-subtle { animation: pulse-subtle 3s ease-in-out infinite; }
        .spin-slow { animation: spin-slow 40s linear infinite; }
      `}</style>

      {/* Decorative Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        {/* Gradient Orbs */}
        <motion.div
          className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-orange-200/30 to-pink-200/30 blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            x: [0, 30, 0],
            y: [0, -30, 0],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute top-1/3 -left-32 w-[500px] h-[500px] rounded-full bg-gradient-to-br from-blue-200/20 to-cyan-200/20 blur-3xl"
          animate={{
            scale: [1, 1.3, 1],
            x: [0, -40, 0],
            y: [0, 40, 0],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Curved Lines */}
        <svg className="absolute top-0 left-0 w-full h-full opacity-30" viewBox="0 0 1440 900">
          <path
            d="M-100 200 Q 300 50, 700 200 T 1500 200"
            stroke="currentColor"
            strokeWidth="1"
            className="text-stone-300"
            fill="none"
          />
          <path
            d="M-100 600 Q 400 750, 800 600 T 1600 600"
            stroke="currentColor"
            strokeWidth="1"
            className="text-stone-300"
            fill="none"
          />
        </svg>

        {/* Geometric Shapes */}
        <div className="absolute top-20 right-20 w-32 h-32 border border-stone-300/40 rounded-full spin-slow" />
        <div className="absolute bottom-32 left-32 w-24 h-24 border-2 border-stone-300/30 rotate-45 float-gentle" />
      </div>

      {/* Main Content */}
      <div className="relative z-10">
        
        {/* Header */}
        <header className="border-b border-stone-200 bg-[#FDFCFB]/80 backdrop-blur-xl">
          <div className="max-w-7xl mx-auto px-6 md:px-12 py-8">
            <div className="flex items-center justify-between mb-6">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
              >
                <h1 className="text-4xl md:text-5xl font-baskerville font-bold text-stone-900 tracking-tight">
                  Shop
                </h1>
                <p className="text-stone-500 font-dm text-sm mt-2">
                  {filteredProducts.length} {filteredProducts.length === 1 ? 'item' : 'items'}
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                className="flex items-center gap-4"
              >
                {/* Sort Dropdown */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-2 bg-white border border-stone-200 rounded-lg font-dm text-sm text-stone-700 focus:outline-none focus:ring-2 focus:ring-stone-400 cursor-pointer"
                >
                  {sortOptions.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>

                {/* Filters Button (Mobile) */}
                <button
                  onClick={() => setFiltersOpen(!filtersOpen)}
                  className="md:hidden p-2 bg-white border border-stone-200 rounded-lg"
                >
                  <svg className="w-5 h-5 text-stone-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                  </svg>
                </button>
              </motion.div>
            </div>

            {/* Category Pills */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="flex flex-wrap gap-3"
            >
              {productCategories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category ?? 'All')}
                  className={`px-6 py-2 rounded-full font-dm text-sm font-medium transition-all ${
                    selectedCategory === category
                      ? 'bg-stone-900 text-white! shadow-lg'
                      : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
                  }`}
                >
                  {category}
                </button>
              ))}
            </motion.div>
          </div>
        </header>

        {/* Main Shop Layout */}
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-12">
          <div className="flex flex-col md:flex-row gap-12">
            
            {/* Sidebar Filters */}
            <AnimatePresence>
              {(filtersOpen || (typeof window !== 'undefined' && window.innerWidth >= 768)) && (
                <motion.aside
                  initial={{ opacity: 0, x: -40 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -40 }}
                  transition={{ duration: 0.5 }}
                  className={`${
                    filtersOpen ? 'fixed inset-0 bg-white z-50 p-6 overflow-y-auto' : 'md:sticky md:top-32'
                  } md:w-64 md:h-fit space-y-8`}
                >
                  {/* Close Button (Mobile) */}
                  {filtersOpen && (
                    <button
                      onClick={() => setFiltersOpen(false)}
                      className="md:hidden absolute top-6 right-6 p-2 hover:bg-stone-100 rounded-full"
                    >
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}

                  <div>
                    <h3 className="text-lg font-baskerville font-bold text-stone-900 mb-4">
                      Filters
                    </h3>
                    <div className="h-px bg-gradient-to-r from-stone-300 to-transparent mb-6" />
                  </div>

                  {/* Color/Subcategory Filter */}
                  <div>
                    <h4 className="text-sm font-dm font-semibold text-stone-900 mb-4 tracking-wider uppercase">
                      Style
                    </h4>
                    <div className="space-y-3">
                      {colors.map((color) => (
                        <label
                          key={color}
                          className="flex items-center gap-3 cursor-pointer group"
                        >
                          <input
                            type="radio"
                            name="color"
                            checked={selectedColor === color}
                            onChange={() => setSelectedColor(color ?? 'All')}
                            className="w-4 h-4 text-stone-900 focus:ring-stone-400"
                          />
                          <span className="text-sm font-dm text-stone-600 group-hover:text-stone-900 transition-colors">
                            {color}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Price Range */}
                  <div>
                    <h4 className="text-sm font-dm font-semibold text-stone-900 mb-4 tracking-wider uppercase">
                      Price Range
                    </h4>
                    <div className="space-y-4">
                      <input
                        type="range"
                        min="0"
                        max="1000"
                        value={priceRange[1]}
                        onChange={(e) => setPriceRange([0, parseInt(e.target.value)])}
                        className="w-full h-2 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-stone-900"
                      />
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-dm text-stone-600">
                          ${priceRange[0]}
                        </span>
                        <span className="text-sm font-dm text-stone-900 font-medium">
                          ${priceRange[1]}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Reset Filters */}
                  <button
                    onClick={() => {
                      setSelectedCategory('All')
                      setSelectedColor('All')
                      setPriceRange([0, 1000])
                    }}
                    className="w-full py-3 border-2 border-stone-300 text-stone-700 rounded-lg font-dm text-sm font-medium hover:border-stone-900 hover:text-stone-900 transition-colors"
                  >
                    Reset Filters
                  </button>

                  {/* Decorative Element */}
                  <div className="hidden md:block relative mt-12 pt-12 border-t border-stone-200">
                    <div className="absolute -top-3 left-0 w-16 h-px bg-stone-400" />
                    <p className="text-xs font-dm text-stone-400 italic">
                      Celebrating African heritage through contemporary design
                    </p>
                  </div>
                </motion.aside>
              )}
            </AnimatePresence>

            {/* Products Grid/List */}
            <div className="flex-1">
              {filteredProducts.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-24"
                >
                  <div className="w-24 h-24 mx-auto mb-6 border-2 border-dashed border-stone-300 rounded-full flex items-center justify-center">
                    <svg className="w-12 h-12 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-baskerville text-stone-900 mb-2">
                    No products found
                  </h3>
                  <p className="text-stone-500 font-dm">
                    Try adjusting your filters
                  </p>
                </motion.div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  <AnimatePresence mode="popLayout">
                    {filteredProducts.map((product, index) => (
                      <Link key={product.id} href={`/products/${product.id}`} className="contents">
                        <motion.div
                          layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ delay: index * 0.05, duration: 0.3 }}
                        onHoverStart={() => setHoveredProduct(product.id)}
                        onHoverEnd={() => setHoveredProduct(null)}
                        className="group relative flex flex-col"
                      >
                        {/* Image Container */}
                        <div className="relative aspect-[3/4] w-full overflow-hidden bg-neutral-50 mb-4">
                          <Image
                            src={
                              hoveredProduct === product.id && Array.isArray(product.images) && product.images.length > 1
                                ? product.images[1]
                                : Array.isArray(product.images) && product.images.length
                                ? product.images[0]
                                : product.image || '/dress1.jpeg'
                            }
                            alt={product.name}
                            fill
                            className="object-cover transition-transform duration-700 group-hover:scale-105"
                            unoptimized
                          />
                          
                          {/* Category Overlay on Image */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                          <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                            <div 
                              className="inline-block px-3 py-1.5 rounded-full text-xs font-dm font-medium uppercase tracking-wider text-white!"
                              style={{ backgroundColor: getCategoryColor(product.category || '') }}
                            >
                              {product.category || 'Collection'}
                            </div>
                          </div>
                          
                          <motion.div 
                            className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                          >
                            <motion.button 
                              initial={{ y: 10, opacity: 0 }}
                              whileHover={{ scale: 1.05 }}
                              className="bg-neutral-900 text-white! px-6 py-3 text-xs uppercase tracking-wider font-medium shadow-lg"
                            >
                              Quick View
                            </motion.button>
                          </motion.div>
                        </div>

                        {/* Text Content */}
                        <div className="relative">
                          <h3 className="text-xl font-medium text-neutral-900 mb-1">{product.name}</h3>
                          <div className="flex justify-between items-center text-sm text-neutral-500">
                            <span>{product.subcategory || product.category || ''}</span>
                            <span className="font-mono">{formatCurrency(product.price, product.currency || 'USD')}</span>
                          </div>
                          
                          <div className="absolute bottom-0 left-0 right-0 h-px bg-neutral-200 origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
                        </div>
                        </motion.div>
                      </Link>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>

          </div>
        </div>

        {/* Bottom CTA Banner */}
        <section className="relative py-24 px-6 md:px-12 mt-24 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-orange-100 via-pink-50 to-purple-100 opacity-50" />
          <div className="absolute inset-0">
            <svg className="absolute bottom-0 left-0 w-full h-full opacity-20" viewBox="0 0 1440 320">
              <path
                d="M0,160 Q360,80 720,160 T1440,160 L1440,320 L0,320 Z"
                fill="currentColor"
                className="text-stone-300"
              />
            </svg>
          </div>

          <div className="relative z-10 max-w-4xl mx-auto text-center space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2 className="text-5xl md:text-6xl font-baskerville font-bold text-stone-900 mb-6">
                Join Our Community
              </h2>
              <p className="text-stone-600 text-lg md:text-xl font-dm font-light max-w-2xl mx-auto">
                Subscribe to receive exclusive offers, early access to new collections, and stories behind our craftspeople
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
              className="flex flex-col sm:flex-row gap-4 max-w-xl mx-auto"
            >
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-6 py-4 bg-white border-2 border-stone-200 rounded-full font-dm text-sm focus:outline-none focus:border-stone-900 transition-colors"
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-10 py-4 bg-stone-900 text-white! rounded-full font-dm text-sm font-medium hover:bg-stone-800 transition-colors"
              >
                Subscribe
              </motion.button>
            </motion.div>
          </div>
        </section>

      </div>
    </div>
  )
}

export default ShopPage
