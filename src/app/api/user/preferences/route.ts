import { PrismaClient } from '@prisma/client'
import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { authOptions } from '../../auth/[...nextauth]/route'

const prisma = new PrismaClient()

const preferencesSchema = z.object({
  tasteProfile: z.object({
    favoriteDishes: z.array(z.string()),
    dislikedIngredients: z.array(z.string()),
    dietaryRestrictions: z.object({
      vegetarian: z.boolean(),
      vegan: z.boolean(),
      glutenFree: z.boolean(),
      dairyFree: z.boolean(),
      nutFree: z.boolean(),
    }),
  }),
})

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const body = await req.json()
    const { tasteProfile } = preferencesSchema.parse(body)

    // Update user's taste profile
    await prisma.user.update({
      where: { email: session.user.email },
      data: { tasteProfile },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error saving preferences:', error)
    if (error instanceof z.ZodError) {
      return new NextResponse('Invalid request data', { status: 422 })
    }
    return new NextResponse('Internal error', { status: 500 })
  }
} 