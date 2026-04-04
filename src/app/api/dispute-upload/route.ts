import { createServiceClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

const ALLOWED_TYPES = [
  'image/jpeg', 'image/png', 'image/gif', 'image/webp',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]
const MAX_SIZE = 10 * 1024 * 1024 // 10MB

export async function POST(request: Request) {
  const formData = await request.formData()
  const file = formData.get('file') as File | null
  const contentId = formData.get('contentId') as string | null

  if (!file || !contentId) {
    return NextResponse.json({ error: 'File and contentId required' }, { status: 400 })
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json({ error: 'File type not supported. Please use JPG, PNG, PDF, or DOC.' }, { status: 400 })
  }

  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: 'File too large. Maximum size is 10MB.' }, { status: 400 })
  }

  const supabase = await createServiceClient()
  const timestamp = Date.now()
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
  const path = `${contentId}/${timestamp}_${safeName}`

  const buffer = Buffer.from(await file.arrayBuffer())

  const { error } = await supabase.storage
    .from('dispute-attachments')
    .upload(path, buffer, { contentType: file.type, upsert: false })

  if (error) {
    console.error('[dispute-upload] Storage error:', error.message)
    return NextResponse.json({ error: 'Upload failed. Please try again.' }, { status: 500 })
  }

  return NextResponse.json({ path })
}
