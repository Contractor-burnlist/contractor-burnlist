'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import PlatformDisclaimer from '@/components/PlatformDisclaimer'

const riskColors: Record<string, string> = {
  high: 'text-[#DC2626] bg-[#DC2626]/10 border-[#DC2626]/30',
  medium: 'text-yellow-600 bg-yellow-50 border-yellow-300',
  low: 'text-green-600 bg-green-50 border-green-300',
  unknown: 'text-[#6b7280] bg-gray-50 border-gray-300',
}

type ResultType = 'customer' | 'worker'
type FilterType = 'all' | 'customers' | 'workers'

type SearchResult = {
  id: string
  type: ResultType
  display_name: string
  city: string
  state: string
  flag_count: number
  risk_level: string
  trade: string | null
  entry_count: number
  has_verified_report: boolean
}

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [searched, setSearched] = useState(false)
  const [loading, setLoading] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null)
  const [filter, setFilter] = useState<FilterType>('all')

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsLoggedIn(!!session)
    })
  }, [])

  async function runSearch(searchTerm: string, existingClient?: ReturnType<typeof createClient>) {
    setLoading(true)
    setSearched(true)

    const supabase = existingClient ?? createClient()

    let customersQuery = supabase
      .from('customers')
      .select('id, display_name, city, state, flag_count, risk_level, entries(count, submitter_verified)')
      .order('flag_count', { ascending: false })
      .limit(50)

    let workersQuery = supabase
      .from('workers')
      .select('id, display_name, city, state, flag_count, risk_level, trade_specialty, worker_entries(count, submitter_verified)')
      .order('flag_count', { ascending: false })
      .limit(50)

    if (searchTerm) {
      const p = `%${searchTerm}%`
      customersQuery = customersQuery.or(
        `full_name.ilike.${p},phone.ilike.${p},address.ilike.${p},city.ilike.${p},display_name.ilike.${p}`
      )
      workersQuery = workersQuery.or(
        `full_name.ilike.${p},phone.ilike.${p},city.ilike.${p},display_name.ilike.${p},trade_specialty.ilike.${p}`
      )
    }

    const [customersRes, workersRes] = await Promise.all([customersQuery, workersQuery])

    console.log('[search] customers:', customersRes.data?.length ?? 0, 'error:', customersRes.error)
    console.log('[search] workers:', workersRes.data?.length ?? 0, 'error:', workersRes.error)

    const customerResults: SearchResult[] = (customersRes.data || []).map((c: Record<string, unknown>) => {
      const entries = c.entries as Record<string, unknown>[] | undefined
      return {
        id: c.id as string,
        type: 'customer' as const,
        display_name: c.display_name as string,
        city: c.city as string,
        state: c.state as string,
        flag_count: c.flag_count as number,
        risk_level: c.risk_level as string,
        trade: null,
        entry_count: Array.isArray(entries) ? (entries[0]?.count as number ?? 0) : 0,
        has_verified_report: Array.isArray(entries) && entries.some((e) => e.submitter_verified === true),
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
        risk_level: w.risk_level as string,
        trade: (w.trade_specialty as string) || null,
        entry_count: Array.isArray(wEntries) ? (wEntries[0]?.count as number ?? 0) : 0,
        has_verified_report: Array.isArray(wEntries) && wEntries.some((e) => e.submitter_verified === true),
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

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (!query.trim()) return
    runSearch(query.trim())
  }

  const customerCount = results.filter((r) => r.type === 'customer').length
  const workerCount = results.filter((r) => r.type === 'worker').length

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-10">
        <h1 className="mb-2 text-3xl font-black text-[#111111]">Search the Registry</h1>
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

      <div className="mb-6">
        <PlatformDisclaimer variant="compact" />
      </div>

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
            {/* Blurred placeholder for non-authenticated users */}
            {isLoggedIn === false && (
              <div className="relative rounded-lg border border-[#e5e7eb] bg-white px-5 py-6">
                <div className="pointer-events-none select-none blur-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="rounded-full bg-[#DC2626]/10 px-2.5 py-0.5 text-xs font-semibold text-[#DC2626]">Customer</span>
                      <div>
                        <div className="font-semibold text-[#111111]">M.T.</div>
                        <div className="mt-0.5 text-xs text-[#6b7280]">Austin, TX</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-xs text-[#6b7280]">Flags</div>
                        <div className="font-bold text-[#111111]">5</div>
                      </div>
                      <span className="rounded-full border border-[#DC2626]/30 bg-[#DC2626]/10 px-3 py-1 text-xs font-semibold text-[#DC2626]">high</span>
                    </div>
                  </div>
                </div>
                <div className="absolute inset-0 flex flex-col items-center justify-center rounded-lg bg-white/80">
                  <p className="mb-3 text-sm font-semibold text-[#111111]">Subscribe to view full details</p>
                  <Link
                    href="/pricing"
                    className="rounded bg-[#DC2626] px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-700"
                  >
                    Get Access
                  </Link>
                </div>
              </div>
            )}

            {isLoggedIn && filteredResults.map((result) => (
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
                      {result.has_verified_report && (
                        <span title="Reported by a verified contractor">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-green-600">
                            <path d="M12 2L3 7v5c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-9-5z" fill="currentColor" opacity="0.15"/>
                            <path d="M12 2L3 7v5c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-9-5z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
                            <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
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
                    <div className="text-xs text-[#6b7280]">Reports</div>
                    <div className="text-sm font-bold text-[#111111]">{result.entry_count}</div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="flex h-6 min-w-[24px] items-center justify-center rounded-full bg-[#DC2626] px-1.5 text-xs font-bold text-white">
                      {result.flag_count}
                    </span>
                    <span className="text-xs text-[#6b7280]">flags</span>
                  </div>
                  <span
                    className={`rounded-full border px-3 py-1 text-xs font-semibold capitalize ${riskColors[result.risk_level] || riskColors.unknown}`}
                  >
                    {result.risk_level}
                  </span>
                </div>
              </Link>
            ))}
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
