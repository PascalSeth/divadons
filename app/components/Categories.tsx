'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'

// API-driven data; categories and products will be fetched from the server
// Minimal types for category and product shapes expected from the API
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
  price?: number | string;
  images?: string[];
  image?: string;
  subcategory?: string;
};

const initialCategories: Category[] = [];

// --- SVG Components ---
const Squiggle = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 100 20" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round">
    <path d="M2 10c5-5 10 5 15 0s10 5 15 0 10 5 15 0 10 5 15 0 10 5 15 0 10 5 15 0 10 5 15 0" />
  </svg>
);

function CategoriesShowcase() {
  const [categoriesData, setCategoriesData] = useState<Category[]>(initialCategories);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [productsData, setProductsData] = useState<Product[]>([]);
  const [hoveredProduct, setHoveredProduct] = useState<string | null>(null);

  const filteredProducts = productsData;

  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await fetch('/api/categories?page=1&pageSize=50');
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          setCategoriesData(json.data);
          setSelectedCategory(json.data[0] || null);
        }
      } catch {
        // ignore
      }
    }
    loadCategories();
  }, []);

  useEffect(() => {
    if (!selectedCategory) return;
    const categoryId = selectedCategory.id;
    async function loadProducts() {
      try {
        const res = await fetch(`/api/products?page=1&pageSize=50&category=${encodeURIComponent(categoryId)}`);
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          setProductsData(json.data);
        } else {
          setProductsData([]);
        }
      } catch {
        setProductsData([]);
      }
    }
    loadProducts();
  }, [selectedCategory]);

  return (
    <section className="relative w-full min-h-screen bg-white py-24 px-6 md:px-12 lg:px-24 font-sans overflow-hidden selection:bg-amber-200 selection:text-amber-900">
      
      {/* --- Decorative Background Elements --- */}
      <div className="absolute top-20 left-10 w-32 h-32 border border-neutral-200 rounded-full opacity-50 animate-spin" style={{ animationDuration: '20s' }} />
      <Squiggle className="absolute top-40 right-20 w-48 text-neutral-200 opacity-60 rotate-6" />
      
      <motion.div 
        className="absolute top-1/4 right-10 w-24 h-24 border border-dashed border-neutral-300 rounded-full"
        animate={{ rotate: 360 }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
      />
      <div className="absolute bottom-1/3 right-1/4 w-4 h-4 bg-amber-400 rounded-full opacity-80" />
      <div className="absolute top-1/2 left-10 w-2 h-2 bg-neutral-900 rounded-full" />

      {/* Main Content Container */}
      <div className="relative z-10 max-w-[1600px] mx-auto">
        
        {/* Header */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-16">
          <div className="lg:col-span-7">
            <motion.h1 
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-[15vw] lg:text-[8vw] font-bold leading-[0.85] tracking-tighter text-neutral-900 mix-blend-difference"
            >
              CULTURE
              <span className="block text-neutral-300">&</span>
              STYLE
            </motion.h1>
          </div>
          <div className="lg:col-span-5 flex items-end">
            <div className="relative">
              <p className="text-lg text-neutral-500 max-w-md leading-relaxed">
                A curated exploration of African fashion and organic beauty.
              </p>
              <Squiggle className="absolute -bottom-4 left-0 w-24 text-amber-500" />
            </div>
          </div>
        </div>

        {/* Category Selector */}
          <div className="mb-12 border-t border-neutral-200 pt-8">
           <div className="flex flex-wrap gap-x-8 gap-y-4">
             {categoriesData.map((cat) => (
               <motion.button
                 key={cat.id}
                 onClick={() => setSelectedCategory(cat)}
                 className="group relative text-left"
               >
                 <div className="flex items-baseline gap-2 overflow-hidden">
                   <span className="text-xs font-mono text-neutral-300 group-hover:text-amber-500 transition-colors">
                     {String(categoriesData.indexOf(cat) + 1).padStart(2, '0')}
                   </span>
                   
                   {/* Updated Name Display */}
                   <h3 className={`text-2xl md:text-3xl font-light transition-colors duration-300 ${
                     selectedCategory?.id === cat.id ? 'text-neutral-900' : 'text-neutral-300 group-hover:text-neutral-600'
                   }`}>
                     {cat.name}
                   </h3>
                   
                   {selectedCategory?.id === cat.id && (
                     <motion.div 
                       layoutId="underline-active"
                       className="absolute bottom-0 left-0 right-0 h-[2px] bg-neutral-900"
                       initial={false}
                       transition={{ type: "spring", stiffness: 500, damping: 30 }}
                     />
                   )}
                 </div>
               </motion.button>
             ))}
           </div>
        </div>

        {/* Products Area */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          
          {/* Left: Featured Image */}
          <motion.div 
            layoutId="categoryImage"
            key={selectedCategory?.id}
            className="lg:col-span-5 h-[50vh] lg:h-[70vh] relative overflow-hidden bg-neutral-50"
          >
            {selectedCategory?.image ? (
              <Image 
                src={selectedCategory.image}
                alt={selectedCategory.name}
                fill
                className="object-cover grayscale hover:grayscale-0 transition-all duration-1000 ease-out"
                unoptimized
              />
            ) : (
              <div className="w-full h-full bg-neutral-100" />
            )}
            <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-white to-transparent">
              <div className="flex justify-between items-end">
                <div>
                  <span className="text-xs font-mono text-neutral-400 block mb-1">Collection</span>
                  <h2 className="text-4xl font-light">{selectedCategory?.name}</h2>
                </div>
                <span className="text-6xl font-light text-neutral-200 font-serif">{selectedCategory?.productCount ?? '-'}</span>
              </div>
            </div>
          </motion.div>

          {/* Right: Product List */}
          <div className="lg:col-span-7 flex flex-col justify-between">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <AnimatePresence mode="popLayout">
                {filteredProducts.map((product, index) => (
                  <motion.div
                    key={product.id}
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
                      
                      <motion.div 
                        className="absolute inset-0  flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      >
                        <motion.button 
                          initial={{ y: 10, opacity: 0 }}
                          whileHover={{ scale: 1.05 }}
                          className="bg-neutral-900 text-white px-6 py-3 text-xs uppercase tracking-wider font-medium shadow-lg"
                        >
                          Quick View
                        </motion.button>
                      </motion.div>
                    </div>

                    {/* Text Content */}
                    <div className="relative">
                      <h3 className="text-xl font-medium text-neutral-900 mb-1">{product.name}</h3>
                      <div className="flex justify-between items-center text-sm text-neutral-500">
                        <span>{product.subcategory || ''}</span>
                        <span className="font-mono">${typeof product.price === 'number' ? product.price.toFixed(2) : product.price}</span>
                      </div>
                      
                      <div className="absolute bottom-0 left-0 right-0 h-px bg-neutral-200 origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* View All Button */}
            <div className="mt-12 flex justify-end">
              <motion.a 
                href="#" 
                className="group relative inline-flex items-center gap-4 text-neutral-900"
                whileHover={{ x: 10 }}
              >
                <span className="text-lg font-light">Explore Collection</span>
                <div className="w-12 h-12 border border-neutral-900 rounded-full flex items-center justify-center group-hover:bg-neutral-900 group-hover:text-white transition-colors duration-300">
                  <svg className="w-5 h-5 transform group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </div>
                <Squiggle className="absolute -bottom-2 left-0 w-full text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              </motion.a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default CategoriesShowcase