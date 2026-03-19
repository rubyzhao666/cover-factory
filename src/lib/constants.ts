import type { Platform, AspectRatio, CoverStyle, FontStyle, CopywritingType } from './types'

// ========== 支持的平台 ==========

export const platforms: Platform[] = [
  {
    id: 'xiaohongshu',
    name: '小红书',
    icon: '📕',
    description: '笔记/视频封面',
    ratios: [
      { id: '3:4', label: '3:4', width: 768, height: 1024, siliconflowSize: '768x1024', description: '小红书标准竖图', isDefault: true },
      { id: '1:1', label: '1:1', width: 1024, height: 1024, siliconflowSize: '1024x1024', description: '正方形' },
      { id: '4:3', label: '4:3', width: 1024, height: 768, siliconflowSize: '1024x768', description: '横版图片' },
    ],
  },
  {
    id: 'douyin',
    name: '抖音',
    icon: '🎵',
    description: '短视频封面',
    ratios: [
      { id: '9:16', label: '9:16', width: 720, height: 1280, siliconflowSize: '720x1280', description: '抖音标准竖屏', isDefault: true },
      { id: '3:4', label: '3:4', width: 768, height: 1024, siliconflowSize: '768x1024', description: '竖图' },
      { id: '16:9', label: '16:9', width: 1280, height: 720, siliconflowSize: '1280x720', description: '横版封面' },
    ],
  },
  {
    id: 'wechat',
    name: '公众号',
    icon: '💚',
    description: '文章封面',
    ratios: [
      { id: '2.35:1', label: '2.35:1', width: 1024, height: 436, siliconflowSize: '1024x436', description: '公众号头图', isDefault: true },
      { id: '1:1', label: '1:1', width: 1024, height: 1024, siliconflowSize: '1024x1024', description: '正方形封面' },
      { id: '16:9', label: '16:9', width: 1280, height: 720, siliconflowSize: '1280x720', description: '次条封面' },
    ],
  },
  {
    id: 'bilibili',
    name: 'B站',
    icon: '📺',
    description: '视频封面',
    ratios: [
      { id: '16:9', label: '16:9', width: 1280, height: 720, siliconflowSize: '1280x720', description: 'B站标准横版', isDefault: true },
      { id: '16:10', label: '16:10', width: 1280, height: 800, siliconflowSize: '1280x800', description: '16:10 横版' },
    ],
  },
  {
    id: 'instagram',
    name: 'Instagram',
    icon: '📸',
    description: '帖子/Reels封面',
    ratios: [
      { id: '1:1', label: '1:1', width: 1024, height: 1024, siliconflowSize: '1024x1024', description: '正方形帖子', isDefault: true },
      { id: '4:5', label: '4:5', width: 820, height: 1024, siliconflowSize: '820x1024', description: '竖版帖子' },
      { id: '9:16', label: '9:16', width: 720, height: 1280, siliconflowSize: '720x1280', description: 'Reels 竖屏' },
    ],
  },
]

// ========== 13种封面风格 ==========

