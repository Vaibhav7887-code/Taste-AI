import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { Resend } from 'resend'
import prisma from '@/lib/prisma'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()

    if (!email) {
      return NextResponse.json(
        { success: false, message: 'Email is required' },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        emailVerified: true
      }
    })

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      )
    }

    if (user.emailVerified) {
      return NextResponse.json(
        { success: false, message: 'Email is already verified' },
        { status: 400 }
      )
    }

    // Generate new verification token
    const token = jwt.sign(
      { email: user.email },
      process.env.NEXTAUTH_SECRET!,
      { expiresIn: '1d' }
    )

    // Create verification URL
    const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/verify?token=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}`

    try {
      const emailResult = await resend.emails.send({
        from: 'Taste Palette Explorer <onboarding@resend.dev>',
        to: user.email,
        subject: 'Verify your email address',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #6B46C1; text-align: center;">Verify your email address</h1>
            <p>Click the button below to verify your email address:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationUrl}" 
                 style="background-color: #6B46C1; color: white; padding: 12px 24px; 
                        text-decoration: none; border-radius: 5px; display: inline-block;">
                Verify Email
              </a>
            </div>
            <p style="color: #666; font-size: 14px;">
              Or copy and paste this link in your browser:
            </p>
            <p style="word-break: break-all; color: #4f46e5;">${verificationUrl}</p>
            <p style="color: #666; font-size: 14px;">This link will expire in 24 hours.</p>
          </div>
        `
      })
      console.log('Verification email sent:', emailResult)

      return NextResponse.json(
        { success: true, message: 'Verification email sent successfully' },
        { status: 200 }
      )
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError)
      return NextResponse.json(
        { success: false, message: 'Failed to send verification email' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Resend verification error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to send verification email' },
      { status: 500 }
    )
  }
} 