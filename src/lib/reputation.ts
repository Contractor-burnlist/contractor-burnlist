const RANKS = [
  { min: 0, rank: 'Rookie', color: 'text-[#9ca3af]', bg: 'bg-gray-100', border: 'border-gray-300' },
  { min: 10, rank: 'Contributor', color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-300' },
  { min: 30, rank: 'Trusted Voice', color: 'text-[#6b7280]', bg: 'bg-gray-100', border: 'border-gray-400' },
  { min: 60, rank: 'Veteran', color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-400' },
  { min: 100, rank: 'Expert', color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-300' },
  { min: 200, rank: 'Legend', color: 'text-[#DC2626]', bg: 'bg-[#DC2626]/10', border: 'border-[#DC2626]/30' },
]

export type RankInfo = {
  rank: string
  color: string
  bg: string
  border: string
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
    color: current.color,
    bg: current.bg,
    border: current.border,
    nextRank: next?.rank ?? null,
    pointsToNextRank: next ? next.min - points : null,
  }
}
