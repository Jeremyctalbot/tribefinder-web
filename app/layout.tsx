import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: 'Tribe Finder Co',
  description:
    'Discover churches near you, understand why they match, and plan your visit with confidence. Tribe Finder helps you find a church that actually fits.',
  keywords: [
    'church finder',
    'find a church',
    'church near me',
    'christian app',
    'church discovery',
    'tribe finder',
  ],
  openGraph: {
    title: 'Tribe Finder Co',
    description:
      'Find a church that actually fits. Discover, match, and plan your visit.',
    url: 'https://tribefinderapp.co',
    siteName: 'Tribe Finder Co',
    type: 'website',
  },
  icons: {
    icon: '/logo.png',
    shortcut: '/logo.png',
    apple: '/logo.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
  <html lang="en">
    <head>
      <title>Tribe Finder Co</title>
      <link rel="icon" href="/logo.png?v=2" />
      <link rel="shortcut icon" href="/logo.png?v=2" />
      <link rel="apple-touch-icon" href="/logo.png?v=2" />
    </head>
    <body className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      {children}
    </body>
  </html>
)
}