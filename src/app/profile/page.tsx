'use client'

import { useSession, signOut } from 'next-auth/react'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import TasteProfileSection from '@/components/TasteProfileSection'

interface ExtendedUser {
  id: string
  name?: string | null
  email?: string | null
  image?: string | null
  plan?: string
}

interface ExtendedSession {
  user?: ExtendedUser
  expires: string
}

interface OnboardingStatus {
  onboardingStatus: 'NOT_STARTED' | 'SKIPPED' | 'COMPLETED'
  freeScanCount: number
}

const DELETION_REASONS = [
  'Found a better alternative',
  'Not using the service enough',
  'Too expensive',
  'Missing features',
  'Privacy concerns',
  'Technical issues',
  'Other'
] as const

export default function Profile() {
  const { data: session } = useSession() as { data: ExtendedSession | null }
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteReason, setDeleteReason] = useState<string>('')
  const [otherReason, setOtherReason] = useState('')
  const [onboardingStatus, setOnboardingStatus] = useState<OnboardingStatus | null>(null)

  useEffect(() => {
    const fetchOnboardingStatus = async () => {
      try {
        const res = await fetch('/api/user/onboarding-status')
        if (res.ok) {
          const data = await res.json()
          console.log('Onboarding status:', data)
          setOnboardingStatus(data.data)
        } else {
          // Set a default status if the API fails
          setOnboardingStatus({
            onboardingStatus: 'NOT_STARTED',
            freeScanCount: 0
          })
        }
      } catch (error) {
        console.error('Failed to fetch onboarding status:', error)
        // Set a default status if the API fails
        setOnboardingStatus({
          onboardingStatus: 'NOT_STARTED',
          freeScanCount: 0
        })
      }
    }

    fetchOnboardingStatus()
  }, [])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    setSuccess('')

    const formData = new FormData(e.currentTarget)
    const data = {
      name: formData.get('name') as string,
      currentPassword: formData.get('currentPassword') as string,
      newPassword: formData.get('newPassword') as string,
    }

    try {
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      const responseData = await res.json()

      if (!res.ok) {
        throw new Error(responseData.message || 'Failed to update profile')
      }

      setSuccess('Profile updated successfully!')
    } catch (error) {
      console.error('Profile update error:', error)
      setError(error instanceof Error ? error.message : 'Failed to update profile')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteAccount = async () => {
    try {
      setIsLoading(true)
      setError('')
      
      const reason = deleteReason === 'Other' ? otherReason : deleteReason
      
      if (!reason) {
        setError('Please select a reason for deleting your account')
        setIsLoading(false)
        return
      }
      
      const res = await fetch('/api/user/delete-account', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason })
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.message || 'Failed to delete account')
      }

      if (data.success) {
        // Sign out and redirect to home page
        await signOut({ redirect: true, callbackUrl: '/login?error=account_deleted' })
      } else {
        throw new Error(data.message || 'Failed to delete account')
      }
    } catch (error) {
      console.error('Delete account error:', error)
      setError(error instanceof Error ? error.message : 'Failed to delete account')
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-3xl mx-auto py-6 sm:px-6 lg:px-8 space-y-6">
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h2 className="text-lg font-medium leading-6 text-gray-900 mb-4">Profile Settings</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
                  {error}
                </div>
              )}

              {success && (
                <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded">
                  {success}
                </div>
              )}

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <div className="mt-1">
                  <input
                    type="email"
                    name="email"
                    id="email"
                    value={session?.user?.email || ''}
                    disabled
                    className="shadow-sm focus:ring-purple-500 focus:border-purple-500 block w-full sm:text-sm border-gray-300 rounded-md bg-gray-50"
                  />
                </div>
                <p className="mt-1 text-sm text-gray-500">
                  Email cannot be changed
                </p>
              </div>

              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Name
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="name"
                    id="name"
                    defaultValue={session?.user?.name || ''}
                    className="shadow-sm focus:ring-purple-500 focus:border-purple-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">
                  Current Password
                </label>
                <div className="mt-1">
                  <input
                    type="password"
                    name="currentPassword"
                    id="currentPassword"
                    className="shadow-sm focus:ring-purple-500 focus:border-purple-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                  New Password (leave blank to keep current)
                </label>
                <div className="mt-1">
                  <input
                    type="password"
                    name="newPassword"
                    id="newPassword"
                    className="shadow-sm focus:ring-purple-500 focus:border-purple-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Link
                  href="/dashboard"
                  className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 mr-3"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50"
                >
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {onboardingStatus && (
          <TasteProfileSection onboardingStatus={onboardingStatus.onboardingStatus} />
        )}

        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">Subscription</h3>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">Current Plan: {session?.user?.plan || 'Basic'}</p>
                <p className="text-sm text-gray-500">Manage your subscription and billing</p>
              </div>
              <Link
                href="/subscription"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-purple-600 bg-purple-100 hover:bg-purple-200"
              >
                Manage Subscription
              </Link>
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">Delete Account</h3>
            <div className="space-y-4">
              <p className="text-sm text-gray-500">
                Once you delete your account, all your data will be permanently removed. This action cannot be undone.
              </p>

              {!showDeleteConfirm ? (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Delete Account
                </button>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label htmlFor="deleteReason" className="block text-sm font-medium text-gray-700">
                      Please tell us why you're leaving
                    </label>
                    <select
                      id="deleteReason"
                      value={deleteReason}
                      onChange={(e) => setDeleteReason(e.target.value)}
                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm rounded-md"
                    >
                      <option value="">Select a reason</option>
                      {DELETION_REASONS.map((reason) => (
                        <option key={reason} value={reason}>
                          {reason}
                        </option>
                      ))}
                    </select>
                  </div>

                  {deleteReason === 'Other' && (
                    <div>
                      <label htmlFor="otherReason" className="block text-sm font-medium text-gray-700">
                        Please specify
                      </label>
                      <input
                        type="text"
                        id="otherReason"
                        value={otherReason}
                        onChange={(e) => setOtherReason(e.target.value)}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 sm:text-sm"
                        placeholder="Tell us more..."
                      />
                    </div>
                  )}

                  <div className="flex space-x-4">
                    <button
                      onClick={() => {
                        setShowDeleteConfirm(false)
                        setDeleteReason('')
                        setOtherReason('')
                      }}
                      className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleDeleteAccount}
                      disabled={isLoading || !deleteReason || (deleteReason === 'Other' && !otherReason)}
                      className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                    >
                      {isLoading ? 'Deleting...' : 'Confirm Delete'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
} 