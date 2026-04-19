const CONFIG = {
  pending:       { label: 'Pending Review', bg: 'bg-yellow-500/15', text: 'text-yellow-300', dot: 'bg-yellow-400' },
  approved:      { label: 'Approved',       bg: 'bg-paddy-500/15',  text: 'text-paddy-300',  dot: 'bg-paddy-400' },
  rejected:      { label: 'Rejected',       bg: 'bg-red-500/15',    text: 'text-red-300',    dot: 'bg-red-400' },
  sold:          { label: 'Sold',           bg: 'bg-purple-500/15', text: 'text-purple-300', dot: 'bg-purple-400' },
  open:          { label: 'Open',           bg: 'bg-blue-500/15',   text: 'text-blue-300',   dot: 'bg-blue-400' },
  matched:       { label: 'Matched',        bg: 'bg-paddy-500/15',  text: 'text-paddy-300',  dot: 'bg-paddy-400' },
  closed:        { label: 'Closed',         bg: 'bg-white/10',      text: 'text-white/50',   dot: 'bg-white/30' },
  confirmed:     { label: 'Confirmed',      bg: 'bg-paddy-500/15',  text: 'text-paddy-300',  dot: 'bg-paddy-400' },
  cancelled:     { label: 'Cancelled',      bg: 'bg-red-500/15',    text: 'text-red-300',    dot: 'bg-red-400' },
  not_required:  { label: 'N/A',            bg: 'bg-white/8',       text: 'text-white/40',   dot: 'bg-white/20' },
}

export default function StatusBadge({ status, className = '' }) {
  const cfg = CONFIG[status] ?? { label: status, bg: 'bg-white/10', text: 'text-white/60', dot: 'bg-white/30' }
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${cfg.bg} ${cfg.text} ${className}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  )
}
