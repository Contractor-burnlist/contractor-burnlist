'use client'

import { useState, useEffect } from 'react'

export default function AdminCommentsPage() {
  const [comments, setComments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState('active')
  const [selected, setSelected] = useState<Set<string>>(new Set())

  async function load() {
    setLoading(true)
    const res = await fetch(`/api/admin/comments?status=${status}`)
    const { data } = await res.json()
    setComments(data ?? [])
    setSelected(new Set())
    setLoading(false)
  }

  useEffect(() => { load() }, [status])

  async function handleAction(ids: string[], action: 'delete' | 'restore') {
    if (!confirm(`${action === 'delete' ? 'Delete' : 'Restore'} ${ids.length} comment(s)?`)) return
    await fetch('/api/admin/comments', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids, action }),
    })
    load()
  }

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  return (
    <div>
      <h1 className="mb-4 text-2xl font-black text-[#111111]">Comments</h1>

      <div className="mb-4 flex items-center justify-between">
        <div className="flex gap-2">
          {['active', 'deleted', 'all'].map((s) => (
            <button key={s} onClick={() => setStatus(s)} className={`rounded-full px-4 py-1.5 text-xs font-medium transition-colors ${status === s ? 'bg-[#111111] text-white' : 'border border-[#e5e7eb] text-[#6b7280]'}`}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
        {selected.size > 0 && (
          <div className="flex gap-2">
            <button onClick={() => handleAction([...selected], 'delete')} className="rounded bg-[#DC2626] px-3 py-1 text-xs font-semibold text-white">Delete ({selected.size})</button>
            <button onClick={() => handleAction([...selected], 'restore')} className="rounded border border-[#e5e7eb] px-3 py-1 text-xs font-semibold text-[#6b7280]">Restore ({selected.size})</button>
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><div className="h-6 w-6 animate-spin rounded-full border-2 border-[#e5e7eb] border-t-[#DC2626]" /></div>
      ) : comments.length === 0 ? (
        <p className="py-8 text-center text-sm text-[#9ca3af]">No comments found.</p>
      ) : (
        <div className="space-y-2">
          {comments.map((c: any) => (
            <div key={c.id} className={`rounded-lg border bg-white p-4 ${c.is_deleted ? 'border-red-200 bg-red-50/50' : 'border-[#e5e7eb]'}`}>
              <div className="flex items-start gap-3">
                <input type="checkbox" checked={selected.has(c.id)} onChange={() => toggleSelect(c.id)} className="mt-1 h-4 w-4 shrink-0 accent-[#DC2626]" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-semibold text-[#111111]">{c.profiles?.display_username ?? 'Anonymous'}</span>
                    <span className="text-[#9ca3af]">{c.profiles?.email}</span>
                    <span className="text-[#9ca3af]">{c.profiles?.reputation_points ?? 0} pts</span>
                    {c.is_deleted && <span className="rounded bg-red-100 px-1.5 py-0.5 text-[10px] font-semibold text-red-600">Deleted</span>}
                  </div>
                  <p className="mt-1 text-sm text-[#374151]">{c.content}</p>
                  <div className="mt-1 text-[10px] text-[#9ca3af]">{new Date(c.created_at).toLocaleString()}</div>
                </div>
                <div className="flex shrink-0 gap-1">
                  {!c.is_deleted && <button onClick={() => handleAction([c.id], 'delete')} className="rounded border border-[#e5e7eb] px-2 py-1 text-[10px] text-[#DC2626] hover:bg-red-50">Delete</button>}
                  {c.is_deleted && <button onClick={() => handleAction([c.id], 'restore')} className="rounded border border-[#e5e7eb] px-2 py-1 text-[10px] text-green-600 hover:bg-green-50">Restore</button>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
