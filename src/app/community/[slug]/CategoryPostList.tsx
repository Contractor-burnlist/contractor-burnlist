'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import ReputationBadge from '@/components/ReputationBadge'

function timeAgo(d: string) {
  const s = Math.floor((Date.now() - new Date(d).getTime()) / 1000)
  if (s < 60) return 'just now'
  if (s < 3600) return Math.floor(s / 60) + 'm ago'
  if (s < 86400) return Math.floor(s / 3600) + 'h ago'
  return Math.floor(s / 86400) + 'd ago'
}

export default function CategoryPostList({ posts, slug }: { posts: any[]; slug: string }) {
  const [userId, setUserId] = useState<string | null>(null)
  const [upvoted, setUpvoted] = useState<Set<string>>(new Set())
  const [voteCounts, setVoteCounts] = useState<Map<string, number>>(new Map(posts.map((p) => [p.id, p.upvote_count ?? 0])))

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUserId(user?.id ?? null)
      if (user) {
        const postIds = posts.map((p) => p.id)
        if (postIds.length > 0) {
          supabase.from('forum_upvotes').select('post_id').eq('user_id', user.id).in('post_id', postIds)
            .then(({ data }) => setUpvoted(new Set((data ?? []).map((u: any) => u.post_id))))
        }
      }
    })
  }, [posts])

  async function toggleUpvote(postId: string) {
    if (!userId) return
    const supabase = createClient()
    if (upvoted.has(postId)) {
      setUpvoted((prev) => { const n = new Set(prev); n.delete(postId); return n })
      setVoteCounts((prev) => { const n = new Map(prev); n.set(postId, Math.max((n.get(postId) ?? 0) - 1, 0)); return n })
      await supabase.from('forum_upvotes').delete().eq('user_id', userId).eq('post_id', postId)
    } else {
      setUpvoted((prev) => new Set(prev).add(postId))
      setVoteCounts((prev) => { const n = new Map(prev); n.set(postId, (n.get(postId) ?? 0) + 1); return n })
      await supabase.from('forum_upvotes').insert({ user_id: userId, post_id: postId })
    }
  }

  return (
    <div className="space-y-4">
      {posts.length === 0 && (
        <div className="rounded-lg border border-gray-200 bg-white px-8 py-16 text-center shadow-sm">
          <p className="text-sm text-gray-500">No posts yet. Be the first to start a discussion!</p>
        </div>
      )}
      {posts.map((post: any) => {
        const isUpvoted = upvoted.has(post.id)
        const isAuthor = post.user_id === userId
        const prof = post.profiles as any
        return (
          <div key={post.id} className="flex gap-4 rounded-lg border border-gray-200 bg-white p-5 shadow-sm transition-colors hover:border-gray-300">
            <div className="flex flex-col items-center gap-0.5">
              <button
                onClick={() => !isAuthor && toggleUpvote(post.id)}
                disabled={isAuthor || !userId}
                className={`flex h-9 w-9 items-center justify-center rounded-lg transition-all ${isUpvoted ? 'bg-[#DC2626] text-white shadow-sm' : 'bg-gray-100 text-gray-400 hover:bg-gray-200 hover:text-[#DC2626]'} disabled:opacity-30`}
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill={isUpvoted ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M7 2l5 5H2z"/></svg>
              </button>
              <span className={`text-xs font-bold ${isUpvoted ? 'text-[#DC2626]' : 'text-gray-500'}`}>{voteCounts.get(post.id) ?? post.upvote_count ?? 0}</span>
            </div>
            <div className="min-w-0 flex-1">
              <Link href={`/community/${slug}/${post.id}`} className="block">
                <h3 className="text-base font-extrabold text-gray-900 transition-colors hover:text-[#DC2626]">
                  {post.is_pinned && <span className="mr-1.5 text-gray-400">📌</span>}
                  {post.title}
                </h3>
              </Link>
              <p className="mt-1.5 text-sm leading-relaxed text-gray-600 line-clamp-2">{post.content?.slice(0, 200)}</p>
              <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1">
                <span className="text-xs font-semibold text-gray-900">{prof?.display_username ?? 'Anonymous'}</span>
                {prof?.trade && <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-700">{prof.trade}</span>}
                <ReputationBadge points={prof?.reputation_points ?? 0} />
                <span className="text-xs text-gray-500">·</span>
                <span className="text-xs text-gray-500">{post.reply_count} replies</span>
                <span className="text-xs text-gray-500">·</span>
                <span className="text-xs text-gray-500">{timeAgo(post.created_at)}</span>
                {post.is_locked && <span className="text-xs text-amber-600">🔒 Locked</span>}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
