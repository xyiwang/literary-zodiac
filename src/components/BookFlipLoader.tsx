'use client'

import { type CSSProperties, useEffect, useState } from 'react'

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

// Shuffle and pick ~12 authors for the animation
function getRandomAuthors() {
  return [...AUTHORS].sort(() => Math.random() - 0.5).slice(0, 12)
}

interface Props {
  active?: boolean
  onComplete: () => void
}

const FLIP_DURATION_MS = 220

export default function BookFlipLoader({ active = true, onComplete }: Props) {
  const [authors] = useState(getRandomAuthors)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [nextIndex, setNextIndex] = useState<number | null>(null)
  const [flipping, setFlipping] = useState(false)

  useEffect(() => {
    if (!active) return

    let index = 0
    // Intervals: start fast, then gradually slow down
    const intervals = [80, 110, 140, 180, 230, 290, 360, 440, 530, 630, 760, 900]
    const timers: Array<ReturnType<typeof setTimeout>> = []

    function flip() {
      if (index >= authors.length - 1) {
        timers.push(setTimeout(onComplete, 300))
        return
      }

      const upcoming = index + 1
      setNextIndex(upcoming)
      setFlipping(true)
      timers.push(setTimeout(() => {
        index = upcoming
        setCurrentIndex(upcoming)
        setNextIndex(null)
        setFlipping(false)
        const delay = intervals[Math.min(index, intervals.length - 1)]
        timers.push(setTimeout(flip, delay))
      }, FLIP_DURATION_MS))
    }

    setCurrentIndex(0)
    setNextIndex(null)
    setFlipping(false)

    timers.push(setTimeout(flip, 600))
    return () => {
      timers.forEach(clearTimeout)
    }
  }, [active, authors, onComplete])

  if (!active) return null

  const author = authors[currentIndex]
  const nextAuthor = nextIndex !== null ? authors[nextIndex] : null
  const renderPage = (item: { file: string; name: string }) => (
    <>
      <div style={styles.portraitWrap}>
        <img
          src={`/authors/${item.file}`}
          alt={item.name}
          style={styles.portrait}
        />
      </div>
      <p style={styles.name}>{item.name}</p>
    </>
  )

  return (
    <div
      className="fixed inset-0 flex flex-col items-center justify-center"
      style={{
        zIndex: 9999,
        background: '#0a0a1a',
      }}
    >
      <div
        style={{
          position: 'absolute',
          width: '460px',
          height: '120px',
          borderRadius: '50%',
          background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.42), rgba(0,0,0,0) 72%)',
          filter: 'blur(4px)',
          transform: 'translateY(150px)',
          pointerEvents: 'none',
        }}
      />
      {/* Book container */}
      <div
        style={{
          width: '280px',
          height: '380px',
          position: 'relative',
          perspective: '1400px',
          transform: 'rotateZ(-1.4deg) rotateX(3deg)',
        }}
      >
        {/* Static page */}
        <div
          style={{
            ...styles.page,
          }}
        >
          {renderPage(author)}
        </div>

        {/* 3D flip: outgoing page 0 -> -180 */}
        {flipping && nextAuthor && (
          <>
            <div style={{ ...styles.pageSheet, animation: `flipOut ${FLIP_DURATION_MS}ms ease-in-out forwards, sheetShadeOut ${FLIP_DURATION_MS}ms ease-in-out forwards`, zIndex: 4 }}>
              <div style={{ ...styles.face, ...styles.faceFront }}>
                {renderPage(author)}
              </div>
              <div style={{ ...styles.face, ...styles.faceBack, ...styles.paperBack }} />
            </div>

            {/* 3D flip: incoming page -180 -> 0 */}
            <div style={{ ...styles.pageSheet, animation: `flipIn ${FLIP_DURATION_MS}ms ease-in-out forwards, sheetShadeIn ${FLIP_DURATION_MS}ms ease-in-out forwards`, zIndex: 3 }}>
              <div style={{ ...styles.face, ...styles.faceFrontIncoming }}>
                {renderPage(nextAuthor)}
              </div>
              <div style={{ ...styles.face, ...styles.faceBackIncoming, ...styles.paperBack }} />
            </div>
          </>
        )}

        <div
          style={{
            position: 'absolute',
            left: 0,
            top: '4px',
            bottom: '4px',
            width: '8px',
            background: 'linear-gradient(to right, #6b4c2a, #8b6914)',
            borderRadius: '2px 0 0 2px',
          }}
        />

        <style jsx>{`
          @keyframes flipOut {
            0% {
              transform: rotateY(0deg) rotateX(0deg) translateZ(0);
            }
            35% {
              transform: rotateY(-72deg) rotateX(4deg) translateZ(8px);
            }
            70% {
              transform: rotateY(-146deg) rotateX(1deg) translateZ(4px);
            }
            100% {
              transform: rotateY(-180deg) rotateX(0deg) translateZ(0);
            }
          }
          @keyframes flipIn {
            0% {
              transform: rotateY(-180deg) rotateX(0deg) translateZ(0);
            }
            30% {
              transform: rotateY(-130deg) rotateX(-3deg) translateZ(7px);
            }
            68% {
              transform: rotateY(-52deg) rotateX(-1deg) translateZ(4px);
            }
            100% {
              transform: rotateY(0deg) rotateX(0deg) translateZ(0);
            }
          }
          @keyframes sheetShadeOut {
            0% {
              filter: drop-shadow(-2px 2px 4px rgba(0, 0, 0, 0.2));
            }
            55% {
              filter: drop-shadow(-10px 8px 12px rgba(0, 0, 0, 0.38));
            }
            100% {
              filter: drop-shadow(-2px 2px 3px rgba(0, 0, 0, 0.12));
            }
          }
          @keyframes sheetShadeIn {
            0% {
              filter: drop-shadow(-8px 6px 10px rgba(0, 0, 0, 0.28));
            }
            100% {
              filter: drop-shadow(-2px 2px 3px rgba(0, 0, 0, 0.12));
            }
          }
        `}</style>
      </div>

      <p
        style={{
          marginTop: '32px',
          fontSize: '11px',
          letterSpacing: '4px',
          color: '#3a3a5a',
          fontFamily: 'serif',
        }}
      >
        正在生成你的文学星盘……
      </p>
    </div>
  )
}

