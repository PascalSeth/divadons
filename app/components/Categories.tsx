'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { ProductCard } from './ProductCard'

// Types
type Category = {
  id: string;
  name: string;
  image?: string | null;
  productCount?: number | null;
  subtitle?: string;
  description?: string;
};

type Product = {
  id: string;
  name: string;
  price: number | string;
  images?: string[];
  image?: string;
  subcategory?: string;
};

const CategoriesShowcase = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [hoveredProduct, setHoveredProduct] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Load Categories
  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch('/api/categories?page=1&pageSize=50&excludeCollectionId=beauty');
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          setCategories(json.data);
          setSelectedCategory(json.data[0] || null);
        }
      } catch (err) {
        console.error('Failed to load categories:', err);
      }
    }
    fetchCategories();
  }, []);

  // Load Products for selected category
  useEffect(() => {
    if (!selectedCategory) return;
    setLoading(true);
    async function fetchProducts() {
      try {
        const res = await fetch(`/api/products?page=1&pageSize=4&category=${encodeURIComponent(selectedCategory?.id || '')}`);
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          setProducts(json.data);
        }
      } catch (err) {
        console.error('Failed to load products:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, [selectedCategory]);

  return (
    <section className="relative w-full bg-[#f8f5f2] py-24 overflow-hidden min-h-screen">
      <div className="max-w-[1800px] mx-auto px-6 md:px-12 lg:px-20">
        
        {/* Editorial Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-8">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, ease: [0.19, 1, 0.22, 1] }}
          >
            <span className="text-[10px] font-mono tracking-[0.5em] uppercase text-stone-400 block mb-4">
              Curated Collections
            </span>
            <h2 className="text-6xl md:text-8xl lg:text-[10rem] font-bold text-stone-900 tracking-tighter leading-none">
              THE <br/> <span className="text-transparent border-t-stone-200 stroke-stone-900" style={{ WebkitTextStroke: '1px #1c1917' }}>LOOKBOOK</span>
            </h2>
          </motion.div>
          
          <motion.div 
            className="md:max-w-xs text-stone-500 font-light leading-relaxed text-sm lg:text-base italic"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 1 }}
          >
            &quot;Fashion is the armor to survive the reality of everyday life. Our lookbook is a curated stage for the modern woman.&quot;
          </motion.div>
        </div>

        <div className="flex flex-col lg:flex-row gap-12 lg:gap-24 relative">
          
          {/* Vertical Index Navigation (Left) */}
          <div className="lg:w-1/4 flex lg:flex-col flex-row flex-wrap gap-8 lg:gap-12 relative z-20 overflow-x-auto lg:overflow-visible no-scrollbar pb-6 lg:pb-0">
            {categories.map((cat, idx) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat)}
                className="group flex items-start gap-4 transition-all duration-500"
              >
                <span className={`text-[10px] font-mono mt-1.5 transition-colors duration-500 ${
                  selectedCategory?.id === cat.id ? 'text-amber-600' : 'text-stone-300'
                }`}>
                  {String(idx + 1).padStart(2, '0')}
                </span>
                <div className="flex flex-col items-start">
                  <span className={`text-2xl md:text-4xl font-light tracking-tight transition-all duration-700 whitespace-nowrap ${
                    selectedCategory?.id === cat.id ? 'text-stone-900 translate-x-2' : 'text-stone-300 group-hover:text-stone-500'
                  }`}>
                    {cat.name}
                  </span>
                  {selectedCategory?.id === cat.id && (
                    <motion.div 
                      layoutId="lookbook-active-line"
                      className="h-px bg-stone-900 mt-2"
                      initial={{ width: 0 }}
                      animate={{ width: '100%' }}
                      transition={{ duration: 0.6 }}
                    />
                  )}
                </div>
              </button>
            ))}
          </div>

          {/* Cinematic Stage (Right) */}
          {/* Cinematic Gallery Stage (Dual-Layer Collage) */}
          <div className="lg:w-3/4 relative">
            <div className="relative aspect-[16/10] lg:aspect-[16/9] w-full overflow-hidden rounded-[2.5rem] group shadow-[0_10px_60px_-15px_rgba(0,0,0,0.15)] bg-[#f3efe9]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={selectedCategory?.id}
                  className="absolute inset-0 z-0"
                >
                  {/* Layer 1: Main Background Image (Curtain Reveal) */}
                  <motion.div
                    initial={{ clipPath: 'inset(0 100% 0 0)', scale: 1.1 }}
                    animate={{ clipPath: 'inset(0 0% 0 0)', scale: 1 }}
                    exit={{ clipPath: 'inset(0 0% 0 100%)', scale: 1.05 }}
                    transition={{ duration: 1.4, ease: [0.77, 0, 0.175, 1] }}
                    className="absolute inset-0 overflow-hidden border border-stone-200/50"
                  >
                    <Image
                      src={selectedCategory?.image || 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=800&auto=format&fit=crop'}
                      alt={selectedCategory?.name || ''}
                      fill
                      className="object-cover grayscale hover:grayscale-0 transition-all duration-[2s] ease-out"
                      unoptimized
                    />
                    <div className="absolute inset-0 bg-stone-950/10" />
                    
                    {/* Visual Watermark Text Behind Detail Card */}
                    <div className="absolute top-10 right-10 flex flex-col items-end text-white select-none pointer-events-none">
                      <span className="text-[12vh] font-bold leading-none opacity-[0.08] tracking-tighter uppercase whitespace-nowrap -rotate-2">
                        {selectedCategory?.name}
                      </span>
                    </div>
                  </motion.div>

                  {/* Layer 2: Floating Detail Card (Offset) */}
                  <motion.div
                    initial={{ opacity: 0, x: 100, scale: 0.8 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: -50, scale: 0.9 }}
                    transition={{ delay: 0.6, duration: 1, ease: [0.19, 1, 0.22, 1] }}
                    className="absolute top-[15%] right-[10%] w-[25%] aspect-[3/4] z-10 shadow-2xl overflow-hidden rounded-2xl border-[6px] border-white/80 backdrop-blur-sm pointer-events-none hidden md:block"
                  >
                    <Image
                       src={selectedCategory?.image || 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=800&auto=format&fit=crop'}
                       alt="Detail View"
                       fill
                       className="object-cover scale-[1.6] object-center grayscale-0"
                       unoptimized
                    />
                    {/* Frame Detail */}
                    <div className="absolute inset-0 border border-black/5" />
                  </motion.div>

                  {/* Gallery Metadata / Specifications */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1, duration: 0.8 }}
                    className="absolute top-12 left-12 z-20 hidden md:flex flex-col gap-1 select-none pointer-events-none"
                  >
                    <span className="text-[9px] font-mono tracking-[0.4em] uppercase text-white shadow-sm">Collection Ref. DIV-024</span>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-mono text-amber-300">Edition: {String(categories.indexOf(selectedCategory!) + 1).padStart(3, '0')} / 050</span>
                      <div className="w-8 h-[1px] bg-white/40" />
                    </div>
                  </motion.div>
                </motion.div>
              </AnimatePresence>
              
              {/* Cinematic Bottom Content */}
              <div className="absolute bottom-10 left-12 right-12 z-20 flex flex-col md:flex-row md:items-end justify-between items-start gap-8">
                <motion.div
                   key={`title-lookbook-${selectedCategory?.id}`}
                   initial={{ opacity: 0, y: 40 }}
                   animate={{ opacity: 1, y: 0 }}
                   transition={{ delay: 1.2, duration: 1 }}
                   className="max-w-md"
                >
                  <p className="text-[9px] font-mono text-amber-500 uppercase tracking-[0.6em] mb-4">Curated Exhibition</p>
                  <h3 className="text-5xl lg:text-7xl font-bold tracking-tighter mb-6 text-white!">
                    {selectedCategory?.name}
                  </h3>
                  <div className="flex items-start gap-4 text-white!">
                    <div className="w-[1px] h-full bg-white/20 min-h-[40px]" />
                    <p className="text-xs font-light text-white!/70 leading-relaxed uppercase tracking-widest max-w-sm">
                      {selectedCategory?.description || 'Exploring the intersection of luxury tradition and contemporary design.'}
                    </p>
                  </div>
                </motion.div>
                
                <Link 
                  href={`/shop?category=${selectedCategory?.id}`}
                   className="relative group p-1"
                >
                  <motion.div
                    className="absolute inset-0 bg-white shadow-xl scale-0 group-hover:scale-100 transition-transform duration-500 rounded-full"
                  />
                  <div className="relative px-10 py-5 bg-stone-900/40 backdrop-blur-md border border-white/20 text-white group-hover:text-stone-900 rounded-full font-bold uppercase text-[9px] tracking-[0.25em] transition-all transform flex items-center gap-3">
                    Enter Gallery
                    <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </div>
                </Link>
              </div>
            </div>

            {/* Asymmetric Product Showcase */}
            <div className="mt-16 relative">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                <AnimatePresence mode="popLayout">
                  {products.map((product, idx) => (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, y: 100 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ 
                        delay: 0.5 + (idx * 0.1), 
                        duration: 1, 
                        ease: [0.19, 1, 0.22, 1] 
                      }}
                      className={`${
                        idx === 1 ? 'md:mt-24' : idx === 3 ? 'md:mt-12' : ''
                      }`}
                    >
                      <ProductCard
                        product={{
                          ...product,
                          price: product.price ?? 0
                        }}
                        isHovered={hoveredProduct === product.id}
                        onHoverStart={() => setHoveredProduct(product.id)}
                        onHoverEnd={() => setHoveredProduct(null)}
                        index={idx}
                        categoryName={selectedCategory?.name}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
              
              {/* Background Geometric Elements */}
              <div className="absolute -top-20 -right-20 w-96 h-96 bg-amber-200/20 rounded-full blur-[100px] -z-10" />
              <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-stone-300/30 rounded-full blur-[120px] -z-10" />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default CategoriesShowcase