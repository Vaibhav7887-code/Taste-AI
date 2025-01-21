import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import prisma from '@/lib/prisma'

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await req.json()
    const { reason } = body

    if (!reason) {
      return NextResponse.json(
        { success: false, message: 'Deletion reason is required' },
        { status: 400 }
      )
    }

    // Get the user to verify they exist
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

    // Store deletion reason if provided
    console.log('Account deletion reason:', { userId: user.id, reason })

    // Delete user's data in this order to handle foreign key constraints
    await prisma.$transaction([
      // Delete taste profile
      prisma.tasteProfile.deleteMany({
        where: { userId: user.id }
      }),
      // Delete menu uploads
      prisma.menuUpload.deleteMany({
        where: { userId: user.id }
      }),
      // Delete ratings
      prisma.rating.deleteMany({
        where: { userId: user.id }
      }),
      // Delete restaurant visits
      prisma.restaurantVisit.deleteMany({
        where: { userId: user.id }
      }),
      // Delete sessions
      prisma.session.deleteMany({
        where: { userId: user.id }
      }),
      // Delete accounts
      prisma.account.deleteMany({
        where: { userId: user.id }
      }),
      // Finally, delete the user
      prisma.user.delete({
        where: { id: user.id }
      })
    ])

    return NextResponse.json({
      success: true,
      message: 'Account deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting account:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to delete account. Please try again.' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
} 