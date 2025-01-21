import { PrismaClient } from '@prisma/client'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

const prisma = new PrismaClient()

const updateProfileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  currentPassword: z.string().optional(),
  newPassword: z.string().min(6, 'New password must be at least 6 characters').optional(),
})

export async function PUT(req: Request) {
  try {
    const session = await getServerSession()
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await req.json()
    const result = updateProfileSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json(
        { 
          message: 'Validation failed',
          errors: result.error.errors
        },
        { status: 422 }
      )
    }

    const { name, currentPassword, newPassword } = result.data

    // Get current user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        password: true
      }
    })

    if (!user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      )
    }

    // If changing password, verify current password
    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json(
          { message: 'Current password is required to set new password' },
          { status: 400 }
        )
      }

      const isValidPassword = await bcrypt.compare(currentPassword, user.password)
      if (!isValidPassword) {
        return NextResponse.json(
          { message: 'Current password is incorrect' },
          { status: 400 }
        )
      }
    }

    // Update user
    const updateData: any = { name }
    if (newPassword) {
      updateData.password = await bcrypt.hash(newPassword, 10)
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        plan: true,
      }
    })

    return NextResponse.json({
      message: 'Profile updated successfully',
      user: updatedUser
    })

  } catch (error) {
    console.error('Profile update error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
} 