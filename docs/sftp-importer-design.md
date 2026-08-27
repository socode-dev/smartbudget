````markdown
# SmartBudget Pilot Security & SFTP Importer Design

## 1. Goal

The pilot architecture should let a institution securely send customer financial data to SmartBudget, continuously update that data, give customers seamless access, and avoid unnecessary duplication or exposure of sensitive information.

Core flow:

```text
Bank → SFTP → Quarantine → Validate → Normalize → Deduplicate → Persist → Evaluate → Insight → Customer Access
````

---

## 2. Minimum Bank Data

### `customers.csv`

Required:

```text
customer_id
name
email
```

`email` is required for the current invitation/authentication flow.

Name or Email are not used as the primary identity.

### `transactions.csv`

Required:

```text
transaction_id
customer_id
category
type
amount
date
```

Optional:

```text
description
```

Avoid importing `description` in V1 unless SmartBudget genuinely needs it because free text may contain unnecessary PII.

SmartBudget derives:

```text
name = category
categoryKey = normalizeCategory(category)
createdAt = server timestamp
```

---

## 3. Identity Normalization

The bank sends:

```text
customer_id
```

SmartBudget should never persist that raw value as its internal identity.

At the importer boundary:

```text
customer_id
    ↓
HMAC-SHA256(institutionId + ":" + customer_id)
    ↓
userId
```

The generated `userId` becomes SmartBudget's canonical identifier.

Persist using the existing structure:

```text
users/{userId}
users/{userId}/transactions/{transactionId}
users/{userId}/budgets
users/{userId}/insights
```

This keeps the rest of SmartBudget using `userId` without introducing a separate `customerId` concept.

The HMAC secret must remain server-side.

---

## 4. Transaction Identity

Normalize transaction IDs the same way.

```text
transaction_id
    ↓
HMAC-SHA256(institutionId + ":" + transaction_id)
    ↓
transactionId
```

Persist:

```text
users/{userId}/transactions/{transactionId}
```

This makes imports idempotent.

If the same transaction is sent again:

```text
same transaction_id
→ same transactionId
→ already exists
→ skip
```

---

## 5. Sensitive Data Handling

Use data minimization.

### Pseudonymize

Use deterministic HMAC values for:

```text
customer_id
transaction_id
account identifiers if added later
```

### Keep recoverable only when needed

SmartBudget needs:

```text
name
email
```

for the user profile and activation flow.

Keep these protected by strict backend/Firestore access and never include them in telemetry or application logs.

Do not import:

```text
BVN
NIN
full account number
card information
PIN
unnecessary addresses
```

unless a future pilot has a justified requirement.

---

## 6. SFTP Security

Each institution should have isolated SFTP access.

Use:

* SSH key authentication
* Unique credentials per bank
* Bank-specific directories
* SFTP-only access
* Host-key verification
* Key rotation and revocation
* Secrets stored outside source control

Example:

```text
/bank-a/incoming/
/bank-b/incoming/
```

One bank must never be able to access another bank's files.

---

## 7. File Security Boundary

Never trust a file because it arrived through SFTP.

Use:

```text
SFTP
  ↓
Quarantine
  ↓
File validation
  ↓
Schema validation
  ↓
Row validation
  ↓
Normalization
  ↓
Deduplication
  ↓
Persistence
```

V1 should accept only:

```text
.csv
```

Set limits for:

* File size
* Row count
* Column count
* Cell length

Reject malformed files before writing anything to Firestore.

---

## 8. Import Validation

Validate every transaction:

```text
transaction_id → required
customer_id    → required
category       → required
type           → income | expense
amount         → finite positive number
date           → valid YYYY-MM-DD
description    → optional, length-limited
```

Reject unexpected or invalid values.

SmartBudget-controlled fields such as `createdAt`, `userId`, `categoryKey`, `authUid`, and insight state must never come from the bank CSV.

---

## 9. Importer Flow

```text
New SFTP file
   ↓
Create importId
   ↓
Calculate file hash
   ↓
Already processed?
   ├── Yes → stop
   └── No
        ↓
Validate file
        ↓
Parse rows
        ↓
For each row:
    customer_id → userId
    transaction_id → transactionId
        ↓
Customer exists?
    ├── No → create user document
    └── Yes → continue
        ↓
Transaction exists?
    ├── Yes → skip
    └── No → persist transaction
        ↓
Evaluate relevant new activity
        ↓
Run SmartBudget financial signals
        ↓
