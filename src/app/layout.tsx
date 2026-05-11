import type { Metadata } from 'next'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

export const metadata: Metadata = {
  title: '文学星盘 · Literary Zodiac',
  description: '你的文字比你更诚实。输入一段原创文字，发现你的文学星座。',
  openGraph: {
    title: '文学星盘 · Literary Zodiac',
    description: '你的文字比你更诚实。100位世界作家，三个星位，你的专属文学星盘。',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh">
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
