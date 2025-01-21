'use client'

import { useCallback, useState, useEffect } from 'react'
import { useDropzone } from 'react-dropzone'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import RatingPopup from '@/components/RatingPopup'
import MenuScanResults from '@/components/MenuScanResults'

interface MenuItem {
  name: string
  description?: string
  price?: string
  category?: string
}

interface RawRecommendation {
  dishName: string
  score: number
  reason?: string
  explanation?: string
}

interface Recommendation {
  dishName: string
  score: number
  reason: string
}

interface OrderedDish {
  name: string
  rating?: number
  notes?: string
}

interface MenuUpload {
  id: string
  createdAt: string
  menuItems?: MenuItem[]
  recommendations: string | RawRecommendation[]
  ratings?: { [dishName: string]: number }
  restaurantName?: string
  orderedDishes?: { [key: string]: OrderedDish }
}

interface OnboardingStatus {
  onboardingStatus: 'NOT_STARTED' | 'SKIPPED' | 'COMPLETED'
  freeScanCount: number
}

export default function Dashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState('')
  const [uploads, setUploads] = useState<MenuUpload[]>([])
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [mood, setMood] = useState('')
  const [onboardingStatus, setOnboardingStatus] = useState<OnboardingStatus | null>(null)
  const [showRatingPopup, setShowRatingPopup] = useState(false)
  const [currentUpload, setCurrentUpload] = useState<MenuUpload | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showScanResults, setShowScanResults] = useState(false)
  const [currentMenuItems, setCurrentMenuItems] = useState<MenuItem[]>([])
  const [currentRecommendations, setCurrentRecommendations] = useState<Recommendation[]>([])

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/login')
      return
    }

    if (status === 'loading') {
      return
    }

    const fetchData = async () => {
      try {
        // Check onboarding status
        const res = await fetch('/api/user/onboarding-status')
        if (res.ok) {
          const data = await res.json()
          console.log('Dashboard - Onboarding status:', data)
          setOnboardingStatus(data.data)
        }

        // Fetch uploads
        const uploadsRes = await fetch('/api/menu/uploads')
        if (uploadsRes.ok) {
          const data = await uploadsRes.json()
          setUploads(data.uploads || [])
        }
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error)
        setError('Failed to load dashboard data')
      } finally {
        setIsLoading(false)
      }
    }

    if (status === 'authenticated') {
      fetchData()
    }
  }, [status, router])

  const handleRatingSubmit = async (ratings: { [dishName: string]: number }, feedback: string) => {
    if (!currentUpload) return

    try {
      const res = await fetch('/api/menu/rate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          menuId: currentUpload.id,
          ratings,
          feedback,
        }),
      })

      if (!res.ok) {
        throw new Error('Failed to submit ratings')
      }

      const data = await res.json()
      
      // Update the uploads list with the new ratings
      setUploads(prev => prev.map(upload => 
        upload.id === currentUpload.id 
          ? { ...upload, ratings: data.data.ratings }
          : upload
      ))
    } catch (error) {
      console.error('Failed to submit ratings:', error)
      setError('Failed to submit ratings')
    }
  }

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (!onboardingStatus) return

    // Check if user has free scans available
    if (onboardingStatus.freeScanCount <= 0) {
      setError('You have used all your free scans. Please upgrade your plan to continue.')
      return
    }

    // For skipped onboarding, require mood
    if (onboardingStatus.onboardingStatus === 'SKIPPED' && !mood.trim()) {
      setError('Please tell us what you are in the mood for today')
      return
    }

    setIsUploading(true)
    setError('')

    const formData = new FormData()
    formData.append('menu', acceptedFiles[0])
    if (mood) {
      formData.append('mood', mood)
    }

    try {
      const res = await fetch('/api/menu/upload', {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.message || 'Failed to upload menu')
      }

      const newUpload = data.data
      setUploads(prev => [newUpload, ...prev])
      setCurrentUpload(newUpload)
      setCurrentMenuItems(JSON.parse(newUpload.parsedText))
      
      // Parse recommendations safely and ensure it's in the correct format
      const parsedRecommendations = Array.isArray(newUpload.recommendations)
        ? newUpload.recommendations
        : JSON.parse(newUpload.recommendations || '[]')

      // If recommendations are in the root of the response, wrap them in an object
      const recommendationsArray = Array.isArray(parsedRecommendations)
        ? parsedRecommendations
        : parsedRecommendations.recommendations || []

      // Ensure each recommendation has the required fields
      const formattedRecommendations = recommendationsArray.map((rec: RawRecommendation) => ({
        dishName: rec.dishName,
        score: typeof rec.score === 'number' ? (rec.score > 1 ? rec.score : rec.score * 100) : 0,
        reason: rec.reason || rec.explanation || ''
      }))

      setCurrentRecommendations(formattedRecommendations)
      setShowScanResults(true)
      setMood('') // Reset mood after successful upload
    } catch (error) {
      console.error('Upload error details:', error)
      setError(error instanceof Error ? error.message : 'Failed to upload menu')
    } finally {
      setIsUploading(false)
    }
  }, [mood, onboardingStatus])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png']
    },
    maxFiles: 1
  })

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this menu scan?')) return

    try {
      const res = await fetch(`/api/menu/${id}`, {
        method: 'DELETE'
      })

      if (!res.ok) throw new Error('Failed to delete menu')
      
      // Update the local state to remove the deleted menu
      setUploads(prev => prev.filter(upload => upload.id !== id))
    } catch (error) {
      console.error('Error deleting menu:', error)
      alert('Failed to delete menu')
    }
  }

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  if (status === 'unauthenticated') {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Upload Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          {onboardingStatus && onboardingStatus.freeScanCount <= 0 ? (
            <div className="text-center py-6">
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Free Scans Left</h3>
              <p className="text-gray-500 mb-4">You have used all your free menu scans.</p>
              <Link
                href="/pricing"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700"
              >
                Upgrade Your Plan
              </Link>
            </div>
          ) : (
            <>
              {onboardingStatus?.onboardingStatus === 'SKIPPED' && (
                <div className="mb-4">
                  <label htmlFor="mood" className="block text-sm font-medium text-gray-700">
                    What are you in the mood for today?
                  </label>
                  <input
                    type="text"
                    id="mood"
                    value={mood}
                    onChange={(e) => setMood(e.target.value)}
                    placeholder="e.g., something spicy, vegetarian, light lunch..."
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 text-gray-900 placeholder-gray-500"
                    required
                  />
                </div>
              )}

              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors ${
                  isDragActive ? 'border-purple-500 bg-purple-50' : 'border-gray-300 hover:border-purple-500'
                }`}
              >
                <input {...getInputProps()} />
                {isUploading ? (
                  <div className="flex flex-col items-center">
                    <svg className="animate-spin h-10 w-10 text-purple-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p className="mt-4 text-sm text-gray-600">Processing your menu...</p>
                  </div>
                ) : isDragActive ? (
                  <div className="text-purple-600">
                    <svg className="mx-auto h-12 w-12 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <p>Drop your menu here...</p>
                  </div>
                ) : (
                  <div className="text-gray-600">
                    <svg className="mx-auto h-12 w-12 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <p className="text-lg mb-2">Drag & drop your menu here</p>
                    <p className="text-sm text-gray-500">or click to select a file</p>
                    {onboardingStatus && (
                      <p className="mt-2 text-sm text-purple-600">
                        {onboardingStatus?.freeScanCount ?? 0} free {(onboardingStatus?.freeScanCount ?? 0) === 1 ? 'scan' : 'scans'} remaining
                      </p>
                    )}
                  </div>
                )}
              </div>
            </>
          )}

          {error && (
            <div className="mt-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {onboardingStatus?.onboardingStatus === 'NOT_STARTED' && (
            <div className="mt-4 bg-purple-50 border border-purple-100 p-4 rounded-md">
              <p className="text-sm text-purple-700">
                Complete your taste profile to unlock 2 extra free scans and get more accurate recommendations!{' '}
                <Link href="/onboarding" className="font-medium underline">
                  Complete Profile
                </Link>
              </p>
            </div>
          )}

          {onboardingStatus?.onboardingStatus === 'SKIPPED' && (
            <div className="mt-4 bg-purple-50 border border-purple-100 p-4 rounded-md">
              <p className="text-sm text-purple-700">
                Want more accurate recommendations? Complete your taste profile to unlock 2 extra free scans!{' '}
                <Link href="/onboarding" className="font-medium underline">
                  Complete Profile
                </Link>
              </p>
            </div>
          )}

          {onboardingStatus?.onboardingStatus === 'COMPLETED' && (
            <div className="mt-4 bg-green-50 border border-green-100 p-4 rounded-md">
              <p className="text-sm text-green-700 flex items-center justify-between">
                <span className="flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Taste profile complete
                </span>
                <Link href="/profile#taste-profile" className="font-medium underline">
                  Edit Profile
                </Link>
              </p>
            </div>
          )}
        </div>

        {/* Recent Uploads */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Recent Menus</h2>
          {uploads.length === 0 ? (
            <div className="text-center py-12">
              <div className="mb-4">
                <svg className="mx-auto h-24 w-24 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Menus Yet</h3>
              <p className="text-gray-500 mb-6">Your recent scanned menus will appear here</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {uploads.map((upload) => (
                <div key={upload.id} className="bg-white border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                  <div className="p-4">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-sm text-gray-500">
                        {new Date(upload.createdAt).toLocaleDateString()}
                      </span>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handleDelete(upload.id)}
                          className="text-gray-400 hover:text-red-600 transition-colors"
                          title="Delete menu"
                        >
                          <svg 
                            className="w-5 h-5" 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                          >
                            <path 
                              strokeLinecap="round" 
                              strokeLinejoin="round" 
                              strokeWidth={2} 
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" 
                            />
                          </svg>
                        </button>
                        <Link
                          href={`/menu/${upload.id}`}
                          className="text-purple-600 hover:text-purple-700 text-sm font-medium"
                        >
                          View Details →
                        </Link>
                      </div>
                    </div>
                    {upload.recommendations && (
                      <div className="space-y-2">
                        <h3 className="text-sm font-medium text-gray-900">Top Recommendations:</h3>
                        {(Array.isArray(upload.recommendations) 
                          ? upload.recommendations 
                          : JSON.parse(upload.recommendations || '[]')
                        ).slice(0, 3).map((rec: RawRecommendation) => {
                          // Ensure score is a number between 0-100
                          const score = typeof rec.score === 'number' 
                            ? (rec.score > 1 ? rec.score : rec.score * 100)
                            : 0
                          
                          return (
                            <div key={rec.dishName} className="flex items-center">
                              <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-medium">
                                {Math.round(score)}%
                              </div>
                              <span className="ml-2">{rec.dishName}</span>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {showScanResults && currentMenuItems && currentRecommendations && (
        <MenuScanResults
          menuItems={currentMenuItems}
          recommendations={currentRecommendations}
          onClose={() => {
            setShowScanResults(false)
            setCurrentMenuItems([])
            setCurrentRecommendations([])
          }}
          onContinue={(restaurantName, orderedDishes) => {
            setShowScanResults(false)
            // Update current upload with restaurant name and ordered dishes
            if (currentUpload) {
              setCurrentUpload({
                ...currentUpload,
                restaurantName: restaurantName || 'Unnamed Restaurant',
                orderedDishes
              })
            }
            setShowRatingPopup(true)
          }}
        />
      )}

      {showRatingPopup && currentUpload?.recommendations && (
        <RatingPopup
          recommendations={Array.isArray(currentUpload.recommendations)
            ? currentUpload.recommendations.map((rec: RawRecommendation) => ({
                dishName: rec.dishName,
                score: typeof rec.score === 'number' ? (rec.score > 1 ? rec.score : rec.score * 100) : 0,
                reason: rec.reason || rec.explanation || ''
              }))
            : JSON.parse(currentUpload.recommendations || '[]').recommendations?.map((rec: RawRecommendation) => ({
                dishName: rec.dishName,
                score: typeof rec.score === 'number' ? (rec.score > 1 ? rec.score : rec.score * 100) : 0,
                reason: rec.reason || rec.explanation || ''
              })) || []
          }
          onClose={() => {
            setShowRatingPopup(false)
            setCurrentUpload(null)
          }}
          onSubmit={handleRatingSubmit}
        />
      )}
    </div>
  )
} 