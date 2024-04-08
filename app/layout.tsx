import '@/styles/globals.css'

import { EvoluProvider } from '@/components/providers/evoluProvider'
import type { Metadata, Viewport } from 'next'
import type { ReactNode } from 'react'

const APP_NAME = 'Pokemon Viewer'
const APP_DESCRIPTION = 'This is a PWA local-first Pokemon Viewer'

export const metadata: Metadata = {
  applicationName: APP_NAME,
  title: {
    default: APP_NAME,
    template: '%s - Pokemon Viewer',
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
        <EvoluProvider>{children}</EvoluProvider>
      </body>
    </html>
  )
}
