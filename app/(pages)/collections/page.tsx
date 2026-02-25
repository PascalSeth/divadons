'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'

// Type definitions
interface Product {
  id: string;
  name: string;
  image?: string;
  images?: string[];
  price: number | string;
  subcategory?: string;
  category?: string;
  categoryId?: string;
}

interface Category {
  id: string;
  name: string;
  subtitle?: string;
  image?: string;
  imageUrl?: string;
  color?: string;
  gradient?: string;
  products?: Product[];
}

interface Collection {
  id: string;
  name: string;
  color: string;
  gradient?: string;
  subtitle?: string;
  count?: number;
  description?: string;
  products: Product[];
  categories?: Category[];
}

function CollectionsPage() {
  const [collectionsData, setCollectionsData] = useState<Collection[]>([])
  const [activeCollection, setActiveCollection] = useState<Collection | null>(null)
  const [hoveredProduct, setHoveredProduct] = useState<string | null>(null)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const containerRef = useRef<HTMLDivElement>(null)
  
  const { scrollYProgress } = useScroll({
    offset: ["start start", "end end"]
  })

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  useEffect(() => {
    async function loadCollections() {
      try {
        const res = await fetch('/api/collections?page=1&pageSize=50&excludeIds=beauty')
        const json = await res.json()
        if (json.success && Array.isArray(json.data)) {
          setCollectionsData(json.data)
          // set initial active collection to first
          if (json.data.length > 0) {
            setActiveCollection(json.data[0])
          }
        }
      } catch {
        // ignore
      }
    }

    loadCollections()
  }, [])

  // Load full collection details (including products) when activeCollection changes
  useEffect(() => {
    if (!activeCollection?.id) return
    async function loadCollectionDetail(id: string) {
      try {
        const res = await fetch(`/api/collections/${encodeURIComponent(id)}`)
        const json = await res.json()
        if (json.success && json.data) {
          const data = json.data
          // normalize products array to product objects
          const isRecord = (x: unknown): x is Record<string, unknown> => typeof x === 'object' && x !== null

          const products: Product[] = []
          const categories: Category[] = []

          // Process categories and their products
          if (Array.isArray(data.categories)) {
            for (const cc of data.categories) {
              if (!isRecord(cc)) continue
              const maybeCategory = cc['category']
              if (!isRecord(maybeCategory)) continue
              
              const catId = String(maybeCategory['id'] ?? '')
              const catName = String(maybeCategory['name'] ?? maybeCategory['title'] ?? '')
              const catImage = String(maybeCategory['imageUrl'] ?? maybeCategory['image'] ?? '')
              const catColor = String(maybeCategory['color'] ?? '')
              const catGradient = String(maybeCategory['gradient'] ?? '')
              
              const catProducts: Product[] = []
              const catProductsRaw = maybeCategory['products']
              if (Array.isArray(catProductsRaw)) {
                for (const prod of catProductsRaw) {
                  if (!isRecord(prod)) continue
                  const normalizedProd: Product = {
                    id: String(prod['id'] ?? ''),
                    name: String(prod['name'] ?? ''),
                    image: Array.isArray(prod['images']) && prod['images'].length > 0 
                      ? String(prod['images'][0]) 
                      : String(prod['image'] ?? ''),
                    images: Array.isArray(prod['images']) ? prod['images'] as string[] : undefined,
                    price: typeof prod['price'] === 'number' ? prod['price'] : String(prod['price'] ?? '0'),
                    category: catName,
                    categoryId: catId,
                  }
                  catProducts.push(normalizedProd)
                  products.push(normalizedProd)
                }
              }
              
              categories.push({
                id: catId,
                name: catName,
                image: catImage,
                color: catColor,
                gradient: catGradient,
                products: catProducts,
              })
            }
          }

          // Also process standalone products from the products array
          if (Array.isArray(data.products)) {
            for (const item of data.products) {
              let prod: unknown = item
              if (isRecord(item) && 'product' in item) prod = (item as Record<string, unknown>)['product']

              const getFieldFrom = (pArg: unknown, keys: string[]) => {
                if (!isRecord(pArg)) return ''
                for (const k of keys) {
                  const v = (pArg as Record<string, unknown>)[k]
                  if (v != null) return v
                }
                return ''
              }
              const getArrayFrom = (pArg: unknown, keys: string[]) => {
                if (!isRecord(pArg)) return undefined as string[] | undefined
                for (const k of keys) {
                  const v = (pArg as Record<string, unknown>)[k]
                  if (Array.isArray(v)) return v as string[]
                }
                return undefined
              }

              const prodId = String(getFieldFrom(prod, ['id', '_id']) || '')
              // Skip if already added from categories
              if (products.some(p => p.id === prodId)) continue

              const normalized: Product = {
                id: prodId,
                name: String(getFieldFrom(prod, ['name', 'title']) || ''),
                image: String(getFieldFrom(prod, ['image', 'thumbnail']) || (getArrayFrom(prod, ['images'])?.[0] ?? '')),
                images: getArrayFrom(prod, ['images', 'gallery']),
                price: (() => {
                  const v = getFieldFrom(prod, ['price', 'amount'])
                  if (typeof v === 'number') return v
                  if (typeof v === 'string' && v !== '') {
                    const n = Number(v)
                    return Number.isFinite(n) ? n : v
                  }
                  return 0
                })(),
                subcategory: String(getFieldFrom(prod, ['subcategory', 'sub_category', 'subCategory', 'sub']) || ''),
                category: String(getFieldFrom(prod, ['category', 'categoryName', 'cat', 'collection']) || ''),
              }

              products.push(normalized)
            }
          }

          setActiveCollection((prev: Collection | null) => prev ? { ...prev, ...data, products, categories } : { ...data, products, categories })
        }
      } catch {
        // ignore
      }
    }

    loadCollectionDetail(activeCollection.id)
  }, [activeCollection?.id])

  // Hook calls must be before any early returns
  const parallaxX = useTransform(scrollYProgress, [0, 1], [0, -100])
  const parallaxY = useTransform(scrollYProgress, [0, 1], [0, 200])

  if (!activeCollection) {
    return (
      <div className="min-h-screen flex items-center justify-center">Loading collections...</div>
    )
  }

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
        
        @keyframes float-medium {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          50% { transform: translateY(-20px) translateX(20px); }
        }

        @keyframes rotate-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes draw-line {
          to { stroke-dashoffset: 0; }
        }

        .float-slow { animation: float-slow 8s ease-in-out infinite; }
        .float-medium { animation: float-medium 6s ease-in-out infinite; }
        .rotate-slow { animation: rotate-slow 30s linear infinite; }
      `}</style>

      {/* Decorative Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        
        {/* Curved Lines SVG */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 1440 900" fill="none" xmlns="http://www.w3.org/2000/svg">
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
          <motion.path
            d="M-100 700 Q 400 550, 700 700 T 1300 650"
            stroke="currentColor"
            strokeWidth="1.5"
            className="text-stone-300/30"
            fill="none"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 3, delay: 1, ease: "easeInOut" }}
          />
        </svg>

        {/* Gradient Orbs */}
        <motion.div
          className={`absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full blur-3xl bg-gradient-to-br ${activeCollection.gradient} opacity-30`}
          animate={{
            scale: [1, 1.2, 1],
            x: [0, 50, 0],
            y: [0, 30, 0],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute top-1/3 -left-40 w-[500px] h-[500px] rounded-full blur-3xl bg-gradient-to-br from-amber-400/20 to-orange-300/20 opacity-30"
          animate={{
            scale: [1, 1.3, 1],
            x: [0, -30, 0],
            y: [0, 50, 0],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-20 right-1/4 w-[400px] h-[400px] rounded-full blur-3xl bg-gradient-to-br from-emerald-400/15 to-teal-300/15 opacity-30"
          animate={{
            scale: [1, 1.4, 1],
            x: [0, 40, 0],
            y: [0, -40, 0],
          }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Geometric Shapes */}
        <motion.div
          className="absolute top-32 right-1/4 w-32 h-32 border border-stone-300/30 rounded-full rotate-slow"
          style={{
            x: parallaxX,
            y: parallaxY,
          }}
        />
        <motion.div
          className="absolute top-1/2 left-20 w-24 h-24 border-2 border-stone-300/20 rotate-45 float-slow"
        />
        <motion.div
          className="absolute bottom-1/4 right-1/3 w-16 h-16 border border-dashed border-stone-400/30 rounded-full float-medium"
        />

        {/* Dots Pattern */}
        <div className="absolute top-1/4 left-1/3 w-32 h-32 opacity-20">
          {[...Array(25)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 rounded-full bg-stone-400"
              style={{
                left: `${(i % 5) * 25}%`,
                top: `${Math.floor(i / 5) * 25}%`,
              }}
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                delay: i * 0.1,
              }}
            />
          ))}
        </div>

        {/* Curved Line Accent */}
        <svg className="absolute bottom-20 left-10 w-64 h-64 opacity-20" viewBox="0 0 200 200">
          <motion.path
            d="M10 100 Q 60 10, 100 50 T 190 100"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
            className="text-stone-400"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
          />
        </svg>

        {/* Mouse Follower Gradient */}
        <motion.div
          className="absolute w-96 h-96 rounded-full blur-3xl pointer-events-none"
          style={{
            background: `radial-gradient(circle, ${activeCollection.color}15, transparent 70%)`,
            x: mousePosition.x - 192,
            y: mousePosition.y - 192,
          }}
          transition={{ type: "spring", damping: 30, stiffness: 200 }}
        />
      </div>

      {/* Progress Bar */}
      <motion.div 
        className="fixed top-0 left-0 h-1 z-50"
        style={{ 
          width: '100%',
          scaleX: scrollYProgress,
          transformOrigin: '0%',
          background: `linear-gradient(90deg, ${activeCollection.color}, ${activeCollection.color}80)`
        }}
      />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-6 md:px-12 py-32">
        
        <div className="relative z-10 max-w-7xl w-full">
          
          {/* Top Label with Line */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="flex items-center gap-6 mb-16"
          >
            <motion.div 
              className="h-px bg-stone-900"
              initial={{ width: 0 }}
              animate={{ width: 100 }}
              transition={{ duration: 1, delay: 0.4 }}
            />
            <span className="text-stone-500 text-xs font-manrope tracking-[0.4em] uppercase font-medium">
              2024 Collections
            </span>
            <motion.div 
              className="h-px bg-stone-300"
              initial={{ width: 0 }}
              animate={{ width: 300 }}
              transition={{ duration: 1, delay: 0.6 }}
            />
          </motion.div>

          {/* Main Heading */}
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.4 }}
            className="mb-20"
          >
            <h1 className="text-[12vw] md:text-[10vw] lg:text-[9rem] font-cormorant font-light leading-[0.9] tracking-tight text-stone-900 mb-8">
              African
              <br />
              <span className="font-normal italic" style={{ color: activeCollection.color }}>
                Heritage
              </span>
              <br />
              <span className="text-stone-400">Collection</span>
            </h1>
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, delay: 0.8 }}
              className="max-w-2xl"
            >
              <p className="text-stone-600 text-xl md:text-2xl font-manrope font-light leading-relaxed">
                Discover the intersection of traditional craftsmanship and contemporary design. 
                Each piece tells a story of culture, beauty, and timeless elegance.
              </p>
            </motion.div>
          </motion.div>

          {/* Collection Stats Grid */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1 }}
            className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-16"
          >
            {collectionsData.map((col, index) => (
              <motion.div
                key={col.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 1.2 + index * 0.1 }}
                className="group cursor-pointer"
                onClick={() => setActiveCollection(col)}
              >
                <div className="relative">
                  <div 
                    className={`text-6xl font-cormorant font-light mb-2 transition-colors duration-300 ${
                      activeCollection.id === col.id ? 'text-stone-900' : 'text-stone-300 group-hover:text-stone-600'
                    }`}
                  >
                    {col.count}
                  </div>
                  <div className="text-stone-500 text-xs font-manrope tracking-widest uppercase">
                    {col.name}
                  </div>
                  <motion.div
                    className="h-0.5 mt-3 origin-left"
                    style={{ backgroundColor: col.color }}
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: activeCollection.id === col.id ? 1 : 0 }}
                    transition={{ duration: 0.4 }}
                  />
                </div>
              </motion.div>
            ))}
          </motion.div>

        </div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.6 }}
          className="absolute bottom-16 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="flex flex-col items-center gap-4"
          >
            <span className="text-stone-400 text-xs font-manrope tracking-widest uppercase">
              Scroll
            </span>
            <div className="w-px h-24 bg-gradient-to-b from-stone-400 to-transparent" />
          </motion.div>
        </motion.div>
      </section>

      {/* Collections Navigation */}
          <section className="sticky top-0 z-40 bg-[#FAFAF9]/90 backdrop-blur-xl border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-6">
          <div className="flex flex-wrap gap-8 justify-center items-center">
            {collectionsData.map((collection) => (
              <button
                key={collection.id}
                onClick={() => setActiveCollection(collection)}
                className="group relative"
              >
                <div className="flex flex-col items-start gap-1">
                  <span className={`text-base md:text-lg font-manrope font-medium tracking-wide transition-all duration-300 ${
                    activeCollection.id === collection.id 
                      ? 'text-stone-900' 
                      : 'text-stone-400 group-hover:text-stone-600'
                  }`}>
                    {collection.name}
                  </span>
                  <span className="text-xs font-manrope text-stone-400 group-hover:text-stone-500 transition-colors">
                    {collection.subtitle}
                  </span>
                </div>
                {activeCollection.id === collection.id && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute -bottom-3 left-0 right-0 h-1 rounded-full"
                    style={{ backgroundColor: collection.color }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Collection Display */}
      <AnimatePresence mode="wait">
        <motion.section
          key={activeCollection.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
          className="py-32 px-6 md:px-12 relative"
        >
          {/* Decorative Background for Section */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <motion.div
              className={`absolute top-0 right-0 w-[800px] h-[800px] rounded-full blur-3xl bg-gradient-to-br ${activeCollection.gradient} opacity-20`}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 0.2 }}
              transition={{ duration: 1 }}
            />
            <svg className="absolute top-1/4 left-10 w-96 h-96 opacity-10" viewBox="0 0 200 200">
              <motion.circle
                cx="100"
                cy="100"
                r="80"
                stroke="currentColor"
                strokeWidth="1"
                fill="none"
                className="text-stone-400"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 2, ease: "easeInOut" }}
              />
            </svg>
          </div>

          <div className="max-w-7xl mx-auto relative z-10">
            
            {/* Collection Header */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 mb-32">
              
              {/* Left: Info */}
              <motion.div
                initial={{ opacity: 0, x: -60 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 1 }}
                className="space-y-10"
              >
                <div>
                  <motion.div
                    className="inline-flex items-center gap-4 px-6 py-3 rounded-full border mb-8"
                    style={{ 
                      borderColor: activeCollection.color,
                      backgroundColor: `${activeCollection.color}10`
                    }}
                  >
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: activeCollection.color }} />
                    <span className="text-xs font-manrope tracking-widest uppercase font-medium" style={{ color: activeCollection.color }}>
                      Collection {String(collectionsData.indexOf(activeCollection) + 1).padStart(2, '0')}
                    </span>
                  </motion.div>
                  
                  <h2 className="text-7xl md:text-8xl lg:text-9xl font-cormorant font-light text-stone-900 tracking-tight leading-[0.9] mb-6">
                    {activeCollection.name}
                  </h2>
                  
                  <div className="flex items-center gap-6 mb-8">
                    <motion.div 
                      className="h-px"
                      style={{ backgroundColor: activeCollection.color }}
                      initial={{ width: 0 }}
                      animate={{ width: 80 }}
                      transition={{ duration: 0.8, delay: 0.2 }}
                    />
                    <span className="text-stone-500 text-sm font-manrope tracking-wider uppercase">
                      {activeCollection.count} Pieces
                    </span>
                  </div>
                </div>

                <p className="text-stone-600 text-xl md:text-2xl font-manrope font-light leading-relaxed">
                  {activeCollection.description}
                </p>

                <motion.button
                  whileHover={{ scale: 1.02, x: 8 }}
                  whileTap={{ scale: 0.98 }}
                  className="group inline-flex items-center gap-4 px-10 py-5 bg-stone-900 text-white! rounded-full hover:bg-stone-800 transition-colors"
                >
                  <span className="font-manrope text-sm tracking-wider uppercase font-medium">
                    Explore Collection
                  </span>
                  <motion.svg 
                    className="w-5 h-5"
                    animate={{ x: [0, 4, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </motion.svg>
                </motion.button>
              </motion.div>

              {/* Right: Feature Image */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1, delay: 0.2 }}
                className="relative"
              >
                <div className="relative aspect-[4/5] overflow-hidden rounded-3xl shadow-2xl">
                  {activeCollection.products[0]?.image ? (
                    <Image
                      src={activeCollection.products[0].image}
                      alt={activeCollection.name}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  ) : (
                    <div className="w-full h-full bg-stone-200 flex items-center justify-center">
                      <span className="text-stone-400">No image</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-900/50 via-transparent to-transparent" />
                  
                  {/* Corner Accents */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="absolute inset-0 p-6"
                  >
                    <div className="absolute top-6 left-6 w-20 h-20 border-t-4 border-l-4 border-white/60 rounded-tl-2xl" />
                    <div className="absolute bottom-6 right-6 w-20 h-20 border-b-4 border-r-4 border-white/60 rounded-br-2xl" />
                  </motion.div>

                  {/* Floating Badge */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                    className="absolute bottom-8 left-8 bg-white/95 backdrop-blur-sm px-6 py-3 rounded-full shadow-lg"
                  >
                    <span className="text-stone-900 text-xs font-manrope tracking-widest uppercase font-medium">
                      Featured
                    </span>
                  </motion.div>
                  {/* Category Badge (top-left) */}
                  {(activeCollection.products[0]?.category || activeCollection.products[0]?.subcategory) && (
                    <div className="absolute top-6 left-6 bg-white/90 text-xs rounded-full px-3 py-1 shadow-md">
                      <span className="font-manrope font-medium text-stone-900 uppercase">
                        {activeCollection.products[0].category || activeCollection.products[0].subcategory}
                      </span>
                    </div>
                  )}
                </div>

                {/* Decorative Elements Around Image */}
                <motion.div
                  className="absolute -top-6 -right-6 w-32 h-32 rounded-full border-2 border-stone-200 float-slow"
                  style={{ borderColor: activeCollection.color + '40' }}
                />
                <motion.div
                  className="absolute -bottom-6 -left-6 w-24 h-24 border-2 border-dashed border-stone-300 rounded-full float-medium"
                  style={{ borderColor: activeCollection.color + '40' }}
                />
              </motion.div>

            </div>

            {/* Products by Category */}
            <div className="space-y-16">
              {/* If we have categories with products, display by category */}
              {activeCollection.categories && activeCollection.categories.length > 0 ? (
                activeCollection.categories.map((category, catIndex) => (
                  <div key={`${category.id}-${catIndex}`} className="space-y-8">
                    {/* Category Header */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.8, delay: catIndex * 0.1 }}
                      className="flex items-center gap-6"
                    >
                      <div 
                        className="w-4 h-4 rounded-full" 
                        style={{ backgroundColor: category.color || activeCollection.color }}
                      />
                      <h3 className="text-3xl font-cormorant font-light text-stone-900">
                        {category.name}
                      </h3>
                      <div className="flex-1 h-px bg-gradient-to-r from-stone-300 to-transparent" />
                      <span className="text-sm text-stone-500 font-manrope">
                        {category.products?.length || 0} pieces
                      </span>
                    </motion.div>

                    {/* Products Grid for this Category */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                      {category.products?.map((product, index) => (
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
                                  : product.image || ''
                              }
                              alt={product.name}
                              fill
                              className="object-cover transition-transform duration-700 group-hover:scale-105"
                              unoptimized
                            />
                            
                            {/* Category Badge Overlay */}
                            <div 
                              className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300"
                            >
                              <div 
                                className="inline-block px-3 py-1.5 rounded-full text-xs font-manrope font-medium uppercase tracking-wider text-white!"
                                style={{ backgroundColor: category.color || activeCollection.color }}
                              >
                                {category.name}
                              </div>
                            </div>
                            
                            
                          </div>

                          {/* Text Content */}
                          <div className="relative">
                            <h3 className="text-xl font-medium text-neutral-900 mb-1">{product.name}</h3>
                            <div className="flex justify-between items-center text-sm text-neutral-500">
                              <span>{product.subcategory || category.name}</span>
                              <span className="font-mono">${typeof product.price === 'number' ? product.price.toFixed(2) : product.price}</span>
                            </div>
                            
                            <div className="absolute bottom-0 left-0 right-0 h-px bg-neutral-200 origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
                          </div>
                        </motion.div>
                        </Link>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                /* Fallback: Display all products without category grouping */
                <>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="flex items-center gap-6 mb-12"
                  >
                    <h3 className="text-4xl font-cormorant font-light text-stone-900">
                      Featured Pieces
                    </h3>
                    <div className="flex-1 h-px bg-gradient-to-r from-stone-300 to-transparent" />
                  </motion.div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {activeCollection.products.map((product, index) => (
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
                                : product.image || ''
                            }
                            alt={product.name}
                            fill
                            className="object-cover transition-transform duration-700 group-hover:scale-105"
                            unoptimized
                          />
                          
                          {/* Category Badge Overlay */}
                          {(product.category || product.subcategory) && (
                            <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                              <div 
                                className="inline-block px-3 py-1.5 rounded-full text-xs font-manrope font-medium uppercase tracking-wider text-white!"
                                style={{ backgroundColor: activeCollection.color }}
                              >
                                {product.category || product.subcategory}
                              </div>
                            </div>
                          )}
                          
                          
                        </div>

                        {/* Text Content */}
                        <div className="relative">
                          <h3 className="text-xl font-medium text-neutral-900 mb-1">{product.name}</h3>
                          <div className="flex justify-between items-center text-sm text-neutral-500">
                            <span>{product.subcategory || product.category || ''}</span>
                            <span className="font-mono">${typeof product.price === 'number' ? product.price.toFixed(2) : product.price}</span>
                          </div>
                          
                          <div className="absolute bottom-0 left-0 right-0 h-px bg-neutral-200 origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
                        </div>
                        </motion.div>
                      </Link>
                    ))}
                  </div>
                </>
              )}
            </div>

          </div>
        </motion.section>
      </AnimatePresence>

      {/* Bottom CTA Section */}
      <section className="relative py-40 px-6 md:px-12 overflow-hidden">
        
        {/* Background Decorative Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 1440 600">
            <motion.path
              d="M0 300 Q 360 150, 720 300 T 1440 300"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
              className="text-stone-200"
              initial={{ pathLength: 0 }}
              whileInView={{ pathLength: 1 }}
              transition={{ duration: 2 }}
              viewport={{ once: true }}
            />
          </svg>
          <motion.div
            className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] rounded-full blur-3xl bg-gradient-to-br ${activeCollection.gradient} opacity-20`}
            animate={{
              scale: [1, 1.2, 1],
            }}
            transition={{ duration: 8, repeat: Infinity }}
          />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto text-center space-y-12">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            viewport={{ once: true }}
          >
            <motion.div
              initial={{ width: 0 }}
              whileInView={{ width: 100 }}
              transition={{ duration: 1 }}
              className="h-px bg-stone-300 mx-auto mb-8"
            />
            <h2 className="text-6xl md:text-8xl font-cormorant font-light text-stone-900 tracking-tight mb-8">
              Begin Your
              <br />
              <span className="font-normal italic" style={{ color: activeCollection.color }}>
                Journey
              </span>
            </h2>
            <p className="text-stone-600 text-xl md:text-2xl font-manrope font-light max-w-3xl mx-auto leading-relaxed">
              Immerse yourself in the rich tapestry of African design. 
              Every collection celebrates heritage, craftsmanship, and modern elegance.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            viewport={{ once: true }}
            className="flex flex-col sm:flex-row gap-6 justify-center pt-6"
          >
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              className="px-12 py-5 text-white! rounded-full font-manrope text-sm tracking-wider uppercase font-medium shadow-2xl transition-all"
              style={{ backgroundColor: activeCollection.color }}
            >
              Shop All Collections
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              className="px-12 py-5 bg-transparent border-2 border-stone-300 text-stone-900 hover:border-stone-900 rounded-full font-manrope text-sm tracking-wider uppercase font-medium transition-all"
            >
              Our Story
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
          <footer className="border-t border-stone-200 py-16 px-6 md:px-12 bg-stone-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
            <div>
              <h4 className="text-2xl font-cormorant font-light text-stone-900 mb-4">
                African Heritage
              </h4>
              <p className="text-stone-600 font-manrope text-sm leading-relaxed">
                Celebrating culture through contemporary fashion and beauty.
              </p>
            </div>
                <div>
              <h5 className="text-sm font-manrope tracking-widest uppercase text-stone-900 mb-4 font-medium">
                Collections
              </h5>
              <ul className="space-y-2">
                {collectionsData.map((col) => (
                  <li key={col.id}>
                    <a href="#" className="text-stone-600 hover:text-stone-900 font-manrope text-sm transition-colors">
                      {col.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h5 className="text-sm font-manrope tracking-widest uppercase text-stone-900 mb-4 font-medium">
                Connect
              </h5>
              <div className="flex gap-6">
                {['Instagram', 'Facebook', 'Pinterest'].map((social) => (
                  <a 
                    key={social}
                    href="#"
                    className="text-stone-600 hover:text-stone-900 font-manrope text-sm transition-colors"
                  >
                    {social}
                  </a>
                ))}
              </div>
            </div>
          </div>
          <div className="pt-8 border-t border-stone-200 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-stone-500 text-xs font-manrope tracking-wider">
              © 2024 AFRICAN HERITAGE COLLECTION. ALL RIGHTS RESERVED.
            </p>
            <div className="flex gap-6">
              <a href="#" className="text-stone-500 hover:text-stone-900 text-xs font-manrope tracking-wider transition-colors">
                PRIVACY
              </a>
              <a href="#" className="text-stone-500 hover:text-stone-900 text-xs font-manrope tracking-wider transition-colors">
                TERMS
              </a>
            </div>
          </div>
        </div>
      </footer>

    </div>
  )
}

export default CollectionsPage