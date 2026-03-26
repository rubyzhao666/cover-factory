'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Check, Sparkles, Zap, Crown } from 'lucide-react'
import type { PricingPlan } from '@/lib/types'

const defaultPlans: PricingPlan[] = [
  {
    id: 'monthly',
    name: '月度会员',
    price: 990,
    credits: 50,
    original_price: 1490,
    duration_days: 30,
    is_popular: false,
    sort_order: 1,
  },
  {
    id: 'quarterly',
    name: '季度会员',
    price: 2490,
    credits: 200,
    original_price: 4470,
    duration_days: 90,
    is_popular: true,
    sort_order: 2,
  },
  {
    id: 'yearly',
    name: '年度会员',
    price: 7990,
    credits: 1000,
    original_price: 17880,
    duration_days: 365,
    is_popular: false,
    sort_order: 3,
  },
]

function formatPrice(cents: number): string {
  return (cents / 100).toFixed(1)
}

export default function PricingPage() {
  const [plans, setPlans] = useState<PricingPlan[]>(defaultPlans)

  // 从 Supabase 加载套餐
  useEffect(() => {
    async function fetchPlans() {
      try {
        const supabase = createClient()
        const { data } = await supabase
          .from('pricing_plans')
          .select('*')
          .order('sort_order', { ascending: true })

        if (data && data.length > 0) {
          setPlans(data as PricingPlan[])
        }
      } catch {
        // 使用默认套餐
      }
    }
    fetchPlans()
  }, [])

  const planIcons = [Zap, Sparkles, Crown]

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      {/* 页头 */}
      <div className="mb-10 text-center">
        <h1 className="mb-3 text-3xl font-bold text-gray-900">
          选择适合你的方案
        </h1>
        <p className="text-gray-500">
          每次生成消耗 1 积分，积分永久有效
        </p>
        <p className="mt-2 text-sm text-orange-600">
          支付功能内测中，暂未开放购买
        </p>
      </div>

      {/* 套餐卡片 */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {plans.map((plan, index) => {
          const Icon = planIcons[index] || Sparkles
          const discount = Math.round(
            (1 - plan.price / plan.original_price) * 100
          )

          return (
            <div
              key={plan.id}
              className={`relative rounded-2xl border-2 bg-white p-6 shadow-sm transition-all hover:shadow-lg ${
                plan.is_popular
                  ? 'border-orange-400 shadow-lg shadow-orange-100'
                  : 'border-gray-100 hover:border-gray-200'
              }`}
            >
              {plan.is_popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="rounded-full bg-gradient-to-r from-orange-500 to-pink-500 px-3 py-1 text-xs text-white border-0">
                    🔥 最受欢迎
                  </Badge>
                </div>
              )}

              <div className="mb-4 flex items-center gap-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                  plan.is_popular
                    ? 'bg-gradient-to-br from-orange-400 to-pink-500'
                    : 'bg-gray-100'
                }`}>
                  <Icon className={`h-5 w-5 ${
                    plan.is_popular ? 'text-white' : 'text-gray-600'
                  }`} />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-gray-900">{plan.name}</h3>
                  <p className="text-xs text-gray-400">{plan.duration_days} 天有效</p>
                </div>
              </div>

              <div className="mb-4">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-gray-900">
                    ¥{formatPrice(plan.price)}
                  </span>
                  {discount > 0 && (
                    <span className="text-sm text-gray-400 line-through">
                      ¥{formatPrice(plan.original_price)}
                    </span>
                  )}
                </div>
                {discount > 0 && (
                  <Badge variant="secondary" className="mt-1 text-xs text-orange-600 bg-orange-50 border-0">
                    省 {discount}%
                  </Badge>
                )}
              </div>

              <div className="mb-6 space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Check className="h-4 w-4 text-orange-500" />
                  <span><strong className="text-gray-900">{plan.credits}</strong> 积分</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Check className="h-4 w-4 text-orange-500" />
                  <span>约可生成 <strong className="text-gray-900">{plan.credits}</strong> 次</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Check className="h-4 w-4 text-orange-500" />
                  <span>积分永久有效</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Check className="h-4 w-4 text-orange-500" />
                  <span>支付功能内测中</span>
                </div>
              </div>

              <Button
                disabled
                className={`w-full rounded-xl py-4 text-base font-semibold transition-all ${
                  plan.is_popular
                    ? 'bg-gradient-to-r from-orange-500 to-pink-500 shadow-lg shadow-orange-200 hover:shadow-xl'
                    : 'bg-gray-900 hover:bg-gray-800'
                }`}
              >
                敬请期待
              </Button>
            </div>
          )
        })}
      </div>

      {/* 底部说明 */}
      <div className="mt-12 rounded-2xl bg-gray-50 p-6 text-center">
        <p className="text-sm text-gray-500">
          💡 邀请好友注册，双方各得 2 积分；好友付费后，你再得 5 积分。
          <Link href="/invite" className="ml-1 font-medium text-orange-600 hover:text-orange-700">
            去邀请 →
          </Link>
        </p>
      </div>
    </div>
  )
}
