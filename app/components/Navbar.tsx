'use client';

import Image from 'next/image'
import Link from 'next/link'
import React, { useState, ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <nav className="w-full fixed top-0 z-50 bg-transparent/0 backdrop-blur-xs border-b border-neutral-200/30">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center relative">
          
          {/* LEFT SIDE */}
          <div className="flex items-center gap-8 z-10">
            
            {/* Mobile Menu Button (Visible < md) */}
            <button onClick={() => setIsOpen(true)} className="md:hidden text-neutral-600 hover:text-[#C5A059] transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            {/* Desktop Navigation (Visible > md) */}
            <div className="hidden md:flex justify-start items-center gap-8">
              <NavLink href="/shop">SHOP</NavLink>
              <NavLink href="/collections">COLLECTIONS</NavLink>
              <NavLink href="/beauty">BEAUTY</NavLink>
            </div>
          </div>

          {/* CENTER: Logo */}
          <div className="absolute left-1/2 transform -translate-x-1/2 z-20">
            <Link href="/" className="relative block group">
              <motion.div
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <Image 
                  src="/logo/1bg.png" 
                  alt="Logo"
                  width={60}      
                  height={40}       
                  className="object-contain"
                  priority
                />
              </motion.div>
            </Link>
          </div>

          {/* RIGHT: E-commerce Utilities */}
          <div className="flex justify-end items-center gap-5 z-10">
            
            {/* Search Icon (Hidden on very small screens if needed, but let's keep it) */}
            <UtilityButton href="/search">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 md:h-4 md:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </UtilityButton>

            {/* Account Icon (Hidden on mobile to save space, usually in menu) */}
            <UtilityButton href="/account" className="hidden md:block">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </UtilityButton>

            {/* Cart Icon */}
            <UtilityButton href="/cart">
              <div className="relative">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 md:h-4 md:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                <span className="absolute -top-2 -right-2 bg-[#C5A059] text-white text-[8px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                  3
                </span>
              </div>
            </UtilityButton>

          </div>
        </div>
      </nav>

      {/* MOBILE MENU OVERLAY */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50"
            />

            {/* Slide-out Menu */}
            <motion.div 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 bottom-0 w-[280px] bg-white z-50 shadow-2xl flex flex-col"
            >
              {/* Menu Header */}
              <div className="flex justify-between items-center p-6 border-b border-neutral-100">
                <span className="text-xs font-bold uppercase tracking-widest text-neutral-400">Menu</span>
                <button onClick={() => setIsOpen(false)} className="text-neutral-600 hover:text-[#C5A059]">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Menu Links */}
              <div className="flex flex-col p-6 gap-1">
                <MobileNavLink href="/shop" onClick={() => setIsOpen(false)}>Shop</MobileNavLink>
                <MobileNavLink href="/collections" onClick={() => setIsOpen(false)}>Collections</MobileNavLink>
                <MobileNavLink href="/beauty" onClick={() => setIsOpen(false)}>Beauty</MobileNavLink>
                <MobileNavLink href="/about" onClick={() => setIsOpen(false)}>About</MobileNavLink>
                
                <div className="my-6 border-t border-neutral-100" />
                
                <MobileNavLink href="/account" onClick={() => setIsOpen(false)}>Account</MobileNavLink>
                <MobileNavLink href="/wishlist" onClick={() => setIsOpen(false)}>Wishlist</MobileNavLink>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

// Desktop NavLink Component
const NavLink = ({ href, children }: { href: string; children: ReactNode }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Link 
      href={href} 
      className="relative text-[11px] font-medium uppercase tracking-[0.2em] text-neutral-600 transition-colors duration-300 hover:text-[#C5A059] py-2"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {children}
      <motion.div 
        className="absolute bottom-0 left-0 right-0 h-[1px] bg-[#C5A059]"
        initial={{ scaleX: 0, originX: 0 }}
        animate={{ scaleX: isHovered ? 1 : 0 }}
        transition={{ duration: 0.4, ease: [0.43, 0.13, 0.23, 0.96] }}
      />
    </Link>
  );
};

// Mobile NavLink Component
const MobileNavLink = ({ href, children, onClick }: { href: string; children: ReactNode; onClick?: () => void }) => {
  return (
    <Link 
      href={href} 
      onClick={onClick}
      className="text-lg font-light text-neutral-700 hover:text-[#C5A059] transition-colors py-3 border-b border-neutral-50"
    >
      {children}
    </Link>
  );
};

// Utility Button Component
const UtilityButton = ({ href, children, className = "" }: { href: string; children: ReactNode; className?: string }) => {
  return (
    <Link 
      href={href} 
      className={`text-neutral-600 hover:text-[#C5A059] transition-colors duration-300 relative ${className}`}
    >
      {children}
    </Link>
  );
};

export default Navbar