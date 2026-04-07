'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { SiteSettings } from '@/lib/settings';

const menuItems = [
  {
    title: 'Main',
    items: [
      { name: 'Dashboard', href: '/admin', icon: DashboardIcon },
      { name: 'Analytics', href: '/admin/analytics', icon: AnalyticsIcon },
    ],
  },
  {
    title: 'Management',
    items: [
          { name: 'Collections', href: '/admin/collections', icon: CollectionsIcon },         
          { name: 'Categories', href: '/admin/categories', icon: CategoriesIcon },
          { name: 'Products', href: '/admin/products', icon: ProductsIcon },
          { name: 'Orders', href: '/admin/orders', icon: OrdersIcon },
          { name: 'Coupons', href: '/admin/coupons', icon: CouponsIcon },
          { name: 'Customers', href: '/admin/customers', icon: CustomersIcon },
        ],
  },
  {
    title: 'Content',
    items: [
      { name: 'Blog', href: '/admin/blog', icon: BlogIcon },
      { name: 'Announcements', href: '/admin/announcements', icon: AnnouncementsIcon },
    ],
  },
  {
    title: 'Settings',
    items: [
      { name: 'Settings', href: '/admin/settings', icon: SettingsIcon },
    ],
  },
];

function SidebarContent({ pathname }: { pathname: string }) {
  const [settings, setSettings] = useState<SiteSettings | null>(null);

  useEffect(() => {
    async function fetchSettings() {
      try {
        const res = await fetch('/api/settings');
        const json = await res.json();
        if (json.success) setSettings(json.data);
      } catch (e) {
        console.error('Failed to fetch sidebar settings');
      }
    }
    fetchSettings();
  }, []);

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
            <div className="px-6 pt-8 pb-6">
              <Link href="/admin" className="flex items-center gap-3 group">
                <Image
                  src={settings?.logoUrl || "/logo/1bg.png"}
                  alt={settings?.siteName || "Logo"}
                  width={45}
                  height={32}
                  className="object-contain"
                />
                <div>
                  <p
                    className="text-sm font-semibold tracking-widest uppercase"
                    style={{ color: '#e8dcc8', fontFamily: "'Cormorant Garamond', serif", letterSpacing: '0.2em' }}
                  >
                    Admin
                  </p>
                  <p className="text-[9px] tracking-[0.3em] uppercase" style={{ color: '#5a4f3f' }}>
                    Control Panel
                  </p>
                </div>
              </Link>
            </div>

      {/* Divider */}
      <div className="mx-6 h-px" style={{ background: 'linear-gradient(90deg, transparent, #2a2218, transparent)' }} />

      {/* Navigation */}
            <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-7" style={{
              scrollbarWidth: 'thin',
              scrollbarColor: 'rgba(201,168,76,0.3) transparent',
            }}>
              {menuItems.map((section) => (
                <div key={section.title}>
                  <p
                    className="text-[9px] uppercase tracking-[0.35em] mb-3 px-3"
                    style={{ color: '#3d3428', fontFamily: 'monospace' }}
                  >
                    {section.title}
                  </p>
                  <ul className="space-y-0.5">
              {section.items.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className="relative flex items-center gap-3 px-3 py-2.5 rounded-md transition-all duration-200 group"
                      style={{
                        background: isActive ? 'rgba(201,168,76,0.1)' : 'transparent',
                        color: isActive ? '#c9a84c' : '#6b5e4e',
                      }}
                    >
                      {isActive && (
                        <motion.div
                          layoutId="activeBar"
                          className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full"
                          style={{ background: '#c9a84c' }}
                          transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                        />
                      )}
                      <item.icon
                        className="w-4 h-4 shrink-0 transition-colors duration-200"
                        style={{ color: isActive ? '#c9a84c' : '#3d3428' }}
                      />
                      <span
                        className="text-sm transition-colors duration-200"
                        style={{
                          fontFamily: "'DM Mono', monospace",
                          fontSize: '12px',
                          letterSpacing: '0.05em',
                          color: isActive ? '#c9a84c' : '#6b5e4e',
                        }}
                      >
                        {item.name}
                      </span>

                      {/* Hover glow */}
                      {!isActive && (
                        <span
                          className="absolute inset-0 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                          style={{ background: 'rgba(255,255,255,0.02)' }}
                        />
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-4 pb-6">
        <div className="mx-2 h-px mb-4" style={{ background: 'linear-gradient(90deg, transparent, #2a2218, transparent)' }} />
        <Link
          href="/"
          className="flex items-center gap-3 px-3 py-2.5 rounded-md group transition-colors duration-200"
          style={{ color: '#3d3428' }}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
          <span
            className="text-xs tracking-widest uppercase group-hover:text-amber-600 transition-colors duration-200"
            style={{ fontFamily: 'monospace' }}
          >
            Storefront
          </span>
        </Link>
        </div>
      </div>
    );
  }
  
  export default function Sidebar() {
    const pathname = usePathname();
    const [mobileOpen, setMobileOpen] = useState(false);
  
    return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 lg:hidden"
            style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
            onClick={() => setMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Mobile toggle (rendered in Navbar via prop ideally, but kept here for self-containment) */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed top-4 left-4 z-30 lg:hidden w-9 h-9 flex items-center justify-center rounded-md"
        style={{ background: '#141008', border: '1px solid #2a2218' }}
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="#c9a84c" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Desktop Sidebar */}
      <aside
        className="hidden lg:flex flex-col w-55 shrink-0 h-screen sticky top-0"
        style={{
          background: '#0d0b07',
          borderRight: '1px solid #1e1a12',
        }}
      >
        <SidebarContent pathname={pathname} />
      </aside>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.aside
            initial={{ x: -220 }}
            animate={{ x: 0 }}
            exit={{ x: -220 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed top-0 left-0 h-full w-55 z-50 lg:hidden flex flex-col"
            style={{ background: '#0d0b07', borderRight: '1px solid #1e1a12' }}
          >
            <SidebarContent pathname={pathname} />
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}

function DashboardIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg className={className} style={style} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
    </svg>
  );
}

function AnalyticsIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg className={className} style={style} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  );
}

function ProductsIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg className={className} style={style} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
  );
}

function OrdersIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg className={className} style={style} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
    </svg>
  );
}

function CustomersIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg className={className} style={style} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  );
}

function BlogIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg className={className} style={style} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
    </svg>
  );
}

function CollectionsIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg className={className} style={style} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
    </svg>
  );
}

function SettingsIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg className={className} style={style} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

function CategoriesIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg className={className} style={style} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
    </svg>
  );
}

function AnnouncementsIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg className={className} style={style} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
    </svg>
  );
}

function CouponsIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg className={className} style={style} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
    </svg>
  );
}