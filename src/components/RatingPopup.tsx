import { useState } from 'react'

interface Recommendation {
  dishName: string
  reason: string
  score: number
}

interface RatingPopupProps {
  recommendations: Recommendation[]
  onClose: () => void
  onSubmit: (ratings: { [dishName: string]: number }, feedback: string) => void
}

export default function RatingPopup({ recommendations, onClose, onSubmit }: RatingPopupProps) {
  const [ratings, setRatings] = useState<{ [dishName: string]: number }>({})
  const [feedback, setFeedback] = useState('')

  const handleRatingChange = (dishName: string, rating: number) => {
    setRatings(prev => ({ ...prev, [dishName]: rating }))
  }

  const handleSubmit = () => {
    onSubmit(ratings, feedback)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">How accurate were our recommendations?</h2>
          
          <div className="space-y-6">
            {recommendations.map((rec) => (
              <div key={rec.dishName} className="border-b pb-4">
                <p className="font-medium text-gray-900 mb-2">{rec.dishName}</p>
                <p className="text-gray-600 text-sm mb-3">{rec.reason}</p>
                <div className="flex items-center space-x-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => handleRatingChange(rec.dishName, star)}
                      className={`text-2xl ${
                        ratings[rec.dishName] >= star ? 'text-yellow-400' : 'text-gray-300'
                      }`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>
            ))}

            <div>
              <label htmlFor="feedback" className="block text-sm font-medium text-gray-700 mb-2">
                Additional Feedback (Optional)
              </label>
              <textarea
                id="feedback"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                rows={3}
                placeholder="Tell us how we can improve our recommendations..."
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
            >
              Skip
            </button>
            <button
              onClick={handleSubmit}
              className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-md hover:bg-purple-700"
            >
              Submit Ratings
            </button>
          </div>
        </div>
      </div>
    </div>
  )
} 