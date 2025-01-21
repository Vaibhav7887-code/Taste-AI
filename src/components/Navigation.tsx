'use client'

import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { useState } from 'react'
import { usePathname } from 'next/navigation'

export default function Navigation() {
  const { data: session } = useSession()
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const pathname = usePathname()

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link 
              href={session ? '/dashboard' : '/'} 
              className="flex-shrink-0 flex items-center"
            >
              <span className="text-xl font-bold text-purple-600">Taste Palette</span>
            </Link>
            {session && (
              <div className="hidden sm:ml-6 sm:flex sm:items-center">
                <Link
                  href="/dashboard"
                  className={`px-3 py-2 text-sm font-medium border-b-2 ${
                    pathname === '/dashboard'
                      ? 'text-purple-600 border-purple-600'
                      : 'text-gray-500 hover:text-gray-700 border-transparent hover:border-gray-300'
                  }`}
                >
                  Dashboard
                </Link>
                <Link
                  href="/diary"
                  className={`px-3 py-2 text-sm font-medium border-b-2 ${
                    pathname === '/diary'
                      ? 'text-purple-600 border-purple-600'
                      : 'text-gray-500 hover:text-gray-700 border-transparent hover:border-gray-300'
                  }`}
                >
                  Restaurant Diary
                </Link>
              </div>
            )}
          </div>
          <div className="flex items-center">
            {!session ? (
              <div className="space-x-4">
                <Link
                  href="/login"
                  className="text-gray-700 hover:text-purple-600 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Sign in
                </Link>
                <Link
                  href="/signup"
                  className="bg-purple-600 text-white hover:bg-purple-700 px-4 py-2 rounded-md text-sm font-medium"
                >
                  Sign up
                </Link>
              </div>
            ) : (
              <div className="relative">
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 focus:outline-none"
                >
                  <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-white">
                    {session.user?.name?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <span>{session.user?.name}</span>
                </button>
                
                {showProfileMenu && (
                  <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
                    <div className="py-1">
                      <Link
                        href="/profile"
                        className={`block px-4 py-2 text-sm ${
                          pathname === '/profile'
                            ? 'text-purple-600 bg-purple-50'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                        onClick={() => setShowProfileMenu(false)}
                      >
                        Profile Settings
                      </Link>
                      <button
                        onClick={() => {
                          signOut({ callbackUrl: '/' })
                          setShowProfileMenu(false)
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
} 