# MindBenchmark

Minimal browser brain games built with React, TypeScript and Vite.

## Local development

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

## Cloudflare Pages

Connect the `main` branch of this repository to Cloudflare Pages with these settings:

- Build command: `npm run build`
- Build output: `dist`
- Root directory: `/`

Pages serves React routes automatically. `/api/health` is a Pages Function.

Gameplay and multiplayer are still in development. Deploying the frontend does not create a multiplayer backend.
