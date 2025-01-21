'use client'

import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useEffect, useState } from 'react'

export default function Home() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    const checkSession = async () => {
      if (status === 'authenticated' && session?.user) {
        try {
          // Verify if user still exists in DB
          const res = await fetch('/api/user/verify')
          if (!res.ok) {
            // User doesn't exist, clear session
            await signOut({ redirect: false })
            return
          }
          router.replace('/dashboard')
        } catch (error) {
          // On error, clear session
          await signOut({ redirect: false })
        }
      }
    }
    
    checkSession()
  }, [status, session, router])

  // Show loading state for max 2 seconds
  const [showLoader, setShowLoader] = useState(true)
  useEffect(() => {
    const timer = setTimeout(() => setShowLoader(false), 2000)
    return () => clearTimeout(timer)
  }, [])

  if (status === 'loading' && showLoader) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  // Show landing page content for unauthenticated users
  return (
    <main className="flex min-h-screen flex-col items-center">
      {/* Hero Section */}
      <section className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Snap a Menu, Get Personalized Dish Recommendations!
          </h1>
          <p className="text-xl md:text-2xl mb-8">
            Never wonder what to order again. Let AI help you discover dishes you'll love.
          </p>
          <Link
            href="/signup"
            className="bg-white text-purple-600 px-8 py-3 rounded-full text-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            Get Started
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white w-full">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-900">
            How It Works
          </h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="bg-white rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow">
              <div className="text-purple-600 mb-4">
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Snap a Menu</h3>
              <p className="text-gray-600">
                Take a photo of any restaurant menu or upload an existing one.
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow">
              <div className="text-purple-600 mb-4">
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">AI Analysis</h3>
              <p className="text-gray-600">
                Our AI reads the menu and understands your taste preferences.
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow">
              <div className="text-purple-600 mb-4">
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Get Recommendations</h3>
              <p className="text-gray-600">
                Receive personalized dish recommendations based on your preferences.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 bg-gray-50 w-full">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-900">
            Choose Your Plan
          </h2>
          <div className="grid md:grid-cols-4 gap-8 max-w-7xl mx-auto">
            {/* Free Plan */}
            <div className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition-shadow flex flex-col h-full">
              <div className="flex-grow">
                <h3 className="text-2xl font-bold mb-4 text-gray-900">Savor Starter</h3>
                <p className="text-4xl font-bold mb-6 text-gray-900">
                  Free<span className="text-lg text-gray-600"></span>
                </p>
                <ul className="space-y-4">
                  <li className="flex items-center text-gray-700">
                    <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    2 free menu uploads
                  </li>
                  <li className="flex items-center text-gray-700">
                    <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    +2 uploads after onboarding
                  </li>
                  <li className="flex items-center text-gray-700">
                    <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Basic recommendations
                  </li>
                </ul>
              </div>
              <div className="mt-8">
                <Link
                  href="/signup"
                  className="block w-full text-center bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors"
                >
                  Get Started
                </Link>
              </div>
            </div>

            {/* Basic Plan */}
            <div className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition-shadow flex flex-col h-full">
              <div className="flex-grow">
                <h3 className="text-2xl font-bold mb-4 text-gray-900">Tasty Basic</h3>
                <p className="text-4xl font-bold mb-6 text-gray-900">
                  $9.99<span className="text-lg text-gray-600">/month</span>
                </p>
                <ul className="space-y-4">
                  <li className="flex items-center text-gray-700">
                    <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    1 menu upload per week
                  </li>
                  <li className="flex items-center text-gray-700">
                    <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Basic taste profile
                  </li>
                  <li className="flex items-center text-gray-700">
                    <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Personalized recommendations
                  </li>
                </ul>
              </div>
              <div className="mt-8">
                <Link
                  href="/signup?plan=basic"
                  className="block w-full text-center bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors"
                >
                  Choose Basic
                </Link>
              </div>
            </div>

            {/* Standard Plan */}
            <div className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition-shadow border-2 border-purple-600 flex flex-col h-full relative">
              <div className="absolute top-0 right-0 -mt-4 mr-4">
                <span className="bg-purple-600 text-white text-sm font-bold py-1 px-3 rounded-full">Popular</span>
              </div>
              <div className="flex-grow">
                <h3 className="text-2xl font-bold mb-4 text-gray-900">Flavor Explorer</h3>
                <p className="text-4xl font-bold mb-6 text-gray-900">
                  $14.99<span className="text-lg text-gray-600">/month</span>
                </p>
                <ul className="space-y-4">
                  <li className="flex items-center text-gray-700">
                    <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    7 menu uploads per week
                  </li>
                  <li className="flex items-center text-gray-700">
                    <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Advanced AI-assisted taste profile
                  </li>
                  <li className="flex items-center text-gray-700">
                    <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Enhanced recommendations
                  </li>
                </ul>
              </div>
              <div className="mt-8">
                <Link
                  href="/signup?plan=standard"
                  className="block w-full text-center bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors"
                >
                  Choose Explorer
                </Link>
              </div>
            </div>

            {/* Premium Plan */}
            <div className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition-shadow flex flex-col h-full">
              <div className="flex-grow">
                <h3 className="text-2xl font-bold mb-4 text-gray-900">Gourmet Adventurer</h3>
                <p className="text-4xl font-bold mb-6 text-gray-900">
                  $24.99<span className="text-lg text-gray-600">/month</span>
                </p>
                <ul className="space-y-4">
                  <li className="flex items-center text-gray-700">
                    <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Unlimited menu uploads
                  </li>
                  <li className="flex items-center text-gray-700">
                    <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Advanced AI-assisted taste profile
                  </li>
                  <li className="flex items-center text-gray-700">
                    <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Rating history & restaurant diary
                  </li>
                  <li className="flex items-center text-gray-700">
                    <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Coming soon: Smart Restaurant Finder
                  </li>
                </ul>
              </div>
              <div className="mt-8">
                <Link
                  href="/signup?plan=premium"
                  className="block w-full text-center bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors"
                >
                  Choose Adventurer
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h4 className="text-lg font-bold mb-4">Taste Palette Explorer</h4>
              <p className="text-gray-400">Making menu decisions easier with AI-powered recommendations.</p>
            </div>
            <div>
              <h4 className="text-lg font-bold mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li><Link href="/about" className="text-gray-400 hover:text-white">About Us</Link></li>
                <li><Link href="/contact" className="text-gray-400 hover:text-white">Contact</Link></li>
                <li><Link href="/privacy" className="text-gray-400 hover:text-white">Privacy Policy</Link></li>
                <li><Link href="/terms" className="text-gray-400 hover:text-white">Terms of Service</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-bold mb-4">Features</h4>
              <ul className="space-y-2">
                <li><Link href="/features" className="text-gray-400 hover:text-white">Menu Analysis</Link></li>
                <li><Link href="/features" className="text-gray-400 hover:text-white">Taste Profile</Link></li>
                <li><Link href="/features" className="text-gray-400 hover:text-white">Restaurant Diary</Link></li>
                <li><Link href="/features" className="text-gray-400 hover:text-white">Smart Recommendations</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-bold mb-4">Connect With Us</h4>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white">
                  <span className="sr-only">Twitter</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"></path>
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white">
                  <span className="sr-only">GitHub</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd"></path>
                  </svg>
                </a>
              </div>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-800 text-center text-gray-400">
            <p>&copy; {new Date().getFullYear()} Taste Palette Explorer. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </main>
  )
}
