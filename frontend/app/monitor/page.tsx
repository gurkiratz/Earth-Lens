'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, Filter } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'

// Dynamically import the map component to avoid SSR issues
const TweetMap = dynamic(() => import('@/components/tweets/tweet-map'), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full flex items-center justify-center bg-muted/50">
      Loading map...
    </div>
  ),
})

const TweetLog = dynamic(() => import('@/components/tweets/tweet-log'), {
  loading: () => (
    <div className="h-full w-full flex items-center justify-center bg-muted/50">
      Loading tweets...
    </div>
  ),
})

const TweetDetails = dynamic(
  () => import('@/components/tweets/tweet-details'),
  {
    loading: () => (
      <div className="h-full w-full flex items-center justify-center bg-muted/50">
        Loading details...
      </div>
    ),
  }
)

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

export default function TweetsPage() {
  const [tweets, setTweets] = useState<DisasterTweet[]>([])
  const [selectedTweet, setSelectedTweet] = useState<DisasterTweet | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')

  useEffect(() => {
    // Fetch tweets data
    fetch('/tweets-data.csv')
      .then((response) => response.text())
      .then((data) => {
        // Parse CSV data
        const rows = data.split('\n').slice(1) // Skip header row
        const parsedTweets = rows
          .filter((row) => row.trim())
          .map((row) => {
            const [
              location,
              category,
              tweet,
              location1,
              latitude,
              longitude,
              datetime,
              multimodal,
              file_path,
              Disaster_Category,
              Relevancy,
              Priority,
              media_description,
              summary,
              responders_required,
            ] = row.split(',')

            // Clean up the responders_required string and parse it
            const cleanResponders = responders_required
              .replace(/^\[|\]$/g, '') // Remove outer brackets
              .replace(/'/g, '"') // Replace single quotes with double quotes
              .split(',') // Split by comma
              .map((item) => item.trim()) // Trim whitespace
              .filter(Boolean) // Remove empty items

            return {
              location,
              category,
              tweet,
              location1,
              latitude: parseFloat(latitude),
              longitude: parseFloat(longitude),
              datetime,
              multimodal: multimodal === 'True',
              file_path: file_path || null,
              Disaster_Category,
              Relevancy: Relevancy === 'True',
              Priority: parseInt(Priority),
              media_description: media_description || null,
              summary,
              responders_required: cleanResponders,
            }
          })
        setTweets(parsedTweets)
      })
      .catch((error) => console.error('Error loading tweets:', error))
  }, [])

  const filteredTweets = tweets.filter((tweet) => {
    const matchesSearch =
      searchQuery === '' ||
      tweet.tweet.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tweet.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tweet.summary.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesCategory =
      categoryFilter === 'all' || tweet.category === categoryFilter

    return matchesSearch && matchesCategory
  })

  const categories = Array.from(new Set(tweets.map((tweet) => tweet.category)))
  const categoryCounts = categories.reduce((acc, category) => {
    acc[category] = tweets.filter((tweet) => tweet.category === category).length
    return acc
  }, {} as Record<string, number>)

  return (
    <div className="container mx-auto p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Social Media Alerts</h1>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search tweets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="h-10 pl-8 pr-8 rounded-md border bg-background"
            >
              <option value="all">All Categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category} ({categoryCounts[category]})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4 h-[calc(100vh-12rem)]">
        <Card className="col-span-3 flex flex-col">
          <TweetLog
            tweets={filteredTweets}
            selectedTweet={selectedTweet}
            onSelectTweet={setSelectedTweet}
          />
        </Card>

        <Card className="col-span-6 flex flex-col">
          <TweetMap selectedTweet={selectedTweet} tweets={filteredTweets} />
        </Card>

        <Card className="col-span-3 flex flex-col">
          <TweetDetails tweet={selectedTweet} />
        </Card>
      </div>
    </div>
  )
}
