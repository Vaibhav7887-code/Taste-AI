import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import prisma from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ valid: false })
    }

    // Check if user still exists in database
    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    })

    return NextResponse.json({
      valid: !!user
    })
  } catch (error) {
    console.error('Error checking session:', error)
    return NextResponse.json(
      { valid: false },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
} 