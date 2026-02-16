'use client'

import React, { useState, useRef } from 'react'
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion'
import Image from 'next/image'

// Beauty Products Data
const beautyCategories = [
  {
    id: 'skincare',
    name: 'SKINCARE',
    tagline: 'Botanical Rituals',
    description: 'Ancient wisdom meets modern science in plant-powered formulations',
    color: '#059669',
    gradient: 'from-emerald-500/20 to-teal-500/20',
  },
  {
    id: 'makeup',
    name: 'MAKEUP',
    tagline: 'Pigment Rich',
    description: 'Celebrate every shade with our inclusive color range',
    color: '#EC4899',
    gradient: 'from-pink-500/20 to-rose-500/20',
  },
  {
    id: 'haircare',
    name: 'HAIRCARE',
    tagline: 'Curl Care',
    description: 'Nourishing formulas designed for textured hair',
    color: '#8B5CF6',
    gradient: 'from-violet-500/20 to-purple-500/20',
  },
  {
    id: 'bodycare',
    name: 'BODY CARE',
    tagline: 'Luxe Indulgence',
    description: 'Transform your self-care routine into a spa experience',
    color: '#F59E0B',
    gradient: 'from-amber-500/20 to-orange-500/20',
  }
]

const beautyProducts = [
  // Skincare
  { id: 1, name: 'Shea Radiance Serum', category: 'skincare', price: 48, size: '30ml', concern: 'Anti-Aging', image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800&auto=format&fit=crop', bestseller: true, vegan: true },
  { id: 2, name: 'Black Soap Facial Cleanser', category: 'skincare', price: 32, size: '150ml', concern: 'Acne', image: 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=800&auto=format&fit=crop', bestseller: true, vegan: true },
  { id: 3, name: 'Baobab Hydrating Cream', category: 'skincare', price: 56, size: '50ml', concern: 'Dryness', image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800&auto=format&fit=crop', bestseller: false, vegan: true },
  { id: 4, name: 'Hibiscus Brightening Toner', category: 'skincare', price: 38, size: '100ml', concern: 'Hyperpigmentation', image: 'https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=800&auto=format&fit=crop', bestseller: false, vegan: true },
  { id: 5, name: 'Marula Oil Night Treatment', category: 'skincare', price: 64, size: '30ml', concern: 'Anti-Aging', image: 'https://images.unsplash.com/photo-1571875257727-256c39da42af?w=800&auto=format&fit=crop', bestseller: true, vegan: true },
  { id: 6, name: 'Turmeric Face Mask', category: 'skincare', price: 42, size: '75ml', concern: 'Brightening', image: 'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=800&auto=format&fit=crop', bestseller: false, vegan: true },
  
  // Makeup
  { id: 7, name: 'Velvet Matte Foundation', category: 'makeup', price: 42, size: '30ml', concern: '', image: 'https://images.unsplash.com/photo-1631214524020-7e18db9a8f92?w=800&auto=format&fit=crop', bestseller: true, vegan: false },
  { id: 8, name: 'Melanin Glow Highlighter', category: 'makeup', price: 36, size: '8g', concern: '', image: 'https://images.unsplash.com/photo-1617897903246-719242758050?w=800&auto=format&fit=crop', bestseller: true, vegan: true },
  { id: 9, name: 'Rich Pigment Lipstick', category: 'makeup', price: 28, size: '3.5g', concern: '', image: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=800&auto=format&fit=crop', bestseller: false, vegan: true },
  { id: 10, name: 'Eyeshadow Palette - Sahara', category: 'makeup', price: 52, size: '12 shades', concern: '', image: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=800&auto=format&fit=crop', bestseller: true, vegan: true },
  { id: 11, name: 'Volumizing Mascara', category: 'makeup', price: 24, size: '10ml', concern: '', image: 'https://images.unsplash.com/photo-1631730486784-d4412ca1ba16?w=800&auto=format&fit=crop', bestseller: false, vegan: false },
  { id: 12, name: 'Cream Blush Duo', category: 'makeup', price: 34, size: '7g', concern: '', image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800&auto=format&fit=crop', bestseller: false, vegan: true },
  
  // Haircare
  { id: 13, name: 'Moringa Curl Cream', category: 'haircare', price: 34, size: '250ml', concern: '', image: 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?w=800&auto=format&fit=crop', bestseller: true, vegan: true },
  { id: 14, name: 'Coconut Deep Conditioner', category: 'haircare', price: 38, size: '200ml', concern: '', image: 'https://images.unsplash.com/photo-1571875257727-256c39da42af?w=800&auto=format&fit=crop', bestseller: false, vegan: true },
  { id: 15, name: 'Growth Oil Elixir', category: 'haircare', price: 44, size: '100ml', concern: '', image: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=800&auto=format&fit=crop', bestseller: true, vegan: true },
  { id: 16, name: 'Detangling Leave-In', category: 'haircare', price: 28, size: '250ml', concern: '', image: 'https://images.unsplash.com/photo-1526045478516-99145907023c?w=800&auto=format&fit=crop', bestseller: false, vegan: true },
  
  // Body Care
  { id: 17, name: 'Shea Body Butter', category: 'bodycare', price: 36, size: '200ml', concern: '', image: 'https://images.unsplash.com/photo-1556229010-6c3f2c9ca5f8?w=800&auto=format&fit=crop', bestseller: true, vegan: true },
  { id: 18, name: 'Coffee Body Scrub', category: 'bodycare', price: 32, size: '250g', concern: '', image: 'https://images.unsplash.com/photo-1564121211835-e88c852648ab?w=800&auto=format&fit=crop', bestseller: true, vegan: true },
  { id: 19, name: 'Baobab Body Oil', category: 'bodycare', price: 42, size: '150ml', concern: '', image: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=800&auto=format&fit=crop', bestseller: false, vegan: true },
  { id: 20, name: 'Lavender Bath Soak', category: 'bodycare', price: 28, size: '300g', concern: '', image: 'https://images.unsplash.com/photo-1600857062241-98e5e6bad3f0?w=800&auto=format&fit=crop', bestseller: false, vegan: true },
]

const skinConcerns = ['All', 'Hyperpigmentation', 'Acne', 'Dryness', 'Anti-Aging', 'Brightening']

function BeautyPage() {
  const [activeCategory, setActiveCategory] = useState(beautyCategories[0])
  const [selectedConcern, setSelectedConcern] = useState('All')
  const [hoveredProduct, setHoveredProduct] = useState<number | null>(null)
  const [showVeganOnly, setShowVeganOnly] = useState(false)
  const containerRef = useRef(null)

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  })

  const filteredProducts = beautyProducts
    .filter(p => p.category === activeCategory.id)
    .filter(p => !showVeganOnly || p.vegan)
    .filter(p => selectedConcern === 'All' || p.concern === selectedConcern)

  return (
    <div ref={containerRef} className="relative bg-[#FAFAF9] min-h-screen overflow-hidden">
      
      {/* Custom Fonts */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,400&family=Manrope:wght@300;400;500;600;700&display=swap');
        
        .font-cormorant { font-family: 'Cormorant Garamond', serif; }
        .font-manrope { font-family: 'Manrope', sans-serif; }
        
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-30px) rotate(5deg); }
        }
        
        @keyframes rotate-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .float-slow { animation: float-slow 8s ease-in-out infinite; }
        .rotate-slow { animation: rotate-slow 30s linear infinite; }
      `}</style>

      {/* Decorative Background Elements - Same style as other pages */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        {/* Gradient Orbs */}
        <motion.div
          className={`absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full blur-3xl bg-gradient-to-br ${activeCategory.gradient} opacity-30`}
          animate={{
            scale: [1, 1.2, 1],
            x: [0, 50, 0],
            y: [0, 30, 0],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute top-1/3 -left-40 w-[500px] h-[500px] rounded-full bg-gradient-to-br from-amber-400/20 to-orange-300/20 blur-3xl opacity-30"
          animate={{
            scale: [1, 1.3, 1],
            x: [0, -30, 0],
            y: [0, 50, 0],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-20 right-1/4 w-[400px] h-[400px] rounded-full bg-gradient-to-br from-emerald-400/15 to-teal-300/15 blur-3xl opacity-30"
          animate={{
            scale: [1, 1.4, 1],
            x: [0, 40, 0],
            y: [0, -40, 0],
          }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Curved Lines */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 1440 900" fill="none">
          <motion.path
            d="M-100 300 Q 200 100, 500 250 T 1100 200 Q 1300 150, 1600 300"
            stroke="currentColor"
            strokeWidth="1"
            className="text-stone-200/60"
            fill="none"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 3, ease: "easeInOut" }}
          />
          <motion.path
            d="M-100 500 Q 300 650, 600 500 T 1200 550 Q 1400 500, 1600 600"
            stroke="currentColor"
            strokeWidth="1"
            className="text-stone-200/40"
            fill="none"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 3, delay: 0.5, ease: "easeInOut" }}
          />
        </svg>

        {/* Geometric Shapes */}
        <div className="absolute top-32 right-1/4 w-32 h-32 border border-stone-300/30 rounded-full rotate-slow" />
        <div className="absolute top-1/2 left-20 w-24 h-24 border-2 border-stone-300/20 rotate-45 float-slow" />
        <div className="absolute bottom-1/4 right-1/3 w-16 h-16 border border-dashed border-stone-400/30 rounded-full" />
      </div>

      {/* Progress Bar */}
      <motion.div 
        className="fixed top-0 left-0 h-1 z-50"
        style={{ 
          width: '100%',
          scaleX: scrollYProgress,
          transformOrigin: '0%',
          background: `linear-gradient(90deg, ${activeCategory.color}, ${activeCategory.color}80)`
        }}
      />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-6 md:px-12 py-24">
        <div className="relative z-10 max-w-7xl w-full">
          
          {/* Top Label */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex items-center gap-4 mb-12"
          >
            <div className="w-20 h-px bg-stone-900" />
            <span className="text-stone-500 text-xs font-manrope tracking-[0.3em] uppercase font-medium">
              Natural Beauty Collection
            </span>
          </motion.div>

          {/* Main Heading */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="mb-16"
          >
            <h1 className="text-[15vw] md:text-[12vw] lg:text-[10rem] font-cormorant font-light leading-[0.85] tracking-tighter text-stone-900 mb-6">
              BOTANICAL
              <br />
              <span className="font-normal italic" style={{ color: activeCategory.color }}>
                Beauty
              </span>
            </h1>
            <p className="text-stone-600 text-lg md:text-xl font-manrope font-light max-w-2xl leading-relaxed">
              Discover African botanical skincare and cosmetics crafted with ancient wisdom 
              and sustainable ingredients for every skin type and tone
            </p>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.6 }}
            className="flex flex-wrap gap-12"
          >
            {beautyCategories.map((cat, index) => (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.8 + index * 0.1 }}
                className="group cursor-pointer"
                onClick={() => setActiveCategory(cat)}
              >
                <div className="text-5xl font-cormorant font-light text-stone-900 mb-2">
                  {beautyProducts.filter(p => p.category === cat.id).length}
                </div>
                <div className="text-stone-500 text-xs font-manrope tracking-wider uppercase">
                  {cat.name}
                </div>
                <div className="w-0 group-hover:w-full h-px bg-stone-400 transition-all duration-500 mt-2" />
              </motion.div>
            ))}
          </motion.div>

        </div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.2 }}
          className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3"
        >
          <span className="text-stone-400 text-xs font-manrope tracking-widest uppercase rotate-180" style={{ writingMode: 'vertical-lr' }}>
            Scroll
          </span>
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-px h-20 bg-gradient-to-b from-transparent via-stone-400 to-transparent"
          />
        </motion.div>
      </section>

      {/* Collections Navigation */}
      <section className="sticky top-0 z-40 bg-[#FAFAF9]/80 backdrop-blur-xl border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-6">
          <div className="flex flex-wrap gap-6 justify-between items-center">
            {beautyCategories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category)}
                className="group relative"
              >
                <div className="flex flex-col items-start gap-1">
                  <span className={`text-sm md:text-base font-manrope tracking-wider transition-colors duration-300 ${
                    activeCategory.id === category.id ? 'text-stone-900 font-medium' : 'text-stone-400 group-hover:text-stone-600'
                  }`}>
                    {category.name}
                  </span>
                  <span className="text-xs font-manrope text-stone-400 group-hover:text-stone-500 transition-colors">
                    {category.tagline}
                  </span>
                </div>
                {activeCategory.id === category.id && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute -bottom-2 left-0 right-0 h-1"
                    style={{ backgroundColor: category.color }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Filters Bar */}
      <section className="py-8 px-6 md:px-12 bg-stone-50/50">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
            
            {/* Skin Concerns (Skincare only) */}
            {activeCategory.id === 'skincare' && (
              <div className="flex flex-wrap gap-3">
                <span className="text-xs font-manrope text-stone-500 uppercase tracking-wider font-medium self-center">
                  Skin Concern:
                </span>
                {skinConcerns.map((concern) => (
                  <button
                    key={concern}
                    onClick={() => setSelectedConcern(concern)}
                    className={`px-4 py-2 rounded-full font-manrope text-xs tracking-wide transition-all ${
                      selectedConcern === concern
                        ? 'bg-stone-900 text-white'
                        : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
                    }`}
                  >
                    {concern}
                  </button>
                ))}
              </div>
            )}

            {/* Vegan Filter */}
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={showVeganOnly}
                  onChange={(e) => setShowVeganOnly(e.target.checked)}
                  className="w-4 h-4 rounded accent-emerald-600"
                />
                <span className="text-sm font-manrope text-stone-600 group-hover:text-stone-900 transition-colors">
                  Vegan Only
                </span>
              </label>

              <div className="w-px h-6 bg-stone-200" />

              <span className="text-sm font-manrope text-stone-500">
                {filteredProducts.length} Products
              </span>
            </div>

          </div>
        </div>
      </section>

      {/* Products Grid */}
      <AnimatePresence mode="wait">
        <motion.section
          key={activeCategory.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="py-24 px-6 md:px-12"
        >
          <div className="max-w-7xl mx-auto">
            
            {/* Category Header */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-24">
              
              {/* Left: Info */}
              <motion.div
                initial={{ opacity: 0, x: -40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                className="space-y-8"
              >
                <div>
                  <motion.div
                    className="inline-block px-6 py-2 border rounded-full mb-6"
                    style={{ borderColor: activeCategory.color }}
                  >
                    <span className="text-xs font-manrope tracking-widest uppercase" style={{ color: activeCategory.color }}>
                      Collection
                    </span>
                  </motion.div>
                  
                  <h2 className="text-7xl md:text-8xl font-cormorant font-light text-stone-900 tracking-tight mb-4">
                    {activeCategory.name}
                  </h2>
                  
                  <div className="flex items-center gap-4 mb-6">
                    <motion.div 
                      className="w-16 h-px"
                      style={{ backgroundColor: activeCategory.color }}
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ duration: 0.8, delay: 0.2 }}
                    />
                    <span className="text-stone-500 text-sm font-manrope tracking-wider uppercase">
                      {filteredProducts.length} Items
                    </span>
                  </div>
                </div>

                <p className="text-stone-600 text-xl font-manrope font-light leading-relaxed">
                  {activeCategory.description}
                </p>

                <motion.button
                  whileHover={{ scale: 1.02, x: 10 }}
                  whileTap={{ scale: 0.98 }}
                  className="group flex items-center gap-4 px-8 py-4 border border-stone-200 hover:border-stone-900 transition-colors"
                >
                  <span className="text-stone-900 font-manrope text-sm tracking-wider uppercase">
                    View All
                  </span>
                  <motion.svg 
                    className="w-5 h-5 text-stone-900"
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </motion.svg>
                </motion.button>
              </motion.div>

              {/* Right: Feature Image */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8 }}
                className="relative aspect-[3/4] overflow-hidden"
              >
                <Image
                  src={filteredProducts[0]?.image || beautyProducts[0].image}
                  alt={activeCategory.name}
                  fill
                  className="object-cover"
                  unoptimized
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-900/60 via-transparent to-transparent" />
                
                {/* Decorative Frame */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="absolute inset-0 border-2 border-stone-900/10"
                >
                  <div className="absolute top-0 left-0 w-16 h-16 border-t-4 border-l-4" style={{ borderColor: activeCategory.color }} />
                  <div className="absolute top-0 right-0 w-16 h-16 border-t-4 border-r-4" style={{ borderColor: activeCategory.color }} />
                  <div className="absolute bottom-0 left-0 w-16 h-16 border-b-4 border-l-4" style={{ borderColor: activeCategory.color }} />
                  <div className="absolute bottom-0 right-0 w-16 h-16 border-b-4 border-r-4" style={{ borderColor: activeCategory.color }} />
                </motion.div>

                {/* Floating Label */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="absolute bottom-8 left-8 bg-white/90 backdrop-blur-md px-6 py-3 border border-white/20"
                >
                  <span className="text-stone-900 text-xs font-manrope tracking-widest uppercase">
                    Featured
                  </span>
                </motion.div>
              </motion.div>

            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {filteredProducts.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  onMouseEnter={() => setHoveredProduct(product.id)}
                  onMouseLeave={() => setHoveredProduct(null)}
                  className="group relative"
                >
                  {/* Product Image */}
                  <div className="relative aspect-[3/4] overflow-hidden mb-4 bg-stone-100">
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                      unoptimized
                    />
                    
                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-stone-900/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                    {/* Badges */}
                    {product.bestseller && (
                      <div className="absolute top-4 right-4 px-4 py-2 bg-white/95 backdrop-blur-sm shadow-lg">
                        <span className="text-xs font-manrope font-medium text-stone-900 tracking-wider uppercase">
                          Bestseller
                        </span>
                      </div>
                    )}

                    {product.vegan && (
                      <div className="absolute top-4 left-4 w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg">
                        <span className="text-white text-xs">🌱</span>
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
                      <button className="px-6 py-3 bg-white text-stone-900 text-xs font-manrope tracking-wider uppercase hover:bg-stone-900 hover:text-white transition-colors">
                        Quick View
                      </button>
                    </motion.div>

                    {/* Diagonal Accent */}
                    <div 
                      className="absolute top-0 right-0 w-20 h-20 opacity-50"
                      style={{ 
                        background: `linear-gradient(135deg, ${activeCategory.color}40 0%, transparent 100%)`
                      }}
                    />
                  </div>

                  {/* Product Info */}
                  <div className="space-y-2">
                    <h3 className="text-stone-900 font-manrope text-base group-hover:text-stone-600 transition-colors">
                      {product.name}
                    </h3>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-stone-500 font-manrope">{product.size}</span>
                      <span className="text-stone-900 font-manrope font-medium">£{product.price}</span>
                    </div>
                    
                    {/* Accent Line */}
                    <motion.div
                      className="h-px bg-stone-200 origin-left"
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: hoveredProduct === product.id ? 1 : 0 }}
                      transition={{ duration: 0.3 }}
                      style={{ backgroundColor: hoveredProduct === product.id ? activeCategory.color : '#e7e5e4' }}
                    />
                  </div>
                </motion.div>
              ))}
            </div>

          </div>
        </motion.section>
      </AnimatePresence>

      {/* Bottom CTA Section */}
      <section className="relative py-32 px-6 md:px-12 overflow-hidden">
        
        {/* Background Glow */}
        <div className="absolute inset-0">
          <div 
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full opacity-20 blur-3xl"
            style={{ backgroundColor: activeCategory.color }}
          />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-6xl md:text-8xl font-cormorant font-light text-stone-900 tracking-tighter mb-6">
              Natural
              <br />
              <span className="font-normal italic" style={{ color: activeCategory.color }}>
                Radiance
              </span>
            </h2>
            <p className="text-stone-600 text-lg font-manrope font-light mb-12">
              Subscribe for skincare tips, exclusive offers, and early access to new products
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <input
              type="email"
              placeholder="Enter your email"
              className="px-8 py-5 bg-white border-2 border-stone-200 font-manrope text-sm focus:outline-none focus:border-stone-900 transition-colors"
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-12 py-5 text-white font-manrope text-sm tracking-wider uppercase transition-colors"
              style={{ backgroundColor: activeCategory.color }}
            >
              Subscribe
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-stone-200 py-12 px-6 md:px-12">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-stone-400 text-xs font-manrope tracking-wider">
            © 2024 BOTANICAL BEAUTY COLLECTION
          </div>
          <div className="flex gap-8">
            {['Instagram', 'Facebook', 'Pinterest'].map((social) => (
              <a 
                key={social}
                href="#"
                className="text-stone-400 hover:text-stone-900 text-xs font-manrope tracking-wider uppercase transition-colors"
              >
                {social}
              </a>
            ))}
          </div>
        </div>
      </footer>

    </div>
  )
}

export default BeautyPage