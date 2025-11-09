import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Search, Home, User, Users, MessageCircle, Bell, LogOut, Menu, X } from 'lucide-react'
import { useSocial } from '../context/SocialContext'

function Navbar() {
  const { state, dispatch } = useSocial()
  const [searchQuery, setSearchQuery] = useState('')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const navigate = useNavigate()

  const handleLogout = () => {
    dispatch({ type: 'LOGOUT' })
    navigate('/login')
  }

  const handleSearch = (e) => {
    e.preventDefault()
    // In a real app, this would filter posts/users/groups
    console.log('Searching for:', searchQuery)
  }

  const unreadNotifications = state.notifications.filter(n => !n.read).length
  const unreadMessages = state.messages.reduce((total, conv) => total + conv.unread, 0)

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-lg">S</span>
            </div>
            <span className="text-xl font-bold text-gray-900 hidden sm:block">SocialNet</span>
          </Link>

          {/* Search Bar - Desktop */}
          <div className="hidden md:block flex-1 max-w-md mx-8">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                placeholder="Search users, posts, groups..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </form>
          </div>

          {/* Navigation Links - Desktop */}
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/" className="flex items-center space-x-1 text-gray-700 hover:text-primary-600 transition-colors">
              <Home className="h-5 w-5" />
              <span>Home</span>
            </Link>
            <Link to="/profile" className="flex items-center space-x-1 text-gray-700 hover:text-primary-600 transition-colors">
              <User className="h-5 w-5" />
              <span>Profile</span>
            </Link>
            <Link to="/friends" className="flex items-center space-x-1 text-gray-700 hover:text-primary-600 transition-colors">
              <Users className="h-5 w-5" />
              <span>Friends</span>
            </Link>
            <Link to="/messages" className="relative flex items-center space-x-1 text-gray-700 hover:text-primary-600 transition-colors">
              <MessageCircle className="h-5 w-5" />
              <span>Messages</span>
              {unreadMessages > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {unreadMessages}
                </span>
              )}
            </Link>
            <Link to="/notifications" className="relative flex items-center space-x-1 text-gray-700 hover:text-primary-600 transition-colors">
              <Bell className="h-5 w-5" />
              <span>Notifications</span>
              {unreadNotifications > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {unreadNotifications}
                </span>
              )}
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-1 text-gray-700 hover:text-red-600 transition-colors"
            >
              <LogOut className="h-5 w-5" />
              <span>Logout</span>
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-gray-700 hover:text-primary-600"
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t">
              {/* Mobile Search */}
              <form onSubmit={handleSearch} className="relative mb-4">
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </form>

              {/* Mobile Navigation Links */}
              <Link
                to="/"
                className="flex items-center space-x-3 px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Home className="h-5 w-5" />
                <span>Home</span>
              </Link>
              <Link
                to="/profile"
                className="flex items-center space-x-3 px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <User className="h-5 w-5" />
                <span>Profile</span>
              </Link>
              <Link
                to="/friends"
                className="flex items-center space-x-3 px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Users className="h-5 w-5" />
                <span>Friends</span>
              </Link>
              <Link
                to="/messages"
                className="flex items-center justify-between px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <div className="flex items-center space-x-3">
                  <MessageCircle className="h-5 w-5" />
                  <span>Messages</span>
                </div>
                {unreadMessages > 0 && (
                  <span className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {unreadMessages}
                  </span>
                )}
              </Link>
              <Link
                to="/notifications"
                className="flex items-center justify-between px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <div className="flex items-center space-x-3">
                  <Bell className="h-5 w-5" />
                  <span>Notifications</span>
                </div>
                {unreadNotifications > 0 && (
                  <span className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {unreadNotifications}
                  </span>
                )}
              </Link>
              <button
                onClick={() => {
                  handleLogout()
                  setIsMobileMenuOpen(false)
                }}
                className="flex items-center space-x-3 px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100 w-full text-left"
              >
                <LogOut className="h-5 w-5" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar
