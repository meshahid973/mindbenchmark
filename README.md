# MindBenchmark

Fast browser brain games built with React, TypeScript and Cloudflare Pages.

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

Reaction Time, Sequence Memory and Aim Trainer are playable. Results are saved locally in the browser. Other games, accounts and multiplayer are still in development.

The site deploys `dist` from `main` to Cloudflare Pages. Game modules load only when needed. There is no server API yet.
