import { NextAuthOptions } from "next-auth"
import { getServerSession as getNextAuthSession } from "next-auth/next"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcrypt"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      email: string
      name: string
      image?: string
      role?: string
    }
  }
  interface JWT {
    id: string
    image?: string
    role?: string
  }
}

export type SessionUser = {
  id: string
  email: string
  name: string
  image?: string
}

export const authOptions: NextAuthOptions = {
  // No adapter - we handle user creation manually in signIn callback for JWT strategy
  secret: process.env.NEXTAUTH_SECRET || "development-secret-change-in-production",
  session: {
    strategy: "jwt",
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        })

        if (!user || !user.password) {
          return null
        }

        const isPasswordValid = await bcrypt.compare(credentials.password, user.password)

        if (!isPasswordValid) {
          return null
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
        }
      }
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      // For OAuth providers (Google), create or update user in database
      if (account?.provider === "google" && profile?.email) {
        try {
          // Check if user exists
          const existingUser = await prisma.user.findUnique({
            where: { email: profile.email }
          })

          if (!existingUser) {
            // Create new user - password is null for OAuth users
            const newUser = await prisma.user.create({
              data: {
                email: profile.email,
                name: profile.name || profile.email.split("@")[0],
                image: user.image || null,
                password: null, // OAuth users don't have passwords
              }
            })
            user.id = newUser.id
            // New users get the default role (costumer) from schema
          } else {
            user.id = existingUser.id
          }

          return true
        } catch (error) {
          console.error("Error in signIn callback:", error)
          return false
        }
      }

      return true
    },
    async session({ session, token }) {
      if (session.user && token) {
        session.user.id = token.id as string
        if (token.image) {
          session.user.image = token.image as string
        }
        if (token.role) {
          session.user.role = token.role as string
        }
      }
      console.log('Session callback:', { 
        userId: session.user?.id, 
        userRole: session.user?.role,
        tokenRole: token.role 
      })
      return session
    },
    async jwt({ token, user, trigger, session }) {
      // Initial sign in
      if (user) {
        token.id = user.id
        if (user.image) {
          token.image = user.image
        }
      }
      
      // Always fetch user role from database to ensure it's up to date
      if (token.id) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { role: true, image: true }
        })
        if (dbUser) {
          token.role = dbUser.role
          token.image = dbUser.image
          console.log('User role from database:', dbUser.role)
        }
      }
      
      // Update session (e.g., after role change)
      if (trigger === "update" && session?.role) {
        token.role = session.role
      }
      
      console.log('JWT token:', { id: token.id, role: token.role })
      return token
    },
  },
  pages: {
    signIn: "/login",
  },
}

// Export getServerSession for server-side session access
export async function getServerSession() {
  return getNextAuthSession(authOptions)
}

