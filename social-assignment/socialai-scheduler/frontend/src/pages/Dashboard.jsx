import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { motion } from 'framer-motion'
import {
  PlusIcon, 
  CalendarIcon, 
  ChartBarIcon, 
  ChatBubbleLeftRightIcon,
  ClockIcon,
  CalendarDaysIcon,
  SparklesIcon,
  EyeIcon,
  HeartIcon,
  ShareIcon,
  ArrowTrendingUpIcon,
  UserGroupIcon,
  FireIcon,
  BoltIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      // Simulate API call - in real app, this would fetch from backend
      setTimeout(() => {
        setDashboardData({
          stats: {
            scheduledPosts: 12,
            publishedToday: 3,
            engagementRate: 4.2,
            totalViews: 15420,
            aiChats: 8,
            connectedPlatforms: 3
          },
          recentPosts: [
            { id: 1, content: 'AI trends in 2024', platform: 'linkedin', status: 'published', time: '2h ago' },
            { id: 2, content: 'JavaScript best practices', platform: 'twitter', status: 'scheduled', time: '4h ago' },
            { id: 3, content: 'Product launch announcement', platform: 'instagram', status: 'published', time: '6h ago' }
          ],
          upcomingPosts: [
            { id: 4, content: 'Weekly tech roundup', platform: 'linkedin', scheduledFor: 'Tomorrow 9:00 AM' },
            { id: 5, content: 'Behind the scenes', platform: 'instagram', scheduledFor: 'Tomorrow 2:00 PM' }
          ],
          bestTimes: [
            { time: '9:00 AM', engagement: 85 },
            { time: '12:00 PM', engagement: 92 },
            { time: '6:00 PM', engagement: 95 }
          ]
        })
        setLoading(false)
      }, 1000)
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      setLoading(false)
    }
  }

  const stats = [
    { name: 'Scheduled Posts', value: dashboardData?.stats.scheduledPosts || '0', icon: CalendarDaysIcon, color: 'text-blue-600', bg: 'bg-blue-50' },
    { name: 'Published Today', value: dashboardData?.stats.publishedToday || '0', icon: CheckCircleIcon, color: 'text-green-600', bg: 'bg-green-50' },
    { name: 'Total Views', value: dashboardData?.stats.totalViews ? `${(dashboardData.stats.totalViews / 1000).toFixed(1)}K` : '0', icon: EyeIcon, color: 'text-purple-600', bg: 'bg-purple-50' },
    { name: 'Engagement Rate', value: `${dashboardData?.stats.engagementRate || 0}%`, icon: ArrowTrendingUpIcon, color: 'text-orange-600', bg: 'bg-orange-50' },
  ]

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
        <h1 className="text-3xl font-display font-bold text-gray-900 mb-2">
          Welcome back!
        </h1>
        <p className="text-gray-600">
          Here's what's happening with your social media today.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <motion.div 
              key={stat.name} 
              className="card hover:shadow-lg transition-shadow"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-center">
                <div className={`p-3 rounded-lg ${stat.bg}`}>
                  <Icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Quick Actions */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <BoltIcon className="w-5 h-5 mr-2 text-yellow-500" />
            Quick Actions
          </h2>
          <div className="space-y-3">
            <Link
              to="/ai-chat"
              className="flex items-center p-3 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg hover:from-purple-100 hover:to-blue-100 transition-colors"
            >
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                <SparklesIcon className="w-5 h-5 text-white" />
              </div>
              <div className="ml-3">
                <p className="font-medium text-gray-900">Create with AI</p>
                <p className="text-sm text-gray-600">Generate engaging content</p>
              </div>
            </Link>
            
            <Link
              to="/calendar"
              className="flex items-center p-3 bg-gradient-to-r from-teal-50 to-green-50 rounded-lg hover:from-teal-100 hover:to-green-100 transition-colors"
            >
              <div className="w-10 h-10 bg-gradient-to-r from-teal-500 to-green-500 rounded-lg flex items-center justify-center">
                <CalendarDaysIcon className="w-5 h-5 text-white" />
              </div>
              <div className="ml-3">
                <p className="font-medium text-gray-900">View Calendar</p>
                <p className="text-sm text-gray-600">Manage schedule</p>
              </div>
            </Link>

            <Link
              to="/analytics"
              className="flex items-center p-3 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg hover:from-orange-100 hover:to-red-100 transition-colors"
            >
              <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                <ChartBarIcon className="w-5 h-5 text-white" />
              </div>
              <div className="ml-3">
                <p className="font-medium text-gray-900">View Analytics</p>
                <p className="text-sm text-gray-600">Track performance</p>
              </div>
            </Link>
          </div>
        </div>

        {/* Recent Posts */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <ClockIcon className="w-5 h-5 mr-2 text-blue-500" />
            Recent Posts
          </h2>
          <div className="space-y-3">
            {dashboardData?.recentPosts.map((post) => (
              <div key={post.id} className="flex items-center p-3 bg-gray-50 rounded-lg">
                <div className={`w-2 h-2 rounded-full ${
                  post.status === 'published' ? 'bg-green-500' : 
                  post.status === 'scheduled' ? 'bg-blue-500' : 'bg-gray-500'
                }`}></div>
                <div className="ml-3 flex-1">
                  <p className="text-sm font-medium text-gray-900">{post.content}</p>
                  <p className="text-xs text-gray-500 capitalize">{post.platform} • {post.status}</p>
                </div>
                <span className="text-xs text-gray-500">{post.time}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Best Times to Post */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <FireIcon className="w-5 h-5 mr-2 text-red-500" />
            Best Times to Post
          </h2>
          <div className="space-y-3">
            {dashboardData?.bestTimes.map((time, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-900">{time.time}</span>
                <div className="flex items-center space-x-2">
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full"
                      style={{ width: `${time.engagement}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-600">{time.engagement}%</span>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 p-3 bg-purple-50 rounded-lg">
            <p className="text-sm text-purple-800">
              💡 <strong>AI Tip:</strong> Your audience is most active around 6:00 PM. Consider scheduling more posts during this time.
            </p>
          </div>
        </div>
      </div>

      {/* Upcoming Posts */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <CalendarDaysIcon className="w-5 h-5 mr-2 text-green-500" />
          Upcoming Posts
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {dashboardData?.upcomingPosts.map((post) => (
            <div key={post.id} className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-100">
              <div className="flex items-center justify-between mb-2">
                <span className={`px-2 py-1 text-xs rounded-full capitalize ${
                  post.platform === 'linkedin' ? 'bg-blue-100 text-blue-800' :
                  post.platform === 'twitter' ? 'bg-sky-100 text-sky-800' :
                  'bg-pink-100 text-pink-800'
                }`}>
                  {post.platform}
                </span>
                <ClockIcon className="w-4 h-4 text-gray-500" />
              </div>
              <p className="text-sm font-medium text-gray-900 mb-1">{post.content}</p>
              <p className="text-xs text-gray-600">{post.scheduledFor}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Dashboard
