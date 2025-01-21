'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'

interface TasteProfile {
  favoriteDishes: string[]
  dislikedIngredients: string[]
  dietaryRestrictions: {
    vegetarian: boolean
    vegan: boolean
    glutenFree: boolean
    dairyFree: boolean
    nutFree: boolean
    halal: boolean
    kosher: boolean
    other?: string
  }
  spicePreference: 'none' | 'mild' | 'medium' | 'hot' | 'very-hot'
  tastePreferences: {
    sweet: 'dislike' | 'neutral' | 'like'
    sour: 'dislike' | 'neutral' | 'like'
    bitter: 'dislike' | 'neutral' | 'like'
    umami: 'dislike' | 'neutral' | 'like'
    salty: 'dislike' | 'neutral' | 'like'
    tangy: 'dislike' | 'neutral' | 'like'
  }
  cuisinePreferences: string[]
  allergies: string[]
  additionalNotes: string
}

interface TasteProfileSectionProps {
  onboardingStatus: 'NOT_STARTED' | 'SKIPPED' | 'COMPLETED'
}

const DEFAULT_PROFILE: TasteProfile = {
  favoriteDishes: [],
  dislikedIngredients: [],
  dietaryRestrictions: {
    vegetarian: false,
    vegan: false,
    glutenFree: false,
    dairyFree: false,
    nutFree: false,
    halal: false,
    kosher: false,
    other: ''
  },
  spicePreference: 'medium',
  tastePreferences: {
    sweet: 'neutral',
    sour: 'neutral',
    bitter: 'neutral',
    umami: 'neutral',
    salty: 'neutral',
    tangy: 'neutral'
  },
  cuisinePreferences: [],
  allergies: [],
  additionalNotes: ''
}

