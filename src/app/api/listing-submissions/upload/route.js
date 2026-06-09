import { NextResponse } from 'next/server'
import { createClient } from '../../../../lib/supabase-server'
import { sanitizeStorageFileName } from '../../../../lib/storageFilename'
import { STORAGE_MAX_BYTES } from '../../../../lib/storageUploadPolicy'

const ALLOWED_TYPES = new Set([
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
])

/**
 * Public upload endpoint for the /list-your-land form.
 * Does NOT require authentication — uses an anon Supabase client.
 * Files land in property-docs or property-photos under listing-submissions/TIMESTAMP/.
 */
export async function POST(request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file')
    const type = String(formData.get('type') ?? 'docs')   // 'docs' | 'photos'
    const folder = String(formData.get('folder') ?? Date.now())

    if (!(file instanceof File) || file.size === 0) {
      return NextResponse.json({ error: 'No file uploaded.' }, { status: 400 })
    }
    if (file.size > STORAGE_MAX_BYTES) {
      return NextResponse.json({ error: 'File too large (max 10MB).' }, { status: 400 })
    }
    if (!ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json({ error: 'Invalid file type.' }, { status: 400 })
    }

    const bucket = type === 'photos' ? 'property-photos' : 'property-docs'
    const prefix = `listing-submissions/${folder}`
    const safeName = sanitizeStorageFileName(file.name)
    const path = `${prefix}/${crypto.randomUUID()}-${safeName}`

    const supabase = await createClient()
    const buf = Buffer.from(await file.arrayBuffer())

    const { error: upErr } = await supabase.storage
      .from(bucket)
      .upload(path, buf, { contentType: file.type || 'application/octet-stream', upsert: true })

    if (upErr) {
      console.error('[listing-submissions/upload]', upErr)
      return NextResponse.json({ error: upErr.message }, { status: 400 })
    }

    const { data } = supabase.storage.from(bucket).getPublicUrl(path)
    return NextResponse.json({ url: data.publicUrl })
  } catch (e) {
    console.error('[listing-submissions/upload]', e)
    return NextResponse.json({ error: 'Upload failed.' }, { status: 500 })
  }
}
