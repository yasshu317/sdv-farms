'use client'
import { useState } from 'react'

function FilterSection({ title, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="border-b border-white/10 pb-4 mb-4 last:border-0 last:pb-0 last:mb-0">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="flex items-center justify-between w-full text-white/80 text-sm font-medium mb-3 hover:text-white transition-colors"
      >
        {title}
        <span className={`transition-transform ${open ? 'rotate-180' : ''}`}>▾</span>
      </button>
      {open && children}
    </div>
  )
}

export default function FilterPanel({ filters, onChange, onReset, className = '' }) {
  return (
    <aside className={`bg-white/5 border border-white/10 rounded-2xl p-5 ${className}`}>
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-white font-semibold text-sm">Filters</h3>
        <button
          type="button"
          onClick={onReset}
          className="text-turmeric-400 hover:text-turmeric-300 text-xs transition-colors"
        >
          Reset all
        </button>
      </div>

      {filters.map((section) => (
        <FilterSection key={section.id} title={section.label} defaultOpen={section.defaultOpen !== false}>
          {section.type === 'select' && (
            <select
              value={section.value || ''}
              onChange={e => onChange(section.id, e.target.value)}
              className="w-full bg-white/10 border border-white/15 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-turmeric-400 transition-colors"
            >
              <option value="">All</option>
              {section.options.map(opt => (
                <option key={opt.value} value={opt.value} className="bg-gray-800">{opt.label}</option>
              ))}
            </select>
          )}

          {section.type === 'checkboxes' && (
            <div className="space-y-2">
              {section.options.map(opt => (
                <label key={opt.value} className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={section.value?.includes(opt.value) || false}
                    onChange={e => {
                      const current = section.value || []
                      onChange(section.id, e.target.checked
                        ? [...current, opt.value]
                        : current.filter(v => v !== opt.value)
                      )
                    }}
                    className="accent-turmeric-500"
                  />
                  <span className="text-white/70 group-hover:text-white text-sm transition-colors">{opt.label}</span>
                </label>
              ))}
            </div>
          )}

          {section.type === 'range' && (
            <div className="flex gap-2">
              <input
                type="number"
                placeholder={section.minPlaceholder || 'Min'}
                value={section.value?.min || ''}
                onChange={e => onChange(section.id, { ...section.value, min: e.target.value })}
                className="w-full bg-white/10 border border-white/15 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-turmeric-400 transition-colors"
              />
              <input
                type="number"
                placeholder={section.maxPlaceholder || 'Max'}
                value={section.value?.max || ''}
                onChange={e => onChange(section.id, { ...section.value, max: e.target.value })}
                className="w-full bg-white/10 border border-white/15 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-turmeric-400 transition-colors"
              />
            </div>
          )}
        </FilterSection>
      ))}
    </aside>
  )
}
