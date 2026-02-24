'use client'

import React, { useState, useEffect, useSyncExternalStore } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { signIn, useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { FcGoogle } from 'react-icons/fc'

// For client-side only rendering
const emptySubscribe = () => () => {}
const getClientSnapshot = () => true
const getServerSnapshot = () => false

export default function LoginPage() {
  const router = useRouter()
  const [searchParams, setSearchParams] = useState<URLSearchParams | null>(null)
  const { data: session } = useSession()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const mounted = useSyncExternalStore(emptySubscribe, getClientSnapshot, getServerSnapshot)

  // Redirect if already logged in
  useEffect(() => {
    if (session?.user) {
      const callbackUrl = searchParams?.get('callbackUrl') || '/'
      router.push(callbackUrl)
    }
  }, [session, router, searchParams])

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const callbackUrl = searchParams?.get('callbackUrl') || '/'

      // For OAuth providers like Google, use redirect mode
      // This is required for OAuth flow to work properly
      await signIn('google', {
        callbackUrl,
      })
    } catch (err) {
      setError('An error occurred. Please try again.')
      console.error(err)
      setIsLoading(false)
    }
  }

  if (!mounted) return null

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setSearchParams(new URLSearchParams(window.location.search))
    }
  }, [])

  return (
    <div className="min-h-screen flex">
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Bodoni+Moda:ital,wght@0,400;0,500;0,600;1,400&family=DM+Sans:wght@300;400;500&display=swap');
        
        .font-bodoni { font-family: 'Bodoni Moda', serif; }
        .font-dm { font-family: 'DM Sans', sans-serif; }
      `}</style>

      {/* LEFT SIDE - IMAGE WITH OVERLAY */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="hidden lg:flex lg:w-1/2 relative overflow-hidden"
      >
        <Image
          src="https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=1887&auto=format&fit=crop"
          alt="Luxury Fashion"
          fill
          className="object-cover"
          priority
        />

        {/* Overlay */}
        <div className="absolute inset-0 bg-black/40" />

        {/* Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-8">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-center max-w-md"
          >
            <h2 className="font-bodoni text-5xl md:text-6xl font-semibold mb-6 leading-tight">
              Join Our
              <br />
              Community
            </h2>

            <p className="font-dm text-lg text-gray-200 mb-8 leading-relaxed">
              Discover exclusive collections, early access to new arrivals, and personalized recommendations from our fashion experts.
            </p>

            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="h-1 w-8 bg-white/80" />
                <span className="font-dm text-sm text-gray-300">Premium members only</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Floating elements */}
        <motion.div
          animate={{ y: [0, 20, 0] }}
          transition={{ duration: 4, repeat: Infinity }}
          className="absolute top-20 right-20 w-20 h-20 border border-white/30 rounded-full"
        />
        <motion.div
          animate={{ y: [0, -20, 0] }}
          transition={{ duration: 5, repeat: Infinity }}
          className="absolute bottom-20 left-20 w-16 h-16 border border-white/20 rounded-full"
        />
      </motion.div>

      {/* RIGHT SIDE - AUTH FORM */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, delay: 0.1 }}
        className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-6 md:p-8"
        style={{ background: '#f5f1e8' }}
      >
        <div className="w-full max-w-md">
          {/* Header */}
          <motion.div
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-center mb-12"
          >
            <h1 className="font-bodoni text-4xl md:text-5xl font-semibold text-gray-900 mb-3">
              Welcome
            </h1>
            <p className="font-dm text-gray-600">
              Sign in or create an account to continue
            </p>
          </motion.div>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg"
            >
              <p className="font-dm text-sm text-red-600">{error}</p>
            </motion.div>
          )}

          {/* Google Sign In Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full mb-6 py-4 px-4 bg-white border-2 border-gray-300 rounded-lg font-dm font-medium text-gray-800 flex items-center justify-center gap-3 hover:border-gray-400 hover:shadow-lg transition-all disabled:opacity-70 disabled:cursor-not-allowed"
          >
            <FcGoogle className="text-2xl" />
            <span>{isLoading ? 'Signing in...' : 'Continue with Google'}</span>
          </motion.button>

          {/* Info Section */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="space-y-4"
          >
            <div className="p-4 bg-gray-100 rounded-lg border border-gray-200">
              <p className="font-dm text-sm text-gray-700">
                <span className="font-semibold">New to Diva & Dons?</span>
                <br />
                Signing in with Google will automatically create your account.
              </p>
            </div>

            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="font-dm text-sm text-blue-700">
                <span className="font-semibold">Secure Login:</span>
                <br />
                We use industry-standard OAuth 2.0 for secure authentication.
              </p>
            </div>
          </motion.div>

          {/* Divider */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="relative my-8 origin-center"
          >
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
          </motion.div>

          {/* Features List */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="space-y-3"
          >
            <div className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-gray-900 flex items-center justify-center flex-shrink-0 mt-1">
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="font-dm text-gray-700">Access exclusive collections</span>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-gray-900 flex items-center justify-center flex-shrink-0 mt-1">
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="font-dm text-gray-700">Get early access to new arrivals</span>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-gray-900 flex items-center justify-center flex-shrink-0 mt-1">
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="font-dm text-gray-700">Receive personalized recommendations</span>
            </div>
          </motion.div>

          {/* Back to Home */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="text-center mt-8 pt-8 border-t border-gray-300"
          >
            <Link
              href="/"
              className="font-dm text-sm text-gray-600 hover:text-gray-800 transition-colors inline-flex items-center gap-2"
            >
              ← Continue shopping
            </Link>
          </motion.div>

          {/* Terms */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="text-center mt-6"
          >
            <p className="font-dm text-xs text-gray-500">
              By signing in, you agree to our{' '}
              <a href="#" className="underline hover:text-gray-700">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="#" className="underline hover:text-gray-700">
                Privacy Policy
              </a>
            </p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
}
