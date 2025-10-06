import Header from '@/components/navbar/Header'
import './globals.css'
import { Inter } from 'next/font/google'
import Footer from '@/components/footer/Footer'
import { ReactNode } from 'react'
import { Toaster } from 'sonner'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'CineWorld',
  description: 'A World of Cinema',
}

interface RootLayoutProps {
  children: ReactNode
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Header/>
        <div className='mt-32'>
          {children}
        </div>

        <Footer/>
        <Toaster position="top-right" richColors />
        </body>
    </html>
  )
}
