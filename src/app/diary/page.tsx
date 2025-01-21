import { Suspense } from 'react'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { motion } from 'framer-motion'
import DiaryContent from './DiaryContent'

export default async function DiaryPage() {
  const session = await getServerSession()

  if (!session?.user) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Your Food Diary</h1>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Suspense fallback={<DiaryLoadingSkeleton />}>
          <DiaryContent />
        </Suspense>
      </main>
    </div>
  )
}

function DiaryLoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-4 animate-pulse">
        <div className="h-8 bg-gray-200 rounded-lg w-3/4 mb-4" />
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded w-1/2" />
          <div className="h-4 bg-gray-200 rounded w-1/3" />
        </div>
      </div>
      <div className="bg-white rounded-2xl p-4 animate-pulse">
        <div className="h-8 bg-gray-200 rounded-lg w-3/4 mb-4" />
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded w-1/2" />
          <div className="h-4 bg-gray-200 rounded w-1/3" />
        </div>
      </div>
      <div className="bg-white rounded-2xl p-4 animate-pulse">
        <div className="h-8 bg-gray-200 rounded-lg w-3/4 mb-4" />
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded w-1/2" />
          <div className="h-4 bg-gray-200 rounded w-1/3" />
        </div>
      </div>
    </div>
  )
} 