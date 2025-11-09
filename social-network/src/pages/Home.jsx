import React, { useState } from 'react'
import { useSocial } from '../context/SocialContext'
import PostCard from '../components/PostCard'
import CreatePostModal from '../components/CreatePostModal'
import TrendingTopics from '../components/TrendingTopics'
import Banner from '../components/Banner'
import { Plus } from 'lucide-react'

function Home() {
  const { state } = useSocial()
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Banner */}
      <Banner />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Feed */}
          <div className="lg:col-span-3">
            {/* Create Post Button */}
            <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
              <div className="flex items-center space-x-4">
                <img
                  src={state.user.profilePicture}
                  alt={state.user.name}
                  className="w-10 h-10 rounded-full"
                />
                <button
                  onClick={() => setIsCreatePostOpen(true)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 rounded-full px-4 py-2 text-left text-gray-500 transition-colors"
                >
                  What's on your mind, {state.user.name.split(' ')[0]}?
                </button>
                <button
                  onClick={() => setIsCreatePostOpen(true)}
                  className="bg-primary-600 hover:bg-primary-700 text-white p-2 rounded-full transition-colors"
                >
                  <Plus className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Posts Feed */}
            <div className="space-y-6">
              {state.posts.map(post => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <TrendingTopics />
          </div>
        </div>
      </div>

      {/* Create Post Modal */}
      {isCreatePostOpen && (
        <CreatePostModal
          isOpen={isCreatePostOpen}
          onClose={() => setIsCreatePostOpen(false)}
        />
      )}
    </div>
  )
}

export default Home
