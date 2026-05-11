export interface Author {
  id: string
  name: string
  nameEn: string
  region: 'chinese' | 'japanese' | 'european' | 'latam' | 'american'
  years: string
  oneLiner: string
  color: string
  tags: string[]
}

export interface ZodiacResult {
  sun: string
  moon: string
  mercury: string
  venus: string
  rising: string
  constellationName: string
  description: string
}

export interface PlanetDegrees {
  sun: number
  moon: number
  mercury: number
  venus: number
  rising: number
}

export interface FullResult {
  sun: string
  moon: string
  mercury: string
  venus: string
  rising: string
  constellationName: string
  description: string
  sunAuthor: Author
  moonAuthor: Author
  mercuryAuthor: Author
  venusAuthor: Author
  risingAuthor: Author
  degrees: PlanetDegrees
}

export type RegionLabel = {
  chinese: string
  japanese: string
  european: string
  latam: string
  american: string
}

export const REGION_LABELS: RegionLabel = {
  chinese: '中文',
  japanese: '日文',
  european: '欧洲',
  latam: '拉美',
  american: '北美',
}
