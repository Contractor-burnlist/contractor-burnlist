import Link from 'next/link'

// Placeholder data — will be replaced with Supabase fetch
const mockProfile = {
  display_name: 'J. Smith',
  city: 'Austin',
  state: 'TX',
  flag_count: 7,
  risk_level: 'high',
  entries: [
    {
      id: '1',
      description: 'Refused to pay final invoice after job completion. Claimed work was substandard with no basis.',
      amount_owed: 4200,
      incident_date: '2024-11-12',
      category_tags: ['Non-payment', 'Dispute'],
      is_verified_submission: true,
    },
    {
      id: '2',
      description: 'Check bounced. Never responded to follow-up calls.',
      amount_owed: 1800,
      incident_date: '2024-08-03',
      category_tags: ['Bounced check'],
      is_verified_submission: true,
    },
  ],
}

const riskColors: Record<string, string> = {
  high: 'text-[#DC2626] bg-[#DC2626]/10 border-[#DC2626]/30',
  medium: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30',
  low: 'text-green-400 bg-green-400/10 border-green-400/30',
  unknown: 'text-[#a0a0a0] bg-[#a0a0a0]/10 border-[#a0a0a0]/30',
}

export default function ProfilePage() {
  const profile = mockProfile

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <Link href="/search" className="mb-8 inline-flex items-center gap-2 text-sm text-[#a0a0a0] hover:text-white">
        ← Back to Search
      </Link>

      {/* Header */}
      <div className="mb-8 rounded-lg border border-[#2a2a2a] bg-[#111111] p-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-black text-white">{profile.display_name}</h1>
            <p className="mt-1 text-sm text-[#a0a0a0]">
              {profile.city}, {profile.state}
            </p>
          </div>
          <span
            className={`rounded-full border px-3 py-1 text-sm font-semibold capitalize ${riskColors[profile.risk_level]}`}
          >
            {profile.risk_level} risk
          </span>
        </div>
        <div className="mt-4 flex gap-6">
          <div>
            <div className="text-xs text-[#a0a0a0]">Total Flags</div>
            <div className="text-2xl font-black text-white">{profile.flag_count}</div>
          </div>
          <div>
            <div className="text-xs text-[#a0a0a0]">Total Owed</div>
            <div className="text-2xl font-black text-white">
              ${profile.entries.reduce((sum, e) => sum + e.amount_owed, 0).toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* Entries */}
      <h2 className="mb-4 text-lg font-bold text-white">Reported Incidents</h2>
      <div className="space-y-4">
        {profile.entries.map((entry) => (
          <div key={entry.id} className="rounded-lg border border-[#2a2a2a] bg-[#111111] p-5">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex gap-2">
                {entry.category_tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded border border-[#2a2a2a] px-2 py-0.5 text-xs text-[#a0a0a0]"
                  >
                    {tag}
                  </span>
                ))}
                {entry.is_verified_submission && (
                  <span className="rounded border border-green-400/30 bg-green-400/10 px-2 py-0.5 text-xs text-green-400">
                    Verified
                  </span>
                )}
              </div>
              <span className="text-xs text-[#555]">{entry.incident_date}</span>
            </div>
            <p className="mb-3 text-sm leading-relaxed text-[#a0a0a0]">{entry.description}</p>
            {entry.amount_owed > 0 && (
              <div className="text-sm font-semibold text-[#DC2626]">
                Amount owed: ${entry.amount_owed.toLocaleString()}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-8 text-center">
        <Link
          href="/submit"
          className="inline-block rounded bg-[#DC2626] px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-700"
        >
          Submit an Entry for This Customer
        </Link>
      </div>
    </div>
  )
}
