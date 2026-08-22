# SmartBudget AI Telemetry

SmartBudget AI telemetry records whether the insight engine is working reliably.

It is the technical side of telemetry. Business telemetry answers whether customers and institutions are getting value. AI telemetry answers whether the backend pipeline ran, selected the right kind of signal, handled failures, and persisted an insight.

For business and pilot metrics, see [Business Telemetry](./business-telemetry.md). For the wider AI flow, see [SmartBudget AI Architecture](./ai-architecture.md). For deterministic financial facts, see [Financial Signals](./financial-signals.md).

## Purpose

AI telemetry helps answer:

- Did the insight pipeline run?
- Did it succeed, fail, fallback, or get blocked?
- Which guardrail blocked it?
- Did the AI agent time out or return invalid output?
- Was an insight saved for the customer?
- How long did the run take?

This gives SmartBudget operational confidence during normal use and institution pilots.

## What Gets Tracked

### Pipeline Runs

`aiPipelineRuns` records one full backend insight run.

It tracks the high-level result:

```text
success
fallback
failed
blocked
```

It also records why the run ended that way, how many financial signals were considered, which signal was selected, whether an insight was persisted, and how long the run took.

### Agent Runs

`aiAgentRuns` records the selected AI specialist run.

It tracks whether the agent succeeded, timed out, returned malformed output, or used a fallback. This helps separate product issues from model/provider issues.

### Generated Insight Events

`insightEvents` records backend insight generation.

Current event:

```text
INSIGHT_GENERATED
```

It stores the insight ID, insight type, selected signal, severity, model/fallback status, and orchestration reason.

## Storage

Telemetry writes both raw events and daily counters.

Raw events are useful for debugging one user or one failed run:

```text
users/{userId}/telemetry/{category}/events/{eventId}
```

When institution context exists, events are mirrored for pilot review:

```text
institutions/{institutionId}/{category}/{eventId}
```

Daily counters are used for dashboards and reports:

```text
globalMetrics/daily/records/{dateKey}__{category}/shards/{shardId}
institutions/{institutionId}/pilots/{pilotId}/dailyMetrics/{dateKey}__{category}/shards/{shardId}
```

The counters are sharded so repeated writes for the same day do not overload one Firestore document.

## Failure Behavior

Telemetry should never break insight generation.

If a telemetry write fails, SmartBudget logs the failure and continues the main insight flow where possible.

## Implementation Files

```text
backend/ai/telemetry/logger.js
backend/ai/telemetry/writeTelemetryEvent.js
backend/ai/telemetry/utils.js
backend/ai/services/orchestrator.js
backend/ai/orchestrator/agentExecution.js
```

Keep this layer focused on backend reliability. Customer response, adoption, SFTP import health, and pilot value belong in business telemetry.
