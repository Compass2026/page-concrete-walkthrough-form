import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Page Concrete Walkthrough',
  description: 'Client details and project walkthrough form.',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Page Concrete',
  },
  openGraph: {
    title: 'Page Concrete Walkthrough',
    description: 'Client details and project walkthrough form.',
    siteName: 'Page Concrete & Outdoor Services',
    images: [
      {
        url: '/opengraph-image.png',
        width: 1200,
        height: 630,
        alt: 'Page Concrete & Outdoor Services logo',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Page Concrete Walkthrough',
    description: 'Client details and project walkthrough form.',
    images: ['/opengraph-image.png'],
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="#0a1628" />
      </head>
      <body>{children}</body>
    </html>
  )
}
