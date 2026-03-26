'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

const riskColors: Record<string, string> = {
  high: 'text-[#DC2626] bg-[#DC2626]/10 border-[#DC2626]/30',
  medium: 'text-yellow-600 bg-yellow-50 border-yellow-300',
  low: 'text-green-600 bg-green-50 border-green-300',
  unknown: 'text-[#6b7280] bg-gray-50 border-gray-300',
}

type Customer = {
  id: string
  display_name: string
  city: string
  state: string
  flag_count: number
  risk_level: string
}

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Customer[]>([])
  const [searched, setSearched] = useState(false)
  const [loading, setLoading] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      setIsLoggedIn(!!user)
    })
  }, [])

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    const searchTerm = query.trim()
    if (!searchTerm) return

    setLoading(true)
    setSearched(true)

    const supabase = createClient()
    const { data, error } = await supabase
      .from('customers')
      .select('id, display_name, city, state, flag_count, risk_level')
      .or(`full_name.ilike.%${searchTerm}%,phone.ilike.%${searchTerm}%,address.ilike.%${searchTerm}%`)
      .order('flag_count', { ascending: false })

    if (error) {
      console.error('Search error:', error)
      setResults([])
    } else {
      setResults(data || [])
    }
    setLoading(false)
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-10">
        <h1 className="mb-2 text-3xl font-black text-[#111111]">Search the Registry</h1>
        <p className="text-[#6b7280]">Search by customer name, phone, address, or city</p>
      </div>

      <form onSubmit={handleSearch} className="mb-8 flex gap-3">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Name, phone number, or address..."
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
            {results.length} result{results.length !== 1 ? 's' : ''} for &quot;{query}&quot;
          </p>
          <div className="space-y-3">
            {isLoggedIn === false && (
              <div className="relative rounded-lg border border-[#e5e7eb] bg-white px-5 py-6">
                <div className="pointer-events-none select-none blur-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-[#111111]">M.T.</div>
                      <div className="mt-0.5 text-xs text-[#6b7280]">Austin, TX</div>
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
                    href="/auth/login"
                    className="rounded bg-[#DC2626] px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-700"
                  >
                    Get Access
                  </Link>
                </div>
              </div>
            )}

            {isLoggedIn && results.map((result) => (
              <div
                key={result.id}
                className="flex items-center justify-between rounded-lg border border-[#e5e7eb] bg-white px-5 py-4 transition-colors hover:border-[#d1d5db]"
              >
                <div>
                  <div className="font-semibold text-[#111111]">{result.display_name}</div>
                  <div className="mt-0.5 text-xs text-[#6b7280]">
                    {result.city}, {result.state}
                  </div>
                </div>
                <div className="flex items-center gap-4">
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
                  <Link
                    href={`/profile/${result.id}`}
                    className="rounded border border-[#DC2626] px-3 py-1 text-xs font-semibold text-[#DC2626] transition-colors hover:bg-[#DC2626] hover:text-white"
                  >
                    View Full Report
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No results */}
      {searched && !loading && results.length === 0 && (
        <div className="rounded-lg border border-[#e5e7eb] bg-[#f9fafb] px-8 py-12 text-center">
          <div className="mb-3 text-4xl">📭</div>
          <p className="font-semibold text-[#111111]">No records found for that search.</p>
          <p className="mt-2 text-sm text-[#6b7280]">This customer may not have any reports yet.</p>
        </div>
      )}

      {/* Initial state */}
      {!searched && (
        <div className="rounded-lg border border-[#e5e7eb] bg-[#f9fafb] px-8 py-12 text-center">
          <div className="mb-3 text-4xl">🔍</div>
          <p className="text-[#6b7280]">Enter a name, address, or phone number to search</p>
        </div>
      )}
    </div>
  )
}
