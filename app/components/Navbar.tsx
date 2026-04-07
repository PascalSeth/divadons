'use client';

import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSession, signOut } from 'next-auth/react'
import { useCart } from '@/app/contexts/CartContext'
import { useWishlist } from '@/app/contexts/WishlistContext'
import { SiteSettings } from '@/lib/settings'
import NotificationBell from './NotificationBell'

interface NavbarProps {
  settings?: SiteSettings;
}



function Navbar({ settings }: NavbarProps) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { itemCount } = useCart();
  const { itemCount: wishlistCount } = useWishlist();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

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
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus search input when opened
  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchOpen]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-700 ${scrolled
            ? 'bg-white/80 backdrop-blur-xl border-b border-stone-100 py-2 shadow-[0_2px_20px_rgba(0,0,0,0.02)]'
            : 'bg-transparent py-2'
          }`}
      >
        <div className="max-w-[1440px] mx-auto px-6 md:px-10 lg:px-16">
          <div className="flex items-center justify-between min-h-[40px] md:min-h-[50px]">

            {/* LEFT: Desktop Links */}
            <div className="hidden md:flex flex-1 items-center justify-start">
              <div className="flex items-center gap-10 lg:gap-14">
                <NavLink href="/shop">Shop</NavLink>
                <NavLink href="/collections">Collections</NavLink>
              </div>
            </div>

            {/* Mobile Menu Button (Left on Mobile) */}
            <div className="md:hidden flex flex-1 items-center justify-start">
              <button
                onClick={() => setIsOpen(true)}
                className="relative w-10 h-10 flex items-center justify-center -ml-2"
                aria-label="Open menu"
              >
                <div className="w-6 space-y-1.5">
                  <span className="block h-[1px] bg-stone-900 transition-all"></span>
                  <span className="block h-[1px] bg-stone-900 transition-all"></span>
                </div>
              </button>
            </div>

            {/* CENTER: Logo - PART OF FLEX TO ENSURE HEIGHT COMPLIANCE */}
            <div className="flex-shrink-0 flex items-center justify-center">
              <Link href="/" className="group block focus:outline-none">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="flex items-center justify-center"
                >
                  <Image
                    src={settings?.logoUrl || "/logo/1bg.png"}
                    alt={settings?.siteName || "Logo"}
                    width={180}
                    height={120}
                    className={`object-contain transition-all duration-500 ${scrolled ? 'h-8 md:h-10' : 'h-10 md:h-12'
                      } w-auto`}
                    priority
                  />
                </motion.div>
              </Link>
            </div>

            {/* RIGHT: Utilities */}
            <div className="flex-1 flex items-center justify-end gap-3 sm:gap-6 md:gap-8">
              <div className="hidden lg:flex items-center gap-8 mr-2">
                <NavLink href="/beauty">Beauty</NavLink>
              </div>

              {/* Expandable Search Trigger */}
              <button
                onClick={() => setSearchOpen(true)}
                className="text-stone-600 hover:text-stone-900 transition-colors duration-300 p-2"
                aria-label="Open search"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-[20px] w-[20px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>

              {/* Account (Desktop only) */}
              <div className="hidden md:block relative" ref={dropdownRef}>
                {status === 'authenticated' && session?.user ? (
                  <button
                    onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                    className="flex items-center transition-opacity hover:opacity-70 p-1"
                  >
                    {session.user.image ? (
                      <Image
                        src={session.user.image}
                        alt={session.user.name || 'Profile'}
                        width={26}
                        height={26}
                        className="rounded-full object-cover grayscale focus:grayscale-0"
                      />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-stone-100 flex items-center justify-center text-[9px] font-bold text-stone-600 border border-stone-200">
                        {session.user.name?.charAt(0).toUpperCase() || 'U'}
                      </div>
                    )}
                  </button>
                ) : (
                  <Link href="/login" className="text-stone-600 hover:text-stone-900 transition-colors duration-300 p-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-[20px] w-[20px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </Link>
                )}

                <AnimatePresence>
                  {profileDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                      className="absolute right-0 mt-6 w-56 bg-white/90 backdrop-blur-xl border border-stone-100 py-2 z-50 shadow-[0_10px_40px_rgba(0,0,0,0.05)]"
                    >
                      <div className="px-5 py-3 border-b border-stone-50 mb-1">
                        <p className="text-[10px] font-bold text-stone-900 uppercase tracking-widest leading-none">{session?.user?.name}</p>
                        <p className="text-[9px] text-stone-400 truncate tracking-wider mt-1">{session?.user?.email}</p>
                      </div>
                      <Link href="/account" className="block px-5 py-2 text-[10px] uppercase tracking-[0.2em] text-stone-500 hover:text-stone-900 transition-colors">Account</Link>
                      <Link href="/orders" className="block px-5 py-2 text-[10px] uppercase tracking-[0.2em] text-stone-500 hover:text-stone-900 transition-colors">Orders</Link>
                      <Link href="/wishlist" className="block px-5 py-2 text-[10px] uppercase tracking-[0.2em] text-stone-500 hover:text-stone-900 transition-colors">Wishlist</Link>
                      <button
                        onClick={() => { setProfileDropdownOpen(false); signOut({ callbackUrl: '/' }); }}
                        className="w-full text-left px-5 py-3 text-[10px] uppercase tracking-[0.2em] text-red-400 hover:text-red-700 transition-colors border-t border-stone-50 mt-1"
                      >
                        Sign Out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Wishlist */}
              <UtilityButton href="/wishlist" className="hidden sm:block">
                <div className="relative">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-[20px] w-[20px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  {wishlistCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 bg-amber-600 text-white! text-[7px] w-3 h-3 rounded-full flex items-center justify-center font-bold">
                      {wishlistCount > 9 ? '+' : wishlistCount}
                    </span>
                  )}
                </div>
              </UtilityButton>

              {/* Cart */}
              <UtilityButton href="/cart" className="p-1">
                <div className="relative">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-[20px] w-[20px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  {itemCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 bg-stone-900 text-white! text-[7px] w-3 h-3 rounded-full flex items-center justify-center font-bold">
                      {itemCount > 9 ? '+' : itemCount}
                    </span>
                  )}
                </div>
              </UtilityButton>

            </div>
          </div>
        </div>
      </motion.nav>

      {/* SEARCH OVERLAY */}
      <AnimatePresence>
        {searchOpen && (
          <SearchOverlay
            isOpen={searchOpen}
            onClose={() => setSearchOpen(false)}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            handleSearch={handleSearch}
          />
        )}
      </AnimatePresence>

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
                    src={settings?.logoUrl || "/logo/1bg.png"}
                    alt={settings?.siteName || "Logo"}
                    width={50}
                    height={35}
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
                        className="group block text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-playfair font-light text-stone-900 hover:text-amber-600 transition-all duration-300 leading-none py-2 italic"
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
                              {session.user.name?.charAt(0).toUpperCase() || 'U'}
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
                          My Account
                        </Link>
                        <Link
                          href="/orders"
                          onClick={() => setIsOpen(false)}
                          className="group flex items-center gap-3 text-xl font-light text-stone-600 hover:text-stone-900 transition-colors"
                        >
                          My Orders
                        </Link>
                        <Link
                          href="/wishlist"
                          onClick={() => setIsOpen(false)}
                          className="group flex items-center gap-3 text-xl font-light text-stone-600 hover:text-stone-900 transition-colors"
                        >
                          Wishlist
                        </Link>
                        <button
                          onClick={() => {
                            setIsOpen(false);
                            signOut({ callbackUrl: '/' });
                          }}
                          className="group flex items-center gap-3 text-xl font-light text-red-600 hover:text-red-700 transition-colors"
                        >
                          Sign Out
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <Link
                          href="/login"
                          onClick={() => setIsOpen(false)}
                          className="group flex items-center gap-3 text-xl font-light text-stone-900 hover:text-amber-600 transition-colors"
                        >
                          Sign In
                        </Link>
                        <Link
                          href="/login?register=true"
                          onClick={() => setIsOpen(false)}
                          className="group flex items-center gap-3 text-xl font-light text-stone-600 hover:text-stone-900 transition-colors"
                        >
                          Create Account
                        </Link>
                        <Link
                          href="/wishlist"
                          onClick={() => setIsOpen(false)}
                          className="group flex items-center gap-3 text-xl font-light text-stone-600 hover:text-stone-900 transition-colors"
                        >
                          Wishlist
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
                      <h3 className="text-2xl font-playfair font-light text-stone-900 mb-3 italic">
                        Get in Touch
                      </h3>
                      <p className="text-stone-600 font-light leading-relaxed">
                        Have questions? Our team is here to help you find the perfect pieces.
                      </p>
                    </div>

                    <button
                      onClick={() => setIsOpen(false)}
                      className="inline-block px-8 py-4 bg-stone-900 text-white! text-[10px] font-medium tracking-widest uppercase hover:bg-amber-600 transition-all duration-500"
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
                    © {new Date().getFullYear()} {settings?.siteName || "African Heritage"}
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

// Desktop NavLink Component with Mega Menu support
const NavLink = ({ href, megaMenu, children }: { href: string; children: React.ReactNode; megaMenu?: React.ReactNode }) => {
  const [isHovered, setIsHovered] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsHovered(false);
    }, 300);
  };

  return (
    <div
      className="relative py-2 group"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Link
        href={href}
        className="relative text-[10px] sm:text-[11px] font-medium uppercase tracking-[0.3em] text-stone-600 transition-colors duration-500 hover:text-stone-900 flex items-center gap-1.5"
      >
        {children}
        <motion.div
          className="absolute -bottom-1 left-0 right-0 h-[1.2px] bg-stone-900"
          initial={{ scaleX: 0, originX: 0 }}
          animate={{ scaleX: isHovered ? 1 : 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        />
      </Link>

      {/* Mega Menu Container - FIXED POSITIONING TO AVOID CLIPPING */}
      {megaMenu && (
        <AnimatePresence>
          {isHovered && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="fixed left-0 top-[var(--nav-height,60px)] md:top-[var(--nav-height,80px)] w-screen z-[60] pointer-events-auto"
            >
              <div className="bg-white/95 backdrop-blur-xl border-y border-stone-100 shadow-[0_20px_60px_rgba(0,0,0,0.05)] w-full py-16">
                <div className="max-w-[1400px] mx-auto px-6 md:px-10 lg:px-16">
                  {megaMenu}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
};

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  handleSearch: (e: React.FormEvent) => void;
}

// --- Search Overlay Component ---
const SearchOverlay = ({ isOpen: _isOpen, onClose, searchQuery, setSearchQuery, handleSearch }: SearchOverlayProps) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="fixed inset-0 z-[100] flex flex-col bg-white"
    >
      <div className="max-w-[1400px] mx-auto w-full px-6 md:px-10 lg:px-16 py-8">
        <div className="flex justify-between items-center mb-16">
          <span className="text-[10px] tracking-[0.3em] uppercase font-bold text-stone-400">Search Products</span>
          <button onClick={onClose} className="p-2 hover:text-amber-600 transition-colors">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSearch} className="max-w-4xl mx-auto w-full">
          <div className="relative border-b-[1.5px] border-stone-200 focus-within:border-stone-900 transition-colors">
            <input
              autoFocus
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="What are you looking for?"
              className="w-full text-3xl md:text-5xl lg:text-6xl font-playfair italic text-stone-900 placeholder:text-stone-200 bg-transparent py-8 outline-none"
            />
            <button type="submit" className="absolute right-0 top-1/2 -translate-y-1/2 p-4 text-stone-400 hover:text-stone-900 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </button>
          </div>

          <div className="mt-12 flex flex-wrap gap-x-12 gap-y-6">
            <span className="text-[10px] tracking-[0.3em] uppercase font-bold text-stone-300 w-full mb-2">Suggested</span>
            {['Ankara Dresses', 'Organic Oils', 'Beaded Jewelry', 'New Collections'].map((term) => (
              <button
                key={term}
                type="button"
                onClick={() => { setSearchQuery(term); }}
                className="text-xs tracking-wider text-stone-500 hover:text-stone-900 transition-colors pb-1 border-b border-transparent hover:border-stone-900"
              >
                {term}
              </button>
            ))}
          </div>
        </form>
      </div>
    </motion.div>
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
