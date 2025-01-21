'use client'

import { useState } from 'react'
import { Star } from 'lucide-react'

interface AddVisitFormProps {
  onSuccess: () => void
}

export default function AddVisitForm({ onSuccess }: AddVisitFormProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [rating, setRating] = useState<number | null>(null)
  const [hoverRating, setHoverRating] = useState<number | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const data = {
      restaurantName: formData.get('restaurantName'),
      orderedDish: formData.get('orderedDish'),
      rating,
      notes: formData.get('notes'),
      mood: formData.get('mood')
    }

    try {
      const res = await fetch('/api/diary/visits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      if (!res.ok) throw new Error('Failed to add visit')

      onSuccess()
      setIsOpen(false)
      setRating(null)
      e.currentTarget.reset()
    } catch (error) {
      console.error('Error adding visit:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="w-full p-4 text-center text-purple-600 font-medium hover:bg-purple-50 rounded-2xl border-2 border-dashed border-purple-200 transition-colors"
      >
        + Add Restaurant Visit
      </button>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 shadow-sm space-y-4">
      <div>
        <label htmlFor="restaurantName" className="block text-sm font-medium text-gray-700 mb-1">
          Restaurant Name *
        </label>
        <input
          type="text"
          name="restaurantName"
          id="restaurantName"
          required
          className="w-full rounded-xl border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
        />
      </div>

      <div>
        <label htmlFor="orderedDish" className="block text-sm font-medium text-gray-700 mb-1">
          What did you order? *
        </label>
        <input
          type="text"
          name="orderedDish"
          id="orderedDish"
          required
          className="w-full rounded-xl border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          How was it?
        </label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setRating(value)}
              onMouseEnter={() => setHoverRating(value)}
              onMouseLeave={() => setHoverRating(null)}
              className="p-1"
            >
              <Star
                className={`w-6 h-6 ${
                  (hoverRating !== null ? value <= hoverRating : value <= (rating || 0))
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-gray-300'
                }`}
              />
            </button>
          ))}
        </div>
      </div>

      <div>
        <label htmlFor="mood" className="block text-sm font-medium text-gray-700 mb-1">
          What were you in the mood for?
        </label>
        <input
          type="text"
          name="mood"
          id="mood"
          className="w-full rounded-xl border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
          placeholder="e.g., Something spicy, Comfort food"
        />
      </div>

      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
          Notes
        </label>
        <textarea
          name="notes"
          id="notes"
          rows={3}
          className="w-full rounded-xl border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
          placeholder="Any thoughts about your experience?"
        />
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-purple-600 text-white py-2 px-4 rounded-xl font-medium hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50"
        >
          {loading ? 'Adding...' : 'Add Visit'}
        </button>
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          className="flex-1 bg-gray-50 text-gray-700 py-2 px-4 rounded-xl font-medium hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
        >
          Cancel
        </button>
      </div>
    </form>
  )
} 