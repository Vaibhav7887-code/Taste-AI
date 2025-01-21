export interface TasteProfile {
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
    other: string
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