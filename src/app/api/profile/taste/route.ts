import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import prisma from '@/lib/prisma'
import type { TasteProfile } from '@/types/taste-profile'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get user with taste profile
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        tasteProfile: true
      }
    })

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      )
    }

    // Return empty profile if not found
    if (!user.tasteProfile) {
      return NextResponse.json({
        success: true,
        data: {
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
      })
    }

    return NextResponse.json({
      success: true,
      data: {
        favoriteDishes: JSON.parse(user.tasteProfile.favoriteDishes),
        dislikedIngredients: JSON.parse(user.tasteProfile.dislikedIngredients),
        dietaryRestrictions: JSON.parse(user.tasteProfile.dietaryRestrictions),
        spicePreference: user.tasteProfile.spicePreference,
        cuisinePreferences: JSON.parse(user.tasteProfile.cuisinePreferences),
        allergies: JSON.parse(user.tasteProfile.allergies),
        additionalNotes: user.tasteProfile.additionalNotes,
        tastePreferences: JSON.parse(user.tasteProfile.tastePreferences)
      }
    })
  } catch (error) {
    console.error('Error fetching taste profile:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const profile: TasteProfile = await req.json()

    // Create or update taste profile
    const tasteProfile = await prisma.tasteProfile.upsert({
      where: { userId: session.user.id },
      create: {
        userId: session.user.id,
        favoriteDishes: JSON.stringify(profile.favoriteDishes.filter(Boolean)),
        dislikedIngredients: JSON.stringify(profile.dislikedIngredients.filter(Boolean)),
        dietaryRestrictions: JSON.stringify(profile.dietaryRestrictions),
        spicePreference: profile.spicePreference,
        tastePreferences: JSON.stringify(profile.tastePreferences),
        cuisinePreferences: JSON.stringify(profile.cuisinePreferences),
        allergies: JSON.stringify(profile.allergies.filter(Boolean)),
        additionalNotes: profile.additionalNotes
      },
      update: {
        favoriteDishes: JSON.stringify(profile.favoriteDishes.filter(Boolean)),
        dislikedIngredients: JSON.stringify(profile.dislikedIngredients.filter(Boolean)),
        dietaryRestrictions: JSON.stringify(profile.dietaryRestrictions),
        spicePreference: profile.spicePreference,
        tastePreferences: JSON.stringify(profile.tastePreferences),
        cuisinePreferences: JSON.stringify(profile.cuisinePreferences),
        allergies: JSON.stringify(profile.allergies.filter(Boolean)),
        additionalNotes: profile.additionalNotes
      }
    })

    return NextResponse.json({
      success: true,
      data: tasteProfile
    })
  } catch (error) {
    console.error('Error saving taste profile:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
} 