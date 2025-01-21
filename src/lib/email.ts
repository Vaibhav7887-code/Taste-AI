import nodemailer from 'nodemailer'

// Check if required environment variables are set
const requiredEnvVars = [
  'EMAIL_SERVER_HOST',
  'EMAIL_SERVER_PORT',
  'EMAIL_SERVER_USER',
  'EMAIL_SERVER_PASSWORD',
  'EMAIL_FROM',
  'NEXTAUTH_URL'
]

const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName])
if (missingEnvVars.length > 0) {
  console.warn('Missing email configuration:', missingEnvVars.join(', '))
}

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_SERVER_HOST,
  port: Number(process.env.EMAIL_SERVER_PORT),
  auth: {
    user: process.env.EMAIL_SERVER_USER,
    pass: process.env.EMAIL_SERVER_PASSWORD,
  },
  secure: true,
})

export async function sendVerificationEmail(email: string, token: string) {
  if (missingEnvVars.length > 0) {
    console.warn('Skipping email send due to missing configuration')
    return
  }

  try {
    // Verify SMTP connection
    await transporter.verify()
    
    const verificationUrl = `${process.env.NEXTAUTH_URL}/verify?token=${token}`

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: 'Verify your email address',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #6B46C1; text-align: center;">Welcome to Taste Palette Explorer!</h1>
          <p>Please verify your email address by clicking the button below:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" 
               style="background-color: #6B46C1; color: white; padding: 12px 24px; 
                      text-decoration: none; border-radius: 5px; display: inline-block;">
              Verify Email
            </a>
          </div>
          <p style="color: #666; font-size: 14px;">
            If you didn't create an account with us, you can safely ignore this email.
          </p>
          <p style="color: #666; font-size: 14px;">
            Or copy and paste this link into your browser:<br>
            ${verificationUrl}
          </p>
        </div>
      `,
      text: `Welcome to Taste Palette Explorer!\n\nPlease verify your email address by clicking this link: ${verificationUrl}\n\nIf you didn't create an account with us, you can safely ignore this email.`,
    }

    const info = await transporter.sendMail(mailOptions)
    console.log('Verification email sent:', info.messageId)
    return info
  } catch (error) {
    console.error('Failed to send verification email:', error)
    throw new Error('Failed to send verification email. Please try again later.')
  }
} 