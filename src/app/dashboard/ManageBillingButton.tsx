'use client'

import { useState } from 'react'

export default function ManageBillingButton() {
  const [loading, setLoading] = useState(false)

  async function handleClick() {
    setLoading(true)
    const res = await fetch('/api/billing-portal', { method: 'POST' })
    const data = await res.json()
    if (data.url) {
      window.location.href = data.url
    }
    setLoading(false)
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="rounded border border-[#e5e7eb] px-4 py-2 text-sm font-medium text-[#6b7280] transition-colors hover:border-[#d1d5db] hover:text-[#111111] disabled:opacity-50"
    >
      {loading ? 'Loading...' : 'Manage Billing'}
    </button>
  )
}
