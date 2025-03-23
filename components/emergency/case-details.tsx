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
  Phone,
  AlertCircle,
  Shield,
  Ambulance,
  FileText,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface EmergencyTicket {
  ticket_id: string
  name: string
  location: string
  datetime: string
  status: string
  priority: string
  summary: string
  life_threatening: boolean
  breathing_issue: string
  fire_visibility: string
  smoke_visibility: string
  help_for_whom: string[]
  services_needed: string[]
  ticket_type: string
}

interface CaseDetailsProps {
  ticket: EmergencyTicket | null
}

export default function CaseDetails({ ticket }: CaseDetailsProps) {
  if (!ticket) {
    return (
      <div className="h-full flex items-center justify-center text-muted-foreground">
        Select a call to view details
      </div>
    )
  }

  const getServiceIcon = (service: string) => {
    switch (service.toLowerCase()) {
      case 'fire':
        return <Flame className="h-4 w-4" />
      case 'ambulance':
        return <Ambulance className="h-4 w-4" />
      case 'police':
        return <Shield className="h-4 w-4" />
      default:
        return <Phone className="h-4 w-4" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high':
        return 'bg-red-500/10 text-red-500 border-red-500/20'
      case 'medium':
        return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
      case 'low':
        return 'bg-green-500/10 text-green-500 border-green-500/20'
      default:
        return 'bg-gray-500/10 text-gray-500 border-gray-500/20'
    }
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold">Case Information</h2>
      </div>

      <div className="flex-1 w-full overflow-y-auto">
        <div className="p-4 space-y-6">
          {/* Summary */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Summary</span>
            </div>
            <p className="text-sm">{ticket.summary}</p>
          </div>

          {/* badges */}
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className={getPriorityColor(ticket.priority)}
            >
              {ticket.priority.toUpperCase()} PRIORITY
            </Badge>
            {ticket.life_threatening && (
              <Badge
                variant="outline"
                className="bg-red-500/10 text-red-500 border-red-500/20"
              >
                LIFE THREATENING
              </Badge>
            )}
          </div>

          {/* Basic Information */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Call Information</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>Name:</div>
              <div className="font-medium">{ticket.name || 'Unknown'}</div>
              <div>Ticket ID:</div>
              <div className="font-medium font-mono">{ticket.ticket_id}</div>
              <div>Status:</div>
              <div className="font-medium capitalize">{ticket.status}</div>
            </div>
          </div>

          {/* Location and Time */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Location</span>
            </div>
            <p className="text-sm">{ticket.location || 'Unknown location'}</p>

            <div className="flex items-center gap-2 mt-4">
              <CalendarClock className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Time</span>
            </div>
            <p className="text-sm">
              {format(new Date(ticket.datetime), 'PPpp')}
            </p>
          </div>

          {/* Emergency Details */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Emergency Details</span>
            </div>
            <div className="space-y-3">
              <div className="space-y-2 text-sm">
                {ticket.breathing_issue && (
                  <div className="flex items-center gap-2">
                    <Wind className="h-4 w-4 text-muted-foreground" />
                    <span>Breathing Issue: {ticket.breathing_issue}</span>
                  </div>
                )}

                {ticket.fire_visibility && (
                  <div className="flex items-center gap-2">
                    <Flame className="h-4 w-4 text-muted-foreground" />
                    <span>Fire Visibility: {ticket.fire_visibility}</span>
                  </div>
                )}

                {ticket.smoke_visibility && (
                  <div className="flex items-center gap-2">
                    <Cloud className="h-4 w-4 text-muted-foreground" />
                    <span>Smoke Visibility: {ticket.smoke_visibility}</span>
                  </div>
                )}

                {ticket.help_for_whom && ticket.help_for_whom.length > 0 && (
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>Help For: {ticket.help_for_whom.join(', ')}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Services Needed */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Services Needed</span>
            </div>
            {ticket?.services_needed &&
            Array.isArray(ticket.services_needed) ? (
              <div className="flex flex-wrap gap-2">
                {ticket.services_needed.map((service) => (
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
            ) : null}
          </div>
        </div>
      </div>
    </div>
  )
}
