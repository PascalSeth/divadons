import { loadStripe, Stripe } from '@stripe/stripe-js';

let stripePromise: Promise<Stripe | null>;

/**
 * Initializes the Stripe client-side SDK.
 * 
 * Since fetching from the database on the client-side requires an API call,
 * we fallback to NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY if it exists,
 * or fetch it from a public settings endpoint if needed.
 */
export const getClientStripe = (publishableKey?: string) => {
  const key = publishableKey || process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
  
  if (!key) {
    console.error('Stripe Publishable Key is missing.');
    return Promise.resolve(null);
  }

  if (!stripePromise) {
    stripePromise = loadStripe(key);
  }
  
  return stripePromise;
};
