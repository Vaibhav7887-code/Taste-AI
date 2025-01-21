import { resetWeeklyUploads } from './resetUploads.js'
import { sendMarketingEmails } from './sendMarketingEmails.js'

async function runMaintenance() {
  console.log('Starting maintenance tasks...')

  try {
    // Reset weekly upload counts
    console.log('\n=== Resetting Weekly Upload Counts ===')
    await resetWeeklyUploads()

    // Send marketing emails
    console.log('\n=== Sending Marketing Emails ===')
    await sendMarketingEmails()

    console.log('\nMaintenance tasks completed successfully')
  } catch (error) {
    console.error('Error during maintenance:', error)
    process.exit(1)
  }
}

// Run the script if called directly
if (import.meta.url === new URL(import.meta.url).href) {
  runMaintenance()
} 