Generate insight if necessary
```

Do not reprocess the customer's entire history just because a new import arrived.

---

## 10. Import Replay Protection

For every file:

```text
fileHash = SHA-256(file contents)
```

Store:

```js
{
  importId,
  institutionId,
  fileHash,
  status,
  totalRows,
  acceptedRows,
  duplicateRows,
  rejectedRows,
  receivedAt,
  processedAt
}
```

If the same file is uploaded again:

```text
same institution + same fileHash
→ skip
```

Transaction-level deduplication must still remain because different files can overlap.

---

## 11. Customer Creation

When a new imported customer is first seen:

```js
users/{userId}
{
  userId,
  institutionId,
  pilotId,
  name,
  email,
  authUid: null,
  status: "PENDING_ACTIVATION",
  createdAt
}
```

Their transactions can already be imported before they activate.

No second user document should be created later.

---

## 12. Invitation Flow

After the customer is created:

```text
User imported
   ↓
No authUid?
   ↓
No valid invite?
   ↓
Generate secure token
   ↓
Send invitation
```

The invitation token must be:

* Cryptographically random
* Single-use
* Short-lived
* Stored only as a hash
* Bound to one `userId`
* Invalidated immediately after activation
* Rate-limited

Do not send another invite every time the bank sends new transactions.

---

## 13. Authentication

Do not email a generated password.

Activation should be:

```text
Customer opens invite
   ↓
Token validated
   ↓
Existing userId resolved
   ↓
Customer sets password
   ↓
Firebase Auth account created
   ↓
authUid linked to users/{userId}
   ↓
Token invalidated
```

The token only allows the customer to claim the existing imported SmartBudget user.

It is not their identity.

---

## 14. Authorization

After activation:

```text
Firebase auth.uid
      ↓
resolve linked userId
      ↓
authorize access
      ↓
users/{userId}
```

The customer can only access their own:

```text
transactions
budgets
insights
profile
```

The importer runs server-side with privileged credentials.

Never expose importer permissions to the browser.

---

## 15. Incremental Imports

Prefer:

```text
transactions_2026-08-24.csv
transactions_2026-08-25.csv
transactions_2026-08-26.csv
```

The importer should:

```text
read new rows
→ normalize IDs
→ skip duplicates
→ persist only new transactions
→ evaluate only affected users
```

This keeps Firestore and AI costs lower.

---

## 16. OpenAI / AI Boundary

Never send raw bank CSV data or customer identity to the LLM.

Use:

```text
Imported transactions
   ↓
Deterministic financial engines
   ↓
Structured financial signals
   ↓
Minimal AI context
   ↓
LLM
```

Do not send:

```text
name
email
raw customer_id
raw transaction_id
bank identifiers
```

The LLM only needs financial facts.

---

## 17. Logs & Telemetry

Never log:

```text
name
email
raw customer_id
raw transaction_id
raw CSV rows
invite token
transaction description
```

Use pseudonymous/internal fields instead:

```js
{
  institutionId,
  pilotId,
  importId,
  userId,
  eventType,
  result,
  reasonCode,
  occurredAt
}
```

Business telemetry should also use `userId`, not PII.

---

## 18. Data Retention

### Raw SFTP files

Keep only long enough for:

```text
validation
processing
reconciliation
```

Then delete them.

### Imported financial data

Retain according to the pilot agreement.

### Invitation tokens

Invalidate/delete after use or expiry.

### Telemetry

Prefer pseudonymous or aggregated records.

---

## 19. Pilot End

When a pilot ends:

```text
Disable imports
   ↓
Revoke SFTP credentials
   ↓
Invalidate outstanding invites
   ↓
Delete temporary/raw files
   ↓
Apply agreed customer-data retention/deletion
   ↓
Retain only permitted telemetry
```

---

## 20. V1 Security Principles

1. Normalize bank `customer_id` into SmartBudget `userId` at the importer boundary.
2. Never persist raw bank customer IDs as SmartBudget identities.
3. Normalize `transaction_id` into deterministic internal transaction IDs.
4. Use one canonical `users/{userId}` record.
5. Do not duplicate customer or transaction data during activation.
6. Use incremental imports.
7. Make imports idempotent.
8. Validate files and rows before Firestore writes.
9. Keep SFTP access isolated per institution.
10. Use single-use secure invite tokens.
11. Never email passwords.
12. Keep PII out of telemetry and logs.
13. Keep raw PII out of the LLM.
14. Process only affected users when new transactions arrive.
15. Delete raw files after reconciliation.
16. Define pilot cleanup before accepting real bank data.

This is the security and importer design I would lock down before implementation.