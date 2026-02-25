'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'

// ==================== FEATURED STORY SECTION ====================
export function FeaturedStory() {
  return (
    <section className="relative py-32 px-6 md:px-12 bg-[#FAFAF9] overflow-hidden">
      
      {/* Background Elements - Awards Style */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          className="absolute top-20 right-20 w-[400px] h-[400px] rounded-full bg-gradient-to-br from-amber-400/20 to-orange-300/20 blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            x: [0, 30, 0],
          }}
          transition={{ duration: 10, repeat: Infinity }}
        />
        
        {/* Curved Lines */}
        <svg className="absolute inset-0 w-full h-full opacity-20" viewBox="0 0 1440 900">
          <path
            d="M-100 300 Q 200 100, 500 250 T 1100 200"
            stroke="currentColor"
            strokeWidth="1"
            className="text-stone-300"
            fill="none"
          />
        </svg>

        {/* Geometric Shape */}
        <div className="absolute bottom-20 left-20 w-32 h-32 border border-stone-300/30 rounded-full" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          {/* Left: Image */}
          <motion.div
            initial={{ opacity: 0, x: -60 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 1 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="relative aspect-[4/5] overflow-hidden">
              <Image
                src="https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=800&auto=format&fit=crop"
                alt="Artisan Story"
                fill
                className="object-cover"
                unoptimized
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-900/60 to-transparent" />
              
              {/* Corner Accents - Awards Style */}
              <div className="absolute top-0 left-0 w-16 h-16 border-t-4 border-l-4 border-amber-400" />
              <div className="absolute bottom-0 right-0 w-16 h-16 border-b-4 border-r-4 border-amber-400" />
            </div>
            
            {/* Floating Label */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              viewport={{ once: true }}
              className="absolute -bottom-8 -right-8 bg-white/95 backdrop-blur-md shadow-2xl px-8 py-6 max-w-xs border border-stone-200"
            >
              <p className="text-stone-700 font-light italic text-sm leading-relaxed font-serif">
                &quot;Each piece tells a story of heritage, crafted by skilled artisans&quot;
              </p>
            </motion.div>
          </motion.div>

          {/* Right: Content */}
          <motion.div
            initial={{ opacity: 0, x: 60 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 1 }}
            viewport={{ once: true }}
            className="space-y-10"
          >
            <div>
              <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: 80 }}
                transition={{ duration: 1 }}
                viewport={{ once: true }}
                className="h-px bg-amber-500 mb-8"
              />
              <h2 className="text-6xl md:text-7xl lg:text-8xl font-serif font-light text-stone-900 leading-[0.9] tracking-tight mb-6">
                Crafted by
                <br />
                <span className="italic font-normal text-amber-600">Artisan Hands</span>
              </h2>
              <p className="text-stone-600 text-lg md:text-xl font-light leading-relaxed">
                Behind every garment is a story of tradition, sustainability, 
                and community. We work directly with African artisans, preserving 
                ancient techniques while supporting fair trade practices.
              </p>
            </div>

            <div className="space-y-6">
              {[
                { number: '250+', label: 'Artisan Partners' },
                { number: '15', label: 'African Countries' },
                { number: '100%', label: 'Fair Trade' },
              ].map((stat, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: i * 0.1 }}
                  viewport={{ once: true }}
                  className="flex items-baseline gap-6 group"
                >
                  <span className="text-5xl md:text-6xl font-serif font-light text-amber-600">{stat.number}</span>
                  <div className="flex-1">
                    <span className="text-stone-600 text-sm tracking-wider uppercase block">{stat.label}</span>
                    <div className="h-px bg-stone-200 mt-2 origin-left transition-all duration-300 group-hover:bg-amber-400" />
                  </div>
                </motion.div>
              ))}
            </div>

            <motion.button
              whileHover={{ scale: 1.02, x: 10 }}
              whileTap={{ scale: 0.98 }}
              className="group flex items-center gap-4 px-8 py-4 border border-stone-200 hover:border-stone-900 transition-colors"
            >
              <span className="text-stone-900 text-sm tracking-wider uppercase">Our Story</span>
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

        </div>
      </div>
    </section>
  )
}

