import Link from 'next/link'

import SdvFarmsWordmark from '../../../components/brand/SdvFarmsWordmark.jsx'

export const metadata = {
  title: 'Business & brand overview — SDV Farms',
  description:
    'Shareable one-page overview: positioning, offerings, visual identity, and contact. For partners, investors, and collaborators.',
}

/**
 * Public business / design document — view on the web, print, or save as PDF from the browser.
 */
export default function BusinessDesignPage() {
  return (
    <div className="min-h-screen bg-paddy-950 text-paddy-100 selection:bg-turmeric-500/30">
      <header className="border-b border-white/10 bg-paddy-900/80 backdrop-blur-sm sticky top-0 z-10 print:static print:border-paddy-200">
        <div className="max-w-3xl mx-auto px-6 py-4 flex flex-wrap items-center justify-between gap-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-turmeric-400 hover:text-turmeric-300 text-sm font-medium transition-colors"
          >
            <span aria-hidden>🌾</span>
            Back to website
          </Link>
          <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm">
            <Link href="/business" className="text-paddy-400 hover:text-turmeric-400 transition-colors">
              All business docs
            </Link>
            <Link href="/business/flows" className="text-paddy-400 hover:text-turmeric-400 transition-colors">
              User flows →
            </Link>
            <span className="text-paddy-500 uppercase tracking-widest hidden sm:inline">Brand</span>
          </div>
        </div>
      </header>

      <article className="max-w-3xl mx-auto px-6 py-12 sm:py-16 print:text-paddy-950 print:bg-white">
        <header className="mb-14 text-center print:mb-10">
          <p className="text-turmeric-400 text-xs font-semibold tracking-[0.2em] uppercase mb-4">
            SDV Farms · Phase 1
          </p>
          <h1 className="font-display text-4xl sm:text-5xl font-bold text-white print:text-paddy-900 mb-4 leading-tight">
            Business &amp; brand overview
          </h1>
          <p className="text-paddy-400 text-lg max-w-xl mx-auto print:text-paddy-700">
            One-page snapshot for introductions, pitches, and design handoffs — save as PDF from your browser anytime.
          </p>
          <div className="mt-8 mx-auto max-w-[14rem] h-1 rounded-full bg-gradient-to-r from-turmeric-600/30 via-turmeric-400 to-turmeric-600/30 print:bg-turmeric-500" />
        </header>

        <section className="mb-12">
          <h2 className="font-display text-2xl text-turmeric-400 mb-4 print:text-paddy-800">Company snapshot</h2>
          <ul className="space-y-3 text-paddy-200 leading-relaxed print:text-paddy-800">
            <li>
              <strong className="text-white print:text-paddy-900">What we do:</strong>{' '}
              Government-aligned agricultural land marketplace and services — Phase 1 focuses on verified listings,
              enquiries, site visits, and trusted transactions across Telangana, Andhra Pradesh &amp; Karnataka.
            </li>
            <li>
              <strong className="text-white print:text-paddy-900">Who we serve:</strong>{' '}
              Buyers seeking clear-title farmland; sellers listing legally eligible land for free;
              landowners needing fencing, borewell, drip irrigation, plant supply, and allied services (Phase II).
            </li>
            <li>
              <strong className="text-white print:text-paddy-900">Promise:</strong>{' '}
              Transparent verification, humane support (phone &amp; WhatsApp), and a digital experience that complements
              in-person visits.
            </li>
          </ul>
        </section>

        <section className="mb-12">
          <h2 className="font-display text-2xl text-turmeric-400 mb-4 print:text-paddy-800">Brand voice</h2>
          <p className="text-paddy-200 leading-relaxed mb-4 print:text-paddy-800">
            Calm expertise with warmth — we speak plainly about legal safety and returns without hype.
            Telugu and English parity matters; typography supports both (Noto Sans Telugu + Inter body, Playfair for display headings).
          </p>
          <p className="text-paddy-300 text-sm border-l-2 border-turmeric-500 pl-4 italic print:text-paddy-700">
            &ldquo;Secure land • Earn income • Build generational wealth.&rdquo;
          </p>
        </section>

        <section className="mb-12">
          <h2 className="font-display text-2xl text-turmeric-400 mb-4 print:text-paddy-800">Visual identity</h2>
          <div className="grid sm:grid-cols-2 gap-4 mb-6">
            <div className="rounded-2xl border border-white/10 bg-paddy-900/60 p-4 print:border-paddy-200 print:bg-paddy-50">
              <p className="text-xs font-semibold text-turmeric-400 uppercase tracking-wider mb-3">Logo</p>
              <div className="flex items-center gap-4 flex-wrap">
                <img src="/brand/sdv-farms-mark.svg" alt="SDV Farms mark" className="h-16 w-16 rounded-xl shadow-lg" />
                <SdvFarmsWordmark className="h-10 max-w-[min(100%,220px)] w-auto" />
              </div>
              <p className="text-paddy-500 text-xs mt-3">
                Use mark for app icons and favicons; wordmark on light backgrounds. Assets live in{' '}
                <code className="text-turmeric-400/90">/public/brand/</code>.
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-paddy-900/60 p-4 print:border-paddy-200 print:bg-paddy-50">
              <p className="text-xs font-semibold text-turmeric-400 uppercase tracking-wider mb-3">Accent line</p>
              <p className="text-paddy-300 text-sm mb-3 print:text-paddy-700">
                A short gold gradient bar under the &ldquo;SDV Farms&rdquo; wordmark unifies headers site-wide.
              </p>
              <div className="h-1 max-w-[10rem] rounded-full bg-gradient-to-r from-turmeric-600/30 via-turmeric-400 to-turmeric-600/30" />
            </div>
          </div>

          <h3 className="text-sm font-semibold text-paddy-300 uppercase tracking-wider mb-3 print:text-paddy-600">Core colours</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            {[
              ['Paddy 950', '#071709', 'bg-paddy-950'],
              ['Paddy 600', '#286d2f', 'bg-paddy-600'],
              ['Turmeric 400', '#f1c929', 'bg-turmeric-400 text-paddy-950'],
              ['Turmeric / gold CTA', '#d4a017', 'bg-turmeric-500'],
            ].map(([name, hex, c]) => (
              <div key={name} className="rounded-xl overflow-hidden border border-white/10 print:border-paddy-200">
                <div className={`h-14 ${c}`} />
                <div className="p-2 bg-paddy-900/90 print:bg-white">
                  <p className="font-medium text-paddy-100 print:text-paddy-900">{name}</p>
                  <p className="text-paddy-500 font-mono print:text-paddy-600">{hex}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-12">
          <h2 className="font-display text-2xl text-turmeric-400 mb-4 print:text-paddy-800">Digital touchpoints</h2>
          <ul className="space-y-2 text-paddy-200 print:text-paddy-800">
            <li>
              Website:{' '}
              <a href="https://sdv-farms.vercel.app" className="text-turmeric-400 hover:underline">
                sdv-farms.vercel.app
              </a>{' '}
              (production deployment)
            </li>
            <li>Primary CTA paths: Browse listings (/properties), Book a visit, Land request, List your land (seller).</li>
            <li>Optional shareable artefact: static HTML sibling at <code className="text-turmeric-400/90">/business-design-guide.html</code> for email attachments.</li>
          </ul>
        </section>

        <section className="mb-12">
          <h2 className="font-display text-2xl text-turmeric-400 mb-4 print:text-paddy-800">Contact &amp; trust</h2>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 space-y-2 text-paddy-100 print:bg-paddy-50 print:border-paddy-200 print:text-paddy-900">
            <p>
              <strong>Phone / WhatsApp:</strong> +91 77803 12525
            </p>
            <p>
              <strong>Email:</strong> info@sdvfarms.in
            </p>
            <p>
              <strong>Office:</strong> Hyderabad, Telangana, India · Mon–Sat, 9:00 AM – 6:00 PM
            </p>
          </div>
        </section>

        <footer className="border-t border-white/10 pt-8 text-center text-paddy-500 text-sm print:text-paddy-600 print:border-paddy-200">
          <p>© SDV Farms. This document reflects Phase 1 positioning and may be updated as the product evolves.</p>
          <p className="mt-2 text-xs">Print or &ldquo;Save as PDF&rdquo; from your browser menu to share offline.</p>
        </footer>
      </article>
    </div>
  )
}
