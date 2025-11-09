import React, { useState } from 'react'
import { Heart, MessageCircle, Share, MoreHorizontal } from 'lucide-react'
import { useSocial } from '../context/SocialContext'

function PostCard({ post }) {
  const { dispatch } = useSocial()
  const [showComments, setShowComments] = useState(false)
  const [newComment, setNewComment] = useState('')

  const handleLike = () => {
    dispatch({ type: 'LIKE_POST', payload: post.id })
  }

  const handleComment = (e) => {
    e.preventDefault()
    if (newComment.trim()) {
      const comment = {
        id: Date.now(),
        author: 'You',
        content: newComment,
        timestamp: 'now'
      }
      dispatch({
        type: 'ADD_COMMENT',
        payload: { postId: post.id, comment }
      })
      setNewComment('')
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Post Header */}
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center space-x-3">
          <img
            src={post.author.profilePicture}
            alt={post.author.name}
            className="w-10 h-10 rounded-full"
          />
          <div>
            <h3 className="font-semibold text-gray-900">{post.author.name}</h3>
            <p className="text-sm text-gray-500">@{post.author.username} • {post.timestamp}</p>
          </div>
        </div>
        <button className="text-gray-400 hover:text-gray-600">
          <MoreHorizontal className="h-5 w-5" />
        </button>
      </div>

      {/* Post Content */}
      <div className="px-4 pb-3">
        <p className="text-gray-900 mb-3">{post.content}</p>
        {post.image && (
          <img
            src={post.image}
            alt="Post content"
            className="w-full rounded-lg max-h-96 object-cover"
          />
        )}
      </div>

      {/* Post Actions */}
      <div className="px-4 py-3 border-t border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <button
              onClick={handleLike}
              className={`flex items-center space-x-2 transition-colors ${
                post.isLiked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'
              }`}
            >
              <Heart className={`h-5 w-5 ${post.isLiked ? 'fill-current' : ''}`} />
              <span className="text-sm font-medium">{post.likes}</span>
            </button>
            <button
              onClick={() => setShowComments(!showComments)}
              className="flex items-center space-x-2 text-gray-500 hover:text-blue-500 transition-colors"
            >
              <MessageCircle className="h-5 w-5" />
              <span className="text-sm font-medium">{post.comments.length}</span>
            </button>
            <button className="flex items-center space-x-2 text-gray-500 hover:text-green-500 transition-colors">
              <Share className="h-5 w-5" />
              <span className="text-sm font-medium">{post.shares}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="border-t border-gray-100">
          {/* Existing Comments */}
          {post.comments.length > 0 && (
            <div className="px-4 py-3 space-y-3">
              {post.comments.map(comment => (
                <div key={comment.id} className="flex space-x-3">
                  <div className="w-8 h-8 bg-gray-300 rounded-full flex-shrink-0"></div>
                  <div className="flex-1">
                    <div className="bg-gray-100 rounded-lg px-3 py-2">
                      <p className="font-semibold text-sm text-gray-900">{comment.author}</p>
                      <p className="text-gray-700">{comment.content}</p>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{comment.timestamp}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Add Comment */}
          <form onSubmit={handleComment} className="px-4 py-3 border-t border-gray-100">
            <div className="flex space-x-3">
              <div className="w-8 h-8 bg-primary-600 rounded-full flex-shrink-0 flex items-center justify-center">
                <span className="text-white text-sm font-semibold">Y</span>
              </div>
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Write a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="w-full bg-gray-100 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}

export default PostCard
