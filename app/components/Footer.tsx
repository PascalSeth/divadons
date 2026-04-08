'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { SiteSettings } from '@/lib/settings';
import { 
  FaInstagram, 
  FaFacebookF, 
  FaTwitter, 
  FaPinterestP, 
  FaYoutube, 
  FaTiktok 
} from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';

interface FooterProps {
  settings?: SiteSettings;
}

const getSocialIcon = (platform: string) => {
  const p = platform.toLowerCase();
  if (p.includes('instagram')) return <FaInstagram className="w-4 h-4" />;
  if (p.includes('facebook')) return <FaFacebookF className="w-3.5 h-3.5" />;
  if (p.includes('twitter') || p.includes(' x')) return <FaXTwitter className="w-4 h-4" />;
  if (p.includes('pinterest')) return <FaPinterestP className="w-4 h-4" />;
  if (p.includes('youtube')) return <FaYoutube className="w-4 h-4" />;
  if (p.includes('tiktok')) return <FaTiktok className="w-3.5 h-3.5" />;
  
  return <div className="text-[10px] uppercase font-bold">{platform.charAt(0)}</div>;
};

export default function Footer({ settings }: FooterProps) {
  const currentYear = new Date().getFullYear();
  
  const socialLinks = settings?.socialLinks || [];
  const address = settings?.storeAddress || '';
  const email = settings?.supportEmail || '';
  const phone = settings?.supportPhone || '';
  const siteName = settings?.siteName || 'My Boutique';

  return (
    <footer className="bg-stone-900 text-stone-300 pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          
          {/* Brand Section */}
          <div className="space-y-6">
            <Link href="/" className="inline-block">
              {settings?.logoUrl ? (
                <Image 
                  src={settings.logoUrl} 
                  alt={siteName}
                  width={150}
                  height={100}
                  className="object-contain"
                />
              ) : (
                <span className="text-xl font-playfair italic font-light tracking-widest text-white">
                  {siteName}
                </span>
              )}
            </Link>
            <p className="text-sm leading-relaxed max-w-xs text-stone-400">
              {settings?.metaDescription || "Discover our curated collection of premium fashion and accessories."}
            </p>
            <div className="flex items-center gap-4">
              {socialLinks.map((social: { platform: string; url: string }, i: number) => (
                <a 
                  key={i} 
                  href={social.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-full border border-stone-700 flex items-center justify-center hover:bg-white hover:text-stone-900 transition-all duration-300"
                >
                  <span className="sr-only">{social.platform}</span>
                  {getSocialIcon(social.platform)}
                </a>
              ))}
            </div>
          </div>

          {/* Shop Links */}
          <div>
            <h4 className="text-white text-sm font-semibold uppercase tracking-widest mb-6">Shop</h4>
            <ul className="space-y-4 text-sm">
              <li><Link href="/shop" className="hover:text-white transition-colors">All Products</Link></li>
              <li><Link href="/collections" className="hover:text-white transition-colors">New Arrivals</Link></li>
              <li><Link href="/beauty" className="hover:text-white transition-colors">Beauty & Skincare</Link></li>
              <li><Link href="/shop?featured=true" className="hover:text-white transition-colors">Featured Items</Link></li>
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="text-white text-sm font-semibold uppercase tracking-widest mb-6">Company</h4>
            <ul className="space-y-4 text-sm">
              <li><Link href="/about" className="hover:text-white transition-colors">Our Story</Link></li>
              <li><Link href="/blog" className="hover:text-white transition-colors">Journal</Link></li>
              <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
              <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-white text-sm font-semibold uppercase tracking-widest mb-6">Contact</h4>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start gap-3">
                <svg className="w-5 h-5 text-stone-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>{address}</span>
              </li>
              <li className="flex items-center gap-3">
                <svg className="w-5 h-5 text-stone-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <a href={`mailto:${email}`} className="hover:text-white transition-colors">{email}</a>
              </li>
              <li className="flex items-center gap-3">
                <svg className="w-5 h-5 text-stone-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <a href={`tel:${phone}`} className="hover:text-white transition-colors">{phone}</a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-10 border-t border-stone-800 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-xs text-stone-500 tracking-widest uppercase">
            © {currentYear} {siteName}. All Rights Reserved.
          </p>
          <div className="flex gap-8 items-center grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all duration-500">
             <div className="text-[10px] uppercase font-bold tracking-widest">Visa</div>
             <div className="text-[10px] uppercase font-bold tracking-widest">Mastercard</div>
             <div className="text-[10px] uppercase font-bold tracking-widest">Stripe</div>
          </div>
        </div>
      </div>
    </footer>
  );
}