const styles: Record<string, CSSProperties> = {
  page: {
    width: '100%',
    height: '100%',
    background: '#c8a97e',
    borderRadius: '4px 12px 12px 4px',
    boxShadow: '4px 4px 20px rgba(0,0,0,0.6), inset -3px 0 8px rgba(0,0,0,0.2)',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    backfaceVisibility: 'hidden',
    transformStyle: 'preserve-3d',
  },
  pageSheet: {
    position: 'absolute',
    inset: 0,
    transformOrigin: 'left center',
    transformStyle: 'preserve-3d',
    backfaceVisibility: 'hidden',
    willChange: 'transform, filter',
  },
  face: {
    position: 'absolute',
    inset: 0,
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '4px 12px 12px 4px',
    background: '#c8a97e',
    backfaceVisibility: 'hidden',
    transformStyle: 'preserve-3d',
    boxShadow: 'inset 0 0 0 1px rgba(101, 68, 35, 0.15), inset -6px 0 10px rgba(55, 30, 12, 0.12)',
  },
  faceFront: {
    transform: 'rotateY(0deg)',
  },
  faceBack: {
    transform: 'rotateY(180deg)',
  },
  faceFrontIncoming: {
    transform: 'rotateY(180deg)',
  },
  faceBackIncoming: {
    transform: 'rotateY(360deg)',
  },
  paperBack: {
    background: 'linear-gradient(180deg, #c9b08a 0%, #b79b74 45%, #b39974 100%)',
  },
  portraitWrap: {
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderRadius: '2px',
    border: '1px solid rgba(90, 60, 33, 0.3)',
    background: '#c8a97e',
  },
  portrait: {
    width: '100%',
    height: '100%',
    objectFit: 'contain',
    objectPosition: 'center center',
    display: 'block',
  },
  name: {
    marginTop: '12px',
    fontSize: '14px',
    letterSpacing: '4px',
    color: '#3a2a1a',
    fontFamily: 'serif',
    textAlign: 'center',
  },
}
