'use client'

import { format } from 'date-fns'
import {
  AlertTriangle,
  Wind,
  Flame,
  Cloud,
  Users,
  MapPin,
  CalendarClock,
  MessageSquare,
  AlertCircle,
  Shield,
  Ambulance,
  FileText,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'

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

interface TweetDetailsProps {
  tweet: DisasterTweet | null
}

export default function TweetDetails({ tweet }: TweetDetailsProps) {
  if (!tweet) {
    return (
      <div className="h-full flex items-center justify-center text-muted-foreground">
        Select a tweet to view details
      </div>
    )
  }

  const getServiceIcon = (service: string) => {
    switch (service.toLowerCase()) {
      case 'firefighters':
        return <Flame className="h-4 w-4" />
      case 'ambulance':
        return <Ambulance className="h-4 w-4" />
      case 'police':
        return <Shield className="h-4 w-4" />
      default:
        return <MessageSquare className="h-4 w-4" />
    }
  }

  const getPriorityColor = (priority: number) => {
    switch (priority) {
      case 1:
        return 'bg-red-500/10 text-red-500 border-red-500/20'
      case 2:
        return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
      case 3:
        return 'bg-green-500/10 text-green-500 border-green-500/20'
      default:
        return 'bg-gray-500/10 text-gray-500 border-gray-500/20'
    }
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold">Tweet Information</h2>
      </div>

      <div className="flex-1 w-full overflow-y-auto">
        <div className="p-4 space-y-6">
          {/* Original Tweet */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Original Tweet</span>
            </div>
            <p className="text-sm">{tweet.tweet}</p>
          </div>

          {/* Summary */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Summary</span>
            </div>
            <p className="text-sm">{tweet.summary}</p>
          </div>

          {/* badges */}
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className={getPriorityColor(tweet.Priority)}
            >
              {tweet.Priority === 1
                ? 'HIGH PRIORITY'
                : tweet.Priority === 2
                ? 'MEDIUM PRIORITY'
                : 'LOW PRIORITY'}
            </Badge>
            <Badge variant="outline">{tweet.category}</Badge>
          </div>

          {/* Basic Information */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Tweet Information</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>Category:</div>
              <div className="font-medium">{tweet.category}</div>
              <div>Disaster Type:</div>
              <div className="font-medium">{tweet.Disaster_Category}</div>
              <div>Relevancy:</div>
              <div className="font-medium">
                {tweet.Relevancy ? 'Relevant' : 'Not Relevant'}
              </div>
            </div>
          </div>

          {/* Location and Time */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Location</span>
            </div>
            <p className="text-sm">{tweet.location || 'Unknown location'}</p>

            <div className="flex items-center gap-2 mt-4">
              <CalendarClock className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Time</span>
            </div>
            <p className="text-sm">
              {format(new Date(tweet.datetime.replace(' ', 'T')), 'PPpp')}
            </p>
          </div>

          {/* Media Information */}
          {tweet.multimodal && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Media</span>
              </div>
              {tweet.media_description && (
                <p className="text-sm">{tweet.media_description}</p>
              )}
              {tweet.file_path && (
                <p className="text-sm text-muted-foreground">
                  File: {tweet.file_path}
                </p>
              )}
            </div>
          )}

          {/* Responders Required */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Responders Required</span>
            </div>
            {tweet.responders_required &&
            tweet.responders_required.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {tweet.responders_required.map((service) => (
                  <Badge
                    key={service}
                    variant="outline"
                    className="flex items-center gap-1"
                  >
                    {getServiceIcon(service)}
                    <span>{service}</span>
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No specific responders required
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
