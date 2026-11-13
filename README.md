# MindBenchmark

A minimal browser-based brain-game site built with React, Vite and Cloudflare.

## Development

Use Node.js 22.23 or later.

```bash
npm ci
npm run dev
```

## Checks

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

The site currently has the homepage, game directory, category filters and monochrome themes. Gameplay and multiplayer are still in development.

Cloudflare Workers Static Assets hosts the frontend and API. CI checks changes but does not deploy them.
