import './globals.css'
import PWARegister from '../components/PWARegister'

export const metadata = {
  title: 'SDV Farms – Phase 1 | Secure Land Investment',
  description:
    'SDV Farms Phase 1 – Government-approved agricultural land near Hyderabad. Secure investment, long-term appreciation, sustainable farming income. Contact: 7780312525',
  keywords:
    'SDV Farms, agricultural land, Hyderabad farmland, land investment, Telangana farms, government approved layout',
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'SDV Farms',
  },
  openGraph: {
    title: 'SDV Farms – Phase 1 | Agricultural Land Investment',
    description:
      'Own legally verified farmland near Hyderabad. Government-approved layout. Contact: 7780312525',
    type: 'website',
  },
}

export const viewport = {
  themeColor: '#1a4520',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;0,800;1,400;1,600&family=Inter:wght@300;400;500;600;700&family=Noto+Sans+Telugu:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="SDV Farms" />
      </head>
      <body>
        <PWARegister />
        {children}
      </body>
    </html>
  )
}
