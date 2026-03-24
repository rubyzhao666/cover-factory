import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// 虎皮椒支付配置（需要 Ruby 配置后填入）
const XUNHU_APP_ID = process.env.XUNHU_APP_ID || ''
const XUNHU_APP_SECRET = process.env.XUNHU_APP_SECRET || ''
const XUNHU_API_URL = 'https://api.xunhupay.com/payment/do.html'
const XUNHU_NOTIFY_URL = process.env.XUNHU_NOTIFY_URL || ''
const XUNHU_RETURN_URL = process.env.XUNHU_RETURN_URL || ''

/**
 * 生成签名（MD5）
 * 预留：实际接入虎皮椒时使用 HmacSHA256
 */
function generateSign(params: Record<string, string>, secret: string): string {
  // 按字母序排列参数
  const sortedKeys = Object.keys(params).sort()
  const signStr = sortedKeys
    .filter((key) => params[key] !== '' && key !== 'sign' && key !== 'sign_type')
    .map((key) => `${key}=${params[key]}`)
    .join('&')

  // 简化的签名生成，实际需要用 MD5(signStr + secret) 或 HmacSHA256
  // 这里先返回空字符串，等 Ruby 配置好密钥后使用 crypto 模块
  return ''
}

export async function POST(request: NextRequest) {
  try {
    // 验证用户登录状态
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ success: false, error: '请先登录' }, { status: 401 })
    }

    const body = await request.json()
    const { planId, paymentMethod } = body

    if (!planId) {
      return NextResponse.json({ success: false, error: '请选择套餐' }, { status: 400 })
    }

    if (!['wechat', 'alipay'].includes(paymentMethod)) {
      return NextResponse.json({ success: false, error: '不支持的支付方式' }, { status: 400 })
    }

    // 获取套餐信息
    const { data: plan, error: planError } = await supabase
      .from('pricing_plans')
      .select('*')
      .eq('id', planId)
      .single()

    if (planError || !plan) {
      return NextResponse.json({ success: false, error: '套餐不存在' }, { status: 400 })
    }

    // 创建订单
    const { data: order, error: orderError } = await supabase
      .from('payment_orders')
      .insert({
        user_id: user.id,
        plan_id: planId,
        amount: plan.price,
        credits: plan.credits,
        payment_method: paymentMethod,
        status: 'pending',
      })
      .select()
      .single()

    if (orderError || !order) {
      console.error('创建订单失败:', orderError)
      return NextResponse.json({ success: false, error: '创建订单失败' }, { status: 500 })
    }

    // =============================================
    // 调用虎皮椒支付接口
    // =============================================
    if (!XUNHU_APP_ID || !XUNHU_APP_SECRET) {
      // 虎皮椒支付尚未配置，返回模拟响应
      return NextResponse.json({
        success: false,
        error: '支付功能即将上线，敬请期待',
        orderId: order.id,
      })
    }

    // 实际的虎皮椒支付调用代码（等配置完成后启用）
    const paymentParams: Record<string, string> = {
      version: '1.1',
      appid: XUNHU_APP_ID,
      trade_order_id: order.id,
      total_fee: String(plan.price),
      title: `封面工厂 - ${plan.name}`,
      time: String(Math.floor(Date.now() / 1000)),
      notify_url: XUNHU_NOTIFY_URL,
      return_url: `${XUNHU_RETURN_URL}?order_id=${order.id}`,
      nonce_str: Math.random().toString(36).substring(2, 15),
      type: paymentMethod,
    }

    const sign = generateSign(paymentParams, XUNHU_APP_SECRET)
    paymentParams.hash = sign

    // 调用虎皮椒接口
    const payResponse = await fetch(XUNHU_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams(paymentParams).toString(),
    })

    const payData = await payResponse.json()

    if (payData.errcode === 0 && payData.url_qrcode) {
      // 微信支付：返回二维码 URL
      return NextResponse.json({
        success: true,
        payUrl: payData.url_qrcode,
        orderId: order.id,
        qrType: payData.type,
      })
    } else if (payData.errcode === 0 && payData.url) {
      // 支付宝支付：返回支付链接
      return NextResponse.json({
        success: true,
        payUrl: payData.url,
        orderId: order.id,
      })
    } else {
      return NextResponse.json({
        success: false,
        error: payData.errmsg || '创建支付失败',
        orderId: order.id,
      })
    }
  } catch (error) {
    console.error('创建支付订单异常:', error)
    return NextResponse.json(
      { success: false, error: '服务器内部错误' },
      { status: 500 }
    )
  }
}
