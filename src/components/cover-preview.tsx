'use client'

import { useEffect, useRef, useState } from 'react'
import { Download } from 'lucide-react'
import { getAspectRatio, getFontStyle } from '@/lib/constants'

interface CoverPreviewProps {
  platformId: string | null
  ratioId: string | null
  fontId: string
  title: string
  subtitle: string
  generatedImage: string | null
  isGenerating: boolean
}

export function CoverPreview({
  platformId,
  ratioId,
  fontId,
  title,
  subtitle,
  generatedImage,
  isGenerating,
}: CoverPreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [canvasReady] = useState(true)

  const ratioConfig = platformId && ratioId ? getAspectRatio(platformId, ratioId) : null
  const fontConfig = getFontStyle(fontId)

  // 绘制占位预览
  function drawPlaceholder(ctx: CanvasRenderingContext2D, width: number, height: number) {
    // 渐变背景
    const gradient = ctx.createLinearGradient(0, 0, width, height)
    gradient.addColorStop(0, '#f8f8f8')
    gradient.addColorStop(1, '#e8e8e8')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, width, height)

    // 网格线
    ctx.strokeStyle = '#ddd'
    ctx.lineWidth = 1
    const gridSize = 40
    for (let x = 0; x <= width; x += gridSize) {
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, height)
      ctx.stroke()
    }
    for (let y = 0; y <= height; y += gridSize) {
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(width, y)
      ctx.stroke()
    }

    // 中心提示
    ctx.fillStyle = '#999'
    ctx.font = '600 16px "Noto Sans SC", sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('预览区域', width / 2, height / 2 - 10)
    ctx.font = '400 12px "Noto Sans SC", sans-serif'
    ctx.fillStyle = '#bbb'
    ctx.fillText('选择风格并点击生成', width / 2, height / 2 + 15)

    // 即使没有 AI 图片，也渲染文字预览
    renderTextOverlay(ctx, width, height)
  }

  // 渲染文字叠加层
  function renderTextOverlay(ctx: CanvasRenderingContext2D, width: number, height: number) {
    if (!title && !subtitle) return

    const fontFamily = fontConfig?.family || 'Noto Sans SC'
    const fontWeight = (fontConfig?.weight as number) || 700

    // 半透明底色（增强文字可读性）
    if (title) {
      const textPadding = width * 0.06
      const titleFontSize = Math.max(20, Math.min(width * 0.1, 80))
      const subtitleFontSize = Math.max(14, Math.min(width * 0.04, 32))

      // 估算文字区域高度
      const titleHeight = titleFontSize * 1.4
      const subtitleHeight = subtitle ? subtitleFontSize * 1.6 : 0
      const totalHeight = titleHeight + subtitleHeight + 30

      // 底部渐变遮罩
      const overlayGradient = ctx.createLinearGradient(0, height - totalHeight - 40, 0, height)
      overlayGradient.addColorStop(0, 'rgba(0,0,0,0)')
      overlayGradient.addColorStop(0.3, 'rgba(0,0,0,0.3)')
      overlayGradient.addColorStop(1, 'rgba(0,0,0,0.6)')
      ctx.fillStyle = overlayGradient
      ctx.fillRect(0, height - totalHeight - 40, width, totalHeight + 40)

      // 主标题
      ctx.fillStyle = '#ffffff'
      ctx.font = `${fontWeight} ${titleFontSize}px "${fontFamily}", sans-serif`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'bottom'

      // 自动换行
      const maxWidth = width - textPadding * 2
      const lines = wrapText(ctx, title, maxWidth)
      const lineHeight = titleFontSize * 1.3
      const startY = height - 40 - (subtitle ? subtitleHeight : 0) - (lines.length - 1) * lineHeight

      // 文字阴影
      ctx.shadowColor = 'rgba(0,0,0,0.5)'
      ctx.shadowBlur = 8
      ctx.shadowOffsetX = 0
      ctx.shadowOffsetY = 2

      lines.forEach((line, i) => {
        ctx.fillText(line, width / 2, startY + i * lineHeight)
      })

      // 副标题
      if (subtitle) {
        ctx.shadowBlur = 4
        ctx.font = `400 ${subtitleFontSize}px "${fontFamily}", sans-serif`
        ctx.fillStyle = 'rgba(255,255,255,0.85)'
        ctx.fillText(subtitle, width / 2, height - 30)
      }

      // 清除阴影
      ctx.shadowColor = 'transparent'
      ctx.shadowBlur = 0
    }
  }

  // 文字自动换行
  function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
    const lines: string[] = []
    let currentLine = ''

    for (const char of text) {
      const testLine = currentLine + char
      const metrics = ctx.measureText(testLine)
      if (metrics.width > maxWidth && currentLine) {
        lines.push(currentLine)
        currentLine = char
      } else {
        currentLine = testLine
      }
    }
    if (currentLine) lines.push(currentLine)
    return lines
  }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const width = ratioConfig?.width || 768
    const height = ratioConfig?.height || 1024

    canvas.width = width
    canvas.height = height

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // 清空画布
    ctx.clearRect(0, 0, width, height)

    // 绘制背景
    if (generatedImage) {
      // 已生成图片：绘制 AI 生成的背景
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.onload = () => {
        ctx.drawImage(img, 0, 0, width, height)
        renderTextOverlay(ctx, width, height)
      }
      img.onerror = () => {
        // 图片加载失败，使用占位背景
        drawPlaceholder(ctx, width, height)
      }
      img.src = generatedImage
      return
    }

    // 未生成：绘制占位预览
    drawPlaceholder(ctx, width, height)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [generatedImage, ratioConfig, title, subtitle, fontConfig])

  // 下载图片
  const handleDownload = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const link = document.createElement('a')
    link.download = `cover-${Date.now()}.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
  }

  // 计算预览尺寸（保持比例缩放到合适大小）
  const previewMaxWidth = 360
  const previewMaxHeight = 480
  let previewWidth = ratioConfig?.width || 768
  let previewHeight = ratioConfig?.height || 1024

  if (previewWidth > previewMaxWidth) {
    const scale = previewMaxWidth / previewWidth
    previewWidth = previewMaxWidth
    previewHeight *= scale
  }
  if (previewHeight > previewMaxHeight) {
    const scale = previewMaxHeight / previewHeight
    previewHeight *= scale
    previewWidth *= scale
  }

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Canvas 预览 */}
      <div className="relative overflow-hidden rounded-xl border border-gray-200 shadow-lg bg-white">
        <canvas
          ref={canvasRef}
          style={{ width: previewWidth, height: previewHeight }}
          className="block"
        />

        {/* 生成中遮罩 */}
        {isGenerating && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-white/80 backdrop-blur-sm">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-orange-200 border-t-orange-500" />
            <p className="text-sm font-medium text-gray-600">AI 正在生成封面...</p>
            <p className="text-xs text-gray-400">大约需要 10-30 秒</p>
          </div>
        )}
      </div>

      {/* 尺寸信息 */}
      {ratioConfig && (
        <p className="text-xs text-gray-400">
          {ratioConfig.width} × {ratioConfig.height}px
        </p>
      )}

      {/* 操作按钮 */}
      <div className="flex gap-2">
        <button
          onClick={handleDownload}
          disabled={!canvasReady || isGenerating}
          className="flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2.5 text-sm font-medium text-white transition-all hover:bg-orange-600 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Download className="h-4 w-4" />
          下载封面
        </button>
      </div>
    </div>
  )
}
