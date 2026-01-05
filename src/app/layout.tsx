import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Photo Editor',
  description: 'Modern web-based photo editing for photographers',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}

