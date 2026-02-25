'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'

// 1. Data Structure: Separating Fashion and Beauty
const categories = [
  { id: 'fashion', name: 'African Fashion', description: 'Traditional meets contemporary' },
  { id: 'beauty', name: 'Natural Cosmetics', description: 'Organic ingredients from the heart of Africa' },
];

const products = [
  // Fashion
  { id: 1, name: 'Ankara Silhouette', category: 'fashion', price: '320', image: 'https://images.unsplash.com/photo-1590735213920-68192a487bc2?q=80&w=1976&auto=format&fit=crop' },
  { id: 2, name: 'Dashiki Modernity', category: 'fashion', price: '180', image: 'https://images.unsplash.com/photo-1617137968427-85924c800a22?q=80&w=1974&auto=format&fit=crop' },
  { id: 3, name: 'Kente Evening Gown', category: 'fashion', price: '550', image: 'https://images.unsplash.com/photo-1583391733956-6c78276477e2?q=80&w=1976&auto=format&fit=crop' },
  // Beauty
  { id: 4, name: 'Shea Radiance Oil', category: 'beauty', price: '45', image: 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?q=80&w=1976&auto=format&fit=crop' },
  { id: 5, name: 'Baobab Lip Tint', category: 'beauty', price: '22', image: 'https://images.unsplash.com/photo-1571781926291-c477a0de8b6b?q=80&w=1976&auto=format&fit=crop' },
  { id: 6, name: 'Black Soap Detox', category: 'beauty', price: '35', image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=1974&auto=format&fit=crop' },
];

function Blog() {
  const [activeCategory, setActiveCategory] = useState('fashion');
  const filteredProducts = products.filter(p => p.category === activeCategory);

  return (
    <section className="relative w-full min-h-screen bg-[#FDFBF7] text-neutral-900 overflow-hidden">
      
      {/* Decorative Background Text (Awwwards touch) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[20vw] font-serif italic text-neutral-100 select-none pointer-events-none z-0">
        Aura
      </div>

      <div className="relative z-10 max-w-[1600px] mx-auto px-6 md:px-12 py-20 md:py-32">
        
        {/* Header Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-16 md:mb-24">
          <div className="lg:col-span-5">
            <motion.span 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-xs font-bold uppercase tracking-[0.3em] text-[#8C6B4A]"
            >
              Our Heritage
            </motion.span>
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              viewport={{ once: true }}
              className="text-5xl md:text-7xl font-light leading-[0.9] mt-4 text-neutral-800"
            >
              Culture & <br />
              <span className="italic font-serif text-[#8C6B4A]">Beauty</span>
            </motion.h2>
          </div>

          <div className="lg:col-span-7 lg:pl-12 flex flex-col justify-end">
            <motion.p 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              viewport={{ once: true }}
              className="text-neutral-600 max-w-md text-base leading-relaxed"
            >
              Discover our curated selection of authentic African attire and organic cosmetics. 
              Each piece tells a story of tradition, craftsmanship, and natural elegance.
            </motion.p>
          </div>
        </div>

        {/* Category Toggle (The Interactive Bar) */}
        <div className="flex gap-2 mb-12 border-b border-neutral-200 pb-4">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`relative px-6 py-3 text-sm uppercase tracking-widest transition-colors duration-300 ${
                activeCategory === cat.id ? 'text-neutral-900' : 'text-neutral-400 hover:text-neutral-600'
              }`}
            >
              {activeCategory === cat.id && (
                <motion.div 
                  layoutId="underline" 
                  className="absolute bottom-[-17px] left-0 right-0 h-[2px] bg-[#8C6B4A]" 
                />
              )}
              {cat.name}
            </button>
          ))}
          
          <div className="ml-auto self-center">
             <a href="#" className="text-xs font-medium hover:underline underline-offset-4 text-neutral-500">
               View All →
             </a>
          </div>
        </div>

        {/* Product Grid: Masonry-ish Layout */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeCategory}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {filteredProducts.map((product, index) => (
              <motion.div 
                key={product.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className={`group relative cursor-pointer ${index === 0 ? 'md:col-span-2 md:row-span-2' : ''}`}
              >
                {/* Image Container */}
                <div className={`relative w-full overflow-hidden bg-neutral-100 ${index === 0 ? 'h-[60vh] md:h-full' : 'h-[50vh]'}`}>
                  <Image 
                    src={product.image}
                    alt={product.name}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-105 grayscale-[20%] group-hover:grayscale-0"
                  />
                  
                  {/* Overlay Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  {/* Quick Add Button (Slides up) */}
                  <motion.div 
                    className="absolute bottom-6 left-6 right-6 flex justify-between items-end z-10"
                    initial={{ y: 20, opacity: 0 }}
                    whileHover={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-white!">
                       <span className="block text-xs uppercase tracking-wider mb-1">{product.category}</span>
                       <h3 className="text-xl font-light">{product.name}</h3>
                    </div>
                    
                    <button className="opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-300 bg-white text-black text-xs px-4 py-3 uppercase tracking-wider hover:bg-[#8C6B4A] hover:text-white!">
                      Add
                    </button>
                  </motion.div>
                </div>

                {/* Product Info (Below image on non-hover states) */}
                <div className="mt-4 flex justify-between items-baseline group-hover:opacity-0 transition-opacity">
                  <h3 className="text-lg font-light text-neutral-800">{product.name}</h3>
                  <span className="text-sm font-serif text-[#8C6B4A]">${product.price}</span>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>

      </div>
    </section>
  )
}

export default Blog;