'use client'

import { useState } from 'react'
import Link from 'next/link'

import {
  MAX_IMPORT_ROWS,
  TEMPLATE_DISPLAY_HEADERS,
  TEMPLATE_SHEET_DATA,
  TEMPLATE_SHEET_HELP,
} from '../../lib/excelPropertyImport'

export default function AdminPropertyBulkImport() {
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState(null)
  const [error, setError] = useState('')

  async function downloadTemplate(e) {
    e.preventDefault()
    setError('')
    setMessage(null)
    try {
      const res = await fetch('/api/admin/import-properties', { credentials: 'same-origin' })
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        throw new Error(j.error || res.statusText || 'Download failed')
      }
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'sdv-farms-property-import-template.xlsx'
      a.click()
      URL.revokeObjectURL(url)
      setMessage('Template downloaded.')
    } catch (err) {
      setError(err.message)
    }
  }

  async function onSubmitFile(e) {
    e.preventDefault()
    const input = document.getElementById('bulk-import-file')
    const file = input?.files?.[0]
    if (!file) {
      setError('Choose an .xlsx file first.')
      return
    }
    setBusy(true)
    setError('')
    setMessage(null)

    const fd = new FormData()
    fd.append('file', file)

    try {
      const res = await fetch('/api/admin/import-properties', {
        method: 'POST',
        body: fd,
        credentials: 'same-origin',
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(data.error || data.message || res.statusText || 'Upload failed')
      }

      const parts = [`Imported ${data.imported_count} listing(s).`]
      if (data.failed_count > 0) {
        parts.push(`${data.failed_count} row(s) failed — see detail below.`)
      }
      if (data.parseWarnings?.length) {
        parts.push(`Warnings: ${data.parseWarnings.join('; ')}`)
      }
      setMessage({
        summary: parts.join(' '),
        imported: data.imported ?? [],
        errors: data.errors ?? [],
      })
      input.value = ''
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6 flex items-center gap-3 flex-wrap">
          <Link href="/admin" className="text-gray-400 hover:text-gray-600 text-sm transition-colors">
            ← Admin
          </Link>
          <span className="text-gray-300">/</span>
          <span className="text-gray-600 text-sm font-medium">Import properties (Excel)</span>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 sm:p-8 space-y-6">
          <div>
            <h1 className="font-display font-bold text-2xl text-paddy-900">Bulk import from Excel</h1>
            <p className="text-gray-500 text-sm mt-1">
              Download the template below — it includes a <strong className="text-gray-700">How to fill</strong> tab plus a{' '}
              <strong className="text-gray-700">{TEMPLATE_SHEET_DATA}</strong> tab with headers, a completed sample row
              (row 2), and blank rows to add your own. Upload a filled <strong className="text-gray-700">.xlsx</strong>{' '}
              to create up to <strong>{MAX_IMPORT_ROWS}</strong> approved listings per batch. Locations must match the
              same State / District / Mandal lists as{' '}
              <span className="font-mono text-xs bg-gray-100 px-1 rounded">Admin → Add Property</span>.
            </p>
          </div>

          <section className="rounded-2xl border border-paddy-100 bg-paddy-50/80 p-4 text-sm text-gray-700 space-y-2">
            <p className="font-semibold text-paddy-900">How it works</p>
            <ol className="list-decimal pl-5 space-y-1 text-gray-600">
              <li>
                Open <strong>{TEMPLATE_SHEET_HELP}</strong> in the file for step-by-step rules, then edit{' '}
                <strong>{TEMPLATE_SHEET_DATA}</strong>.
              </li>
              <li>
                Row 2 in <strong>{TEMPLATE_SHEET_DATA}</strong> is a working example — delete that row before upload if
                you do not want it imported.
              </li>
              <li>Add one row per listing from row 3 downward; optional document/photo URLs (comma, pipe, or newline).</li>
              <li>
                Imports attach to your admin account as <span className="font-mono">seller_id</span> and publish as{' '}
                <strong>approved</strong> with <span className="font-mono">SDV‑YEAR‑NNN</span> IDs.
              </li>
            </ol>
          </section>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={downloadTemplate}
              className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl border border-paddy-200 text-paddy-800 hover:bg-paddy-50 font-medium text-sm transition-colors"
            >
              Download sample template (.xlsx)
            </button>
            <Link
              href="/admin/property/new"
              className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl text-gray-600 border border-gray-200 hover:bg-gray-50 font-medium text-sm transition-colors"
            >
              Manual add instead
            </Link>
          </div>

          <details className="text-sm text-gray-600 border border-gray-100 rounded-xl p-4">
            <summary className="cursor-pointer font-medium text-gray-800">Column reference</summary>
            <p className="mt-3 text-xs text-gray-500 mb-2">Keep the first-row headers from the template. Recognized columns:</p>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 font-mono text-xs">
              {TEMPLATE_DISPLAY_HEADERS.map(h => (
                <li key={h}>{h}</li>
              ))}
            </ul>
          </details>

          <form onSubmit={onSubmitFile} className="space-y-4 border-t border-gray-100 pt-6">
            <label htmlFor="bulk-import-file" className="block text-sm font-medium text-gray-700">
              Spreadsheet
            </label>
            <input
              id="bulk-import-file"
              name="file"
              type="file"
              accept=".xlsx,.xls"
              className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-paddy-700 file:text-white file:cursor-pointer"
            />

            <button
              type="submit"
              disabled={busy}
              className="bg-paddy-700 hover:bg-paddy-800 disabled:opacity-50 text-white font-medium px-6 py-2.5 rounded-xl text-sm transition-colors"
            >
              {busy ? 'Importing…' : 'Upload & import'}
            </button>
          </form>

          {error && (
            <div className="rounded-xl border border-red-100 bg-red-50 text-red-700 text-sm px-4 py-3">{error}</div>
          )}

          {message && typeof message === 'string' && (
            <div className="rounded-xl border border-green-100 bg-green-50 text-green-800 text-sm px-4 py-3">{message}</div>
          )}

          {message && typeof message === 'object' && (
            <div className="rounded-xl border border-gray-100 bg-gray-50 text-sm px-4 py-3 space-y-3">
              <p className="text-gray-800 font-medium">{message.summary}</p>
              {message.imported?.length > 0 && (
                <ul className="text-xs font-mono text-paddy-800 space-y-1">
                  {message.imported.map(r => (
                    <li key={r.id}>
                      Row {r.row}: {r.property_id} —{' '}
                      <Link className="text-paddy-600 underline" href={`/properties/${r.id}`}>
                        view
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
              {message.errors?.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-red-800 mb-1">Problems</p>
                  <ul className="text-xs text-red-700 space-y-1">
                    {message.errors.map(err => (
                      <li key={err.row}>
                        Row {err.row}: {Array.isArray(err.messages) ? err.messages.join('; ') : err.messages}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
