'use client'

import { useCallback, useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { signOut } from 'next-auth/react'

export default function VerifyEmail() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')
  const [isRedirecting, setIsRedirecting] = useState(false)
  const [hasAttemptedVerification, setHasAttemptedVerification] = useState(false)

  const verifyEmail = useCallback(async (token: string) => {
    if (!token) {
      setStatus('error')
      setMessage('Verification token is missing')
      return
    }

    try {
      // Clear any existing session first
      await signOut({ redirect: false })

      const res = await fetch(`/api/auth/verify?token=${encodeURIComponent(token)}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache'
        }
      })

      const data = await res.json()

      if (res.ok) {
        setStatus('success')
        setMessage(data.message)
        setIsRedirecting(true)
        // Add a small delay before redirecting to ensure the success state is shown
        setTimeout(() => {
          router.push('/login?verified=true')
        }, 2000)
      } else {
        throw new Error(data.message || 'Verification failed')
      }
    } catch (error) {
      console.error('Verification error:', error)
      setStatus('error')
      setMessage(error instanceof Error ? error.message : 'Verification failed')
    } finally {
      setHasAttemptedVerification(true)
    }
  }, [router])

  useEffect(() => {
    const token = searchParams.get('token')
    // Only verify if we haven't attempted verification yet and have a token
    if (!hasAttemptedVerification && token) {
      verifyEmail(token)
    }
  }, [searchParams, verifyEmail, hasAttemptedVerification])

  // Don't show any error states until we've actually attempted verification
  if (!hasAttemptedVerification || status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-lg">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
            <h2 className="mt-4 text-xl font-semibold text-gray-700">Verifying your email...</h2>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-lg">
        {status === 'success' && (
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
              <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="mt-4 text-xl font-semibold text-green-600">{message}</h2>
            {isRedirecting && (
              <p className="mt-2 text-gray-600">
                Redirecting you to login...
              </p>
            )}
          </div>
        )}

        {status === 'error' && (
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
              <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="mt-4 text-xl font-semibold text-red-600">{message}</h2>
            <div className="mt-6">
              <Link
                href="/login"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
              >
                Back to Login
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 