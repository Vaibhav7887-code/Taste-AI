'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Trash2 } from 'lucide-react'

interface Recommendation {
  dishName: string
  score: number
  reason: string
}

interface MenuUpload {
  id: string
  restaurantName: string
  recommendations: string | Recommendation[]
  createdAt: string
  mood?: string
}

interface RestaurantVisit {
  id: string
  restaurantName: string
  visitDate: string
  orderedDish: string
  rating?: number
  notes?: string
  mood?: string
}

export default function DiaryContent() {
  const [visits, setVisits] = useState<RestaurantVisit[]>([])
  const [uploads, setUploads] = useState<MenuUpload[]>([])
  const [loading, setLoading] = useState(true)

  const fetchData = async () => {
    try {
      const [visitsRes, uploadsRes] = await Promise.all([
        fetch('/api/diary/visits'),
        fetch('/api/menu/uploads')
      ])

      if (!visitsRes.ok || !uploadsRes.ok) throw new Error('Failed to fetch data')

      const [visitsData, uploadsData] = await Promise.all([
        visitsRes.json(),
        uploadsRes.json()
      ])

      setVisits(visitsData.visits || [])
      setUploads(uploadsData.uploads || [])
    } catch (error) {
      console.error('Error fetching diary data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this menu scan?')) return

    try {
      const res = await fetch(`/api/menu/${id}`, {
        method: 'DELETE'
      })

      if (!res.ok) throw new Error('Failed to delete menu')
      
      // Refresh the data
      fetchData()
    } catch (error) {
      console.error('Error deleting menu:', error)
      alert('Failed to delete menu')
    }
  }

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div className="space-y-8">
      {/* Recent Menu Scans */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Recent Menus</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {uploads.map(upload => {
            let recommendations = []
            try {
              recommendations = Array.isArray(upload.recommendations) 
                ? upload.recommendations 
                : JSON.parse(upload.recommendations || '[]')
            } catch (e) {
              console.error('Failed to parse recommendations:', e)
            }

            return (
              <div
                key={upload.id}
                className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow relative"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <h3 className="font-semibold text-lg">
                        {upload.restaurantName || 'Unnamed Restaurant'}
                      </h3>
                      <button
                        onClick={() => handleDelete(upload.id)}
                        className="text-gray-400 hover:text-red-600 ml-2"
                        title="Delete menu"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      {new Date(upload.createdAt).toLocaleDateString()}
                    </p>
                    {upload.mood && (
                      <p className="text-sm text-purple-600 mt-1">Mood: {upload.mood}</p>
                    )}
                    {recommendations.length > 0 && (
                      <div className="mt-2 text-sm text-gray-600">
                        <p>Top Recommendations:</p>
                        {recommendations.slice(0, 3).map((rec: Recommendation) => {
                          // Ensure score is a number between 0-100
                          const score = typeof rec.score === 'number' 
                            ? (rec.score > 1 ? rec.score : rec.score * 100)
                            : 0
                          
                          return (
                            <div key={rec.dishName} className="flex justify-between items-center text-sm mt-1">
                              <span>{rec.dishName}</span>
                              <span className="text-purple-600 font-medium">
                                {Math.round(score)}%
                              </span>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                </div>
                <Link 
                  href={`/menu/${upload.id}`}
                  className="block text-right mt-3 text-purple-600 hover:text-purple-700 text-sm font-medium"
                >
                  View Details →
                </Link>
              </div>
            )
          })}
        </div>
      </section>

      {/* Restaurant Visits */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Restaurant Visits</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {visits.map(visit => (
            <div
              key={visit.id}
              className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow"
            >
              <h3 className="font-semibold text-lg mb-1">
                {visit.restaurantName}
              </h3>
              <p className="text-sm text-gray-500 mb-2">
                {new Date(visit.visitDate).toLocaleDateString()}
              </p>
              <p className="text-gray-700">Ordered: {visit.orderedDish}</p>
              {visit.rating && (
                <p className="text-sm text-yellow-600">
                  Rating: {visit.rating} / 5
                </p>
              )}
              {visit.mood && (
                <p className="text-sm text-purple-600">Mood: {visit.mood}</p>
              )}
              {visit.notes && (
                <p className="mt-2 text-sm text-gray-600">{visit.notes}</p>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  )
} 