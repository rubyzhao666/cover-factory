'use client'

import { coverStyles } from '@/lib/constants'
import { Check } from 'lucide-react'

interface StyleSelectorProps {
  selectedStyle: string | null
  onSelect: (styleId: string) => void
}

export function StyleSelector({ selectedStyle, onSelect }: StyleSelectorProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium text-gray-700">选择封面风格</label>
        <span className="text-xs text-gray-400">（点击选中）</span>
      </div>

      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-5">
        {coverStyles.map((style) => {
          const isSelected = selectedStyle === style.id
          return (
            <button
              key={style.id}
              onClick={() => onSelect(isSelected ? '' : style.id)}
              className={`group relative flex flex-col overflow-hidden rounded-xl border-2 transition-all ${
                isSelected
                  ? 'border-orange-400 shadow-md shadow-orange-100'
                  : 'border-gray-100 hover:border-gray-300 hover:shadow-sm'
              }`}
            >
              {/* 渐变色预览 */}
              <div
                className="h-16 w-full"
                style={{ background: style.gradient }}
              />

              {/* 选中标记 */}
              {isSelected && (
                <div className="absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-orange-500 text-white">
                  <Check className="h-3 w-3" />
                </div>
              )}

              {/* 风格信息 */}
              <div className="flex flex-col items-start gap-0.5 p-2">
                <span className="text-xs font-medium text-gray-800 leading-tight">
                  {style.name}
                </span>
                <div className="flex flex-wrap gap-0.5">
                  {style.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[10px] leading-none text-gray-400"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </button>
          )
        })}
      </div>

      {/* 选中风格的推荐说明 */}
      {selectedStyle && (
        <div className="rounded-lg bg-orange-50 px-3 py-2">
          <p className="text-xs text-orange-700">
            💡 {coverStyles.find((s) => s.id === selectedStyle)?.recommended}
          </p>
        </div>
      )}
    </div>
  )
}
