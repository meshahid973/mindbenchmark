# MindBenchmark

Fast, lightweight browser games built with React, TypeScript and Cloudflare Pages.

## Local development

Node.js 22.23 or newer:

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

All eight games are playable: Reaction Time, Sequence Memory, Aim Trainer, Number Memory, Verbal Memory, Chimp Test, Visual Memory and Typing Speed.

Scores and history are stored locally in the browser. Games load as separate modules. The build checks JavaScript and CSS size budgets.

Cloudflare Pages deploys `dist` from `main`. Accounts and multiplayer are not implemented yet.
