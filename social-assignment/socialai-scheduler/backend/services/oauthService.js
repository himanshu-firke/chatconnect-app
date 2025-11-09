import passport from 'passport'
import { Strategy as TwitterStrategy } from 'passport-twitter'
import { Strategy as LinkedInStrategy } from 'passport-linkedin-oauth2'
import { Strategy as InstagramStrategy } from 'passport-instagram'
import User from '../models/User.js'

class OAuthService {
  constructor() {
    this.initializeStrategies()
  }

  initializeStrategies() {
    // Twitter OAuth Strategy
    if (process.env.TWITTER_CONSUMER_KEY && process.env.TWITTER_CONSUMER_SECRET) {
      passport.use('twitter', new TwitterStrategy({
        consumerKey: process.env.TWITTER_CONSUMER_KEY,
        consumerSecret: process.env.TWITTER_CONSUMER_SECRET,
        callbackURL: process.env.TWITTER_CALLBACK_URL || '/api/auth/twitter/callback',
        passReqToCallback: true
      }, this.handleTwitterAuth.bind(this)))
    }

    // LinkedIn OAuth Strategy
    if (process.env.LINKEDIN_CLIENT_ID && process.env.LINKEDIN_CLIENT_SECRET) {
      passport.use('linkedin', new LinkedInStrategy({
        clientID: process.env.LINKEDIN_CLIENT_ID,
        clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
        callbackURL: process.env.LINKEDIN_CALLBACK_URL || '/api/auth/linkedin/callback',
        scope: ['r_liteprofile', 'r_emailaddress', 'w_member_social'],
        passReqToCallback: true
      }, this.handleLinkedInAuth.bind(this)))
    }

    // Instagram OAuth Strategy (using Facebook Graph API)
    if (process.env.INSTAGRAM_CLIENT_ID && process.env.INSTAGRAM_CLIENT_SECRET) {
      passport.use('instagram', new InstagramStrategy({
        clientID: process.env.INSTAGRAM_CLIENT_ID,
        clientSecret: process.env.INSTAGRAM_CLIENT_SECRET,
        callbackURL: process.env.INSTAGRAM_CALLBACK_URL || '/api/auth/instagram/callback',
        passReqToCallback: true
      }, this.handleInstagramAuth.bind(this)))
    }

    // Serialize/Deserialize user for session
    passport.serializeUser((user, done) => {
      done(null, user._id)
    })

    passport.deserializeUser(async (id, done) => {
      try {
        const user = await User.findById(id)
        done(null, user)
      } catch (error) {
        done(error, null)
      }
    })
  }

  async handleTwitterAuth(req, token, tokenSecret, profile, done) {
    try {
      const userId = req.user._id
      const user = await User.findById(userId)
      
      if (!user) {
        return done(new Error('User not found'), null)
      }

      // Update user's social media connections
      const twitterConnection = {
        platform: 'twitter',
        platformId: profile.id,
        username: profile.username,
        displayName: profile.displayName,
        accessToken: token,
        tokenSecret: tokenSecret,
        profileImage: profile.photos?.[0]?.value,
        connectedAt: new Date(),
        isActive: true
      }

      // Remove existing Twitter connection if any
      user.socialConnections = user.socialConnections.filter(
        conn => conn.platform !== 'twitter'
      )
      
      // Add new connection
      user.socialConnections.push(twitterConnection)
      await user.save()

      return done(null, user)
    } catch (error) {
      return done(error, null)
    }
  }

  async handleLinkedInAuth(req, accessToken, refreshToken, profile, done) {
    try {
      const userId = req.user._id
      const user = await User.findById(userId)
      
      if (!user) {
        return done(new Error('User not found'), null)
      }

      const linkedinConnection = {
        platform: 'linkedin',
        platformId: profile.id,
        username: profile.displayName,
        displayName: profile.displayName,
        accessToken: accessToken,
        refreshToken: refreshToken,
        profileImage: profile.photos?.[0]?.value,
        connectedAt: new Date(),
        isActive: true
      }

      // Remove existing LinkedIn connection if any
      user.socialConnections = user.socialConnections.filter(
        conn => conn.platform !== 'linkedin'
      )
      
      // Add new connection
      user.socialConnections.push(linkedinConnection)
      await user.save()

      return done(null, user)
    } catch (error) {
      return done(error, null)
    }
  }

  async handleInstagramAuth(req, accessToken, refreshToken, profile, done) {
    try {
      const userId = req.user._id
      const user = await User.findById(userId)
      
      if (!user) {
        return done(new Error('User not found'), null)
      }

      const instagramConnection = {
        platform: 'instagram',
        platformId: profile.id,
        username: profile.username,
        displayName: profile.displayName,
        accessToken: accessToken,
        refreshToken: refreshToken,
        profileImage: profile.photos?.[0]?.value,
        connectedAt: new Date(),
        isActive: true
      }

      // Remove existing Instagram connection if any
      user.socialConnections = user.socialConnections.filter(
        conn => conn.platform !== 'instagram'
      )
      
      // Add new connection
      user.socialConnections.push(instagramConnection)
      await user.save()

      return done(null, user)
    } catch (error) {
      return done(error, null)
    }
  }

  // Get user's connected platforms
  async getConnectedPlatforms(userId) {
    try {
      const user = await User.findById(userId).select('socialConnections')
      return user?.socialConnections || []
    } catch (error) {
      throw new Error('Failed to fetch connected platforms')
    }
  }

  // Disconnect a platform
  async disconnectPlatform(userId, platform) {
    try {
      const user = await User.findById(userId)
      if (!user) {
        throw new Error('User not found')
      }

      user.socialConnections = user.socialConnections.filter(
        conn => conn.platform !== platform
      )
      
      await user.save()
      return true
    } catch (error) {
      throw new Error('Failed to disconnect platform')
    }
  }

  // Check if platform is connected
  async isPlatformConnected(userId, platform) {
    try {
      const user = await User.findById(userId).select('socialConnections')
      return user?.socialConnections?.some(
        conn => conn.platform === platform && conn.isActive
      ) || false
    } catch (error) {
      return false
    }
  }

  // Get platform connection details
  async getPlatformConnection(userId, platform) {
    try {
      const user = await User.findById(userId).select('socialConnections')
      return user?.socialConnections?.find(
        conn => conn.platform === platform && conn.isActive
      ) || null
    } catch (error) {
      return null
    }
  }
}

export default new OAuthService()
