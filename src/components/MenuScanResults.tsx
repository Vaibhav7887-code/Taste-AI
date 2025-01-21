'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { FaStar, FaArrowRight, FaTimes, FaChevronDown, FaUtensils } from 'react-icons/fa'
import { useState } from 'react'

interface MenuItem {
  name: string
  description?: string
  price?: string
  category?: string
}

interface Recommendation {
  dishName: string
  reason: string
  score: number
}

interface OrderedDish {
  name: string
  rating?: number
  notes?: string
}

interface MenuScanResultsProps {
  menuItems: MenuItem[]
  recommendations: Recommendation[]
  onClose: () => void
  onContinue: (restaurantName: string, orderedDishes: { [key: string]: OrderedDish }) => void
}

export default function MenuScanResults({
  menuItems,
  recommendations = [],
  onClose,
  onContinue
}: MenuScanResultsProps) {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())
  const [restaurantName, setRestaurantName] = useState('')
  const [orderedDishes, setOrderedDishes] = useState<{ [key: string]: OrderedDish }>({})
  const [showRatingInput, setShowRatingInput] = useState<string | null>(null)

  const toggleExpand = (dishName: string) => {
    const newExpanded = new Set(expandedItems)
    if (expandedItems.has(dishName)) {
      newExpanded.delete(dishName)
    } else {
      newExpanded.add(dishName)
    }
    setExpandedItems(newExpanded)
  }

  const handleOrder = (dishName: string) => {
    setOrderedDishes(prev => ({
      ...prev,
      [dishName]: { name: dishName }
    }))
    setShowRatingInput(dishName)
  }

  const handleRating = (dishName: string, rating: number) => {
    setOrderedDishes(prev => ({
      ...prev,
      [dishName]: { ...prev[dishName], rating }
    }))
  }

  const handleNotes = (dishName: string, notes: string) => {
    setOrderedDishes(prev => ({
      ...prev,
      [dishName]: { ...prev[dishName], notes }
    }))
  }

  const handleContinue = () => {
    // Only proceed if at least one dish is ordered
    if (Object.keys(orderedDishes).length === 0) {
      alert('Please select at least one dish you ordered')
      return
    }
    
    // Pass the restaurant name and ordered dishes to the parent
    onContinue(restaurantName, orderedDishes)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center overflow-hidden"
    >
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 500 }}
        className="bg-white w-full max-w-2xl rounded-2xl shadow-xl my-4 max-h-[90vh] flex flex-col"
      >
        <div className="p-6 overflow-y-auto flex-1">
          <div className="flex justify-between items-center mb-6 sticky top-0 bg-white z-10 pb-4">
            <h2 className="text-2xl font-bold text-gray-900">Menu Analysis</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Close"
            >
              <FaTimes className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Restaurant Name Input */}
          <div className="mb-6">
            <label htmlFor="restaurantName" className="block text-sm font-medium text-gray-700 mb-2">
              Restaurant Name (Optional)
            </label>
            <div className="relative">
              <input
                type="text"
                id="restaurantName"
                value={restaurantName}
                onChange={(e) => setRestaurantName(e.target.value)}
                className="block w-full rounded-xl border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                placeholder="Enter restaurant name for your diary"
              />
              <p className="mt-1 text-sm text-gray-500">
                Adding the restaurant name helps you track your dining experiences in your diary
              </p>
            </div>
          </div>

          <div className="space-y-6">
            {/* Recommendations Section */}
            {recommendations?.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Personalized Recommendations
                </h3>
                <div className="space-y-4">
                  {recommendations.map((rec, index) => (
                    <motion.div
                      key={rec.dishName}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-purple-50 rounded-xl p-4"
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-purple-600 font-semibold">{index + 1}</span>
                        </div>
                        <div className="flex-1">
                          <div 
                            className="flex items-center justify-between cursor-pointer"
                            onClick={() => toggleExpand(rec.dishName)}
                          >
                            <p className="text-gray-900 font-medium">{rec.dishName}</p>
                            <div className="flex items-center gap-2">
                              <span className="text-purple-600 font-medium">{Math.round(rec.score)}%</span>
                              <FaChevronDown 
                                className={`w-4 h-4 text-gray-500 transition-transform ${
                                  expandedItems.has(rec.dishName) ? 'transform rotate-180' : ''
                                }`}
                              />
                            </div>
                          </div>
                          <AnimatePresence>
                            {expandedItems.has(rec.dishName) && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="overflow-hidden"
                              >
                                <p className="text-gray-600 text-sm mt-2 whitespace-pre-wrap">{rec.reason}</p>
                              </motion.div>
                            )}
                          </AnimatePresence>
                          
                          {/* Order Button and Rating Input */}
                          <div className="mt-3">
                            {!orderedDishes[rec.dishName] ? (
                              <button
                                onClick={() => handleOrder(rec.dishName)}
                                className="flex items-center gap-2 px-3 py-1 text-sm bg-purple-100 text-purple-600 rounded-full hover:bg-purple-200 transition-colors"
                              >
                                <FaUtensils className="w-4 h-4" />
                                I ordered this
                              </button>
                            ) : (
                              <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                      key={star}
                                      onClick={() => handleRating(rec.dishName, star)}
                                      className={`text-2xl ${
                                        (orderedDishes[rec.dishName]?.rating ?? 0) >= star 
                                          ? 'text-yellow-400' 
                                          : 'text-gray-300'
                                      }`}
                                    >
                                      ★
                                    </button>
                                  ))}
                                </div>
                                <input
                                  type="text"
                                  placeholder="Add notes about this dish (optional)"
                                  value={orderedDishes[rec.dishName]?.notes || ''}
                                  onChange={(e) => handleNotes(rec.dishName, e.target.value)}
                                  className="w-full text-sm rounded-md border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Menu Items Section */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                All Menu Items
              </h3>
              <div className="space-y-4">
                {menuItems?.map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="border border-gray-200 rounded-xl p-4"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <h4 className="font-medium text-gray-900">{item.name}</h4>
                          {item.price && (
                            <span className="text-sm font-medium text-gray-900 ml-2">{item.price}</span>
                          )}
                        </div>
                        {item.description && (
                          <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                        )}
                        {item.category && (
                          <span className="mt-2 inline-block px-2 py-1 text-xs font-medium text-purple-600 bg-purple-100 rounded-full">
                            {item.category}
                          </span>
                        )}
                        
                        {/* Order Button and Rating Input */}
                        <div className="mt-3">
                          {!orderedDishes[item.name] ? (
                            <button
                              onClick={() => handleOrder(item.name)}
                              className="flex items-center gap-2 px-3 py-1 text-sm bg-purple-100 text-purple-600 rounded-full hover:bg-purple-200 transition-colors"
                            >
                              <FaUtensils className="w-4 h-4" />
                              I ordered this
                            </button>
                          ) : (
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <button
                                    key={star}
                                    onClick={() => handleRating(item.name, star)}
                                    className={`text-2xl ${
                                      (orderedDishes[item.name]?.rating ?? 0) >= star 
                                        ? 'text-yellow-400' 
                                        : 'text-gray-300'
                                    }`}
                                  >
                                    ★
                                  </button>
                                ))}
                              </div>
                              <input
                                type="text"
                                placeholder="Add notes about this dish (optional)"
                                value={orderedDishes[item.name]?.notes || ''}
                                onChange={(e) => handleNotes(item.name, e.target.value)}
                                className="w-full text-sm rounded-md border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 border-t bg-white">
          <div className="flex justify-end">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleContinue}
              className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 transition-colors"
            >
              Continue
              <FaArrowRight className="w-4 h-4" />
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
} 