'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Sparkles, PenTool, Home, LogIn, LogOut, Gift, Users } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { CreditBalance } from '@/components/credit-balance'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'

const navItems = [
  { href: '/', label: '首页', icon: Home },
  { href: '/generate', label: '生成封面', icon: Sparkles },
  { href: '/copywriting', label: '爆款文案', icon: PenTool },
]

export function Header() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, loading, signOut } = useAuth()

  const handleSignOut = async () => {
    await signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-100 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-orange-400 to-pink-500 text-white font-bold text-sm">
            封
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent">
            封面工厂
          </span>
        </Link>

        {/* 导航 + 用户状态 */}
        <div className="flex items-center gap-2">
          <nav className="flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-orange-50 text-orange-600'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{item.label}</span>
                </Link>
              )
            })}
          </nav>

          {/* 用户状态 */}
          <div className="ml-2 flex items-center gap-2">
            {loading ? (
              <div className="h-8 w-8 animate-pulse rounded-full bg-gray-200" />
            ) : user ? (
              <>
                <CreditBalance />

                <DropdownMenu>
                  <DropdownMenuTrigger>
                    <button className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-orange-400 to-pink-500 text-sm font-medium text-white transition-all hover:shadow-md">
                      {user.user_metadata?.nickname?.[0] || user.email?.[0]?.toUpperCase() || 'U'}
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <div className="px-2 py-1.5">
                      <p className="text-sm font-medium text-gray-900 truncate max-w-[180px]">
                        {user.user_metadata?.nickname || user.email?.split('@')[0] || '用户'}
                      </p>
                      <p className="text-xs text-gray-400 truncate max-w-[180px]">
                        {user.email}
                      </p>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => router.push('/invite')}>
                      <Users className="h-4 w-4" />
                      我的邀请
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push('/generate')}>
                      <Gift className="h-4 w-4" />
                      新用户注册送积分
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut}>
                      <LogOut className="h-4 w-4" />
                      退出登录
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <Link href="/auth/login">
                <div className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-orange-500 to-pink-500 px-4 py-2 text-sm font-medium text-white transition-all hover:shadow-md">
                  <LogIn className="h-4 w-4" />
                  <span className="hidden sm:inline">登录</span>
                </div>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
