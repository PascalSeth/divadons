'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useAnnouncementStore, Announcement } from '@/app/contexts/AnnouncementContext';

export function AnnouncementBanner() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const { isDismissed, dismissAnnouncement } = useAnnouncementStore();

  useEffect(() => {
    async function fetchAnnouncements() {
      try {
        const res = await fetch('/api/announcements?activeOnly=true');
        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            setAnnouncements(data.data || []);
          }
        }
      } catch (error) {
        console.error('Failed to fetch announcements:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchAnnouncements();
  }, []);

  // Filter to only show banners that haven't been dismissed
  const activeBanners = announcements.filter(
    (a) => a.type === 'banner' && !isDismissed(a.id)
  );

  // Get the first active popup (show one at a time)
  const activePopup = announcements.find(
    (a) => a.type === 'popup' && !isDismissed(a.id)
  );

  if (loading) return null;

  return (
    <>
      {/* Top Banner */}
      <AnimatePresence>
        {activeBanners.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="relative overflow-hidden"
          >
            {activeBanners.map((banner) => (
              <div
                key={banner.id}
                className="relative py-2.5 px-4 text-center"
                style={{ backgroundColor: banner.bgColor, color: banner.textColor }}
              >
                <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 text-sm">
                  <span className="font-medium">{banner.title}</span>
                  <span className="opacity-80">—</span>
                  <span className="opacity-90">{banner.message}</span>
                  {banner.linkText && banner.linkUrl && (
                    <Link
                      href={banner.linkUrl}
                      className="font-medium underline underline-offset-2 hover:opacity-80 transition-opacity ml-1"
                    >
                      {banner.linkText}
                    </Link>
                  )}
                </div>
                <button
                  onClick={() => dismissAnnouncement(banner.id)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:opacity-70 transition-opacity"
                  aria-label="Dismiss"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Popup Modal */}
      <AnimatePresence>
        {activePopup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={() => dismissAnnouncement(activePopup.id)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="relative max-w-md w-full rounded-2xl overflow-hidden shadow-2xl"
              style={{ backgroundColor: activePopup.bgColor, color: activePopup.textColor }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => dismissAnnouncement(activePopup.id)}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-black/10 transition-colors"
                aria-label="Close"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              <div className="p-8 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}>
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bodoni font-semibold mb-2">{activePopup.title}</h2>
                <p className="opacity-90 mb-6">{activePopup.message}</p>
                
                <div className="flex gap-3 justify-center">
                  {activePopup.linkText && activePopup.linkUrl ? (
                    <>
                      <Link
                        href={activePopup.linkUrl}
                        onClick={() => dismissAnnouncement(activePopup.id)}
                        className="px-6 py-2.5 rounded-lg font-medium transition-colors"
                        style={{ 
                          backgroundColor: activePopup.textColor, 
                          color: activePopup.bgColor 
                        }}
                      >
                        {activePopup.linkText}
                      </Link>
                      <button
                        onClick={() => dismissAnnouncement(activePopup.id)}
                        className="px-6 py-2.5 rounded-lg font-medium border-2 hover:bg-white/10 transition-colors"
                        style={{ borderColor: 'currentColor' }}
                      >
                        Maybe Later
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => dismissAnnouncement(activePopup.id)}
                      className="px-6 py-2.5 rounded-lg font-medium transition-colors"
                      style={{ 
                        backgroundColor: activePopup.textColor, 
                        color: activePopup.bgColor 
                      }}
                    >
                      Got it!
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
