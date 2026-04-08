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
  brandValues: { title: string; description: string }[] | null;
  metaTitle: string | null;
  metaDescription: string | null;
  stripePublishableKey: string | null;
  stripeSecretKey: string | null;
  stripeWebhookSecret: string | null;
};

const DEFAULT_SETTINGS: SiteSettings = {
  id: 'default',
  siteName: 'My Boutique',
  logoUrl: null,
  faviconUrl: null,
  supportEmail: 'support@example.com',
  supportPhone: '+1 234 567 890',
  storeAddress: '123 Luxury Lane, Fashion District',
  currency: 'USD' as Currency,
  socialLinks: [
    { platform: 'Instagram', url: 'https://instagram.com' },
    { platform: 'Facebook', url: 'https://facebook.com' },
  ],
  brandValues: [
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
  ],
  metaTitle: 'Luxury Boutique | Fashion & Lifestyle',
  metaDescription: 'Discover our curated collection of premium fashion and accessories.',
  stripePublishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.trim() || null,
  stripeSecretKey: process.env.STRIPE_SECRET_KEY?.trim() || null,
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET?.trim() || null,
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
      brandValues: settings.brandValues || DEFAULT_SETTINGS.brandValues,
    } as SiteSettings;
  } catch (error) {
    console.error('Failed to fetch settings, using defaults:', error);
    return DEFAULT_SETTINGS;
  }
});
