# SmartBudget

SmartBudget is a personal finance web app for tracking transactions, budgets, goals, reports, and AI-assisted financial insights.

The app combines deterministic financial engines with a backend AI pipeline. The deterministic engines calculate financial signals, while AI explains the most important signal in clear language.

## View Live

[https://smartbudget-beta.vercel.app/](https://smartbudget-beta.vercel.app/)

## Features

- Transaction tracking for income and expenses
- Budget creation and progress monitoring
- Goal tracking with contributions
- Reports with charts and export tools
- Smart insight cards
- Insight history
- Demo mode with seeded data
- Realtime Firestore updates
- Firebase Authentication
- Backend AI orchestration through Vercel API routes

## AI Insight Flow

```mermaid
flowchart TD
  A[Transactions and budgets] --> B[Frontend deterministic engines]
  B --> C[Anomaly, budget, cashflow, and risk signals]
  C --> D[/api/ai/orchestrator]
  D --> E[Quota check]
  E --> F[Backend orchestrator]
  F --> G[Attention gate]
  G --> H[Trigger gate and reservation]
  H --> I[Specialist AI agent]
  I --> J{Valid response?}
  J -->|yes| K[Persist insight]
  J -->|timeout or malformed| L[Local fallback insight]
  L --> K
  K --> M[Firestore]
  M --> N[Realtime UI]
```

## Tech Stack

- React
- Vite
- Tailwind CSS
- Zustand
- Firebase Auth
- Firestore
- Firebase Admin
- Vercel Serverless Functions
- OpenAI-compatible AI client via `aisuite`
- Chart.js
- Framer Motion
- Vitest
- ESLint

## Project Structure

```text
smartbudget/
  .github/
    workflows/
      lint.yml
      vitest.yml
  api/
    ai/
      orchestrator.js
  backend/
    ai/
      fallbacks/
      orchestrator/
      prompts/
      services/
      shared/
      telemetry/
      triggers/
    tests/
  docs/
    ai-architecture.md
    backend-ai-telemetry.md
    overview.md
    TESTING.md
  lib/
    firebaseAdmin.js
    quota.js
  public/
  src/
    components/
    context/
    data/
    demo/
    firebase/
    hooks/
    initializer/
    insight_engines/
    layout/
    pages/
    routes/
    schema/
    store/
    tests/
    utils/
    App.jsx
    main.css
    main.jsx
  index.html
  package.json
  vercel.json
  vite.config.js
```

## Backend AI Areas

- `api/ai/orchestrator.js` receives AI requests.
- `backend/ai/services/orchestrator.js` coordinates the pipeline.
- `backend/ai/orchestrator/` contains scoring, attention, trigger, reservation, persistence, and agent execution helpers.
- `backend/ai/services/` contains specialist agents.
- `backend/ai/prompts/` contains prompt builders.
- `backend/ai/fallbacks/` contains local fallback insights.
- `backend/ai/telemetry/` records pipeline, agent, and insight metrics.

## Documentation

- [SmartBudget Overview](./docs/overview.md)
- [AI Architecture](./docs/ai-architecture.md)
- [Backend AI Telemetry](./docs/backend-ai-telemetry.md)
- [Testing](./docs/testing.md)

## Scripts

```bash
npm run dev
npm run build
npm run lint
npm test
```

## Status

Active development. Not open source.
