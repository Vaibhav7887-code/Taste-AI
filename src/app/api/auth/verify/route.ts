import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const token = req.nextUrl.searchParams.get('token')

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Missing verification token' },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { verificationToken: token },
      select: {
        id: true,
        verificationToken: true,
        emailVerified: true
      }
    })

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Invalid verification token' },
        { status: 400 }
      )
    }

    if (user.emailVerified) {
      return NextResponse.json(
        { success: true, message: 'Email already verified' },
        { status: 200 }
      )
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: new Date(),
        verificationToken: null
      }
    })

    return NextResponse.json(
      { success: true, message: 'Email verified successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Verification error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to verify email' },
      { status: 500 }
    )
  }
} 