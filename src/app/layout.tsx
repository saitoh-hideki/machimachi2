import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'まちまちチャット商店街',
  description: 'デジタル商店街プラットフォーム - 地域の魅力をAIチャットで体験',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  )
}