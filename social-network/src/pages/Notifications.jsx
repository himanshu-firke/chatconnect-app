import React from 'react'
import { Heart, MessageCircle, UserPlus, Bell } from 'lucide-react'
import { useSocial } from '../context/SocialContext'

function Notifications() {
  const { state, dispatch } = useSocial()

  const handleMarkAsRead = (notificationId) => {
    dispatch({ type: 'MARK_NOTIFICATION_READ', payload: notificationId })
  }

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'like':
        return <Heart className="h-5 w-5 text-red-500" />
      case 'comment':
        return <MessageCircle className="h-5 w-5 text-blue-500" />
      case 'friend_request':
        return <UserPlus className="h-5 w-5 text-green-500" />
      case 'message':
        return <MessageCircle className="h-5 w-5 text-purple-500" />
      default:
        return <Bell className="h-5 w-5 text-gray-500" />
    }
  }

  const unreadCount = state.notifications.filter(n => !n.read).length

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
            {unreadCount > 0 && (
              <span className="bg-red-500 text-white text-sm px-3 py-1 rounded-full">
                {unreadCount} new
              </span>
            )}
          </div>
        </div>

        {/* Notifications List */}
        <div className="space-y-2">
          {state.notifications.length > 0 ? (
            state.notifications.map(notification => (
              <div
                key={notification.id}
                className={`bg-white rounded-lg shadow-sm p-4 border-l-4 transition-all hover:shadow-md ${
                  notification.read 
                    ? 'border-gray-200 opacity-75' 
                    : 'border-primary-500'
                }`}
              >
                <div className="flex items-start space-x-4">
                  {/* User Avatar */}
                  <img
                    src={notification.user.profilePicture}
                    alt={notification.user.name}
                    className="w-12 h-12 rounded-full flex-shrink-0"
                  />
                  
                  {/* Notification Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-2">
                        {getNotificationIcon(notification.type)}
                        <p className={`text-sm ${
                          notification.read ? 'text-gray-600' : 'text-gray-900 font-medium'
                        }`}>
                          {notification.message}
                        </p>
                      </div>
                      {!notification.read && (
                        <button
                          onClick={() => handleMarkAsRead(notification.id)}
                          className="text-xs text-primary-600 hover:text-primary-700 font-medium ml-2 flex-shrink-0"
                        >
                          Mark as read
                        </button>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{notification.timestamp}</p>
                    
                    {/* Action Buttons for Friend Requests */}
                    {notification.type === 'friend_request' && !notification.read && (
                      <div className="flex space-x-2 mt-3">
                        <button className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-1 rounded text-sm transition-colors">
                          Accept
                        </button>
                        <button className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-1 rounded text-sm transition-colors">
                          Decline
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
              <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No notifications</h3>
              <p className="text-gray-600">You're all caught up! Check back later for new updates.</p>
            </div>
          )}
        </div>

        {/* Mark All as Read */}
        {unreadCount > 0 && (
          <div className="mt-6 text-center">
            <button
              onClick={() => {
                state.notifications.forEach(notification => {
                  if (!notification.read) {
                    handleMarkAsRead(notification.id)
                  }
                })
              }}
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              Mark all as read
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default Notifications
