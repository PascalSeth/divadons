'use client'

import React from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, EffectCoverflow, Autoplay } from 'swiper/modules'

import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/effect-coverflow'

const products = [
  {
    id: 1,
    name: "Noir Essence Jacket",
    price: "1,250.00",
    image: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
  },
  {
    id: 2,
    name: "Silk Reverie Dress",
    price: "890.00",
    image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
  },
  {
    id: 3,
    name: "Urban Minimal Coat",
    price: "1,450.00",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
  },
  {
    id: 4,
    name: "Velvet Touch Blazer",
    price: "980.00",
    image: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
  }
];

const slideUp = {
  hidden: { y: 30, opacity: 0 },
  visible: { 
    y: 0, 
    opacity: 1, 
    transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] as const } 
  }
};

function Collections() {
  return (
    <section className="relative py-20 w-full bg-[#fcfbf9] font-light">
      
      {/* Container */}
      <div className="flex flex-col lg:flex-row min-h-[90vh]">
        
        {/* LEFT SIDE: Content & Slider */}
        <div className="w-full lg:w-1/2 flex flex-col justify-between relative z-10 border-r border-neutral-200/40">
          
          {/* Top: Header Info */}
          <div className="pt-12 px-8 md:px-16">
            <motion.div initial="hidden" animate="visible" variants={slideUp}>
              <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#C5A059] block mb-3">
                New Season — 2024
              </span>
              <h1 className="text-5xl md:text-6xl font-serif italic text-neutral-900 tracking-tight">
                Latest Collection
              </h1>
            </motion.div>
          </div>

          {/* Middle: Swiper Product Slider */}
          <div className="flex-1 flex items-center py-8 relative min-h-[500px]">
            <Swiper
              modules={[Navigation, EffectCoverflow, Autoplay]}
              effect="coverflow"
              grabCursor={true}
              centeredSlides={true}
              slidesPerView="auto"
              navigation
              autoplay={{
                delay: 4000,
                disableOnInteraction: false,
                pauseOnMouseEnter: true,
              }}
              coverflowEffect={{
                rotate: 0,
                stretch: 0,
                depth: 100,
                modifier: 2,
                slideShadows: false,
              }}
              className="w-full"
            >
              {products.map((product) => (
                <SwiperSlide key={product.id} className="swiper-slide-custom !w-[280px] md:!w-[320px]">
                  <div className="group relative bg-white rounded-sm overflow-hidden shadow-sm hover:shadow-xl transition-shadow duration-500">
                    {/* Image */}
                    <div className="aspect-[3/4] relative overflow-hidden">
                      <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        className="object-cover grayscale-20 group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700"
                        unoptimized
                      />
                    </div>
                    
                    {/* Details & CTA */}
                    <div className="absolute bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-black/60 to-transparent">
                      <div className="flex justify-between items-end">
                        <div className="text-white">
                          <h3 className="text-sm font-medium tracking-wide">{product.name}</h3>
                          <p className="text-xs text-[#C5A059] mt-1">${product.price}</p>
                        </div>
                        
                        <motion.button 
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center hover:bg-[#C5A059] hover:text-white transition-colors duration-300 shadow-lg"
                        >
                          <span className="text-lg font-light">+</span>
                        </motion.button>
                      </div>
                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>

          {/* Bottom: Pagination/Link */}
          <div className="pb-12 px-8 md:px-16 flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="w-12 h-px bg-[#C5A059]" />
              <Link href="/shop" className="text-xs uppercase tracking-widest text-neutral-500 hover:text-[#C5A059] transition-colors">
                View All Products
              </Link>
            </div>
            
            <div className="text-neutral-300 text-xs tracking-widest hidden md:block">
              AUTOPLAY ACTIVE
            </div>
          </div>
        </div>

        {/* RIGHT SIDE: Concept Art */}
        <div className="w-full lg:w-1/2 min-h-[50vh] lg:min-h-[90vh] flex justify-center items-center relative bg-neutral-50 py-12 lg:py-0">
          <motion.div 
            className="relative w-full max-w-xl h-[60vh] flex gap-5 px-8 lg:px-0"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.3 }}
          >
            {/* Image 1: Original */}
            <div className="w-1/2 h-full relative overflow-hidden rounded-sm shadow-xl border border-white/50">
              <Image
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1000&auto=format&fit=crop"
                alt="Concept Art"
                fill
                className="object-cover grayscale hover:grayscale-0 transition-all duration-1000"
                unoptimized
              />
            </div>

            {/* Image 2: Inverted */}
            <div className="w-1/2 h-full relative overflow-hidden rounded-sm shadow-xl border border-white/50">
              <Image
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1000&auto=format&fit=crop"
                alt="Concept Art Mirrored"
                fill
                className="object-cover grayscale hover:grayscale-0 transition-all duration-1000 scale-x-[-1]"
                unoptimized
              />
            </div>
            
            <div className="absolute -bottom-6 -right-6 w-24 h-24 border border-[#C5A059]/50 rounded-full flex items-center justify-center">
               <span className="text-[8px] text-[#C5A059] tracking-[0.2em] uppercase">Concept</span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Global Styles */}
      <style jsx global>{`
        .swiper-button-next, .swiper-button-prev {
          color: #C5A059 !important;
          width: 40px !important;
          height: 40px !important;
          background: white;
          border-radius: 50%;
          box-shadow: 0 4px 15px rgba(0,0,0,0.1);
          transition: all 0.3s;
        }
        .swiper-button-next:hover, .swiper-button-prev:hover {
          background: #C5A059;
          color: white !important;
        }
        .swiper-button-next::after, .swiper-button-prev::after {
          font-size: 12px !important;
          font-weight: bold;
        }
        .swiper-slide-custom {
          opacity: 0.4;
          transition: opacity 0.3s;
        }
        .swiper-slide-custom.swiper-slide-active {
          opacity: 1;
        }
      `}</style>
    </section>
  )
}

export default Collections