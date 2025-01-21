'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { ChevronDown, ChevronUp } from 'lucide-react'

interface MenuItem {
  name: string
  description?: string
  price?: string
  category?: string
}

interface MenuUpload {
  id: string
  restaurantName: string
  parsedText: string
  recommendations: string
  createdAt: string
  mood?: string
}

interface Recommendation {
  dishName: string
  score: number
  reason?: string
  explanation?: string
}

export default function MenuDetailPage() {
  const { id } = useParams()
  const { data: session } = useSession()
  const [menu, setMenu] = useState<MenuUpload | null>(null)
  const [loading, setLoading] = useState(true)
  const [expandedItems, setExpandedItems] = useState<string[]>([])

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const res = await fetch(`/api/menu/${id}`)
        if (!res.ok) throw new Error('Failed to fetch menu')
        const data = await res.json()
        setMenu(data)
      } catch (error) {
        console.error('Error fetching menu:', error)
      } finally {
        setLoading(false)
      }
    }

    if (session?.user) {
      fetchMenu()
    }
  }, [id, session])

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this menu scan?')) return

    try {
      const res = await fetch(`/api/menu/${id}`, {
        method: 'DELETE'
      })

      if (!res.ok) throw new Error('Failed to delete menu')
      
      // Redirect to diary page after successful deletion
      window.location.href = '/diary'
    } catch (error) {
      console.error('Error deleting menu:', error)
      alert('Failed to delete menu')
    }
  }

  if (loading) return <div>Loading...</div>
  if (!menu) return <div>Menu not found</div>

  let recommendations: Recommendation[] = []
  let menuItems: MenuItem[] = []
  try {
    if (menu.recommendations) {
      const parsed = JSON.parse(menu.recommendations)
      recommendations = Array.isArray(parsed) ? parsed : parsed.recommendations || []
    }
    if (menu.parsedText) {
      menuItems = JSON.parse(menu.parsedText)
    }
  } catch (error) {
    console.error('Failed to parse data:', error)
  }

  const toggleExpand = (dishName: string) => {
    setExpandedItems(prev =>
      prev.includes(dishName)
        ? prev.filter(item => item !== dishName)
        : [...prev, dishName]
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold mb-2">{menu.restaurantName || 'Menu Details'}</h1>
            <p className="text-sm text-gray-500">
              Scanned on {new Date(menu.createdAt).toLocaleDateString()}
            </p>
            {menu.mood && (
              <p className="text-gray-600 italic mt-2">Mood: {menu.mood}</p>
            )}
          </div>
          <button
            onClick={handleDelete}
            className="text-red-600 hover:text-red-700 font-medium"
          >
            Delete Menu
          </button>
        </div>
      </div>

      {/* Recommendations Section */}
      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Recommended Dishes</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {recommendations.map(rec => {
            const isExpanded = expandedItems.includes(rec.dishName)
            const menuItem = menuItems.find(item => item.name === rec.dishName)
            
            return (
              <div
                key={rec.dishName}
                className="bg-purple-50 rounded-xl shadow-sm p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-semibold flex-1">{rec.dishName}</h3>
                  <span className="text-purple-600 font-bold ml-2">
                    {rec.score}%
                  </span>
                </div>
                
                {menuItem && (
                  <div className="mt-2 text-sm text-gray-600">
                    <p>{menuItem.price}</p>
                    {menuItem.description && (
                      <p className="mt-1">{menuItem.description.replace(/\b(in|out):\s*/gi, '')}</p>
                    )}
                  </div>
                )}
                
                <button
                  onClick={() => toggleExpand(rec.dishName)}
                  className="w-full flex items-center justify-between text-sm text-gray-600 hover:text-gray-900 mt-3"
                >
                  <span>{isExpanded ? 'Hide details' : 'Show details'}</span>
                  {isExpanded ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </button>
                
                {isExpanded && (
                  <div className="mt-3 pt-3 border-t border-purple-100">
                    <p className="text-sm text-gray-600">
                      {rec.reason || rec.explanation || ''}
                    </p>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </section>

      {/* Menu Items Section */}
      <section className="bg-gray-50 rounded-xl p-6">
        <h2 className="text-xl font-semibold mb-4">All Menu Items</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {menuItems.map((item, index) => (
            <div key={index} className="bg-white rounded-lg p-4 shadow-sm">
              <h3 className="font-medium text-gray-900">{item.name}</h3>
              {item.price && (
                <p className="text-sm font-medium text-gray-700 mt-1">{item.price}</p>
              )}
              {item.description && (
                <p className="text-sm text-gray-600 mt-2">
                  {item.description.replace(/\b(in|out):\s*/gi, '')}
                </p>
              )}
              {item.category && (
                <p className="text-xs text-purple-600 mt-2">{item.category}</p>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  )
} 