'use client'

import { useState, useEffect } from 'react'

const REASON_LABELS: Record<string, string> = {
  false_information: 'False Information',
  harassment: 'Harassment',
  spam: 'Spam',
  retaliation: 'Retaliation',
  inappropriate: 'Inappropriate',
  other: 'Other',
}

export default function AdminFlaggedPage() {
  const [flags, setFlags] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('pending')

  async function load() {
    setLoading(true)
    const res = await fetch(`/api/admin/flags?status=${tab}`)
    const { data } = await res.json()
    setFlags(data ?? [])
    setLoading(false)
  }

  useEffect(() => { load() }, [tab])

  async function handleAction(flagId: string, action: 'dismiss' | 'action_taken') {
    const msg = action === 'action_taken' ? 'Remove flagged content and mark as resolved?' : 'Dismiss this flag?'
    if (!confirm(msg)) return
    await fetch('/api/admin/flags', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ flagId, action }),
    })
    load()
  }

  return (
    <div>
      <h1 className="mb-4 text-2xl font-black text-[#111111]">Flagged Content</h1>

      <div className="mb-4 flex gap-2">
        {['pending', 'reviewed', 'dismissed', 'action_taken', 'all'].map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`rounded-full px-4 py-1.5 text-xs font-medium transition-colors ${tab === t ? 'bg-[#111111] text-white' : 'border border-[#e5e7eb] text-[#6b7280]'}`}>
            {t === 'action_taken' ? 'Actioned' : t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><div className="h-6 w-6 animate-spin rounded-full border-2 border-[#e5e7eb] border-t-[#DC2626]" /></div>
      ) : flags.length === 0 ? (
        <p className="py-8 text-center text-sm text-[#9ca3af]">No flags found.</p>
      ) : (
        <div className="space-y-3">
          {flags.map((f: any) => (
            <div key={f.id} className="rounded-lg border border-[#e5e7eb] bg-white p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`rounded px-2 py-0.5 text-[10px] font-semibold ${f.content_type === 'comment' ? 'bg-blue-50 text-blue-600' : 'bg-[#DC2626]/10 text-[#DC2626]'}`}>
                      {f.content_type}
                    </span>
                    <span className="rounded bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700">{REASON_LABELS[f.reason] ?? f.reason}</span>
                    <span className={`rounded px-2 py-0.5 text-[10px] font-semibold ${f.status === 'pending' ? 'bg-yellow-50 text-yellow-700' : f.status === 'action_taken' ? 'bg-red-50 text-red-600' : 'bg-gray-100 text-[#6b7280]'}`}>
                      {f.status}
                    </span>
                  </div>
                  <div className="mt-2 text-xs text-[#6b7280]">
                    {f.contact_name ? (
                      <span>Dispute from: <strong className="text-[#111111]">{f.contact_name}</strong>{f.contact_email && <> &middot; <a href={`mailto:${f.contact_email}`} className="text-[#DC2626] hover:underline">{f.contact_email}</a></>}</span>
                    ) : (
                      <span>Flagged by: {f.profiles?.display_username ?? f.profiles?.email ?? 'Unknown'}</span>
                    )}
                  </div>
                  {f.description && <p className="mt-1 text-xs text-[#374151]">{f.description}</p>}
                  {f.attachment_paths && f.attachment_paths.length > 0 && (
                    <div className="mt-1 flex items-center gap-1 text-[10px] text-[#6b7280]">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48"/></svg>
                      {f.attachment_paths.length} attachment{f.attachment_paths.length > 1 ? 's' : ''}
                    </div>
                  )}
                  <div className="mt-1 text-[10px] text-[#9ca3af]">
                    Content ID: {f.content_id.slice(0, 8)}... &middot; {new Date(f.created_at).toLocaleString()}
                  </div>
                  {f.admin_notes && <p className="mt-1 text-[10px] italic text-[#6b7280]">Admin: {f.admin_notes}</p>}
                </div>
                {f.status === 'pending' && (
                  <div className="flex shrink-0 gap-1">
                    <button onClick={() => handleAction(f.id, 'dismiss')} className="rounded border border-[#e5e7eb] px-2 py-1 text-[10px] text-[#6b7280] hover:bg-[#f9fafb]">Dismiss</button>
                    <button onClick={() => handleAction(f.id, 'action_taken')} className="rounded border border-[#DC2626] px-2 py-1 text-[10px] text-[#DC2626] hover:bg-red-50">Remove Content</button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
