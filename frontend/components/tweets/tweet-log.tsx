'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import {
  MessageSquare,
  AlertTriangle,
  Flame,
  Ambulance,
  Shield,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from 'lucide-react'

interface DisasterTweet {
  location: string
  category: string
  tweet: string
  location1: string
  latitude: number
  longitude: number
  datetime: string
  multimodal: boolean
  file_path?: string | null
  Disaster_Category: string
  Relevancy: boolean
  Priority: number
  media_description?: string | null
  summary: string
  responders_required: string[]
}

interface TweetLogProps {
  tweets: DisasterTweet[]
  selectedTweet: DisasterTweet | null
  onSelectTweet: (tweet: DisasterTweet) => void
}

export default function TweetLog({
  tweets,
  selectedTweet,
  onSelectTweet,
}: TweetLogProps) {
  const [filter, setFilter] = useState('all') // 'all', 'high', 'medium', 'low'

  const getStatusIcon = (priority: number) => {
    switch (priority) {
      case 1:
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      case 2:
        return <AlertCircle className="h-4 w-4 text-yellow-500" />
      case 3:
        return <CheckCircle2 className="h-4 w-4 text-green-500" />
      default:
        return <MessageSquare className="h-4 w-4 text-gray-500" />
    }
  }

  const getServiceIcon = (service: string) => {
    switch (service.toLowerCase()) {
      case 'firefighters':
        return <Flame className="h-4 w-4 text-red-500" />
      case 'ambulance':
        return <Ambulance className="h-4 w-4 text-blue-500" />
      case 'police':
        return <Shield className="h-4 w-4 text-indigo-500" />
      default:
        return <MessageSquare className="h-4 w-4 text-gray-500" />
    }
  }

  const getPriorityColor = (priority: number) => {
    switch (priority) {
      case 1:
        return 'text-red-500'
      case 2:
        return 'text-yellow-500'
      case 3:
        return 'text-green-500'
      default:
        return 'text-gray-500'
    }
  }

  const filteredTweets = tweets.filter((tweet) => {
    if (filter === 'all') return true
    return tweet.Priority === parseInt(filter)
  })

  // Get category counts
  const categoryCounts = tweets.reduce((acc, tweet) => {
    acc[tweet.category] = (acc[tweet.category] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold">Tweet Log</h2>
        <div className="flex gap-2 mt-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 rounded-full text-sm ${
              filter === 'all'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('1')}
            className={`px-3 py-1 rounded-full text-sm ${
              filter === '1'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground'
            }`}
          >
            High Priority
          </button>
          <button
            onClick={() => setFilter('2')}
            className={`px-3 py-1 rounded-full text-sm ${
              filter === '2'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground'
            }`}
          >
            Medium Priority
          </button>
          <button
            onClick={() => setFilter('3')}
            className={`px-3 py-1 rounded-full text-sm ${
              filter === '3'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground'
            }`}
          >
            Low Priority
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        {filteredTweets.map((tweet) => {
          const key = `${tweet.datetime}-${tweet.location}-${
            tweet.category
          }-${tweet.tweet.slice(0, 20)}`
          console.log('Tweet Key:', key)
          return (
            <button
              key={key}
              onClick={() => onSelectTweet(tweet)}
              className={`w-full p-4 border-b hover:bg-muted/50 text-left flex items-start gap-3 ${
                selectedTweet?.datetime === tweet.datetime &&
                selectedTweet?.location === tweet.location
                  ? 'bg-muted'
                  : ''
              }`}
            >
              <div className="mt-1">
                {tweet.responders_required &&
                tweet.responders_required.length > 0 ? (
                  getServiceIcon(tweet.responders_required[0])
                ) : (
                  <MessageSquare className="h-4 w-4 text-gray-500" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{tweet.category}</p>
                    {tweet.responders_required &&
                      tweet.responders_required.length > 0 && (
                        <div className="flex -space-x-1">
                          {tweet.responders_required.map((service, index) => (
                            <div
                              key={service}
                              className={`h-4 w-4 ${index > 0 ? 'ml-1' : ''}`}
                            >
                              {getServiceIcon(service)}
                            </div>
                          ))}
                        </div>
                      )}
                  </div>
                  <span
                    className={`text-xs font-medium ${getPriorityColor(
                      tweet.Priority
                    )}`}
                  >
                    {tweet.Priority === 1
                      ? 'HIGH'
                      : tweet.Priority === 2
                      ? 'MEDIUM'
                      : 'LOW'}
                  </span>
                </div>

                <p className="text-sm text-muted-foreground truncate mt-1">
                  {tweet.summary || tweet.tweet}
                </p>

                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-muted-foreground">
                    {/* {format(
                      new Date(tweet.datetime.replace(' ', 'T')),
                      'HH:mm:ss'
                    )} */}
                  </span>
                  {getStatusIcon(tweet.Priority)}
                  <span className="text-xs capitalize">
                    {tweet.Disaster_Category}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    • {categoryCounts[tweet.category]} {tweet.category}
                  </span>
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
