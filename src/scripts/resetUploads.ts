import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

interface UserWithId {
  id: string
}

export async function resetWeeklyUploads() {
  try {
    const oneWeekAgo = new Date()
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)

    // Find users whose upload count needs to be reset
    const usersToReset = await prisma.user.findMany({
      where: {
        lastUploadReset: {
          lt: oneWeekAgo
        },
        uploadsThisWeek: {
          gt: 0
        }
      }
    })

    console.log(`Found ${usersToReset.length} users to reset`)

    // Reset upload counts in batches
    const batchSize = 100
    for (let i = 0; i < usersToReset.length; i += batchSize) {
      const batch = usersToReset.slice(i, i + batchSize)
      
      await prisma.user.updateMany({
        where: {
          id: {
            in: batch.map((user: UserWithId) => user.id)
          }
        },
        data: {
          uploadsThisWeek: 0,
          lastUploadReset: new Date()
        }
      })

      console.log(`Reset ${batch.length} users (batch ${Math.floor(i / batchSize) + 1})`)
    }

    console.log('Weekly upload count reset completed')
  } catch (error) {
    console.error('Error resetting upload counts:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the script if called directly
if (import.meta.url === new URL(import.meta.url).href) {
  resetWeeklyUploads()
} 