'use client'

import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Coins, Gift, MessageCircle } from 'lucide-react'

interface PaywallDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  type?: 'cover' | 'copywriting'
}

const SHOW_PAYMENT_ENTRY = false

export function PaywallDialog({ open, onOpenChange, type = 'cover' }: PaywallDialogProps) {
  const router = useRouter()
  const { user } = useAuth()
  const typeName = type === 'cover' ? '封面' : '文案'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-lg">
            💔 免费额度已用完
          </DialogTitle>
          <DialogDescription className="text-center">
            今日免费{typeName}生成次数已用完，注册或充值即可继续使用
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* 积分状态 */}
          <div className="rounded-xl bg-gray-50 p-4 text-center">
            <div className="flex items-center justify-center gap-2">
              <Coins className="h-5 w-5 text-orange-500" />
              <span className="text-sm text-gray-600">
                {user ? '当前积分余额' : '每日免费额度'}
              </span>
            </div>
            <p className="mt-1 text-3xl font-bold text-orange-500">0</p>
          </div>

          {/* 操作按钮 */}
          <div className="space-y-3">
            {!user && (
              <Button
                onClick={() => {
                  onOpenChange(false)
                  router.push('/auth/register')
                }}
                className="w-full gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-pink-500 py-5 text-base font-semibold"
              >
                <Gift className="h-5 w-5" />
                注册送 2 积分，立即体验
              </Button>
            )}

            {SHOW_PAYMENT_ENTRY && (
              <Button
                onClick={() => {
                  onOpenChange(false)
                  router.push('/pricing')
                }}
                variant="outline"
                className="w-full gap-2 rounded-xl py-4 text-base"
              >
                <Coins className="h-5 w-5 text-orange-500" />
                充值积分
              </Button>
            )}

            <Button
              onClick={() => {
                onOpenChange(false)
                router.push('/invite')
              }}
              variant="outline"
              className="w-full gap-2 rounded-xl py-4 text-base"
            >
              <MessageCircle className="h-5 w-5 text-pink-500" />
              邀请好友赚积分
            </Button>
          </div>

          {/* 客服二维码 */}
          <div className="flex flex-col items-center pt-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/ruby-wechat-qr.png"
              alt="客服微信二维码"
              className="mb-2 h-28 w-28 rounded-lg border border-gray-200 object-cover"
            />
            <p className="text-xs text-gray-400">扫码联系客服，获取帮助</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
