'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import {
  Phone,
  AlertTriangle,
  Flame,
  Ambulance,
  Shield,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from 'lucide-react'

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
  transcripts: {
    role?: string
    text: string
  }[]
}

interface CallLogProps {
  tickets: EmergencyTicket[]
  selectedTicket: EmergencyTicket | null
  onSelectTicket: (ticket: EmergencyTicket) => void
}

export default function CallLog({
  tickets,
  selectedTicket,
  onSelectTicket,
}: CallLogProps) {
  const [filter, setFilter] = useState('all') // 'all', 'active', 'resolved'

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return <Clock className="h-4 w-4 text-yellow-500" />
      case 'resolved':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />
    }
  }

  const getServiceIcon = (service: string) => {
    switch (service.toLowerCase()) {
      case 'fire':
        return <Flame className="h-4 w-4 text-red-500" />
      case 'ambulance':
        return <Ambulance className="h-4 w-4 text-blue-500" />
      case 'police':
        return <Shield className="h-4 w-4 text-indigo-500" />
      default:
        return <Phone className="h-4 w-4 text-gray-500" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high':
        return 'text-red-500'
      case 'medium':
        return 'text-yellow-500'
      case 'low':
        return 'text-green-500'
      default:
        return 'text-gray-500'
    }
  }

  const filteredTickets = tickets.filter((ticket) => {
    if (filter === 'all') return true
    return ticket.status.toLowerCase() === filter
  })

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold">Ticket Log</h2>
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
            onClick={() => setFilter('active')}
            className={`px-3 py-1 rounded-full text-sm ${
              filter === 'active'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground'
            }`}
          >
            Active
          </button>
          <button
            onClick={() => setFilter('resolved')}
            className={`px-3 py-1 rounded-full text-sm ${
              filter === 'resolved'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground'
            }`}
          >
            Resolved
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        {filteredTickets.map((ticket) => (
          <button
            key={ticket.ticket_id}
            onClick={() => onSelectTicket(ticket)}
            className={`w-full p-4 border-b hover:bg-muted/50 text-left flex items-start gap-3 ${
              selectedTicket?.ticket_id === ticket.ticket_id ? 'bg-muted' : ''
            }`}
          >
            <div className="mt-1">
              {ticket.life_threatening ? (
                <AlertTriangle className="h-5 w-5 text-red-500" />
              ) : ticket?.services_needed &&
                ticket.services_needed.length > 0 ? (
                getServiceIcon(ticket.services_needed[0])
              ) : (
                <Phone className="h-4 w-4 text-gray-500" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <p className="font-medium">#{ticket.ticket_id}</p>
                  {ticket.services_needed &&
                    ticket.services_needed.length > 0 && (
                      <div className="flex -space-x-1">
                        {ticket.services_needed.map((service, index) => (
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
                    ticket.priority
                  )}`}
                >
                  {ticket.priority.toUpperCase()}
                </span>
              </div>

              <p className="text-sm text-muted-foreground truncate mt-1">
                {ticket.summary || 'No summary available'}
              </p>

              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-muted-foreground">
                  {format(new Date(ticket.datetime), 'HH:mm:ss')}
                </span>
                {getStatusIcon(ticket.status)}
                <span className="text-xs capitalize">{ticket.status}</span>
                {ticket.life_threatening && (
                  <span className="text-xs text-red-500 font-medium">
                    • LIFE THREATENING
                  </span>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
