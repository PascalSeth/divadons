'use client';

import { useState, useRef, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useSession, signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

const notifications = [
  { id: 1, title: 'New order received', message: 'Order #1234 — John Doe', time: '2m ago', unread: true },
  { id: 2, title: 'Low stock alert', message: 'African Print Dress ↓ 3 left', time: '1h ago', unread: true },
  { id: 3, title: 'New customer', message: 'Sarah Johnson registered', time: '3h ago', unread: false },
];

export default function Navbar() {
  const { data: session } = useSession();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const userRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => n.unread).length;

  // Close dropdowns on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (userRef.current && !userRef.current.contains(e.target as Node)) setShowUserMenu(false);
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setShowNotifications(false);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <header
      className="h-14 flex items-center justify-between px-6 sticky top-0 z-30"
      style={{
        background: 'rgba(249,247,242,0.85)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid #e8e0d0',
      }}
    >
      {/* Left — breadcrumb / page title area */}
      <div className="flex items-center gap-2">
        <div
          className="flex items-center gap-1.5 text-xs tracking-widest uppercase"
          style={{ fontFamily: 'monospace', color: '#9a8870' }}
        >
          <span>Admin</span>
          <span style={{ color: '#c9a84c' }}>›</span>
          <span style={{ color: '#3d2e1a' }}>Dashboard</span>
        </div>
      </div>

      {/* Right — Actions */}
      <div className="flex items-center gap-1">
        {/* Search */}
        <div className="hidden sm:flex items-center mr-2">
          <div className="relative">
            <input
              type="text"
              placeholder="Search anything..."
              className="w-52 pl-8 pr-4 py-1.5 text-xs rounded-md outline-none transition-all duration-200 focus:w-64"
              style={{
                background: '#f0ebe0',
                border: '1px solid #ddd4be',
                color: '#3d2e1a',
                fontFamily: 'monospace',
                letterSpacing: '0.03em',
              }}
            />
            <svg
              className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none"
              fill="none" viewBox="0 0 24 24" stroke="#9a8870" strokeWidth={1.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => { setShowNotifications(!showNotifications); setShowUserMenu(false); }}
            className="relative w-8 h-8 flex items-center justify-center rounded-md transition-colors duration-150"
            style={{ color: '#9a8870' }}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            {unreadCount > 0 && (
              <span
                className="absolute top-1 right-1 w-3.5 h-3.5 text-[9px] font-bold rounded-full flex items-center justify-center"
                style={{ background: '#c9a84c', color: '#0d0b07' }}
              >
                {unreadCount}
              </span>
            )}
          </button>

          <AnimatePresence>
            {showNotifications && (
              <motion.div
                initial={{ opacity: 0, y: 6, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 6, scale: 0.97 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 mt-2 w-72 rounded-lg overflow-hidden"
                style={{
                  background: '#faf8f3',
                  border: '1px solid #e0d8c8',
                  boxShadow: '0 8px 32px rgba(61,46,26,0.12)',
                }}
              >
                <div className="px-4 py-3" style={{ borderBottom: '1px solid #e8e0d0' }}>
                  <p className="text-xs tracking-widest uppercase" style={{ fontFamily: 'monospace', color: '#9a8870' }}>
                    Notifications
                  </p>
                </div>
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className="flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors duration-150"
                    style={{
                      borderBottom: '1px solid #f0ebe0',
                      background: n.unread ? 'rgba(201,168,76,0.04)' : 'transparent',
                    }}
                  >
                    <div
                      className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0"
                      style={{ background: n.unread ? '#c9a84c' : '#d0c8b8' }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate" style={{ color: '#3d2e1a', fontFamily: 'monospace' }}>{n.title}</p>
                      <p className="text-[11px] truncate mt-0.5" style={{ color: '#9a8870', fontFamily: 'monospace' }}>{n.message}</p>
                    </div>
                    <span className="text-[10px] shrink-0" style={{ color: '#b8a888', fontFamily: 'monospace' }}>{n.time}</span>
                  </div>
                ))}
                <div className="px-4 py-2.5">
                  <button className="text-[11px] tracking-wider uppercase" style={{ color: '#c9a84c', fontFamily: 'monospace' }}>
                    View all
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Divider */}
        <div className="w-px h-5 mx-1" style={{ background: '#e0d8c8' }} />

        {/* User Menu */}
        <div className="relative" ref={userRef}>
          <button
            onClick={() => { setShowUserMenu(!showUserMenu); setShowNotifications(false); }}
            className="flex items-center gap-2.5 pl-1 pr-3 py-1 rounded-md transition-colors duration-150"
          >
            {session?.user?.image ? (
              <Image
                src={session.user.image}
                alt={session.user.name || 'Profile'}
                width={28}
                height={28}
                className="rounded-md object-cover"
              />
            ) : (
              <div
                className="w-7 h-7 rounded-md flex items-center justify-center text-[10px] font-bold"
                style={{ background: '#3d2e1a', color: '#c9a84c', fontFamily: 'monospace' }}
              >
                {session?.user?.name?.charAt(0).toUpperCase() || session?.user?.email?.charAt(0).toUpperCase() || 'AD'}
              </div>
            )}
            <div className="hidden sm:block text-left">
              <p className="text-xs font-medium" style={{ color: '#3d2e1a', fontFamily: 'monospace' }}>
                {session?.user?.name ?? 'Admin'}
              </p>
            </div>
            <svg
              className="w-3 h-3 hidden sm:block transition-transform duration-200"
              style={{ color: '#9a8870', transform: showUserMenu ? 'rotate(180deg)' : 'rotate(0deg)' }}
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          <AnimatePresence>
            {showUserMenu && (
              <motion.div
                initial={{ opacity: 0, y: 6, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 6, scale: 0.97 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 mt-2 w-44 rounded-lg overflow-hidden"
                style={{
                  background: '#faf8f3',
                  border: '1px solid #e0d8c8',
                  boxShadow: '0 8px 32px rgba(61,46,26,0.12)',
                }}
              >
                <div className="flex flex-col">
                  <div className="flex flex-col gap-0.5 px-4 py-2.5 text-xs border-b border-[#f0ebe0]">
                    <span
                      className="font-medium"
                      style={{ color: '#3d2e1a', fontFamily: 'monospace' }}
                    >
                      {session?.user?.name ?? 'Admin'}
                    </span>
                    <span
                      className="text-[11px]"
                      style={{ color: '#9a8870', fontFamily: 'monospace' }}
                    >
                      {(session?.user as unknown as { role?: string })?.role ?? 'admin'}
                    </span>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => signOut({ callbackUrl: '/' })}
                    className="justify-start rounded-none px-4 py-2.5 text-[11px]"
                    style={{ fontFamily: 'monospace', letterSpacing: '0.05em' }}
                  >
                    Sign out
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}