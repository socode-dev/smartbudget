# SmartBudget Testing

This document provides comprehensive coverage of the SmartBudget testing strategy, test structure, and how to run tests.

For the core platform architecture, see [SmartBudget Overview](./OVERVIEW.md). For AI-specific architecture, see [SmartBudget AI Architecture](./AI-ARCHITECTURE.md).

## Introduction

SmartBudget uses a comprehensive testing strategy that validates:
- **Financial analysis engines** — deterministic signal generation
- **AI services** — prompt generation and reasoning
- **Backend orchestration** — signal coordination and persistence
- **Utility functions** — data formatting and transformation
- **Fixture trust** — realistic test data that represents real user scenarios

Tests are written using **Vitest** and organized into frontend tests (`/src/tests/`) and backend tests (`/backend/tests/`).

## Test Structure

SmartBudget maintains two primary test directories:

### Frontend Tests (`/src/tests/`)
Frontend tests validate financial analysis engines and utility functions.

**Test categories:**
- Financial analysis engines (anomaly, budget, cashflow, risk)
- Utility functions (formatting, transformation)
- Fixture validation (test data integrity)

### Backend Tests (`/backend/tests/`)
Backend tests validate AI services, orchestration, and signal processing.

**Test categories:**
- AI prompt builders
- Signal orchestration and scoring
- Trigger gate logic
- Orchestrator coordination

## Financial Analysis Engines

The financial analysis engines are the deterministic core of SmartBudget. They transform raw transaction data into structured financial signals.

### Anomaly Engine Tests

**File:** `src/tests/anomaly-engine.test.js`

The anomaly detection engine identifies unusual spending patterns by comparing current spending to historical baselines.

**Key test coverage:**
- Detects single-category spikes above baseline
- Captures multiple high anomalies in different categories
- Distinguishes refund transactions (negative amounts)
- Handles edge cases (sparse history, new categories)
- Correctly ranks anomalies by severity

**Test fixtures used:**
- `oneCategoryOverspendingUser` — validates detection of a single anomaly
- `threeCategoryOverspendingUser` — validates multiple independent anomalies
- `buildMultiCategorySpikeUser` — validates scaling across category counts
- `newCategoryUser` — validates handling of first-time category purchases
- `refundUser` — validates refund handling (negative amounts)
- `edgeCaseUsers` — validates sparse history and edge cases

**Example test:**
```javascript
it("returns an anomaly signal when one category spikes above real history", () => {
  const result = detectAnomalies(oneCategoryOverspendingUser.transactions);
  
  expect(result).toHaveLength(1);
  expect(result[0]).toMatchObject({
    type: "anomaly",
    category: "Food",
    risk: { level: "HIGH" },
    signal: {
      current_value: 900,
      baseline_value: 500,
      deviation_percent: 80,
      month: "2026, Jun",
    },
  });
});
```

### Budget Engine Tests

**File:** `src/tests/budget-engine.test.js`

The budget compliance engine tracks spending against user-set budget limits and determines compliance status.

**Key test coverage:**
- Marks budgets as exceeded when spending reaches limit
- Treats exactly 100% as exceeded (not "at threshold")
- Correctly handles 99% usage at month-end
- Manages extreme cases (200% overrun)
- Returns zero spending when no matching expenses exist
- Validates compliance math across all thresholds

**Test fixtures used:**
- `exceedingBudgetsUser` — validates exact 100% detection
- `budgetAt99User` — validates near-limit behavior at month end
- `budgetAt200User` — validates extreme overrun handling
- `budgetNoSpendingUser` — validates no-spending scenarios
- `multipleBudgetUser` — validates multiple category budgets
- `edgeCaseUsers` — validates edge case budget scenarios

**Example test:**
```javascript
it("marks a real category as exceeded when spending reaches the budget", () => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date(fixedSystemDate));

  const result = buildBudgetComplianceData(
    exceedingBudgetsUser.budgets[0],
    exceedingBudgetsUser.transactions,
    exceedingBudgetsUser.currency
  );

  expect(result).toMatchObject({
    category: "Food",
    budget: { amount: 500, currency: "USD" },
    derived: {
      percent_budget_used: 100,
      compliance_status: "EXCEEDED",
      risk_level: "HIGH",
    },
  });

  vi.useRealTimers();
});
```

### Cashflow Engine Tests

**File:** `src/tests/cashflow-engine.test.js`

