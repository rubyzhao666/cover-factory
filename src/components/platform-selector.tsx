'use client'

import { platforms } from '@/lib/constants'
import { Check } from 'lucide-react'

interface PlatformSelectorProps {
  selectedPlatform: string | null
  onSelect: (platformId: string) => void
  selectedRatio: string | null
  onRatioSelect: (ratioId: string) => void
}

export function PlatformSelector({
  selectedPlatform,
  onSelect,
  selectedRatio,
  onRatioSelect,
}: PlatformSelectorProps) {
  const currentPlatform = platforms.find((p) => p.id === selectedPlatform)

  return (
    <div className="space-y-3">
      <label className="text-sm font-medium text-gray-700">选择平台</label>

      {/* 平台卡片 */}
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
        {platforms.map((platform) => {
          const isSelected = selectedPlatform === platform.id
          return (
            <button
              key={platform.id}
              onClick={() => {
                onSelect(isSelected ? '' : platform.id)
                // 自动选择默认比例
                if (!isSelected) {
                  const defaultRatio = platform.ratios.find((r) => r.isDefault)
                  if (defaultRatio) onRatioSelect(defaultRatio.id)
                } else {
                  onRatioSelect('')
                }
              }}
              className={`flex flex-col items-center gap-1.5 rounded-xl border-2 p-3 transition-all ${
                isSelected
                  ? 'border-orange-400 bg-orange-50 shadow-sm'
                  : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50'
              }`}
            >
              <span className="text-2xl">{platform.icon}</span>
              <span className={`text-xs font-medium ${isSelected ? 'text-orange-600' : 'text-gray-600'}`}>
                {platform.name}
              </span>
              <span className="text-[10px] text-gray-400">{platform.description}</span>
            </button>
          )
        })}
      </div>

      {/* 比例选择 */}
      {currentPlatform && (
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">图片比例</label>
          <div className="flex flex-wrap gap-2">
            {currentPlatform.ratios.map((ratio) => {
              const isSelected = selectedRatio === ratio.id
              return (
                <button
                  key={ratio.id}
                  onClick={() => onRatioSelect(ratio.id)}
                  className={`flex items-center gap-2 rounded-lg border-2 px-3 py-2 transition-all ${
                    isSelected
                      ? 'border-orange-400 bg-orange-50'
                      : 'border-gray-100 hover:border-gray-200'
                  }`}
                >
                  {/* 比例缩略图 */}
                  <div
                    className="flex-shrink-0 rounded-sm border border-gray-300 bg-gray-100"
                    style={{
                      width: `${Math.min(ratio.width / ratio.height * 16, 24)}px`,
                      height: `${Math.min(ratio.height / ratio.width * 16, 24)}px`,
                    }}
                  />
                  <div className="flex flex-col items-start">
                    <span className={`text-xs font-medium ${isSelected ? 'text-orange-600' : 'text-gray-700'}`}>
                      {ratio.label}
                    </span>
                    <span className="text-[10px] text-gray-400">{ratio.description}</span>
                  </div>
                  {isSelected && <Check className="ml-1 h-3.5 w-3.5 text-orange-500" />}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
