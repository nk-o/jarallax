import type { Metadata } from "next"
import { Inter } from "next/font/google"
import type { ReactNode } from 'react'

import '@/assets/css/globals.css'

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: 'Jarallax Example | Nextjs',
  description: "Parallax scrolling for modern browsers",
  authors: {
    name: 'Nikita',
    url: 'https://github.com/nk-o',
  }
}

export default function RootLayout ({ children, }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
