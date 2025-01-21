import './globals.css'
import { Inter } from 'next/font/google'
import { Providers } from './providers'
import Navigation from '@/components/Navigation'

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata = {
  title: 'Taste Palette Explorer',
  description: 'Get personalized menu recommendations based on your taste preferences',
  keywords: ['menu', 'food', 'recommendations', 'AI', 'taste', 'preferences'],
  authors: [{ name: 'Taste Palette Team' }],
  viewport: 'width=device-width, initial-scale=1',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen font-sans antialiased bg-gray-50">
        <Providers>
          <div className="flex flex-col min-h-screen">
            <Navigation />
            <main className="flex-grow">
              {children}
            </main>
          </div>
        </Providers>
      </body>
    </html>
  )
}
