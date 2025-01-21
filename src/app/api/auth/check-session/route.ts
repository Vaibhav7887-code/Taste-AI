import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getToken } from 'next-auth/jwt'

const prisma = new PrismaClient()

export async function GET(req: NextRequest) {
  try {
    const token = await getToken({ req })
    
    if (!token?.id) {
      return NextResponse.json({ valid: false }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: token.id }
    })

    if (!user) {
      return NextResponse.json({ valid: false }, { status: 404 })
    }

    return NextResponse.json({
      valid: true,
      onboardingStatus: user.onboardingStatus
    })
  } catch (error) {
    console.error('Session check error:', error)
    return NextResponse.json({ valid: false }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
} 