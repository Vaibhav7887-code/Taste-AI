import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import prisma from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await req.json()
    const { status } = body

    if (!['COMPLETED', 'SKIPPED'].includes(status)) {
      return NextResponse.json(
        { message: 'Invalid status' },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true
      }
    })

    if (!user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      )
    }

    // Update onboarding status and free scan count if completed
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        onboardingStatus: status,
        ...(status === 'COMPLETED' && {
          freeScanCount: {
            increment: 2 // Add 2 free scans for completing onboarding
          }
        }),
        ...(status === 'SKIPPED' && {
          freeScanCount: {
            increment: 1 // Add 1 free scan for skipping onboarding
          }
        })
      },
      select: {
        onboardingStatus: true,
        freeScanCount: true
      }
    })

    return NextResponse.json({
      data: {
        onboardingStatus: updatedUser.onboardingStatus,
        freeScanCount: updatedUser.freeScanCount
      }
    })
  } catch (error) {
    console.error('Error updating onboarding status:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
} 