import type { Metadata, Viewport } from 'next'
import './globals.css'
import { Toaster } from 'sonner'
import { Header } from '@/components/header'

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#000',
}

export const metadata: Metadata = {
  title: 'Earth Lens | Emergency Response System & Disaster Visualization',
  description:
    'Real-time emergency response management system for coordinating fire, ambulance, and police services. Monitor and respond to emergency calls with live tracking and incident management.',
  keywords:
    'emergency response, dispatch system, emergency management, first responders, emergency services, incident tracking',
  authors: [{ name: 'Earth Lens Team' }],
  robots: {
    index: false,
    follow: false,
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <body>
        <Header />
        {children}
        <Toaster />
      </body>
    </html>
  )
}
