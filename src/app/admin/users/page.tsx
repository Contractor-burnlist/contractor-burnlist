'use client'

import { useState, useEffect } from 'react'

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  async function load() {
    setLoading(true)
    const res = await fetch(`/api/admin/users?page=${page}&search=${encodeURIComponent(search)}`)
    const { data } = await res.json()
    setUsers(data ?? [])
    setLoading(false)
  }

  useEffect(() => { load() }, [page])

  async function handleAction(userId: string, action: string) {
    const labels: Record<string, string> = { ban: 'Ban this user?', unban: 'Unban this user?', toggle_verified: 'Toggle verification?' }
    if (!confirm(labels[action] ?? 'Confirm?')) return
    await fetch('/api/admin/users', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, action }),
    })
    load()
  }

  return (
    <div>
      <h1 className="mb-4 text-2xl font-black text-[#111111]">Users</h1>

      <form onSubmit={(e) => { e.preventDefault(); setPage(1); load() }} className="mb-4 flex gap-2">
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search email, username, business..." className="flex-1 rounded border border-[#e5e7eb] bg-white px-3 py-2 text-sm outline-none focus:border-[#DC2626]" />
        <button type="submit" className="rounded bg-[#DC2626] px-4 py-2 text-xs font-semibold text-white">Search</button>
      </form>

      {loading ? (
        <div className="flex justify-center py-12"><div className="h-6 w-6 animate-spin rounded-full border-2 border-[#e5e7eb] border-t-[#DC2626]" /></div>
      ) : users.length === 0 ? (
        <p className="py-8 text-center text-sm text-[#9ca3af]">No users found.</p>
      ) : (
        <div className="space-y-2">
          {users.map((u: any) => (
            <div key={u.id} className={`rounded-lg border bg-white p-4 ${u.is_banned ? 'border-red-300 bg-red-50/50' : 'border-[#e5e7eb]'}`}>
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-semibold text-[#111111]">{u.email}</span>
                    {u.display_username && <span className="text-xs text-[#6b7280]">@{u.display_username}</span>}
                    {u.is_verified && <span className="rounded bg-green-50 px-1.5 py-0.5 text-[10px] font-semibold text-green-600 border border-green-300">Verified</span>}
                    {u.is_banned && <span className="rounded bg-red-100 px-1.5 py-0.5 text-[10px] font-semibold text-red-600">Banned</span>}
                    {u.subscription_status === 'active' && <span className="rounded bg-blue-50 px-1.5 py-0.5 text-[10px] font-semibold text-blue-600 border border-blue-300">{u.subscription_tier}</span>}
                  </div>
                  <div className="mt-1 flex flex-wrap gap-3 text-[10px] text-[#9ca3af]">
                    {u.business_name && <span>{u.business_name}</span>}
                    {u.trade && <span>{u.trade}</span>}
                    <span>Trust: {u.trust_score ?? 1}/5</span>
                    <span>Rep: {u.reputation_points ?? 0} ({u.reputation_rank ?? 'Rookie'})</span>
                    <span>Comments: {u.comment_count ?? 0}</span>
                    <span>Joined: {new Date(u.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex shrink-0 gap-1">
                  <button onClick={() => handleAction(u.id, 'toggle_verified')} className="rounded border border-[#e5e7eb] px-2 py-1 text-[10px] text-[#6b7280] hover:bg-[#f9fafb]">
                    {u.is_verified ? 'Unverify' : 'Verify'}
                  </button>
                  {u.is_banned ? (
                    <button onClick={() => handleAction(u.id, 'unban')} className="rounded border border-green-300 px-2 py-1 text-[10px] text-green-600 hover:bg-green-50">Unban</button>
                  ) : (
                    <button onClick={() => handleAction(u.id, 'ban')} className="rounded border border-[#DC2626] px-2 py-1 text-[10px] text-[#DC2626] hover:bg-red-50">Ban</button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 flex justify-center gap-2">
        <button disabled={page <= 1} onClick={() => setPage(page - 1)} className="rounded border border-[#e5e7eb] px-3 py-1 text-xs disabled:opacity-30">Prev</button>
        <span className="px-3 py-1 text-xs text-[#6b7280]">Page {page}</span>
        <button disabled={users.length < 25} onClick={() => setPage(page + 1)} className="rounded border border-[#e5e7eb] px-3 py-1 text-xs disabled:opacity-30">Next</button>
      </div>
    </div>
  )
}
