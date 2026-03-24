'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, UserPlus } from 'lucide-react'

export default function RegisterPage() {
  const router = useRouter()
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [nickname, setNickname] = useState('')
  const [inviteCode, setInviteCode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const params = new URLSearchParams(window.location.search)
    const invite = params.get('invite')
    if (invite) {
      setInviteCode(invite.trim().toUpperCase().slice(0, 6))
    }
  }, [])

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (password !== confirmPassword) {
      setError('两次输入的密码不一致')
      return
    }

    if (password.length < 6) {
      setError('密码长度至少 6 位')
      return
    }

    setLoading(true)

    try {
      // 注册
      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            nickname: nickname || null,
            invite_code: inviteCode || null,
          },
        },
      })

      if (authError) {
        setError(authError.message)
        return
      }

      // 注册成功后，如果有邀请码，处理邀请关系
      if (inviteCode.trim() && data.user) {
        // 查找邀请者
        const { data: inviter } = await supabase
          .from('profiles')
          .select('id')
          .eq('invite_code', inviteCode.trim().toUpperCase())
          .single()

        if (inviter && inviter.id !== data.user.id) {
          await supabase
            .from('profiles')
            .update({ invited_by: inviter.id })
            .eq('id', data.user.id)
        }
      }

      // Supabase 的 email confirmation 可能导致 user 不立即可用
      // 检查是否有 session（说明不需要邮箱验证）
      if (data.session) {
        router.push('/generate')
      } else {
        // 需要邮箱验证
        router.push('/generate')
      }
      router.refresh()
    } catch {
      setError('注册失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-orange-400 to-pink-500 text-white font-bold text-base">
              封
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent">
              封面工厂
            </span>
          </Link>
          <p className="mt-3 text-sm text-gray-500">注册账号，新用户送 2 积分</p>
        </div>

        {/* 注册卡片 */}
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-lg shadow-gray-100/50">
          <h1 className="mb-6 text-xl font-semibold text-gray-900">创建账号</h1>

          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nickname">昵称 <span className="text-gray-400 font-normal">(可选)</span></Label>
              <Input
                id="nickname"
                placeholder="你的昵称"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">邮箱</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">密码</Label>
              <Input
                id="password"
                type="password"
                placeholder="至少 6 位"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                autoComplete="new-password"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-password">确认密码</Label>
              <Input
                id="confirm-password"
                type="password"
                placeholder="再输入一次密码"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                autoComplete="new-password"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="invite-code">邀请码 <span className="text-gray-400 font-normal">(可选，填写后双方各得 2 积分)</span></Label>
              <Input
                id="invite-code"
                placeholder="好友的邀请码"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                maxLength={6}
                className="uppercase"
              />
            </div>

            {error && (
              <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-pink-500 py-5 text-base font-semibold shadow-lg shadow-orange-200 hover:shadow-xl transition-all disabled:opacity-40"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  注册中...
                </>
              ) : (
                <>
                  <UserPlus className="h-5 w-5" />
                  注册
                </>
              )}
            </Button>
          </form>

          <p className="mt-4 text-center text-sm text-gray-500">
            已有账号？{' '}
            <Link href="/auth/login" className="font-medium text-orange-600 hover:text-orange-700">
              去登录
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
