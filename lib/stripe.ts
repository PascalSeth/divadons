import Stripe from 'stripe';
import { getSettings } from './settings';

/**
 * Initializes the Stripe server-side SDK using dynamic settings.
 * Prioritizes keys found in the database, falls back to environment variables.
 */
export const getServerStripe = async (): Promise<Stripe> => {
  const settings = await getSettings();
  
  // Use DB secret key, otherwise fallback to ENV
  const secretKey = settings.stripeSecretKey || process.env.STRIPE_SECRET_KEY;
  
  if (!secretKey) {
    throw new Error('Stripe Secret Key is missing. Please configure it in the Admin Settings or .env file.');
  }

  return new Stripe(secretKey, {
    apiVersion: '2025-01-27.acacia', // Latest stable API version
    appInfo: {
      name: 'Diva & Dons Luxury Store',
      version: '1.0.0',
    },
  });
};
