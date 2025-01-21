import { resetWeeklyUploads } from './resetUploads.js'
import { sendMarketingEmails } from './sendMarketingEmails.js'
import cron from 'node-cron'

// Schedule weekly upload reset for every Monday at 00:00
cron.schedule('0 0 * * 1', async () => {
  console.log('Running weekly upload reset...')
  try {
    await resetWeeklyUploads()
    console.log('Weekly upload reset completed')
  } catch (error) {
    console.error('Error during weekly upload reset:', error)
  }
})

// Schedule marketing emails for every Wednesday at 10:00
cron.schedule('0 10 * * 3', async () => {
  console.log('Sending marketing emails...')
  try {
    await sendMarketingEmails()
    console.log('Marketing emails sent')
  } catch (error) {
    console.error('Error sending marketing emails:', error)
  }
})

console.log('Maintenance tasks scheduled:')
console.log('- Weekly upload reset: Every Monday at 00:00')
console.log('- Marketing emails: Every Wednesday at 10:00') 