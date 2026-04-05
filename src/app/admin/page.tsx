import { createServiceClient } from '@/lib/supabase/server'
import RecalculateButton from './RecalculateButton'

export default async function AdminPage() {
  const supabase = await createServiceClient()

  const [
    { count: userCount },
    { count: entryCount },
    { count: workerEntryCount },
    { count: customerCount },
    { count: workerCount },
    { count: commentCount },
    { count: subscriberCount },
    { count: flagCount },
  ] = await Promise.all([
    supabase.from('profiles').select('id', { count: 'exact', head: true }),
    supabase.from('entries').select('id', { count: 'exact', head: true }),
    supabase.from('worker_entries').select('id', { count: 'exact', head: true }),
    supabase.from('customers').select('id', { count: 'exact', head: true }),
    supabase.from('workers').select('id', { count: 'exact', head: true }),
    supabase.from('comments').select('id', { count: 'exact', head: true }).eq('is_deleted', false),
    supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('subscription_status', 'active'),
    supabase.from('content_flags').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
  ])

  const stats = [
    { label: 'Users', value: userCount ?? 0 },
    { label: 'Reports', value: (entryCount ?? 0) + (workerEntryCount ?? 0) },
    { label: 'Customers Flagged', value: customerCount ?? 0 },
    { label: 'Workers Flagged', value: workerCount ?? 0 },
    { label: 'Comments', value: commentCount ?? 0 },
    { label: 'Subscribers', value: subscriberCount ?? 0 },
    { label: 'Pending Flags', value: flagCount ?? 0 },
  ]

  // Recent entries
  const { data: recentEntries } = await supabase
    .from('entries')
    .select('id, description, created_at, customers(display_name)')
    .order('created_at', { ascending: false })
    .limit(5)

  const { data: recentComments } = await supabase
    .from('comments')
    .select('id, content, created_at, profiles(display_username)')
    .eq('is_deleted', false)
    .order('created_at', { ascending: false })
    .limit(5)

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-black text-[#111111]">Admin Overview</h1>
        <RecalculateButton />
      </div>

      <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
        {stats.map((s) => (
          <div key={s.label} className="rounded-lg border border-[#e5e7eb] bg-white p-4 text-center">
            <div className="text-2xl font-black text-[#111111]">{s.value}</div>
            <div className="mt-1 text-xs text-[#6b7280]">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div>
          <h2 className="mb-3 text-sm font-bold text-[#111111]">Recent Reports</h2>
          <div className="space-y-2">
            {(recentEntries ?? []).map((e: any) => (
              <div key={e.id} className="rounded border border-[#e5e7eb] bg-white px-4 py-3">
                <div className="text-xs font-semibold text-[#111111]">{e.customers?.display_name ?? 'Unknown'}</div>
                <p className="mt-1 text-xs text-[#6b7280] line-clamp-1">{e.description}</p>
                <div className="mt-1 text-[10px] text-[#9ca3af]">{new Date(e.created_at).toLocaleString()}</div>
              </div>
            ))}
            {(!recentEntries || recentEntries.length === 0) && <p className="text-xs text-[#9ca3af]">No reports yet.</p>}
          </div>
        </div>
        <div>
          <h2 className="mb-3 text-sm font-bold text-[#111111]">Recent Comments</h2>
          <div className="space-y-2">
            {(recentComments ?? []).map((c: any) => (
              <div key={c.id} className="rounded border border-[#e5e7eb] bg-white px-4 py-3">
                <div className="text-xs font-semibold text-[#111111]">{c.profiles?.display_username ?? 'Anonymous'}</div>
                <p className="mt-1 text-xs text-[#6b7280] line-clamp-1">{c.content}</p>
                <div className="mt-1 text-[10px] text-[#9ca3af]">{new Date(c.created_at).toLocaleString()}</div>
              </div>
            ))}
            {(!recentComments || recentComments.length === 0) && <p className="text-xs text-[#9ca3af]">No comments yet.</p>}
          </div>
        </div>
      </div>
    </div>
  )
}
