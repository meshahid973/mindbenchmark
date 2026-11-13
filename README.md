# MindBenchmark

Fast, minimal brain games, built with React and Cloudflare.

## Development

Use Node.js 22.23+.

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

The site includes the homepage, game directory, theme switcher and placeholder routes. The games and multiplayer backend are planned but not yet playable.

The frontend uses Cloudflare Workers Static Assets through the `cf` CLI. Nothing deploys automatically from CI.
