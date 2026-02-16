'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay, EffectFade } from 'swiper/modules'

import 'swiper/css'
import 'swiper/css/effect-fade'

const showcaseData = [
  {
    id: 1,
    name: "Noir Essence",
    category: "Outerwear",
    price: "1,250.00",
    image: "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=1887&auto=format&fit=crop",
    tagline: "Where darkness meets refinement"
  },
  {
    id: 2,
    name: "Silk Reverie",
    category: "Dresses",
    price: "890.00",
    image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1920&auto=format&fit=crop",
    tagline: "Fluid forms in motion"
  },
  {
    id: 3,
    name: "Urban Structure",
    category: "Jackets",
    price: "1,450.00",
    image: "/dress2.jpeg",
    tagline: "Architecture for the body"
  },
  {
    id: 4,
    name: "Minimalist Flow",
    category: "Essentials",
    price: "640.00",
    image: "/dress3.jpeg",
    tagline: "Essential by nature"
  },
];

function Hero() {
  const [activeProduct, setActiveProduct] = useState(showcaseData[0]);
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <div className='lg:pt-15'>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Bodoni+Moda:ital,wght@0,400;0,500;0,600;1,400&family=DM+Sans:wght@300;400;500&display=swap');
        
        .font-bodoni { font-family: 'Bodoni Moda', serif; }
        .font-dm { font-family: 'DM Sans', sans-serif; }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        
        @keyframes shimmer {
          0% { background-position: -1000px 0; }
          100% { background-position: 1000px 0; }
        }
        
        .animate-float { animation: float 6s ease-in-out infinite; }
        
        .text-shimmer {
          background: linear-gradient(90deg, #000 0%, #666 50%, #000 100%);
          background-size: 200% 100%;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: shimmer 3s linear infinite;
        }
      `}</style>

      {/* =========================== MOBILE/TABLET VERSION =========================== */}
      <section className="relative lg:hidden w-full h-[70vh] bg-black font-dm">
        
        {/* Background Image Slider with Parallax */}
        <div className="absolute inset-0 z-0">
          <Swiper
            modules={[Autoplay, EffectFade]}
            effect="fade"
            loop={true}
            speed={1800}
            autoplay={{ delay: 5000, disableOnInteraction: false }}
            onSlideChange={(swiper) => setActiveProduct(showcaseData[swiper.realIndex])}
            className="w-full h-full"
          >
            {showcaseData.map((product) => (
              <SwiperSlide key={product.id}>
                <motion.div
                  initial={{ scale: 1.2 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 10, ease: "linear" }}
                  className="relative w-full h-full"
                >
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-contain"
                    sizes="100vw"
                    unoptimized
                    priority={product.id === 1}
                  />
                  {/* Dual Gradient for Depth */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-black/40" />
                </motion.div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>

        {/* Decorative Noise Texture Overlay */}
        <div 
          className="absolute inset-0 z-10 opacity-[0.03] mix-blend-overlay pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
          }}
        />

        {/* Geometric Grid Lines */}
        <div className="absolute inset-0 z-10 opacity-10 pointer-events-none">
          <div className="absolute left-1/3 top-0 w-px h-full bg-white" />
          <div className="absolute left-2/3 top-0 w-px h-full bg-white" />
          <div className="absolute left-0 top-1/3 w-full h-px bg-white" />
          <div className="absolute left-0 top-2/3 w-full h-px bg-white" />
        </div>

        {/* Main Content */}
        <div className="relative z-20 h-full flex flex-col justify-between p-6 sm:p-8 text-white">
          
          {/* Top Header with Animated Entry */}
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className="flex justify-between max-lg:pt-10 items-start"
          >
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <motion.div 
                  className="w-12 h-px bg-amber-300"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 0.8, duration: 0.8 }}
                />
                <span className="text-[9px] font-medium tracking-[0.3em] uppercase text-amber-300/80">
                  Collection 24
                </span>
              </div>
              <h1 className="text-sm font-dm font-light tracking-wider text-white/60">
                Haute Couture
              </h1>
            </div>

            {/* Floating Counter */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeProduct.id}
                initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                exit={{ opacity: 0, scale: 0.8, rotate: 10 }}
                transition={{ duration: 0.5 }}
                className="relative"
              >
                <div className="absolute inset-0 bg-amber-300/10 blur-xl rounded-full" />
                <span className="relative block text-7xl sm:text-8xl font-bodoni font-light text-white/5 leading-none">
                  {String(activeProduct.id).padStart(2, '0')}
                </span>
              </motion.div>
            </AnimatePresence>
          </motion.div>

          {/* Bottom Product Info */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 1 }}
            className="space-y-6"
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={activeProduct.id}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -50 }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                className="space-y-6"
              >
                {/* Category Tag */}
                <div className="inline-flex items-center gap-3 px-4 py-2 border border-white/20 backdrop-blur-md bg-white/5">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-300 animate-pulse" />
                  <span className="text-[10px] tracking-[0.25em] uppercase font-light text-white/80">
                    {activeProduct.category}
                  </span>
                </div>

                {/* Product Name - Large Statement */}
                <h2 className="text-5xl sm:text-6xl md:text-7xl font-bodoni font-normal tracking-tight leading-[0.9] text-white">
                  {activeProduct.name}
                </h2>

                {/* Tagline */}
                <p className="text-sm sm:text-base font-dm font-light text-white/60 italic tracking-wide max-w-md">
                  {activeProduct.tagline}
                </p>

                {/* Price and CTA */}
                <div className="flex items-end gap-6 pt-4">
                  <div className="space-y-1">
                    <span className="block text-xs text-white/40 font-light tracking-widest uppercase">
                      Price
                    </span>
                    <span className="block text-3xl font-bodoni text-amber-300 tracking-tight">
                      ${activeProduct.price}
                    </span>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.03, x: 10 }}
                    whileTap={{ scale: 0.97 }}
                    className="group relative px-10 py-5 overflow-hidden bg-white text-black"
                  >
                    <motion.div
                      className="absolute inset-0 bg-amber-300"
                      initial={{ x: '-100%' }}
                      whileHover={{ x: 0 }}
                      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    />
                    <div className="relative flex items-center gap-3">
                      <span className="text-[10px] font-medium tracking-[0.2em] uppercase">
                        View Piece
                      </span>
                      <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </div>
                  </motion.button>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Progress Indicators */}
            <div className="flex items-center gap-4 pt-2">
              {showcaseData.map((item) => (
                <div key={item.id} className="relative flex-1 h-px bg-white/10 overflow-hidden">
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-amber-200 to-amber-400 origin-left"
                    initial={{ scaleX: 0 }}
                    animate={{ 
                      scaleX: activeProduct.id === item.id ? 1 : 0 
                    }}
                    transition={{ duration: 5, ease: "linear" }}
                  />
                </div>
              ))}
            </div>
          </motion.div>

        </div>

        {/* Corner Accent */}
        <motion.div
          className="absolute top-6 right-6 sm:top-8 sm:right-8 w-16 h-16 border border-white/10 rounded-full z-30 pointer-events-none"
          animate={{ rotate: 360 }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        >
          <div className="absolute top-1/2 left-1/2 w-px h-6 bg-white/20 -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute top-1/2 left-1/2 w-6 h-px bg-white/20 -translate-x-1/2 -translate-y-1/2" />
        </motion.div>
      </section>

      {/* =========================== DESKTOP VERSION =========================== */}
      <section className="hidden lg:block relative w-full h-[70vh] bg-stone-50 font-dm">
        
        {/* Subtle Background Pattern */}
        <div 
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, #000 1px, transparent 1px)`,
            backgroundSize: '40px 40px'
          }}
        />

        {/* LEFT PANEL - Content */}
        <div className="absolute left-0 top-0 w-[45%] h-full flex flex-col justify-between p-10 xl:p-12 z-20">
          
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 1 }}
            className="space-y-3"
          >
            <div className="flex items-center gap-4">
              <motion.div 
                className="w-16 h-px bg-stone-900"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.6, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              />
              <span className="text-[9px] tracking-[0.4em] uppercase text-stone-500 font-medium">
                Spring/Summer 24
              </span>
            </div>
            
            <h1 className="text-4xl xl:text-5xl font-bodoni font-normal text-stone-900 tracking-tight leading-[0.95]">
              Sartorial
              <br />
              <span className="italic font-light">Excellence</span>
            </h1>
          </motion.div>

          {/* Dynamic Product Showcase */}
          <div className="flex-1 flex items-center py-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeProduct.id}
                initial={{ opacity: 0, x: -40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 40 }}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                className="max-w-xl space-y-4"
              >
                {/* Category Badge */}
                <div className="inline-flex items-center gap-4">
                  <span className="text-[10px] tracking-[0.3em] uppercase text-stone-400 font-light">
                    {activeProduct.category}
                  </span>
                  <div className="w-px h-4 bg-stone-300" />
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                    <span className="text-[10px] tracking-[0.3em] uppercase text-amber-600 font-medium">
                      Available Now
                    </span>
                  </div>
                </div>

                {/* Product Name */}
                <h2 className="text-5xl xl:text-6xl font-bodoni font-normal text-stone-900 leading-[0.85] tracking-tight">
                  {activeProduct.name}
                </h2>

                {/* Description */}
                <p className="text-base text-stone-500 font-light leading-relaxed italic tracking-wide">
                  {activeProduct.tagline}
                </p>

                {/* Price Section */}
                <div className="space-y-3 pt-3">
                  <div className="flex items-baseline gap-4">
                    <span className="text-xs text-stone-400 font-light tracking-widest uppercase">
                      From
                    </span>
                    <span className="text-3xl font-bodoni text-stone-900 tracking-tight">
                      ${activeProduct.price}
                    </span>
                    <span className="text-xs text-stone-400 font-light">
                      USD
                    </span>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

        </div>

        {/* RIGHT PANEL - Visual */}
        <div className="absolute right-0 top-0 w-[55%] h-full">
          <div className="relative w-full h-full p-10 xl:p-12">
            
            {/* Image Container with Border Frame */}
            <div className="relative w-full h-full overflow-hidden">
              
              {/* Main Image Slider */}
              <Swiper
                modules={[Autoplay, EffectFade]}
                effect="fade"
                loop={true}
                speed={1400}
                autoplay={{ delay: 5000, disableOnInteraction: false }}
                onSlideChange={(swiper) => setActiveProduct(showcaseData[swiper.realIndex])}
                className="w-full h-full"
              >
                {showcaseData.map((product) => (
                  <SwiperSlide key={product.id}>
                    <motion.div
                      initial={{ scale: 1.1 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 1.4, ease: "easeOut" }}
                      className="relative w-full h-full"
                    >
                      <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        className="object-contain"
                        sizes="55vw"
                        unoptimized
                        priority={product.id === 1}
                        onLoad={() => setImageLoaded(true)}
                      />
                      {/* Subtle Vignette */}
                      <div className="absolute inset-0 bg-gradient-to-br from-black/5 via-transparent to-black/10" />
                    </motion.div>
                  </SwiperSlide>
                ))}
              </Swiper>

              {/* Decorative Border Frame */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1, duration: 1.2 }}
                className="absolute inset-0 border-2 border-stone-900/20 pointer-events-none"
              >
                {/* Corner Accents */}
                <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-amber-400" />
                <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-amber-400" />
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-amber-400" />
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-amber-400" />
              </motion.div>

              {/* Explore Collection Button - Bottom Right Corner with Animated BG */}
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.4, duration: 0.6 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="absolute bottom-0 right-0 px-10 py-5 rounded-tl-full overflow-hidden group z-20"
              >
                <motion.div
                  className="absolute inset-0"
                  animate={{
                    background: [
                      'linear-gradient(135deg, #1c1917 0%, #292524 100%)',
                      'linear-gradient(135deg, #D4AF37 0%, #F59E0B 100%)',
                      'linear-gradient(135deg, #1c1917 0%, #292524 100%)',
                    ]
                  }}
                  transition={{
                    duration: 6,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
                <div className="relative flex items-center gap-3 text-white">
                  <span className="text-[10px] font-medium tracking-[0.25em] uppercase">
                    Explore
                  </span>
                  <motion.svg 
                    className="w-4 h-4" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                    animate={{ x: [0, 4, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </motion.svg>
                </div>
              </motion.button>

            </div>

            {/* Floating Label - Moved to Bottom Left */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2, duration: 0.8 }}
              className="absolute bottom-0 left-0 px-8 py-4 bg-white/95 backdrop-blur-sm border-r-2 border-t-2 border-amber-400"
            >
              <span className="text-[10px] tracking-[0.3em] uppercase text-stone-600 font-medium">
                Limited Edition
              </span>
            </motion.div>

          </div>
        </div>

        {/* Decorative Circle Element */}
        <motion.div
          className="absolute top-1/2 left-[45%] w-20 h-20 border border-stone-200 rounded-full -translate-x-1/2 -translate-y-1/2 pointer-events-none z-10"
          animate={{ rotate: 360 }}
          transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
        >
          <div className="absolute top-0 left-1/2 w-px h-2.5 bg-stone-300 -translate-x-1/2" />
          <div className="absolute bottom-0 left-1/2 w-px h-2.5 bg-stone-300 -translate-x-1/2" />
        </motion.div>

      </section>
    </div>
  )
}

export default Hero