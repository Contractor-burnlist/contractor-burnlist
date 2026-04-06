import { getReputation } from '@/lib/reputation'

const BADGE_STYLES: Record<string, { gradient: string; border: string; icon: string }> = {
  rookie: {
    gradient: 'linear-gradient(to bottom, #9ca3af, #6b7280)',
    border: '#6b7280',
    icon: '○',
  },
  contributor: {
    gradient: 'linear-gradient(to bottom, #d97706, #92400e)',
    border: '#b45309',
    icon: '◆',
  },
  trusted: {
    gradient: 'linear-gradient(to bottom, #94a3b8, #475569)',
    border: '#64748b',
    icon: '★',
  },
  veteran: {
    gradient: 'linear-gradient(to bottom, #eab308, #a16207)',
    border: '#ca8a04',
    icon: '★',
  },
  expert: {
    gradient: 'linear-gradient(to bottom, #60a5fa, #2563eb)',
    border: '#3b82f6',
    icon: '◈',
  },
  legend: {
    gradient: 'linear-gradient(to bottom, #ef4444, #991b1b)',
    border: '#eab308',
    icon: '🔥',
  },
}

const SIZES = {
  sm: { px: '8px 10px', py: '2px', text: '10px', icon: '9px', gap: '3px', h: '20px' },
  md: { px: '10px 12px', py: '3px', text: '11px', icon: '11px', gap: '4px', h: '24px' },
  lg: { px: '12px 16px', py: '5px', text: '13px', icon: '13px', gap: '5px', h: '30px' },
}

export default function ReputationBadge({ points, size = 'sm' }: { points: number; size?: 'sm' | 'md' | 'lg' }) {
  const rep = getReputation(points)
  const style = BADGE_STYLES[rep.slug] ?? BADGE_STYLES.rookie
  const sz = SIZES[size]
  const isLegend = rep.slug === 'legend'

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: sz.gap,
        height: sz.h,
        padding: `${sz.py} ${sz.px}`,
        background: style.gradient,
        border: `1px solid ${style.border}`,
        borderRadius: '9999px',
        fontSize: sz.text,
        fontWeight: 700,
        color: 'white',
        textShadow: '0 1px 2px rgba(0,0,0,0.3)',
        position: 'relative',
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        lineHeight: 1,
        boxShadow: isLegend
          ? `0 1px 3px rgba(0,0,0,0.2), 0 0 8px rgba(239,68,68,0.3)`
          : '0 1px 3px rgba(0,0,0,0.15)',
        transition: 'transform 0.15s, box-shadow 0.15s',
      }}
      className={`hover:scale-105 ${isLegend ? 'hover:shadow-[0_0_12px_rgba(239,68,68,0.5)]' : ''}`}
    >
      {/* Gloss overlay */}
      <span
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '50%',
          background: 'linear-gradient(to bottom, rgba(255,255,255,0.3), rgba(255,255,255,0.05))',
          borderRadius: '9999px 9999px 0 0',
          pointerEvents: 'none',
        }}
      />
      <span style={{ position: 'relative', fontSize: sz.icon, lineHeight: 1 }}>{style.icon}</span>
      <span style={{ position: 'relative' }}>{rep.rank}</span>
    </span>
  )
}
