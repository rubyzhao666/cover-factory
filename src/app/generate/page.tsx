'use client'

import { useState, useCallback } from 'react'
import { Sparkles, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { PlatformSelector } from '@/components/platform-selector'
import { ImageUploader } from '@/components/image-uploader'
import { StyleSelector } from '@/components/style-selector'
import { CoverPreview } from '@/components/cover-preview'
import { fontStyles } from '@/lib/constants'
import type { UploadedImage } from '@/lib/types'

export default function GeneratePage() {
  // 平台与比例
  const [platform, setPlatform] = useState<string | null>(null)
  const [ratio, setRatio] = useState<string | null>(null)

  // 上传的图片
  const [subjectImages, setSubjectImages] = useState<UploadedImage[]>([])
  const [backgroundImages, setBackgroundImages] = useState<UploadedImage[]>([])

  // 风格
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null)

  // 文字配置
  const [title, setTitle] = useState('')
  const [subtitle, setSubtitle] = useState('')
  const [font, setFont] = useState('default')
  const [decoration, setDecoration] = useState('')
  const [notes, setNotes] = useState('')

  // 生成状态
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedImage, setGeneratedImage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [history, setHistory] = useState<string[]>([])

  // 生成封面
  const handleGenerate = useCallback(async () => {
    if (!selectedStyle) {
      setError('请先选择封面风格')
      return
    }
    if (!ratio) {
      setError('请选择图片比例')
      return
    }

    setError(null)
    setIsGenerating(true)
    setGeneratedImage(null)

    try {
      // 将上传的图片转为 base64
      let imageUrl: string | undefined
      if (subjectImages.length > 0) {
        imageUrl = await fileToBase64(subjectImages[0].file)
      }

      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          style: selectedStyle,
          platform,
          ratio,
          title,
          subtitle,
          font,
          decoration,
          notes,
          imageUrl,
        }),
      })

      const data = await response.json()

      if (data.success && data.imageUrl) {
        setGeneratedImage(data.imageUrl)
        setHistory((prev) => [data.imageUrl, ...prev.slice(0, 5)])
        if (data.warning) setError(data.warning)
      } else {
        setError(data.error || '生成失败，请重试')
      }
    } catch (err) {
      setError(`网络错误: ${err instanceof Error ? err.message : '请检查网络连接'}`)
    } finally {
      setIsGenerating(false)
    }
  }, [selectedStyle, ratio, platform, title, subtitle, font, decoration, notes, subjectImages])

  // 文件转 base64
  async function fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  const fontConfig = fontStyles.find((f) => f.id === font)

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">封面生成器</h1>
        <p className="mt-1 text-sm text-gray-500">选择平台和风格，AI 为你生成精美封面</p>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row">
        {/* ========== 左侧：配置面板 ========== */}
        <div className="w-full space-y-6 lg:w-[420px] lg:flex-shrink-0">
          {/* 1. 平台选择 */}
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <PlatformSelector
              selectedPlatform={platform}
              onSelect={setPlatform}
              selectedRatio={ratio}
              onRatioSelect={setRatio}
            />
          </div>

          {/* 2. 上传素材 */}
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <span>📁</span> 上传素材
            </div>

            <ImageUploader
              images={subjectImages}
              onUpload={setSubjectImages}
              onRemove={(id) => setSubjectImages((prev) => prev.filter((img) => img.id !== id))}
              maxCount={1}
              label="人像/主体"
              description="上传你想要在封面中展示的人物或主体（可选）"
            />

            <ImageUploader
              images={backgroundImages}
              onUpload={setBackgroundImages}
              onRemove={(id) => setBackgroundImages((prev) => prev.filter((img) => img.id !== id))}
              maxCount={3}
              label="背景/空镜"
              description="上传参考背景图片，AI 将从中汲取灵感（可选）"
            />

            <p className="text-xs text-gray-400 leading-relaxed">
              💡 提示：不上传图片也可以直接生成，AI 将根据风格和标题自动创作背景。
            </p>
          </div>

          {/* 3. 选择封面风格 */}
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <StyleSelector selectedStyle={selectedStyle} onSelect={setSelectedStyle} />
          </div>

          {/* 4. 详细配置 */}
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <span>⚙️</span> 详细配置
            </div>

            <div className="space-y-2">
              <Label htmlFor="title" className="text-sm text-gray-700">
                封面主标题 <span className="text-red-500">*</span>
              </Label>
              <Input
                id="title"
                placeholder="例如：5个让效率翻倍的工具"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="subtitle" className="text-sm text-gray-700">副标题</Label>
              <Input
                id="subtitle"
                placeholder="例如：第3个我每天都在用"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm text-gray-700">字体风格</Label>
              <div className="flex flex-wrap gap-2">
                {fontStyles.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setFont(f.id)}
                    className={`rounded-lg border-2 px-3 py-2 text-xs transition-all ${
                      font === f.id
                        ? 'border-orange-400 bg-orange-50 text-orange-600'
                        : 'border-gray-100 text-gray-600 hover:border-gray-200'
                    }`}
                    style={{ fontFamily: `"${f.family}", sans-serif`, fontWeight: f.weight as number }}
                  >
                    {f.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="decoration" className="text-sm text-gray-700">装饰/贴纸</Label>
              <Input
                id="decoration"
                placeholder="例如：加星星特效、NEW标签、箭头指示"
                value={decoration}
                onChange={(e) => setDecoration(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes" className="text-sm text-gray-700">其他要求</Label>
              <Textarea
                id="notes"
                placeholder="例如：色调偏暖、背景虚化、人物放左边..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          {/* 生成按钮 */}
          <Button
            onClick={handleGenerate}
            disabled={isGenerating || !selectedStyle}
            className="w-full gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-pink-500 py-6 text-base font-semibold shadow-lg shadow-orange-200 hover:shadow-xl transition-all disabled:opacity-40"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                生成中...
              </>
            ) : (
              <>
                <Sparkles className="h-5 w-5" />
                生成封面
              </>
            )}
          </Button>

          {error && !isGenerating && (
            <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
              ❌ {error}
            </div>
          )}
        </div>

        {/* ========== 右侧：预览面板 ========== */}
        <div className="flex-1">
          <div className="sticky top-20 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700">预览</span>
              {fontConfig && (
                <span className="text-xs text-gray-400">
                  · 字体: {fontConfig.name}
                </span>
              )}
            </div>

            <CoverPreview
              platformId={platform}
              ratioId={ratio}
              fontId={font}
              title={title}
              subtitle={subtitle}
              generatedImage={generatedImage}
              isGenerating={isGenerating}
            />

            {/* 生成历史 */}
            {history.length > 0 && (
              <>
                <Separator className="my-5" />
                <div>
                  <p className="mb-3 text-xs font-medium text-gray-500">最近生成</p>
                  <div className="flex gap-2">
                    {history.map((img, i) => (
                      <button
                        key={i}
                        onClick={() => setGeneratedImage(img)}
                        className="h-14 w-14 overflow-hidden rounded-lg border border-gray-200 transition-all hover:border-orange-300 hover:shadow-sm"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={img} alt="历史封面" className="h-full w-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
