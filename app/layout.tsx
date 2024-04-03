import '@/styles/globals.css'

import { EvoluProvider } from '@/components/providers/evoluProvider'
import type { Metadata, Viewport } from 'next'
import type { ReactNode } from 'react'
import Link from 'next/link'

const APP_NAME = 'next-pwa example'
const APP_DESCRIPTION = 'This is an example of using next-pwa'

export const metadata: Metadata = {
  applicationName: APP_NAME,
  title: {
    default: APP_NAME,
    template: '%s - PWA App',
  },
  description: APP_DESCRIPTION,
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: APP_NAME,
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    shortcut: '/favicon.ico',
    apple: [{ url: '/icons/apple-touch-icon.png', sizes: '180x180' }],
  },
}

export const viewport: Viewport = {
  themeColor: '#FFFFFF',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" dir="ltr">
      <body suppressHydrationWarning>
        <header className="flex border-b py-3 justify-center gap-8">
          <Link href="/">Home</Link>
          <Link href="/favorites">Favorites</Link>
        </header>
        <EvoluProvider>{children}</EvoluProvider>
      </body>
    </html>
  )
}
