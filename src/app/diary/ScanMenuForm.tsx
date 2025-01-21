'use client'

import { useState } from 'react'

interface ScanMenuFormProps {
  onSuccess: () => void
}

export default function ScanMenuForm({ onSuccess }: ScanMenuFormProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const menuFile = formData.get('menuFile') as File | null
    const mood = formData.get('mood') as string | null
    
    if (!menuFile) {
      alert('Please select a menu image')
      setLoading(false)
      return
    }

    if (!mood) {
      alert('Please enter what you are in the mood for')
      setLoading(false)
      return
    }

    try {
      // Create FormData for the upload
      const uploadData = new FormData()
      uploadData.append('menu', menuFile)
      uploadData.append('restaurantName', formData.get('restaurantName') as string || '')
      uploadData.append('mood', mood)

      const res = await fetch('/api/menu/upload', {
        method: 'POST',
        body: uploadData
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.message || 'Failed to scan menu')
      }

      onSuccess()
      setIsOpen(false)
      setPreview(null)
      e.currentTarget.reset()
    } catch (error) {
      console.error('Upload error details:', error)
      alert(error instanceof Error ? error.message : 'Failed to scan menu')
    } finally {
      setLoading(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Show preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    } else {
      setPreview(null)
    }
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="w-full p-4 text-center text-purple-600 font-medium hover:bg-purple-50 rounded-2xl border-2 border-dashed border-purple-200 transition-colors"
      >
        + Scan New Menu
      </button>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 shadow-sm space-y-4">
      <div>
        <label htmlFor="restaurantName" className="block text-sm font-medium text-gray-700 mb-1">
          Restaurant Name
        </label>
        <input
          type="text"
          name="restaurantName"
          id="restaurantName"
          className="w-full rounded-xl border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
          placeholder="Where are you eating?"
        />
      </div>

      <div>
        <label htmlFor="mood" className="block text-sm font-medium text-gray-700 mb-1">
          What are you in the mood for? *
        </label>
        <input
          type="text"
          name="mood"
          id="mood"
          required
          className="w-full rounded-xl border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
          placeholder="e.g., Something spicy, Comfort food, Light and healthy..."
        />
      </div>

      <div>
        <label htmlFor="menuFile" className="block text-sm font-medium text-gray-700 mb-1">
          Menu Image *
        </label>
        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-xl">
          <div className="space-y-1 text-center">
            {preview ? (
              <div className="relative max-w-full h-48 overflow-hidden rounded-lg">
                <img
                  src={preview}
                  alt="Menu preview"
                  className="object-contain w-full h-full"
                />
                <button
                  type="button"
                  onClick={() => {
                    setPreview(null)
                    const form = document.getElementById('uploadForm') as HTMLFormElement
                    if (form) form.reset()
                  }}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                >
                  ×
                </button>
              </div>
            ) : (
              <>
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  stroke="currentColor"
                  fill="none"
                  viewBox="0 0 48 48"
                  aria-hidden="true"
                >
                  <path
                    d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <div className="flex text-sm text-gray-600">
                  <label
                    htmlFor="menuFile"
                    className="relative cursor-pointer rounded-md font-medium text-purple-600 hover:text-purple-500"
                  >
                    <span>Upload a file</span>
                    <input
                      id="menuFile"
                      name="menuFile"
                      type="file"
                      accept="image/*"
                      className="sr-only"
                      onChange={handleFileChange}
                      required
                    />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-gray-500">PNG, JPG, WEBP up to 5MB</p>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-purple-600 text-white py-2 px-4 rounded-xl font-medium hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50"
        >
          {loading ? 'Scanning...' : 'Get Recommendations'}
        </button>
        <button
          type="button"
          onClick={() => {
            setIsOpen(false)
            setPreview(null)
          }}
          className="flex-1 bg-gray-50 text-gray-700 py-2 px-4 rounded-xl font-medium hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
        >
          Cancel
        </button>
      </div>
    </form>
  )
} 