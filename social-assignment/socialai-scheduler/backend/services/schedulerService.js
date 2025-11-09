import cron from 'node-cron'
import postingService from './postingService.js'

class SchedulerService {
  constructor() {
    this.jobs = new Map()
    this.isRunning = false
  }

  // Start the scheduler
  start() {
    if (this.isRunning) {
      console.log('📅 Scheduler is already running')
      return
    }

    // Run every minute to check for posts to publish
    const job = cron.schedule('* * * * *', async () => {
      try {
        console.log('🔄 Checking for posts to publish...')
        const results = await postingService.processPendingPosts()
        
        if (results.length > 0) {
          const successful = results.filter(r => r.success).length
          const failed = results.filter(r => !r.success).length
          console.log(`📊 Published ${successful} posts, ${failed} failed`)
        }
      } catch (error) {
        console.error('❌ Scheduler error:', error)
      }
    }, {
      scheduled: false
    })

    job.start()
    this.jobs.set('main', job)
    this.isRunning = true
    
    console.log('✅ Post scheduler started - checking every minute')
  }

  // Stop the scheduler
  stop() {
    if (!this.isRunning) {
      console.log('📅 Scheduler is not running')
      return
    }

    this.jobs.forEach((job, name) => {
      job.stop()
      console.log(`🛑 Stopped scheduler job: ${name}`)
    })
    
    this.jobs.clear()
    this.isRunning = false
    console.log('✅ Post scheduler stopped')
  }

  // Get scheduler status
  getStatus() {
    return {
      running: this.isRunning,
      jobs: Array.from(this.jobs.keys()),
      nextRun: this.isRunning ? 'Every minute' : 'Not scheduled'
    }
  }

  // Schedule a specific post (for immediate or near-future posting)
  schedulePost(postId, scheduledTime) {
    const jobName = `post_${postId}`
    
    // Remove existing job if it exists
    if (this.jobs.has(jobName)) {
      this.jobs.get(jobName).stop()
      this.jobs.delete(jobName)
    }

    // Create cron expression for the scheduled time
    const scheduleDate = new Date(scheduledTime)
    const cronExpression = `${scheduleDate.getMinutes()} ${scheduleDate.getHours()} ${scheduleDate.getDate()} ${scheduleDate.getMonth() + 1} *`

    const job = cron.schedule(cronExpression, async () => {
      try {
        console.log(`📤 Publishing scheduled post: ${postId}`)
        const result = await postingService.publishPost(postId)
        
        if (result.success) {
          console.log(`✅ Successfully published post: ${postId}`)
        } else {
          console.log(`❌ Failed to publish post: ${postId} - ${result.error}`)
        }
        
        // Remove the job after execution
        this.jobs.delete(jobName)
      } catch (error) {
        console.error(`❌ Error publishing scheduled post ${postId}:`, error)
        this.jobs.delete(jobName)
      }
    }, {
      scheduled: true
    })

    this.jobs.set(jobName, job)
    console.log(`📅 Scheduled post ${postId} for ${scheduleDate.toISOString()}`)
  }

  // Cancel a scheduled post
  cancelScheduledPost(postId) {
    const jobName = `post_${postId}`
    
    if (this.jobs.has(jobName)) {
      this.jobs.get(jobName).stop()
      this.jobs.delete(jobName)
      console.log(`🚫 Cancelled scheduled post: ${postId}`)
      return true
    }
    
    return false
  }

  // Get all scheduled jobs
  getScheduledJobs() {
    return Array.from(this.jobs.keys()).filter(name => name.startsWith('post_'))
  }

  // Health check for scheduler
  healthCheck() {
    return {
      status: this.isRunning ? 'healthy' : 'stopped',
      uptime: this.isRunning ? 'Running' : 'Not running',
      activeJobs: this.jobs.size,
      scheduledPosts: this.getScheduledJobs().length,
      timestamp: new Date().toISOString()
    }
  }

  // Manual trigger for testing
  async triggerManualCheck() {
    try {
      console.log('🔄 Manual trigger: Checking for posts to publish...')
      const results = await postingService.processPendingPosts()
      
      return {
        success: true,
        processed: results.length,
        results: results
      }
    } catch (error) {
      console.error('❌ Manual trigger error:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }
}

export default new SchedulerService()
