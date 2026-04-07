'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { formatCurrency } from '@/lib/currency'
import { ProductCard } from '@/app/components/ProductCard'

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
  image?: string;
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
            image: String(c['image'] ?? ''),
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

  // Get complete categories for filter, including 'All'
  const visualCategories = useMemo(() => {
    const allCategory: Category = {
      id: 'All',
      name: 'All',
      image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2070&auto=format&fit=crop', // A generic high-end fashion image
    }
    return [allCategory, ...categories]
  }, [categories])

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
        const categoryMatch = selectedCategory === 'All' || product.categoryId === selectedCategory
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
        
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
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
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
              >
                <h1 className="text-5xl md:text-8xl font-baskerville font-bold text-stone-900 tracking-tighter mb-4">
                  Shop
                </h1>
                <div className="flex items-center gap-3">
                  <div className="h-px w-10 bg-stone-300" />
                  <p className="text-stone-400 font-dm text-[10px] uppercase tracking-[0.3em]">
                    {filteredProducts.length} curated pieces
                  </p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                className="flex items-center gap-3"
              >
                {/* Sort Dropdown Container */}
                <div className="relative flex items-center group">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="appearance-none pl-6 pr-12 py-3 bg-white border border-stone-200 rounded-full font-dm text-[10px] uppercase tracking-[0.2em] text-stone-600 focus:outline-none focus:ring-1 focus:ring-stone-400 cursor-pointer shadow-sm hover:border-stone-400 transition-all"
                  >
                    {sortOptions.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                  <div className="absolute right-5 pointer-events-none transition-transform duration-300 group-hover:translate-y-0.5">
                     <svg className="w-3 h-3 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                     </svg>
                  </div>
                </div>

                {/* Filters Button (Mobile) */}
                <button
                  onClick={() => setFiltersOpen(!filtersOpen)}
                  className="md:hidden p-3 bg-white border border-stone-200 rounded-full shadow-sm text-stone-600"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                  </svg>
                </button>
              </motion.div>
            </div>

            {/* Visual Category Filter - Circular Redesign */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="mt-10 flex gap-6 md:gap-10 overflow-x-auto pt-6 pb-12 no-scrollbar -mx-6 px-6 md:mx-0 md:px-0"
            >
              {visualCategories.map((category) => (
                <div key={category.id} className="flex-shrink-0 flex flex-col items-center gap-3">
                  <button
                    onClick={() => setSelectedCategory(category.id)}
                    className={`relative w-20 h-20 md:w-28 md:h-28 rounded-full overflow-hidden transition-all duration-500 group shadow-sm ${
                      selectedCategory === category.id
                        ? 'ring-2 ring-stone-900 ring-offset-4 scale-105'
                        : ''
                    }`}
                  >
                    <Image
                      src={category.image || 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?q=80&w=2070&auto=format&fit=crop'}
                      alt={category.name}
                      fill
                      className={`object-cover transition-transform duration-1000 ease-out ${
                        selectedCategory === category.id ? 'scale-110' : ''
                      }`}
                      unoptimized
                    />
                    
                    {/* Subtle Overlay on inactive ones */}
                    <div className={`absolute inset-0 bg-stone-900/10 transition-opacity duration-500 ${
                      selectedCategory === category.id ? 'opacity-0' : 'opacity-0'
                    }`} />
                  </button>
                  
                  {/* Category Name Below circle */}
                  <div className="flex flex-col items-center gap-1.5">
                    <span className={`text-[10px] md:text-xs font-dm font-bold uppercase tracking-[0.2em] transition-colors duration-300 ${
                      selectedCategory === category.id ? 'text-stone-900' : 'text-stone-400'
                    }`}>
                      {category.name}
                    </span>
                    
                    {selectedCategory === category.id && (
                      <motion.div 
                        layoutId="active-nav-dot"
                        className="w-1 h-1 bg-amber-600 rounded-full"
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      />
                    )}
                  </div>
                </div>
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
                    <h3 className="text-xs font-dm font-bold text-stone-400 mb-6 tracking-[0.3em] uppercase">
                      Curate By
                    </h3>
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
                    <h4 className="text-xs font-dm font-semibold text-stone-900 mb-4 tracking-wider uppercase">
                      Price Discovery
                    </h4>
                    <div className="space-y-6">
                      <div className="relative pt-2">
                        <input
                          type="range"
                          min="0"
                          max="1000"
                          value={priceRange[1]}
                          onChange={(e) => setPriceRange([0, parseInt(e.target.value)])}
                          className="w-full h-1 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-stone-900"
                        />
                      </div>
                      <div className="flex justify-between items-center font-mono text-xs text-stone-500">
                        <span>$0</span>
                        <span className="text-stone-900 font-bold">${priceRange[1]}</span>
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
                  <div className="w-32 h-32 mx-auto mb-8 relative">
                    <div className="absolute inset-0 border-2 border-dashed border-stone-200 rounded-full animate-spin-slow" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <svg className="w-12 h-12 text-stone-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 10H4L5 9z" />
                      </svg>
                    </div>
                  </div>
                  <h3 className="text-3xl font-baskerville text-stone-900 mb-4">
                    The collection is currently quiet.
                  </h3>
                  <p className="text-stone-500 font-dm max-w-sm mx-auto leading-relaxed">
                    Perhaps try a different style or refine your price discovery to find your next piece.
                  </p>
                </motion.div>
              ) : (
                <motion.div 
                  initial="hidden"
                  animate="visible"
                  variants={{
                    hidden: { opacity: 0 },
                    visible: {
                      opacity: 1,
                      transition: {
                        staggerChildren: 0.05
                      }
                    }
                  }}
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
                >
                  <AnimatePresence mode="popLayout">
                    {filteredProducts.map((product, index) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        isHovered={false}
                        onHoverStart={() => {}}
                        onHoverEnd={() => {}}
                        index={index}
                        categoryColor={getCategoryColor(product.category || '')}
                        categoryName={product.category}
                      />
                    ))}
                  </AnimatePresence>
                </motion.div>
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
