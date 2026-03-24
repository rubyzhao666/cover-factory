import type { Metadata } from 'next'
import { Noto_Sans_SC, Noto_Serif_SC, ZCOOL_KuaiLe, Ma_Shan_Zheng, Inter } from 'next/font/google'
import { Header } from '@/components/header'
import { AuthProvider } from '@/lib/auth-context'
import { TooltipProvider } from '@/components/ui/tooltip'
import './globals.css'

const notoSansSC = Noto_Sans_SC({
  subsets: ['latin'],
  variable: '--font-noto-sans',
  display: 'swap',
  weight: ['300', '400', '500', '600', '700', '900'],
})

const notoSerifSC = Noto_Serif_SC({
  subsets: ['latin'],
  variable: '--font-noto-serif',
  display: 'swap',
  weight: ['400', '600', '700'],
})

const zcoolKuaiLe = ZCOOL_KuaiLe({
  subsets: ['latin'],
  variable: '--font-zcool',
  display: 'swap',
  weight: '400',
})

const maShanZheng = Ma_Shan_Zheng({
  subsets: ['latin'],
  variable: '--font-mashan',
  display: 'swap',
  weight: '400',
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: '封面工厂 — 多平台 AI 封面生成器',
  description: '一键生成小红书、抖音、公众号、B站、Instagram 等多平台封面，AI 驱动，13种风格，批量生成。',
  keywords: ['封面生成', '小红书封面', 'AI封面', '抖音封面', '公众号封面', '封面设计'],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="zh-CN">
      <body
        className={`${notoSansSC.variable} ${notoSerifSC.variable} ${zcoolKuaiLe.variable} ${maShanZheng.variable} ${inter.variable} font-sans antialiased`}
        style={{
          fontFamily: '"Noto Sans SC", "Inter", system-ui, sans-serif',
        }}
      >
        <AuthProvider>
          <TooltipProvider>
            <Header />
            <main className="min-h-screen">{children}</main>
            <footer className="border-t border-gray-100 py-8 text-center text-xs text-gray-400">
              <p>封面工厂 © 2025 — AI 驱动的多平台封面生成器</p>
            </footer>
          </TooltipProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