// ==================== TESTIMONIALS SECTION ====================
export function Testimonials() {
  const testimonials = [
    {
      id: 1,
      name: 'Amara Johnson',
      role: 'Fashion Blogger',
      image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop',
      quote: 'The quality and craftsmanship are unmatched. Every piece I own tells a beautiful story.',
      rating: 5,
    },
    {
      id: 2,
      name: 'Zuri Williams',
      role: 'Beauty Enthusiast',
      image: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=400&auto=format&fit=crop',
      quote: 'Finally, skincare that understands my skin. The botanical ingredients work wonders.',
      rating: 5,
    },
    {
      id: 3,
      name: 'Kofi Mensah',
      role: 'Style Curator',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop',
      quote: 'A celebration of African culture through fashion. Proud to support this brand.',
      rating: 5,
    },
  ]

  return (
    <section className="relative py-32 px-6 md:px-12 bg-stone-50 overflow-hidden">
      
      {/* Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <svg className="absolute top-0 left-0 w-full h-full opacity-20" viewBox="0 0 1440 900">
          <path
            d="M-100 200 Q 300 50, 700 200 T 1500 200"
            stroke="currentColor"
            strokeWidth="1"
            className="text-stone-300"
            fill="none"
          />
        </svg>
        <div className="absolute bottom-1/4 right-1/4 w-24 h-24 border border-dashed border-stone-300/30 rounded-full" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <div className="flex items-center justify-center gap-6 mb-8">
            <div className="w-20 h-px bg-stone-300" />
            <span className="text-xs tracking-[0.3em] uppercase text-stone-500 font-medium">Testimonials</span>
            <div className="w-20 h-px bg-stone-300" />
          </div>
          <h2 className="text-6xl md:text-7xl lg:text-8xl font-serif font-light text-stone-900 leading-[0.95] tracking-tight">
            What Our Community
            <br />
            <span className="italic font-normal text-amber-600">Says About Us</span>
          </h2>
        </motion.div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="group relative bg-white p-8 shadow-lg hover:shadow-2xl transition-all duration-500"
            >
              {/* Stars */}
              <div className="flex gap-1 mb-6">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>

              {/* Quote */}
              <p className="text-stone-700 font-serif leading-relaxed mb-8 italic text-lg">
                &quot;{testimonial.quote}&quot;
              </p>

              {/* Author */}
              <div className="flex items-center gap-4 pt-6 border-t border-stone-200">
                <div className="relative w-14 h-14 rounded-full overflow-hidden">
                  <Image
                    src={testimonial.image}
                    alt={testimonial.name}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
                <div>
                  <div className="font-medium text-stone-900">{testimonial.name}</div>
                  <div className="text-sm text-stone-500">{testimonial.role}</div>
                </div>
              </div>

              {/* Hover Accent */}
              <div className="absolute bottom-0 left-0 w-full h-1 bg-amber-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  )
}

// ==================== INSTAGRAM FEED SECTION ====================
export function InstagramFeed() {
  const posts = [
    'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1516762689617-e1cffcef479d?w=600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1560243563-062bfc001d68?w=600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=600&auto=format&fit=crop',
  ]

  return (
    <section className="relative py-32 px-6 md:px-12 bg-[#FAFAF9]">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-6xl md:text-7xl lg:text-8xl font-serif font-light text-stone-900 mb-6 leading-[0.95] tracking-tight">
            Follow Our
            <br />
            <span className="italic font-normal text-amber-600">Journey</span>
          </h2>
          <a 
            href="#" 
            className="inline-flex items-center gap-3 text-stone-600 hover:text-stone-900 transition-colors group"
          >
            <span className="text-xl font-light">@africanheritage</span>
            <svg className="w-6 h-6 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
            </svg>
          </a>
        </motion.div>

        {/* Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {posts.map((post, index) => (
            <motion.a
              key={index}
              href="#"
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: index * 0.05 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.05 }}
              className="group relative aspect-square overflow-hidden"
            >
              <Image
                src={post}
                alt={`Instagram post ${index + 1}`}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-110"
                unoptimized
              />
              <div className="absolute inset-0 bg-stone-900/0 group-hover:bg-stone-900/40 transition-colors duration-300 flex items-center justify-center">
                <svg 
                  className="w-8 h-8 text-white! opacity-0 group-hover:opacity-100 transition-opacity"
                  fill="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                </svg>
              </div>
            </motion.a>
          ))}
        </div>

      </div>
    </section>
  )
}

// ==================== VALUES SECTION ====================
// ==================== VALUES SECTION (SIMPLE & CLEAN) ====================
export function Values() {
  const values = [
    {
      title: 'Sustainable',
      description: 'Ethically sourced materials and eco-friendly production methods',
    },
    {
      title: 'Fair Trade',
      description: 'Supporting artisan communities with fair wages and partnerships',
    },
    {
      title: 'Eco-Conscious',
      description: 'Minimizing waste through thoughtful design and packaging',
    },
    {
      title: 'Natural',
      description: 'Plant-based ingredients free from harmful chemicals',
    },
  ]

  return (
    <section className="relative py-32 px-6 md:px-12 bg-[#FAFAF9] overflow-hidden">
      
      {/* Background Elements - Same as other pages */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          className="absolute top-20 right-20 w-[500px] h-[500px] rounded-full bg-gradient-to-br from-emerald-400/15 to-teal-300/15 blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            x: [0, 30, 0],
          }}
          transition={{ duration: 12, repeat: Infinity }}
        />
        
        {/* Curved Lines */}
        <svg className="absolute inset-0 w-full h-full opacity-20" viewBox="0 0 1440 900">
          <path
            d="M-100 400 Q 400 250, 800 400 T 1600 400"
            stroke="currentColor"
            strokeWidth="1"
            className="text-stone-300"
            fill="none"
          />
        </svg>

        {/* Geometric Shapes */}
        <div className="absolute top-1/4 left-20 w-32 h-32 border border-stone-300/30 rounded-full" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        
        {/* Header - Same style as other sections */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          viewport={{ once: true }}
          className="mb-20"
        >
          <div className="flex items-center gap-6 mb-8">
            <motion.div 
              className="h-px bg-stone-900"
              initial={{ width: 0 }}
              whileInView={{ width: 80 }}
              transition={{ duration: 1 }}
              viewport={{ once: true }}
            />
            <span className="text-xs tracking-[0.3em] uppercase text-stone-500 font-medium">Our Values</span>
          </div>
          <h2 className="text-6xl md:text-7xl lg:text-8xl font-serif font-light text-stone-900 leading-[0.9] tracking-tight">
            Guided by
            <br />
            <span className="italic font-normal text-emerald-600">Purpose</span>
          </h2>
        </motion.div>

        {/* Simple 2x2 Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16">
          {values.map((value, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="group"
            >
              <div className="space-y-4">
                <h3 className="text-3xl md:text-4xl font-serif font-light text-stone-900">
                  {value.title}
                </h3>
                <p className="text-stone-600 text-base md:text-lg font-light leading-relaxed">
                  {value.description}
                </p>
                
                {/* Simple underline that expands on hover */}
                <motion.div
                  className="h-px bg-stone-200 origin-left"
                  initial={{ scaleX: 0.3 }}
                  whileInView={{ scaleX: 1 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  viewport={{ once: true }}
                />
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  )
}
// ==================== NEWSLETTER SECTION ====================
export function Newsletter() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return

    setStatus('loading')
    setMessage('')

    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      })
      const json = await res.json()

      if (json.success) {
        setStatus('success')
        setMessage('Thank you for subscribing! Check your inbox for confirmation.')
        setEmail('')
      } else {
        setStatus('error')
        setMessage(json.message || 'Something went wrong. Please try again.')
      }
    } catch {
      setStatus('error')
      setMessage('Failed to subscribe. Please try again later.')
    }
  }

  return (
    <section className="relative py-32 px-6 md:px-12 bg-stone-900 overflow-hidden">
      
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 1px)`,
            backgroundSize: '40px 40px'
          }}
        />
      </div>

      {/* Decorative Elements */}
      <motion.div
        className="absolute top-20 right-20 w-96 h-96 rounded-full bg-amber-400/10 blur-3xl"
        animate={{
          scale: [1, 1.3, 1],
        }}
        transition={{ duration: 8, repeat: Infinity }}
      />

      <div className="relative z-10 max-w-5xl mx-auto text-center space-y-12">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          viewport={{ once: true }}
        >
          <h2 className="text-6xl md:text-7xl lg:text-8xl font-serif font-light text-white! leading-[0.95] tracking-tight mb-8">
            Join Our
            <br />
            <span className="italic font-normal text-amber-400">Community</span>
          </h2>
          <p className="text-stone-300 text-lg md:text-xl font-light max-w-2xl mx-auto leading-relaxed">
            Subscribe to receive exclusive offers, style inspiration, beauty tips, 
            and stories from our artisan partners
          </p>
        </motion.div>

        {/* Form */}
        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          viewport={{ once: true }}
          className="flex flex-col sm:flex-row gap-4 max-w-xl mx-auto"
        >
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email address"
            required
            disabled={status === 'loading'}
            className="flex-1 px-8 py-5 bg-white/5 border border-white/10 text-white! placeholder:text-stone-500 focus:outline-none focus:border-amber-400 transition-colors backdrop-blur-sm disabled:opacity-50"
          />
          <motion.button
            type="submit"
            disabled={status === 'loading'}
            whileHover={{ scale: status === 'loading' ? 1 : 1.05 }}
            whileTap={{ scale: status === 'loading' ? 1 : 0.95 }}
            className="px-12 py-5 bg-amber-400 text-stone-900 font-medium hover:bg-amber-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {status === 'loading' ? 'Subscribing...' : 'Subscribe'}
          </motion.button>
        </motion.form>

        {/* Status Message */}
        {message && (
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`text-sm ${status === 'success' ? 'text-green-400' : 'text-red-400'}`}
          >
            {message}
          </motion.p>
        )}

        {/* Trust Badges */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          viewport={{ once: true }}
          className="flex flex-wrap justify-center gap-8 pt-8"
        >
          {['10K+ Subscribers', 'Weekly Updates', 'Exclusive Offers'].map((badge, i) => (
            <div key={i} className="flex items-center gap-2 text-stone-400 text-sm">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              <span>{badge}</span>
            </div>
          ))}
        </motion.div>

      </div>
    </section>
  )
}

// ==================== SHIPPING INFO SECTION ====================
export function ShippingInfo() {
  const features = [
    {
      icon: '🚚',
      title: 'Free Shipping',
      description: 'On orders over £50',
    },
    {
      icon: '🔄',
      title: 'Easy Returns',
      description: '30-day return policy',
    },
    {
      icon: '🔒',
      title: 'Secure Payment',
      description: 'SSL encrypted checkout',
    },
    {
      icon: '💬',
      title: '24/7 Support',
      description: 'Always here to help',
    },
  ]

  return (
    <section className="py-16 px-6 md:px-12 bg-white border-y border-stone-200">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="flex flex-col items-center text-center group"
            >
              <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">{feature.icon}</div>
              <h3 className="text-lg font-medium text-stone-900 mb-2 tracking-wide">
                {feature.title}
              </h3>
              <p className="text-stone-600 text-sm font-light">
                {feature.description}
              </p>
              <div className="w-12 h-px bg-stone-200 mt-4 group-hover:bg-amber-400 group-hover:w-full transition-all duration-300" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}