import NextAuth, { NextAuthOptions, Session, DefaultSession } from 'next-auth'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import CredentialsProvider from 'next-auth/providers/credentials'
import prisma from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { JWT } from 'next-auth/jwt'
import type { AdapterUser } from 'next-auth/adapters'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      name: string
      onboardingStatus: string
    }
  }

  interface User {
    id: string
    email: string
    name: string
    onboardingStatus: string
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    email: string
    name: string
    onboardingStatus: string
  }
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password required')
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          select: {
            id: true,
            email: true,
            name: true,
            password: true,
            emailVerified: true,
            onboardingStatus: true
          }
        })

        if (!user) {
          throw new Error('Invalid email or password')
        }

        if (!user.emailVerified) {
          throw new Error('Please verify your email before logging in')
        }

        const isValid = await bcrypt.compare(credentials.password, user.password)

        if (!isValid) {
          throw new Error('Invalid email or password')
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          onboardingStatus: user.onboardingStatus
        }
      }
    })
  ],
  session: {
    strategy: 'jwt'
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.email = user.email
        token.name = user.name
        token.onboardingStatus = user.onboardingStatus
      }

      // Check if user still exists
      const dbUser = await prisma.user.findUnique({
        where: { id: token.id },
        select: {
          id: true,
          email: true,
          name: true,
          onboardingStatus: true,
          emailVerified: true
        }
      })

      if (!dbUser) {
        return { ...token, error: 'User no longer exists' }
      }

      return token
    },
    async session({ session, token }): Promise<Session | DefaultSession> {
      if (token.error) {
        return session
      }

      session.user = {
        id: token.id,
        email: token.email,
        name: token.name,
        onboardingStatus: token.onboardingStatus
      }

      return session
    }
  },
  pages: {
    signIn: '/login',
    error: '/login'
  }
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST } 