import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export default async function CommunityPage() {
  const supabase = await createClient()

  const { data: categories } = await supabase
    .from('forum_categories')
    .select('id, name, slug, description, emoji, display_order')
    .order('display_order')

  // Get post counts and latest post per category
  const { data: posts } = await supabase
    .from('forum_posts')
    .select('id, title, category_id, created_at, profiles(display_username)')
    .eq('is_deleted', false)
    .order('created_at', { ascending: false })
    .limit(100)

  const catStats = new Map<string, { count: number; latest: any }>()
  for (const p of posts ?? []) {
    const stat = catStats.get(p.category_id) ?? { count: 0, latest: null }
    stat.count++
    if (!stat.latest) stat.latest = p
    catStats.set(p.category_id, stat)
  }

  // Trending: top 5 posts by upvotes in last 7 days
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  const { data: trending } = await supabase
    .from('forum_posts')
    .select('id, title, upvote_count, reply_count, category_id, created_at, profiles(display_username, reputation_points), forum_categories(slug, emoji)')
    .eq('is_deleted', false)
    .gte('created_at', weekAgo)
    .order('upvote_count', { ascending: false })
    .limit(5)

  function timeAgo(d: string) {
    const s = Math.floor((Date.now() - new Date(d).getTime()) / 1000)
    if (s < 60) return 'just now'
    if (s < 3600) return Math.floor(s / 60) + 'm ago'
    if (s < 86400) return Math.floor(s / 3600) + 'h ago'
    return Math.floor(s / 86400) + 'd ago'
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-[#111111]">Contractor Community</h1>
          <p className="mt-1 text-[#6b7280]">Talk shop, share stories, and learn from contractors who get it.</p>
        </div>
        <Link href="/community/new" className="rounded-lg bg-[#DC2626] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-700">
          New Post
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-3">
          {(categories ?? []).map((cat: any) => {
            const stat = catStats.get(cat.id)
            return (
              <Link key={cat.id} href={`/community/${cat.slug}`} className="flex items-start gap-4 rounded-lg border border-[#e5e7eb] bg-white p-5 transition-colors hover:border-[#d1d5db]">
                <span className="text-2xl">{cat.emoji}</span>
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-bold text-[#111111]">{cat.name}</h3>
                  <p className="mt-0.5 text-xs text-[#6b7280]">{cat.description}</p>
                  <div className="mt-2 flex items-center gap-3 text-[10px] text-[#9ca3af]">
                    <span>{stat?.count ?? 0} posts</span>
                    {stat?.latest && (
                      <span className="truncate">Latest: {stat.latest.title} · {timeAgo(stat.latest.created_at)}</span>
                    )}
                  </div>
                </div>
              </Link>
            )
          })}
        </div>

        <div>
          <h2 className="mb-3 text-sm font-bold text-[#111111]">Trending This Week</h2>
          {(trending ?? []).length > 0 ? (
            <div className="space-y-2">
              {(trending ?? []).map((p: any) => (
                <Link key={p.id} href={`/community/${(p.forum_categories as any)?.slug}/${p.id}`} className="block rounded-lg border border-[#e5e7eb] bg-white p-3 transition-colors hover:border-[#d1d5db]">
                  <p className="text-xs font-semibold text-[#111111] line-clamp-2">{p.title}</p>
                  <div className="mt-1.5 flex items-center gap-2 text-[10px] text-[#9ca3af]">
                    <span>{(p.forum_categories as any)?.emoji}</span>
                    <span>↑{p.upvote_count}</span>
                    <span>{p.reply_count} replies</span>
                    <span>{(p.profiles as any)?.display_username ?? 'Anonymous'}</span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-xs text-[#9ca3af]">No trending posts yet. Be the first!</p>
          )}
        </div>
      </div>
    </div>
  )
}
