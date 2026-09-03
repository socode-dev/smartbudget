# SmartBudget Business Telemetry

SmartBudget business telemetry records whether the product is delivering useful financial guidance and measurable engagement.

It is different from AI pipeline telemetry. AI telemetry answers, "Did the insight engine run correctly?" Business telemetry answers, "Did customers receive, see, and respond to useful financial insights?"

## What It Measures

Business telemetry focuses on a small evidence chain:

```text
Customer data -> insight generated -> insight viewed -> customer response -> observed financial change
```

The current reporting model recognizes a deliberately small set of product signals:

```text
customer_imported
customer_claimed
customer_active

insight_generated
insight_viewed
insight_acknowledged
insight_dismissed
insight_expired

budget_breach
budget_breach_resolved
anomaly_detected
```

Secure file ingestion also records whether the external data pipeline is working. The operational categories cover:

```text
import received
import processed
customer data imported
financial data imported
import failed
```

## Why It Matters

SmartBudget needs to show more than technical activity. It needs to show that:

- customers entered or received usable financial data
- SmartBudget generated insights from that data
- customers saw the insights
- customers acknowledged or dismissed the insights
- financial behavior can be compared across meaningful evaluation periods

Reports should describe observed changes without claiming that SmartBudget alone caused them.

## Insight Responses

Each insight can have one final customer response:

```text
ACKNOWLEDGED
DISMISSED
EXPIRED
```

The insight card gives customers two simple actions:

```text
Acknowledge
Dismiss
```

`Acknowledge` means the customer saw the insight and considered it worth acting on. It does not yet claim that a verified financial action happened.

## Reporting

Business reports can compare a baseline period against a later evaluation period.

Example:

```text
Baseline -> later period -> observed change
```

The report uses unique customer counts for key events, so one customer does not inflate the result by triggering the same event many times in a day.

## Implementation Files

```text
backend/ai/telemetry/businessLogger.js
backend/ai/telemetry/businessMetrics.js
backend/ai/telemetry/businessReport.js
backend/ai/telemetry/customerMetrics.js
backend/ai/telemetry/businessBehaviourTelemetry.js
api/telemetry/business.js
api/telemetry/report.js
api/insights/respond.js
src/api/businessTelemetry.js
src/api/respondToInsight.js
src/utils/insightTelemetry.js
```

The business telemetry layer should stay small. New events should be added only when they answer a concrete product question.
