import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import dynamic from 'next/dynamic'
import './globals.css'

const geist = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geist_mono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Authority Platform',
  description: 'Convert your YouTube channel into SEO-optimized authority',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body
        className={`${geist.variable} ${geist_mono.variable} font-sans antialiased`}
      >
        {children}
      </body>
    </html>
  )
}
