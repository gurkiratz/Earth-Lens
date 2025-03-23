'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export function Header() {
  const pathname = usePathname()

  return (
    <header className="border-b">
      <div className="container flex items-center justify-between py-1">
        <Link
          href="/"
          className="font-mono text-sm text-primary hover:text-primary/70 transition-colors"
        >
          earth-lens
        </Link>
        <nav className="flex gap-4 text-xs">
          <Link
            href="/"
            className={`transition-colors ${
              pathname === '/'
                ? 'text-primary font-medium'
                : 'text-muted-foreground hover:text-primary'
            }`}
          >
            Historical
          </Link>
          <Link
            href="/emergency"
            className={`transition-colors ${
              pathname === '/emergency'
                ? 'text-primary font-medium'
                : 'text-muted-foreground hover:text-primary'
            }`}
          >
            Real-time
          </Link>
          <Link
            href="/monitor"
            className={`transition-colors ${
              pathname === '/monitor'
                ? 'text-primary font-medium'
                : 'text-muted-foreground hover:text-primary'
            }`}
          >
            Check Alerts
          </Link>
        </nav>
      </div>
    </header>
  )
}
