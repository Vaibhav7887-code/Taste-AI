import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true }
    })

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      )
    }

    const visits = await prisma.restaurantVisit.findMany({
      where: { userId: user.id },
      orderBy: { visitDate: 'desc' },
      select: {
        id: true,
        restaurantName: true,
        visitDate: true,
        orderedDish: true,
        rating: true,
        notes: true,
        mood: true
      }
    })

    return NextResponse.json({
      success: true,
      visits
    })
  } catch (error) {
    console.error('Error fetching visits:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch visits' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true }
    })

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      )
    }

    const body = await req.json()
    const { restaurantName, orderedDish, rating, notes, mood, menuUploadId } = body

    if (!restaurantName || !orderedDish) {
      return NextResponse.json(
        { success: false, message: 'Restaurant name and ordered dish are required' },
        { status: 400 }
      )
    }

    const visit = await prisma.restaurantVisit.create({
      data: {
        userId: user.id,
        restaurantName,
        orderedDish,
        rating: rating || null,
        notes: notes || null,
        mood: mood || null,
        menuUploadId: menuUploadId || null
      }
    })

    return NextResponse.json({
      success: true,
      visit
    })
  } catch (error) {
    console.error('Error creating visit:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to create visit' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
} 