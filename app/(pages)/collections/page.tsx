'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion'
import Image from 'next/image'

// Collections Data
const collections = [
  {
    id: 'ankara',
    name: 'ANKARA',
    subtitle: 'Bold Patterns',
    description: 'Vibrant prints that tell stories of heritage and contemporary style',
    count: 48,
    color: '#DC2626',
    gradient: 'from-red-500/20 to-orange-500/20',
    products: [
      { id: 1, name: 'Adire Wrap Dress', price: '189.00', image: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=800&auto=format&fit=crop' },
      { id: 2, name: 'Ankara Blazer Set', price: '245.00', image: 'https://images.unsplash.com/photo-1560243563-062bfc001d68?w=800&auto=format&fit=crop' },
      { id: 3, name: 'Print Midi Skirt', price: '156.00', image: 'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=800&auto=format&fit=crop' },
      { id: 4, name: 'Statement Jumpsuit', price: '298.00', image: 'https://images.unsplash.com/photo-1617922001439-4a2e6562f328?w=800&auto=format&fit=crop' },
    ]
  },
  {
    id: 'kente',
    name: 'KENTE',
    subtitle: 'Royal Elegance',
    description: 'Luxurious handwoven textiles with centuries of cultural significance',
    count: 32,
    color: '#D97706',
    gradient: 'from-amber-500/20 to-yellow-500/20',
    products: [
      { id: 5, name: 'Kente Evening Gown', price: '425.00', image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&auto=format&fit=crop' },
      { id: 6, name: 'Royal Wrapper', price: '385.00', image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&auto=format&fit=crop' },
      { id: 7, name: 'Prestige Cape', price: '340.00', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&auto=format&fit=crop' },
      { id: 8, name: 'Ceremonial Set', price: '510.00', image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800&auto=format&fit=crop' },
    ]
  },
  {
    id: 'dashiki',
    name: 'DASHIKI',
    subtitle: 'Cultural Pride',
    description: 'Modern interpretations of timeless silhouettes and embroidery',
    count: 56,
    color: '#059669',
    gradient: 'from-emerald-500/20 to-teal-500/20',
    products: [
      { id: 9, name: 'Classic Dashiki', price: '125.00', image: 'https://images.unsplash.com/photo-1516762689617-e1cffcef479d?w=800&auto=format&fit=crop' },
      { id: 10, name: 'Embroidered Tunic', price: '178.00', image: 'https://images.unsplash.com/photo-1564859228273-274232fdb516?w=800&auto=format&fit=crop' },
      { id: 11, name: 'Festival Dashiki', price: '145.00', image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800&auto=format&fit=crop' },
      { id: 12, name: 'Heritage Caftan', price: '210.00', image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&auto=format&fit=crop' },
    ]
  },
  {
    id: 'beauty',
    name: 'BOTANICALS',
    subtitle: 'Natural Beauty',
    description: 'Plant-based skincare rooted in ancestral beauty rituals',
    count: 64,
    color: '#7C3AED',
    gradient: 'from-violet-500/20 to-purple-500/20',
    products: [
      { id: 13, name: 'Shea Glow Serum', price: '48.00', image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800&auto=format&fit=crop' },
      { id: 14, name: 'Black Soap Detox', price: '32.00', image: 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=800&auto=format&fit=crop' },
      { id: 15, name: 'Baobab Face Oil', price: '56.00', image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800&auto=format&fit=crop' },
      { id: 16, name: 'Hibiscus Toner', price: '38.00', image: 'https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=800&auto=format&fit=crop' },
    ]
  },
  {
    id: 'accessories',
    name: 'ADORNMENTS',
    subtitle: 'Finishing Touch',
    description: 'Handcrafted jewelry and accessories that complete every look',
    count: 42,
    color: '#DB2777',
    gradient: 'from-pink-500/20 to-rose-500/20',
    products: [
      { id: 17, name: 'Brass Statement Collar', price: '89.00', image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&auto=format&fit=crop' },
      { id: 18, name: 'Cowrie Shell Set', price: '65.00', image: 'https://images.unsplash.com/photo-1610652620062-49e21e4c97b6?w=800&auto=format&fit=crop' },
      { id: 19, name: 'Leather Gele Bag', price: '135.00', image: 'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?w=800&auto=format&fit=crop' },
      { id: 20, name: 'Beaded Waist Chain', price: '72.00', image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce538?w=800&auto=format&fit=crop' },
    ]
  },
]

function CollectionsPage() {
  const [activeCollection, setActiveCollection] = useState(collections[0])
  const [hoveredProduct, setHoveredProduct] = useState<number | null>(null)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const containerRef = useRef(null)
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  })

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

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
            x: useTransform(scrollYProgress, [0, 1], [0, -100]),
            y: useTransform(scrollYProgress, [0, 1], [0, 200]),
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
            {collections.map((col, index) => (
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
            {collections.map((collection) => (
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
                      Collection {String(collections.indexOf(activeCollection) + 1).padStart(2, '0')}
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
                  className="group inline-flex items-center gap-4 px-10 py-5 bg-stone-900 text-white rounded-full hover:bg-stone-800 transition-colors"
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
                  <Image
                    src={activeCollection.products[0].image}
                    alt={activeCollection.name}
                    fill
                    className="object-cover"
                    unoptimized
                  />
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

            {/* Products Grid */}
            <div>
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
                    <div className="relative aspect-[3/4] overflow-hidden rounded-2xl mb-6 bg-stone-100 shadow-lg">
                      <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                        unoptimized
                      />
                      
                      {/* Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-stone-900/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                      {/* Quick View Button */}
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ 
                          opacity: hoveredProduct === product.id ? 1 : 0,
                          y: hoveredProduct === product.id ? 0 : 20
                        }}
                        className="absolute inset-0 flex items-center justify-center"
                      >
                        <button 
                          className="px-6 py-3 bg-white text-stone-900 rounded-full text-xs font-manrope tracking-wider uppercase font-medium shadow-xl hover:bg-stone-900 hover:text-white transition-colors"
                        >
                          Quick View
                        </button>
                      </motion.div>

                      {/* Color Accent Corner */}
                      <div 
                        className="absolute top-0 right-0 w-24 h-24 opacity-50 rounded-bl-full transition-opacity duration-500"
                        style={{ 
                          background: `linear-gradient(225deg, ${activeCollection.color}40 0%, transparent 70%)`,
                          opacity: hoveredProduct === product.id ? 0.7 : 0.3
                        }}
                      />
                    </div>

                    {/* Product Info */}
                    <div className="space-y-3">
                      <h3 className="text-stone-900 font-manrope text-lg font-medium group-hover:text-stone-600 transition-colors">
                        {product.name}
                      </h3>
                      <div className="flex justify-between items-center">
                        <span className="text-stone-500 text-base font-manrope tracking-wide">
                          ${product.price}
                        </span>
                        <motion.button
                          whileHover={{ rotate: 90, scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="w-10 h-10 rounded-full border-2 flex items-center justify-center transition-colors"
                          style={{ 
                            borderColor: hoveredProduct === product.id ? activeCollection.color : '#D6D3D1',
                            color: hoveredProduct === product.id ? activeCollection.color : '#78716C'
                          }}
                        >
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                        </motion.button>
                      </div>
                      
                      {/* Accent Line */}
                      <motion.div
                        className="h-0.5 rounded-full origin-left"
                        style={{ backgroundColor: activeCollection.color }}
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: hoveredProduct === product.id ? 1 : 0 }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                  </motion.div>
                ))}
              </div>
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
              className="px-12 py-5 text-white rounded-full font-manrope text-sm tracking-wider uppercase font-medium shadow-2xl transition-all"
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
                {collections.map((col) => (
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