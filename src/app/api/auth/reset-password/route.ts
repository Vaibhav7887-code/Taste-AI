import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import crypto from 'crypto'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: Request) {
  try {
    const { email } = await req.json()

    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true
      }
    })

    if (!user) {
      // Return success even if user doesn't exist to prevent email enumeration
      return NextResponse.json({
        success: true,
        message: 'If your email is registered, you will receive reset instructions.'
      })
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex')
    const resetTokenExpiry = new Date(Date.now() + 3600000) // 1 hour from now

    // Save reset token to user
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExpiry
      },
      select: {
        id: true
      }
    })

    // Send reset email
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${resetToken}`
    
    await resend.emails.send({
      from: 'Taste Palette <noreply@tastepalette.app>',
      to: email,
      subject: 'Reset Your Password',
      html: `
        <h1>Reset Your Password</h1>
        <p>Click the link below to reset your password. This link will expire in 1 hour.</p>
        <a href="${resetUrl}">Reset Password</a>
        <p>If you didn't request this, please ignore this email.</p>
      `
    })

    return NextResponse.json({
      success: true,
      message: 'If your email is registered, you will receive reset instructions.'
    })
  } catch (error) {
    console.error('Password reset error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to process password reset' },
      { status: 500 }
    )
  }
} 