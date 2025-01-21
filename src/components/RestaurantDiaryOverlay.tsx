import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { HiX } from 'react-icons/hi'
import { FaStar } from 'react-icons/fa'

interface RestaurantDiaryOverlayProps {
  menuUploadId: string
  restaurantName?: string
  onClose: () => void
  onSave: () => void
}

export default function RestaurantDiaryOverlay({
  menuUploadId,
  restaurantName,
  onClose,
  onSave
}: RestaurantDiaryOverlayProps) {
  const [orderedDish, setOrderedDish] = useState('')
  const [rating, setRating] = useState<number | null>(null)
  const [notes, setNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!orderedDish || !rating) {
      setError('Please fill in all required fields')
      return
    }

    setIsSubmitting(true)
    setError('')

    try {
      // Create restaurant visit record
      const visitRes = await fetch('/api/diary/visit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          menuUploadId,
          restaurantName,
          orderedDish,
          rating,
          notes
        })
      })

      if (!visitRes.ok) {
        throw new Error('Failed to save restaurant visit')
      }

      // Update taste profile based on the rating
      const profileRes = await fetch('/api/profile/update-from-rating', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dish: orderedDish,
          rating
        })
      })

      if (!profileRes.ok) {
        console.error('Failed to update taste profile')
      }

      onSave()
    } catch (error) {
      console.error('Error saving restaurant visit:', error)
      setError('Failed to save your visit. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center p-0 sm:p-4 z-50 touch-none"
      >
        <motion.div 
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 500 }}
          className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-md p-6 relative max-h-[90vh] overflow-y-auto touch-auto"
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Record Your Visit</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Close"
            >
              <HiX className="w-6 h-6" />
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {restaurantName && (
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Restaurant
                </label>
                <p className="mt-1 text-lg text-gray-900">{restaurantName}</p>
              </div>
            )}

            <div>
              <label htmlFor="orderedDish" className="block text-sm font-medium text-gray-700">
                What did you order? *
              </label>
              <input
                type="text"
                id="orderedDish"
                value={orderedDish}
                onChange={(e) => setOrderedDish(e.target.value)}
                className="mt-2 block w-full rounded-xl border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 text-lg"
                required
                placeholder="Enter dish name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                How would you rate it? *
              </label>
              <div className="flex justify-center gap-4">
                {[1, 2, 3, 4, 5].map((value) => (
                  <motion.button
                    key={value}
                    type="button"
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setRating(value)}
                    className={`relative p-3 rounded-full w-12 h-12 flex items-center justify-center transition-all ${
                      rating === value
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <FaStar className={`w-6 h-6 ${rating === value ? 'text-yellow-300' : 'text-gray-400'}`} />
                    <motion.span
                      initial={false}
                      animate={rating === value ? { scale: [1, 1.2, 1] } : {}}
                      className="absolute text-xs -top-1 -right-1 bg-purple-600 text-white w-5 h-5 rounded-full flex items-center justify-center"
                    >
                      {value}
                    </motion.span>
                  </motion.button>
                ))}
              </div>
            </div>

            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                Notes (optional)
              </label>
              <textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="mt-2 block w-full rounded-xl border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 text-lg"
                placeholder="Add any thoughts about your experience..."
              />
            </div>

            {error && (
              <motion.p 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-600 text-sm bg-red-50 p-3 rounded-lg"
              >
                {error}
              </motion.p>
            )}

            <motion.div 
              className="flex flex-col sm:flex-row justify-end gap-3 mt-6"
              layout
            >
              <motion.button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto px-4 py-3 text-base font-medium text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
                disabled={isSubmitting}
                whileTap={{ scale: 0.98 }}
              >
                Cancel
              </motion.button>
              <motion.button
                type="submit"
                className="w-full sm:w-auto px-6 py-3 text-base font-medium text-white bg-purple-600 rounded-xl hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 transition-colors"
                disabled={isSubmitting}
                whileTap={{ scale: 0.98 }}
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center">
                    <motion.span
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-5 h-5 border-2 border-white border-t-transparent rounded-full inline-block mr-2"
                    />
                    Saving...
                  </span>
                ) : (
                  'Save Visit'
                )}
              </motion.button>
            </motion.div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
} 