The cashflow engine projects spending runway, identifies immediate liquidity risk, and forecasts month-end balance.

**Key test coverage:**
- Returns safe cashflow for normal current-month spending
- Flags risk when spending approaches all available income
- Captures warning threshold at 85% projected spend
- Marks spending without income as risk
- Handles future transactions correctly
- Validates accounting invariants (income - spending = balance)
- Validates projection invariants (confidence and formula)

**Test invariants:**
The engine maintains two critical invariants validated in every test:

1. **Accounting invariant:** `balance = max(0, income - spending)`
2. **Projection invariant:** When confidence is HIGH, projected spend follows the formula: `(daily_burn_rate * total_days_in_month)`

**Test fixtures used:**
- `normalUser` — validates safe cashflow
- `cashflowRiskUser` — validates risk detection at high spend
- `cashflowBreakEvenUser` — validates break-even scenarios
- `cashflowWithFutureTransactionsUser` — validates future transaction handling
- `multipleIncomeSourcesUser` — validates multiple income sources
- `monthIsolationUser` — validates month boundary logic

**Example test:**
```javascript
it("flags current-month cashflow risk when spending is almost all income", () => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date(fixedSystemDate));

  const result = buildCashFlowData(
    cashflowRiskUser.transactions,
    cashflowRiskUser.currency
  );

  expect(result.outcome).toBe("RISK");
  expect(result.derived.percent_spent).toBe(98);
  expect(result.forecast.projected_remaining_balance).toBe(0);
  expectAccountingInvariant(result);
  expectProjectionInvariant(result);

  vi.useRealTimers();
});
```

### Financial Risk Engine Tests

**File:** `src/tests/financial-risk-engine.test.js`

The financial risk engine evaluates overall financial health by combining signals from anomalies, budgets, and cashflow. It identifies systemic crisis when multiple signals indicate widespread financial pressure.

**Key test coverage:**
- Returns null when overall risk is low
- Marks systemic crisis as high when multiple anomalies and exceeded budgets exist
- Evaluates income consistency (STABLE, PARTIAL, NONE)
- Assesses spending trends (INCREASING, STABLE, DECREASING)
- Combines budget discipline with anomaly frequency
- Integrates cashflow health into risk calculation

**Systemic crisis criteria:**
A systemic crisis is marked when:
- Multiple high anomalies exist (2+)
- Multiple budgets are exceeded
- Cashflow outcome is RISK or WARNING
- Spending trend is INCREASING
- Income consistency is below STABLE

**Test fixtures used:**
- `normalUser` — validates null result for low-risk users
- `threeCategoryOverspendingUser` — validates systemic crisis detection
- `cashflowRiskUser` — validates cashflow integration
- Custom user configurations for specific crisis scenarios

## Backend AI Services Tests

Backend tests validate the AI services layer, which translates structured financial signals into human-readable insights and explanations.

### Prompt Builder Tests

**File:** `backend/tests/llm-prompt.test.js`

The prompt builder tests validate that AI prompts are correctly constructed, sanitized, and safe for model execution.

**Key test coverage:**
- Generates syntactically valid prompts for all domains (anomaly, budget, cashflow, risk, orchestration)
- Sanitizes user data to prevent prompt injection
- Includes all required context (financial data, user persona, temporal context)
- Formats currency and numbers correctly
- Handles edge cases (no anomalies, no income, extreme values)
- Validates prompt output against schema

**Tested prompt builders:**
- `buildAnomalyPrompt` — explains unusual spending patterns
- `buildBudgetCompliancePrompt` — explains budget status
- `buildCashflowPrompt` — explains spending runway
- `buildFinancialRiskPrompt` — explains overall financial health
- `buildOrchestrationPrompt` — coordinates multi-domain insights

**Sanitization rules:**
All prompts validate that:
- User-provided data is escaped
- No quote characters can break out of strings
- Currency symbols are properly formatted
- Numbers are within expected ranges

**Example test:**
```javascript
it("generates a valid prompt for anomaly detection", () => {
  const prompt = buildAnomalyPrompt({
    anomalies: [anomalyData],
    user: { name: "User" },
    currency: "USD",
  });

  assertPromptSanitized(prompt);
  expect(prompt).toContain(anomalyData.category);
  expect(prompt).toContain(anomalyData.signal.deviation_percent);
});
```

### Signal Scoring Tests

**File:** `backend/tests/signal-scoring.test.js`

