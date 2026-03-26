'use client'

import { useState } from 'react'
import Link from 'next/link'

const riskColors: Record<string, string> = {
  high: 'text-[#DC2626] bg-[#DC2626]/10 border-[#DC2626]/30',
  medium: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30',
  low: 'text-green-400 bg-green-400/10 border-green-400/30',
  unknown: 'text-[#a0a0a0] bg-[#a0a0a0]/10 border-[#a0a0a0]/30',
}

// Placeholder results for UI demo
const mockResults = [
  {
    id: '1',
    display_name: 'J. Smith',
    city: 'Austin',
    state: 'TX',
    flag_count: 7,
    risk_level: 'high',
  },
  {
    id: '2',
    display_name: 'M. Johnson',
    city: 'Denver',
    state: 'CO',
    flag_count: 3,
    risk_level: 'medium',
  },
  {
    id: '3',
    display_name: 'R. Davis',
    city: 'Phoenix',
    state: 'AZ',
    flag_count: 1,
    risk_level: 'low',
  },
]

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const [searched, setSearched] = useState(false)

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (query.trim()) setSearched(true)
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-10">
        <h1 className="mb-2 text-3xl font-black text-white">Search the Registry</h1>
        <p className="text-[#a0a0a0]">Search by customer name, phone, address, or city</p>
      </div>

      <form onSubmit={handleSearch} className="mb-8 flex gap-3">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Name, phone number, or address..."
          className="flex-1 rounded border border-[#2a2a2a] bg-[#111111] px-4 py-3 text-sm text-white placeholder-[#555] outline-none focus:border-[#DC2626]"
        />
        <button
          type="submit"
          className="rounded bg-[#DC2626] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-red-700"
        >
          Search
        </button>
      </form>

      {searched && (
        <div>
          <p className="mb-4 text-sm text-[#a0a0a0]">
            {mockResults.length} results for &quot;{query}&quot;
          </p>
          <div className="space-y-3">
            {mockResults.map((result) => (
              <Link
                key={result.id}
                href={`/profile/${result.id}`}
                className="flex items-center justify-between rounded-lg border border-[#2a2a2a] bg-[#111111] px-5 py-4 transition-colors hover:border-[#3a3a3a]"
              >
                <div>
                  <div className="font-semibold text-white">{result.display_name}</div>
                  <div className="mt-0.5 text-xs text-[#a0a0a0]">
                    {result.city}, {result.state}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-xs text-[#a0a0a0]">Flags</div>
                    <div className="font-bold text-white">{result.flag_count}</div>
                  </div>
                  <span
                    className={`rounded-full border px-3 py-1 text-xs font-semibold capitalize ${riskColors[result.risk_level]}`}
                  >
                    {result.risk_level}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {!searched && (
        <div className="rounded-lg border border-[#2a2a2a] bg-[#111111] px-8 py-12 text-center">
          <div className="mb-3 text-4xl">🔍</div>
          <p className="text-[#a0a0a0]">Enter a name, address, or phone number to search</p>
        </div>
      )}
    </div>
  )
}
