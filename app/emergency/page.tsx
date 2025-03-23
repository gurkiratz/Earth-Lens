'use client'

import { useEffect, useState } from 'react'
import { initializeApp } from 'firebase/app'
import {
  getFirestore,
  collection,
  onSnapshot,
  query,
  orderBy,
} from 'firebase/firestore'
import EmergencyMap from '@/components/emergency/emergency-map'
import CallLog from '@/components/emergency/call-log'
import Transcript from '@/components/emergency/transcript'
import CaseDetails from '@/components/emergency/case-details'

// Your Firebase configuration
const firebaseConfig = {
  // Add your Firebase config here
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

// Add debug logging for Firebase config
console.log('Firebase Project ID:', firebaseConfig.projectId)
console.log('Firebase Auth Domain:', firebaseConfig.authDomain)
console.log('Firebase API Key:', firebaseConfig.apiKey)
console.log('Firebase App ID:', firebaseConfig.appId)

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

export default function EmergencyDashboard() {
  const [tickets, setTickets] = useState<EmergencyTicket[]>([])
  const [selectedTicket, setSelectedTicket] = useState<EmergencyTicket | null>(
    null
  )
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    console.log('Starting to fetch tickets...')

    try {
      // Subscribe to Firestore updates
      const ticketsRef = collection(db, 'tickets')
      const q = query(ticketsRef, orderBy('datetime', 'desc'))

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          console.log('onSnapshot called')
          console.log(
            'Received Firestore snapshot:',
            snapshot.size,
            'documents'
          )

          const newTickets = snapshot.docs.map((doc) => {
            console.log('Document data:', doc.data())
            const data = doc.data()
            // Parse datetime if it's a Firestore timestamp
            const datetime = data.datetime?.toDate?.()
              ? data.datetime.toDate().toISOString()
              : data.datetime

            // Ensure transcripts is always an array
            const transcripts = Array.isArray(data.transcripts)
              ? data.transcripts
              : []

            return {
              ticket_id: doc.id,
              ...data,
              datetime,
              transcripts,
            } as EmergencyTicket
          })

          setTickets(newTickets)
          setLoading(false)

          // If we have tickets but none selected, select the first one
          if (newTickets.length > 0 && !selectedTicket) {
            setSelectedTicket(newTickets[0])
          }

          console.log('Data loaded successfully')
        },
        (error) => {
          console.error('Firestore subscription error:', error)
          setLoading(false)
        }
      )

      return () => unsubscribe()
    } catch (error) {
      console.error('Error setting up Firestore listener:', error)
      setLoading(false)
    }
  }, [selectedTicket]) // Add selectedTicket as dependency to prevent unnecessary auto-selection

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-background p-4">
      <div className="grid grid-cols-12 gap-4 h-[calc(100vh-2rem)]">
        {/* Call Log */}
        <div className="col-span-3 bg-card rounded-lg overflow-hidden">
          <CallLog
            tickets={tickets}
            selectedTicket={selectedTicket}
            onSelectTicket={setSelectedTicket}
          />
        </div>

        {/* Map */}
        <div className="col-span-6 bg-card rounded-lg overflow-hidden">
          <EmergencyMap selectedTicket={selectedTicket} />
        </div>

        {/* Transcript and Case Details */}
        <div className="col-span-3 space-y-4">
          <div className="bg-card rounded-lg h-96 overflow-hidden">
            <Transcript selectedTicket={selectedTicket} />
          </div>
          <div className="bg-card rounded-lg h-1/2 overflow-hidden">
            <CaseDetails ticket={selectedTicket} />
          </div>
        </div>
      </div>
    </main>
  )
}
