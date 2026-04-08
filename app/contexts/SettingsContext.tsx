'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Currency, DEFAULT_CURRENCY } from '@/lib/currency';

/**
 * Shared site settings for client-side components.
 */
interface SiteSettings {
  siteName: string;
  currency: Currency;
  logoUrl?: string;
  faviconUrl?: string;
  supportEmail?: string;
  supportPhone?: string;
  storeAddress?: string;
  metaTitle?: string;
  metaDescription?: string;
  stripePublishableKey?: string;
  socialLinks?: { platform: string; url: string }[];
  brandValues?: { title: string; description: string }[];
}

interface SettingsContextType {
  settings: SiteSettings;
  isLoading: boolean;
  error: string | null;
  refreshSettings: () => Promise<void>;
}

const DEFAULT_SETTINGS: SiteSettings = {
  siteName: 'My Boutique',
  currency: DEFAULT_CURRENCY,
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSettings = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/settings');
      const json = await res.json();
      
      if (json.success) {
        setSettings(json.data);
      } else {
        throw new Error(json.error || 'Failed to load settings');
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'An unexpected error occurred';
      console.error('[SETTINGS_CONTEXT_ERROR]', err);
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return (
    <SettingsContext.Provider 
      value={{ 
        settings, 
        isLoading, 
        error, 
        refreshSettings: fetchSettings 
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
