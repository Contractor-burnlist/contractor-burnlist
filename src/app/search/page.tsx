'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import PlatformDisclaimer from '@/components/PlatformDisclaimer'
import { riskScoreLabel } from '@/lib/risk-score'

type ResultType = 'customer' | 'worker'
type FilterType = 'all' | 'customers' | 'workers'

type SearchResult = {
  id: string
  type: ResultType
  display_name: string
  city: string
  state: string
  flag_count: number
  risk_score: number
  trade: string | null
  entry_count: number
  has_profile_complete?: boolean
}

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [searched, setSearched] = useState(false)
  const [loading, setLoading] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null)
  const [subTier, setSubTier] = useState<string | null>(null)
  const [filter, setFilter] = useState<FilterType>('all')

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setIsLoggedIn(!!session)
      if (session?.user) {
        const { data: prof } = await supabase.from('profiles').select('subscription_status, subscription_tier').eq('id', session.user.id).single()
        if (prof?.subscription_status === 'active') setSubTier(prof.subscription_tier)
      }
    })
  }, [])

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (!query.trim()) return
    setLoading(true)
    setSearched(true)

    if (isLoggedIn === false) {
      // Public search — use API route with service role
      const res = await fetch(`/api/public-search?q=${encodeURIComponent(query.trim())}`)
      const { data } = await res.json()
      setResults((data ?? []).map((r: any) => ({ ...r, has_profile_complete: false })))
      setLoading(false)
      return
    }

    // Authenticated search — query directly via Supabase client
    const supabase = createClient()

    let customersQuery = supabase
      .from('customers')
      .select('id, display_name, city, state, flag_count, risk_score, entries(submitter_profile_complete)')
      .order('flag_count', { ascending: false })
      .limit(50)

    let workersQuery = supabase
      .from('workers')
      .select('id, display_name, city, state, flag_count, risk_score, trade_specialty, worker_entries(submitter_profile_complete)')
      .order('flag_count', { ascending: false })
      .limit(50)

    const p = `%${query.trim()}%`
    customersQuery = customersQuery.or(
      `full_name.ilike.${p},phone.ilike.${p},address.ilike.${p},city.ilike.${p},display_name.ilike.${p}`
    )
    workersQuery = workersQuery.or(
      `full_name.ilike.${p},phone.ilike.${p},city.ilike.${p},display_name.ilike.${p},trade_specialty.ilike.${p}`
    )

    const [customersRes, workersRes] = await Promise.all([customersQuery, workersQuery])

    const customerResults: SearchResult[] = (customersRes.data || []).map((c: Record<string, unknown>) => {
      const entries = c.entries as Record<string, unknown>[] | undefined
      return {
        id: c.id as string,
        type: 'customer' as const,
        display_name: c.display_name as string,
        city: c.city as string,
        state: c.state as string,
        flag_count: c.flag_count as number,
        risk_score: Number(c.risk_score) || 0,
        trade: null,
        entry_count: Array.isArray(entries) ? entries.length : 0,
        has_profile_complete: Array.isArray(entries) && entries.some((e) => e.submitter_profile_complete === true),
      }
    })

    const workerResults: SearchResult[] = (workersRes.data || []).map((w: Record<string, unknown>) => {
      const wEntries = w.worker_entries as Record<string, unknown>[] | undefined
      return {
        id: w.id as string,
        type: 'worker' as const,
        display_name: w.display_name as string,
        city: w.city as string,
        state: w.state as string,
        flag_count: w.flag_count as number,
        risk_score: Number(w.risk_score) || 0,
        trade: (w.trade_specialty as string) || null,
        entry_count: Array.isArray(wEntries) ? wEntries.length : 0,
        has_profile_complete: Array.isArray(wEntries) && wEntries.some((e) => e.submitter_profile_complete === true),
      }
    })

    const merged = [...customerResults, ...workerResults].sort(
      (a, b) => b.flag_count - a.flag_count
    )

    setResults(merged)
    setLoading(false)
  }

  const filteredResults = results.filter((r) => {
    if (filter === 'all') return true
    if (filter === 'customers') return r.type === 'customer'
    return r.type === 'worker'
  })

  const customerCount = results.filter((r) => r.type === 'customer').length
  const workerCount = results.filter((r) => r.type === 'worker').length

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-10">
        <h1 className="mb-2 text-3xl font-black text-[#111111]">Search the Database</h1>
        <p className="text-[#6b7280]">Search customers and workers by name, trade, city, or phone</p>
      </div>

      <form onSubmit={handleSearch} className="mb-8 flex gap-3">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Name, trade, city, or phone number..."
          className="flex-1 rounded border border-[#e5e7eb] bg-white px-4 py-3 text-sm text-[#111111] placeholder-[#9ca3af] outline-none focus:border-[#DC2626]"
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded bg-[#DC2626] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:opacity-50"
        >
          {loading ? 'Searching...' : 'Search'}
        </button>
      </form>

      <div className="mb-4">
        <PlatformDisclaimer variant="compact" />
      </div>
      <p className="mb-6 text-[10px] italic text-[#9ca3af]">All feedback reflects individual contractor opinions and personal experiences, not verified facts. This platform is not intended to be used for employment, insurance, or housing decisions.</p>

      {/* Filter toggles */}
      {searched && !loading && results.length > 0 && (
        <div className="mb-6 flex gap-2">
          {([
            ['all', `All (${results.length})`],
            ['customers', `Customers (${customerCount})`],
            ['workers', `Workers (${workerCount})`],
          ] as [FilterType, string][]).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                filter === key
                  ? 'bg-[#111111] text-white'
                  : 'border border-[#e5e7eb] bg-white text-[#6b7280] hover:border-[#d1d5db] hover:text-[#111111]'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      )}

      {/* Loading spinner */}
      {loading && (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#e5e7eb] border-t-[#DC2626]" />
        </div>
      )}

      {/* Results */}
      {searched && !loading && results.length > 0 && (
        <div>
          <p className="mb-4 text-sm text-[#6b7280]">
            {filteredResults.length} result{filteredResults.length !== 1 ? 's' : ''}{query.trim() ? <> for &quot;{query}&quot;</> : ''}
          </p>
          <div className="space-y-3">
            {/* PUBLIC / NOT LOGGED IN — show real results with blurred detail overlay */}
            {isLoggedIn === false && filteredResults.map((result) => (
              <div key={`${result.type}-${result.id}`} className="relative overflow-hidden rounded-lg border border-[#e5e7eb] bg-white px-5 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${result.type === 'customer' ? 'bg-[#DC2626]/10 text-[#DC2626]' : 'bg-orange-100 text-orange-600'}`}>
                      {result.type === 'customer' ? 'Customer' : 'Worker'}
                    </span>
                    <div>
                      <div className="font-semibold text-[#111111]">{result.display_name}</div>
                      <div className="mt-0.5 flex items-center gap-2 text-xs text-[#6b7280]">
                        <span>{result.city}, {result.state}</span>
                        {result.trade && <><span className="text-[#d1d5db]">·</span><span>{result.trade}</span></>}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5">
                      <span className="flex h-6 min-w-[24px] items-center justify-center rounded-full bg-[#DC2626] px-1.5 text-xs font-bold text-white">{result.flag_count}</span>
                      <span className="text-xs text-[#6b7280]">flags</span>
                    </div>
                    {(() => { const r = riskScoreLabel(result.risk_score); return (
                      <span className={`rounded-full border px-2.5 py-1 text-xs font-bold ${r.color} ${r.bg}`}>{result.risk_score.toFixed(1)}</span>
                    )})()}
                  </div>
                </div>
                {/* Blurred detail preview */}
                <div className="relative mt-3">
                  <div className="pointer-events-none select-none blur-[6px]">
                    <div className="h-3 w-3/4 rounded bg-[#e5e7eb]" />
                    <div className="mt-1.5 h-3 w-1/2 rounded bg-[#e5e7eb]" />
                  </div>
                  <div className="absolute inset-0 flex items-center">
                    <p className="text-xs text-[#9ca3af]">Sign up free to view feedback details</p>
                  </div>
                </div>
              </div>
            ))}

            {/* Sign up CTA after public results */}
            {isLoggedIn === false && filteredResults.length > 0 && (
              <div className="rounded-lg border-2 border-dashed border-[#DC2626]/30 bg-[#DC2626]/5 p-6 text-center">
                <p className="mb-1 text-sm font-bold text-[#111111]">Sign up free to search the full database</p>
                <p className="mb-4 text-xs text-[#6b7280]">Create your free account to view feedback details, submit your own experiences, and join the community.</p>
                <Link href="/auth/login?next=/search" className="inline-block rounded bg-[#DC2626] px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-700">
                  Sign Up Free
                </Link>
              </div>
            )}

            {/* AUTHENTICATED — full or tier-gated results */}
            {isLoggedIn && filteredResults.map((result) => {
              const isWorkerLocked = result.type === 'worker' && subTier !== 'fortress'
              if (isWorkerLocked) {
                return (
                  <div key={`${result.type}-${result.id}`} className="relative rounded-lg border border-[#e5e7eb] bg-white px-5 py-4">
                    <div className="pointer-events-none select-none blur-sm">
                      <div className="flex items-center gap-3">
                        <span className="rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-semibold text-orange-600">Worker</span>
                        <div>
                          <div className="font-semibold text-[#111111]">{result.display_name}</div>
                          <div className="mt-0.5 text-xs text-[#6b7280]">{result.city}, {result.state}</div>
                        </div>
                      </div>
                    </div>
                    <div className="absolute inset-0 flex flex-col items-center justify-center rounded-lg bg-white/80">
                      <p className="mb-2 text-sm font-semibold text-[#111111]">Worker database requires Fortress</p>
                      <Link href="/pricing" className="rounded bg-[#DC2626] px-4 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-red-700">Upgrade to Fortress</Link>
                    </div>
                  </div>
                )
              }
              return (
                <Link
                  key={`${result.type}-${result.id}`}
                  href={`/profile/${result.id}?type=${result.type}`}
                  className="flex items-center justify-between rounded-lg border border-[#e5e7eb] bg-white px-5 py-4 transition-colors hover:border-[#d1d5db]"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        result.type === 'customer'
                          ? 'bg-[#DC2626]/10 text-[#DC2626]'
                          : 'bg-orange-100 text-orange-600'
                      }`}
                    >
                      {result.type === 'customer' ? 'Customer' : 'Worker'}
                    </span>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-[#111111]">{result.display_name}</span>
                        {result.has_profile_complete && (
                          <span title="This contractor has completed their business profile.">
                            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="text-blue-500"><path d="M3 8l3 3 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                          </span>
                        )}
                      </div>
                      <div className="mt-0.5 flex items-center gap-2 text-xs text-[#6b7280]">
                        <span>{result.city}, {result.state}</span>
                        {result.trade && (
                          <>
                            <span className="text-[#d1d5db]">·</span>
                            <span>{result.trade}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-xs text-[#6b7280]">Feedback</div>
                      <div className="text-sm font-bold text-[#111111]">{result.entry_count}</div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="flex h-6 min-w-[24px] items-center justify-center rounded-full bg-[#DC2626] px-1.5 text-xs font-bold text-white">
                        {result.flag_count}
                      </span>
                      <span className="text-xs text-[#6b7280]">flags</span>
                    </div>
                    {(() => { const r = riskScoreLabel(result.risk_score); return (
                      <span className={`rounded-full border px-2.5 py-1 text-xs font-bold ${r.color} ${r.bg}`}>
                        {result.risk_score.toFixed(1)}
                      </span>
                    )})()}
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      )}

      {/* No results */}
      {searched && !loading && results.length === 0 && (
        <div className="rounded-lg border border-[#e5e7eb] bg-[#f9fafb] px-8 py-12 text-center">
          <div className="mb-3 text-4xl">📭</div>
          <p className="font-semibold text-[#111111]">No results found for &quot;{query}&quot;.</p>
          <p className="mt-2 text-sm text-[#6b7280]">Try a different search term.</p>
        </div>
      )}

      {/* Initial state */}
      {!searched && (
        <div className="rounded-lg border border-[#e5e7eb] bg-[#f9fafb] px-8 py-12 text-center">
          <div className="mb-3 text-4xl">🔍</div>
          <p className="text-[#6b7280]">Enter a name, trade, city, or phone number to search</p>
        </div>
      )}
    </div>
  )
}
