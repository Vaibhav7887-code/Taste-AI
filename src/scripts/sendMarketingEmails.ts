import { PrismaClient } from '@prisma/client'
import nodemailer from 'nodemailer'
import prisma from '@/lib/prisma'

interface User {
  email: string
  name: string
}

async function createTransporter() {
  return nodemailer.createTransport({
    host: process.env.EMAIL_SERVER_HOST,
    port: parseInt(process.env.EMAIL_SERVER_PORT || '587'),
    secure: process.env.EMAIL_SERVER_PORT === '465',
    auth: {
      user: process.env.EMAIL_SERVER_USER,
      pass: process.env.EMAIL_SERVER_PASSWORD,
    },
  })
}

async function sendMarketingEmail(email: string, name: string) {
  const transporter = await createTransporter()

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: 'Discover New Dishes with Taste Palette Explorer',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #6B46C1;">Hello ${name}!</h1>
        
        <p>We hope you're enjoying your experience with Taste Palette Explorer!</p>
        
        <p>Have you tried our latest features?</p>
        <ul>
          <li>Upload menus and get personalized recommendations</li>
          <li>Rate dishes to improve future suggestions</li>
          <li>Discover new cuisines based on your taste profile</li>
        </ul>
        
        <p>Visit your dashboard to explore more:</p>
        <a href="${process.env.NEXTAUTH_URL}/dashboard" 
           style="display: inline-block; background-color: #6B46C1; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
          Go to Dashboard
        </a>
        
        <p style="margin-top: 20px; font-size: 12px; color: #666;">
          If you no longer wish to receive these emails, you can update your preferences in your account settings.
        </p>
      </div>
    `,
  }

  try {
    await transporter.sendMail(mailOptions)
    console.log(`Marketing email sent to ${email}`)
  } catch (error) {
    console.error(`Failed to send marketing email to ${email}:`, error)
  }
}

export async function sendMarketingEmails() {
  try {
    // Get all users with verified emails
    const users = await prisma.user.findMany({
      where: {
        emailVerified: {
          not: null
        }
      },
      select: {
        id: true,
        email: true,
        name: true
      }
    })

    console.log(`Found ${users.length} users with verified emails`)

    // Send emails in batches to avoid overwhelming the email server
    const batchSize = 10
    for (let i = 0; i < users.length; i += batchSize) {
      const batch = users.slice(i, i + batchSize)
      await Promise.all(
        batch.map((user: User) => sendMarketingEmail(user.email, user.name))
      )
      // Wait a bit between batches
      if (i + batchSize < users.length) {
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    }

    console.log('Marketing email campaign completed')
  } catch (error) {
    console.error('Error sending marketing emails:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the script if called directly
if (import.meta.url === new URL(import.meta.url).href) {
  sendMarketingEmails()
} 