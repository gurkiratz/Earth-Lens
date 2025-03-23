'use client'

import { format } from 'date-fns'

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
  transcripts: (string | { role: string; text: string })[]
}

interface TranscriptProps {
  selectedTicket: EmergencyTicket | null
}

export default function Transcript({ selectedTicket }: TranscriptProps) {
  if (!selectedTicket) {
    return (
      <div className="h-full flex items-center justify-center p-4 text-muted-foreground">
        <p>Select a call to view transcript</p>
      </div>
    )
  }

  return (
    <div className="h-96 flex flex-col">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold">Transcript</h2>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {selectedTicket.transcripts?.map((message, index) => {
          // If message is a string, it's from the user
          const isAI = typeof message !== 'string' && message.role === 'AI'
          const text = typeof message === 'string' ? message : message.text

          return (
            <div
              key={index}
              className={`flex ${isAI ? 'justify-start' : 'justify-end'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  isAI
                    ? 'bg-secondary text-secondary-foreground'
                    : 'bg-primary text-primary-foreground'
                }`}
              >
                <p className="text-sm">{text}</p>
              </div>
            </div>
          )
        })}
        {(!selectedTicket.transcripts ||
          selectedTicket.transcripts.length === 0) && (
          <div className="text-center text-muted-foreground">
            <p>No transcript available</p>
          </div>
        )}
      </div>
    </div>
  )
}