export const coverStyles: CoverStyle[] = [
  {
    id: 'minimal-gradient',
    name: '简约纯色',
    description: '干净简洁的渐变背景，适合文字叠加',
    tags: ['通用', '百搭'],
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    promptTemplate: 'Clean minimal gradient background, soft pastel colors blending smoothly, no objects, no text, no people, suitable for text overlay, professional social media cover design, high quality, 4k',
    recommended: '任何类型的内容，万能百搭',
  },
  {
    id: 'light-effects',
    name: '渐变光效',
    description: '绚丽的光效与渐变，现代感十足',
    tags: ['科技', '时尚'],
    gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 50%, #ffd200 100%)',
    promptTemplate: 'Beautiful gradient background with stunning light effects, lens flare, vibrant colors blending, modern abstract, no text, no objects, professional social media cover, high quality, 4k',
    recommended: '科技、时尚、潮流类内容',
  },
  {
    id: 'hand-drawn',
    name: '手绘边框',
    description: '手绘风格的装饰边框，文艺感满满',
    tags: ['文艺', '手账'],
    gradient: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
    promptTemplate: 'Hand-drawn frame border style background, sketch illustration elements, warm tones, artistic touch, doodle decorations around edges, no text, no people, creative social media cover, high quality, 4k',
    recommended: '文艺、手账、个人分享类内容',
  },
  {
    id: 'neon-cyber',
    name: '霓虹赛博',
    description: '暗色背景搭配霓虹灯光，未来感十足',
    tags: ['科技', '游戏'],
    gradient: 'linear-gradient(135deg, #0c0c1d 0%, #1a0533 50%, #ff006e 100%)',
    promptTemplate: 'Cyberpunk neon style background, dark base with glowing neon lights in pink, blue and purple, futuristic vibe, circuit patterns, holographic effects, no text, no people, professional social media cover, high quality, 4k',
    recommended: '科技、游戏、潮酷类内容',
  },
  {
    id: 'japanese-fresh',
    name: '日系清新',
    description: '柔和的色调与自然光线，干净通透',
    tags: ['生活', '旅行'],
    gradient: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
    promptTemplate: 'Japanese fresh aesthetic background, soft pastel colors, natural light, clean and airy, subtle floral or nature elements, no text, no people, dreamy atmosphere, professional social media cover, high quality, 4k',
    recommended: '生活日常、旅行、美食类内容',
  },
  {
    id: 'retro-film',
    name: '复古胶片',
    description: '暖色调复古胶片质感，怀旧氛围',
    tags: ['复古', '怀旧'],
    gradient: 'linear-gradient(135deg, #d4a574 0%, #c49b6b 50%, #8b6d4f 100%)',
    promptTemplate: 'Retro film photography style background, warm vintage tones, film grain texture, nostalgic mood, analog camera feel, light leaks, no text, no people, professional social media cover, high quality, 4k',
    recommended: '复古、怀旧、文艺类内容',
  },
  {
    id: 'business-premium',
    name: '商务质感',
    description: '专业的几何设计，高端大气',
    tags: ['商务', '职场'],
    gradient: 'linear-gradient(135deg, #1a237e 0%, #283593 50%, #c9a84c 100%)',
    promptTemplate: 'Professional business style background, clean geometric shapes, premium feel, dark navy blue with gold accents, subtle patterns, corporate aesthetic, no text, no people, professional social media cover, high quality, 4k',
    recommended: '商务、职场、知识分享类内容',
  },
  {
    id: 'cute-sticker',
    name: '可爱贴纸',
    description: '缤纷色彩搭配可爱元素，活力满满',
    tags: ['可爱', '萌系'],
    gradient: 'linear-gradient(135deg, #ff9a9e 0%, #fad0c4 50%, #ffecd2 100%)',
    promptTemplate: 'Cute sticker style background, colorful pastel, playful kawaii elements, rounded shapes, cute decorative elements scattered, bright and cheerful, no text, no people, fun social media cover, high quality, 4k',
    recommended: '可爱、萌系、生活方式类内容',
  },
  {
    id: 'bold-poster',
    name: '大字报风格',
    description: '高对比度的排版设计，视觉冲击力强',
    tags: ['冲击力', '醒目'],
    gradient: 'linear-gradient(135deg, #ff416c 0%, #ff4b2b 100%)',
    promptTemplate: 'Bold poster style background, high contrast colors, dynamic graphic design elements, strong visual impact, abstract geometric shapes, eye-catching layout composition, no text, no people, professional social media cover, high quality, 4k',
    recommended: '需要强烈视觉冲击力的内容',
  },
  {
    id: 'magazine-editorial',
    name: '杂志排版',
    description: '优雅的杂志风格排版背景',
    tags: ['时尚', '杂志'],
    gradient: 'linear-gradient(135deg, #2c3e50 0%, #4ca1af 100%)',
    promptTemplate: 'Magazine editorial layout background, elegant typography-inspired design elements, fashion aesthetic, sophisticated color palette, clean layout guides, no actual text, no people, premium social media cover, high quality, 4k',
    recommended: '时尚、美妆、品质生活类内容',
  },
  {
    id: 'chinese-traditional',
    name: '国潮中国风',
    description: '水墨元素与国风配色，文化韵味十足',
    tags: ['国潮', '文化'],
    gradient: 'linear-gradient(135deg, #c62828 0%, #ff8f00 50%, #1a1a2e 100%)',
    promptTemplate: 'Chinese traditional style background, ink painting elements, red and gold colors, cultural motifs, subtle cloud or mountain patterns, traditional aesthetics, no text, no people, artistic social media cover, high quality, 4k',
    recommended: '国潮、文化、传统节日类内容',
  },
  {
    id: 'minimal-bw',
    name: '极简黑白',
    description: '极简主义黑白对比，高级感拉满',
    tags: ['极简', '高级'],
    gradient: 'linear-gradient(135deg, #1a1a1a 0%, #4a4a4a 100%)',
    promptTemplate: 'Minimalist black and white background, high contrast, clean lines, sophisticated composition, subtle gray tones, elegant negative space, no text, no people, premium social media cover, high quality, 4k',
    recommended: '极简主义、高端、艺术类内容',
  },
  {
    id: 'dreamy-bokeh',
    name: '梦幻柔焦',
    description: '梦幻般的柔焦效果，浪漫柔和',
    tags: ['梦幻', '浪漫'],
    gradient: 'linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)',
    promptTemplate: 'Dreamy soft focus background, ethereal atmosphere, pastel colors, blurred light bokeh circles, romantic mood, gentle gradients, fairy tale quality, no text, no people, beautiful social media cover, high quality, 4k',
    recommended: '梦幻、浪漫、情感类内容',
  },
]

