/**
 * Inline wordmark preview — avoids <img src="*.svg"> quirks; file at
 * /public/brand/sdv-farms-wordmark.svg stays the downloadable source.
 */
export default function SdvFarmsWordmark({ className = 'h-auto w-auto max-h-10 max-w-[min(100%,220px)]' }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 800 200"
      width={800}
      height={200}
      role="img"
      aria-label="SDV Farms wordmark"
      className={className}
    >
      <defs>
        <linearGradient id="sdv-brand-wm-fill" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#175239" />
          <stop offset="100%" stopColor="#2d6b3f" />
        </linearGradient>
      </defs>
      <rect width="800" height="200" fill="#ffffff" />
      <g transform="translate(24 24) scale(0.28)">
        <rect width="512" height="512" rx="112" fill="url(#sdv-brand-wm-fill)" />
        <g fill="none" stroke="#d4a017" strokeWidth="14" strokeLinecap="round" strokeLinejoin="round">
          <path d="M256 420V140" />
          <path d="M256 200c-28-40-72-52-100-32 28 24 52 56 100 72" />
          <path d="M256 260c28-40 72-52 100-32-28 24-52 56-100 72" />
        </g>
        <text x="256" y="118" textAnchor="middle" fill="#fbbf24" fontFamily="Georgia, serif" fontSize="56" fontWeight="bold">
          SDV
        </text>
      </g>
      <text x="200" y="118" fill="#175239" fontFamily="Georgia, Times New Roman, serif" fontSize="52" fontWeight="bold">
        SDV Farms
      </text>
      <text x="200" y="158" fill="#4a7c59" fontFamily="system-ui, sans-serif" fontSize="22" letterSpacing="0.15em">
        PHASE 1 · AGRICULTURAL LAND
      </text>
    </svg>
  )
}
