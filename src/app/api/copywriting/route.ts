import { NextRequest, NextResponse } from 'next/server'
import { generateCopywriting } from '@/lib/siliconflow'

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

    const result = await generateCopywriting({
      topic,
      platform,
      typeId: type,
      additionalNotes,
    })

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || '文案生成失败' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      content: result.content,
    })
  } catch (error) {
    console.error('文案生成接口异常:', error)
    return NextResponse.json(
      { success: false, error: '服务器内部错误' },
      { status: 500 }
    )
  }
}
