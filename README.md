# Vydra

Vydra is a personal financial intelligence platform for understanding financial activity, identifying meaningful patterns, and making informed financial decisions.

The app combines deterministic financial signal engines with an AI insight layer to turn financial data into clear, actionable context.

## What Vydra Does

- Tracks income, expenses, budgets, and financial goals
- Analyzes financial activity for meaningful patterns and signals
- Provides AI-assisted explanations and financial insights
- Helps users understand their financial flow and where attention may be needed
- Gives users the context to make their own financial decisions

## View Live

[Open Vydra](https://smartbudget-beta.vercel.app/)

## Features

- Transaction tracking for income and expenses
- Budget creation and progress monitoring
- Goal tracking with contributions
- Reports with charts and export tools
- AI-assisted insight cards
- Insight history
- Demo mode with seeded data
- Realtime Firestore updates
- Firebase Authentication
- Backend AI orchestration through Vercel API routes

## Insight Pipeline Flow

```mermaid
flowchart TD
  A[Frontend UI] --> B[POST /api/insights/run]
  B --> C[Backend loads transactions and budgets]
  C --> D[financial signal engines]
  D --> E[Anomaly, budget, cashflow, and risk signals]
  E --> F[AI orchestrator]
  F --> G[Attention gate]
  G --> H[Trigger gate and reservation]
  H --> I[Specialist AI service]
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
vydra/
  .github/
    workflows/
  api/
    ai/
    insights/
  backend/
    ai/
      fallbacks/
      orchestrator/
      prompts/
      services/
      shared/
      telemetry/
      triggers/
    financial-signals/
    userData/
    tests/
  docs/
  lib/
  public/
  src/
    components/
    context/
    data/
    demo/
    firebase/
    hooks/
    initializer/
    layout/
    pages/
    routes/
    schema/
    store/
    tests/
    utils/
```

## Backend AI Areas

- `api/insights/run.js` is the frontend-facing insight pipeline route.
- `api/ai/orchestrator.js` remains the lower-level AI orchestration route.
- `backend/userData/` loads user transactions and budgets from Firestore.
- `backend/financial-signals/` builds deterministic anomaly, budget, cashflow, and risk signals.
- `backend/ai/services/orchestrator.js` coordinates the pipeline.
- `backend/ai/orchestrator/` contains scoring, attention, trigger, reservation, persistence, and agent execution helpers.
- `backend/ai/services/` contains specialist agents.
- `backend/ai/prompts/` contains prompt builders.
- `backend/ai/fallbacks/` contains local fallback insights.
- `backend/ai/telemetry/` records pipeline, agent, and insight metrics.

The financial signal engines originally lived in the frontend and now run in the backend so the UI only triggers the pipeline and displays persisted results.

## Documentation

- [Vydra Overview](./docs/overview.md)
- [Financial Signals](./docs/financial-signals.md)
- [AI Architecture](./docs/ai-architecture.md)
- [AI Telemetry](./docs/ai-telemetry.md)
- [Business Telemetry](./docs/business-telemetry.md)
- [Secure Data Ingestion](./docs/data-ingestion.md)
- [Identity and Account Activation](./docs/identity-and-activation.md)
- [Reliability and Failure Recovery](./docs/reliability-and-recovery.md)
- [Testing](./docs/TESTING.md)

## Scripts

```bash
npm run dev
npm run build
npm run lint
npm test
```

## Status

Public repository under active development.
