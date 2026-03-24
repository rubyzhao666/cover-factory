import { NextRequest, NextResponse } from 'next/server'
import { generateCopywriting } from '@/lib/siliconflow'
import { createClient } from '@/lib/supabase/server'
import { consumeCopywritingQuotaServer, refundCopywritingQuotaServer } from '@/lib/quota'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { topic, platform, type, additionalNotes } = body

    if (!topic) {
      return NextResponse.json({ success: false, error: '请输入主题或关键词' }, { status: 400 })
    }
    if (!platform) {
      return NextResponse.json({ success: false, error: '请选择平台' }, { status: 400 })
    }
    if (!type) {
      return NextResponse.json({ success: false, error: '请选择文案类型' }, { status: 400 })
    }

    // 已登录用户：服务端积分扣减
    let userId: string | null = null
    let remainingCredits: number | undefined
    try {
      const supabase = await createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const consumeResult = await consumeCopywritingQuotaServer(supabase, user.id)
        if (!consumeResult.success) {
          return NextResponse.json({ success: false, noCredits: true, error: '积分不足，请充值或邀请好友获取积分' }, { status: 403 })
        }
        userId = user.id
        remainingCredits = consumeResult.remaining
      }
    } catch {
      // Supabase 未配置时跳过积分检查
    }

    const result = await generateCopywriting({
      topic,
      platform,
      typeId: type,
      additionalNotes,
    })

    if (!result.success) {
      // 生成失败，退还积分
      if (userId) {
        try {
          const supabase = await createClient()
          await refundCopywritingQuotaServer(supabase, userId)
        } catch { /* ignore */ }
      }
      return NextResponse.json(
        { success: false, error: result.error || '文案生成失败' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      content: result.content,
      remainingCredits,
    })
  } catch (error) {
    console.error('文案生成接口异常:', error)
    return NextResponse.json(
      { success: false, error: '服务器内部错误' },
      { status: 500 }
    )
  }
}
