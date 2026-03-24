import { NextRequest, NextResponse } from 'next/server'
import { generateImage, proxyImage } from '@/lib/siliconflow'
import { getAspectRatio } from '@/lib/constants'
import { createClient } from '@/lib/supabase/server'
import { consumeCoverQuotaServer, refundCoverQuotaServer } from '@/lib/quota'

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

    const ratioConfig = getAspectRatio(platform, ratio)

    if (!ratioConfig) {
      return NextResponse.json({ success: false, error: '无效的图片比例' }, { status: 400 })
    }

    // 已登录用户：服务端积分扣减（先扣再生成，防止白嫖）
    let userId: string | null = null
    let remainingCredits: number | undefined
    try {
      const supabase = await createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const consumeResult = await consumeCoverQuotaServer(supabase, user.id)
        if (!consumeResult.success) {
          return NextResponse.json({ success: false, noCredits: true, error: '积分不足，请充值或邀请好友获取积分' }, { status: 403 })
        }
        userId = user.id
        remainingCredits = consumeResult.remaining
      }
    } catch {
      // Supabase 未配置时跳过积分检查
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
      // 生成失败，退还积分
      if (userId) {
        try {
          const supabase = await createClient()
          await refundCoverQuotaServer(supabase, userId)
        } catch { /* ignore */ }
      }
      return NextResponse.json(
        { success: false, error: result.error || '图片生成失败' },
        { status: 500 }
      )
    }

    // 硅基流动图片 URL 只有1小时有效期，立即下载转 base64
    const proxyResult = await proxyImage(result.imageUrl)
    if (!proxyResult.success || !proxyResult.base64) {
      return NextResponse.json({
        success: true,
        imageUrl: result.imageUrl,
        warning: '图片链接将在1小时后过期，请尽快下载',
      })
    }

    return NextResponse.json({
      success: true,
      imageUrl: proxyResult.base64,
      remainingCredits,
    })
  } catch (error) {
    console.error('封面生成接口异常:', error)
    return NextResponse.json(
      { success: false, error: '服务器内部错误' },
      { status: 500 }
    )
  }
}
