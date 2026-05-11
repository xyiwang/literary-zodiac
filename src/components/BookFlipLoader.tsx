'use client'

import { useEffect, useMemo, useState } from 'react'

const AUTHORS = [
  { file: '杜拉斯.png', name: '杜拉斯' },
  { file: '张爱玲.png', name: '张爱玲' },
  { file: '鲁迅.png', name: '鲁迅' },
  { file: '川端康成.png', name: '川端康成' },
  { file: '太宰治.png', name: '太宰治' },
  { file: '菲茨杰拉德.png', name: '菲茨杰拉德' },
  { file: '普鲁斯特.png', name: '普鲁斯特' },
  { file: '阿特伍德.png', name: '阿特伍德' },
  { file: '爱丽丝门罗.png', name: '爱丽丝·门罗' },
  { file: '海明威.png', name: '海明威' },
  { file: '马尔克斯.png', name: '马尔克斯' },
  { file: '博尔赫斯.png', name: '博尔赫斯' },
  { file: '三岛由纪夫.png', name: '三岛由纪夫' },
  { file: '萧红.png', name: '萧红' },
  { file: '聂鲁达.png', name: '聂鲁达' },
]

interface Props {
  active?: boolean
  onComplete: () => void
}

const FLIP_DURATION_MS = 150

function getRandomAuthors() {
  const arr = [...AUTHORS]
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr.slice(0, 12)
}

