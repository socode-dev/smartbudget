# Secure Data Ingestion

SmartBudget can receive structured customer and transaction data from an external source without coupling file transport to import and domain logic.

## Processing Boundary

```text
external source
        -> transport layer
        -> incoming file discovery
        -> processing claim
        -> validation
        -> processImport()
        -> processed or failed
```

The transport layer discovers and moves files. The importer owns CSV parsing, schema validation, identity normalization, duplicate protection, and application writes. This separation allows the same importer to be tested independently of SFTP or another transport adapter.

Files must match the supported naming and type conventions. Regular-file and size checks happen before content processing, and the importer validates the content again before applying domain behavior. Malformed or unsupported input fails without being treated as a successful import.

## Customer Imports

```text
customer import
        -> scoped identity normalization
        -> pre-activation staging
        -> activation export generation
        -> secure outbound delivery
```

Imported customers remain separate from canonical application users until account activation. External identifiers are normalized within their integration scope, and sensitive outbound activation data is kept separate from ordinary telemetry and application records.

## Transaction Imports

```text
transaction import
        -> deterministic transaction identity
        -> duplicate protection
        -> staging or canonical-user routing
```

Transactions received before activation are staged with the imported customer. After identity binding, later imports route directly to the canonical user. Stable transaction identities allow incremental files and repeated batches to be processed without duplicating existing transactions.

## Reliability Properties

The current ingestion design provides:

- strict filename, file-type, and content validation
- file-level and transaction-level idempotency
- deterministic identities for duplicate suppression
- incremental customer and transaction processing
- isolated integration scopes
- incoming, processing, processed, and failed file states
- key-based SFTP authentication and host verification
- size validation before remote content is downloaded
- separate handling for sensitive activation exports

## Testing

Automated tests exercise the importer and activation services with emulated storage. A local transport adapter also simulates incoming and outgoing directories while calling the real import pipeline, which verifies the transport boundary without replacing domain logic with test-only behavior.

See [Identity and Account Activation](./identity-and-activation.md), [Reliability and Failure Recovery](./reliability-and-recovery.md), and [Testing](./TESTING.md).
