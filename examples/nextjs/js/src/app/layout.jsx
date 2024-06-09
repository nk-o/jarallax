import { Inter } from "next/font/google";

import '@/assets/css/globals.css';

const inter = Inter({
  subsets: ["latin"]
});

export const metadata = {
  title: 'Jarallax Example | Nextjs',
  description: "Parallax scrolling for modern browsers",
  authors: {
    name: 'Nikita',
    url: 'https://github.com/nk-o'
  }
};

export default function RootLayout({
  children
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>)
}
