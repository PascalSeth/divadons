'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'

// Product Data
const allProducts = [
  // Ankara
  { id: 1, name: 'Adire Wrap Dress', category: 'Ankara', price: 189, color: 'Multi', size: ['S', 'M', 'L', 'XL'], image: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=800&auto=format&fit=crop', featured: true },
  { id: 2, name: 'Ankara Blazer Set', category: 'Ankara', price: 245, color: 'Orange', size: ['M', 'L', 'XL'], image: 'https://images.unsplash.com/photo-1560243563-062bfc001d68?w=800&auto=format&fit=crop', featured: false },
  { id: 3, name: 'Print Midi Skirt', category: 'Ankara', price: 156, color: 'Blue', size: ['S', 'M', 'L'], image: 'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=800&auto=format&fit=crop', featured: false },
  { id: 4, name: 'Statement Jumpsuit', category: 'Ankara', price: 298, color: 'Red', size: ['M', 'L', 'XL'], image: 'https://images.unsplash.com/photo-1617922001439-4a2e6562f328?w=800&auto=format&fit=crop', featured: true },
  
  // Kente
  { id: 5, name: 'Kente Evening Gown', category: 'Kente', price: 425, color: 'Gold', size: ['S', 'M', 'L'], image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&auto=format&fit=crop', featured: true },
  { id: 6, name: 'Royal Wrapper', category: 'Kente', price: 385, color: 'Multi', size: ['M', 'L', 'XL'], image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&auto=format&fit=crop', featured: false },
  { id: 7, name: 'Prestige Cape', category: 'Kente', price: 340, color: 'Gold', size: ['S', 'M', 'L'], image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&auto=format&fit=crop', featured: false },
  { id: 8, name: 'Ceremonial Set', category: 'Kente', price: 510, color: 'Multi', size: ['M', 'L', 'XL'], image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800&auto=format&fit=crop', featured: true },
  
  // Dashiki
  { id: 9, name: 'Classic Dashiki', category: 'Dashiki', price: 125, color: 'Blue', size: ['S', 'M', 'L', 'XL'], image: 'https://images.unsplash.com/photo-1516762689617-e1cffcef479d?w=800&auto=format&fit=crop', featured: false },
  { id: 10, name: 'Embroidered Tunic', category: 'Dashiki', price: 178, color: 'White', size: ['M', 'L', 'XL'], image: 'https://images.unsplash.com/photo-1564859228273-274232fdb516?w=800&auto=format&fit=crop', featured: true },
  { id: 11, name: 'Festival Dashiki', category: 'Dashiki', price: 145, color: 'Green', size: ['S', 'M', 'L'], image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800&auto=format&fit=crop', featured: false },
  { id: 12, name: 'Heritage Caftan', category: 'Dashiki', price: 210, color: 'Multi', size: ['M', 'L', 'XL'], image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&auto=format&fit=crop', featured: false },
  
  // Beauty
  { id: 13, name: 'Shea Glow Serum', category: 'Beauty', price: 48, color: 'Natural', size: ['30ml', '50ml'], image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800&auto=format&fit=crop', featured: true },
  { id: 14, name: 'Black Soap Detox', category: 'Beauty', price: 32, color: 'Natural', size: ['100g', '200g'], image: 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=800&auto=format&fit=crop', featured: false },
  { id: 15, name: 'Baobab Face Oil', category: 'Beauty', price: 56, color: 'Natural', size: ['30ml', '50ml'], image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800&auto=format&fit=crop', featured: true },
  { id: 16, name: 'Hibiscus Toner', category: 'Beauty', price: 38, color: 'Natural', size: ['100ml', '200ml'], image: 'https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=800&auto=format&fit=crop', featured: false },
  
  // Accessories
  { id: 17, name: 'Brass Statement Collar', category: 'Accessories', price: 89, color: 'Gold', size: ['One Size'], image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&auto=format&fit=crop', featured: false },
  { id: 18, name: 'Cowrie Shell Set', category: 'Accessories', price: 65, color: 'White', size: ['One Size'], image: 'https://images.unsplash.com/photo-1610652620062-49e21e4c97b6?w=800&auto=format&fit=crop', featured: true },
  { id: 19, name: 'Leather Gele Bag', category: 'Accessories', price: 135, color: 'Brown', size: ['One Size'], image: 'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?w=800&auto=format&fit=crop', featured: false },
  { id: 20, name: 'Beaded Waist Chain', category: 'Accessories', price: 72, color: 'Multi', size: ['One Size'], image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce538?w=800&auto=format&fit=crop', featured: false },
]

const categories = ['All', 'Ankara', 'Kente', 'Dashiki', 'Beauty', 'Accessories']
const sortOptions = ['Featured', 'Price: Low to High', 'Price: High to Low', 'Newest']
const colors = ['All', 'Multi', 'Blue', 'Red', 'Gold', 'Green', 'White', 'Natural', 'Orange', 'Brown']

function ShopPage() {
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [selectedColor, setSelectedColor] = useState('All')
  const [sortBy, setSortBy] = useState('Featured')
  const [viewMode, setViewMode] = useState('grid') // 'grid' or 'list'
  const [priceRange, setPriceRange] = useState([0, 600])
  const [hoveredProduct, setHoveredProduct] = useState<number | null>(null)
  const [filtersOpen, setFiltersOpen] = useState(false)

  // Filter and sort products
  const filteredProducts = allProducts
    .filter(product => {
      const categoryMatch = selectedCategory === 'All' || product.category === selectedCategory
      const colorMatch = selectedColor === 'All' || product.color === selectedColor
      const priceMatch = product.price >= priceRange[0] && product.price <= priceRange[1]
      return categoryMatch && colorMatch && priceMatch
    })
    .sort((a, b) => {
      switch(sortBy) {
        case 'Price: Low to High':
          return a.price - b.price
        case 'Price: High to Low':
          return b.price - a.price
        case 'Featured':
          return (b.featured ? 1 : 0) - (a.featured ? 1 : 0)
        default:
          return 0
      }
    })

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
        <motion.div
          className="absolute bottom-20 right-1/4 w-[400px] h-[400px] rounded-full bg-gradient-to-br from-purple-200/20 to-violet-200/20 blur-3xl"
          animate={{
            scale: [1, 1.4, 1],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
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
        <div className="absolute top-1/2 right-1/3 w-16 h-16 border border-dashed border-stone-400/30 rounded-full pulse-subtle" />
      </div>

      {/* Main Content */}
      <div className="relative z-10">
        
        {/* Header */}
        <header className="border-b border-stone-200 bg-[#FDFCFB]/80 backdrop-blur-xl ">
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
                {/* View Mode Toggle */}
                <div className="hidden md:flex items-center gap-2 p-1 bg-stone-100 rounded-lg">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded transition-colors ${
                      viewMode === 'grid' ? 'bg-white shadow-sm' : 'hover:bg-stone-50'
                    }`}
                  >
                    <svg className="w-5 h-5 text-stone-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded transition-colors ${
                      viewMode === 'list' ? 'bg-white shadow-sm' : 'hover:bg-stone-50'
                    }`}
                  >
                    <svg className="w-5 h-5 text-stone-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  </button>
                </div>

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
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-6 py-2 rounded-full font-dm text-sm font-medium transition-all ${
                    selectedCategory === category
                      ? 'bg-stone-900 text-white shadow-lg'
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

                  {/* Color Filter */}
                  <div>
                    <h4 className="text-sm font-dm font-semibold text-stone-900 mb-4 tracking-wider uppercase">
                      Color
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
                            onChange={() => setSelectedColor(color)}
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
                        max="600"
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
                      setPriceRange([0, 600])
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
                <div className={
                  viewMode === 'grid'
                    ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8'
                    : 'space-y-8'
                }>
                  {filteredProducts.map((product, index) => (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, y: 40 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: index * 0.05 }}
                      onMouseEnter={() => setHoveredProduct(product.id)}
                      onMouseLeave={() => setHoveredProduct(null)}
                      className={`group ${viewMode === 'list' ? 'flex gap-6' : ''}`}
                    >
                      {/* Product Image */}
                      <div className={`relative overflow-hidden rounded-2xl bg-stone-100 ${
                        viewMode === 'list' ? 'w-64 h-80 flex-shrink-0' : 'aspect-[3/4]'
                      }`}>
                        <Image
                          src={product.image}
                          alt={product.name}
                          fill
                          className="object-cover transition-transform duration-700 group-hover:scale-110"
                          unoptimized
                        />
                        
                        {/* Gradient Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-stone-900/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                        {/* Featured Badge */}
                        {product.featured && (
                          <div className="absolute top-4 right-4 px-4 py-2 bg-white/95 backdrop-blur-sm rounded-full shadow-lg">
                            <span className="text-xs font-dm font-medium text-stone-900 tracking-wider uppercase">
                              Featured
                            </span>
                          </div>
                        )}

                        {/* Quick View */}
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{
                            opacity: hoveredProduct === product.id ? 1 : 0,
                            y: hoveredProduct === product.id ? 0 : 20
                          }}
                          className="absolute inset-0 flex items-center justify-center"
                        >
                          <button className="px-8 py-3 bg-white text-stone-900 rounded-full font-dm text-sm font-medium shadow-2xl hover:bg-stone-900 hover:text-white transition-colors">
                            Quick View
                          </button>
                        </motion.div>

                        {/* Decorative Corner */}
                        <div className="absolute top-0 left-0 w-24 h-24 bg-gradient-to-br from-orange-400/20 to-transparent opacity-50 rounded-br-full" />
                      </div>

                      {/* Product Info */}
                      <div className={`space-y-3 ${viewMode === 'list' ? 'flex-1 py-4' : 'pt-4'}`}>
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <h3 className="text-stone-900 font-dm text-lg font-medium mb-1 group-hover:text-stone-600 transition-colors">
                              {product.name}
                            </h3>
                            <p className="text-stone-500 font-dm text-sm">
                              {product.category}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="text-stone-900 font-baskerville text-xl font-bold">
                              ${product.price}
                            </div>
                          </div>
                        </div>

                        {viewMode === 'list' && (
                          <div className="space-y-4 pt-4">
                            <div className="flex items-center gap-4">
                              <span className="text-xs font-dm text-stone-500 uppercase tracking-wider">
                                Color:
                              </span>
                              <span className="text-sm font-dm text-stone-700">
                                {product.color}
                              </span>
                            </div>
                            <div className="flex items-center gap-4">
                              <span className="text-xs font-dm text-stone-500 uppercase tracking-wider">
                                Sizes:
                              </span>
                              <div className="flex gap-2">
                                {product.size.map(size => (
                                  <span key={size} className="px-3 py-1 bg-stone-100 text-stone-700 rounded font-dm text-xs">
                                    {size}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}

                        <div className="flex items-center gap-3 pt-2">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="flex-1 py-3 bg-stone-900 text-white rounded-lg font-dm text-sm font-medium hover:bg-stone-800 transition-colors"
                          >
                            Add to Cart
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1, rotate: 10 }}
                            whileTap={{ scale: 0.9 }}
                            className="w-12 h-12 rounded-lg border-2 border-stone-200 flex items-center justify-center hover:border-stone-900 transition-colors"
                          >
                            <svg className="w-5 h-5 text-stone-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                          </motion.button>
                        </div>

                        {/* Accent Line */}
                        <motion.div
                          className="h-0.5 bg-gradient-to-r from-orange-400 to-pink-400 rounded-full origin-left"
                          initial={{ scaleX: 0 }}
                          animate={{ scaleX: hoveredProduct === product.id ? 1 : 0 }}
                          transition={{ duration: 0.3 }}
                        />
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}

              {/* Load More */}
              {filteredProducts.length > 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="text-center mt-16"
                >
                  <button className="px-12 py-4 bg-white border-2 border-stone-300 text-stone-900 rounded-full font-dm text-sm font-medium hover:border-stone-900 transition-colors">
                    Load More Products
                  </button>
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
                className="px-10 py-4 bg-stone-900 text-white rounded-full font-dm text-sm font-medium hover:bg-stone-800 transition-colors"
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