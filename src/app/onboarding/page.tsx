'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { TasteProfile } from '@/types/taste-profile'

const CUISINE_OPTIONS = [
  'Italian', 'Chinese', 'Japanese', 'Indian', 'Mexican', 
  'Thai', 'French', 'Mediterranean', 'American', 'Korean'
]

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [profile, setProfile] = useState<TasteProfile>({
    favoriteDishes: ['', '', ''],
    dislikedIngredients: ['', '', ''],
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
    allergies: [''],
    additionalNotes: ''
  })
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    try {
      setError('')
      const res = await fetch('/api/profile/taste', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile)
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.message || 'Failed to save profile')
      }
      
      const statusRes = await fetch('/api/user/update-onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'COMPLETED' })
      })

      if (!statusRes.ok) {
        const data = await statusRes.json()
        throw new Error(data.message || 'Failed to update onboarding status')
      }
      
      router.push('/dashboard')
    } catch (error) {
      console.error('Failed to save taste profile:', error)
      setError(error instanceof Error ? error.message : 'Failed to save profile')
    }
  }

  const handleSkip = async () => {
    try {
      setError('')
      const res = await fetch('/api/user/update-onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'SKIPPED' })
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.message || 'Failed to update onboarding status')
      }
      
      router.push('/dashboard')
    } catch (error) {
      console.error('Failed to skip onboarding:', error)
      setError(error instanceof Error ? error.message : 'Failed to skip onboarding')
    }
  }

  const updateProfile = (updates: Partial<TasteProfile>) => {
    setProfile(prev => ({ ...prev, ...updates }))
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-2xl font-bold text-gray-900">Let's Get to Know Your Taste</h1>
              <button
                type="button"
                onClick={handleSkip}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Skip for now
              </button>
            </div>

            {/* Progress bar */}
            <div className="mb-8">
              <div className="flex justify-between mb-2">
                {[1, 2, 3, 4].map((num) => (
                  <span key={num} className={`text-sm ${step >= num ? 'text-purple-600' : 'text-gray-400'}`}>
                    Step {num}
                  </span>
                ))}
              </div>
              <div className="h-2 bg-gray-200 rounded-full">
                <div 
                  className="h-2 bg-purple-600 rounded-full transition-all duration-300"
                  style={{ width: `${(step / 4) * 100}%` }}
                />
              </div>
            </div>

            {/* Incentive message */}
            <div className="mb-8 bg-purple-50 p-4 rounded-md">
              <p className="text-sm text-purple-700">
                Complete your taste profile to unlock 2 extra free menu scans! This helps us provide more accurate recommendations.
              </p>
            </div>

            {/* Show error message if any */}
            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
                {error}
              </div>
            )}

            {/* Step 1: Favorite Dishes */}
            {step === 1 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900">What are your favorite dishes?</h2>
                <p className="text-gray-500">List your favorite dishes (minimum 3).</p>
                
                {profile.favoriteDishes.map((dish, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={dish}
                      onChange={(e) => {
                        const newDishes = [...profile.favoriteDishes]
                        newDishes[index] = e.target.value
                        updateProfile({ favoriteDishes: newDishes })
                      }}
                      placeholder={`Favorite dish #${index + 1}`}
                      className="block flex-1 rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 text-gray-900 placeholder-gray-500"
                    />
                    {profile.favoriteDishes.length > 3 && (
                      <button
                        type="button"
                        onClick={() => {
                          const newDishes = profile.favoriteDishes.filter((_, i) => i !== index)
                          updateProfile({ favoriteDishes: newDishes })
                        }}
                        className="p-2 text-red-600 hover:text-red-800"
                        aria-label="Remove dish"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>
                ))}
                
                <button
                  type="button"
                  onClick={() => {
                    updateProfile({ favoriteDishes: [...profile.favoriteDishes, ''] })
                  }}
                  className="mt-2 inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="-ml-1 mr-2 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                  Add Another Dish
                </button>
              </div>
            )}

            {/* Step 2: Dislikes and Allergies */}
            {step === 2 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">What ingredients do you dislike?</h2>
                  <p className="text-gray-500">List ingredients you prefer to avoid (minimum 3).</p>
                  
                  {profile.dislikedIngredients.map((ingredient, index) => (
                    <div key={index} className="flex gap-2 mt-2">
                      <input
                        type="text"
                        value={ingredient}
                        onChange={(e) => {
                          const newIngredients = [...profile.dislikedIngredients]
                          newIngredients[index] = e.target.value
                          updateProfile({ dislikedIngredients: newIngredients })
                        }}
                        placeholder={`Disliked ingredient #${index + 1}`}
                        className="block flex-1 rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 text-gray-900 placeholder-gray-500"
                      />
                      {profile.dislikedIngredients.length > 3 && (
                        <button
                          type="button"
                          onClick={() => {
                            const newIngredients = profile.dislikedIngredients.filter((_, i) => i !== index)
                            updateProfile({ dislikedIngredients: newIngredients })
                          }}
                          className="p-2 text-red-600 hover:text-red-800"
                          aria-label="Remove ingredient"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      )}
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={() => {
                      updateProfile({ dislikedIngredients: [...profile.dislikedIngredients, ''] })
                    }}
                    className="mt-4 inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="-ml-1 mr-2 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                    Add Another Ingredient
                  </button>
                </div>

                <div className="mt-6">
                  <h2 className="text-xl font-semibold text-gray-900">Any allergies?</h2>
                  <p className="text-gray-500">List any food allergies we should know about.</p>
                  
                  {profile.allergies.map((allergy, index) => (
                    <input
                      key={index}
                      type="text"
                      value={allergy}
                      onChange={(e) => {
                        const newAllergies = [...profile.allergies]
                        newAllergies[index] = e.target.value
                        updateProfile({ allergies: newAllergies })
                      }}
                      placeholder="Enter allergy"
                      className="block w-full mt-2 rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 text-gray-900 placeholder-gray-500"
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Step 3: Dietary Restrictions */}
            {step === 3 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900">Dietary Restrictions</h2>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="none"
                      checked={Object.entries(profile.dietaryRestrictions).every(([key, value]) => key === 'other' ? !value : !value)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          updateProfile({
                            dietaryRestrictions: {
                              vegetarian: false,
                              vegan: false,
                              glutenFree: false,
                              dairyFree: false,
                              nutFree: false,
                              halal: false,
                              kosher: false,
                              other: ''
                            }
                          })
                        }
                      }}
                      className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                    />
                    <label htmlFor="none" className="ml-2 block text-sm text-gray-900">
                      None
                    </label>
                  </div>

                  {Object.entries(profile.dietaryRestrictions).map(([key, value]) => 
                    key !== 'other' ? (
                      <div key={key} className="flex items-center">
                        <input
                          type="checkbox"
                          id={key}
                          checked={!!value}
                          onChange={() => {
                            updateProfile({
                              dietaryRestrictions: {
                                ...profile.dietaryRestrictions,
                                [key]: !value
                              }
                            })
                          }}
                          className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                        />
                        <label htmlFor={key} className="ml-2 block text-sm text-gray-900 capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </label>
                      </div>
                    ) : null
                  )}
                  
                  <div className="mt-4">
                    <label htmlFor="other" className="block text-sm font-medium text-gray-700">
                      Other dietary restrictions
                    </label>
                    <input
                      type="text"
                      id="other"
                      value={profile.dietaryRestrictions.other}
                      onChange={(e) => {
                        updateProfile({
                          dietaryRestrictions: {
                            ...profile.dietaryRestrictions,
                            other: e.target.value
                          }
                        })
                      }}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 text-gray-900 placeholder-gray-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Preferences */}
            {step === 4 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Spice Preference</h2>
                  <select
                    value={profile.spicePreference}
                    onChange={(e) => updateProfile({ spicePreference: e.target.value as TasteProfile['spicePreference'] })}
                    className="mt-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 text-gray-900"
                  >
                    <option value="none">No spice</option>
                    <option value="mild">Mild</option>
                    <option value="medium">Medium</option>
                    <option value="hot">Hot</option>
                    <option value="very-hot">Very Hot</option>
                  </select>
                </div>

                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Taste Preferences</h2>
                  <p className="text-sm text-gray-500 mb-4">For each taste, indicate your preference.</p>
                  
                  <div className="space-y-4">
                    {Object.entries(profile.tastePreferences).map(([taste, preference]) => (
                      <div key={taste} className="flex flex-col">
                        <label className="block text-sm font-medium text-gray-700 capitalize mb-2">
                          {taste}
                        </label>
                        <div className="flex gap-4">
                          {['dislike', 'neutral', 'like'].map((option) => (
                            <label key={option} className="inline-flex items-center">
                              <input
                                type="radio"
                                checked={preference === option}
                                onChange={() => {
                                  updateProfile({
                                    tastePreferences: {
                                      ...profile.tastePreferences,
                                      [taste]: option as 'dislike' | 'neutral' | 'like'
                                    }
                                  })
                                }}
                                className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300"
                              />
                              <span className="ml-2 text-sm text-gray-900 capitalize">{option}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Favorite Cuisines</h2>
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    {CUISINE_OPTIONS.map((cuisine) => (
                      <label key={cuisine} className="inline-flex items-center">
                        <input
                          type="checkbox"
                          checked={profile.cuisinePreferences.includes(cuisine)}
                          onChange={(e) => {
                            const newPreferences = e.target.checked
                              ? [...profile.cuisinePreferences, cuisine]
                              : profile.cuisinePreferences.filter(c => c !== cuisine)
                            updateProfile({ cuisinePreferences: newPreferences })
                          }}
                          className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-900">{cuisine}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Additional Notes</h2>
                  <textarea
                    value={profile.additionalNotes}
                    onChange={(e) => updateProfile({ additionalNotes: e.target.value })}
                    rows={3}
                    className="mt-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 text-gray-900 placeholder-gray-500"
                    placeholder="Any other preferences we should know about?"
                  />
                </div>
              </div>
            )}

            {/* Navigation buttons */}
            <div className="mt-8 flex justify-between">
              {step > 1 && (
                <button
                  type="button"
                  onClick={() => setStep(step - 1)}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Previous
                </button>
              )}
              
              {step < 4 ? (
                <button
                  type="button"
                  onClick={() => setStep(step + 1)}
                  className="ml-auto inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700"
                >
                  Next
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="ml-auto inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700"
                >
                  Complete Profile
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 