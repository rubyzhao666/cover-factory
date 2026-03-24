import type { SupabaseClient } from '@supabase/supabase-js'

const QUOTA_KEY = 'cover_factory_quota'

interface QuotaData {
  coverUsed: number
  copywritingUsed: number
  lastResetDate: string // ISO date string YYYY-MM-DD
}

const FREE_COVER_LIMIT = 2
const FREE_COPYWRITING_LIMIT = 2

type UsageField = 'total_covers_generated' | 'total_copywriting_generated'

interface ConsumeQuotaResult {
  success: boolean
  remaining?: number
}

function getToday(): string {
  return new Date().toISOString().split('T')[0]
}

function loadQuota(): QuotaData {
  if (typeof window === 'undefined') {
    return { coverUsed: 0, copywritingUsed: 0, lastResetDate: getToday() }
  }
  try {
    const raw = localStorage.getItem(QUOTA_KEY)
    if (raw) {
      const data: QuotaData = JSON.parse(raw)
      // 每天重置
      if (data.lastResetDate !== getToday()) {
        const fresh: QuotaData = { coverUsed: 0, copywritingUsed: 0, lastResetDate: getToday() }
        localStorage.setItem(QUOTA_KEY, JSON.stringify(fresh))
        return fresh
      }
      return data
    }
  } catch {
    // ignore
  }
  return { coverUsed: 0, copywritingUsed: 0, lastResetDate: getToday() }
}

function saveQuota(data: QuotaData): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(QUOTA_KEY, JSON.stringify(data))
}

// =============================================
// 客户端配额检查（localStorage 版本，用于未登录用户）
// =============================================

/**
 * 检查未登录用户是否可以生成封面
 */
export function checkCoverQuotaLocal() {
  const quota = loadQuota()
  const remaining = Math.max(0, FREE_COVER_LIMIT - quota.coverUsed)
  return { canGenerate: remaining > 0, remaining, total: FREE_COVER_LIMIT }
}

/**
 * 检查未登录用户是否可以生成文案
 */
export function checkCopywritingQuotaLocal() {
  const quota = loadQuota()
  const remaining = Math.max(0, FREE_COPYWRITING_LIMIT - quota.copywritingUsed)
  return { canGenerate: remaining > 0, remaining, total: FREE_COPYWRITING_LIMIT }
}

/**
 * 消耗一次封面配额（未登录）
 */
export function consumeCoverQuotaLocal() {
  const quota = loadQuota()
  quota.coverUsed++
  saveQuota(quota)
}

/**
 * 消耗一次文案配额（未登录）
 */
export function consumeCopywritingQuotaLocal() {
  const quota = loadQuota()
  quota.copywritingUsed++
  saveQuota(quota)
}

/**
 * 获取未登录用户配额信息
 */
export function getQuotaInfoLocal() {
  const quota = loadQuota()
  return {
    isLoggedIn: false,
    cover: {
      used: quota.coverUsed,
      remaining: Math.max(0, FREE_COVER_LIMIT - quota.coverUsed),
      total: FREE_COVER_LIMIT,
    },
    copywriting: {
      used: quota.copywritingUsed,
      remaining: Math.max(0, FREE_COPYWRITING_LIMIT - quota.copywritingUsed),
      total: FREE_COPYWRITING_LIMIT,
    },
  }
}

// =============================================
// 服务端配额检查（Supabase 版本，用于已登录用户）
// =============================================

/**
 * 获取用户当前积分余额
 */
export async function getUserCredits(
  supabase: SupabaseClient,
  userId: string
): Promise<number> {
  const { data, error } = await supabase
    .from('profiles')
    .select('credits')
    .eq('id', userId)
    .single()

  if (error || !data) {
    console.error('获取用户积分失败:', error)
    return 0
  }
  return data.credits
}

/**
 * 检查已登录用户积分够不够生成封面
 */
export async function checkCoverQuotaServer(
  supabase: SupabaseClient,
  userId: string
): Promise<{ canGenerate: boolean; remaining: number }> {
  const credits = await getUserCredits(supabase, userId)
  return { canGenerate: credits >= 1, remaining: credits }
}

/**
 * 检查已登录用户积分够不够生成文案
 */
export async function checkCopywritingQuotaServer(
  supabase: SupabaseClient,
  userId: string
): Promise<{ canGenerate: boolean; remaining: number }> {
  const credits = await getUserCredits(supabase, userId)
  return { canGenerate: credits >= 1, remaining: credits }
}

/**
 * 扣减封面生成积分并记录流水
 * @returns 是否成功
 */
export async function consumeCoverQuotaServer(
  supabase: SupabaseClient,
  userId: string
): Promise<ConsumeQuotaResult> {
  return consumeQuotaServer(
    supabase,
    userId,
    'total_covers_generated',
    'cover_generate',
    '生成封面，消耗 1 积分',
  )
}

/**
 * 扣减文案生成积分并记录流水
 * @returns 是否成功 + 剩余积分
 */
