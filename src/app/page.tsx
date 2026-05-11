'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

const LOADING_LINES = [
  '正在感知你的文字气息……',
  '比对一百位作家的灵魂……',
  '描绘你的星盘轮廓……',
  '即将揭示你从未意识到的事……',
]

interface Star {
  w: number
  h: number
  top: number
  left: number
  opacity: number
}

export default function Home() {
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingLine, setLoadingLine] = useState(0)
  const [error, setError] = useState('')
  const [stars, setStars] = useState<Star[]>([])
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const router = useRouter()

  useEffect(() => {
    setStars(
      Array.from({ length: 40 }, () => ({
        w: Math.random() * 2 + 1,
        h: Math.random() * 2 + 1,
        top: Math.random() * 100,
        left: Math.random() * 100,
        opacity: Math.random() * 0.4 + 0.1,
      }))
    )
  }, [])

  const handleSubmit = async () => {
    if (text.trim().length < 100) {
      setError('请至少输入100字的原创文字')
      return
    }
    setError('')
    setLoading(true)

    const interval = setInterval(() => {
      setLoadingLine(prev => (prev + 1) % LOADING_LINES.length)
    }, 1800)

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || '分析失败，请稍后重试')
        return
      }

      sessionStorage.setItem('zodiacResult', JSON.stringify(data))
      router.push('/result')
    } catch {
      setError('网络错误，请稍后重试')
    } finally {
      clearInterval(interval)
      setLoading(false)
    }
  }

  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center px-6 py-20"
      style={{
        background: '#0a0a1a',
        fontFamily: 'serif',
        position: 'relative',
        width: '100%',
        overflowX: 'hidden',
      }}
    >

      {/* Stars background dots */}
      <div
        className="fixed inset-0 overflow-hidden pointer-events-none"
        style={{ zIndex: 0, pointerEvents: 'none' }}
      >
        {stars.map((star, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white"
            style={{
              width: star.w + 'px',
              height: star.h + 'px',
              top: star.top + '%',
              left: star.left + '%',
              opacity: star.opacity,
            }}
          />
        ))}
      </div>

      <div
        className="relative max-w-xl w-full mx-auto"
        style={{ zIndex: 1, width: 'min(100%, 42rem)', margin: '0 auto', position: 'relative' }}
      >
        {/* Header */}
        <div className="text-center mb-14">
          <p className="text-xs tracking-[0.4em] text-amber-700 mb-4">LITERARY ZODIAC</p>
          <h1 className="text-4xl md:text-5xl tracking-widest text-amber-100 mb-5">
            文学星盘
          </h1>
          <p className="text-gray-500 text-sm leading-relaxed max-w-sm mx-auto">
            你的文字比你更诚实。<br />
            输入一段原创文字，发现你与一百位作家之间的隐秘联系。
          </p>
        </div>

        {/* Textarea */}
        <div
          className="relative"
          onMouseDown={() => {
            if (!loading) textareaRef.current?.focus()
          }}
        >
          <textarea
            ref={textareaRef}
            value={text}
            onChange={e => { setText(e.target.value); setError('') }}
            placeholder={"在这里粘贴你的原创文字（小说、散文、诗歌、随笔均可）\n\n至少100字。你的文字只用于生成星盘，不会被储存。"}
            disabled={loading}
            rows={10}
            className="w-full bg-transparent rounded border border-gray-800 p-5 text-gray-300 text-sm leading-loose resize-none focus:outline-none focus:border-amber-900 placeholder-gray-700 transition-colors disabled:opacity-40"
            style={{
              fontFamily: 'serif',
              width: '100%',
              maxWidth: '100%',
              display: 'block',
              position: 'relative',
              zIndex: 2,
              pointerEvents: 'auto',
              color: '#d1d5db',
            }}
          />
          <span className="absolute bottom-3 right-4 text-xs text-gray-700" style={{ pointerEvents: 'none' }}>
            {text.length} 字
          </span>
        </div>

        {/* Error */}
        {error && (
          <p className="text-red-500 text-xs mt-3 text-center">{error}</p>
        )}

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="mt-6 w-full py-3.5 border border-amber-900 text-amber-200 text-xs tracking-[0.3em] hover:bg-amber-950/40 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {loading ? LOADING_LINES[loadingLine] : '解读我的文字 →'}
        </button>

        {/* Footer note */}
        <p className="text-center text-gray-700 text-xs mt-10 tracking-wide">
          100位作家 · 三个星位 · 你的专属文学星座
        </p>
      </div>
    </main>
  )
}
