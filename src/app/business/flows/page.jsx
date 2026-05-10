import Link from 'next/link'

export const metadata = {
  title: 'How people use SDV Farms — user flows (detailed)',
  description:
    'Visitors, buyers, sellers, admin, and staff: what each route and dashboard tab does, statuses, and who can change what.',
}

function FlowSection({ id, title, badge, children }) {
  return (
    <section id={id} className="mb-14 scroll-mt-24">
      <div className="flex flex-wrap items-baseline gap-3 mb-4">
        <h2 className="font-display text-2xl sm:text-3xl text-white print:text-paddy-900">{title}</h2>
        {badge && (
          <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-turmeric-400 border border-turmeric-500/40 bg-turmeric-500/10 px-2.5 py-1 rounded-full">
            {badge}
          </span>
        )}
      </div>
      <div className="text-paddy-200 space-y-5 leading-relaxed print:text-paddy-800">{children}</div>
    </section>
  )
}

function SubHeading({ children }) {
  return <h3 className="font-display text-lg text-turmeric-400 mt-8 mb-2 print:text-paddy-800 first:mt-0">{children}</h3>
}

function Path({ children }) {
  return (
    <code className="text-turmeric-400/95 text-sm bg-paddy-900/80 print:bg-paddy-100 print:text-paddy-800 px-1.5 py-0.5 rounded-md">
      {children}
    </code>
  )
}

function BulletList({ items }) {
  return (
    <ul className="list-disc pl-5 space-y-1.5 marker:text-turmeric-500">
      {items.map((t, i) => (
        <li key={i}>{t}</li>
      ))}
    </ul>
  )
}

function Note({ children }) {
  return (
    <p className="text-sm text-paddy-500 border-l-2 border-turmeric-500/40 pl-4 py-1 print:text-paddy-700">{children}</p>
  )
}

