'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function SignOut() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to login after 3 seconds
    const timeout = setTimeout(() => {
      router.push('/login')
    }, 3000)

    return () => clearTimeout(timeout)
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 mb-4">
            Successfully Signed Out
          </h2>
          <p className="text-gray-600 mb-8">
            Thank you for using Taste Palette. See you again soon!
          </p>
          <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded mb-8">
            You will be redirected to the login page in 3 seconds...
          </div>
          <Link
            href="/login"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
          >
            Go to Login
          </Link>
        </div>
      </div>
    </div>
  )
} 