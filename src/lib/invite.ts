// 邀请码与邀请奖励相关工具函数
import type { SupabaseClient } from '@supabase/supabase-js'

const INVITE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

/**
 * 生成 6 位随机邀请码（排除容易混淆的字符）
 */
export function generateInviteCode(): string {
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += INVITE_CHARS[Math.floor(Math.random() * INVITE_CHARS.length)]
  }
  return code
}

/**
 * 处理邀请奖励：邀请者和被邀请者各得 2 积分
 * 在注册流程中调用
 */
export async function processInviteReward(
  supabase: SupabaseClient,
  inviterId: string,
  invitedId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // 给邀请者加 2 积分
    const { data: inviterProfile } = await supabase
      .from('profiles')
      .select('credits')
      .eq('id', inviterId)
      .single()

    if (!inviterProfile) {
      return { success: false, error: '邀请者不存在' }
    }

    const { error: inviterUpdateError } = await supabase
      .from('profiles')
      .update({ credits: inviterProfile.credits + 2 })
      .eq('id', inviterId)

    if (inviterUpdateError) {
      return { success: false, error: '更新邀请者积分失败' }
    }

    // 被邀请者额外 +2（注册默认积分外的邀请奖励）
    const { data: invitedProfile } = await supabase
      .from('profiles')
      .select('credits')
      .eq('id', invitedId)
      .single()

    if (!invitedProfile) {
      return { success: false, error: '被邀请用户不存在' }
    }

    const { error: invitedUpdateError } = await supabase
      .from('profiles')
      .update({ credits: invitedProfile.credits + 2 })
      .eq('id', invitedId)

    if (invitedUpdateError) {
      return { success: false, error: '更新被邀请用户积分失败' }
    }

    // 记录邀请者积分流水
    const { error: inviterTxError } = await supabase.from('credit_transactions').insert({
      user_id: inviterId,
      amount: 2,
      type: 'invite_reward',
      description: '成功邀请好友注册，获得 2 积分',
    })

    if (inviterTxError) {
      return { success: false, error: '记录邀请者积分流水失败' }
    }

    // 记录被邀请者积分流水
    const { error: invitedTxError } = await supabase.from('credit_transactions').insert({
      user_id: invitedId,
      amount: 2,
      type: 'invited_reward',
      description: '通过好友邀请注册，获得 2 积分',
    })

    if (invitedTxError) {
      return { success: false, error: '记录被邀请者积分流水失败' }
    }

    return { success: true }
  } catch (err) {
    console.error('处理邀请奖励失败:', err)
    return { success: false, error: '处理邀请奖励失败' }
  }
}

/**
 * 获取邀请统计信息
 */
export async function getInviteStats(
  supabase: SupabaseClient,
  userId: string
): Promise<{
  inviteCode: string
  totalInvited: number
  paidInvited: number
  totalRewardCredits: number
  invitees: Array<{
    id: string
    nickname: string | null
    email: string
    created_at: string
    has_paid: boolean
  }>
}> {
  // 获取用户邀请码
  const { data: profile } = await supabase
    .from('profiles')
    .select('invite_code')
    .eq('id', userId)
    .single()

  const inviteCode = profile?.invite_code || ''

  // 获取被邀请的用户列表
  const { data: invitees } = await supabase
    .from('profiles')
    .select('id, nickname, email, created_at')
    .eq('invited_by', userId)
    .order('created_at', { ascending: false })

  // 检查被邀请用户是否有付费记录
  const inviteesWithPaid = await Promise.all(
    (invitees || []).map(async (invitee) => {
      const { count } = await supabase
        .from('payment_orders')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', invitee.id)
        .eq('status', 'paid')

      return {
        ...invitee,
        has_paid: (count || 0) > 0,
      }
    })
  )

  const totalInvited = inviteesWithPaid.length
  const paidInvited = inviteesWithPaid.filter((i) => i.has_paid).length
  const totalRewardCredits = totalInvited * 2 + paidInvited * 5

  return {
    inviteCode,
    totalInvited,
    paidInvited,
    totalRewardCredits,
    invitees: inviteesWithPaid,
  }
}

/**
 * 处理被邀请用户付费后的额外奖励（邀请者再得 5 积分）
 */
export async function processPaidInviteReward(
  supabase: SupabaseClient,
  invitedUserId: string
): Promise<void> {
  const { data: profile } = await supabase
    .from('profiles')
    .select('invited_by')
    .eq('id', invitedUserId)
    .single()

  if (!profile?.invited_by) return

  const inviterId = profile.invited_by

  // 给邀请者加 5 积分
  const { data: inviterProfile } = await supabase
    .from('profiles')
    .select('credits')
    .eq('id', inviterId)
    .single()

  if (inviterProfile) {
    await supabase
        .from('profiles')
      .update({ credits: inviterProfile.credits + 5 })
      .eq('id', inviterId)

    await supabase.from('credit_transactions').insert({
      user_id: inviterId,
      amount: 5,
      type: 'invite_reward',
      description: '邀请的好友完成付费，额外获得 5 积分',
    })
  }
}
