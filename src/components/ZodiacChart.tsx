'use client'

import { useEffect, useMemo, useState } from 'react'
import { Author, PlanetDegrees } from '@/types'

interface Props {
  sunAuthor: Author
  moonAuthor: Author
  mercuryAuthor?: Author
  venusAuthor?: Author
  risingAuthor: Author
  degrees?: PlanetDegrees
  constellationName: string
}

const LABELS = {
  sun:    { zh: '太阳位', sub: 'SUN'    },
  moon:   { zh: '月亮位', sub: 'MOON'   },
  mercury: { zh: '水星位', sub: 'MERCURY' },
  venus: { zh: '金星位', sub: 'VENUS' },
  rising: { zh: '上升位', sub: 'RISING' },
}

const CENTER = 200
const OUTER_RADIUS = 154
const INNER_RADIUS = 98
const STAR_RADIUS = 126

function toPoint(degree: number, radius: number) {
  const rad = ((degree - 90) * Math.PI) / 180
  return {
    x: CENTER + Math.cos(rad) * radius,
    y: CENTER + Math.sin(rad) * radius,
  }
}

function hashToUnit(text: string) {
  let hash = 2166136261
  for (let i = 0; i < text.length; i += 1) {
    hash ^= text.charCodeAt(i)
    hash = Math.imul(hash, 16777619)
  }
  return (hash >>> 0) / 4294967295
}

const STAR_KEYS = ['sun', 'moon', 'mercury', 'venus', 'rising'] as const

type StarKey = (typeof STAR_KEYS)[number]

function buildStarDegrees(seed: string) {
  const start = Math.floor(hashToUnit(seed) * 360)
  const sector = 360 / STAR_KEYS.length
  return STAR_KEYS.reduce((acc, key, idx) => {
    // Keep stars roughly even around the ring, but allow seeded jitter
    // so different charts can have different aspect lines.
    const jitter = (hashToUnit(`${seed}:${key}`) - 0.5) * 36
    acc[key] = (start + idx * sector + jitter + 360) % 360
    return acc
  }, {} as Record<StarKey, number>)
}

