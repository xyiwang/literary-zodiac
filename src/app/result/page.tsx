'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import html2canvas from 'html2canvas'
import { FullResult } from '@/types'
import ZodiacChart from '@/components/ZodiacChart'
import { REGION_LABELS } from '@/types'

const POSITION_META = {
  sun:    { zh: '太阳位', desc: '你写作最深的驱动力' },
  moon:   { zh: '月亮位', desc: '你文字里隐藏的情绪底色' },
  mercury: { zh: '水星位', desc: '你在句子与语气上的本能选择' },
  venus: { zh: '金星位', desc: '你偏爱的美感与取景方式' },
  rising: { zh: '上升位', desc: '读者第一眼感受到的你' },
}

export default function ResultPage() {
  const [result, setResult] = useState<FullResult | null>(null)
  const [copied, setCopied] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const router = useRouter()
  const cardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const raw = sessionStorage.getItem('zodiacResult')
    if (!raw) { router.push('/'); return }
    setResult(JSON.parse(raw))
  }, [router])

  const handleCopyText = () => {
    if (!result) return
    const text = `📖 我的文学星盘\n\n${result.constellationName}\n\n☀️ 太阳位 · ${result.sunAuthor.name}（${result.sunAuthor.nameEn}）\n🌙 月亮位 · ${result.moonAuthor.name}（${result.moonAuthor.nameEn}）\n⬆️ 上升位 · ${result.risingAuthor.name}（${result.risingAuthor.nameEn}）\n\n${result.description}\n\n测测你的文学星盘 → literary-zodiac.vercel.app`
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownloadImage = async () => {
    if (!result || !cardRef.current || downloading) return

    try {
      setDownloading(true)
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: '#0a0a1a',
        scale: Math.min(window.devicePixelRatio || 1, 2),
        useCORS: true,
      })

      const link = document.createElement('a')
      link.download = `literary-zodiac-${result.constellationName}.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
    } catch (error) {
      console.error('Image export failed:', error)
    } finally {
      setDownloading(false)
    }
  }

  if (!result) {
    return (
      <main className="min-h-screen flex items-center justify-center" style={{ background: '#0a0a1a' }}>
        <p className="text-gray-600 text-sm tracking-widest">正在加载……</p>
      </main>
    )
  }

  const positions = [
    { key: 'sun',    author: result.sunAuthor    },
    { key: 'moon',   author: result.moonAuthor   },
    { key: 'mercury', author: result.mercuryAuthor },
    { key: 'venus', author: result.venusAuthor },
    { key: 'rising', author: result.risingAuthor },
  ] as const

  return (
    <main className="min-h-screen px-6 py-16" style={{ background: '#0a0a1a', fontFamily: 'serif' }}>
      <div className="max-w-xl mx-auto">

        {/* Back */}
        <button
          onClick={() => router.push('/')}
          className="text-xs text-gray-700 tracking-widest hover:text-gray-500 mb-12 block transition-colors"
        >
          ← 重新测试
        </button>

        <div ref={cardRef}>
          {/* Chart */}
          <div className="relative left-1/2 w-screen max-w-6xl -translate-x-1/2 px-4">
            <ZodiacChart
              sunAuthor={result.sunAuthor}
              moonAuthor={result.moonAuthor}
              mercuryAuthor={result.mercuryAuthor}
              venusAuthor={result.venusAuthor}
              risingAuthor={result.risingAuthor}
              degrees={result.degrees}
              constellationName={result.constellationName}
            />
          </div>

          {/* Description */}
          <div className="mt-10 border-t border-gray-900 pt-8">
            <p className="text-gray-300 text-sm leading-loose tracking-wide text-center" style={{ fontFamily: 'serif' }}>
              {result.description}
            </p>
          </div>

          {/* Three author cards */}
          <div className="mt-10 space-y-4">
            {positions.map(({ key, author }) => {
              const meta = POSITION_META[key]
              return (
                <div
                  key={key}
                  className="border border-gray-900 rounded p-5 hover:border-gray-800 transition-colors"
                  style={{ borderLeftColor: author.color, borderLeftWidth: '2px' }}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <span className="text-xs tracking-widest text-gray-600">{meta.zh} · {meta.desc}</span>
                      <div className="mt-1 flex flex-col gap-0.5">
                        <span className="text-lg leading-tight text-gray-100" style={{ color: author.color }}>{author.name}</span>
                        <span className="text-xs leading-tight text-gray-600">{author.nameEn}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-gray-700">{REGION_LABELS[author.region]}</span>
                      <div className="text-xs text-gray-700 mt-0.5">{author.years}</div>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 leading-relaxed mt-2">{author.oneLiner}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {author.tags.map(tag => (
                      <span
                        key={tag}
                        className="rounded-full border border-gray-800/80 bg-gray-950/30 px-1.5 py-0.5 text-[10px] leading-4 text-gray-500"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Share */}
        <div className="mt-10 flex flex-col gap-3">
          <button
            onClick={handleDownloadImage}
            disabled={downloading}
            className="w-full py-3 border border-purple-900 text-purple-200 text-xs tracking-[0.3em] hover:bg-purple-950/40 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {downloading ? '生成图片中…' : '下载星盘图片 · PNG'}
          </button>
          <button
            onClick={handleCopyText}
            className="w-full py-3 border border-amber-900 text-amber-200 text-xs tracking-[0.3em] hover:bg-amber-950/40 transition-all"
          >
            {copied ? '✓ 已复制到剪贴板' : '复制星盘文字 · 分享'}
          </button>
          <button
            onClick={() => router.push('/')}
            className="w-full py-3 border border-gray-800 text-gray-600 text-xs tracking-[0.3em] hover:border-gray-700 transition-all"
          >
            再测一段文字
          </button>
        </div>

        <p className="text-center text-gray-800 text-xs mt-10">
          文学星盘 · Literary Zodiac
        </p>
      </div>
    </main>
  )
}
