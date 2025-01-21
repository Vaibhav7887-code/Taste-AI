import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import prisma from '@/lib/prisma'

export async function GET(req: NextRequest) {
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
      select: {
        id: true,
        onboardingStatus: true,
        freeScanCount: true,
        emailVerified: true
      }
    })

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      )
    }

    console.log('API - User onboarding data:', {
      id: user.id,
      onboardingStatus: user.onboardingStatus,
      freeScanCount: user.freeScanCount,
      emailVerified: user.emailVerified
    })

    return NextResponse.json({
      success: true,
      data: {
        onboardingStatus: user.onboardingStatus || 'NOT_STARTED',
        freeScanCount: user.freeScanCount || 0,
        emailVerified: user.emailVerified
      }
    })
  } catch (error) {
    console.error('Error checking onboarding status:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
} 