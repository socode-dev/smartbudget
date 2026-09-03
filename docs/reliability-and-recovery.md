# Reliability and Failure Recovery

The data-ingestion and account-activation pipeline is designed to tolerate partial failures and safe retries without duplicating application data.

## Import Idempotency

Completed file fingerprints prevent the same batch from being applied repeatedly. Deterministic transaction identities provide a second layer of protection, so replaying a batch does not create duplicate transactions.

## File Lifecycle

```text
incoming -> processing -> processed
                       -> failed
```

A file is claimed by moving it into processing before import work begins. This reduces concurrent handling and makes the outcome visible: successful files move to processed, while rejected or unsuccessful files move to failed.

## Permanent and Retryable Failures

Permanent failures include malformed CSV, unsupported structure, invalid required values, and files that violate accepted constraints. These require corrected input rather than automatic replay.

Retryable failures include temporary transport outages, outbound delivery failures, and temporary backend or storage unavailability. Retrying these operations must preserve the same idempotency guarantees as the initial attempt.

## Activation Export Recovery

An activation export can be generated successfully while outbound delivery fails. Because the activation credential cannot be reconstructed from its stored representation, the pipeline bridges this delivery window with temporary encrypted recovery state.

```text
activation export generated
        -> temporary encrypted recovery state
        -> outbound delivery attempt
        -> success: recovery state removed
        -> failure: delivery can be retried
        -> expiry and cleanup prevent indefinite retention
```

This recovery state exists only for delivery continuity. It is not permanent customer data and is kept outside ordinary telemetry and logging.

## Recovery Principles

- retries must be idempotent
- sensitive payloads must not enter normal logs or telemetry
- recovery state must remain temporary
- successful delivery removes unnecessary sensitive recovery data
- operational telemetry records outcomes, not file contents or activation credentials
- malformed input fails clearly instead of being retried indefinitely

See [Secure Data Ingestion](./data-ingestion.md) and [Testing](./TESTING.md).
