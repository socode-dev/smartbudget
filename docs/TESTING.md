# SmartBudget Testing

SmartBudget uses Vitest to test deterministic financial analysis, AI orchestration, import behavior, account activation, and frontend utilities.

For system context, see the [SmartBudget overview](./overview.md), [AI architecture](./ai-architecture.md), [financial signals](./financial-signals.md), and [secure data ingestion](./data-ingestion.md).

## Test Layout

```text
backend/tests/
backend/integrations/import/__tests__/
backend/integrations/invites/__tests__/
src/tests/
```

## Financial Signal Tests

The backend signal tests cover anomaly detection, budget compliance, cashflow assessment, financial risk scoring, and trigger eligibility. Their fixtures model realistic financial user scenarios, including stable activity, sparse history, missing income, overspending, refunds, recurring pressure, and cashflow risk.

These tests are expected to be deterministic: the same validated financial data should produce the same signals and scores. Some source-level fixture and test identifiers retain legacy scenario wording, but they represent realistic financial users and end-to-end pipeline scenarios rather than a distinct product mode.

## AI Pipeline Tests

The orchestration tests follow the current execution order:

```text
deterministic signals
        -> normalization and scoring
        -> attention gate
        -> trigger eligibility
        -> reservation
        -> selected specialist agent
        -> validated insight or local fallback
        -> persistence
        -> telemetry
```

They verify scoring, gate behavior, specialist selection, prompt structure, output validation, timeout handling, local fallbacks, persistence, and telemetry. Only the selected specialist is called after eligibility and reservation; the system does not call every specialist before scoring.

## Data-Ingestion Tests

Importer and activation tests use the Firestore emulator and cover:

- customer and transaction imports
- pre-activation customer and transaction staging
- secure activation export generation
- account activation and identity binding
- migration to canonical authenticated users
- incremental transaction imports
- duplicate file and transaction suppression
- isolated integration scopes
- malformed CSV and invalid-row handling
- retry-safe invite consumption and activation

A local transport adapter is also used for end-to-end checks. It simulates the external file-transport boundary while exercising the real importer, activation-export, persistence, routing, and successful or failed file lifecycle. It is not a replacement for emulator-based automated tests.

## Frontend Tests

Frontend tests cover formatting, category-key generation, transaction ordering, financial totals, and state-store behavior. These tests protect UI-facing calculations and ensure transactions are ordered consistently by date and time.

## Running Tests

Run the standard suite:

```bash
npm run test
```

Run the importer and activation suite with emulators:

```bash
npm run test:importer
```

Run lint and the production build checks:

```bash
npm run lint
npm run build
```

## Testing Principle

SmartBudget separates deterministic facts from AI communication. Financial signal tests therefore assert exact behavior, while AI tests focus on controlled execution, validated communication, and safe fallback behavior.

Related documentation: [Identity and Account Activation](./identity-and-activation.md) and [Reliability and Failure Recovery](./reliability-and-recovery.md).
