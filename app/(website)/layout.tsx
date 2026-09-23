import type { Metadata } from 'next'
import { Inter, Poppins } from 'next/font/google'
import '../globals.css'
import { WebsiteNavbar } from '@/components/website/website-navbar'
import { WebsiteFooter } from '@/components/website/website-footer'
import { getNavbarCategories } from '@/components/website/navbar-categories'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const poppins = Poppins({ 
  subsets: ['latin'], 
  variable: '--font-poppins',
  weight: ['400', '500', '600', '700', '800']
})

export const metadata: Metadata = {
  title: 'Feenix Repair - B2B Marketplace',
  description: 'B2B marketplace for repair services and parts',
}

export default async function WebsiteLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const categories = await getNavbarCategories()

  return (
    <div className={`${inter.variable} ${poppins.variable} min-h-screen flex flex-col font-sans`}>
      <WebsiteNavbar categories={categories} />
      <main className="flex-1 pt-24 md:pt-28">{children}</main>
      <WebsiteFooter />
    </div>
  )
}
