import React from 'react'
import { TrendingUp } from 'lucide-react'
import { mockData } from '../data/mockData'

function TrendingTopics() {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div className="flex items-center space-x-2 mb-4">
        <TrendingUp className="h-5 w-5 text-primary-600" />
        <h3 className="font-semibold text-gray-900">Trending Topics</h3>
      </div>
      
      <div className="space-y-3">
        {mockData.trendingTopics.map((topic, index) => (
          <div key={topic.id} className="flex items-center justify-between hover:bg-gray-50 p-2 rounded-lg cursor-pointer transition-colors">
            <div>
              <p className="font-medium text-primary-600">{topic.tag}</p>
              <p className="text-sm text-gray-500">{topic.posts.toLocaleString()} posts</p>
            </div>
            <span className="text-xs text-gray-400">#{index + 1}</span>
          </div>
        ))}
      </div>
      
      <button className="w-full mt-4 text-sm text-primary-600 hover:text-primary-700 font-medium">
        Show more
      </button>
    </div>
  )
}

export default TrendingTopics
