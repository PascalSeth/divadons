'use client';

import Image from 'next/image'
import Link from 'next/link'
import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSession, signOut } from 'next-auth/react'
import { useCart } from '@/app/contexts/CartContext'
import { useWishlist } from '@/app/contexts/WishlistContext'

function Navbar() {
  const { data: session, status } = useSession();
  const { itemCount } = useCart();
  const { itemCount: wishlistCount } = useWishlist();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <>
      <motion.nav 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${
          scrolled 
            ? 'bg-white/95 backdrop-blur-md border-b border-stone-200 py-3' 
            : 'bg-transparent py-4'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12">
          <div className="flex items-center justify-between">
            
            {/* LEFT: Menu Button (Mobile) + Desktop Links */}
            <div className="flex items-center gap-6 md:gap-8">
              
              {/* Mobile Menu Button */}
              <button 
                onClick={() => setIsOpen(true)} 
                className="md:hidden relative w-10 h-10 flex items-center justify-center"
                aria-label="Open menu"
              >
                <div className="w-5 space-y-1.5">
                  <span className="block h-[1.5px] bg-stone-900 transition-all"></span>
                  <span className="block h-[1.5px] bg-stone-900 transition-all"></span>
                </div>
              </button>

              {/* Desktop Navigation */}
              <div className="hidden md:flex items-center gap-6 lg:gap-8">
                <NavLink href="/shop">Shop</NavLink>
                <NavLink href="/collections">Collections</NavLink>
                <NavLink href="/beauty">Beauty</NavLink>
              </div>
            </div>

            {/* CENTER: Logo */}
            <Link href="/" className="absolute left-1/2 transform -translate-x-1/2 group">
              <motion.div
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <Image 
                  src="/logo/1bg.png" 
                  alt="Logo"
                  width={50}      
                  height={35}       
                  className="object-contain"
                  priority
                />
              </motion.div>
            </Link>

            {/* RIGHT: Utilities */}
            <div className="flex items-center gap-3 sm:gap-4 md:gap-5">
              
              {/* Search */}
              <UtilityButton href="/search" aria-label="Search">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </UtilityButton>

              {/* Account (Desktop only) */}
              {status === 'authenticated' && session?.user ? (
                <div className="hidden md:block relative" ref={dropdownRef}>
                  <button
                    onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                    className="flex items-center gap-2 text-stone-600 hover:text-stone-900 transition-colors duration-300"
                    aria-label="Account menu"
                  >
                    {session.user.image ? (
                      <Image
                        src={session.user.image}
                        alt={session.user.name || 'Profile'}
                        width={32}
                        height={32}
                        className="rounded-full object-cover border-2 border-stone-200 hover:border-amber-500 transition-colors"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-stone-200 flex items-center justify-center text-sm font-medium text-stone-600 hover:bg-amber-100 transition-colors">
                        {session.user.name?.charAt(0).toUpperCase() || session.user.email?.charAt(0).toUpperCase() || 'U'}
                      </div>
                    )}
                  </button>
                  
                  <AnimatePresence>
                    {profileDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-stone-200 py-2 z-50"
                      >
                        <div className="px-4 py-2 border-b border-stone-100">
                          <p className="text-sm font-medium text-stone-900 truncate">{session.user.name}</p>
                          <p className="text-xs text-stone-500 truncate">{session.user.email}</p>
                        </div>
                        <Link
                          href="/account"
                          onClick={() => setProfileDropdownOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-sm text-stone-600 hover:bg-stone-50 hover:text-stone-900 transition-colors"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          My Account
                        </Link>
                        <Link
                          href="/orders"
                          onClick={() => setProfileDropdownOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-sm text-stone-600 hover:bg-stone-50 hover:text-stone-900 transition-colors"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                          </svg>
                          My Orders
                        </Link>
                        <Link
                          href="/wishlist"
                          onClick={() => setProfileDropdownOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-sm text-stone-600 hover:bg-stone-50 hover:text-stone-900 transition-colors"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                          </svg>
                          Wishlist
                        </Link>
                        <button
                          onClick={() => {
                            setProfileDropdownOpen(false);
                            signOut({ callbackUrl: '/' });
                          }}
                          className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors w-full"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                          </svg>
                          Sign Out
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <UtilityButton href="/login" className="hidden md:block" aria-label="Account">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </UtilityButton>
              )}

              {/* Wishlist */}
              <UtilityButton href="/wishlist" aria-label="Wishlist" className="hidden sm:block">
                <div className="relative">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  {wishlistCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-medium">
                      {wishlistCount > 99 ? '99+' : wishlistCount}
                    </span>
                  )}
                </div>
              </UtilityButton>

              {/* Cart */}
              <UtilityButton href="/cart" aria-label="Cart">
                <div className="relative">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  {itemCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-stone-900 text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-medium">
                      {itemCount > 99 ? '99+' : itemCount}
                    </span>
                  )}
                </div>
              </UtilityButton>

            </div>
          </div>
        </div>
      </motion.nav>

      {/* FULL SCREEN MENU OVERLAY */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-[60] bg-white overflow-y-auto"
          >
            {/* Menu Header */}
            <div className="sticky top-0 bg-white z-10 border-b border-stone-200">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12 py-4 flex justify-between items-center">
                <Link href="/" onClick={() => setIsOpen(false)}>
                  <Image 
                    src="/logo/1bg.png" 
                    alt="Logo"
                    width={45}      
                    height={32}       
                    className="object-contain"
                  />
                </Link>
                
                <button 
                  onClick={() => setIsOpen(false)}
                  className="relative w-10 h-10 flex items-center justify-center group"
                  aria-label="Close menu"
                >
                  <div className="relative w-5 h-5">
                    <span className="absolute top-1/2 left-0 w-full h-[1.5px] bg-stone-900 rotate-45 transform -translate-y-1/2 group-hover:bg-amber-600 transition-colors"></span>
                    <span className="absolute top-1/2 left-0 w-full h-[1.5px] bg-stone-900 -rotate-45 transform -translate-y-1/2 group-hover:bg-amber-600 transition-colors"></span>
                  </div>
                </button>
              </div>
            </div>

            {/* Menu Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12 py-12 md:py-16">
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
                
                {/* Left: Main Navigation */}
                <div className="space-y-2">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1, duration: 0.5 }}
                  >
                    <span className="text-[10px] tracking-[0.3em] uppercase text-stone-400 font-medium mb-6 block">
                      Navigation
                    </span>
                  </motion.div>
                  
                  {[
                    { name: 'Shop All', href: '/shop' },
                    { name: 'Collections', href: '/collections' },
                    { name: 'Beauty', href: '/beauty' },
                    { name: 'About Us', href: '/about' },
                  ].map((link, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 + (i * 0.1), duration: 0.5 }}
                    >
                      <Link 
                        href={link.href} 
                        onClick={() => setIsOpen(false)}
                        className="group block text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-serif font-light text-stone-900 hover:text-amber-600 transition-all duration-300 leading-none py-2"
                      >
                        <span className="inline-block group-hover:translate-x-4 transition-transform duration-300">
                          {link.name}
                        </span>
                      </Link>
                    </motion.div>
                  ))}
                </div>

                {/* Right: Secondary Links & Info */}
                <div className="flex flex-col justify-between space-y-12 lg:space-y-0">
                  
                  {/* Secondary Links */}
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5, duration: 0.5 }}
                    className="space-y-6"
                  >
                    <span className="text-[10px] tracking-[0.3em] uppercase text-stone-400 font-medium block">
                      Account
                    </span>
                    
                    {status === 'authenticated' && session?.user ? (
                      <div className="space-y-4">
                        {/* User Info */}
                        <div className="flex items-center gap-3 pb-4 border-b border-stone-200">
                          {session.user.image ? (
                            <Image
                              src={session.user.image}
                              alt={session.user.name || 'Profile'}
                              width={48}
                              height={48}
                              className="rounded-full object-cover border-2 border-stone-200"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-full bg-stone-200 flex items-center justify-center text-lg font-medium text-stone-600">
                              {session.user.name?.charAt(0).toUpperCase() || session.user.email?.charAt(0).toUpperCase() || 'U'}
                            </div>
                          )}
                          <div>
                            <p className="text-lg font-light text-stone-900">{session.user.name}</p>
                            <p className="text-sm text-stone-500">{session.user.email}</p>
                          </div>
                        </div>
                        <Link 
                          href="/account" 
                          onClick={() => setIsOpen(false)}
                          className="group flex items-center gap-3 text-xl font-light text-stone-600 hover:text-stone-900 transition-colors"
                        >
                          <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                          </svg>
                          My Account
                        </Link>
                        <Link 
                          href="/orders" 
                          onClick={() => setIsOpen(false)}
                          className="group flex items-center gap-3 text-xl font-light text-stone-600 hover:text-stone-900 transition-colors"
                        >
                          <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                          </svg>
                          My Orders
                        </Link>
                        <Link 
                          href="/wishlist" 
                          onClick={() => setIsOpen(false)}
                          className="group flex items-center gap-3 text-xl font-light text-stone-600 hover:text-stone-900 transition-colors"
                        >
                          <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                          </svg>
                          Wishlist
                        </Link>
                        <button 
                          onClick={() => {
                            setIsOpen(false);
                            signOut({ callbackUrl: '/' });
                          }}
                          className="group flex items-center gap-3 text-xl font-light text-red-600 hover:text-red-700 transition-colors"
                        >
                          <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                          </svg>
                          Sign Out
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <Link 
                          href="/login" 
                          onClick={() => setIsOpen(false)}
                          className="group flex items-center gap-3 text-xl font-light text-stone-600 hover:text-stone-900 transition-colors"
                        >
                          <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                          </svg>
                          Sign In
                        </Link>
                        <Link 
                          href="/login?register=true" 
                          onClick={() => setIsOpen(false)}
                          className="group flex items-center gap-3 text-xl font-light text-stone-600 hover:text-stone-900 transition-colors"
                        >
                          <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                          </svg>
                          Create Account
                        </Link>
                        <Link 
                          href="/wishlist" 
                          onClick={() => setIsOpen(false)}
                          className="group flex items-center gap-3 text-xl font-light text-stone-600 hover:text-stone-900 transition-colors"
                        >
                          <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                          </svg>
                          Wishlist
                        </Link>
                        <Link 
                          href="/contact" 
                          onClick={() => setIsOpen(false)}
                          className="group flex items-center gap-3 text-xl font-light text-stone-600 hover:text-stone-900 transition-colors"
                        >
                          <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                          </svg>
                          Contact Us
                        </Link>
                      </div>
                    )}
                  </motion.div>

                  {/* Info Section */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6, duration: 0.5 }}
                    className="space-y-8 pt-8 border-t border-stone-200"
                  >
                    <div>
                      <h3 className="text-2xl font-serif font-light text-stone-900 mb-3">
                        Get in Touch
                      </h3>
                      <p className="text-stone-600 font-light leading-relaxed">
                        Have questions? Our team is here to help you find the perfect pieces.
                      </p>
                    </div>
                    
                    <button 
                      onClick={() => setIsOpen(false)}
                      className="inline-block px-8 py-4 bg-stone-900 text-white! text-xs font-medium tracking-wider uppercase hover:bg-amber-600 transition-colors duration-300"
                    >
                      Start Shopping
                    </button>
                  </motion.div>

                </div>
              </div>

            </div>

            {/* Menu Footer */}
            <div className="border-t border-stone-200 mt-12">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12 py-6">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                  <span className="text-[10px] uppercase tracking-widest text-stone-400">
                    © 2024 African Heritage
                  </span>
                  <div className="flex gap-6">
                    {['Instagram', 'Facebook', 'Pinterest'].map((social) => (
                      <a 
                        key={social}
                        href="#" 
                        className="text-[10px] uppercase tracking-widest text-stone-400 hover:text-stone-900 transition-colors"
                      >
                        {social}
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </div>

          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

// Desktop NavLink Component
const NavLink = ({ href, children }: { href: string; children: React.ReactNode }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Link 
      href={href} 
      className="relative text-[11px] font-medium uppercase tracking-[0.2em] text-stone-600 transition-colors duration-300 hover:text-stone-900 py-2"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {children}
      <motion.div 
        className="absolute bottom-0 left-0 right-0 h-[1px] bg-stone-900"
        initial={{ scaleX: 0, originX: 0 }}
        animate={{ scaleX: isHovered ? 1 : 0 }}
        transition={{ duration: 0.4, ease: [0.43, 0.13, 0.23, 0.96] }}
      />
    </Link>
  );
};

// Utility Button Component
const UtilityButton = ({ 
  href, 
  children, 
  className = "",
  ...props 
}: { 
  href: string; 
  children: React.ReactNode; 
  className?: string;
} & React.AnchorHTMLAttributes<HTMLAnchorElement>) => {
  return (
    <Link 
      href={href} 
      className={`text-stone-600 hover:text-stone-900 transition-colors duration-300 relative ${className}`}
      {...props}
    >
      {children}
    </Link>
  );
};

export default Navbar