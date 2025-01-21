import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import prisma from '@/lib/prisma'

export async function POST(req: Request) {
  try {
    const session = await getServerSession()

    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { menuId, ratings, feedback } = await req.json()

    if (!menuId || !ratings) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Get the menu upload to verify ownership
    const menuUpload = await prisma.menuUpload.findUnique({
      where: { id: menuId },
      select: {
        id: true,
        user: {
          select: {
            email: true
          }
        }
      }
    })

    if (!menuUpload || menuUpload.user.email !== session.user.email) {
      return NextResponse.json(
        { success: false, message: 'Menu not found or unauthorized' },
        { status: 404 }
      )
    }

    // Store the ratings
    const updatedMenu = await prisma.menuUpload.update({
      where: { id: menuId },
      data: {
        ratings: JSON.stringify(ratings),
        feedback: feedback || undefined
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        id: updatedMenu.id,
        ratings: JSON.parse(updatedMenu.ratings || '{}'),
        feedback: updatedMenu.feedback
      }
    })
  } catch (error) {
    console.error('Rating submission error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to submit ratings' },
      { status: 500 }
    )
  }
} 