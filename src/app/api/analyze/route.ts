import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { buildPrompt } from '@/lib/prompt'
import authors from '@/data/authors.json'
import { Author, ZodiacResult, FullResult } from '@/types'

const client = new Anthropic()
const PLANETS = ['sun', 'moon', 'mercury', 'venus', 'rising'] as const
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000
const RATE_LIMIT_MAX_REQUESTS = 5
const ipRequestLog = new Map<string, number[]>()

function sanitizeInputText(input: string) {
  // Keep normal Unicode characters, remove unreadable/special control chars.
  return input
    .normalize('NFC')
    .replace(/\uFFFD/g, '')
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F]/g, '')
    .replace(/[\uD800-\uDFFF]/g, '')
    .replace(/[\uFDD0-\uFDEF\uFFFE\uFFFF]/g, '')
    .trim()
}

function randomInt(max: number) {
  return Math.floor(Math.random() * max)
}

function getClientIp(req: NextRequest) {
  const forwardedFor = req.headers.get('x-forwarded-for')
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim()
  }
  const realIp = req.headers.get('x-real-ip')
  if (realIp) {
    return realIp.trim()
  }
  return 'unknown'
}

function isRateLimited(ip: string) {
  const now = Date.now()
  const start = now - RATE_LIMIT_WINDOW_MS
  const recent = (ipRequestLog.get(ip) ?? []).filter(ts => ts > start)

  if (recent.length >= RATE_LIMIT_MAX_REQUESTS) {
    ipRequestLog.set(ip, recent)
    return true
  }

  recent.push(now)
  ipRequestLog.set(ip, recent)
  return false
}

function generateRandomDegrees() {
  const degrees: number[] = []
  const minGap = 18
  let attempts = 0

  while (degrees.length < PLANETS.length && attempts < 600) {
    const candidate = randomInt(360)
    const ok = degrees.every(existing => {
      const diff = Math.abs(existing - candidate)
      const delta = Math.min(diff, 360 - diff)
      return delta >= minGap
    })

    if (ok) {
      degrees.push(candidate)
    }
    attempts += 1
  }

  while (degrees.length < PLANETS.length) {
    degrees.push((randomInt(360) + degrees.length * 72) % 360)
  }

  return {
    sun: degrees[0],
    moon: degrees[1],
    mercury: degrees[2],
    venus: degrees[3],
    rising: degrees[4],
  }
}

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req)
    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: '请求过于频繁，请1小时后再试' },
        { status: 429 }
      )
    }

    const { text } = await req.json()
    if (typeof text !== 'string') {
      return NextResponse.json(
        { error: '请输入有效的文字内容' },
        { status: 400 }
      )
    }
    const sanitizedText = sanitizeInputText(text)

    if (!sanitizedText || sanitizedText.length < 100) {
      return NextResponse.json(
        { error: '请输入至少100字的原创文字' },
        { status: 400 }
      )
    }

    if (sanitizedText.length > 5000) {
      return NextResponse.json(
        { error: '文字请控制在5000字以内' },
        { status: 400 }
      )
    }

    const prompt = buildPrompt(sanitizedText)

    const message = await client.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    })

    const rawText = message.content
      .filter(block => block.type === 'text')
      .map(block => (block as { type: 'text'; text: string }).text)
      .join('')

    // Strip any accidental markdown fences
    const cleaned = rawText.replace(/```json|```/g, '').trim()
    const result: ZodiacResult = JSON.parse(cleaned)

    // Validate author ids
    const authorMap = new Map(authors.map(a => [a.id, a as Author]))
    const sunAuthor = authorMap.get(result.sun)
    const moonAuthor = authorMap.get(result.moon)
    const mercuryAuthor = authorMap.get(result.mercury)
    const venusAuthor = authorMap.get(result.venus)
    const risingAuthor = authorMap.get(result.rising)

    if (!sunAuthor || !moonAuthor || !mercuryAuthor || !venusAuthor || !risingAuthor) {
      throw new Error('Invalid author id returned by model')
    }

    const uniqueIds = new Set([result.sun, result.moon, result.mercury, result.venus, result.rising])
    if (uniqueIds.size !== 5) {
      throw new Error('Duplicate author id returned by model')
    }

    const fullResult: FullResult = {
      ...result,
      sunAuthor,
      moonAuthor,
      mercuryAuthor,
      venusAuthor,
      risingAuthor,
      degrees: generateRandomDegrees(),
    }

    return NextResponse.json(fullResult)
  } catch (error) {
    console.error('Analyze error:', error)
    return NextResponse.json(
      { error: '星盘生成失败，请稍后重试' },
      { status: 500 }
    )
  }
}
