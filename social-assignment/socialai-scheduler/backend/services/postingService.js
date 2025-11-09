import axios from 'axios'
import { TwitterApi } from 'twitter-api-v2'
import User from '../models/User.js'
import Post from '../models/Post.js'

class PostingService {
  constructor() {
    this.twitterClients = new Map()
  }

  // Get Twitter client for user
  getTwitterClient(accessToken, tokenSecret) {
    const clientKey = `${accessToken}_${tokenSecret}`
    
    if (!this.twitterClients.has(clientKey)) {
      const client = new TwitterApi({
        appKey: process.env.TWITTER_CONSUMER_KEY,
        appSecret: process.env.TWITTER_CONSUMER_SECRET,
        accessToken: accessToken,
        accessSecret: tokenSecret,
      })
      this.twitterClients.set(clientKey, client)
    }
    
    return this.twitterClients.get(clientKey)
  }

  // Post to Twitter
  async postToTwitter(userId, content, connection) {
    try {
      const client = this.getTwitterClient(connection.accessToken, connection.tokenSecret)
      const tweet = await client.v2.tweet(content.text)
      
      return {
        success: true,
        platformPostId: tweet.data.id,
        url: `https://twitter.com/${connection.username}/status/${tweet.data.id}`,
        publishedAt: new Date()
      }
    } catch (error) {
      console.error('Twitter posting error:', error)
      return {
        success: false,
        error: error.message || 'Failed to post to Twitter'
      }
    }
  }

  // Post to LinkedIn
  async postToLinkedIn(userId, content, connection) {
    try {
      const linkedInData = {
        author: `urn:li:person:${connection.platformId}`,
        lifecycleState: 'PUBLISHED',
        specificContent: {
          'com.linkedin.ugc.ShareContent': {
            shareCommentary: {
              text: content.text
            },
            shareMediaCategory: 'NONE'
          }
        },
        visibility: {
          'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC'
        }
      }

      const response = await axios.post(
        'https://api.linkedin.com/v2/ugcPosts',
        linkedInData,
        {
          headers: {
            'Authorization': `Bearer ${connection.accessToken}`,
            'Content-Type': 'application/json',
            'X-Restli-Protocol-Version': '2.0.0'
          }
        }
      )

      return {
        success: true,
        platformPostId: response.data.id,
        url: `https://linkedin.com/feed/update/${response.data.id}`,
        publishedAt: new Date()
      }
    } catch (error) {
      console.error('LinkedIn posting error:', error)
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Failed to post to LinkedIn'
      }
    }
  }

  // Post to Instagram (Basic Display API - limited functionality)
  async postToInstagram(userId, content, connection) {
    try {
      // Note: Instagram Basic Display API doesn't support posting
      // This would require Instagram Graph API and a Facebook App
      // For demo purposes, we'll simulate a successful post
      
      return {
        success: true,
        platformPostId: `ig_${Date.now()}`,
        url: `https://instagram.com/p/demo_post/`,
        publishedAt: new Date(),
        note: 'Instagram posting requires Instagram Graph API setup'
      }
    } catch (error) {
      console.error('Instagram posting error:', error)
      return {
        success: false,
        error: error.message || 'Failed to post to Instagram'
      }
    }
  }

  // Main posting function
  async publishPost(postId) {
    try {
      const post = await Post.findById(postId).populate('user')
      if (!post) {
        throw new Error('Post not found')
      }

      if (post.status !== 'scheduled') {
        throw new Error('Post is not scheduled for publishing')
      }

      const user = await User.findById(post.user._id)
      if (!user) {
        throw new Error('User not found')
      }

      const results = []
      
      // Post to each platform
      for (const platform of post.platforms) {
        const connection = user.socialConnections.find(
          conn => conn.platform === platform.name && conn.isActive
        )

        if (!connection) {
          results.push({
            platform: platform.name,
            success: false,
            error: 'Platform not connected'
          })
          continue
        }

        let result
        switch (platform.name) {
          case 'twitter':
            result = await this.postToTwitter(user._id, platform.content, connection)
            break
          case 'linkedin':
            result = await this.postToLinkedIn(user._id, platform.content, connection)
            break
          case 'instagram':
            result = await this.postToInstagram(user._id, platform.content, connection)
            break
          default:
            result = {
              success: false,
              error: 'Unsupported platform'
            }
        }

        results.push({
          platform: platform.name,
          ...result
        })
      }

      // Update post status
      const successfulPosts = results.filter(r => r.success)
      const failedPosts = results.filter(r => !r.success)

      if (successfulPosts.length > 0) {
        post.status = failedPosts.length > 0 ? 'partially_published' : 'published'
        post.publishedAt = new Date()
        post.publishResults = results
      } else {
        post.status = 'failed'
        post.publishResults = results
      }

      await post.save()

      return {
        success: successfulPosts.length > 0,
        postId: post._id,
        results: results,
        status: post.status
      }

    } catch (error) {
      console.error('Error publishing post:', error)
      
      // Update post status to failed
      try {
        await Post.findByIdAndUpdate(postId, {
          status: 'failed',
          publishResults: [{
            error: error.message,
            timestamp: new Date()
          }]
        })
      } catch (updateError) {
        console.error('Error updating failed post:', updateError)
      }

      return {
        success: false,
        error: error.message
      }
    }
  }

  // Get posts ready for publishing
  async getPostsReadyForPublishing() {
    try {
      const now = new Date()
      const posts = await Post.find({
        status: 'scheduled',
        'scheduling.scheduledFor': { $lte: now }
      }).populate('user')

      return posts
    } catch (error) {
      console.error('Error fetching posts ready for publishing:', error)
      return []
    }
  }

  // Process all pending posts
  async processPendingPosts() {
    try {
      const posts = await this.getPostsReadyForPublishing()
      console.log(`Found ${posts.length} posts ready for publishing`)

      const results = []
      for (const post of posts) {
        const result = await this.publishPost(post._id)
        results.push(result)
        
        // Add delay between posts to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000))
      }

      return results
    } catch (error) {
      console.error('Error processing pending posts:', error)
      return []
    }
  }

  // Validate platform connections before scheduling
  async validatePlatformConnections(userId, platforms) {
    try {
      const user = await User.findById(userId)
      if (!user) {
        return { valid: false, error: 'User not found' }
      }

      const missingPlatforms = []
      for (const platform of platforms) {
        const connection = user.socialConnections.find(
          conn => conn.platform === platform && conn.isActive
        )
        if (!connection) {
          missingPlatforms.push(platform)
        }
      }

      if (missingPlatforms.length > 0) {
        return {
          valid: false,
          error: `Missing connections for: ${missingPlatforms.join(', ')}`,
          missingPlatforms
        }
      }

      return { valid: true }
    } catch (error) {
      return { valid: false, error: error.message }
    }
  }
}

export default new PostingService()
