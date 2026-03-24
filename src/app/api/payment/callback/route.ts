import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

// 虎皮椒支付回调处理
// 文档: https://www.xunhupay.com/doc/api/pay.html

export async function POST(request: NextRequest) {
  try {
    const body = await request.formData()

    // 虎皮椒回调参数
    const tradeNo = body.get('trade_order_id') as string     // 虎皮椒订单号
    const outTradeNo = body.get('out_trade_order_id') as string // 商户订单号
    const status = body.get('status') as string               // 'OD' = 已支付
    const money = body.get('total_fee') as string              // 实际支付金额
    const type = body.get('type') as string                    // 'wechat' | 'alipay'
    const sign = body.get('hash') as string                    // 签名
    const appId = body.get('appid') as string                  // 应用 ID

    console.log('[Payment Callback] Received:', {
      tradeNo,
      outTradeNo,
      status,
      money,
      type,
    })

    if (!tradeNo || !outTradeNo || !status) {
      console.error('[Payment Callback] Missing required parameters')
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 })
    }

    // 验证签名
    const appSecret = process.env.XUNHU_PAY_SECRET
    if (appSecret) {
      // 签名规则: md5(params拼接到secret)
      const params = new URLSearchParams()
      params.set('appid', appId)
      params.set('hash', '')
      params.set('money', money)
      params.set('out_trade_order_id', outTradeNo)
      params.set('plugins', body.get('plugins') as string || '')
      params.set('status', status)
      params.set('time', body.get('time') as string || '')
      params.set('trade_order_id', tradeNo)
      params.set('type', type)

      const signStr = params.toString() + appSecret
      const expectedSign = crypto.createHash('md5').update(signStr, 'utf8').digest('hex')

      if (sign !== expectedSign) {
        console.error('[Payment Callback] Invalid signature', { expected: expectedSign, received: sign })
        return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
      }
    } else {
      console.warn('[Payment Callback] XUNHU_PAY_SECRET not set, skipping signature verification')
    }

    // 只处理已支付状态
    if (status !== 'OD') {
      console.log('[Payment Callback] Status not OD, skipping:', status)
      return NextResponse.json({ code: 'success' }, { status: 200 })
    }

    // TODO: 接入 Supabase 后实现以下逻辑
    // 1. 根据 outTradeNo 查询 payment_orders 表
    // 2. 检查订单状态，避免重复处理
    // 3. 更新订单状态为 paid
    // 4. 给用户充值积分
    // 5. 如果是被邀请用户首次付费，给邀请者额外奖励 5 积分

    console.log('[Payment Callback] Order processed successfully:', outTradeNo)

    // 虎皮椒要求返回 success
    return new NextResponse('success', {
      status: 200,
      headers: { 'Content-Type': 'text/plain' },
    })
  } catch (error) {
    console.error('[Payment Callback] Error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

// GET 用于虎皮椒主动查询通知（某些配置下需要）
export async function GET() {
  return NextResponse.json({ status: 'ok' })
}
