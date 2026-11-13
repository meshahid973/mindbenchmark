# MindBenchmark

Fast browser-based brain games built with React, TypeScript and Cloudflare Pages.

## Development

Use Node.js 22.23 or later.

```bash
npm ci
npm run dev
```

## Checks

```bash
npm run lint
npm test
npm run build
```

The build enforces a compressed bundle size budget. Cloudflare Pages deploys `dist` from the `main` branch. Static assets are cached long term using content-hashed filenames, while Pages Functions handle API requests.

Games, rankings and accounts are still in development.
