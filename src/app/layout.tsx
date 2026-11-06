import type { Metadata } from 'next'
import { Shippori_Mincho, Zen_Kaku_Gothic_New } from 'next/font/google'
import './globals.css'

const sans = Zen_Kaku_Gothic_New({
  weight: ['400', '500', '700'],
  subsets: ['latin'],
  variable: '--font-sans',
})

const serif = Shippori_Mincho({
  weight: ['500', '700'],
  subsets: ['latin'],
  variable: '--font-serif',
})

export const metadata: Metadata = {
  title: 'LUXO Photo Editor',
  description: 'Edit your photos in the browser, with one-click looks or full manual control.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${sans.variable} ${serif.variable}`}>
      <body className="font-sans">{children}</body>
    </html>
  )
}
