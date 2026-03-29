import { defineConfig } from 'vitepress'
import { resolve } from 'path'
import fs from 'node:fs'

// Serves /dist/* from the project root dist/ folder during docs:dev.
// VitePress only serves docs/public/ at /, so without this the playground
// gets a 404 when it imports from '/dist/index.js'.
function serveProjectDist() {
  return {
    name: 'serve-project-dist',
    configureServer(server: any) {
      server.middlewares.use((req: any, res: any, next: any) => {
        if (!req.url?.startsWith('/dist/')) return next()
        const file = resolve(process.cwd(), req.url.slice(1)) // strips leading /
        if (!fs.existsSync(file)) return next()
        const contentType = file.endsWith('.map') ? 'application/json' : 'application/javascript'
        res.setHeader('Content-Type', contentType)
        res.setHeader('Cache-Control', 'no-cache')
        fs.createReadStream(file).pipe(res)
      })
    },
  }
}

export default defineConfig({
  title: 'Nepali Calendar Engine',
  description: 'Documentation for nepali-calendar-engine',
  cleanUrls: true,
  vite: {
    plugins: [serveProjectDist()],
  },
  themeConfig: {
    nav: [
      { text: 'Guide', link: '/guide/getting-started' },
      { text: 'Playground', link: '/playground/', target: '_blank' },
      { text: 'Validation', link: '/guide/validation-and-trust' },
      { text: 'API', link: '/api/reference/README' },
    ],
    sidebar: {
      '/guide/': [
        {
          text: 'Introduction',
          items: [
            { text: 'What is Bikram Sambat?', link: '/guide/what-is-bs' },
            { text: 'Getting Started', link: '/guide/getting-started' },
            { text: 'Interactive Playground', link: '/guide/playground' },
          ],
        },
        {
          text: 'Core Concepts',
          items: [
            { text: 'Date Conversion', link: '/guide/date-conversion' },
            { text: 'Calendar Grid', link: '/guide/calendar-grid' },
            { text: 'Panchang & Events', link: '/guide/panchang-and-events' },
          ],
        },
        {
          text: 'Reference',
          items: [
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
