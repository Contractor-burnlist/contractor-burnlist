'use client'

import { useState } from 'react'

export default function RecalculateButton() {
  const [status, setStatus] = useState<'idle' | 'running' | 'done'>('idle')
  const [message, setMessage] = useState('')

  async function run() {
    setStatus('running')
    const res = await fetch('/api/admin/recalculate-all', { method: 'POST' })
    const data = await res.json()
    setMessage(data.message ?? data.error ?? 'Done')
    setStatus('done')
  }

  return (
    <div className="flex items-center gap-3">
      <button onClick={run} disabled={status === 'running'} className="rounded bg-[#DC2626] px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-red-700 disabled:opacity-50">
        {status === 'running' ? 'Recalculating...' : 'Recalculate All Risk Scores'}
      </button>
      {message && <span className="text-xs text-[#6b7280]">{message}</span>}
    </div>
  )
}
