import { createClient } from '../../../../lib/supabase-server'
import {
  MAX_IMPORT_ROWS,
  buildTemplateBuffer,
  parseImportBuffer,
  validateAndBuildPayload,
} from '../../../../lib/excelPropertyImport'

export const dynamic = 'force-dynamic'

async function requireAdminOnly() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user || user.user_metadata?.role !== 'admin') {
    return null
  }
  return { supabase, user }
}

/** Download an example .xlsx with correct column headings. */
export async function GET() {
  const ctx = await requireAdminOnly()
  if (!ctx) {
    return Response.json({ error: 'Forbidden — admin import is restricted to admins' }, { status: 403 })
  }

  const buf = await buildTemplateBuffer()
  return new Response(buf, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename="sdv-farms-property-import-template.xlsx"',
      'Cache-Control': 'no-store',
    },
  })
}

const ACCEPT_EXT = /\.xlsx$/i

export async function POST(req) {
  const ctx = await requireAdminOnly()
  if (!ctx) {
    return Response.json({ error: 'Forbidden — admin import is restricted to admins' }, { status: 403 })
  }

  let formData
  try {
    formData = await req.formData()
  } catch {
    return Response.json({ error: 'Expected multipart/form-data body' }, { status: 400 })
  }

  const file = formData.get('file')
  if (!file || typeof file.arrayBuffer !== 'function') {
    return Response.json({ error: 'Missing file field (use name \"file\")' }, { status: 400 })
  }

  const name = typeof file.name === 'string' ? file.name : 'upload.xlsx'
  if (!ACCEPT_EXT.test(name)) {
    return Response.json({ error: 'Upload must be .xlsx (Excel 2007+). Legacy .xls is not supported.' }, { status: 400 })
  }

  const ab = await file.arrayBuffer()
  const buffer = Buffer.from(ab)
  const maxBytes = 2 * 1024 * 1024
  if (buffer.length > maxBytes) {
    return Response.json({ error: 'File too large (max 2 MB)' }, { status: 400 })
  }

  let parsed
  try {
    parsed = await parseImportBuffer(buffer)
  } catch (e) {
    return Response.json({ error: `Could not read spreadsheet: ${e.message ?? String(e)}` }, { status: 400 })
  }

  if (parsed.loadError) {
    return Response.json({ error: parsed.loadError }, { status: 400 })
  }

  const { rows, rowNumbers, parseWarnings } = parsed
  if (!rows.length) {
    return Response.json(
      { error: 'No data rows found (check the header row and add at least one row below it)', parseWarnings },
      { status: 400 },
    )
  }
  if (rows.length !== rowNumbers.length) {
    return Response.json({ error: 'Internal parse error — row mismatch' }, { status: 500 })
  }

  if (rows.length > MAX_IMPORT_ROWS) {
    return Response.json({ error: `Too many rows (max ${MAX_IMPORT_ROWS})` }, { status: 400 })
  }

  const { count, error: countErr } = await ctx.supabase
    .from('seller_properties')
    .select('*', { count: 'exact', head: true })
    .not('property_id', 'is', null)

  if (countErr) {
    return Response.json({ error: countErr.message }, { status: 500 })
  }

  const year = new Date().getFullYear()
  let nextSuffix = (count ?? 0) + 1

  const imported = []
  const errors = []

  for (let i = 0; i < rows.length; i++) {
    const excelRow = rowNumbers[i]
    const validated = validateAndBuildPayload(rows[i], excelRow)
    if (!validated.ok) {
      errors.push({
        row: excelRow,
        messages: validated.errors,
      })
      continue
    }

    const propertyId = `SDV-${year}-${String(nextSuffix).padStart(3, '0')}`
    nextSuffix += 1

    const insertRow = {
      ...validated.payload,
      seller_id: ctx.user.id,
      property_id: propertyId,
      status: 'approved',
    }

    const { data, error: insertErr } = await ctx.supabase.from('seller_properties').insert(insertRow).select('id, property_id').maybeSingle()

    if (insertErr || !data) {
      errors.push({
        row: excelRow,
        messages: [insertErr?.message ?? 'Insert failed'],
      })
      nextSuffix -= 1
      continue
    }

    imported.push({ row: excelRow, id: data.id, property_id: data.property_id })
  }

  return Response.json({
    ok: errors.length === 0 || imported.length > 0,
    imported_count: imported.length,
    failed_count: errors.length,
    imported,
    errors,
    parseWarnings,
    max_rows: MAX_IMPORT_ROWS,
  })
}
