import React, { useState, useEffect } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'
import { motion } from 'framer-motion'
import { 
  LinkIcon,
  TrashIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  UserCircleIcon,
  BellIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline'

const Settings = () => {
  const [activeTab, setActiveTab] = useState('social')
  const [connectedPlatforms, setConnectedPlatforms] = useState([])
  const [availablePlatforms, setAvailablePlatforms] = useState([])
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState(null)

  useEffect(() => {
    fetchConnectedPlatforms()
    fetchAvailablePlatforms()
    fetchUserProfile()
  }, [])

  const fetchConnectedPlatforms = async () => {
    try {
      const response = await axios.get('/api/oauth/connections')
      if (response.data.success) {
        setConnectedPlatforms(response.data.data)
      }
    } catch (error) {
      console.error('Error fetching connections:', error)
    }
  }

  const fetchAvailablePlatforms = async () => {
    try {
      const response = await axios.get('/api/oauth/platforms')
      if (response.data.success) {
        setAvailablePlatforms(response.data.data)
      }
    } catch (error) {
      console.error('Error fetching platforms:', error)
    }
  }

  const fetchUserProfile = async () => {
    try {
      const response = await axios.get('/api/users/profile')
      if (response.data.success) {
        setUser(response.data.data)
      }
    } catch (error) {
      console.error('Error fetching user profile:', error)
    }
  }

  const handleConnect = (platform) => {
    if (!platform.available) {
      toast.error(`${platform.name} integration is not configured`)
      return
    }
    
    // Redirect to OAuth flow
    window.location.href = `/api/oauth/${platform.id}`
  }

  const handleDisconnect = async (platform) => {
    if (!confirm(`Are you sure you want to disconnect ${platform}?`)) {
      return
    }

    try {
      setLoading(true)
      const response = await axios.delete(`/api/oauth/disconnect/${platform}`)
      
      if (response.data.success) {
        toast.success(`${platform} disconnected successfully`)
        fetchConnectedPlatforms()
      } else {
        toast.error(response.data.message || 'Failed to disconnect platform')
      }
    } catch (error) {
      console.error('Error disconnecting platform:', error)
      toast.error('Failed to disconnect platform')
    } finally {
      setLoading(false)
    }
  }

  const isConnected = (platformId) => {
    return connectedPlatforms.some(conn => conn.platform === platformId)
  }

  const getConnection = (platformId) => {
    return connectedPlatforms.find(conn => conn.platform === platformId)
  }

  const tabs = [
    { id: 'social', name: 'Social Media', icon: LinkIcon },
    { id: 'profile', name: 'Profile', icon: UserCircleIcon },
    { id: 'notifications', name: 'Notifications', icon: BellIcon },
    { id: 'preferences', name: 'Preferences', icon: GlobeAltIcon }
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-gray-900 mb-2">
          Settings
        </h1>
        <p className="text-gray-600">
          Manage your account preferences and social media connections.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <nav className="space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                    activeTab === tab.id
                      ? 'bg-purple-100 text-purple-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  {tab.name}
                </button>
              )
            })}
          </nav>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          {activeTab === 'social' && (
            <div className="space-y-6">
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Social Media Connections
                </h3>
                <p className="text-gray-600 mb-6">
                  Connect your social media accounts to schedule and publish posts directly.
                </p>

                <div className="space-y-4">
                  {availablePlatforms.map((platform) => {
                    const connected = isConnected(platform.id)
                    const connection = getConnection(platform.id)

                    return (
                      <motion.div
                        key={platform.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                      >
                        <div className="flex items-center space-x-4">
                          <div 
                            className="w-12 h-12 rounded-lg flex items-center justify-center text-white text-xl"
                            style={{ backgroundColor: platform.color }}
                          >
                            {platform.icon}
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">{platform.name}</h4>
                            <p className="text-sm text-gray-600">{platform.description}</p>
                            {connected && connection && (
                              <div className="flex items-center mt-1">
                                <CheckCircleIcon className="w-4 h-4 text-green-500 mr-1" />
                                <span className="text-sm text-green-600">
                                  Connected as @{connection.username}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          {!platform.available && (
                            <div className="flex items-center text-orange-600">
                              <ExclamationCircleIcon className="w-4 h-4 mr-1" />
                              <span className="text-xs">Not configured</span>
                            </div>
                          )}
                          
                          {connected ? (
                            <button
                              onClick={() => handleDisconnect(platform.id)}
                              disabled={loading}
                              className="flex items-center px-3 py-1 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md disabled:opacity-50"
                            >
                              <TrashIcon className="w-4 h-4 mr-1" />
                              Disconnect
                            </button>
                          ) : (
                            <button
                              onClick={() => handleConnect(platform)}
                              disabled={!platform.available || loading}
                              className="btn-primary text-sm py-1 px-3 disabled:opacity-50"
                            >
                              <LinkIcon className="w-4 h-4 mr-1" />
                              Connect
                            </button>
                          )}
                        </div>
                      </motion.div>
                    )
                  })}
                </div>

                {connectedPlatforms.length > 0 && (
                  <div className="mt-6 p-4 bg-green-50 rounded-lg">
                    <div className="flex items-center">
                      <CheckCircleIcon className="w-5 h-5 text-green-500 mr-2" />
                      <span className="text-sm font-medium text-green-800">
                        {connectedPlatforms.length} platform{connectedPlatforms.length !== 1 ? 's' : ''} connected
                      </span>
                    </div>
                    <p className="text-sm text-green-700 mt-1">
                      You can now schedule and publish posts to your connected social media accounts.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Settings</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                  <input
                    type="text"
                    value={user?.name || ''}
                    className="input-field"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={user?.email || ''}
                    className="input-field"
                    disabled
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
                  <select className="input-field">
                    <option value="UTC">UTC</option>
                    <option value="America/New_York">Eastern Time</option>
                    <option value="America/Los_Angeles">Pacific Time</option>
                  </select>
                </div>
                <button className="btn-primary">Save Changes</button>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Notification Preferences</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">Email Notifications</h4>
                    <p className="text-sm text-gray-600">Receive updates via email</p>
                  </div>
                  <input type="checkbox" className="toggle" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">Post Reminders</h4>
                    <p className="text-sm text-gray-600">Get reminded before posts are published</p>
                  </div>
                  <input type="checkbox" className="toggle" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">Analytics Reports</h4>
                    <p className="text-sm text-gray-600">Weekly performance summaries</p>
                  </div>
                  <input type="checkbox" className="toggle" />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'preferences' && (
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Content Preferences</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Default Tone</label>
                  <select className="input-field">
                    <option value="friendly">Friendly</option>
                    <option value="professional">Professional</option>
                    <option value="casual">Casual</option>
                    <option value="funny">Funny</option>
                    <option value="formal">Formal</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Default Content Type</label>
                  <select className="input-field">
                    <option value="text">Text Only</option>
                    <option value="image+text">Image + Text</option>
                    <option value="video+text">Video + Text</option>
                  </select>
                </div>
                <button className="btn-primary">Save Preferences</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Settings
