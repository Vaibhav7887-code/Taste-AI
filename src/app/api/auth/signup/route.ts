import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { Resend } from 'resend'
import { generateVerificationToken } from '@/lib/tokens'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: NextRequest) {
  try {
    const { email, password, name } = await req.json()

    if (!email || !password || !name) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { success: false, message: 'Email already registered' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Generate verification token
    const verificationToken = generateVerificationToken()

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        verificationToken,
        emailVerified: null,
      }
    })

    // Send verification email
    const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/verify?token=${verificationToken}`

    try {
      const emailResult = await resend.emails.send({
        from: 'Taste Palette Explorer <onboarding@resend.dev>',
        to: email,
        subject: 'Welcome to Taste Palette Explorer - Verify Your Email',
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
              <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
              <title>Verify your email address</title>
            </head>
            <body style="background-color: #f6f9fc; padding: 40px 0;">
              <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); padding: 40px;">
                <div style="text-align: center; margin-bottom: 30px;">
                  <h1 style="color: #6B46C1; margin: 0; font-size: 24px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
                    Welcome to Taste Palette Explorer!
                  </h1>
                </div>
                
                <div style="color: #4a5568; font-size: 16px; line-height: 24px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
                  <p>Hi ${name},</p>
                  <p>Thanks for signing up! We're excited to help you discover amazing dishes that match your taste preferences.</p>
                  <p>Please verify your email address to get started:</p>
                </div>

                <div style="text-align: center; margin: 40px 0;">
                  <a href="${verificationUrl}" 
                     style="background-color: #6B46C1; color: white; padding: 12px 30px; 
                            text-decoration: none; border-radius: 5px; font-weight: 600;
                            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
                            display: inline-block;">
                    Verify Email Address
                  </a>
                </div>

                <div style="color: #718096; font-size: 14px; line-height: 24px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
                  <p>Or copy and paste this URL into your browser:</p>
                  <p style="word-break: break-all; color: #6B46C1;">${verificationUrl}</p>
                  
                  <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;">
                  
                  <p style="color: #a0aec0; font-size: 12px;">
                    If you didn't create an account with us, you can safely ignore this email.<br>
                    This link will expire in 24 hours.
                  </p>
                </div>
              </div>
            </body>
          </html>
        `
      })
      console.log('Verification email sent:', emailResult)
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError)
      // Don't fail the signup if email fails, but log it
    }

    return NextResponse.json({
      success: true,
      message: 'Verification email sent'
    })
  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to create account' },
      { status: 500 }
    )
  }
} 