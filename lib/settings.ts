import { cache } from 'react';
import prisma from './prisma';
import { Currency } from '@/app/generated/prisma';

export type SiteSettings = {
  id: string;
  siteName: string;
  logoUrl: string | null;
  faviconUrl: string | null;
  supportEmail: string | null;
  supportPhone: string | null;
  storeAddress: string | null;
  currency: Currency;
  socialLinks: { platform: string; url: string }[] | null;
  metaTitle: string | null;
  metaDescription: string | null;
  stripePublishableKey: string | null;
  stripeSecretKey: string | null;
  stripeWebhookSecret: string | null;
};

const DEFAULT_SETTINGS: SiteSettings = {
  id: 'default',
  siteName: 'Diva & Dons',
  logoUrl: '/logo/1bg.png',
  faviconUrl: '/logo/1bg.png',
  supportEmail: 'support@divadons.com',
  supportPhone: '+1 234 567 890',
  storeAddress: '123 Luxury Lane, Fashion District',
  currency: 'USD' as Currency,
  socialLinks: [
    { platform: 'Instagram', url: 'https://instagram.com/divadons' },
    { platform: 'Facebook', url: 'https://facebook.com/divadons' },
  ],
  metaTitle: 'Diva & Dons | Luxury Lifestyle Store',
  metaDescription: 'Premium fashion, beauty and accessories curated for the modern diva.',
  stripePublishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || null,
  stripeSecretKey: process.env.STRIPE_SECRET_KEY || null,
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET || null,
};

/**
 * Fetches the site settings from the database.
 * Uses react cache to ensure we only hit the DB once per request.
 */
export const getSettings = cache(async (): Promise<SiteSettings> => {
  try {
    const settings = await prisma.setting.findFirst();
    if (!settings) return DEFAULT_SETTINGS;
    
    return {
      ...settings,
      socialLinks: settings.socialLinks || DEFAULT_SETTINGS.socialLinks,
    } as SiteSettings;
  } catch (error) {
    console.error('Failed to fetch settings, using defaults:', error);
    return DEFAULT_SETTINGS;
  }
});