export default function BusinessFlowsPage() {
  const toc = [
    ['#summary', 'At a glance'],
    ['#visitors-pages', 'Public pages (visitor)'],
    ['#buyers', 'Buyer account & dashboard'],
    ['#sellers', 'Seller account & listings'],
    ['#admin-staff-split', 'Admin vs staff'],
    ['#admin-hub', 'Operations hub (/admin)'],
    ['#statuses', 'Statuses & workflows'],
    ['#routing', 'Routing after login'],
  ]

  return (
    <div className="min-h-screen bg-paddy-950 text-paddy-100 selection:bg-turmeric-500/30">
      <header className="border-b border-white/10 bg-paddy-900/80 backdrop-blur-sm sticky top-0 z-10 print:static">
        <div className="max-w-3xl mx-auto px-6 py-4 flex flex-wrap items-center justify-between gap-3">
          <Link href="/business" className="text-turmeric-400 hover:text-turmeric-300 text-sm font-medium">
            ← Business docs
          </Link>
          <Link href="/" className="text-paddy-500 hover:text-paddy-300 text-sm">
            Website home
          </Link>
        </div>
      </header>

      <article className="max-w-3xl mx-auto px-6 py-12 sm:py-16 print:bg-white print:text-paddy-900">
        <header className="mb-10 print:mb-8">
          <p className="text-turmeric-400 text-xs font-semibold tracking-[0.2em] uppercase mb-3">
            Product guide — detailed
          </p>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-white print:text-paddy-900 mb-4 leading-tight">
            Business flows — what happens on each page
          </h1>
          <p className="text-paddy-400 text-lg max-w-2xl print:text-paddy-700">
            This expands the basics into <strong className="text-paddy-200 print:text-paddy-900">concrete URLs</strong>,{' '}
            <strong className="text-paddy-200 print:text-paddy-900">dashboard tabs</strong>,{' '}
            <strong className="text-paddy-200 print:text-paddy-900">permissions</strong>, and{' '}
            <strong className="text-paddy-200 print:text-paddy-900">typical workflows</strong>. Use it for internal
            training and partner hand-offs. Behaviour matches the shipped app — if the UI differs, trust the live product.
          </p>
        </header>

        <nav
          className="mb-12 p-4 rounded-2xl border border-white/10 bg-paddy-900/40 print:border-paddy-200 print:bg-paddy-50"
          aria-label="On this page"
        >
          <p className="text-xs font-semibold text-paddy-500 uppercase tracking-wider mb-3 print:text-paddy-600">
            Jump to section
          </p>
          <ul className="flex flex-col sm:flex-row sm:flex-wrap gap-x-5 gap-y-2 text-sm">
            {toc.map(([href, label]) => (
              <li key={href}>
                <a href={href} className="text-turmeric-400 hover:underline print:text-paddy-800">
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {/* ── Summary ───────────────────────────────────────────── */}
        <FlowSection id="summary" title="At a glance">
          <BulletList
            items={[
              <>
                <strong>Visitor</strong> — marketing home, filtered listings, property detail with book / enquire, land
                request form, Phase II services, language toggle, login/register.
              </>,
              <>
                <strong>Buyer</strong> — <Path>/dashboard</Path> tracks enquiries from listings, plot interests inside a layout,
                and “land requests” submitted via <Path>/buyer-request</Path>.
              </>,
              <>
                <strong>Seller</strong> — <Path>/seller</Path> manages up to <strong>two</strong> active (pending +
                approved) listings, uploads docs/photos; <strong>Appointments</strong> tab sees visits tied to their
                properties.
              </>,
              <>
                <strong>Admin</strong> — full ops at <Path>/admin</Path> plus <strong>Users</strong> tab and role changes
                via API.
              </>,
              <>
                <strong>Staff</strong> — same <Path>/admin</Path> shell; <strong>Users</strong> tab is hidden (no org-wide
                user management).
              </>,
            ]}
          />
        </FlowSection>

        {/* ── Visitors ───────────────────────────────────────────── */}
        <FlowSection id="visitors-pages" title="Public site (no login)" badge="Routes">
          <SubHeading>Home — <Path>/</Path></SubHeading>
          <BulletList
            items={[
              'Marketing story: approvals, phases, gallery, maps / contact anchors.',
              'Primary CTAs: browse listings (scroll + nav), Book a visit, Sign in.',
              '"List your land" in the navbar routes sellers into the seller registration shortcut.',
              'Assistant / chat launcher (if enabled) surfaces scripted FAQ links.',
            ]}
          />

          <SubHeading>Listings — <Path>/properties</Path></SubHeading>
          <BulletList
            items={[
              'Filter by state, soil, land type, acreage bands, optional price ceilings.',
              'Each card links to detail; optional quick actions like book visit flow from listings UI.',
              'Empty state prompts sellers to list land if inventory is thin.',
            ]}
          />

          <SubHeading>Property detail — <Path>/properties/[id]</Path></SubHeading>
          <BulletList
            items={[
              'Shows verified listing narrative, imagery, geography, booking affordances.',
              'Buyers/guests can trigger enquiry / WhatsApp CTAs depending on wiring.',
              'Signed-in sellers may see edit links reserved for admins on some shells — default buyer path stays read/browse.',
              'Site visits: appointment/booking UX when surfaced on page.',
            ]}
          />

          <SubHeading>Land request — <Path>/buyer-request</Path></SubHeading>
          <BulletList
            items={[
              'Structured form for desired location (state/district/etc.), soils, acre and budget bands, lifestyle fields (e.g. residence), notes.',
              'May be submitted anonymous or while signed in; logged-in buyers get rows tied to dashboard → Land Requests.',
              'Open requests expose <Path>/buyer-request/[id]/edit</Path> until operations close or match them.',
            ]}
          />

          <SubHeading>Services — <Path>/services</Path></SubHeading>
          <BulletList
            items={[
              'Marketing copy for Phase II land-owner services (fencing, borewell, drip irrigation, agronomy packs, saplings).',
              'Per-service enquiry/booking dialogs send records to `/api/service-booking` (ops triages inside admin Services tab).',
              'Phase III “notify me” capture for roadmap interest.',
            ]}
          />

          <SubHeading>Authentication — <Path>/auth/register</Path> · <Path>/auth/login</Path></SubHeading>
          <BulletList
            items={[
              'Register: Buyer vs Seller (or shortcut <Path>/auth/register?flow=seller</Path> skips buyer/seller picker).',
              'Seller path includes eligibility questionnaire blocking illegal/forbidden tenure types.',
              'Email verification when Supabase mandates it → callback routes user to correct home (/dashboard vs /seller vs /admin).',
              'Already signed-in browsers visiting auth URLs redirect to role home.',
            ]}
          />
        </FlowSection>

        {/* ── Buyers ─────────────────────────────────────────────── */}
        <FlowSection id="buyers" title="Buyer experience" badge="Dashboard">
          <p>
            After login, buyers land on <Path>/dashboard</Path>. The header shows name, buyer badge, quick link to browse
            properties, and sign-out.
          </p>

          <SubHeading>Summary strip</SubHeading>
          <p>Four headline counts: total enquiries, plot interests, contacted/visited-style progress, and pending enquiries.</p>

          <SubHeading>Tab: Overview</SubHeading>
          <BulletList
            items={[
              'Account card (name, email, optional phone).',
              'Quick actions: call hotline, jump to browse & book visit, post new land request.',
              'Journey tracker: Registered → Enquired → Site visit → Plot booked (derived from enquiry statuses).',
            ]}
          />

          <SubHeading>Tab: Enquiries</SubHeading>
          <BulletList
            items={[
              'Each row reflects a message / lead tied to a property when available.',
              'Statuses (set by operations): pending, contacted, visited, booked, closed — buyer read-only viewing.',
              'Deep link back to originating property.',
            ]}
          />

          <SubHeading>Tab: Plot interests</SubHeading>
          <BulletList
            items={[
              'Plots the buyer earmarked inside on-site layouts; shows numbering, sizing, indicative pricing.',
              'Status chips mirror enquiry-style pipeline handled by admins.',
            ]}
          />

          <SubHeading>Tab: Land requests</SubHeading>
          <BulletList
            items={[
              'Lists outbound “find me land” briefs captured on /buyer-request.',
              'Statuses include open · in_progress · matched · closed.',
              '"Edit" shortcut while status is still open pushes to `/buyer-request/[id]/edit`.',
            ]}
          />

          <Note>
            Operational changes to enquiry status, plot holds, appointments, buyer-request notes etc. occur in{' '}
            <Path>/admin</Path>.
          </Note>
        </FlowSection>

        {/* ── Sellers ────────────────────────────────────────────── */}
        <FlowSection id="sellers" title="Seller experience" badge="Seller hub">
          <SubHeading>Listings quota & statuses</SubHeading>
          <BulletList
            items={[
              <>Concurrent <strong>active</strong> listings (draft/pending plus live) capped at <strong>two</strong> — UI blocks “Add Property” when full.</>,
              'Seller sees pending vs approved counts plus aggregate listing views.',
              'Pending listings expose inline Edit → `/seller/property/[id]/edit`; approved listings deep-link to live public PDP in a new tab.',
            ]}
          />

          <SubHeading>Flows</SubHeading>
          <BulletList
            items={[
              <>Creation wizard <Path>/seller/property/new</Path> gathers cadastral/location/meta, uploads (photos/doc URLs), validations before submit.</>,
              'Once submitted listing sits in pending until admins approve or request changes.',
              'Email banners remind sellers when listings go live (server emails).',
            ]}
          />

          <SubHeading>Tab: Appointments</SubHeading>
          <BulletList
            items={[
              'Shows site visits booked against seller inventory — context for coordinating with prospects.',
              'May include reschedule/cancel UX depending on business rules surfaced in AppointmentPicker surfaces.',
            ]}
          />

          <Note>Sellers never access admin-only buyer PII aggregates; escalations route through ops.</Note>
        </FlowSection>

        {/* ── Admin vs Staff ───────────────────────────────────── */}
        <FlowSection id="admin-staff-split" title="Admin vs staff privileges">
          <p>
            Both roles authenticate into <Path>/admin</Path>. The difference is enforced client + server-side (
            <code className="text-turmeric-400">viewerRole</code>, <Path>/api/admin/users</Path>, proxies redirecting sellers
            away from `/admin`).
          </p>
          <BulletList
            items={[
              <><strong>Admin</strong>: sees every operations tab INCLUDING <strong>Users</strong> — list Supabase-linked accounts, tweak roles/metadata through controlled UI.</>,
              <><strong>Staff</strong>: identical pipeline except Users tab suppressed; focuses on enquiries, fulfillment, QA.</>,
              <><strong>Seller / buyer</strong> accounts hitting /admin are bounced to their dashboards.</>,
            ]}
          />
        </FlowSection>

        {/* ── Admin tabs detail ──────────────────────────────────── */}
        <FlowSection id="admin-hub" title="Operations hub — tab by tab" badge="/admin">
          <p className="text-paddy-300 print:text-paddy-700 text-sm">
            Tab order in the ops shell: <strong className="text-paddy-100 print:text-paddy-900">Enquiries</strong> →{' '}
            <strong className="text-paddy-100 print:text-paddy-900">Users</strong> (admin only) →{' '}
            <strong className="text-paddy-100 print:text-paddy-900">Plots</strong> →{' '}
            <strong className="text-paddy-100 print:text-paddy-900">Properties</strong> →{' '}
            <strong className="text-paddy-100 print:text-paddy-900">Appointments</strong> →{' '}
            <strong className="text-paddy-100 print:text-paddy-900">Requests</strong> →{' '}
            <strong className="text-paddy-100 print:text-paddy-900">Flags</strong> →{' '}
            <strong className="text-paddy-100 print:text-paddy-900">Services</strong>.
          </p>
          <SubHeading>Enquiries</SubHeading>
          <BulletList
            items={[
              'Operational inbox for property enquiries/leads landing from site forms & listing CTAs.',
              'Transition statuses: pending → contacted → visited → booked or closed.',
              'Search/filter helpers accelerate triage.',
            ]}
          />

          <SubHeading>Users (admin-only)</SubHeading>
          <BulletList
            items={[
              'Read-only catalogue of auth profiles with emails, roles (buyer/seller/admin/staff…), verification flags.',
              'PATCH workflows call `/api/admin/users` to elevate/demote roles carefully.',
              'Treat as security-sensitive surface — audit-worthy actions.',
            ]}
          />

          <SubHeading>Plots</SubHeading>
          <BulletList
            items={[
              'Layouts & inventory bookkeeping: numbering, sizing, ₹/sq yard, linkage to layouts.',
              'Plot lifecycle colours: available, reserved, sold.',
              <>Verification badges follow <strong>pending / in_review / verified / rejected / na</strong> style ops checklist.</>,
            ]}
          />

          <SubHeading>Properties (seller submissions)</SubHeading>
          <BulletList
            items={[
              'Review queues for pending uploads, edits, anomalies.',
              'Inline edit + Supabase-synced validators; admins can mint net-new inventory via `/admin/property/new`.',
              'Seller interest tags (urgent sale, ready, interested…) help prioritization.',
            ]}
          />

          <SubHeading>Appointments</SubHeading>
          <BulletList
            items={[
              'Operational calendar/table for site visits: pending confirmations, completions, cancellations, reschedule markers.',
              'Couples buyer intent with sellers + property context.',
            ]}
          />

          <SubHeading>Requests (buyer land requests)</SubHeading>
          <BulletList
            items={[
              'Open pipeline for “find me farmland” intents with geo + economic filters.',
              'Statuses mirror operations: open, in_progress, matched, closed.',
              'Internal annotations / staffing notes persisted per buyer request ID when enabled.',
            ]}
          />

          <SubHeading>Flags</SubHeading>
          <BulletList
            items={[
              'Administrative Feature-flag editor (ties to `/api/feature-flags`).',
              <>Example: toggling <strong>home_stats_bar</strong> governs navbar stats ribbon when deployed with matching seed JSON.</>,
              'Payload/metadata JSON editors guarded by validations (slug pattern).',
            ]}
          />

          <SubHeading>Services</SubHeading>
          <BulletList
            items={[
              'Operational review of inbound `/api/service-booking` payloads (fence/borewell/drip/etc.).',
              'Exports / refreshes analogous to enquiries table — staff confirm fulfillment or escalate.',
            ]}
          />
        </FlowSection>

        {/* ── Status tables ─────────────────────────────────────── */}
        <FlowSection id="statuses" title="Status vocabulary (quick reference)" badge="CRM">
          <div className="overflow-x-auto rounded-xl border border-white/10 print:border-paddy-200">
            <table className="w-full text-sm text-left border-collapse">
              <thead className="bg-paddy-900/80 text-turmeric-400 print:bg-paddy-100 print:text-paddy-800">
                <tr>
                  <th className="p-3 font-display">Area</th>
                  <th className="p-3 font-display">Statuses you will see</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {[
                  ['Property enquiries', 'pending · contacted · visited · booked · closed'],
                  ['Plots inventory', 'available · reserved · sold'],
                  ['Plot verification', 'pending · in_review · verified · rejected · na'],
                  ['Site appointments', 'pending · confirmed · cancelled · completed · no_show · rescheduled'],
                  ['Buyer land requests', 'open · in_progress · matched · closed'],
                  ['Buyer SDVF checkpoints (where used)', 'checking · approved · rejected'],
                  ['Listing lifecycle (seller view)', 'pending · approved (+ rejected/archived variants if enabled)'],
                ].map(([a, b]) => (
                  <tr key={a} className="bg-paddy-950/40 print:bg-white">
                    <td className="p-3 font-semibold text-white print:text-paddy-900">{a}</td>
                    <td className="p-3 text-paddy-200 print:text-paddy-700">{b}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Note>Exact labels in UI might use Title Case badges — meanings align with ops playbooks.</Note>
        </FlowSection>

        {/* ── Routing ───────────────────────────────────────────── */}
        <FlowSection id="routing" title="Default landing URLs" badge="Post-auth">
          <ul className="list-disc pl-5 space-y-2 marker:text-turmeric-500">
            <li>
              Buyer (or unspecified role fallback) → <Path>/dashboard</Path>
            </li>
            <li>
              Seller → <Path>/seller</Path>
            </li>
            <li>
              Admin or Staff → <Path>/admin</Path>
            </li>
          </ul>
          <p className="text-sm">
            Mirrors <code className="text-turmeric-400">homePathForRole</code> in auth callback + middleware redirects
            (buyer trying /seller irrelevant, seller trying /dashboard bounces via server guard, etc.).
          </p>
        </FlowSection>

        <section className="border-t border-white/10 pt-10 mt-12 print:border-paddy-200">
          <h2 className="font-display text-xl text-turmeric-400 mb-3 print:text-paddy-800">Sharing & exports</h2>
          <ul className="text-paddy-300 text-sm space-y-2 print:text-paddy-700">
            <li>
              <strong>Interactive:</strong>{' '}
              <Link href="/business/flows" className="text-turmeric-400 hover:underline">
                /business/flows
              </Link>{' '}
              — always freshest.
            </li>
            <li>
              <strong>Portable HTML snapshot:</strong> <Path>/business-user-flows.html</Path>
            </li>
          </ul>
        </section>

        <footer className="mt-12 pt-8 border-t border-white/10 text-center text-paddy-500 text-sm print:text-paddy-600 print:border-paddy-200">
          <p>SDV Farms — detailed flow reference · update when shipped surfaces change materially.</p>
        </footer>
      </article>
    </div>
  )
}
