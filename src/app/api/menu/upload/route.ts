import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import prisma from '@/lib/prisma'
import { scanMenuImage, getRecommendations } from '@/lib/openai'

export async function POST(req: Request) {
  try {
    const session = await getServerSession()

    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        plan: true,
        freeScanCount: true,
        uploadsThisWeek: true,
        tasteProfile: true
      }
    })

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      )
    }

    if (user.plan === 'FREE' && user.freeScanCount <= 0) {
      return NextResponse.json(
        { success: false, message: 'No free scans remaining. Please upgrade your plan.' },
        { status: 403 }
      )
    }

    if (user.plan !== 'FREE') {
      const weeklyLimit = user.plan === 'PREMIUM' ? Infinity : user.plan === 'STANDARD' ? 7 : 1
      if (user.uploadsThisWeek >= weeklyLimit) {
        return NextResponse.json(
          { success: false, message: 'Weekly upload limit reached' },
          { status: 403 }
        )
      }
    }

    const formData = await req.formData()
    const menuFile = formData.get('menu') as File | null
    const mood = formData.get('mood') as string | null
    const restaurantName = formData.get('restaurantName') as string | null

    if (!menuFile) {
      return NextResponse.json(
        { success: false, message: 'No menu file provided' },
        { status: 400 }
      )
    }

    // Validate file type
    if (!menuFile.type.startsWith('image/')) {
      return NextResponse.json(
        { success: false, message: 'Invalid file type. Please upload an image.' },
        { status: 400 }
      )
    }

    // Validate file size (5MB limit)
    if (menuFile.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, message: 'File too large. Maximum size is 5MB.' },
        { status: 400 }
      )
    }

    // Convert image to base64
    const buffer = await menuFile.arrayBuffer()
    const base64Image = Buffer.from(buffer).toString('base64')
    const mimeType = menuFile.type
    const dataUrl = `data:${mimeType};base64,${base64Image}`

    // Process menu image
    const menuItems = await scanMenuImage(dataUrl)
    
    // Get personalized recommendations if taste profile exists
    let recommendations: any[] = []
    if (user.tasteProfile) {
      recommendations = await getRecommendations(menuItems, user.tasteProfile, mood || undefined)
    }

    // Save to database
    const upload = await prisma.menuUpload.create({
      data: {
        userId: user.id,
        parsedText: JSON.stringify(menuItems),
        recommendations: JSON.stringify(recommendations),
        restaurantName,
        mood: mood || undefined,
      }
    })

    // Update user's scan count and weekly uploads
    await prisma.user.update({
      where: { id: user.id },
      data: {
        freeScanCount: user.plan === 'FREE' ? user.freeScanCount - 1 : user.freeScanCount,
        uploadsThisWeek: user.uploadsThisWeek + 1
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        id: upload.id,
        restaurantName,
        parsedText: JSON.stringify(menuItems),
        recommendations: JSON.stringify(recommendations),
        mood,
        createdAt: upload.createdAt
      }
    })

  } catch (error) {
    console.error('Menu upload error:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: error instanceof Error 
          ? error.message 
          : 'Failed to process menu. Please try again.'
      },
      { status: 500 }
    )
  }
} 