export default function TasteProfileSection({ onboardingStatus }: TasteProfileSectionProps) {
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [profile, setProfile] = useState<TasteProfile>(DEFAULT_PROFILE)

  useEffect(() => {
    fetchTasteProfile()
  }, [])

  const fetchTasteProfile = async () => {
    try {
      const res = await fetch('/api/profile/taste')
      const data = await res.json()

      if (res.ok) {
        setProfile(data.data)
      }
    } catch (error) {
      console.error('Failed to fetch taste profile:', error)
      setError('Failed to load taste profile')
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!profile) return

    setIsSaving(true)
    setError('')
    setSuccess('')

    try {
      const res = await fetch('/api/profile/taste', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profile),
      })

      if (!res.ok) {
        throw new Error('Failed to save taste profile')
      }

      setSuccess('Taste profile saved successfully!')
    } catch (error) {
      console.error('Failed to save taste profile:', error)
      setError('Failed to save taste profile')
    } finally {
      setIsSaving(false)
    }
  }

  const handlePreferenceChange = (preference: keyof TasteProfile['tastePreferences'], value: 'dislike' | 'neutral' | 'like') => {
    if (!profile) return
    setProfile({
      ...profile,
      tastePreferences: {
        ...profile.tastePreferences,
        [preference]: value
      }
    })
  }

  const handleSpicePreferenceChange = (value: TasteProfile['spicePreference']) => {
    if (!profile) return
    setProfile({
      ...profile,
      spicePreference: value
    })
  }

  const handleDietaryChange = (restriction: keyof TasteProfile['dietaryRestrictions'], value: boolean | string) => {
    if (!profile) return
    setProfile({
      ...profile,
      dietaryRestrictions: {
        ...profile.dietaryRestrictions,
        [restriction]: value
      }
    })
  }

  return (
    <div id="taste-profile" className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-lg font-medium text-gray-900">Taste Profile</h2>
            <p className="mt-1 text-sm text-gray-500">
              {onboardingStatus === 'COMPLETED' 
                ? 'Customize your taste preferences to get better recommendations'
                : 'Complete your taste profile to get personalized recommendations'}
            </p>
          </div>
        </div>

        {onboardingStatus !== 'COMPLETED' ? (
          <div className="text-center py-8">
            <h3 className="text-base font-semibold text-gray-900 mb-2">Get Better Recommendations</h3>
            <p className="text-sm text-gray-500 mb-6">Complete your taste profile to unlock 2 extra free scans and get personalized recommendations!</p>
            <Link
              href="/onboarding"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700"
            >
              Complete Onboarding (+2 free scans)
            </Link>
          </div>
        ) : (
          <>
            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
                {error}
              </div>
            )}

            {success && (
              <div className="mb-4 bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded">
                {success}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-4">Favorite Dishes</h3>
                <div className="space-y-2">
                  {profile?.favoriteDishes.map((dish, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={dish}
                        onChange={(e) => {
                          const newDishes = [...(profile?.favoriteDishes || [])]
                          newDishes[index] = e.target.value
                          setProfile(prev => {
                            return {
                              ...prev,
                              favoriteDishes: newDishes
                            }
                          })
                        }}
                        className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                        placeholder="Enter a favorite dish"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const newDishes = profile?.favoriteDishes.filter((_, i) => i !== index)
                          setProfile(prev => {
                            return {
                              ...prev,
                              favoriteDishes: newDishes
                            }
                          })
                        }}
                        className="p-2 text-gray-400 hover:text-gray-500"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => {
                      setProfile(prev => {
                        return {
                          ...prev,
                          favoriteDishes: [...prev.favoriteDishes, '']
                        }
                      })
                    }}
                    className="mt-2 text-sm text-purple-600 hover:text-purple-700"
                  >
                    + Add Favorite Dish
                  </button>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-4">Disliked Ingredients</h3>
                <div className="space-y-2">
                  {profile?.dislikedIngredients.map((ingredient, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={ingredient}
                        onChange={(e) => {
                          const newIngredients = [...(profile?.dislikedIngredients || [])]
                          newIngredients[index] = e.target.value
                          setProfile(prev => {
                            return {
                              ...prev,
                              dislikedIngredients: newIngredients
                            }
                          })
                        }}
                        className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                        placeholder="Enter a disliked ingredient"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const newIngredients = profile?.dislikedIngredients.filter((_, i) => i !== index)
                          setProfile(prev => {
                            return {
                              ...prev,
                              dislikedIngredients: newIngredients
                            }
                          })
                        }}
                        className="p-2 text-gray-400 hover:text-gray-500"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => {
                      setProfile(prev => {
                        return {
                          ...prev,
                          dislikedIngredients: [...prev.dislikedIngredients, '']
                        }
                      })
                    }}
                    className="mt-2 text-sm text-purple-600 hover:text-purple-700"
                  >
                    + Add Disliked Ingredient
                  </button>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-4">Taste Preferences</h3>
                <div className="space-y-4">
                  {Object.entries(profile?.tastePreferences || {}).map(([key, value]) => (
                    <div key={key} className="flex flex-col space-y-2">
                      <label className="text-sm font-medium text-gray-700 capitalize">
                        {key}
                      </label>
                      <div className="flex gap-4">
                        {['dislike', 'neutral', 'like'].map((option) => (
                          <label key={option} className="flex items-center">
                            <input
                              type="radio"
                              checked={value === option}
                              onChange={() => handlePreferenceChange(key as keyof TasteProfile['tastePreferences'], option as 'dislike' | 'neutral' | 'like')}
                              className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300"
                            />
                            <span className="ml-2 text-sm text-gray-700 capitalize">{option}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-4">Spice Preference</h3>
                <div className="flex gap-4">
                  {['none', 'mild', 'medium', 'hot', 'very-hot'].map((level) => (
                    <label key={level} className="flex items-center">
                      <input
                        type="radio"
                        checked={profile?.spicePreference === level}
                        onChange={() => handleSpicePreferenceChange(level as TasteProfile['spicePreference'])}
                        className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300"
                      />
                      <span className="ml-2 text-sm text-gray-700 capitalize">{level.replace('-', ' ')}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-4">Dietary Restrictions</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {(['vegetarian', 'vegan', 'glutenFree', 'dairyFree', 'nutFree', 'halal', 'kosher'] as const).map((key) => (
                    <label key={key} className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={profile?.dietaryRestrictions[key] || false}
                        onChange={(e) => handleDietaryChange(key, e.target.checked)}
                        className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                      />
                      <span className="text-sm text-gray-700 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                    </label>
                  ))}
                </div>
                <div className="mt-4">
                  <label htmlFor="otherRestrictions" className="block text-sm font-medium text-gray-700">
                    Other Dietary Restrictions
                  </label>
                  <input
                    type="text"
                    id="otherRestrictions"
                    value={profile?.dietaryRestrictions.other || ''}
                    onChange={(e) => handleDietaryChange('other', e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                    placeholder="Enter any other dietary restrictions"
                  />
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-4">Cuisine Preferences</h3>
                <div className="space-y-2">
                  {profile?.cuisinePreferences.map((cuisine, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={cuisine}
                        onChange={(e) => {
                          const newCuisines = [...(profile?.cuisinePreferences || [])]
                          newCuisines[index] = e.target.value
                          setProfile(prev => {
                            return {
                              ...prev,
                              cuisinePreferences: newCuisines
                            }
                          })
                        }}
                        className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                        placeholder="Enter a cuisine preference"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const newCuisines = profile?.cuisinePreferences.filter((_, i) => i !== index)
                          setProfile(prev => {
                            return {
                              ...prev,
                              cuisinePreferences: newCuisines
                            }
                          })
                        }}
                        className="p-2 text-gray-400 hover:text-gray-500"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => {
                      setProfile(prev => {
                        return {
                          ...prev,
                          cuisinePreferences: [...prev.cuisinePreferences, '']
                        }
                      })
                    }}
                    className="mt-2 text-sm text-purple-600 hover:text-purple-700"
                  >
                    + Add Cuisine Preference
                  </button>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-4">Allergies</h3>
                <div className="space-y-2">
                  {profile?.allergies.map((allergy, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={allergy}
                        onChange={(e) => {
                          const newAllergies = [...(profile?.allergies || [])]
                          newAllergies[index] = e.target.value
                          setProfile(prev => {
                            return {
                              ...prev,
                              allergies: newAllergies
                            }
                          })
                        }}
                        className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                        placeholder="Enter an allergy"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const newAllergies = profile?.allergies.filter((_, i) => i !== index)
                          setProfile(prev => {
                            return {
                              ...prev,
                              allergies: newAllergies
                            }
                          })
                        }}
                        className="p-2 text-gray-400 hover:text-gray-500"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => {
                      setProfile(prev => {
                        return {
                          ...prev,
                          allergies: [...prev.allergies, '']
                        }
                      })
                    }}
                    className="mt-2 text-sm text-purple-600 hover:text-purple-700"
                  >
                    + Add Allergy
                  </button>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-4">Additional Notes</h3>
                <textarea
                  value={profile?.additionalNotes || ''}
                  onChange={(e) => setProfile(prev => {
                    return {
                      ...prev,
                      additionalNotes: e.target.value
                    }
                  })}
                  rows={4}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                  placeholder="Any additional notes about your food preferences..."
                />
              </div>

              <div className="flex justify-end">
                <motion.button
                  type="submit"
                  disabled={isSaving}
                  whileTap={{ scale: 0.95 }}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50"
                >
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </motion.button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  )
} 