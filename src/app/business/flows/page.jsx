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
    ['#changelog', 'Recent changes'],
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
                <strong>Visitor</strong> — marketing home (incl. Sample Documents section), filtered listings with
                state/district/mandal cascade, property detail with book/enquire/save, land request form, Phase II
                services (incl. Fertilizers &amp; Nutrition), language toggle, login/register.{' '}
                <strong>Landowners</strong> can submit property details without an account via the shareable{' '}
                <Path>/list-your-land</Path> form — submissions land in the Admin <strong>Leads</strong> tab.
              </>,
              <>
                <strong>Buyer</strong> — <Path>/dashboard</Path> tracks enquiries, plot interests, and land requests.
                On <Path>/properties</Path> buyers use <strong>Book visit</strong>, <strong>shortlist</strong> (saved listings), and <strong>Enquire</strong> (WhatsApp); saved count is visible to the seller.
              </>,
              <>
                <strong>Seller</strong> — <Path>/seller</Path> manages up to <strong>two</strong> active listings;
                property form captures <strong>Relation to Owner</strong> and <strong>Sale Intent</strong>; each card
                shows an <strong>Interested</strong> count from saved buyers. Sellers can also visit <Path>/dashboard</Path>
                to browse and enquire as a buyer — both roles are available to the same account.
              </>,
              <>
                <strong>Admin</strong> — full ops at <Path>/admin</Path> (11 tabs): Enquiries, Users, Plots, Properties,
                Appointments, Requests, <strong>Leads</strong> (public listing submissions), Flags, Services, Feedback, Testimonials.
                Role changes via API. Sitewide <strong>maintenance mode</strong> is controlled by a feature flag.
              </>,
              <>
                <strong>Staff</strong> — same <Path>/admin</Path> shell; <strong>Users</strong> tab hidden.
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
              <>
                Below the hero, a public <strong>stats strip</strong> (five KPIs + optional enquiry chip) pulls from{' '}
                <Path>/api/platform-stats</Path> (<code className="text-turmeric-400">public.public_marketing_stats()</code>). Styling follows the dark paddy + turmeric homepage palette; toggle{' '}
                <code className="text-turmeric-400">home_stats_bar</code> via Feature Flags when needed.
              </>,
              'Sample Documents section: Sale Deed, Lease Agreement, Pahani guide, Registration process — available in English and Telugu with a WhatsApp CTA.',
              'Primary CTAs: browse listings (scroll + nav), Book a visit, Sign in.',
              '"List your land" in the navbar routes sellers into the seller registration shortcut.',
              'Assistant / chat launcher (if enabled) surfaces scripted FAQ links.',
              <>
                <strong>Signed-in visitors</strong> hitting <Path>/</Path> are redirected to their <strong>role hub</strong> (
                <Path>/dashboard</Path>, <Path>/seller</Path>, or <Path>/admin</Path>). Use <Path>/?stay=1</Path> (
                <code className="text-turmeric-400">browse=1</code> also accepted) to view the full marketing homepage while logged in.
              </>,
            ]}
          />

          <SubHeading>Listings — <Path>/properties</Path></SubHeading>
          <BulletList
            items={[
              'Filter by state, then cascade to district and mandal; also soil type, land type, acreage bands, optional price ceiling.',
              <>
                Each card: <strong>Book visit</strong> (opens listing with booking affordance), <strong>shortlist</strong>{' '}
                (saved on the buyer&apos;s land shortlist, up to 8; prompts sign-in when logged out; pre-login queue persists where implemented),{' '}
                and <strong>Enquire</strong> (opens WhatsApp with listing context). Copy is label-led (no emoji icons).
              </>,
              'Road-access listings show a small “Road” chip on the card image.',
              'Empty state prompts sellers to list land if inventory is thin.',
            ]}
          />

          <SubHeading>Property detail — <Path>/properties/[id]</Path></SubHeading>
          <BulletList
            items={[
              'Shows verified listing narrative, imagery, geography, booking affordances.',
              'Buyers/guests can trigger enquiry / WhatsApp CTAs depending on wiring.',
              'Signed-in sellers may see edit links reserved for admins on some shells — default buyer path stays read/browse.',
              'Site visits: appointment/booking UX when surfaced on page. If no suitable slot is found, a “Notify Me” fallback lets the buyer submit their email; ops is alerted to contact within 48 hours.',
              'Shortlist controls on detail page mirror the browse grid — text labels (“Add to shortlist” / “On shortlist”); buyers can save up to 8 listings and manage them under Dashboard → Land shortlist.',
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
              'Marketing copy for Phase II land-owner services: fencing, borewell, drip irrigation, agronomy packs, saplings, and <strong>Fertilizers &amp; Nutrition</strong> (6 services total).',
              'Per-service enquiry/booking dialogs send records to `/api/service-booking` (ops triages inside admin Services tab).',
              'Phase III “notify me” capture for roadmap interest.',
              <>
                <strong>Signed-in buyers</strong> (role other than seller / admin / staff) who open{' '}
                <Path>/services</Path> are redirected to{' '}
                <Path>/dashboard?services=1</Path> — the dashboard scrolls to the embedded Phase II services panel (same bookings, prefilled profile where available). Sellers, admins, staff, and anonymous visitors still see the public <Path>/services</Path> page.
              </>,
            ]}
          />

          <SubHeading>Authentication — <Path>/auth/register</Path> · <Path>/auth/login</Path></SubHeading>
          <BulletList
            items={[
              'Register: Buyer vs Seller (or shortcut /auth/register?flow=seller skips buyer/seller picker).',
              'Seller path includes eligibility questionnaire blocking illegal/forbidden tenure types.',
              'Email verification when Supabase mandates it → callback routes user to correct home (/dashboard vs /seller vs /admin).',
              'Already signed-in browsers visiting auth URLs redirect to role home.',
            ]}
          />

          <SubHeading>Public listing submission — <Path>/list-your-land</Path></SubHeading>
          <BulletList
            items={[
              <>
                <strong>No login required</strong> — any landowner or farmer can fill the 2-step form and submit.
                Shareable URL: <code className="text-turmeric-400">sdv-farms.vercel.app/list-your-land</code> (can be sent via WhatsApp, printed on flyers, posted on social).
              </>,
              <>
                <strong>Step 1 — Contact &amp; Location:</strong> submitter first name, last name, mobile, email (optional),
                State → District → Mandal cascade, village, location notes (survey no., map link).
              </>,
              <>
                <strong>Step 2 — Land &amp; Farmer details:</strong> farmer name as on document, farmer phone (optional),
                land type, soil type, area (acres), expected price (₹/acre), selling intent, road access flag,
                document uploads (Pahani / ROR-1B etc.) and site photos (both optional).
              </>,
              <>
                On submit, the record lands in the <strong>Admin → Leads</strong> tab. SDV staff can mark it as{' '}
                <em>new → contacted → converted / rejected</em> and add internal notes. A successful submission shows
                a thank-you screen with a WhatsApp CTA and a link to browse properties.
              </>,
              <>
                <strong>Nav &quot;List your land&quot; link</strong> now points to <Path>/list-your-land</Path> for
                anonymous visitors and buyers — no forced registration. Sellers and admins who already have accounts
                continue to use their respective hubs.
              </>,
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
              'Seller sees pending vs approved counts, aggregate views, and total Interested count (from saved buyers).',
              'Pending listings expose inline Edit → `/seller/property/[id]/edit`; approved listings deep-link to live public PDP in a new tab.',
            ]}
          />

          <SubHeading>Flows</SubHeading>
          <BulletList
            items={[
              <>Creation wizard <Path>/seller/property/new</Path> gathers cadastral/location/meta, uploads (photos/doc URLs), validations before submit. Step 0 now captures <strong>Relation to Owner</strong> (Self/Wife/Son/Daughter etc.); Step 1 captures <strong>Sale Intent</strong> (Urgent Sale · Ready to Sell · Interested/Open).</>,
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
            Tab order in the ops shell: <strong className="text-paddy-100 print:text-paddy-900">Enquiries</strong>{' '}
            &rarr;{' '}
            <strong className="text-paddy-100 print:text-paddy-900">Users</strong> (admin only){' '}
            &rarr;{' '}
            <strong className="text-paddy-100 print:text-paddy-900">Plots</strong>{' '}
            &rarr;{' '}
            <strong className="text-paddy-100 print:text-paddy-900">Properties</strong>{' '}
            &rarr;{' '}
            <strong className="text-paddy-100 print:text-paddy-900">Appointments</strong>{' '}
            &rarr;{' '}
            <strong className="text-paddy-100 print:text-paddy-900">Requests</strong>{' '}
            &rarr;{' '}
            <strong className="text-paddy-100 print:text-paddy-900">Leads</strong>{' '}
            &rarr;{' '}
            <strong className="text-paddy-100 print:text-paddy-900">Flags</strong>{' '}
            &rarr;{' '}
            <strong className="text-paddy-100 print:text-paddy-900">Services</strong>{' '}
            &rarr;{' '}
            <strong className="text-paddy-100 print:text-paddy-900">Feedback</strong>{' '}
            &rarr;{' '}
            <strong className="text-paddy-100 print:text-paddy-900">Testimonials</strong>.
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
              <>
                Admins only: bulk-create approved listings from a spreadsheet — <Path>/admin/property/import</Path> (downloads a template with a sample row; uploads <strong className="text-paddy-200 print:text-paddy-900">.xlsx</strong> capped by product limits — same location validation as manual Add Property).
              </>,
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

          <SubHeading>Leads (public listing submissions)</SubHeading>
          <BulletList
            items={[
              <>
                Inbox for submissions from <Path>/list-your-land</Path> (no-login public form). Orange badge shows count of <em>new</em> (unprocessed) leads.
              </>,
              'Columns: submitted date, submitter name, mobile, state/district, area, status, uploaded docs/photos.',
              'Status lifecycle: new → contacted → converted → rejected. Staff update inline.',
              'Admin notes field per lead (editable inline — save button appears when draft differs from stored value).',
              <>
                <strong>Converting a lead:</strong> after calling the landowner, mark as <em>contacted</em>; if they
                agree to list, create the property in the Properties tab or invite them to register as a seller, then mark as <em>converted</em>.
              </>,
              'DB table: listing_submissions (phase16 migration). RLS: anon insert only; admin/staff read + update.',
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
              'Operational review of inbound `/api/service-booking` payloads for all 6 Phase II services (fencing, borewell, drip, farming plan, plants, fertilizers/nutrition).',
              'Exports / refreshes analogous to enquiries table — staff confirm fulfillment or escalate.',
            ]}
          />

          <SubHeading>Feedback</SubHeading>
          <BulletList
            items={[
              'Businesses submit feedback via POST /api/feedback (public endpoint — no auth required).',
              <>Fields: Business Name, Contact Name, Email, Phone, Feedback Type (general / suggestion / complaint / partnership / other), Message, optional 1–5 star rating.</>,
              'Admin/staff review in this tab: change status (new → read → replied → archived) and add internal notes.',
              'Unread feedback count shown as an orange badge on the Feedback tab button.',
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
                  ['Listing leads (public /list-your-land)', 'new · contacted · converted · rejected'],
                  ['Business feedback', 'new · read · replied · archived'],
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
              Seller → <Path>/seller</Path> <em>(default landing; seller may also navigate to <Path>/dashboard</Path>
              to use buyer features — no redirect blocks them)</em>
            </li>
            <li>
              Admin or Staff → <Path>/admin</Path>
            </li>
          </ul>
          <p className="text-sm">
            Mirrors <code className="text-turmeric-400">homePathForRole</code> in login and auth callback (<code className="text-turmeric-400">safeInternalNextPath</code>{' '}
            wins when <Path>?next=</Path> is set).
          </p>
          <p className="text-sm">
            <strong>Marketing home vs hub:</strong> visiting <Path>/</Path> while signed in sends users to their hub unless they use{' '}
            <Path>/?stay=1</Path> (or <code className="text-turmeric-400">browse=1</code>). Navbar / SiteHeader brand links point to the role hub when a session exists so “home” for signed-in users is operational, not the brochure page.
          </p>
          <p className="text-sm">
            Sellers see both
            &quot;My Listings&quot; and &quot;Browse &amp; Buy&quot; links in the nav; a contextual banner on <Path>/dashboard</Path>
            confirms they are in buyer mode and links back to their listings.
          </p>
        </FlowSection>

        {/* ── Changelog ─────────────────────────── */}
        <FlowSection id="changelog" title="Recent changes" badge="v Phase 11–13">
          <BulletList
            items={[
              <>
                <strong>Public listing submission form (Phase 16)</strong> &mdash; New <Path>/list-your-land</Path> page (no
                login required). Landowners fill a 2-step form (contact + location &rarr; land details + docs);
                submissions land in the new <strong>Admin &rarr; Leads</strong> tab with status workflow
                new &rarr; contacted &rarr; converted / rejected. Nav &ldquo;List your land&rdquo; link now routes to this form.
                Requires DB migration{' '}
                <code className="text-turmeric-400">phase16_listing_submissions.sql</code>.
              </>,
              <>
                <strong>IA — hubs &amp; marketing home</strong> — Signed-in visits to <Path>/</Path> redirect to{' '}
                <Path>/dashboard</Path>, <Path>/seller</Path>, or <Path>/admin</Path> per role unless <Path>/?stay=1</Path>. Brand links in Navbar / SiteHeader target the hub when logged in.
              </>,
              <>
                <strong>Buyer services path</strong> — Signed-in buyers navigating to <Path>/services</Path> redirect to{' '}
                <Path>/dashboard?services=1</Path> for the embedded Phase II panel; anon, sellers, admin, staff still use public <Path>/services</Path>.
              </>,
              <>
                <strong>Home KPI strip — product styling</strong> — Stats bar uses deep paddy + turmeric accents aligned with homepage / listings (not neutral gray slab); enquiries footnote readable at turmeric tone.
              </>,
              <>
                <strong>Listing grid &amp; PDP CTAs — text-led</strong> — Book visit / shortlist / Enquire use label typography and borders consistent with theme (no sparkle or heart glyphs in buttons).
              </>,
              <>
                <strong>Sample Documents section</strong> — new homepage section between Contact and Location with 4 reference
                document cards (Sale Deed, Lease Agreement, Pahani/Adangal guide, Registration process); EN + Telugu.
              </>,
              <>
                <strong>District &amp; Mandal filters</strong> — Browse Properties now cascades: State → District → Mandal.
                Selecting a state reveals its districts; selecting a district reveals its mandals.
              </>,
              <>
                <strong>Wishlist on listing cards</strong> — property cards on <Path>/properties</Path> have{' '}
                <strong>Add to shortlist</strong> / <strong>On shortlist</strong> actions (plus Book visit &amp; Enquire). Buyers can save up to 8 listings for the land shortlist. Saving prompts login when anonymous (with optional pre-login queue).
              </>,
              <>
                <strong>Seller “Interested” count</strong> — seller dashboard shows per-listing and total Interested
                counts sourced from <code className="text-turmeric-400">buyer_wishlist</code>.
              </>,
              <>
                <strong>Relation to Owner field</strong> — SellerPropertyForm Step 0 now has a “Your Relation to Owner”
                select (Self, Wife, Daughter, Son, Mother, Father, G.Mother, G.Father). DB: <code className="text-turmeric-400">owner_relation</code> column added to <code className="text-turmeric-400">seller_properties</code>.
              </>,
              <>
                <strong>Sale Intent field</strong> — SellerPropertyForm Step 1 toggle for Urgent Sale / Ready to Sell /
                Interested (maps to existing <code className="text-turmeric-400">seller_interest</code> column).
              </>,
              <>
                <strong>Appointment “Notify Me”</strong> — after selecting a date in <code className="text-turmeric-400">AppointmentPicker</code>, a
                “Can’t find a slot? Notify me” link appears. Buyer submits name + email; ops receives an alert email
                and contacts within 48 hours.
              </>,
              <>
                <strong>Fertilizers &amp; Nutrition service</strong> — 6th Phase II service card added to <Path>/services</Path>
                (key: <code className="text-turmeric-400">fertilizers</code>), wired to service booking API. EN + Telugu content.
              </>,
              <>
                <strong>Admin Feedback tab</strong> — 9th tab in <Path>/admin</Path>. Businesses POST to
                <code className="text-turmeric-400">/api/feedback</code> (public, no auth); admin/staff review, update status, add
                internal notes. Orange badge shows unread count. Public submission UI at <Path>/feedback</Path>.
              </>,
              <>
                <strong>Maintenance mode flag</strong> — <code className="text-turmeric-400">maintenance_mode</code> feature flag.
                When enabled, non-admin users see a full-screen maintenance page;
                admin/staff users see a dismissible banner but retain full access.
              </>,
              <>
                <strong>Gemini AI chatbot</strong> — chat widget falls back to Gemini 2.0 for questions not covered by
                local FAQ rules. Bot history is forwarded to the API for multi-turn context. Typing indicator shown
                while AI responds. Requires <code className="text-turmeric-400">GEMINI_API_KEY</code> env var.
              </>,
              <>
                <strong>Dynamic Testimonials &amp; Wins</strong> — admin Testimonials tab (10th) lets ops create, edit,
                approve, and reorder testimonial cards and win stats with optional photo upload.
                Approved entries surface on the homepage via <Path>/api/testimonials</Path> (cached 2 min).
              </>,
              <>
                <strong>Dual buyer / seller role</strong> — sellers are no longer redirected away from <Path>/dashboard</Path>.
                Nav shows both "My Listings" and "Browse &amp; Buy". A contextual banner on the buyer dashboard
                reminds sellers which mode they are in. No DB schema change required.
              </>,
            ]}
          />
        </FlowSection>

        <section className="border-t border-white/10 pt-10 mt-12 print:border-paddy-200">
          <h2 className="font-display text-xl text-turmeric-400 mb-3 print:text-paddy-800">Sharing &amp; exports</h2>
          <ul className="text-paddy-300 text-sm space-y-2 print:text-paddy-700">
            <li>
              <strong>Interactive:</strong>{' '}
              <Link href="/business/flows" className="text-turmeric-400 hover:underline">
                /business/flows
              </Link>{' '}
              — always freshest.
            </li>
            <li>
              <strong>Portable HTML snapshot:</strong> <Path>/business-user-flows.html</Path> — regenerate when flows change (save from live <Path>/business/flows</Path> when copy is stable).
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
