'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import BookFlipLoader from '@/components/BookFlipLoader'

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
      setLoading(false)
    }
  }

  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center px-6 py-28 md:py-32"
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

      <div className="relative w-full mx-auto" style={{ zIndex: 1 }}>
        {/* Header */}
        <div className="text-center mb-24 md:mb-28">
          <p className="text-[11px] tracking-[0.5em] text-amber-700/85 mb-8">LITERARY ZODIAC</p>
          <h1 className="text-4xl md:text-5xl tracking-[0.32em] md:tracking-[0.42em] text-amber-100 mb-10 md:mb-12">
            文学星盘
          </h1>
          <p className="text-gray-500 text-sm leading-relaxed max-w-md mx-auto">
            你的文字比你更诚实。<br />
            输入一段原创文字，生成你的文学星盘。
          </p>
        </div>

        {/* Textarea */}
        <div
          className="relative mx-auto w-full max-w-[600px] rounded-[2px] border border-amber-800/35 p-1.5"
          onMouseDown={() => {
            if (!loading) textareaRef.current?.focus()
          }}
        >
          <textarea
            ref={textareaRef}
            value={text}
            onChange={e => { setText(e.target.value); setError('') }}
            placeholder="在这里粘贴你的原创文字"
            disabled={loading}
            rows={11}
            className="w-full rounded-[1px] border border-gray-700/70 bg-transparent px-6 py-6 text-gray-300 text-sm leading-loose resize-none focus:outline-none focus:border-amber-700/70 placeholder-gray-700 transition-colors disabled:opacity-40"
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
        <div className="mt-8 flex justify-center">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full max-w-[600px] py-3 border border-amber-800/60 text-amber-200 text-xs tracking-[0.28em] hover:bg-amber-950/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading ? '正在翻阅群星中的作家…' : '解读我的文字 →'}
          </button>
        </div>
      </div>

      {loading && <BookFlipLoader active={loading} onComplete={() => {}} />}
    </main>
  )
}
