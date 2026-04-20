'use client'
import { useState, useRef, useEffect } from 'react'
const MAX_SIZE_MB = 10
const ALLOWED_TYPES = {
  docs: ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'],
  photos: ['image/jpeg', 'image/png', 'image/webp'],
}

const THEME = {
  dark: {
    label: 'block text-white/70 text-sm mb-1.5',
    drop: 'border-2 border-dashed border-white/20 hover:border-turmeric-400/60 rounded-xl p-6 text-center cursor-pointer transition-colors group',
    dropIcon: 'text-3xl mb-2 group-hover:scale-110 transition-transform',
    dropMain: 'text-white/60 text-sm',
    hint: 'text-white/35 text-xs mt-1',
    row: 'flex items-center gap-2 bg-white/8 rounded-lg px-3 py-2',
    name: 'text-white/70 text-sm truncate min-w-0 flex-1',
    actions: 'flex items-center gap-2 shrink-0',
    link: 'text-turmeric-400/90 hover:text-turmeric-300 text-xs',
    remove: 'text-red-400/70 hover:text-red-400 text-xs transition-colors',
    err: 'text-red-400 text-xs mt-2',
  },
  light: {
    label: 'block text-gray-700 text-sm font-medium mb-1.5',
    drop: 'border-2 border-dashed border-gray-200 hover:border-paddy-400/70 rounded-xl p-6 text-center cursor-pointer transition-colors group bg-gray-50/80',
    dropIcon: 'text-3xl mb-2 group-hover:scale-110 transition-transform',
    dropMain: 'text-gray-600 text-sm',
    hint: 'text-gray-400 text-xs mt-1',
    row: 'flex items-center gap-2 bg-white border border-gray-100 rounded-lg px-3 py-2 shadow-sm',
    name: 'text-gray-800 text-sm truncate min-w-0 flex-1',
    actions: 'flex items-center gap-2 shrink-0',
    link: 'text-paddy-700 hover:underline text-xs font-medium',
    remove: 'text-red-600 hover:text-red-700 text-xs transition-colors',
    err: 'text-red-600 text-xs mt-2',
  },
}

export default function FileUpload({
  bucket,
  folder,
  accept = 'docs',
  maxFiles = 5,
  onUpload,
  label,
  hint,
  /** Existing uploads: { name?, url }[] — shown until removed; seeded once when first provided */
  initialItems,
  /** `light` for white cards (e.g. admin); `dark` for seller gradient pages */
  variant = 'dark',
}) {
  const [files, setFiles] = useState([])
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const inputRef = useRef()
  const seededRef = useRef(false)

  const allowedTypes = ALLOWED_TYPES[accept] ?? ALLOWED_TYPES.docs
  const t = THEME[variant] ?? THEME.dark

  useEffect(() => {
    if (seededRef.current || !initialItems?.length) return
    setFiles(
      initialItems.map((it, i) => ({
        name: typeof it === 'string' ? `File ${i + 1}` : it.name || `File ${i + 1}`,
        url: typeof it === 'string' ? it : it.url,
      }))
    )
    seededRef.current = true
  }, [initialItems])

  async function handleFiles(e) {
    setError('')
    const selected = Array.from(e.target.files)

    if (files.length + selected.length > maxFiles) {
      setError(`Maximum ${maxFiles} files allowed`)
      return
    }

    for (const file of selected) {
      if (!allowedTypes.includes(file.type)) {
        setError(`Invalid file type: ${file.name}`)
        return
      }
      if (file.size > MAX_SIZE_MB * 1024 * 1024) {
        setError(`File too large (max ${MAX_SIZE_MB}MB): ${file.name}`)
        return
      }
    }

    setUploading(true)
    const urls = []

    for (const file of selected) {
      const form = new FormData()
      form.append('file', file)
      form.append('bucket', bucket)
      form.append('prefix', folder)

      const res = await fetch('/api/storage/upload', { method: 'POST', body: form })
      const payload = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(payload.error || `Upload failed (${res.status})`)
        setUploading(false)
        return
      }
      if (!payload.url) {
        setError('Upload failed: no URL returned')
        setUploading(false)
        return
      }
      urls.push(payload.url)
    }

    const newFiles = [...files, ...selected.map((f, i) => ({ name: f.name, url: urls[i] }))]
    setFiles(newFiles)
    onUpload(newFiles.map(f => f.url))
    setUploading(false)
    e.target.value = ''
  }

  function removeFile(i) {
    const updated = files.filter((_, idx) => idx !== i)
    setFiles(updated)
    onUpload(updated.map(f => f.url))
  }

  return (
    <div>
      {label && <label className={t.label}>{label}</label>}

      {/* Drop zone */}
      <div
        onClick={() => inputRef.current?.click()}
        className={t.drop}
      >
        <div className={t.dropIcon}>📎</div>
        <p className={t.dropMain}>
          {uploading ? 'Uploading…' : `Click to upload${files.length > 0 ? ' more' : ''}`}
        </p>
        {hint && <p className={t.hint}>{hint}</p>}
        <input
          ref={inputRef}
          type="file"
          multiple={maxFiles > 1}
          accept={allowedTypes.join(',')}
          className="hidden"
          onChange={handleFiles}
          disabled={uploading || files.length >= maxFiles}
        />
      </div>

      {error && <p className={t.err}>{error}</p>}

      {/* Uploaded files */}
      {files.length > 0 && (
        <ul className="mt-3 space-y-2">
          {files.map((f, i) => (
            <li key={i} className={t.row}>
              <span className={t.name}>
                <span className={variant === 'light' ? 'text-green-600 mr-1' : 'text-turmeric-400 mr-1'} aria-hidden>✓</span>
                {f.name}
              </span>
              <div className={t.actions}>
                <a href={f.url} target="_blank" rel="noopener noreferrer" className={t.link}>
                  Open
                </a>
                <button type="button" onClick={() => removeFile(i)} className={t.remove}>
                  Remove
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
