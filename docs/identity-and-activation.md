# Identity and Account Activation

External systems may identify a customer differently from Firebase Authentication. SmartBudget keeps the external import identity separate from the canonical application user ID so existing authenticated-user behavior remains consistent.

## Identity Lifecycle

```text
external customer identity
        -> scoped normalized identity
        -> pre-activation customer
        -> account activation
        -> Firebase Auth user
        -> users/{authUid}
        -> staged data migration
        -> future imports route to the canonical user
```

The central invariant is:

```text
SmartBudget user ID = Firebase Auth UID
```

External identifiers are normalized before persistence and scoped to their integration source. They are not used as permanent application user IDs. This prevents identifiers from separate sources from being treated as the same person and avoids changing application code that relies on the authenticated UID.

## Before Activation

An imported customer and any available transactions can be staged without requiring a Firebase Auth account. The activation export connects that staged identity to an account-creation flow without exposing the external identifier as the application identity.

## Activation and Migration

After the customer creates an account, the backend verifies the Firebase identity and binds it to the staged import identity. Staged transactions then migrate to the canonical authenticated user. A permanent identity mapping allows future incremental imports to route directly to that account.

Activation and migration are designed for idempotent retries. Repeating a completed or partially completed activation must not create a second identity or duplicate migrated transactions.

## Security Properties

- raw activation credentials are not stored in plaintext
- authentication identity is verified by the backend
- sensitive activation exports are excluded from normal telemetry
- external identifiers remain separate from canonical authenticated user IDs
- activation state transitions protect against duplicate claims

See [Secure Data Ingestion](./data-ingestion.md) and [Reliability and Failure Recovery](./reliability-and-recovery.md).
