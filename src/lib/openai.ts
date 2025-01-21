import OpenAI from 'openai'
import prisma from './prisma'

interface MenuItem {
  name: string
  description?: string
  price?: string
  category?: string
}

interface Recommendation {
  dish: string
  score: number
  reason: string
}

interface TasteProfile {
  favoriteDishes: string[]
  dislikedIngredients: string[]
  dietaryRestrictions: {
    vegetarian?: boolean
    vegan?: boolean
    glutenFree?: boolean
    dairyFree?: boolean
    nutFree?: boolean
    shellfish?: boolean
    kosher?: boolean
    halal?: boolean
  }
  spicePreference: string
  tastePreferences: {
    sweet: number
    salty: number
    sour: number
    bitter: number
    umami: number
  }
  cuisinePreferences: string[]
  allergies: string[]
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function scanMenuImage(imageData: string): Promise<MenuItem[]> {
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'OpenAI-Beta': 'assistants=v1'
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant that extracts menu items from images. Return only valid JSON arrays.'
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Extract menu items from this image. Return a JSON array where each item has this format:\n{\n  "name": "Item name",\n  "description": "Item description if available",\n  "price": "Price if available",\n  "category": "Category if available"\n}\n\nOnly include items that are clearly menu items with names. Skip any headers, footers, or other text.'
              },
              {
                type: 'image_url',
                image_url: {
                  url: imageData,
                  detail: 'high'
                }
              }
            ]
          }
        ],
        max_tokens: 4096
      })
    })

    if (!response.ok) {
      const error = await response.json()
      console.error('OpenAI API error:', error)
      throw new Error(error.error?.message || 'Failed to scan menu')
    }

    const result = await response.json()
    if (!result?.choices?.[0]?.message?.content) {
      console.error('Invalid response structure:', result)
      throw new Error('No menu items extracted')
    }

    const content = result.choices[0].message.content.trim()
    if (!content) {
      throw new Error('Empty response from OpenAI')
    }

    let jsonStr = content
    // Remove code block markers if present
    if (jsonStr.includes('```json')) {
      jsonStr = jsonStr.replace(/```json\n?|\n?```/g, '')
    }
    if (jsonStr.includes('```')) {
      jsonStr = jsonStr.replace(/```\n?|\n?```/g, '')
    }
    
    jsonStr = jsonStr.trim()
    
    // Ensure it's a valid JSON array
    if (!jsonStr.startsWith('[') || !jsonStr.endsWith(']')) {
      console.error('Invalid JSON structure:', jsonStr)
      throw new Error('Response is not a JSON array')
    }

    const menuItems = JSON.parse(jsonStr)
    if (!Array.isArray(menuItems)) {
      console.error('Parsed result is not an array:', menuItems)
      throw new Error('Invalid response format')
    }

    if (menuItems.length === 0) {
      throw new Error('No menu items found in the image')
    }

    return menuItems
  } catch (error) {
    console.error('Complete scan error:', error)
    throw error instanceof Error ? error : new Error('Failed to process menu')
  }
}

export async function getRecommendations(
  menuItems: MenuItem[],
  tasteProfile: TasteProfile,
  mood?: string
): Promise<Recommendation[]> {
  const prompt = `Given a user's taste profile and menu items, recommend dishes they would enjoy.
Return a JSON object with a 'recommendations' array. Each recommendation should have this format:
{
  "dishName": "Name of the dish",
  "score": 85, // A whole number from 0-100 indicating the match percentage
  "reason": "Detailed explanation of why this dish matches their preferences. Include specific details about ingredients, cooking methods, and how it aligns with their taste profile. If relevant, mention how it matches their current mood."
}

User's taste profile:
${JSON.stringify(tasteProfile, null, 2)}

Menu items:
${JSON.stringify(menuItems, null, 2)}

${mood ? `The user is in the mood for: ${mood}` : ''}

Please provide:
1. Detailed explanations that help the user understand why each dish was recommended
2. Scores as whole numbers from 0-100 (no decimals)
3. At least 3 recommendations if possible
4. Consider dietary restrictions as hard constraints
5. Factor in their mood if specified

Return format should be:
{
  "recommendations": [
    { "dishName": "...", "score": 90, "reason": "..." },
    ...
  ]
}`

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content:
          'You are a helpful assistant that provides personalized menu recommendations based on taste preferences. Always return scores as whole numbers from 0-100 and format the response as a JSON object with a recommendations array.',
      },
      {
        role: 'user',
        content: prompt,
      },
    ],
    temperature: 0.7,
    response_format: { type: 'json_object' },
  })

  const content = response.choices[0].message.content
  if (!content) {
    throw new Error('No recommendations generated')
  }

  try {
    const parsed = JSON.parse(content)
    if (!parsed.recommendations || !Array.isArray(parsed.recommendations)) {
      console.error('Invalid recommendations format:', parsed)
      throw new Error('Invalid recommendations format')
    }

    // Validate and normalize each recommendation
    return parsed.recommendations.map((rec: any) => {
      if (!rec.dishName || typeof rec.score === 'undefined') {
        console.error('Invalid recommendation format:', rec)
        throw new Error('Invalid recommendation format')
      }

      return {
        dishName: rec.dishName,
        score: Math.round(typeof rec.score === 'number' ? (rec.score > 1 ? rec.score : rec.score * 100) : 0),
        reason: rec.reason || rec.explanation || ''
      }
    })
  } catch (error) {
    console.error('Failed to parse recommendations:', error)
    throw new Error('Failed to parse recommendations')
  }
}

export async function analyzeDishForTasteProfile(
  dish: string,
  rating: number,
  currentProfile: TasteProfile
): Promise<Partial<TasteProfile>> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a culinary expert analyzing dishes to understand taste preferences."
        },
        {
          role: "user",
          content: `Given this dish: "${dish}"
          And this rating: ${rating} (out of 5)
          And the current taste profile: ${JSON.stringify(currentProfile)}
          
          Analyze how this rating should affect the taste profile. Consider:
          1. The flavor components of the dish (spicy, sweet, salty, etc.)
          2. Any dietary preferences that might be relevant
          3. The strength of the rating (positive or negative)
          
          Return only the fields that should be updated as a JSON object.`
        }
      ],
      max_tokens: 500,
    })

    const updates = JSON.parse(response.choices[0].message.content || '{}')
    return updates
  } catch (error) {
    console.error('Error analyzing dish:', error)
    throw new Error('Failed to analyze dish preferences')
  }
} 