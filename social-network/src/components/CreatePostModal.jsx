import React, { useState } from 'react'
import { X, Image, Video, Smile } from 'lucide-react'
import { useSocial } from '../context/SocialContext'

function CreatePostModal({ isOpen, onClose }) {
  const { state, dispatch } = useSocial()
  const [postContent, setPostContent] = useState('')
  const [selectedImage, setSelectedImage] = useState(null)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (postContent.trim() || selectedImage) {
      const newPost = {
        id: Date.now(),
        author: {
          id: state.user.id,
          name: state.user.name,
          username: state.user.username,
          profilePicture: state.user.profilePicture
        },
        content: postContent,
        image: selectedImage,
        timestamp: 'now',
        likes: 0,
        isLiked: false,
        comments: [],
        shares: 0
      }
      
      dispatch({ type: 'ADD_POST', payload: newPost })
      setPostContent('')
      setSelectedImage(null)
      onClose()
    }
  }

  const handleImageSelect = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setSelectedImage(e.target.result)
      }
      reader.readAsDataURL(file)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">Create Post</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit}>
          <div className="p-4">
            {/* User Info */}
            <div className="flex items-center space-x-3 mb-4">
              <img
                src={state.user.profilePicture}
                alt={state.user.name}
                className="w-10 h-10 rounded-full"
              />
              <div>
                <h3 className="font-semibold text-gray-900">{state.user.name}</h3>
                <p className="text-sm text-gray-500">@{state.user.username}</p>
              </div>
            </div>

            {/* Post Content */}
            <textarea
              value={postContent}
              onChange={(e) => setPostContent(e.target.value)}
              placeholder="What's on your mind?"
              className="w-full h-32 p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />

            {/* Selected Image Preview */}
            {selectedImage && (
              <div className="mt-4 relative">
                <img
                  src={selectedImage}
                  alt="Selected"
                  className="w-full rounded-lg max-h-64 object-cover"
                />
                <button
                  type="button"
                  onClick={() => setSelectedImage(null)}
                  className="absolute top-2 right-2 bg-black bg-opacity-50 text-white rounded-full p-1 hover:bg-opacity-70"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}

            {/* Media Options */}
            <div className="flex items-center justify-between mt-4 pt-4 border-t">
              <div className="flex space-x-4">
                <label className="flex items-center space-x-2 text-gray-600 hover:text-primary-600 cursor-pointer transition-colors">
                  <Image className="h-5 w-5" />
                  <span>Photo</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="hidden"
                  />
                </label>
                <button
                  type="button"
                  className="flex items-center space-x-2 text-gray-600 hover:text-primary-600 transition-colors"
                >
                  <Video className="h-5 w-5" />
                  <span>Video</span>
                </button>
                <button
                  type="button"
                  className="flex items-center space-x-2 text-gray-600 hover:text-primary-600 transition-colors"
                >
                  <Smile className="h-5 w-5" />
                  <span>Emoji</span>
                </button>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-4 py-3 border-t bg-gray-50 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!postContent.trim() && !selectedImage}
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              Post
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreatePostModal
