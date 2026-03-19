import Link from 'next/link'
import { Sparkles, PenTool, Zap, Globe, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function Home() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(251,146,60,0.15),rgba(236,72,153,0.1))]"></div>
        <div className="relative mx-auto max-w-5xl px-4 py-20 sm:px-6 sm:py-28">
          <div className="flex flex-col items-center text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-100/80 px-4 py-1.5 text-sm text-orange-700">
              <Sparkles className="h-4 w-4" />
              AI 驱动，10秒生成精美封面
            </div>
            <h1 className="mb-4 text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
              <span className="bg-gradient-to-r from-orange-500 via-pink-500 to-purple-500 bg-clip-text text-transparent">
                一键生成
              </span>
              <br />
              多平台封面
            </h1>
            <p className="mb-8 max-w-xl text-lg text-gray-600 leading-relaxed">
              支持<span className="font-medium text-gray-800">小红书、抖音、公众号、B站、Instagram</span>等主流平台，
              13种精美风格，AI 智能生成，让每一张封面都成为点击磁铁。
            </p>
            <div className="flex gap-4">
              <Link href="/generate">
                <Button size="lg" className="gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-pink-500 px-8 text-base font-semibold shadow-lg shadow-orange-200 hover:shadow-xl hover:shadow-orange-300 transition-all">
                  <Sparkles className="h-5 w-5" />
                  开始生成
                </Button>
              </Link>
              <Link href="/copywriting">
                <Button variant="outline" size="lg" className="gap-2 rounded-xl px-6 text-base">
                  <PenTool className="h-5 w-5" />
                  爆款文案
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 功能亮点 */}
      <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
        <div className="mb-10 text-center">
          <h2 className="mb-3 text-2xl font-bold text-gray-900">为什么选择封面工厂</h2>
          <p className="text-gray-500">从构思到成品，只需要几秒钟</p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              icon: <Zap className="h-6 w-6 text-orange-500" />,
              title: 'AI 极速生成',
              desc: '10-30秒生成精美封面，告别漫长等待',
            },
            {
              icon: <Globe className="h-6 w-6 text-pink-500" />,
              title: '多平台适配',
              desc: '一键适配5大平台，自动匹配最佳比例',
            },
            {
              icon: <Sparkles className="h-6 w-6 text-purple-500" />,
              title: '13种风格',
              desc: '从简约到国潮，从霓虹到手绘，风格任选',
            },
            {
              icon: <PenTool className="h-6 w-6 text-blue-500" />,
              title: '爆款文案',
              desc: 'AI 撰写高互动率文案，标题、正文、标签一站搞定',
            },
          ].map((item) => (
            <div
              key={item.title}
              className="group rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5"
            >
              <div className="mb-3 inline-flex rounded-xl bg-gray-50 p-2.5 transition-colors group-hover:bg-orange-50">
                {item.icon}
              </div>
              <h3 className="mb-1.5 text-base font-semibold text-gray-900">{item.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 使用流程 */}
      <section className="bg-gray-50/80">
        <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
          <div className="mb-10 text-center">
            <h2 className="mb-3 text-2xl font-bold text-gray-900">三步搞定封面</h2>
            <p className="text-gray-500">简单到不需要教程</p>
          </div>
          <div className="grid gap-8 sm:grid-cols-3">
            {[
              {
                step: '01',
                title: '选择风格与平台',
                desc: '选择目标平台和喜欢的封面风格，填写标题内容',
              },
              {
                step: '02',
                title: 'AI 生成封面',
                desc: 'AI 根据你的需求自动生成精美封面图',
              },
              {
                step: '03',
                title: '下载发布',
                desc: '预览满意后一键下载，直接发布到平台',
              },
            ].map((item) => (
              <div key={item.step} className="flex flex-col items-center text-center">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-400 to-pink-500 text-xl font-bold text-white shadow-lg shadow-orange-200">
                  {item.step}
                </div>
                <h3 className="mb-2 text-lg font-semibold text-gray-900">{item.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 支持平台 */}
      <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
        <div className="mb-10 text-center">
          <h2 className="mb-3 text-2xl font-bold text-gray-900">覆盖主流内容平台</h2>
          <p className="text-gray-500">一套内容，多平台分发</p>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {[
            { icon: '📕', name: '小红书', desc: '笔记/视频封面' },
            { icon: '🎵', name: '抖音', desc: '短视频封面' },
            { icon: '💚', name: '公众号', desc: '文章封面' },
            { icon: '📺', name: 'B站', desc: '视频封面' },
            { icon: '📸', name: 'Instagram', desc: '帖子封面' },
          ].map((p) => (
            <div
              key={p.name}
              className="flex flex-col items-center gap-2 rounded-2xl border border-gray-100 bg-white p-5 transition-all hover:shadow-sm hover:border-gray-200"
            >
              <span className="text-3xl">{p.icon}</span>
              <span className="text-sm font-medium text-gray-800">{p.name}</span>
              <span className="text-xs text-gray-400">{p.desc}</span>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-orange-500 to-pink-500">
        <div className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6">
          <h2 className="mb-4 text-2xl font-bold text-white sm:text-3xl">
            现在就开始，让封面成为你的竞争力
          </h2>
          <p className="mb-8 text-orange-100">
            免费体验，无需注册，AI 帮你打造每一张封面
          </p>
          <Link href="/generate">
            <Button size="lg" className="gap-2 rounded-xl bg-white px-8 text-base font-semibold text-orange-600 shadow-xl hover:bg-orange-50 transition-all">
              免费生成封面
              <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  )
}
