import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'Nepali Calendar Engine',
  description: 'Documentation for nepali-calendar-engine',
  cleanUrls: true,
  themeConfig: {
    nav: [
      { text: 'Guide', link: '/guide/getting-started' },
      { text: 'Playground', link: '/playground/' },
      { text: 'Validation', link: '/guide/validation-and-trust' },
      { text: 'API', link: '/api/reference/README' },
    ],
    sidebar: {
      '/guide/': [
        {
          text: 'Guide',
          items: [
            { text: 'Getting Started', link: '/guide/getting-started' },
            { text: 'Interactive Playground', link: '/guide/playground' },
            { text: 'Panchang & Events', link: '/guide/panchang-and-events' },
            { text: 'Validation & Trust', link: '/guide/validation-and-trust' },
          ],
        },
      ],
      '/api/': [
        {
          text: 'API Reference',
          items: [{ text: 'Generated Reference', link: '/api/reference/README' }],
        },
      ],
    },
  },
})
