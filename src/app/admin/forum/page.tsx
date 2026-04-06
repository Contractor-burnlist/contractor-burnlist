import { createServiceClient } from '@/lib/supabase/server'

export default async function AdminForumPage() {
  const supabase = await createServiceClient()

  const [{ count: postCount }, { count: replyCount }] = await Promise.all([
    supabase.from('forum_posts').select('id', { count: 'exact', head: true }).eq('is_deleted', false),
    supabase.from('forum_replies').select('id', { count: 'exact', head: true }).eq('is_deleted', false),
  ])

  const { data: recentPosts } = await supabase
    .from('forum_posts')
    .select('id, title, is_pinned, is_locked, is_deleted, upvote_count, reply_count, created_at, profiles(email, display_username), forum_categories(name, emoji)')
    .order('created_at', { ascending: false })
    .limit(20)

  return (
    <div>
      <h1 className="mb-6 text-2xl font-black text-[#111111]">Forum Management</h1>

      <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <div className="rounded-lg border border-[#e5e7eb] bg-white p-4 text-center">
          <div className="text-2xl font-black text-[#111111]">{postCount ?? 0}</div>
          <div className="mt-1 text-xs text-[#6b7280]">Posts</div>
        </div>
        <div className="rounded-lg border border-[#e5e7eb] bg-white p-4 text-center">
          <div className="text-2xl font-black text-[#111111]">{replyCount ?? 0}</div>
          <div className="mt-1 text-xs text-[#6b7280]">Replies</div>
        </div>
      </div>

      <h2 className="mb-3 text-sm font-bold text-[#111111]">Recent Posts</h2>
      <div className="space-y-2">
        {(recentPosts ?? []).map((p: any) => (
          <div key={p.id} className={`rounded-lg border bg-white p-4 ${p.is_deleted ? 'border-red-200 bg-red-50/50' : 'border-[#e5e7eb]'}`}>
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs">{(p.forum_categories as any)?.emoji}</span>
                  <span className="text-sm font-semibold text-[#111111]">{p.title}</span>
                  {p.is_pinned && <span className="text-[10px] text-amber-600">📌 Pinned</span>}
                  {p.is_locked && <span className="text-[10px] text-amber-600">🔒 Locked</span>}
                  {p.is_deleted && <span className="rounded bg-red-100 px-1.5 py-0.5 text-[10px] font-semibold text-red-600">Deleted</span>}
                </div>
                <div className="mt-1 text-[10px] text-[#9ca3af]">
                  By: {(p.profiles as any)?.display_username ?? (p.profiles as any)?.email} · ↑{p.upvote_count} · {p.reply_count} replies · {new Date(p.created_at).toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
