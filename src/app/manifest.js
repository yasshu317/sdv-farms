export default function manifest() {
  return {
    name: 'SDV Farms — Phase 1',
    short_name: 'SDV Farms',
    description: 'Approved agricultural land investment near Hyderabad, Telangana.',
    start_url: '/',
    display: 'standalone',
    background_color: '#071709',
    theme_color: '#1a4520',
    orientation: 'portrait',
    categories: ['business', 'lifestyle'],
    icons: [
      { src: '/api/icon?size=192', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/api/icon?size=512', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/api/icon?size=512', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
    shortcuts: [
      {
        name: 'Talk to Our Team',
        url: '/#contact',
        description: 'Request a callback from SDV Farms',
      },
      {
        name: 'My Dashboard',
        url: '/dashboard',
        description: 'View your buyer dashboard',
      },
    ],
  }
}
