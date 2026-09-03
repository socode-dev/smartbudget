# SmartBudget Financial Signals

SmartBudget financial signals are deterministic backend calculations. They turn user transactions and budgets into structured facts before any AI agent runs.

For the full AI flow, see [SmartBudget AI Architecture](./ai-architecture.md). For telemetry around the pipeline, see [Backend AI Telemetry](./backend-ai-telemetry.md). For test coverage, see [SmartBudget Testing](./TESTING.md).

## Architecture Evolution

The financial signal engines initially lived in the frontend under `src/insight_engines`. That worked during early development because the app could calculate signals close to the UI and move quickly.

As SmartBudget matured, the signal engines were moved to the backend. This makes the backend the source of truth for financial facts, keeps business logic out of the UI, and gives product reporting and outcome telemetry a more trusted foundation.

The frontend calls:

```text
POST /api/insights/run
```

with:

```text
userId
currency
isDemo
```

The backend then loads the user's transactions and budgets from Firestore, builds the available signals, and passes them to the AI orchestrator.

## Current Flow

```mermaid
flowchart TD
  A[Frontend sends userId, currency and isDemo] --> B[/api/insights/run]
  B --> C[loadFinancialData]
  C --> D[Read transactions]
  C --> E[Read budgets]

  D --> F[runFinancialSignals]
  E --> F

  F --> G[Anomaly engine]
  F --> H[Budget engine]
  F --> I[Cashflow engine]
  G --> J[Risk engine]
  H --> J
  I --> J

  G --> K[AI orchestrator]
  H --> K
  I --> K
  J --> K
```

## Data Loading

File:

```text
backend/userData/loadFinancialData.js
```

The backend reads:

```text
users/{userId}/transactions
users/{userId}/budgets
```

If either subcollection is missing or empty, it returns an empty array. This prevents missing data from breaking the pipeline.

```text
transactions: []
budgets: []
```

## Signal Runner

File:

```text
backend/financial-signals/runFinancialSignals.js
```

The runner coordinates all deterministic engines:

```text
transactions + budgets
  -> anomalies
  -> budget compliance
  -> cashflow
  -> financial risk
```

It only builds signals when the needed data exists:

- no transactions: no anomaly, cashflow, or risk signal
- transactions but no budgets: anomaly, cashflow, and risk can still run
- transactions and budgets: all engines can run

## Anomaly Engine

File:

```text
backend/financial-signals/anomaly.js
```

The anomaly engine finds unusual category spending.

How it works:

- groups expenses by category and month
- builds a monthly history per category
- compares the latest month against previous months
- uses median and Median Absolute Deviation (MAD)
- requires enough historical months before emitting a signal
- only flags meaningful increases, not normal variation

Detection thresholds are internal tuning parameters. The engine requires sufficient history and evaluates absolute change, percentage change, and robust statistical deviation before emitting a signal.

Output includes:

```text
category
currency
risk score and level
current value
baseline value
deviation percent
trend
recent history
recommendation hint
```

This signal helps identify spending spikes that may point to behavioral risk or stress.

## Budget Engine

File:

```text
backend/financial-signals/budget.js
```

The budget engine checks spending against user-created budgets.

How it works:

- matches transactions to each budget by category key, type, month, and year
- calculates total spending for that budget period
- calculates percent of budget used
- estimates daily burn rate
- projects month-end spending
- classifies the budget status

Statuses:

```text
ON_TRACK
BORDERLINE
AT_RISK
EXCEEDED
```

Output includes:

```text
budget amount
month and year
total spent
transaction count
percent budget used
daily burn rate
safe daily spend
projected total
compliance status
risk level
```

Only non-`ON_TRACK` budget records are passed forward to the orchestrator.

## Cashflow Engine

File:

```text
backend/financial-signals/cashflow.js
```

The cashflow engine checks whether money is leaving faster than it is coming in for the current month.

How it works:

- isolates current-month transactions
- sums income and expenses
- calculates current balance
- calculates percent of income spent
- estimates daily burn rate
- projects month-end spending and remaining balance
- detects no-income spending risk

Outcomes:

```text
SAFE
WARNING
RISK
```

Output includes:

```text
current month period
total income
total spent
current balance
safe daily spend
spending runway
projected total spend
projected remaining balance
percent spent
projection confidence
has no income
outcome
```

This signal is important for identifying early liquidity pressure.

## Financial Risk Engine

File:

```text
backend/financial-signals/risk.js
```

The risk engine combines anomaly, budget, cashflow, and historical spending behavior into one overall risk signal.

How it works:

- counts high and medium anomalies
- counts exceeded and at-risk budgets
- reads cashflow outcome
- checks whether active income exists
- estimates income consistency
- checks whether spending is increasing
- adds weighted risk points from each pressure area
- returns `null` when risk is low

Risk levels:

```text
LOW
MEDIUM
HIGH
```

Output includes:

```text
risk score
risk level
income consistency
spending trend
spending pressure
budget discipline
cashflow health
systemic crisis flag
supporting anomaly, budget, cashflow, and historical signals
```

The risk engine is the broadest combined signal because it connects multiple pressure points into one structured view.

## Why This Lives In The Backend

Keeping financial signals in the backend gives SmartBudget a stronger architecture:

- frontend stays focused on UI
- financial calculations are controlled server-side
- Firestore reads happen in one backend pipeline
- signal logic is easier to test and audit
- AI receives backend-owned facts, not frontend-built payloads
- future business outcome telemetry can use the same trusted signal source

## Implementation Files

```text
api/insights/run.js
backend/userData/loadFinancialData.js
backend/financial-signals/anomaly.js
backend/financial-signals/budget.js
backend/financial-signals/cashflow.js
backend/financial-signals/risk.js
backend/financial-signals/runFinancialSignals.js
backend/financial-signals/utils.js
```

## Test Files

```text
backend/tests/anomaly-engine.test.js
backend/tests/budget-engine.test.js
backend/tests/cashflow-engine.test.js
backend/tests/financial-risk-engine.test.js
backend/tests/fixture-validation.test.js
backend/tests/fixtures/
```
