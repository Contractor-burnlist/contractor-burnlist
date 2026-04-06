import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import PostDetail from './PostDetail'

export default async function PostPage({ params }: { params: Promise<{ slug: string; postId: string }> }) {
  const { slug, postId } = await params
  const supabase = await createClient()

  const { data: post } = await supabase
    .from('forum_posts')
    .select('*, profiles(display_username, trade, reputation_points, is_verified), forum_categories(name, slug, emoji)')
    .eq('id', postId)
    .single()

  if (!post || post.is_deleted) notFound()

  const { data: replies } = await supabase
    .from('forum_replies')
    .select('*, profiles(display_username, trade, reputation_points, is_verified)')
    .eq('post_id', postId)
    .order('created_at', { ascending: true })

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <Link href={`/community/${slug}`} className="mb-6 inline-flex items-center gap-2 text-sm text-[#6b7280] hover:text-[#111111]">
        ← Back to {(post.forum_categories as any)?.emoji} {(post.forum_categories as any)?.name}
      </Link>
      <PostDetail post={post} replies={replies ?? []} slug={slug} />
    </div>
  )
}