// ========== 字体风格 ==========

export const fontStyles: FontStyle[] = [
  {
    id: 'default',
    name: '默认风格',
    family: 'Noto Sans SC',
    weight: 700,
    style: 'normal',
    preview: 'ABab 你好世界',
  },
  {
    id: 'bold-black',
    name: '大粗黑体',
    family: 'Noto Sans SC',
    weight: 900,
    style: 'normal',
    preview: 'ABab 你好世界',
  },
  {
    id: 'song-ti',
    name: '稳重宋体',
    family: 'Noto Serif SC',
    weight: 600,
    style: 'normal',
    preview: 'ABab 你好世界',
  },
  {
    id: 'round',
    name: '圆体',
    family: 'Noto Sans SC',
    weight: 500,
    style: 'normal',
    preview: 'ABab 你好世界',
  },
  {
    id: 'handwriting',
    name: '手写体',
    family: 'ZCOOL KuaiLe',
    weight: 400,
    style: 'normal',
    preview: 'ABab 你好世界',
  },
  {
    id: 'calligraphy',
    name: '书法体',
    family: 'Ma Shan Zheng',
    weight: 400,
    style: 'normal',
    preview: 'ABab 你好世界',
  },
  {
    id: 'elegant',
    name: '优雅细体',
    family: 'Noto Sans SC',
    weight: 300,
    style: 'normal',
    preview: 'ABab 你好世界',
  },
]

// ========== 文案类型 ==========

export const copywritingTypes: CopywritingType[] = [
  {
    id: 'hook',
    name: '标题钩子',
    description: '3秒抓住注意力的开头标题',
    icon: '🪝',
  },
  {
    id: 'viral-title',
    name: '爆款标题',
    description: '高点击率的小红书/抖音标题',
    icon: '🔥',
  },
  {
    id: 'body-framework',
    name: '正文框架',
    description: '结构清晰的正文内容框架',
    icon: '📝',
  },
  {
    id: 'hashtags',
    name: '热门标签',
    description: '精准的热门话题标签组合',
    icon: '#️⃣',
  },
  {
    id: 'topic-ideas',
    name: '选题灵感',
    description: '热门选题方向和内容创意',
    icon: '💡',
  },
]

// ========== 辅助函数 ==========

/** 根据平台 ID 获取平台配置 */
export function getPlatform(id: string): Platform | undefined {
  return platforms.find((p) => p.id === id)
}

/** 根据平台 ID + 比例 ID 获取比例配置 */
export function getAspectRatio(platformId: string, ratioId: string): AspectRatio | undefined {
  const platform = getPlatform(platformId)
  return platform?.ratios.find((r) => r.id === ratioId)
}

/** 根据风格 ID 获取风格配置 */
export function getCoverStyle(id: string): CoverStyle | undefined {
  return coverStyles.find((s) => s.id === id)
}

/** 根据字体 ID 获取字体配置 */
export function getFontStyle(id: string): FontStyle | undefined {
  return fontStyles.find((f) => f.id === id)
}