export default function ZodiacChart({
  sunAuthor,
  moonAuthor,
  mercuryAuthor,
  venusAuthor,
  risingAuthor,
  degrees,
  constellationName,
}: Props) {
  const [animated, setAnimated] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 100)
    return () => clearTimeout(t)
  }, [])

  const resolvedMercuryAuthor = mercuryAuthor ?? sunAuthor
  const resolvedVenusAuthor = venusAuthor ?? moonAuthor

  const authors = {
    sun: sunAuthor,
    moon: moonAuthor,
    mercury: resolvedMercuryAuthor,
    venus: resolvedVenusAuthor,
    rising: risingAuthor,
  }

  const fallbackDegrees = useMemo(
    () =>
      buildStarDegrees(
        `${constellationName}:${sunAuthor.id}:${moonAuthor.id}:${resolvedMercuryAuthor.id}:${resolvedVenusAuthor.id}:${risingAuthor.id}`
      ),
    [
      constellationName,
      sunAuthor.id,
      moonAuthor.id,
      resolvedMercuryAuthor.id,
      resolvedVenusAuthor.id,
      risingAuthor.id,
    ]
  )

  const starDegrees = degrees ?? fallbackDegrees

  const starPoints = useMemo(
    () =>
      STAR_KEYS.map(key => {
        const degree = starDegrees[key]
        const point = toPoint(degree, STAR_RADIUS)
        const labelPoint = toPoint(degree, OUTER_RADIUS + 26)
        const align = Math.cos(((degree - 90) * Math.PI) / 180)
        const anchor = align > 0.25 ? 'start' : align < -0.25 ? 'end' : 'middle'
        const degreeLabel = Math.round(degree) % 360

        return { key, degree, degreeLabel, point, labelPoint, anchor }
      }),
    [starDegrees]
  )

  const aspectLines = useMemo(() => {
    const lines: Array<{
      key: string
      x1: number
      y1: number
      x2: number
      y2: number
      dashed: boolean
    }> = []

    for (let i = 0; i < starPoints.length; i += 1) {
      for (let j = i + 1; j < starPoints.length; j += 1) {
        const a = starPoints[i]
        const b = starPoints[j]
        const rawDiff = Math.abs(a.degree - b.degree)
        const degreeDiff = Math.min(rawDiff, 360 - rawDiff)

        if (degreeDiff <= 60) {
          lines.push({
            key: `${a.key}-${b.key}-solid`,
            x1: a.point.x,
            y1: a.point.y,
            x2: b.point.x,
            y2: b.point.y,
            dashed: false,
          })
        } else if (degreeDiff >= 120 && degreeDiff <= 180) {
          lines.push({
            key: `${a.key}-${b.key}-dashed`,
            x1: a.point.x,
            y1: a.point.y,
            x2: b.point.x,
            y2: b.point.y,
            dashed: true,
          })
        }
      }
    }

    return lines
  }, [starPoints])

  return (
    <div className="flex flex-col items-center">
      {/* Constellation name */}
      <p className="text-xs tracking-[0.4em] text-amber-700 mb-2">YOUR CONSTELLATION</p>
      <h2 className="text-3xl tracking-widest text-amber-100 mb-8">{constellationName}</h2>

      {/* SVG */}
      <svg
        viewBox="-24 -24 448 448"
        className="w-full max-w-[18rem] sm:max-w-sm"
        style={{ filter: 'drop-shadow(0 0 20px rgba(201,168,76,0.08))' }}
      >
        {/* Dark plate */}
        <circle cx={CENTER} cy={CENTER} r="172" fill="#090d1a" />
        <circle cx={CENTER} cy={CENTER} r={OUTER_RADIUS + 10} fill="none" stroke="#374164" strokeWidth="1.2" />
        <circle cx={CENTER} cy={CENTER} r={OUTER_RADIUS} fill="none" stroke="#2d375a" strokeWidth="1.2" />
        <circle cx={CENTER} cy={CENTER} r={INNER_RADIUS} fill="none" stroke="#2d375a" strokeWidth="1" />

        {/* 12 houses separator lines */}
        {Array.from({ length: 12 }, (_, i) => {
          const degree = i * 30
          const start = toPoint(degree, INNER_RADIUS)
          const end = toPoint(degree, OUTER_RADIUS)

          return (
            <line
              key={i}
              x1={start.x}
              y1={start.y}
              x2={end.x}
              y2={end.y}
              stroke="#303a60"
              strokeWidth="0.95"
            />
          )
        })}

        {/* Sub ticks across houses */}
        {Array.from({ length: 12 * 6 }, (_, i) => {
          const degree = i * 5
          const major = degree % 30 === 0
          const middle = degree % 10 === 0
          const outerTickStart = OUTER_RADIUS - (major ? 9 : middle ? 6 : 4)
          const innerTickStart = INNER_RADIUS + (major ? 9 : middle ? 6 : 4)
          const outerStart = toPoint(degree, outerTickStart)
          const outerEnd = toPoint(degree, OUTER_RADIUS)
          const innerStart = toPoint(degree, INNER_RADIUS)
          const innerEnd = toPoint(degree, innerTickStart)

          return (
            <g key={degree}>
              <line
                x1={outerStart.x}
                y1={outerStart.y}
                x2={outerEnd.x}
                y2={outerEnd.y}
                stroke={major ? '#4b5683' : '#313b62'}
                strokeWidth={major ? '0.95' : '0.75'}
              />
              <line
                x1={innerStart.x}
                y1={innerStart.y}
                x2={innerEnd.x}
                y2={innerEnd.y}
                stroke={major ? '#444f7c' : '#2a3459'}
                strokeWidth={major ? '0.85' : '0.7'}
              />
            </g>
          )
        })}

        {/* Center moon */}
        <circle cx={CENTER} cy={CENTER} r="46" fill="#0a1536" stroke="#4a5f94" strokeWidth="1.3" />
        <circle cx={CENTER} cy={CENTER} r="39" fill="none" stroke="#2d406f" strokeWidth="1" />
        <circle cx={CENTER} cy={CENTER} r="31" fill="#09112b" />
        <circle cx={CENTER - 7} cy={CENTER - 1} r="13.4" fill="#f6f8ff" />
        <circle cx={CENTER + 2.6} cy={CENTER - 1} r="12.9" fill="#09112b" />
        <circle cx={CENTER + 9} cy={CENTER - 14} r="1.6" fill="#f6f8ff" opacity="0.95" />
        <circle cx={CENTER + 14} cy={CENTER - 8} r="1.1" fill="#dce6ff" opacity="0.9" />
        <circle cx={CENTER + 12} cy={CENTER + 9} r="1.3" fill="#dce6ff" opacity="0.82" />
        <line x1={CENTER + 16} y1={CENTER - 16} x2={CENTER + 16} y2={CENTER - 10} stroke="#f6f8ff" strokeWidth="0.7" opacity="0.85" />
        <line x1={CENTER + 13} y1={CENTER - 13} x2={CENTER + 19} y2={CENTER - 13} stroke="#f6f8ff" strokeWidth="0.7" opacity="0.85" />
        <line x1={CENTER - 15} y1={CENTER + 15} x2={CENTER - 15} y2={CENTER + 10} stroke="#d7e2ff" strokeWidth="0.55" opacity="0.68" />
        <line x1={CENTER - 17.5} y1={CENTER + 12.5} x2={CENTER - 12.5} y2={CENTER + 12.5} stroke="#d7e2ff" strokeWidth="0.55" opacity="0.68" />

        {/* Connection lines */}
        {animated && (
          <>
            {aspectLines.map(line => (
              <line
                key={line.key}
                x1={line.x1}
                y1={line.y1}
                x2={line.x2}
                y2={line.y2}
                stroke="#495889"
                strokeWidth={line.dashed ? '0.82' : '0.95'}
                opacity={line.dashed ? '0.6' : '0.75'}
                strokeDasharray={line.dashed ? '2.5 3.5' : undefined}
              />
            ))}
          </>
        )}

        {/* Stars */}
        {starPoints.map(star => {
          const author = authors[star.key]
          const label = LABELS[star.key]
          const tx = star.labelPoint.x
          const ty = star.labelPoint.y

          return (
            <g key={star.key}>
              {/* Glow */}
              <circle
                cx={star.point.x} cy={star.point.y} r="20"
                fill={author.color}
                opacity={animated ? 0.12 : 0}
                style={{ transition: 'opacity 1.2s ease' }}
              />
              {/* Star dot */}
              <circle
                cx={star.point.x} cy={star.point.y} r="4.7"
                fill={author.color}
                opacity={animated ? 1 : 0}
                style={{ transition: 'opacity 0.8s ease' }}
              />
              <circle
                cx={star.point.x}
                cy={star.point.y}
                r="8.8"
                fill="none"
                stroke={author.color}
                strokeWidth="0.8"
                opacity={animated ? 0.7 : 0}
                style={{ transition: 'opacity 1.1s ease 0.2s' }}
              />
              {/* Small sparkle lines */}
              {[0, 45, 90, 135].map(deg => (
                <line
                  key={deg}
                  x1={star.point.x + Math.cos((deg * Math.PI) / 180) * 7}
                  y1={star.point.y + Math.sin((deg * Math.PI) / 180) * 7}
                  x2={star.point.x + Math.cos((deg * Math.PI) / 180) * 11}
                  y2={star.point.y + Math.sin((deg * Math.PI) / 180) * 11}
                  stroke={author.color}
                  strokeWidth="0.8"
                  opacity={animated ? 0.6 : 0}
                  style={{ transition: 'opacity 1s ease 0.4s' }}
                />
              ))}

              {/* Position label */}
              <foreignObject
                x={star.anchor === 'start' ? tx + 2 : star.anchor === 'end' ? tx - 96 : tx - 47}
                y={ty - 14}
                width="96"
                height="54"
                style={{ overflow: 'visible', opacity: animated ? 1 : 0, transition: 'opacity 1s ease 0.3s' }}
              >
                <div
                  style={{
                    color: '#6B6B8A',
                    fontSize: '8px',
                    letterSpacing: '1px',
                    lineHeight: 1.2,
                    textAlign: star.anchor === 'start' ? 'left' : star.anchor === 'end' ? 'right' : 'center',
                    whiteSpace: 'normal',
                    wordBreak: 'break-word',
                  }}
                >
                  <div>{label.sub} · {star.degreeLabel}°</div>
                  <div style={{ color: author.color, fontFamily: 'serif', fontSize: '12px', marginTop: '2px' }}>{author.name}</div>
                  <div style={{ color: '#4A4A6A', fontSize: '7px' }}>{author.nameEn.toUpperCase()}</div>
                  <div style={{ color: '#616f9b', fontSize: '7px' }}>{label.zh}</div>
                </div>
              </foreignObject>
            </g>
          )
        })}
      </svg>
    </div>
  )
}
