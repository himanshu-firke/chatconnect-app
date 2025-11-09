import React, { createContext, useContext, useReducer } from 'react'
import { mockData } from '../data/mockData'

const SocialContext = createContext()

const initialState = {
  user: mockData.currentUser,
  posts: mockData.posts,
  messages: mockData.messages,
  notifications: mockData.notifications,
  friends: mockData.friends,
  isLoggedIn: true
}

function socialReducer(state, action) {
  switch (action.type) {
    case 'ADD_POST':
      return {
        ...state,
        posts: [action.payload, ...state.posts]
      }
    case 'LIKE_POST':
      return {
        ...state,
        posts: state.posts.map(post =>
          post.id === action.payload
            ? { ...post, likes: post.likes + 1, isLiked: !post.isLiked }
            : post
        )
      }
    case 'ADD_COMMENT':
      return {
        ...state,
        posts: state.posts.map(post =>
          post.id === action.payload.postId
            ? { ...post, comments: [...post.comments, action.payload.comment] }
            : post
        )
      }
    case 'SEND_MESSAGE':
      return {
        ...state,
        messages: state.messages.map(conversation =>
          conversation.id === action.payload.conversationId
            ? {
                ...conversation,
                messages: [...conversation.messages, action.payload.message]
              }
            : conversation
        )
      }
    case 'MARK_NOTIFICATION_READ':
      return {
        ...state,
        notifications: state.notifications.map(notification =>
          notification.id === action.payload
            ? { ...notification, read: true }
            : notification
        )
      }
    case 'UPDATE_PROFILE':
      return {
        ...state,
        user: { ...state.user, ...action.payload }
      }
    case 'LOGOUT':
      return {
        ...state,
        isLoggedIn: false
      }
    default:
      return state
  }
}

export function SocialProvider({ children }) {
  const [state, dispatch] = useReducer(socialReducer, initialState)

  return (
    <SocialContext.Provider value={{ state, dispatch }}>
      {children}
    </SocialContext.Provider>
  )
}

export function useSocial() {
  const context = useContext(SocialContext)
  if (!context) {
    throw new Error('useSocial must be used within a SocialProvider')
  }
  return context
}
