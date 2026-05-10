import Link from 'next/link'

export const metadata = {
  title: 'Business documentation — SDV Farms',
  description: 'User flows and brand overview for partners and stakeholders.',
}

export default function BusinessHubPage() {
  const cards = [
    {
      href: '/business/flows',
      title: 'Who uses the site & how',
      desc: 'Step-by-step flows for visitors, buyers, sellers, admin, and staff — the main reference for onboarding and pitches.',
      cta: 'Open user-flow guide',
    },
    {
      href: '/business/design',
      title: 'Brand & design overview',
      desc: 'Logo, colours, typography, and print-friendly one-pager for design handoffs.',
      cta: 'Open brand sheet',
    },
  ]
  return (
    <div className="min-h-screen bg-paddy-950 text-paddy-100">
      <header className="border-b border-white/10 bg-paddy-900/70 backdrop-blur-sm">
        <div className="max-w-2xl mx-auto px-6 py-5 flex items-center justify-between gap-4">
          <Link href="/" className="text-turmeric-400 hover:text-turmeric-300 text-sm font-medium">
            ← Home
          </Link>
        </div>
      </header>
      <main className="max-w-2xl mx-auto px-6 py-12">
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-white mb-2">Business documentation</h1>
        <p className="text-paddy-400 mb-10">Quick links for sharing how the product works and how it looks.</p>
        <ul className="space-y-4">
          {cards.map(c => (
            <li key={c.href}>
              <Link
                href={c.href}
                className="block rounded-2xl border border-white/10 bg-white/5 p-6 hover:border-turmeric-500/40 hover:bg-white/[0.07] transition-colors"
              >
                <h2 className="font-display text-xl text-turmeric-400 mb-2">{c.title}</h2>
                <p className="text-paddy-300 text-sm leading-relaxed mb-4">{c.desc}</p>
                <span className="text-turmeric-400 text-sm font-semibold">{c.cta} →</span>
              </Link>
            </li>
          ))}
        </ul>
      </main>
    </div>
  )
}
