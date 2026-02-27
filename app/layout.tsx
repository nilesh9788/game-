import type { Metadata } from 'next'
import { Syne } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const syne = Syne({ subsets: ["latin"], variable: '--font-syne' });

export const metadata: Metadata = {
  title: 'GameHub - Play Online Games & Solve Rubik\'s Cube',
  description: 'A collection of online games including Rubik\'s Cube Solver with 3D visualization, Chess, Tic Tac Toe, and more',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={syne.variable}>
      <body className="font-sans antialiased dark bg-neutral-950 text-neutral-50">
        {children}
        <Analytics />
      </body>
    </html>
  )
}