export async function consumeCopywritingQuotaServer(
  supabase: SupabaseClient,
  userId: string
): Promise<ConsumeQuotaResult> {
  return consumeQuotaServer(
    supabase,
    userId,
    'total_copywriting_generated',
    'copywriting_generate',
    '生成文案，消耗 1 积分',
  )
}

/**
 * 失败回滚：归还封面生成积分并回退统计
 */
export async function refundCoverQuotaServer(
  supabase: SupabaseClient,
  userId: string
): Promise<void> {
  await refundQuotaServer(
    supabase,
    userId,
    'total_covers_generated',
    'cover_generate',
    '封面生成失败，返还 1 积分',
  )
}

/**
 * 失败回滚：归还文案生成积分并回退统计
 */
export async function refundCopywritingQuotaServer(
  supabase: SupabaseClient,
  userId: string
): Promise<void> {
  await refundQuotaServer(
    supabase,
    userId,
    'total_copywriting_generated',
    'copywriting_generate',
    '文案生成失败，返还 1 积分',
  )
}

async function consumeQuotaServer(
  supabase: SupabaseClient,
  userId: string,
  usageField: UsageField,
  transactionType: 'cover_generate' | 'copywriting_generate',
  description: string,
): Promise<ConsumeQuotaResult> {
  const { data: profile, error: fetchError } = await supabase
    .from('profiles')
    .select('credits, total_covers_generated, total_copywriting_generated')
    .eq('id', userId)
    .single()

  if (fetchError || !profile || profile.credits < 1) {
    return { success: false }
  }

  // 乐观锁：带上旧 credits 值，避免并发下重复扣减
  const currentUsageCount = usageField === 'total_covers_generated'
    ? (profile.total_covers_generated ?? 0)
    : (profile.total_copywriting_generated ?? 0)
  const { error: updateError } = await supabase
    .from('profiles')
    .update({
      credits: profile.credits - 1,
      [usageField]: currentUsageCount + 1,
    })
    .eq('id', userId)
    .eq('credits', profile.credits)

  if (updateError) {
    console.error('扣减积分失败:', updateError)
    return { success: false }
  }

  // 记录流水
  const { error: txError } = await supabase.from('credit_transactions').insert({
    user_id: userId,
    amount: -1,
    type: transactionType,
    description,
  })

  if (txError) {
    console.error('写入积分流水失败:', txError)
    // 流水失败时回滚用户积分与统计，保持数据一致
    await supabase
      .from('profiles')
      .update({
        credits: profile.credits,
        [usageField]: currentUsageCount,
      })
      .eq('id', userId)
    return { success: false }
  }

  return { success: true, remaining: profile.credits - 1 }
}

/**
 * 统一回滚函数
 */
async function refundQuotaServer(
  supabase: SupabaseClient,
  userId: string,
  usageField: UsageField,
  transactionType: 'cover_generate' | 'copywriting_generate',
  description: string,
): Promise<void> {
  const { data: profile, error: fetchError } = await supabase
    .from('profiles')
    .select('credits, total_covers_generated, total_copywriting_generated')
    .eq('id', userId)
    .single()

  if (fetchError || !profile) {
    return
  }

  const currentUsage = usageField === 'total_covers_generated'
    ? (profile.total_covers_generated ?? 0)
    : (profile.total_copywriting_generated ?? 0)
  const { error: updateError } = await supabase
    .from('profiles')
    .update({
      credits: profile.credits + 1,
      [usageField]: Math.max(0, currentUsage - 1),
    })
    .eq('id', userId)

  if (updateError) {
    console.error('回滚积分失败:', updateError)
    return
  }

  await supabase.from('credit_transactions').insert({
    user_id: userId,
    amount: 1,
    type: transactionType,
    description,
  })
}

// =============================================
// 通用检查函数（供前端调用）
// =============================================

/**
 * 检查用户是否可以生成封面（自动判断登录状态）
 */
export function checkCoverQuota(isLoggedIn: boolean) {
  if (isLoggedIn) {
    return { canGenerate: true, remaining: Infinity, total: Infinity }
  }
  return checkCoverQuotaLocal()
}

/**
 * 检查用户是否可以生成文案（自动判断登录状态）
 */
export function checkCopywritingQuota(isLoggedIn: boolean) {
  if (isLoggedIn) {
    return { canGenerate: true, remaining: Infinity, total: Infinity }
  }
  return checkCopywritingQuotaLocal()
}

/**
 * 消耗一次封面配额（未登录）
 */
export function consumeCoverQuota(isLoggedIn: boolean) {
  if (isLoggedIn) return
  consumeCoverQuotaLocal()
}

/**
 * 消耗一次文案配额（未登录）
 */
export function consumeCopywritingQuota(isLoggedIn: boolean) {
  if (isLoggedIn) return
  consumeCopywritingQuotaLocal()
}

/**
 * 获取完整配额信息
 */
export function getQuotaInfo(isLoggedIn: boolean) {
  if (isLoggedIn) {
    return {
      isLoggedIn: true,
      cover: { used: 0, remaining: Infinity, total: Infinity },
      copywriting: { used: 0, remaining: Infinity, total: Infinity },
    }
  }
  return getQuotaInfoLocal()
}