The signal scoring system ranks financial signals by urgency to determine which insights should be shown to users first.

**Key test coverage:**
- Normalizes outputs from all engines into ranked signal candidates
- Scores signals using an urgency formula combining severity and context
- Orders signals by urgency (budget > risk > cashflow typically)
- Boosts financial risk when systemic pressure is detected (multiple high anomalies + exceeded budgets)
- Handles heterogeneous signal types in a unified ranking

**Urgency formula factors:**
- **Base severity:** HIGH (3 points) > MEDIUM (2 points) > LOW (1 point)
- **Type multipliers:** Budget (1.5x) > Anomaly (1.3x) > Risk (1.2x) > Cashflow (1.0x)
- **Systemic boost:** +2.0 when multiple high anomalies + exceeded budgets
- **Time decay:** Recent signals scored higher

**Example test:**
```javascript
it("orders risk, budget, and cashflow by the engine urgency formula", () => {
  const scored = scoreSignals({ signals: manualSignals });

  expect(scored.map(signal => signal.id)).toEqual([
    "budget-food",
    "risk-jun",
    "cashflow-jun",
  ]);
  expect(scored[0].urgencyScore).toBeGreaterThan(scored[1].urgencyScore);
});
```

### Trigger Gate Tests

**File:** `backend/tests/trigger-gate.test.js`

The trigger gate prevents user fatigue by controlling when insights are shown. It tracks which signals have already been fired and allows re-triggering only when conditions materially change.

**Key test coverage:**
- Allows signals that have never been shown (FIRST_TIME)
- Blocks signals when the same fingerprint has already fired (ALREADY_FIRED)
- Allows cashflow re-trigger when pressure increases by threshold (CASHFLOW_PRESSURE_INCREASED)
- Allows anomaly re-trigger when fingerprint changes due to increased spending (ANOMALY_INCREASED)
- Allows budget re-trigger when compliance status changes (e.g., AT_RISK → EXCEEDED)

**Re-trigger thresholds:**
- **Cashflow:** Percent spent must increase by 10+ percentage points
- **Anomaly:** Current value must increase significantly
- **Budget:** Compliance status must change categories

**Example test:**
```javascript
it("allows cashflow when pressure increases by the threshold", () => {
  const result = evaluateTrigger({
    existing: {
      status: "fired",
      fingerprint: "cashflow-old",
      snapshot: { percentSpent: 70 },
    },
    trigger: {
      type: "cashflow",
      fingerprint: "cashflow-new",
      snapshot: { percentSpent: 80 }, // +10% increase
    },
    now: Date.now(),
  });

  expect(result).toEqual({ allowed: true, reason: "CASHFLOW_PRESSURE_INCREASED" });
});
```

### Orchestrator Tests

**File:** `backend/tests/orchestrator.test.js`

The orchestrator coordinates all AI services and determines which insight is most important to show the user. It's the central decision engine that runs at the end of the AI pipeline.

**Key test coverage:**
- Calls all financial analysis engines and AI services in sequence
- Evaluates signal eligibility using trigger gate
- Scores eligible signals by urgency
- Persists selected insight to Firestore
- Handles AI failures gracefully with fallbacks
- Returns structured insight output with explanation

**Orchestration flow:**
1. Call financial engines (anomaly, budget, cashflow, risk)
2. Call AI services (generate explanations for each)
3. Normalize and score all signals
4. Filter by trigger gate eligibility
5. Select highest urgency signal
6. Call AI to generate final orchestrated explanation
7. Persist to Firestore
8. Return structured insight to frontend

**Example test:**
```javascript
it("orchestrates signals and returns the highest priority insight", async () => {
  const result = await runOrchestrator({
    userId: "user-1",
    anomalies: [anomaly],
    budgetComplianceList: [budget],
    cashflowData,
    riskData,
    isDemo: false,
  });

  expect(result.selectedSignalId).toBe("budget-food");
  expect(result.selectedSignalType).toBe("budget");
  expect(result.reason).toBeDefined();
  expect(result.priority).toBe("high");
});
```

## Utility Function Tests

SmartBudget includes tests for critical utility functions that format and transform data for display.

### Format Amount Tests

**File:** `src/tests/formatAmount.test.js`

Validates currency formatting across multiple locales.

