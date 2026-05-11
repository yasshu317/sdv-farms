/** Worksheet ⇄ rectangular string matrix helpers for ExcelJS. */

/** @param {import('exceljs').Cell} cell */
export function cellToPlainString(cell) {
  if (!cell || cell.value === null || cell.value === undefined || cell.value === '') return ''

  const t = typeof cell.text === 'string' ? cell.text.trim() : ''
  if (t !== '') return t

  const v = cell.value
  if (typeof v === 'number' && Number.isFinite(v)) return String(v)
  if (typeof v === 'boolean') return v ? 'true' : 'false'
  if (typeof v === 'string') return v.trim()
  if (typeof v === 'object' && v !== null) {
    if ('richText' in v && Array.isArray(v.richText)) {
      return v.richText.map(p => String(p?.text ?? '')).join('').trim()
    }
    if ('text' in v && v.text != null) return String(v.text).trim()
    if ('result' in v && v.result != null && v.result !== '') return String(v.result).trim()
    if ('hyperlink' in v && typeof v.hyperlink === 'string') return v.hyperlink.trim()
    if ('formula' in v && v.result != null) return String(v.result).trim()
  }
  return String(v ?? '').trim()
}

/**
 * @param {import('exceljs').Worksheet} ws
 * @param {number} fallbackMinCols
 * @returns {string[][]}
 */
export function worksheetToMatrix(ws, fallbackMinCols = 1) {
  const matrix = []
  if (!ws) return matrix

  let maxCol = fallbackMinCols
  ws.eachRow({ includeEmpty: true }, row => {
    row.eachCell({ includeEmpty: true }, (_cell, colNumber) => {
      maxCol = Math.max(maxCol, colNumber)
    })
  })

  ws.eachRow({ includeEmpty: true }, row => {
    const line = []
    for (let c = 1; c <= maxCol; c++) {
      line.push(cellToPlainString(row.getCell(c)))
    }
    matrix.push(line)
  })

  return matrix
}
