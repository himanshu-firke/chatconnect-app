export const mockData = {
  currentUser: {
    id: 1,
    username: 'johndoe',
    name: 'John Doe',
    email: 'john@example.com',
    bio: 'Software developer passionate about creating amazing user experiences.',
    profilePicture: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    coverPhoto: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=300&fit=crop',
    friendsCount: 234,
    postsCount: 42
  },
  
  posts: [
    {
      id: 1,
      author: {
        id: 2,
        name: 'Alice Johnson',
        username: 'alice_j',
        profilePicture: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face'
      },
      content: 'Just finished an amazing hike in the mountains! The view was absolutely breathtaking. 🏔️',
      image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=400&fit=crop',
      timestamp: '2 hours ago',
      likes: 24,
      isLiked: false,
      comments: [
        {
          id: 1,
          author: 'Mike Chen',
          content: 'Looks amazing! Which trail did you take?',
          timestamp: '1 hour ago'
        }
      ],
      shares: 3
    },
    {
      id: 2,
      author: {
        id: 1,
        name: 'John Doe',
        username: 'johndoe',
        profilePicture: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
      },
      content: 'Working on a new React project today. The component architecture is coming together nicely! 💻',
      timestamp: '4 hours ago',
      likes: 18,
      isLiked: true,
      comments: [],
      shares: 2
    },
    {
      id: 3,
      author: {
        id: 3,
        name: 'Sarah Wilson',
        username: 'sarah_w',
        profilePicture: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face'
      },
      content: 'Beautiful sunset from my balcony tonight 🌅',
      image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=400&fit=crop',
      timestamp: '6 hours ago',
      likes: 45,
      isLiked: false,
      comments: [
        {
          id: 2,
          author: 'Emma Davis',
          content: 'Gorgeous colors!',
          timestamp: '5 hours ago'
        },
        {
          id: 3,
          author: 'Tom Brown',
          content: 'Perfect timing for this shot!',
          timestamp: '4 hours ago'
        }
      ],
      shares: 8
    }
  ],

  friends: [
    {
      id: 2,
      name: 'Alice Johnson',
      username: 'alice_j',
      profilePicture: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
      status: 'online'
    },
    {
      id: 3,
      name: 'Sarah Wilson',
      username: 'sarah_w',
      profilePicture: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
      status: 'offline'
    },
    {
      id: 4,
      name: 'Mike Chen',
      username: 'mike_c',
      profilePicture: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      status: 'online'
    },
    {
      id: 5,
      name: 'Emma Davis',
      username: 'emma_d',
      profilePicture: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face',
      status: 'away'
    }
  ],

  messages: [
    {
      id: 1,
      participant: {
        id: 2,
        name: 'Alice Johnson',
        profilePicture: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face'
      },
      lastMessage: 'Hey! How was your weekend?',
      timestamp: '10 min ago',
      unread: 2,
      messages: [
        {
          id: 1,
          senderId: 2,
          content: 'Hey! How was your weekend?',
          timestamp: '10:30 AM',
          isOwn: false
        },
        {
          id: 2,
          senderId: 1,
          content: 'It was great! Went hiking with some friends.',
          timestamp: '10:32 AM',
          isOwn: true
        },
        {
          id: 3,
          senderId: 2,
          content: 'That sounds amazing! I saw your photos.',
          timestamp: '10:35 AM',
          isOwn: false
        }
      ]
    },
    {
      id: 2,
      participant: {
        id: 4,
        name: 'Mike Chen',
        profilePicture: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'
      },
      lastMessage: 'Thanks for the help with the project!',
      timestamp: '2 hours ago',
      unread: 0,
      messages: [
        {
          id: 1,
          senderId: 4,
          content: 'Thanks for the help with the project!',
          timestamp: '8:15 AM',
          isOwn: false
        },
        {
          id: 2,
          senderId: 1,
          content: 'No problem! Happy to help anytime.',
          timestamp: '8:20 AM',
          isOwn: true
        }
      ]
    }
  ],

  notifications: [
    {
      id: 1,
      type: 'like',
      message: 'Alice Johnson liked your post',
      timestamp: '5 min ago',
      read: false,
      user: {
        name: 'Alice Johnson',
        profilePicture: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face'
      }
    },
    {
      id: 2,
      type: 'comment',
      message: 'Mike Chen commented on your post',
      timestamp: '1 hour ago',
      read: false,
      user: {
        name: 'Mike Chen',
        profilePicture: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'
      }
    },
    {
      id: 3,
      type: 'friend_request',
      message: 'Emma Davis sent you a friend request',
      timestamp: '3 hours ago',
      read: true,
      user: {
        name: 'Emma Davis',
        profilePicture: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face'
      }
    },
    {
      id: 4,
      type: 'message',
      message: 'Sarah Wilson sent you a message',
      timestamp: '1 day ago',
      read: true,
      user: {
        name: 'Sarah Wilson',
        profilePicture: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face'
      }
    }
  ],

  trendingTopics: [
    { id: 1, tag: '#ReactJS', posts: 1234 },
    { id: 2, tag: '#WebDevelopment', posts: 987 },
    { id: 3, tag: '#Photography', posts: 756 },
    { id: 4, tag: '#Travel', posts: 543 },
    { id: 5, tag: '#Technology', posts: 432 }
  ]
}
