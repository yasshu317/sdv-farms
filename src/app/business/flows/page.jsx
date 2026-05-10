import Link from 'next/link'

export const metadata = {
  title: 'How people use SDV Farms — user flows',
  description:
    'Visitor, buyer, seller, admin, and staff journeys: sign-up, dashboards, listings, requests, and operations.',
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
      <div className="text-paddy-200 space-y-4 leading-relaxed print:text-paddy-800">{children}</div>
    </section>
  )
}

function StepList({ items }) {
  return (
    <ol className="list-decimal pl-5 space-y-3 marker:text-turmeric-500">
      {items.map((t, i) => (
        <li key={i}>{t}</li>
      ))}
    </ol>
  )
}

function Path({ children }) {
  return (
    <code className="text-turmeric-400/95 text-sm bg-paddy-900/80 print:bg-paddy-100 print:text-paddy-800 px-1.5 py-0.5 rounded-md">
      {children}
    </code>
  )
}

export default function BusinessFlowsPage() {
  return (
    <div className="min-h-screen bg-paddy-950 text-paddy-100 selection:bg-turmeric-500/30">
      <header className="border-b border-white/10 bg-paddy-900/80 backdrop-blur-sm sticky top-0 z-10 print:static">
        <div className="max-w-3xl mx-auto px-6 py-4 flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/business"
            className="text-turmeric-400 hover:text-turmeric-300 text-sm font-medium"
          >
            ← Business docs
          </Link>
          <Link href="/" className="text-paddy-500 hover:text-paddy-300 text-sm">
            Website home
          </Link>
        </div>
      </header>

      <article className="max-w-3xl mx-auto px-6 py-12 sm:py-16 print:bg-white print:text-paddy-900">
        <header className="mb-12 print:mb-8">
          <p className="text-turmeric-400 text-xs font-semibold tracking-[0.2em] uppercase mb-3">
            Product guide
          </p>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-white print:text-paddy-900 mb-4 leading-tight">
            How people use this website
          </h1>
          <p className="text-paddy-400 text-lg max-w-2xl print:text-paddy-700">
            One place to explain <strong className="text-paddy-200 print:text-paddy-900">buyers</strong>,{' '}
            <strong className="text-paddy-200 print:text-paddy-900">sellers</strong>, and{' '}
            <strong className="text-paddy-200 print:text-paddy-900">admin / staff</strong> — plus what anyone can do
            before logging in. Use this for training, investor decks, or partner onboarding. Print or save as PDF from
            your browser.
          </p>
        </header>

        <nav
          className="mb-14 p-4 rounded-2xl border border-white/10 bg-paddy-900/40 print:border-paddy-200 print:bg-paddy-50"
          aria-label="On this page"
        >
          <p className="text-xs font-semibold text-paddy-500 uppercase tracking-wider mb-2 print:text-paddy-600">
            Jump to
          </p>
          <ul className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
            {[
              ['#visitors', 'Visitors (not signed in)'],
              ['#buyers', 'Buyers'],
              ['#sellers', 'Sellers'],
              ['#admin', 'Admin & staff'],
              ['#routing', 'Where each role lands'],
            ].map(([href, label]) => (
              <li key={href}>
                <a href={href} className="text-turmeric-400 hover:underline print:text-paddy-800">
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <FlowSection id="visitors" title="Visitors" badge="No account">
          <p>
            Anyone can explore the marketing site, browse inventory, request land, book visits (where enabled), and
            contact the team without signing in.
          </p>
          <StepList
            items={[
              <>
                Land on the home page — read story sections, gallery, location, and use <Path>Book a visit</Path> or
                contact CTAs.
              </>,
              <>
                Open <Path>/properties</Path> to filter verified listings (state, soil, area, price, etc.).
              </>,
              <>
                Open a listing → see details; use <strong>Book visit</strong> or WhatsApp-style enquire actions as
                shown on the page.
              </>,
              <>
                Submit a <strong>land request</strong> at <Path>/buyer-request</Path> if they want the team to find a
                match (can be done signed in or as a guest; signed-in buyers get requests linked to their account).
              </>,
              <>
                Read <Path>/services</Path> for Phase II land-owner services (fencing, borewell, drip, etc.) and
                enquiry forms.
              </>,
              <>
                Register or sign in only when they want a personal dashboard, saved progress, or seller tools.
              </>,
            ]}
          />
        </FlowSection>

        <FlowSection id="buyers" title="Buyers" badge="Role: buyer">
          <p>
            Buyers use the <strong>buyer dashboard</strong> to track enquiries on properties, plot interests, and land
            requests they have filed.
          </p>
          <StepList
            items={[
              <>
                Create an account at <Path>/auth/register</Path> and choose the <strong>Buyer</strong> path (or sign in at{' '}
                <Path>/auth/login</Path>).
              </>,
              <>Confirm email if required → sign in → the app sends them to the buyer home <Path>/dashboard</Path>.</>,
              <>
                On <Path>/dashboard</Path>: use tabs such as{' '}
                <strong>Overview, Enquiries, Plot interests, Land requests</strong> to see status (e.g. pending,
                contacted, visited, booked).
              </>,
              <>
                Continue browsing <Path>/properties</Path>; interest and enquiry actions from listing pages tie back to
                their account where the product supports it.
              </>,
              <>
                Manage an open land request via <Path>/buyer-request</Path> workflows; edits may redirect back to the
                dashboard land-requests area.
              </>,
            ]}
          />
          <p className="text-paddy-500 text-sm print:text-paddy-600">
            Staff and admin handle back-office fulfilment — buyers primarily experience the marketplace + dashboard +
            notifications.
          </p>
        </FlowSection>

        <FlowSection id="sellers" title="Sellers" badge="Role: seller">
          <p>
            Sellers list eligible agricultural land, manage drafts and live listings from the seller hub, and work with SDV
            for verification and approvals.
          </p>
          <StepList
            items={[
              <>
                Entry: <Path>List your land</Path> flows to <Path>/auth/register?flow=seller</Path> — skips the generic
                role picker and goes straight into seller onboarding.
              </>,
              <>
                Complete <strong>eligibility</strong> (restricted categories such as Poramboke / Forest etc. block listing).
              </>,
              <>
                Create credentials → email verification → sign in → land on <Path>/seller</Path> (seller dashboard).
              </>,
              <>
                Add a property with <Path>/seller/property/new</Path> (location, land details, documents/photos as the
                form requires).
              </>,
              <>
                Edit listings at <Path>/seller/property/[id]/edit</Path>. Listings typically go through{' '}
                <strong>review / approval</strong> by operations before appearing publicly.
              </>,
              <>
                Business rules (e.g. caps on concurrent active listings) are enforced in-product — sellers see errors or
                guidance if they hit a limit.
              </>,
            ]}
          />
        </FlowSection>

        <FlowSection id="admin" title="Admin & staff" badge="Roles: admin · staff">
          <p>
            <strong>Admin</strong> and <strong>staff</strong> share the operations hub at <Path>/admin</Path>. Access is
            restricted by role; non-privileged users are redirected. Staff may see a subset of capabilities compared to
            full admin depending on how the product is configured.
          </p>
          <StepList
            items={[
              <>
                Sign in with an account whose <code className="text-turmeric-400">user_metadata.role</code> is{' '}
                <strong>admin</strong> or <strong>staff</strong> → default destination <Path>/admin</Path>.
              </>,
              <>
                Operate <strong>enquiries & leads</strong>, <strong>buyer requests</strong>,{' '}
                <strong>appointments / site visits</strong>, <strong>seller properties</strong> (review, edit, create where
                allowed), <strong>plots</strong> / verification workflows, and related ops tabs in the admin UI.
              </>,
              <>
                Admin-only capabilities can include user management (e.g. via <Path>/api/admin/users</Path>), feature
                flags, and full property tooling — exact tabs follow the live <Path>/admin</Path> interface.
              </>,
              <>
                <strong>Sellers never use /admin</strong> for daily work — they use <Path>/seller</Path>.{' '}
                <strong>Staff</strong> are steered to <Path>/admin</Path> (not the seller console) so operations stay in
                one place.
              </>,
            ]}
          />
        </FlowSection>

        <FlowSection id="routing" title="Where each role lands after login" badge="Routing">
          <ul className="list-disc pl-5 space-y-2 marker:text-turmeric-500">
            <li>
              <strong>Buyer</strong> (or unknown / default profile) → <Path>/dashboard</Path>
            </li>
            <li>
              <strong>Seller</strong> → <Path>/seller</Path>
            </li>
            <li>
              <strong>Admin</strong> or <strong>staff</strong> → <Path>/admin</Path>
            </li>
          </ul>
          <p className="text-sm text-paddy-500 print:text-paddy-600">
            The same rule applies after email confirmation via the auth callback so first-time users land on the correct
            home surface.
          </p>
        </FlowSection>

        <section className="border-t border-white/10 pt-10 print:border-paddy-200">
          <h2 className="font-display text-xl text-turmeric-400 mb-3 print:text-paddy-800">Sharing this doc</h2>
          <ul className="text-paddy-300 text-sm space-y-2 print:text-paddy-700">
            <li>
              <strong>Live URL:</strong>{' '}
              <Link href="/business/flows" className="text-turmeric-400 hover:underline print:text-paddy-900">
                /business/flows
              </Link>{' '}
              on your deployed domain.
            </li>
            <li>
              <strong>Standalone HTML:</strong> <Path>/business-user-flows.html</Path> in <code className="text-paddy-400">public/</code>{' '}
              — open from the deployed site root so styling is consistent; attach or host for partners who want a file.
            </li>
          </ul>
        </section>

        <footer className="mt-12 pt-8 border-t border-white/10 text-center text-paddy-500 text-sm print:text-paddy-600 print:border-paddy-200">
          <p>SDV Farms — user-flow reference. Product behaviour may evolve; trust the live app for edge cases.</p>
        </footer>
      </article>
    </div>
  )
}
