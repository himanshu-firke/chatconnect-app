import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { motion } from 'framer-motion'
import {
  ChartBarIcon,
  EyeIcon,
  HeartIcon,
  ChatBubbleLeftIcon,
  ShareIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  CalendarDaysIcon,
  ClockIcon,
  UserGroupIcon,
  FireIcon
} from '@heroicons/react/24/outline'

const Analytics = () => {
  const [analytics, setAnalytics] = useState(null)
  const [timeRange, setTimeRange] = useState('7d')
  const [loading, setLoading] = useState(true)
  const [selectedPlatform, setSelectedPlatform] = useState('all')

  useEffect(() => {
    fetchAnalytics()
  }, [timeRange, selectedPlatform])

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`/api/analytics/overview?timeRange=${timeRange}&platform=${selectedPlatform}`)
      
      if (response.data.success) {
        setAnalytics(response.data.data)
      } else {
        // Demo data for development
        setAnalytics({
          overview: {
            totalPosts: 24,
            totalViews: 15420,
            totalEngagements: 892,
            engagementRate: 5.8,
            topPerformingPost: {
              id: '1',
              content: 'AI trends shaping the future of social media marketing',
              platform: 'linkedin',
              views: 2340,
              engagements: 156
            }
          },
          platforms: {
            twitter: {
              posts: 12,
              views: 8420,
              engagements: 445,
              followers: 1250,
              growth: 12
            },
            linkedin: {
              posts: 8,
              views: 5200,
              engagements: 312,
              followers: 890,
              growth: 8
            },
            instagram: {
              posts: 4,
              views: 1800,
              engagements: 135,
              followers: 650,
              growth: 15
            }
          },
          engagement: {
            likes: 456,
            comments: 234,
            shares: 202,
            clicks: 340
          },
          timeData: [
            { date: '2024-01-01', views: 1200, engagements: 89 },
            { date: '2024-01-02', views: 1450, engagements: 102 },
            { date: '2024-01-03', views: 1380, engagements: 95 },
            { date: '2024-01-04', views: 1620, engagements: 118 },
            { date: '2024-01-05', views: 1890, engagements: 134 },
            { date: '2024-01-06', views: 2100, engagements: 156 },
            { date: '2024-01-07', views: 1980, engagements: 142 }
          ],
          bestTimes: [
            { hour: 9, engagement: 85 },
            { hour: 12, engagement: 92 },
            { hour: 15, engagement: 78 },
            { hour: 18, engagement: 95 },
            { hour: 21, engagement: 88 }
          ]
        })
      }
    } catch (error) {
      console.error('Error fetching analytics:', error)
      // Use demo data on error
      setAnalytics({
        overview: {
          totalPosts: 24,
          totalViews: 15420,
          totalEngagements: 892,
          engagementRate: 5.8
        },
        platforms: {},
        engagement: {},
        timeData: [],
        bestTimes: []
      })
    } finally {
      setLoading(false)
    }
  }

  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
    return num.toString()
  }

  const getPlatformColor = (platform) => {
    const colors = {
      twitter: '#1DA1F2',
      linkedin: '#0077B5',
      instagram: '#E4405F',
      facebook: '#1877F2'
    }
    return colors[platform] || '#6366F1'
  }

  const StatCard = ({ title, value, change, icon: Icon, color = 'blue' }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {change !== undefined && (
            <div className={`flex items-center mt-1 ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {change >= 0 ? (
                <ArrowTrendingUpIcon className="w-4 h-4 mr-1" />
              ) : (
                <ArrowTrendingDownIcon className="w-4 h-4 mr-1" />
              )}
              <span className="text-sm font-medium">
                {Math.abs(change)}% vs last period
              </span>
            </div>
          )}
        </div>
        <div className={`w-12 h-12 bg-${color}-100 rounded-lg flex items-center justify-center`}>
          <Icon className={`w-6 h-6 text-${color}-600`} />
        </div>
      </div>
    </motion.div>
  )

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-display font-bold text-gray-900 mb-2">
              Analytics Dashboard
            </h1>
            <p className="text-gray-600">
              Track your social media performance and engagement metrics.
            </p>
          </div>
          
          <div className="flex space-x-3">
            <select
              value={selectedPlatform}
              onChange={(e) => setSelectedPlatform(e.target.value)}
              className="input-field"
            >
              <option value="all">All Platforms</option>
              <option value="twitter">Twitter</option>
              <option value="linkedin">LinkedIn</option>
              <option value="instagram">Instagram</option>
            </select>
            
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="input-field"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
            </select>
          </div>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Posts"
          value={analytics?.overview?.totalPosts || 0}
          change={12}
          icon={ChartBarIcon}
          color="blue"
        />
        <StatCard
          title="Total Views"
          value={formatNumber(analytics?.overview?.totalViews || 0)}
          change={8}
          icon={EyeIcon}
          color="green"
        />
        <StatCard
          title="Engagements"
          value={formatNumber(analytics?.overview?.totalEngagements || 0)}
          change={15}
          icon={HeartIcon}
          color="purple"
        />
        <StatCard
          title="Engagement Rate"
          value={`${analytics?.overview?.engagementRate || 0}%`}
          change={-2}
          icon={ArrowTrendingUpIcon}
          color="orange"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Platform Performance */}
        <div className="lg:col-span-2 card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Platform Performance</h3>
          <div className="space-y-4">
            {Object.entries(analytics?.platforms || {}).map(([platform, data]) => (
              <div key={platform} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold"
                    style={{ backgroundColor: getPlatformColor(platform) }}
                  >
                    {platform.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 capitalize">{platform}</h4>
                    <p className="text-sm text-gray-600">{data.posts} posts</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">
                    {formatNumber(data.views)} views
                  </div>
                  <div className="text-sm text-gray-600">
                    {data.engagements} engagements
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">
                    {formatNumber(data.followers)} followers
                  </div>
                  <div className={`text-sm ${data.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    +{data.growth}% growth
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Engagement Breakdown */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Engagement Breakdown</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <HeartIcon className="w-5 h-5 text-red-500" />
                <span className="text-sm font-medium text-gray-900">Likes</span>
              </div>
              <span className="text-sm font-bold text-gray-900">
                {formatNumber(analytics?.engagement?.likes || 0)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <ChatBubbleLeftIcon className="w-5 h-5 text-blue-500" />
                <span className="text-sm font-medium text-gray-900">Comments</span>
              </div>
              <span className="text-sm font-bold text-gray-900">
                {formatNumber(analytics?.engagement?.comments || 0)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <ShareIcon className="w-5 h-5 text-green-500" />
                <span className="text-sm font-medium text-gray-900">Shares</span>
              </div>
              <span className="text-sm font-bold text-gray-900">
                {formatNumber(analytics?.engagement?.shares || 0)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <EyeIcon className="w-5 h-5 text-purple-500" />
                <span className="text-sm font-medium text-gray-900">Clicks</span>
              </div>
              <span className="text-sm font-bold text-gray-900">
                {formatNumber(analytics?.engagement?.clicks || 0)}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Best Times to Post */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            <ClockIcon className="w-5 h-5 inline mr-2" />
            Best Times to Post
          </h3>
          <div className="space-y-3">
            {analytics?.bestTimes?.map((time, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-900">
                  {time.hour}:00
                </span>
                <div className="flex items-center space-x-2">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-purple-500 h-2 rounded-full"
                      style={{ width: `${time.engagement}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-600">{time.engagement}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Performing Post */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            <FireIcon className="w-5 h-5 inline mr-2" />
            Top Performing Post
          </h3>
          {analytics?.overview?.topPerformingPost ? (
            <div className="space-y-3">
              <p className="text-sm text-gray-900">
                {analytics.overview.topPerformingPost.content}
              </p>
              <div className="flex items-center justify-between text-sm">
                <span className="capitalize font-medium text-gray-600">
                  {analytics.overview.topPerformingPost.platform}
                </span>
                <div className="flex space-x-4">
                  <span className="text-gray-600">
                    {formatNumber(analytics.overview.topPerformingPost.views)} views
                  </span>
                  <span className="text-gray-600">
                    {analytics.overview.topPerformingPost.engagements} engagements
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-gray-600 text-sm">No posts available for analysis</p>
          )}
        </div>
      </div>

      {/* AI Insights */}
      <div className="mt-8 card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          🤖 AI-Powered Insights
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Optimal Posting</h4>
            <p className="text-sm text-blue-800">
              Your audience is most active between 6-9 PM. Consider scheduling more posts during this time.
            </p>
          </div>
          <div className="p-4 bg-green-50 rounded-lg">
            <h4 className="font-medium text-green-900 mb-2">Content Performance</h4>
            <p className="text-sm text-green-800">
              Posts with questions get 23% more engagement. Try adding more interactive content.
            </p>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg">
            <h4 className="font-medium text-purple-900 mb-2">Platform Strategy</h4>
            <p className="text-sm text-purple-800">
              LinkedIn posts perform 40% better with professional tone. Adjust your content strategy.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Analytics
