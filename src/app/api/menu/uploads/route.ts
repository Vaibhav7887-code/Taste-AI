import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import prisma from '@/lib/prisma'

interface MenuUploadRaw {
  id: string
  imageUrl: string
  createdAt: Date
  parsedText: string
  recommendations: string
  restaurantName: string | null
  mood: string | null
}

interface MenuUpload {
  id: string
  imageUrl: string
  createdAt: Date
  parsedText: string[]
  recommendations: any[]
  restaurantName: string
  mood: string
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true }
    })

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      )
    }

    const uploads = await prisma.menuUpload.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        imageUrl: true,
        createdAt: true,
        parsedText: true,
        recommendations: true,
        restaurantName: true,
        mood: true
      }
    })

    const formattedUploads = uploads.map((upload: MenuUploadRaw) => ({
      id: upload.id,
      imageUrl: upload.imageUrl,
      createdAt: upload.createdAt,
      parsedText: JSON.parse(upload.parsedText || '[]'),
      recommendations: JSON.parse(upload.recommendations || '[]'),
      restaurantName: upload.restaurantName || '',
      mood: upload.mood || ''
    }))

    return NextResponse.json({ 
      success: true,
      uploads: formattedUploads 
    })
  } catch (error) {
    console.error('Error fetching uploads:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch uploads' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
} 