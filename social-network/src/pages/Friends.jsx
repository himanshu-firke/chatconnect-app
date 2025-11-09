import React, { useState } from 'react'
import { Search, UserPlus, MessageCircle, MoreHorizontal } from 'lucide-react'
import { useSocial } from '../context/SocialContext'

function Friends() {
  const { state } = useSocial()
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState('all')

  const filteredFriends = state.friends.filter(friend =>
    friend.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    friend.username.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getStatusColor = (status) => {
    switch (status) {
      case 'online':
        return 'bg-green-500'
      case 'away':
        return 'bg-yellow-500'
      case 'offline':
        return 'bg-gray-400'
      default:
        return 'bg-gray-400'
    }
  }

  const tabs = [
    { id: 'all', label: 'All Friends', count: state.friends.length },
    { id: 'online', label: 'Online', count: state.friends.filter(f => f.status === 'online').length },
    { id: 'requests', label: 'Requests', count: 3 }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Friends</h1>
          
          {/* Search Bar */}
          <div className="relative mb-4">
            <input
              type="text"
              placeholder="Search friends..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>

          {/* Tabs */}
          <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-white text-primary-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>
        </div>

        {/* Friends Grid */}
        {activeTab === 'all' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredFriends.map(friend => (
              <div key={friend.id} className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="relative">
                    <img
                      src={friend.profilePicture}
                      alt={friend.name}
                      className="w-16 h-16 rounded-full"
                    />
                    <div className={`absolute bottom-1 right-1 w-4 h-4 ${getStatusColor(friend.status)} border-2 border-white rounded-full`}></div>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{friend.name}</h3>
                    <p className="text-gray-600">@{friend.username}</p>
                    <p className="text-sm text-gray-500 capitalize">{friend.status}</p>
                  </div>
                  <button className="text-gray-400 hover:text-gray-600">
                    <MoreHorizontal className="h-5 w-5" />
                  </button>
                </div>
                
                <div className="flex space-x-2">
                  <button className="flex-1 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg flex items-center justify-center space-x-2 transition-colors">
                    <MessageCircle className="h-4 w-4" />
                    <span>Message</span>
                  </button>
                  <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                    View Profile
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Online Friends */}
        {activeTab === 'online' && (
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Online Now</h2>
              <div className="space-y-4">
                {state.friends.filter(f => f.status === 'online').map(friend => (
                  <div key={friend.id} className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg transition-colors">
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <img
                          src={friend.profilePicture}
                          alt={friend.name}
                          className="w-12 h-12 rounded-full"
                        />
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{friend.name}</h3>
                        <p className="text-sm text-gray-600">@{friend.username}</p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button className="bg-primary-600 hover:bg-primary-700 text-white p-2 rounded-lg transition-colors">
                        <MessageCircle className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Friend Requests */}
        {activeTab === 'requests' && (
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Friend Requests</h2>
              <div className="space-y-4">
                {/* Mock friend requests */}
                {[
                  { id: 1, name: 'Tom Brown', username: 'tom_b', profilePicture: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face' },
                  { id: 2, name: 'Lisa Chen', username: 'lisa_c', profilePicture: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face' },
                  { id: 3, name: 'David Wilson', username: 'david_w', profilePicture: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face' }
                ].map(request => (
                  <div key={request.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <img
                        src={request.profilePicture}
                        alt={request.name}
                        className="w-12 h-12 rounded-full"
                      />
                      <div>
                        <h3 className="font-medium text-gray-900">{request.name}</h3>
                        <p className="text-sm text-gray-600">@{request.username}</p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg transition-colors">
                        Accept
                      </button>
                      <button className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg transition-colors">
                        Decline
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Suggested Friends */}
        <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">People You May Know</h2>
            <button className="text-primary-600 hover:text-primary-700 font-medium">See All</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { id: 1, name: 'Alex Johnson', username: 'alex_j', profilePicture: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face', mutualFriends: 5 },
              { id: 2, name: 'Maria Garcia', username: 'maria_g', profilePicture: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face', mutualFriends: 3 },
              { id: 3, name: 'James Lee', username: 'james_l', profilePicture: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face', mutualFriends: 8 },
              { id: 4, name: 'Sophie Turner', username: 'sophie_t', profilePicture: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face', mutualFriends: 2 }
            ].map(suggestion => (
              <div key={suggestion.id} className="text-center p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                <img
                  src={suggestion.profilePicture}
                  alt={suggestion.name}
                  className="w-16 h-16 rounded-full mx-auto mb-3"
                />
                <h3 className="font-medium text-gray-900 mb-1">{suggestion.name}</h3>
                <p className="text-sm text-gray-600 mb-2">@{suggestion.username}</p>
                <p className="text-xs text-gray-500 mb-3">{suggestion.mutualFriends} mutual friends</p>
                <button className="w-full bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg flex items-center justify-center space-x-2 transition-colors">
                  <UserPlus className="h-4 w-4" />
                  <span>Add Friend</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Friends
