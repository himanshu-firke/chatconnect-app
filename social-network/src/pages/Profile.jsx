import React, { useState } from 'react'
import { Camera, Edit, MapPin, Calendar, Link as LinkIcon } from 'lucide-react'
import { useSocial } from '../context/SocialContext'
import PostCard from '../components/PostCard'
import EditProfileModal from '../components/EditProfileModal'

function Profile() {
  const { state } = useSocial()
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  
  // Filter posts by current user
  const userPosts = state.posts.filter(post => post.author.id === state.user.id)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Cover Photo */}
      <div className="relative h-64 md:h-80">
        <img
          src={state.user.coverPhoto}
          alt="Cover"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black bg-opacity-20" />
        <button className="absolute bottom-4 right-4 bg-white bg-opacity-90 hover:bg-opacity-100 text-gray-700 px-4 py-2 rounded-lg flex items-center space-x-2 transition-all">
          <Camera className="h-4 w-4" />
          <span>Change Cover</span>
        </button>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Profile Header */}
        <div className="relative -mt-16 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex flex-col md:flex-row items-center md:items-end space-y-4 md:space-y-0 md:space-x-6">
              {/* Profile Picture */}
              <div className="relative">
                <img
                  src={state.user.profilePicture}
                  alt={state.user.name}
                  className="w-32 h-32 rounded-full border-4 border-white shadow-lg"
                />
                <button className="absolute bottom-2 right-2 bg-primary-600 hover:bg-primary-700 text-white p-2 rounded-full transition-colors">
                  <Camera className="h-4 w-4" />
                </button>
              </div>

              {/* Profile Info */}
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{state.user.name}</h1>
                <p className="text-gray-600 mb-2">@{state.user.username}</p>
                <p className="text-gray-700 mb-4">{state.user.bio}</p>
                
                <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm text-gray-600 mb-4">
                  <div className="flex items-center space-x-1">
                    <MapPin className="h-4 w-4" />
                    <span>San Francisco, CA</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-4 w-4" />
                    <span>Joined March 2023</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <LinkIcon className="h-4 w-4" />
                    <span className="text-primary-600">portfolio.com</span>
                  </div>
                </div>

                <div className="flex justify-center md:justify-start space-x-6 text-sm">
                  <div>
                    <span className="font-semibold text-gray-900">{state.user.postsCount}</span>
                    <span className="text-gray-600 ml-1">Posts</span>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-900">{state.user.friendsCount}</span>
                    <span className="text-gray-600 ml-1">Friends</span>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-900">1.2k</span>
                    <span className="text-gray-600 ml-1">Followers</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex space-x-3">
                <button
                  onClick={() => setIsEditModalOpen(true)}
                  className="flex items-center space-x-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  <Edit className="h-4 w-4" />
                  <span>Edit Profile</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Friends List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
              <h3 className="font-semibold text-gray-900 mb-4">Friends ({state.friends.length})</h3>
              <div className="grid grid-cols-3 gap-3">
                {state.friends.slice(0, 9).map(friend => (
                  <div key={friend.id} className="text-center">
                    <img
                      src={friend.profilePicture}
                      alt={friend.name}
                      className="w-16 h-16 rounded-lg mx-auto mb-2"
                    />
                    <p className="text-xs font-medium text-gray-900 truncate">{friend.name}</p>
                  </div>
                ))}
              </div>
              <button className="w-full mt-4 text-sm text-primary-600 hover:text-primary-700 font-medium">
                See all friends
              </button>
            </div>
          </div>

          {/* Posts */}
          <div className="lg:col-span-2">
            <div className="space-y-6">
              <h3 className="font-semibold text-gray-900">Posts ({userPosts.length})</h3>
              {userPosts.length > 0 ? (
                userPosts.map(post => (
                  <PostCard key={post.id} post={post} />
                ))
              ) : (
                <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                  <p className="text-gray-500">No posts yet. Share your first post!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditModalOpen && (
        <EditProfileModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
        />
      )}
    </div>
  )
}

export default Profile
