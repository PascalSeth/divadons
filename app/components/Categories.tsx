'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'

// --- Refined Data Structure ---

const categories = [
  { 
    id: 1, 
    name: "Ankara Muse", 
    tag: "Ankara", // Used for internal filtering
    description: "Vibrant traditions", 
    count: 24, 
    image: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=800&auto=format&fit=crop" 
  },
  { 
    id: 2, 
    name: "Dashiki Soul", 
    tag: "Dashiki", 
    description: "Modern heritage", 
    count: 18, 
    image: "https://images.unsplash.com/photo-1516762689617-e1cffcef479d?w=800&auto=format&fit=crop" 
  },
  { 
    id: 3, 
    name: "Kente Prestige", 
    tag: "Kente", 
    description: "Royal elegance", 
    count: 15, 
    image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&auto=format&fit=crop" 
  },
  { 
    id: 4, 
    name: "Botanical Glow", 
    tag: "Beauty", 
    description: "Natural radiance", 
    count: 32, 
    image: "https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=800&auto=format&fit=crop" 
  },
  { 
    id: 5, 
    name: "Rare Adornments", 
    tag: "Accessories", 
    description: "Finishing touches", 
    count: 21, 
    image: "https://images.unsplash.com/photo-1610652620062-49e21e4c97b6?w=800&auto=format&fit=crop" 
  },
];

const products = [
  { id: 1, name: "Adunni Maxi Dress", category: "Ankara", price: "145.00", image: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=600&auto=format&fit=crop" },
  { id: 2, name: "Zuri Wrap Dress", category: "Ankara", price: "128.00", image: "https://images.unsplash.com/photo-1560243563-062bfc001d68?w=600&auto=format&fit=crop" },
  { id: 3, name: "Ife Evening Gown", category: "Kente", price: "285.00", image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&auto=format&fit=crop" },
  { id: 4, name: "Shea Radiance Oil", category: "Beauty", price: "24.00", image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600&auto=format&fit=crop" },
  { id: 5, name: "Amara Dashiki", category: "Dashiki", price: "95.00", image: "https://images.unsplash.com/photo-1516762689617-e1cffcef479d?w=600&auto=format&fit=crop" },
  { id: 6, name: "Black Soap Detox", category: "Beauty", price: "32.00", image: "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=600&auto=format&fit=crop" },
  { id: 7, name: "Gele Statement Piece", category: "Accessories", price: "55.00", image: "https://images.unsplash.com/photo-1610652620062-49e21e4c97b6?w=600&auto=format&fit=crop" },
];

// --- SVG Components ---
const Squiggle = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 100 20" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round">
    <path d="M2 10c5-5 10 5 15 0s10 5 15 0 10 5 15 0 10 5 15 0 10 5 15 0 10 5 15 0 10 5 15 0" />
  </svg>
);

function CategoriesShowcase() {
  const [selectedCategory, setSelectedCategory] = useState(categories[0]);
  const [hoveredProduct, setHoveredProduct] = useState<number | null>(null);

  // Filtering by 'tag' to allow fancy UI names
  const filteredProducts = products.filter(p => p.category === selectedCategory.tag);

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
             {categories.map((cat) => (
               <motion.button
                 key={cat.id}
                 onClick={() => setSelectedCategory(cat)}
                 className="group relative text-left"
               >
                 <div className="flex items-baseline gap-2 overflow-hidden">
                   <span className="text-xs font-mono text-neutral-300 group-hover:text-amber-500 transition-colors">
                     0{cat.id}
                   </span>
                   
                   {/* Updated Name Display */}
                   <h3 className={`text-2xl md:text-3xl font-light transition-colors duration-300 ${
                     selectedCategory.id === cat.id ? 'text-neutral-900' : 'text-neutral-300 group-hover:text-neutral-600'
                   }`}>
                     {cat.name}
                   </h3>
                   
                   {selectedCategory.id === cat.id && (
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
            key={selectedCategory.id}
            className="lg:col-span-5 h-[50vh] lg:h-[70vh] relative overflow-hidden bg-neutral-50"
          >
            <Image 
              src={selectedCategory.image}
              alt={selectedCategory.name}
              fill
              className="object-cover grayscale hover:grayscale-0 transition-all duration-1000 ease-out"
              unoptimized
            />
            <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-white to-transparent">
              <div className="flex justify-between items-end">
                <div>
                  <span className="text-xs font-mono text-neutral-400 block mb-1">Collection</span>
                  <h2 className="text-4xl font-light">{selectedCategory.name}</h2>
                </div>
                <span className="text-6xl font-light text-neutral-200 font-serif">{selectedCategory.count}</span>
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
                        src={product.image}
                        alt={product.name}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                        unoptimized
                      />
                      
                      <motion.div 
                        className="absolute inset-0 bg-white/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
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
                        <span>{product.category}</span>
                        <span className="font-mono">${product.price}</span>
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