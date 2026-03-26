import { getCoverStyle } from './constants'

const SILICONFLOW_API_BASE = 'https://api.siliconflow.cn/v1'
const SILICONFLOW_API_KEY = process.env.SILICONFLOW_API_KEY || ''

// ========== 图片生成 ==========

interface ImageGenerationParams {
  styleId: string
  ratio: { siliconflowSize: string; width: number; height: number }
  title: string
  subtitle?: string
  decoration?: string
  notes?: string
  imageUrl?: string // 用户上传的参考图
}

interface ImageGenerationResult {
  success: boolean
  imageUrl?: string
  error?: string
}

/**
 * 调用硅基流动图片生成 API
 * 模型：Kwai-Kolors/Kolors（支持文生图和图生图）
 */
export async function generateImage(params: ImageGenerationParams): Promise<ImageGenerationResult> {
  const style = getCoverStyle(params.styleId)
  if (!style) {
    return { success: false, error: `未找到风格: ${params.styleId}` }
  }

  if (!SILICONFLOW_API_KEY || SILICONFLOW_API_KEY === 'sk-your-api-key-here') {
    return { success: false, error: '请先配置 SiliconFlow API Key（在 .env.local 中设置 SILICONFLOW_API_KEY）' }
  }

  // 构建完整的 prompt
  let prompt = style.promptTemplate

  // 加入用户主题信息
  if (params.title) {
    prompt += `, theme related to "${params.title}"`
  }
  if (params.subtitle) {
    prompt += `, subtitle concept "${params.subtitle}"`
  }
  if (params.decoration) {
    prompt += `, decoration elements: ${params.decoration}`
  }
  if (params.notes) {
    prompt += `, additional requirements: ${params.notes}`
  }

  // 构建请求体
  const requestBody: Record<string, unknown> = {
    model: 'Kwai-Kolors/Kolors',
    prompt: prompt,
    image_size: params.ratio.siliconflowSize,
    batch_size: 1,
    num_inference_steps: 20,
    guidance_scale: 7.5,
    seed: Math.floor(Math.random() * 1000000000),
  }

  // 如果用户上传了参考图，使用图生图模式
  if (params.imageUrl) {
    requestBody.image = params.imageUrl
  }

  try {
    const response = await fetch(`${SILICONFLOW_API_BASE}/images/generations`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SILICONFLOW_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('SiliconFlow API error:', response.status, errorData)
      return {
        success: false,
        error: `API 请求失败 (${response.status}): ${errorData?.message || '未知错误'}`,
      }
    }

    const data = await response.json()

    if (data.images && data.images.length > 0 && data.images[0].url) {
      return { success: true, imageUrl: data.images[0].url }
    }

    return { success: false, error: 'API 返回数据格式异常' }
  } catch (error) {
    console.error('图片生成失败:', error)
    return { success: false, error: `生成失败: ${error instanceof Error ? error.message : '未知错误'}` }
  }
}

// ========== 文案生成 ==========

interface CopywritingParams {
  topic: string
  platform: string
  typeId: string
  additionalNotes?: string
}

interface CopywritingResult {
  success: boolean
  content?: string
  error?: string
}

const PLATFORM_NAMES: Record<string, string> = {
  xiaohongshu: '小红书',
  douyin: '抖音',
  wechat: '微信公众号',
  bilibili: 'B站',
  instagram: 'Instagram',
}

const TYPE_PROMPTS: Record<string, string> = {
  hook: '生成3个能3秒抓住注意力的开头标题钩子。每个钩子要简短有力，制造悬念或引发共鸣。',
  'viral-title': '生成5个高点击率的爆款标题。要求：带有情绪词、数字、痛点词，符合平台调性，容易引发点击。',
  'body-framework': '生成一个结构清晰的正文内容框架。包含：开头钩子、分点论述（3-5个要点）、每个要点的展开方向、结尾引导互动。',
  hashtags: '生成15-20个精准的热门话题标签。包含：大流量标签、精准标签、长尾标签，按热度排序。',
  'topic-ideas': '生成8-10个热门选题方向。每个选题包含：选题方向、内容切入点、预计热度评级。',
}

/**
 * 调用硅基流动 Chat API 生成文案
 */
export async function generateCopywriting(params: CopywritingParams): Promise<CopywritingResult> {
  if (!SILICONFLOW_API_KEY || SILICONFLOW_API_KEY === 'sk-your-api-key-here') {
    return { success: false, error: '请先配置 SiliconFlow API Key（在 .env.local 中设置 SILICONFLOW_API_KEY）' }
  }

  const platformName = PLATFORM_NAMES[params.platform] || params.platform
  const typePrompt = TYPE_PROMPTS[params.typeId] || TYPE_PROMPTS['viral-title']

  const systemPrompt = `你是一位资深的社交媒体内容创作专家，擅长为${platformName}平台创作高互动率的内容。你的文案风格：接地气、有情绪、善用表情符号、懂平台算法推荐逻辑。输出格式清晰，使用列表和分隔线。`

  const userMessage = `主题：${params.topic}
平台：${platformName}
需求：${typePrompt}
${params.additionalNotes ? `补充说明：${params.additionalNotes}` : ''}

请直接输出内容，不要有多余的寒暄。`

  try {
    const response = await fetch(`${SILICONFLOW_API_BASE}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SILICONFLOW_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'deepseek-ai/DeepSeek-V3',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage },
        ],
        max_tokens: 2000,
        temperature: 0.8,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('SiliconFlow Chat API error:', response.status, errorData)
      return {
        success: false,
        error: `API 请求失败 (${response.status}): ${errorData?.error?.message || '未知错误'}`,
      }
    }

    const data = await response.json()

    if (data.choices && data.choices.length > 0) {
      return { success: true, content: data.choices[0].message.content }
    }

    return { success: false, error: 'API 返回数据格式异常' }
  } catch (error) {
    console.error('文案生成失败:', error)
    return { success: false, error: `生成失败: ${error instanceof Error ? error.message : '未知错误'}` }
  }
}

// ========== 图片代理下载 ==========

/**
 * 下载远程图片并转为 base64（硅基流动图片 URL 只有1小时有效期）
 */
export async function proxyImage(imageUrl: string): Promise<{ success: boolean; base64?: string; mimeType?: string; error?: string }> {
  try {
    const response = await fetch(imageUrl)
    if (!response.ok) {
      return { success: false, error: `下载图片失败: ${response.status}` }
    }

    const arrayBuffer = await response.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const base64 = buffer.toString('base64')
    const contentType = response.headers.get('content-type') || 'image/png'

    return {
      success: true,
      base64: `data:${contentType};base64,${base64}`,
      mimeType: contentType,
    }
  } catch (error) {
    return {
      success: false,
      error: `代理下载失败: ${error instanceof Error ? error.message : '未知错误'}`,
    }
  }
}
