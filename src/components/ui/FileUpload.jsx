'use client'
import { useState, useRef } from 'react'
const MAX_SIZE_MB = 10
const ALLOWED_TYPES = {
  docs: ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'],
  photos: ['image/jpeg', 'image/png', 'image/webp'],
}

export default function FileUpload({ bucket, folder, accept = 'docs', maxFiles = 5, onUpload, label, hint }) {
  const [files, setFiles] = useState([])
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const inputRef = useRef()

  const allowedTypes = ALLOWED_TYPES[accept] ?? ALLOWED_TYPES.docs

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
      {label && <label className="block text-white/70 text-sm mb-1.5">{label}</label>}

      {/* Drop zone */}
      <div
        onClick={() => inputRef.current?.click()}
        className="border-2 border-dashed border-white/20 hover:border-turmeric-400/60 rounded-xl p-6 text-center cursor-pointer transition-colors group"
      >
        <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">📎</div>
        <p className="text-white/60 text-sm">
          {uploading ? 'Uploading…' : `Click to upload${files.length > 0 ? ' more' : ''}`}
        </p>
        {hint && <p className="text-white/35 text-xs mt-1">{hint}</p>}
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

      {error && <p className="text-red-400 text-xs mt-2">{error}</p>}

      {/* Uploaded files */}
      {files.length > 0 && (
        <ul className="mt-3 space-y-2">
          {files.map((f, i) => (
            <li key={i} className="flex items-center justify-between bg-white/8 rounded-lg px-3 py-2">
              <span className="text-white/70 text-sm truncate max-w-[80%]">✓ {f.name}</span>
              <button
                type="button"
                onClick={() => removeFile(i)}
                className="text-red-400/70 hover:text-red-400 text-xs ml-2 transition-colors"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
