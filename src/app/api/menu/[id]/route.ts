import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import prisma from '@/lib/prisma'

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession()

    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const menu = await prisma.menuUpload.findUnique({
      where: {
        id: params.id,
        user: {
          email: session.user.email
        }
      }
    })

    if (!menu) {
      return NextResponse.json(
        { success: false, message: 'Menu not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(menu)
  } catch (error) {
    console.error('Error fetching menu:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch menu' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession()

    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      )
    }

    // First check if the menu belongs to the user
    const menu = await prisma.menuUpload.findUnique({
      where: {
        id: params.id,
        user: {
          email: session.user.email
        }
      }
    })

    if (!menu) {
      return NextResponse.json(
        { success: false, message: 'Menu not found' },
        { status: 404 }
      )
    }

    // Delete the menu
    await prisma.menuUpload.delete({
      where: {
        id: params.id
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting menu:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to delete menu' },
      { status: 500 }
    )
  }
} 