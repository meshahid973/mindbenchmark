# MindBenchmark

Fast, minimal brain games with multiplayer coming later.

## Local development

Requires Node.js 22.18+ and npm.

```bash
npm install
npm run dev
```

## Checks

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

`npm run build` creates Cloudflare Build Output without deploying it. The UI currently contains routes and placeholders, not playable games. `/api/health` is the first Worker endpoint.

Cloudflare hosting uses Workers Static Assets with the `cf` CLI and Vite plugin v2. No Cloudflare services, accounts, or secrets are required for this foundation PR. Deployment is intentionally deferred.
