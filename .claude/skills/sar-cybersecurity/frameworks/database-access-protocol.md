# Database Access Protocol

> *Domain framework — counts toward the 2-framework-per-assessment budget.*
>
> Load this framework when the assessment target uses databases (SQL, NoSQL, or in-memory stores) and the agent needs to inspect schema, indexes, or query patterns directly.

> ⚠️ **Reference examples only** — The SQL, NoSQL, and CLI commands below are read-only reference patterns for the agent's analysis methodology. They illustrate the correct inspection sequence and bounded query approach. The agent must never execute destructive operations and must verify read-only intent before running any database command against a live system.

When database access is available and necessary, follow this strict sequence **regardless of engine type**.

---

## SQL Databases (PostgreSQL, MySQL, MariaDB, SQL Server, etc.)

### 1. Verify indexes first

```sql
-- PostgreSQL
SELECT indexname, indexdef FROM pg_indexes WHERE tablename = 'target_table';

-- MySQL / MariaDB
SHOW INDEX FROM target_table;
```

### 2. Build an optimized, explicit query using available indexes

```sql
SELECT id, created_at, relevant_column
FROM target_table
WHERE indexed_column = 'value'
ORDER BY created_at DESC
LIMIT 50;
```

### 3. Extract only the minimum data needed — never dump full tables.

---

## NoSQL Databases (MongoDB, DynamoDB, Firestore, Couchbase, etc.)

### 1. Verify indexes first

```js
// MongoDB
db.target_collection.getIndexes();

// Check index usage for a specific query
db.target_collection.find({ field: 'value' }).explain('executionStats');
```

```bash
# DynamoDB — describe table to see key schema and GSIs
aws dynamodb describe-table --table-name target_table
```

### 2. Build a bounded query using available indexes

```js
// MongoDB — use indexed field, project only needed fields, limit result set
db.target_collection.find(
  { indexed_field: 'value' },
  { _id: 1, created_at: 1, relevant_field: 1 }
).sort({ created_at: -1 }).limit(50);
```

```js
// DynamoDB — query on partition key, limit items
const params = {
  TableName: 'target_table',
  KeyConditionExpression: 'pk = :pk',
  ExpressionAttributeValues: { ':pk': { S: 'value' } },
  Limit: 50,
  ScanIndexForward: false
};
```

### 3. Extract only the minimum data needed — never use `find({})` without filters, never perform full collection scans.

---

## In-Memory / Key-Value Stores (Redis, Memcached, etc.)

1. Never use `KEYS *` in production analysis — use `SCAN` with a cursor and `COUNT` limit.
2. Inspect specific keys by pattern: `SCAN 0 MATCH prefix:* COUNT 50`.
3. Check key TTL and type before reading: `TYPE key` → `TTL key`.

---

## Missing Indexes as a Finding

If a table or collection queried by application code has **no indexes** (or only a default `_id` index in MongoDB) and is reachable via any user-controlled or high-frequency path, document it in the SAR. An attacker who identifies this pattern can trigger full table/collection scans to exhaust database resources (DoS vector). This may violate **ISO 27001 A.12**, **NIST SP 800-53 SC-5**, and **SOC 2 Availability** criteria.

---

## Database Inspection Checklist

| Check | Pass Criteria |
|-------|--------------|
| Indexes verified before any query | Index list retrieved and documented |
| Query uses available indexes | `EXPLAIN` output shows index scan, not sequential/full scan |
| Result set bounded | `LIMIT` or equivalent applied, ≤ 50 rows |
| Minimum columns/fields projected | Only assessment-relevant fields selected |
| No destructive operations | Read-only queries only — no `UPDATE`, `DELETE`, `DROP`, `remove()` |
| Connection string secure | No credentials in source code; connection via secrets manager |
