import { NextRequest, NextResponse } from 'next/server'
import { generateImage, proxyImage } from '@/lib/siliconflow'
import { getCoverStyle, getAspectRatio } from '@/lib/constants'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { style, platform, ratio, title, subtitle, font, decoration, notes, imageUrl } = body

    // 参数校验
    if (!style) {
      return NextResponse.json({ success: false, error: '请选择封面风格' }, { status: 400 })
    }
    if (!ratio) {
      return NextResponse.json({ success: false, error: '请选择图片比例' }, { status: 400 })
    }

    // 获取风格和比例配置
    const coverStyle = getCoverStyle(style)
    const ratioConfig = getAspectRatio(platform, ratio)

    if (!ratioConfig) {
      return NextResponse.json({ success: false, error: '无效的图片比例' }, { status: 400 })
    }

    // 调用硅基流动 API 生成图片
    const result = await generateImage({
      styleId: style,
      ratio: {
        siliconflowSize: ratioConfig.siliconflowSize,
        width: ratioConfig.width,
        height: ratioConfig.height,
      },
      title: title || '',
      subtitle,
      decoration,
      notes,
      imageUrl,
    })

    if (!result.success || !result.imageUrl) {
      return NextResponse.json(
        { success: false, error: result.error || '图片生成失败' },
        { status: 500 }
      )
    }

    // 硅基流动图片 URL 只有1小时有效期，立即下载转 base64
    const proxyResult = await proxyImage(result.imageUrl)
    if (!proxyResult.success || !proxyResult.base64) {
      // 代理下载失败，返回原始 URL（可能很快过期）
      return NextResponse.json({
        success: true,
        imageUrl: result.imageUrl,
        warning: '图片链接将在1小时后过期，请尽快下载',
      })
    }

    return NextResponse.json({
      success: true,
      imageUrl: proxyResult.base64,
    })
  } catch (error) {
    console.error('封面生成接口异常:', error)
    return NextResponse.json(
      { success: false, error: '服务器内部错误' },
      { status: 500 }
    )
  }
}