**Test coverage:**
- USD, EUR, GBP formatting
- Proper thousand separators and decimal places
- Negative amounts
- Very large numbers (millions)
- Very small decimals (0.01)
- Zero amounts
- String input coercion
- Null/undefined handling

### Format Relative Time Tests

**File:** `src/tests/formatRelativeTime.test.js`

Validates human-readable time formatting.

**Test coverage:**
- "less than a minute ago"
- Day, hour, week ranges
- Multiple date input formats (Date, ISO string, timestamp, Firestore timestamp)
- Invalid date handling
- Null/undefined input

### Generate Category Key Tests

**File:** `src/tests/generateCategoryKey.test.js`

Validates generation of unique keys for categories.

**Test coverage:**
- Simple category names
- Special characters and spaces
- Multiple spaces and ampersands
- Numbers in category names
- Different prefix types
- Empty/null/undefined categories
- Proper normalization (lowercase, space-to-dash)

### Get Total Budget Spent Tests

**File:** `src/tests/getTotalBudgetSpent.test.js`

Validates aggregation of spending across categories.

### Transaction Total Tests

**File:** `src/tests/transactionTotal.test.js`

Validates transaction amount aggregation.

## Fixture Validation Tests

**File:** `src/tests/fixture-validation.test.js`

Test fixtures are critical to the test suite. They represent realistic user scenarios and must maintain data integrity.

**Test coverage:**
- All fixtures conform to realistic bank personas
- Income occurs before expenses in each month
- Transactions are in chronological order
- Budget fixtures are aligned with June spending windows
- Cashflow personas have proper income/expense ordering
- Anomaly personas have stable baselines before June spikes

**Example test:**
```javascript
it("models normalUser as a realistic bank customer", () => {
  assertRealisticBankPersona(normalUser);
  assertIncomeBeforeExpensesInMonth(normalUser.transactions, 6);

  const juneFood = normalUser.transactions.filter(
    tx => tx.type === "expense" && tx.category === "Food" && tx.date.startsWith("2026-06")
  );
  const historicalFood = normalUser.transactions.filter(
    tx => tx.type === "expense" && tx.category === "Food" && !tx.date.startsWith("2026-06")
  );

  expect(juneFood[0].amount).toBeLessThanOrEqual(
    Math.max(...historicalFood.map(tx => tx.amount)) + 50
  );
});
```

## Test Fixtures

Test fixtures live in `src/tests/fixtures/` and represent realistic user scenarios.

**Fixture categories:**

### User Personas
- `normalUser` — well-behaved, low-risk user with stable income and spending
- `noIncomeUser` — user with only expenses and no income in June
- `recurringSpendingUser` — user with spending spikes that repeat
- `pipelineCustomer` — enterprise demo user

### Overspending Scenarios
- `oneCategoryOverspendingUser` — single category over baseline (Food)
- `threeCategoryOverspendingUser` — three categories over baseline
- `buildMultiCategorySpikeUser(count)` — customizable multi-category spike

### Anomaly Scenarios
- `limitedHistoryUser` — sparse transaction history
- `persistentSpikeUser` — spending spike that persists multiple months
- `steadySpendingUser` — no anomalies
- `mediumSeverityAnomalyUser` — moderate-level anomaly
- `newCategoryUser` — first purchase in a new category
- `sparseHistoryTwoMonthUser` — only two months of history
- `independentCategorySpikeUser` — spike independent of other categories

### Budget Scenarios
- `exceedingBudgetsUser` — budget exactly at 100% (exceeded)
- `budgetAt99User` — budget at 99% (on track at month end)
- `budgetAt200User` — extreme overrun (200%)
- `budgetNoSpendingUser` — budget with no spending
- `multipleBudgetUser` — multiple category budgets
- `futureBudgetUser` — budget for future month
- `previousMonthBudgetUser` — budget for past month

### Cashflow Scenarios
- `cashflowRiskUser` — spending ~98% of income (RISK)
- `incomeAfterSpendingUser` — income received after expenses
- `monthIsolationUser` — tests month boundary logic
- `multipleIncomeSourcesUser` — three income sources in one month
- `cashflowBreakEvenUser` — spending equals income (break-even)
- `cashflowWithFutureTransactionsUser` — transactions in July for June analysis

### Edge Cases
- `duplicateTransactionUser` — identical transactions
- Various edge case configurations in `edgeCaseUsers`

## Running Tests

### Run All Tests

```bash
npm run test
```

This runs all tests in `/src/tests/` and `/backend/tests/` using Vitest.

