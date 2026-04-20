import { NextResponse } from 'next/server'
import { createClient } from '../../../../lib/supabase-server.js'
import { sanitizeStorageFileName } from '../../../../lib/storageFilename.js'
import { isValidStoragePrefix, STORAGE_ALLOWED_BUCKETS, STORAGE_MAX_BYTES } from '../../../../lib/storageUploadPolicy.js'

export async function POST(request) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: userErr } = await supabase.auth.getUser()
    if (userErr || !user) {
      return NextResponse.json(
        { error: 'Sign in required to upload files.' },
        { status: 401 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('file')
    const bucket = formData.get('bucket')
    const prefix = String(formData.get('prefix') ?? '').trim()

    if (!(file instanceof File) || file.size === 0) {
      return NextResponse.json({ error: 'No file uploaded.' }, { status: 400 })
    }
    if (file.size > STORAGE_MAX_BYTES) {
      return NextResponse.json({ error: 'File too large (max 10MB).' }, { status: 400 })
    }
    if (!STORAGE_ALLOWED_BUCKETS.has(bucket)) {
      return NextResponse.json({ error: 'Invalid bucket.' }, { status: 400 })
    }
    if (!isValidStoragePrefix(bucket, prefix)) {
      return NextResponse.json({ error: 'Invalid upload path.' }, { status: 400 })
    }

    const safeName = sanitizeStorageFileName(file.name)
    const path = `${prefix}/${crypto.randomUUID()}-${safeName}`

    const buf = Buffer.from(await file.arrayBuffer())
    const contentType = file.type || 'application/octet-stream'

    const { error: upErr } = await supabase.storage.from(bucket).upload(path, buf, {
      contentType,
      upsert: true,
    })

    if (upErr) {
      console.error('[storage/upload]', upErr)
      return NextResponse.json({ error: upErr.message }, { status: 400 })
    }

    const { data } = supabase.storage.from(bucket).getPublicUrl(path)
    return NextResponse.json({ url: data.publicUrl })
  } catch (e) {
    console.error('[storage/upload]', e)
    return NextResponse.json({ error: 'Upload failed.' }, { status: 500 })
  }
}
