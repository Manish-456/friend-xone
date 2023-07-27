import ToastProvider from '@/providers/ToastProvider'
import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Friend-Xone',
  description: 'Friend-Xone - Connect friends all around the world!',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}
      <ToastProvider/>
      </body>
    </html>
  )
}
