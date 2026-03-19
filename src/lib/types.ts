// ========== 平台相关类型 ==========

export interface Platform {
  id: string
  name: string
  icon: string // emoji
  description: string
  ratios: AspectRatio[]
}

export interface AspectRatio {
  id: string
  label: string
  width: number
  height: number
  siliconflowSize: string // 硅基流动支持的尺寸
  description: string
  isDefault?: boolean
}

// ========== 封面风格 ==========

export interface CoverStyle {
  id: string
  name: string
  description: string
  tags: string[]
  gradient: string // CSS 渐变，用于卡片预览
  promptTemplate: string // AI prompt 模板
  recommended: string // 推荐使用场景
}

// ========== 字体风格 ==========

export interface FontStyle {
  id: string
  name: string
  family: string // Google Font family name
  weight: number | string
  style: string
  preview: string
}

// ========== 文案类型 ==========

export interface CopywritingType {
  id: string
  name: string
  description: string
  icon: string
}

// ========== API 请求/响应类型 ==========

export interface GenerateCoverRequest {
  style: string // 风格 ID
  platform: string // 平台 ID
  ratio: string // 比例 ID
  title: string
  subtitle?: string
  font?: string // 字体 ID
  decoration?: string
  notes?: string
  imageUrl?: string // 用户上传的参考图 base64 或 URL
  subjectImage?: string // 人像/主体图片
  backgroundImages?: string[] // 背景/空镜图片
}

export interface GenerateCoverResponse {
  success: boolean
  imageUrl?: string
  error?: string
}

export interface CopywritingRequest {
  topic: string
  platform: string
  type: string // 文案类型 ID
  additionalNotes?: string
}

export interface CopywritingResponse {
  success: boolean
  content?: string
  error?: string
}

// ========== UI 状态类型 ==========

export interface UploadedImage {
  id: string
  file: File
  preview: string // base64 data URL
}
