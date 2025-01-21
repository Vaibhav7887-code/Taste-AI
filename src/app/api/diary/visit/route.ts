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

    const body = await req.json()
    const { menuUploadId, restaurantName, orderedDish, rating, notes } = body

    // Create restaurant visit
    const visit = await prisma.restaurantVisit.create({
      data: {
        userId: user.id,
        menuUploadId,
        restaurantName: restaurantName || 'Unknown Restaurant',
        orderedDish,
        rating,
        notes
      }
    })

    // Update taste profile if rating is provided
    if (rating && user.tasteProfile) {
      try {
        const profileUpdates = await analyzeDishForTasteProfile(orderedDish, rating, user.tasteProfile)
        
        await prisma.tasteProfile.update({
          where: { userId: user.id },
          data: profileUpdates
        })
      } catch (error) {
        console.error('Failed to update taste profile:', error)
        // Don't fail the request if taste profile update fails
      }
    }

    return NextResponse.json({
      success: true,
      data: visit
    })

  } catch (error) {
    console.error('Error saving restaurant visit:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to save restaurant visit' },
      { status: 500 }
    )
  }
} 