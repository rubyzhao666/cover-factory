'use client'

import { useState } from 'react'
import { Copy, Check, Loader2 } from 'lucide-react'

interface CopywritingResultProps {
  content: string | null
  isGenerating: boolean
  error: string | null
}

export function CopywritingResult({ content, isGenerating, error }: CopywritingResultProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    if (!content) return
    try {
      await navigator.clipboard.writeText(content)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // fallback
      const textarea = document.createElement('textarea')
      textarea.value = content
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  // 生成中状态
  if (isGenerating) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-gray-200 bg-gray-50 p-12">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
        <p className="text-sm font-medium text-gray-600">AI 正在创作文案...</p>
        <p className="text-xs text-gray-400">大约需要 5-15 秒</p>
      </div>
    )
  }

  // 错误状态
  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6">
        <p className="text-sm text-red-600">❌ {error}</p>
      </div>
    )
  }

  // 空状态
  if (!content) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-gray-200 bg-gray-50/50 p-12">
        <div className="text-4xl">✍️</div>
        <p className="text-sm text-gray-400">填写信息后点击生成，AI 将为你创作文案</p>
      </div>
    )
  }

  // 结果展示
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">生成结果</span>
        <button
          onClick={handleCopy}
          className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
            copied
              ? 'bg-green-50 text-green-600'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5" />
              已复制
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" />
              复制文案
            </>
          )}
        </button>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <div className="prose prose-sm max-w-none">
          {content.split('\n').map((line, i) => {
            if (!line.trim()) return <br key={i} />
            // 简单的 markdown 渲染
            if (line.startsWith('# '))
              return <h3 key={i} className="text-lg font-bold mt-4 mb-2">{line.slice(2)}</h3>
            if (line.startsWith('## '))
              return <h4 key={i} className="text-base font-semibold mt-3 mb-1">{line.slice(3)}</h4>
            if (line.startsWith('### '))
              return <h5 key={i} className="text-sm font-semibold mt-2 mb-1">{line.slice(4)}</h5>
            if (line.startsWith('- ') || line.startsWith('* '))
              return <li key={i} className="ml-4 text-gray-700 list-disc">{line.slice(2)}</li>
            if (/^\d+\.\s/.test(line))
              return <li key={i} className="ml-4 text-gray-700 list-decimal">{line.replace(/^\d+\.\s/, '')}</li>
            if (line.startsWith('---'))
              return <hr key={i} className="my-3 border-gray-200" />
            if (line.includes('**') && line.includes('**')) {
              const parts = line.split('**')
              return (
                <p key={i} className="text-gray-700 my-1">
                  {parts.map((part, j) =>
                    j % 2 === 1 ? <strong key={j}>{part}</strong> : part
                  )}
                </p>
              )
            }
            return <p key={i} className="text-gray-700 my-1">{line}</p>
          })}
        </div>
      </div>
    </div>
  )
}