export default function BookFlipLoader({ active = true, onComplete }: Props) {
  const [sequence, setSequence] = useState(AUTHORS.slice(0, 12))
  const [currentIndex, setCurrentIndex] = useState(0)
  const [nextIndex, setNextIndex] = useState<number | null>(null)
  const [flipping, setFlipping] = useState(false)

  const intervals = useMemo(
    () => [90, 120, 160, 220, 300, 390, 500, 620, 760, 900, 1040],
    []
  )

  useEffect(() => {
    if (!active) return

    const picked = getRandomAuthors()
    setSequence(picked)
    setCurrentIndex(0)
    setNextIndex(null)
    setFlipping(false)

    const timers: Array<ReturnType<typeof setTimeout>> = []
    let step = 0

    const runFlip = () => {
      if (step >= picked.length - 1) {
        timers.push(setTimeout(onComplete, 240))
        return
      }

      const upcoming = step + 1
      setNextIndex(upcoming)
      setFlipping(true)

      timers.push(
        setTimeout(() => {
          setCurrentIndex(upcoming)
          setNextIndex(null)
          setFlipping(false)
          step = upcoming
          const wait = intervals[Math.min(step, intervals.length - 1)]
          timers.push(setTimeout(runFlip, wait))
        }, FLIP_DURATION_MS)
      )
    }

    timers.push(setTimeout(runFlip, 380))

    return () => {
      timers.forEach(clearTimeout)
    }
  }, [active, intervals, onComplete])

  if (!active) return null

  const current = sequence[currentIndex]
  const next = nextIndex !== null ? sequence[nextIndex] : null

  return (
    <div className="book-loader-overlay">
      <div className="book-shadow" />

      <div className="book-frame">
        <div className="page-static">
          <PageContent file={current.file} name={current.name} />
        </div>

        {flipping && next && (
          <>
            <div className="sheet-out">
              <div className="sheet-face face-front">
                <PageContent file={current.file} name={current.name} />
              </div>
              <div className="sheet-face face-back" />
            </div>

            <div className="sheet-in">
              <div className="sheet-face face-front-in">
                <PageContent file={next.file} name={next.name} />
              </div>
              <div className="sheet-face face-back-in" />
            </div>
          </>
        )}

        <div className="book-spine" />
      </div>

      <p className="loader-text">正在生成你的文学星盘……</p>

      <style jsx>{`
        .book-loader-overlay {
          position: fixed;
          inset: 0;
          z-index: 9999;
          background: #0a0a1a;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }
        .book-shadow {
          position: absolute;
          width: 520px;
          max-width: 70vw;
          height: 120px;
          border-radius: 50%;
          background: radial-gradient(ellipse at center, rgba(0, 0, 0, 0.46), rgba(0, 0, 0, 0) 72%);
          filter: blur(4px);
          transform: translateY(190px);
          pointer-events: none;
        }
        .book-frame {
          width: 290px;
          max-width: 84vw;
          aspect-ratio: 3 / 4;
          position: relative;
          perspective: 1400px;
          transform: rotateZ(-0.8deg) rotateX(2deg);
        }
        .page-static {
          position: absolute;
          inset: 0;
          background: #c8a97e;
          border-radius: 4px 12px 12px 4px;
          box-shadow: 4px 4px 20px rgba(0, 0, 0, 0.62), inset -3px 0 8px rgba(0, 0, 0, 0.22);
          overflow: hidden;
          padding: 18px;
          backface-visibility: hidden;
          transform-style: preserve-3d;
        }
        .sheet-out,
        .sheet-in {
          position: absolute;
          inset: 0;
          transform-origin: left center;
          transform-style: preserve-3d;
          backface-visibility: hidden;
          will-change: transform, filter;
          border-radius: 4px 12px 12px 4px;
        }
        .sheet-out {
          z-index: 4;
          animation: pageOut ${FLIP_DURATION_MS}ms ease-in-out forwards;
        }
        .sheet-in {
          z-index: 3;
          transform: rotateY(-180deg);
          animation: pageIn ${FLIP_DURATION_MS}ms ease-in-out forwards;
        }
        .sheet-face {
          position: absolute;
          inset: 0;
          border-radius: 4px 12px 12px 4px;
          background: #c8a97e;
          padding: 18px;
          backface-visibility: hidden;
          transform-style: preserve-3d;
          box-shadow: inset 0 0 0 1px rgba(101, 68, 35, 0.12), inset -6px 0 10px rgba(55, 30, 12, 0.12);
        }
        .face-front {
          transform: rotateY(0deg);
        }
        .face-back {
          transform: rotateY(180deg);
          background: linear-gradient(180deg, #c9b08a 0%, #b79b74 45%, #b39974 100%);
        }
        .face-front-in {
          transform: rotateY(180deg);
        }
        .face-back-in {
          transform: rotateY(360deg);
          background: linear-gradient(180deg, #c9b08a 0%, #b79b74 45%, #b39974 100%);
        }
        .book-spine {
          position: absolute;
          left: 0;
          top: 6px;
          bottom: 6px;
          width: 8px;
          border-radius: 2px 0 0 2px;
          background: linear-gradient(to right, #6b4c2a, #8b6914);
        }
        .loader-text {
          margin-top: 28px;
          font-size: 11px;
          letter-spacing: 0.28em;
          color: #4e4e70;
          font-family: serif;
        }
        @keyframes pageOut {
          0% {
            transform: rotateY(0deg);
            filter: drop-shadow(-2px 2px 4px rgba(0, 0, 0, 0.2));
          }
          55% {
            transform: rotateY(-102deg);
            filter: drop-shadow(-10px 8px 12px rgba(0, 0, 0, 0.36));
          }
          100% {
            transform: rotateY(-180deg);
            filter: drop-shadow(-2px 2px 3px rgba(0, 0, 0, 0.14));
          }
        }
        @keyframes pageIn {
          0% {
            transform: rotateY(-180deg);
            filter: drop-shadow(-7px 5px 9px rgba(0, 0, 0, 0.26));
          }
          45% {
            transform: rotateY(-84deg);
            filter: drop-shadow(-6px 4px 8px rgba(0, 0, 0, 0.24));
          }
          100% {
            transform: rotateY(0deg);
            filter: drop-shadow(-2px 2px 3px rgba(0, 0, 0, 0.14));
          }
        }
      `}</style>
    </div>
  )
}

function PageContent({ file, name }: { file: string; name: string }) {
  return (
    <div className="page-content">
      <div className="portrait-wrap">
        <img src={`/authors/${file}`} alt={name} className="portrait" />
      </div>
      <p className="name">{name}</p>

      <style jsx>{`
        .page-content {
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }
        .portrait-wrap {
          width: 100%;
          flex: 1;
          min-height: 0;
          border-radius: 2px;
          border: 1px solid rgba(90, 60, 33, 0.3);
          background: #c8a97e;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .portrait {
          width: 100%;
          height: 100%;
          object-fit: contain;
          object-position: center center;
          display: block;
        }
        .name {
          margin-top: 12px;
          font-size: 14px;
          letter-spacing: 0.26em;
          color: #3a2a1a;
          font-family: serif;
          text-align: center;
          white-space: nowrap;
        }
      `}</style>
    </div>
  )
}
