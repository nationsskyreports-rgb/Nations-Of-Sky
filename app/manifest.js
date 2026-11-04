export default function manifest() {
  return {
    name: 'Voice of Customer',
    short_name: 'VOC',
    start_url: '/dashboard',
    display: 'standalone',
    background_color: '#0a0a0a',
    theme_color: '#0a0a0a',
    icons: [
      { src: '/icon-maskable.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
      { src: '/logo.png', sizes: '999x999', type: 'image/png', purpose: 'any' },
    ],
  };
}
