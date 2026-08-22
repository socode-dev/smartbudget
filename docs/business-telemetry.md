# SmartBudget Business Telemetry

SmartBudget business telemetry records whether the product is creating useful pilot evidence for institutions.

It is different from AI pipeline telemetry. AI telemetry answers, "Did the insight engine run correctly?" Business telemetry answers, "Did customers receive, see, and respond to useful financial insights?"

## What It Measures

Business telemetry focuses on a small evidence chain:

```text
Customer data -> insight generated -> insight viewed -> customer response -> observed financial change
```

The first version tracks only the signals needed for an institution pilot:

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

When SFTP import is added, SmartBudget will also track whether the institution data pipeline is working:

```text
sftp_import_received
sftp_import_processed
sftp_customer_imported
sftp_financial_data_imported
sftp_import_failed
```

## Why It Matters

For an institution pilot, SmartBudget needs to show more than technical activity. It needs to show that:

- customers entered or received usable financial data
- SmartBudget generated insights from that data
- customers saw the insights
- customers acknowledged or dismissed the insights
- financial behavior can be compared before and during the pilot

This supports pilot reporting without overclaiming causality. Reports should describe observed changes, not claim that SmartBudget alone caused those changes.

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

Business reports compare a baseline period against the pilot period.

Example:

```text
Baseline -> SmartBudget pilot -> observed change
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

The business telemetry layer should stay small. New events should be added only when they help answer a real pilot or institution reporting question.
