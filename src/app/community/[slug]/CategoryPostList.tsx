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
      await supabase.from('forum_upvotes').delete().eq('user_id', userId).eq('post_id', postId)
      setUpvoted((prev) => { const n = new Set(prev); n.delete(postId); return n })
    } else {
      await supabase.from('forum_upvotes').insert({ user_id: userId, post_id: postId })
      setUpvoted((prev) => new Set(prev).add(postId))
    }
  }

  return (
    <div className="space-y-3">
      {posts.length === 0 && <p className="py-12 text-center text-sm text-[#9ca3af]">No posts yet. Be the first!</p>}
      {posts.map((post: any) => {
        const isUpvoted = upvoted.has(post.id)
        const isAuthor = post.user_id === userId
        return (
          <div key={post.id} className="flex gap-3 rounded-lg border border-[#e5e7eb] bg-white p-4">
            <div className="flex flex-col items-center gap-1">
              <button
                onClick={() => !isAuthor && toggleUpvote(post.id)}
                disabled={isAuthor || !userId}
                className={`flex h-8 w-8 items-center justify-center rounded transition-colors ${isUpvoted ? 'bg-[#DC2626] text-white' : 'bg-[#f9fafb] text-[#9ca3af] hover:text-[#DC2626]'} disabled:opacity-40`}
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 2l5 5H2z" fill={isUpvoted ? 'currentColor' : 'none'}/></svg>
              </button>
              <span className={`text-xs font-bold ${isUpvoted ? 'text-[#DC2626]' : 'text-[#6b7280]'}`}>{post.upvote_count + (isUpvoted && !upvoted.has(post.id) ? 0 : 0)}</span>
            </div>
            <div className="min-w-0 flex-1">
              <Link href={`/community/${slug}/${post.id}`} className="text-sm font-bold text-[#111111] hover:text-[#DC2626]">
                {post.is_pinned && <span className="mr-1.5 text-[#9ca3af]">📌</span>}
                {post.title}
              </Link>
              <p className="mt-1 text-xs text-[#6b7280] line-clamp-2">{post.content?.slice(0, 200)}</p>
              <div className="mt-2 flex flex-wrap items-center gap-2 text-[10px] text-[#9ca3af]">
                <span className="font-medium text-[#111111]">{(post.profiles as any)?.display_username ?? 'Anonymous'}</span>
                {(post.profiles as any)?.trade && <span className="rounded bg-[#f0f0f0] px-1.5 py-0.5">{(post.profiles as any).trade}</span>}
                <ReputationBadge points={(post.profiles as any)?.reputation_points ?? 0} />
                <span>{post.reply_count} replies</span>
                <span>{timeAgo(post.created_at)}</span>
                {post.is_locked && <span className="text-amber-600">🔒 Locked</span>}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
