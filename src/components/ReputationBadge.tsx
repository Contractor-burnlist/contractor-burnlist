import { getReputation } from '@/lib/reputation'

export default function ReputationBadge({ points, size = 'sm' }: { points: number; size?: 'sm' | 'lg' }) {
  const rep = getReputation(points)

  if (size === 'lg') {
    return (
      <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm font-semibold ${rep.color} ${rep.bg} ${rep.border}`}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className={rep.color}>
          <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" fill="currentColor" opacity="0.2" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
        </svg>
        {rep.rank}
      </span>
    )
  }

  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-semibold ${rep.color} ${rep.bg} ${rep.border}`}>
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" className={rep.color}>
        <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" fill="currentColor" opacity="0.2" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
      </svg>
      {rep.rank}
    </span>
  )
}
