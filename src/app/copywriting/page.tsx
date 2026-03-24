'use client'

import { useState, useCallback, useEffect } from 'react'
import { PenTool, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { PaywallDialog } from '@/components/paywall-dialog'
import { useAuth } from '@/lib/auth-context'
import { createClient } from '@/lib/supabase/client'
import { checkCopywritingQuotaLocal, consumeCopywritingQuotaLocal, getUserCredits } from '@/lib/quota'
import { platforms, copywritingTypes } from '@/lib/constants'
import { CopywritingResult } from '@/components/copywriting-result'

export default function CopywritingPage() {
  const { user, loading: authLoading } = useAuth()

  const [platform, setPlatform] = useState('xiaohongshu')
  const [topic, setTopic] = useState('')
  const [type, setType] = useState('viral-title')
  const [notes, setNotes] = useState('')

  const [isGenerating, setIsGenerating] = useState(false)
  const [content, setContent] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [history, setHistory] = useState<{ topic: string; content: string }[]>([])

  // 付费弹窗
  const [showPaywall, setShowPaywall] = useState(false)
  // 积分余额
  const [credits, setCredits] = useState<number | null>(null)

  useEffect(() => {
    async function fetchCredits() {
      if (!user) {
        setCredits(null)
        return
      }
      const supabase = createClient()
      const balance = await getUserCredits(supabase, user.id)
      setCredits(balance)
    }
    if (!authLoading) fetchCredits()
  }, [user, authLoading])

  const handleGenerate = useCallback(async () => {
    if (!topic.trim()) {
      setError('请输入主题或关键词')
      return
    }

    // 配额检查
    if (user) {
      const supabase = createClient()
      const currentCredits = await getUserCredits(supabase, user.id)
      if (currentCredits < 1) {
        setShowPaywall(true)
        return
      }
    } else {
      const quota = checkCopywritingQuotaLocal()
      if (!quota.canGenerate) {
        setShowPaywall(true)
        return
      }
    }

    setError(null)
    setIsGenerating(true)
    setContent(null)

    try {
      const response = await fetch('/api/copywriting', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic,
          platform,
          type,
          additionalNotes: notes || undefined,
        }),
      })

      const data = await response.json()

      if (data.success && data.content) {
        setContent(data.content)
        setHistory((prev) => [{ topic, content: data.content }, ...prev.slice(0, 9)])

        // 扣减配额
        if (user) {
          if (typeof data.remainingCredits === 'number') {
            setCredits(Math.max(0, data.remainingCredits))
          } else {
            setCredits((prev) => (prev !== null ? Math.max(0, prev - 1) : null))
          }
        } else {
          consumeCopywritingQuotaLocal()
        }
      } else {
        if (data.noCredits) {
          setShowPaywall(true)
        } else {
          setError(data.error || '生成失败，请重试')
        }
      }
    } catch (err) {
      setError(`网络错误: ${err instanceof Error ? err.message : '请检查网络连接'}`)
    } finally {
      setIsGenerating(false)
    }
  }, [topic, platform, type, notes, user])

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">爆款文案生成器</h1>
        <p className="mt-1 text-sm text-gray-500">AI 撰写高互动率的社交媒体文案</p>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row">
        {/* 左侧：配置 */}
        <div className="w-full space-y-5 lg:w-[360px] lg:flex-shrink-0">
          {/* 平台选择 */}
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm space-y-3">
            <Label className="text-sm font-medium text-gray-700">选择平台</Label>
            <div className="flex flex-wrap gap-2">
              {platforms.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setPlatform(p.id)}
                  className={`flex items-center gap-1.5 rounded-lg border-2 px-3 py-2 text-xs transition-all ${
                    platform === p.id
                      ? 'border-orange-400 bg-orange-50 text-orange-600'
                      : 'border-gray-100 text-gray-600 hover:border-gray-200'
                  }`}
                >
                  <span>{p.icon}</span>
                  {p.name}
                </button>
              ))}
            </div>
          </div>

          {/* 文案类型 */}
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm space-y-3">
            <Label className="text-sm font-medium text-gray-700">文案类型</Label>
            <div className="space-y-1.5">
              {copywritingTypes.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setType(t.id)}
                  className={`flex w-full items-start gap-3 rounded-xl border-2 p-3 text-left transition-all ${
                    type === t.id
                      ? 'border-orange-400 bg-orange-50'
                      : 'border-gray-100 hover:border-gray-200'
                  }`}
                >
                  <span className="text-lg">{t.icon}</span>
                  <div>
                    <p className={`text-sm font-medium ${type === t.id ? 'text-orange-600' : 'text-gray-800'}`}>
                      {t.name}
                    </p>
                    <p className="text-xs text-gray-400">{t.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* 主题输入 */}
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm space-y-4">
            <div className="space-y-2">
              <Label htmlFor="topic" className="text-sm text-gray-700">
                主题/关键词 <span className="text-red-500">*</span>
              </Label>
              <Input
                id="topic"
                placeholder="例如：AI 提升工作效率的方法"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cw-notes" className="text-sm text-gray-700">补充说明</Label>
              <Textarea
                id="cw-notes"
                placeholder="例如：面向职场新人，想要干货型内容，不要太鸡汤..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          {/* 生成按钮 */}
          <Button
            onClick={handleGenerate}
            disabled={isGenerating || !topic.trim()}
            className="w-full gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-pink-500 py-5 text-base font-semibold shadow-lg shadow-orange-200 hover:shadow-xl transition-all disabled:opacity-40"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                生成中...
              </>
            ) : (
              <>
                <PenTool className="h-5 w-5" />
                生成文案
                {user && credits !== null && (
                  <span className="ml-1 text-xs opacity-80">（💎 {credits}）</span>
                )}
              </>
            )}
          </Button>
        </div>

        {/* 右侧：结果 */}
        <div className="flex-1">
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <CopywritingResult
              content={content}
              isGenerating={isGenerating}
              error={error}
            />
          </div>

          {/* 历史记录 */}
          {history.length > 0 && (
            <div className="mt-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <p className="mb-3 text-xs font-medium text-gray-500">历史记录</p>
              <div className="space-y-2">
                {history.map((item, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setContent(item.content)
                      setTopic(item.topic)
                    }}
                    className="flex w-full items-center gap-3 rounded-lg border border-gray-100 px-3 py-2 text-left text-sm text-gray-600 transition-all hover:bg-gray-50"
                  >
                    <span className="text-gray-400">📌</span>
                    <span className="truncate">{item.topic}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 付费引导弹窗 */}
      <PaywallDialog
        open={showPaywall}
        onOpenChange={setShowPaywall}
        type="copywriting"
      />
    </div>
  )
}
