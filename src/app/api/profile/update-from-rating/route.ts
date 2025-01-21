import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import prisma from '@/lib/prisma'
import { analyzeDishForTasteProfile } from '@/lib/openai'

export async function POST(req: Request) {
  try {
    const session = await getServerSession()

    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { tasteProfile: true }
    })

    if (!user || !user.tasteProfile) {
      return NextResponse.json(
        { success: false, message: 'User or taste profile not found' },
        { status: 404 }
      )
    }

    const body = await req.json()
    const { dish, rating } = body

    if (!dish || !rating) {
      return NextResponse.json(
        { success: false, message: 'Dish and rating are required' },
        { status: 400 }
      )
    }

    // Analyze the dish and get profile updates
    const profileUpdates = await analyzeDishForTasteProfile(dish, rating, user.tasteProfile)

    // Update the taste profile
    const updatedProfile = await prisma.tasteProfile.update({
      where: { userId: user.id },
      data: profileUpdates
    })

    return NextResponse.json({
      success: true,
      data: updatedProfile
    })

  } catch (error) {
    console.error('Error updating taste profile:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to update taste profile' },
      { status: 500 }
    )
  }
} 