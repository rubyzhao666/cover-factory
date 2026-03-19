import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { imageUrl } = await request.json()

    if (!imageUrl) {
      return NextResponse.json({ success: false, error: '请提供图片 URL' }, { status: 400 })
    }

    // 只允许代理硅基流动的图片
    if (!imageUrl.includes('siliconflow') && !imageUrl.includes('siliconcloud')) {
      return NextResponse.json({ success: false, error: '不支持的图片源' }, { status: 400 })
    }

    const response = await fetch(imageUrl)
    if (!response.ok) {
      return NextResponse.json(
        { success: false, error: `下载图片失败: ${response.status}` },
        { status: 500 }
      )
    }

    const arrayBuffer = await response.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const base64 = buffer.toString('base64')
    const contentType = response.headers.get('content-type') || 'image/png'

    return NextResponse.json({
      success: true,
      base64: `data:${contentType};base64,${base64}`,
    })
  } catch (error) {
    console.error('图片代理异常:', error)
    return NextResponse.json(
      { success: false, error: '图片代理下载失败' },
      { status: 500 }
    )
  }
}
