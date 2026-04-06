'use client'

import { useState, useEffect } from 'react'

export default function AdminReportsPage() {
  const [reports, setReports] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [type, setType] = useState('all')
  const [page, setPage] = useState(1)

  async function load() {
    setLoading(true)
    const res = await fetch(`/api/admin/reports?type=${type}&page=${page}`)
    const { data } = await res.json()
    setReports(data ?? [])
    setLoading(false)
  }

  useEffect(() => { load() }, [type, page])

  async function handleDelete(id: string, reportType: string, deleteParent: boolean, parentId?: string) {
    const msg = deleteParent ? 'Delete this record AND all its feedback? This cannot be undone.' : 'Delete this feedback entry? This cannot be undone.'
    if (!confirm(msg)) return
    await fetch('/api/admin/reports', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: deleteParent ? parentId : id, type: reportType === 'customer' ? 'customer' : 'worker', deleteParent }),
    })
    load()
  }

  return (
    <div>
      <h1 className="mb-4 text-2xl font-black text-[#111111]">Reports</h1>

      <div className="mb-4 flex gap-2">
        {['all', 'customer', 'worker'].map((t) => (
          <button key={t} onClick={() => { setType(t); setPage(1) }} className={`rounded-full px-4 py-1.5 text-xs font-medium transition-colors ${type === t ? 'bg-[#111111] text-white' : 'border border-[#e5e7eb] text-[#6b7280] hover:text-[#111111]'}`}>
            {t === 'all' ? 'All' : t === 'customer' ? 'Customer' : 'Worker'}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><div className="h-6 w-6 animate-spin rounded-full border-2 border-[#e5e7eb] border-t-[#DC2626]" /></div>
      ) : reports.length === 0 ? (
        <p className="py-8 text-center text-sm text-[#9ca3af]">No feedback found.</p>
      ) : (
        <div className="space-y-3">
          {reports.map((r: any) => {
            const parent = r.report_type === 'customer' ? r.customers : r.workers
            const parentId = r.report_type === 'customer' ? r.customer_id : r.worker_id
            return (
              <div key={r.id} className="rounded-lg border border-[#e5e7eb] bg-white p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${r.report_type === 'customer' ? 'bg-[#DC2626]/10 text-[#DC2626]' : 'bg-orange-100 text-orange-600'}`}>
                        {r.report_type}
                      </span>
                      <span className="text-sm font-semibold text-[#111111]">{parent?.full_name ?? 'Unknown'}</span>
                      <span className="text-xs text-[#9ca3af]">({parent?.display_name})</span>
                      {parent?.city && <span className="text-xs text-[#6b7280]">{parent.city}, {parent.state}</span>}
                    </div>
                    <p className="mt-1 text-xs text-[#6b7280] line-clamp-2">{r.description}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-[10px] text-[#9ca3af]">
                      <span>By: {r.profiles?.email ?? 'Unknown'}</span>
                      {r.amount_owed > 0 && <span className="text-[#DC2626]">${Number(r.amount_owed).toLocaleString()}</span>}
                      <span>{new Date(r.created_at).toLocaleDateString()}</span>
                      {r.submitter_verified && <span className="text-green-600">Verified</span>}
                      <span>Flags: {parent?.flag_count ?? 0}</span>
                    </div>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <button onClick={() => handleDelete(r.id, r.report_type, false)} className="rounded border border-[#e5e7eb] px-2 py-1 text-[10px] text-[#DC2626] hover:bg-red-50">Delete Feedback</button>
                    <button onClick={() => handleDelete(r.id, r.report_type, true, parentId)} className="rounded border border-[#DC2626] px-2 py-1 text-[10px] text-[#DC2626] hover:bg-red-50">Delete Record</button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <div className="mt-4 flex justify-center gap-2">
        <button disabled={page <= 1} onClick={() => setPage(page - 1)} className="rounded border border-[#e5e7eb] px-3 py-1 text-xs disabled:opacity-30">Prev</button>
        <span className="px-3 py-1 text-xs text-[#6b7280]">Page {page}</span>
        <button disabled={reports.length < 25} onClick={() => setPage(page + 1)} className="rounded border border-[#e5e7eb] px-3 py-1 text-xs disabled:opacity-30">Next</button>
      </div>
    </div>
  )
}
