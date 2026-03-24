'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/lib/auth-context'
import { getInviteStats } from '@/lib/invite'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Copy, Check, Gift, Users, Coins, ArrowLeft, Share2 } from 'lucide-react'

export default function InvitePage() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const [inviteCode, setInviteCode] = useState('')
  const [copied, setCopied] = useState(false)
  const [stats, setStats] = useState<{
    totalInvited: number
    totalRewardCredits: number
    invites: Array<{
      nickname: string
      created_at: string
      has_paid: boolean
    }>
  } | null>(null)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login')
      return
    }
    if (user) {
      loadInviteInfo()
    }
  }, [user, loading, router])

  async function loadInviteInfo() {
    const supabase = createClient()
    if (!user) return

    // 获取邀请码
    const { data: profile } = await supabase
      .from('profiles')
      .select('invite_code')
      .eq('id', user.id)
      .single()

    if (profile?.invite_code) {
      setInviteCode(profile.invite_code)
    }

    // 获取邀请统计
    const inviteStats = await getInviteStats(supabase, user.id)
    if (inviteStats) {
      setStats({
        totalInvited: inviteStats.totalInvited,
        totalRewardCredits: inviteStats.totalRewardCredits,
        invites: inviteStats.invitees.map((i) => ({
          nickname: i.nickname || '匿名用户',
          created_at: i.created_at,
          has_paid: i.has_paid,
        })),
      })
    }
  }

  async function handleCopy() {
    const text = `我在使用「封面工厂」AI 生成多平台精美封面，新用户注册送 2 积分！使用我的邀请码 ${inviteCode} 注册，双方各得 2 积分~ 🎉`
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // fallback
      const textarea = document.createElement('textarea')
      textarea.value = text
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="animate-pulse text-gray-400">加载中...</div>
      </div>
    )
  }

  if (!user) return null

  const inviteUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/auth/register?invite=${inviteCode}`
    : ''

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      {/* 返回按钮 */}
      <Link
        href="/"
        className="mb-6 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        返回首页
      </Link>

      {/* 标题 */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">邀请好友</h1>
        <p className="mt-1 text-sm text-gray-500">分享你的邀请码，邀请好友注册，双方各得 2 积分</p>
      </div>

      {/* 邀请码卡片 */}
      <Card className="mb-6 overflow-hidden border-0 bg-gradient-to-br from-orange-500 to-pink-500 p-0 shadow-lg shadow-orange-200">
        <div className="p-6 text-center text-white">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-sm font-medium backdrop-blur-sm">
            <Gift className="h-4 w-4" />
            我的专属邀请码
          </div>
          <div className="mb-4 text-4xl font-bold tracking-widest">
            {inviteCode || '------'}
          </div>
          <p className="mb-4 text-sm text-orange-100">
            好友使用此邀请码注册，双方各得 2 积分
          </p>
          <div className="flex justify-center gap-3">
            <Button
              onClick={handleCopy}
              className="gap-2 bg-white text-orange-600 hover:bg-orange-50 rounded-xl"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4" />
                  已复制
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  复制邀请文案
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                if (navigator.share) {
                  navigator.share({
                    title: '封面工厂 - AI封面生成器',
                    text: `我在使用「封面工厂」AI 生成多平台精美封面，使用我的邀请码 ${inviteCode} 注册，双方各得 2 积分！`,
                    url: inviteUrl,
                  })
                }
              }}
              className="gap-2 bg-white/10 border-white/20 text-white hover:bg-white/20 rounded-xl"
            >
              <Share2 className="h-4 w-4" />
              分享
            </Button>
          </div>
        </div>
      </Card>

      {/* 邀请链接 */}
      <Card className="mb-6 p-4">
        <label className="mb-2 block text-sm font-medium text-gray-700">邀请链接</label>
        <div className="flex gap-2">
          <Input
            readOnly
            value={inviteUrl}
            className="flex-1 bg-gray-50 text-sm"
            onClick={(e) => (e.target as HTMLInputElement).select()}
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              navigator.clipboard.writeText(inviteUrl)
              setCopied(true)
              setTimeout(() => setCopied(false), 2000)
            }}
            className="shrink-0"
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          </Button>
        </div>
      </Card>

      {/* 奖励说明 */}
      <Card className="mb-6 p-5">
        <h2 className="mb-4 text-base font-semibold text-gray-900">奖励规则</h2>
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-orange-50 text-sm">
              👤
            </div>
            <div>
              <p className="text-sm font-medium text-gray-800">好友注册</p>
              <p className="text-xs text-gray-500">好友通过你的邀请码注册成功，双方各得 <span className="font-medium text-orange-600">+2 积分</span></p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-orange-50 text-sm">
              💰
            </div>
            <div>
              <p className="text-sm font-medium text-gray-800">好友付费</p>
              <p className="text-xs text-gray-500">好友首次购买套餐，你额外获得 <span className="font-medium text-orange-600">+5 积分</span></p>
            </div>
          </div>
        </div>
      </Card>

      {/* 邀请统计 */}
      <Card className="p-5">
        <h2 className="mb-4 text-base font-semibold text-gray-900">邀请记录</h2>
        <div className="mb-4 flex gap-4">
          <div className="flex-1 rounded-xl bg-orange-50 p-4 text-center">
            <Users className="mx-auto mb-1 h-5 w-5 text-orange-500" />
            <p className="text-2xl font-bold text-gray-900">{stats?.totalInvited ?? 0}</p>
            <p className="text-xs text-gray-500">已邀请好友</p>
          </div>
          <div className="flex-1 rounded-xl bg-orange-50 p-4 text-center">
            <Coins className="mx-auto mb-1 h-5 w-5 text-orange-500" />
            <p className="text-2xl font-bold text-gray-900">{stats?.totalRewardCredits ?? 0}</p>
            <p className="text-xs text-gray-500">获得积分</p>
          </div>
        </div>

        {stats?.invites && stats.invites.length > 0 ? (
          <div className="space-y-2">
            {stats.invites.map((invite, i) => (
              <div
                key={i}
                className="flex items-center justify-between rounded-lg border border-gray-100 px-3 py-2"
              >
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-orange-400 to-pink-500 text-xs text-white">
                    {(invite.nickname || '?')[0]}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">{invite.nickname || '匿名用户'}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(invite.created_at).toLocaleDateString('zh-CN')}
                    </p>
                  </div>
                </div>
                {invite.has_paid ? (
                  <span className="rounded-full bg-green-50 px-2 py-0.5 text-xs text-green-600">已付费</span>
                ) : (
                  <span className="rounded-full bg-gray-50 px-2 py-0.5 text-xs text-gray-400">已注册</span>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="py-4 text-center text-sm text-gray-400">
            暂无邀请记录，快去分享你的邀请码吧！
          </p>
        )}
      </Card>
    </div>
  )
}
