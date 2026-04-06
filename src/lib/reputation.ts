const RANKS = [
  { min: 0, rank: 'Rookie', slug: 'rookie' },
  { min: 10, rank: 'Contributor', slug: 'contributor' },
  { min: 30, rank: 'Trusted Voice', slug: 'trusted' },
  { min: 60, rank: 'Veteran', slug: 'veteran' },
  { min: 100, rank: 'Expert', slug: 'expert' },
  { min: 200, rank: 'Legend', slug: 'legend' },
]

export type RankInfo = {
  rank: string
  slug: string
  nextRank: string | null
  pointsToNextRank: number | null
}

export function getReputation(points: number): RankInfo {
  let current = RANKS[0]
  for (const tier of RANKS) {
    if (points >= tier.min) current = tier
  }

  const currentIdx = RANKS.indexOf(current)
  const next = currentIdx < RANKS.length - 1 ? RANKS[currentIdx + 1] : null

  return {
    rank: current.rank,
    slug: current.slug,
    nextRank: next?.rank ?? null,
    pointsToNextRank: next ? next.min - points : null,
  }
}
