# SmartBudget Testing

SmartBudget uses Vitest to validate deterministic financial logic, backend AI orchestration, and frontend utilities.

For architecture context, see [SmartBudget Overview](./overview.md), [Financial Signals](./financial-signals.md), and [SmartBudget AI Architecture](./ai-architecture.md).

## Test Layout

```text
backend/tests/
src/tests/
```

## Backend Tests

Backend tests cover the core insight pipeline.

### Financial Signal Tests

```text
backend/tests/anomaly-engine.test.js
backend/tests/budget-engine.test.js
backend/tests/cashflow-engine.test.js
backend/tests/financial-risk-engine.test.js
backend/tests/fixture-validation.test.js
```

These tests validate the deterministic engines that now live in:

```text
backend/financial-signals/
```

They check:

- anomaly detection
- budget compliance calculations
- cashflow outcome and projections
- financial risk scoring
- fixture quality and realistic user scenarios
- edge cases such as no income, sparse history, refunds, and missing budgets

### AI Pipeline Tests

```text
backend/tests/llm-prompt.test.js
backend/tests/signal-scoring.test.js
backend/tests/trigger-gate.test.js
backend/tests/attention-gate.test.js
backend/tests/orchestrator.test.js
```

These tests validate:

- prompt builders
- signal normalization and scoring
- trigger gate behavior
- attention gate behavior
- orchestrator selection and persistence flow
- AI timeout/fallback behavior

## Frontend Tests

Frontend tests now focus on UI-facing utilities and stores.

```text
src/tests/formatAmount.test.js
src/tests/formatRelativeTime.test.js
src/tests/generateCategoryKey.test.js
src/tests/getTotalBudgetSpent.test.js
src/tests/onboarding-store.test.js
src/tests/transactionTotal.test.js
```

These tests validate formatting, category keys, totals, and frontend state behavior.

## Fixtures

Financial fixtures live in:

```text
backend/tests/fixtures/
```

They model realistic user scenarios:

- normal stable users
- no-income users
- overspending users
- recurring pressure users
- cashflow risk users
- institution-style pilot users
- trigger gate scenarios

Fixtures are important because the financial engines are deterministic. Good fixtures make the pipeline easier to trust.

## Running Tests

Run all tests:

```bash
npm run test
```

Run one test file:

```bash
npm run test -- backend/tests/anomaly-engine.test.js
```

Run lint:

```bash
npm run lint
```

Run build:

```bash
npm run build
```

## Testing Principle

SmartBudget separates deterministic facts from AI communication.

That means:

- financial signal tests must be stable and exact
- AI prompt tests focus on structure and safety
- orchestrator tests focus on control flow
- frontend tests focus on display helpers and state

The deterministic backend signal layer is the source of financial truth. AI explains that truth; it does not create it.