### Watch Mode

```bash
npm run test -- --watch
```

Automatically re-runs tests when files change.

### Run Specific Test File

```bash
npm run test -- anomaly-engine.test.js
```

Run tests from a single file.

### Run Tests Matching Pattern

```bash
npm run test -- --grep "anomaly"
```

Runs tests with "anomaly" in the name.

### Run with Coverage

```bash
npm run test -- --coverage
```

Generates coverage report (if configured).

### Debug Tests

```bash
npm run test -- --inspect-brk
```

Runs tests with Node debugger enabled.

## Test Configuration

Vitest is configured in `vite.config.js`. Key settings:

- **Test environment:** Node (for unit tests)
- **Globals:** Enabled (describe, it, expect available without imports)
- **Coverage:** Configured for all source files

## Development Practices

### Adding Tests

When adding new features or fixing bugs:

1. **Create a test fixture** if testing user scenarios — use helper functions `budget()`, `income()`, `expense()`, `withUser()`
2. **Write tests first** for new engine logic — ensures behavior is well-defined before implementation
3. **Test invariants** for calculation-heavy code — validate mathematical constraints
4. **Mock external services** — use `vi.mock()` for Firebase, API calls
5. **Use fake timers** strategically — mock time-dependent behavior with `vi.useFakeTimers()`
6. **Validate edge cases** — test boundary conditions and extreme values

### Fixture Design

Fixtures should:
- Represent real user scenarios
- Maintain chronological order of transactions
- Pass schema validation (`assertFinanceRecordSchema`)
- Include both current-month and historical data
- Use realistic amounts and categories

### Engine Testing Strategy

For financial analysis engines:

1. **Test the core calculation** with simple fixtures
2. **Test boundary conditions** (0%, 99%, 100%, 200%)
3. **Test edge cases** (no data, sparse data, extreme values)
4. **Validate invariants** (accounting, projection formulas)
5. **Use consistent timestamps** with `fixedSystemDate`

## Architecture Decision: Deterministic Core

SmartBudget's test strategy reflects a core architectural principle:

**Financial analysis is deterministic. AI services are non-deterministic.**

This separation enables:
- **Engine tests** to be fast, reliable, and completely deterministic
- **AI service tests** to focus on prompt generation and safety, not output precision
- **Integration tests** to verify orchestration, signal scoring, and trigger logic

The deterministic core provides truth. AI services improve communication and personalization.

## Continuous Integration

Tests are run on every commit. All tests must pass before code is deployed.

**Test commands:**
```bash
npm run lint       # Check code style
npm run test       # Run all tests
npm run build      # Verify build succeeds
```

## Coverage Standards

SmartBudget maintains these coverage targets:
- **Financial engines:** 90%+ coverage (deterministic, critical path)
- **AI services:** 70%+ coverage (focuses on safety and prompt structure)
- **Orchestration:** 85%+ coverage (integration between domains)
- **Utilities:** 95%+ coverage (small, focused functions)

## Troubleshooting

### Tests timing out
If tests exceed the timeout (30s by default), check for:
- Unnecessary loops or expensive computations
- Missing `vi.useRealTimers()` cleanup
- Large fixture data sets

### Fake timer issues
When using fake timers:
1. Call `vi.setSystemTime()` before the test
2. Call `vi.useRealTimers()` in `afterEach` or at test end
3. Ensure dates are valid ISO format strings
4. Don't forget to reset timers when done

### Fixture data inconsistency
If fixture validation tests fail:
1. Verify transactions are in chronological order by date
2. Ensure income transactions occur before expenses in each month
3. Check all budget dates fall in June 2026
4. Validate all records have required fields and correct types
5. Confirm currency codes are valid (USD, EUR, GBP, etc.)

### Common assertion failures
- **Compliance status:** Verify the 100% threshold (100% = EXCEEDED, <100% = ON_TRACK)
- **Cashflow outcome:** Check percent spent calculation and income availability
- **Anomaly detection:** Confirm baseline calculation uses correct historical window
- **Risk scoring:** Validate that multiple signals are being combined correctly

## Further Reading

- [SmartBudget Overview](./OVERVIEW.md) — Product vision and system architecture
- [SmartBudget AI Architecture](./AI-ARCHITECTURE.md) — AI services, prompt engineering, and orchestration
- [Vitest Documentation](https://vitest.dev/) — Test framework reference
