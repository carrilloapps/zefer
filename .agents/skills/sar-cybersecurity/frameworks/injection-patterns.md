# Injection Vulnerability Patterns

> *Domain framework — counts toward the 2-framework-per-assessment budget.*
>
> Load this framework when the assessment targets application code that interacts with databases, constructs dynamic queries, processes user input in regex patterns, or exposes GraphQL APIs. Covers all major injection families across SQL, NoSQL, regex, mass assignment, GraphQL, and ORM/ODM layers.

> ⚠️ **Reference patterns only** — Code snippets below illustrate vulnerable patterns for detection purposes and correct mitigations for reporting. They are not execution instructions. The agent uses these as recognition templates when scanning the target codebase.

The agent must actively scan for all of the following injection patterns across the codebase. These are **not limited to SQL** — every database engine and query language has its own injection surface.

---

## SQL Injection (PostgreSQL, MySQL, SQL Server, SQLite)

| Pattern | Risk | Detection |
|---------|------|-----------|
| String concatenation in queries | Critical | `"SELECT * FROM t WHERE id = '" + input + "'"` |
| Template literals without parameterization | Critical | `` `SELECT * FROM t WHERE id = ${input}` `` |
| ORM raw queries with user input | High | `.rawQuery(input)`, `sequelize.query(input)` |
| Dynamic table/column names from user input | High | `query[req.body.field]` as column selector |

**Correct mitigation:** Parameterized queries/prepared statements, ORM query builders, input validation against allowlists for dynamic identifiers.

---

## NoSQL Injection (MongoDB, Couchbase, Firestore)

| Pattern | Risk | Detection |
|---------|------|-----------|
| MongoDB operator injection | Critical | `req.body` passed directly to `.find()`, `.findOne()`, `.aggregate()` — allows `{"$ne": null}`, `{"$gt": ""}`, `{"$nin": []}` |
| Query filter is entire request body | Critical | `Model.findOne(req.body)` — attacker controls the full query |
| `$where` / `$expr` / `$function` injection | Critical | User input reaching server-side JS execution within MongoDB |
| Aggregation pipeline injection | High | `req.body` values interpolated into `$match`, `$project`, `$group` stages |
| Field name injection | High | `query[req.body.search_item]` — attacker chooses which field to query, can access `password`, `token`, internal fields |

**Correct mitigation:**
- Global sanitization middleware (e.g., `express-mongo-sanitize`) to strip `$` and `.` operators from user input
- Explicit field selection — never pass `req.body` directly as a query filter or update document
- Allowlists for field names when the client selects which field to search
- Schema-level validation (Mongoose schemas with `strict: true`, Joi, Zod)

---

## Regex Injection / ReDoS (all engines)

| Pattern | Primary Impact | Risk | Detection |
|---------|---------------|------|-----------|
| `new RegExp(userInput)` without escaping | **Data exfiltration** — `.*` matches all records | Critical | User can inject wildcard/alternation patterns to enumerate data |
| `new RegExp(userInput)` without escaping | **Availability-only** — `(a+)+$` causes CPU exhaustion | Warning (≤49) | Catastrophic backtracking, no data exposed. Delegate to performance tooling |
| regex in MongoDB queries from user input | **Data exfiltration** — `{ $regex: ".*" }` returns full collection | Critical | `{ field: { $regex: userInput } }` |
| Catastrophic backtracking patterns | **Availability-only** — service degradation | Warning (≤49) | Nested quantifiers on user-controlled input: `(a+)+$`, `(a|a)+$`. No data exposed |

> **Impact classification rule**: The same `new RegExp(userInput)` vulnerability may have two distinct attack vectors. If the data exfiltration vector is present (attacker can manipulate the regex to match/return more data than authorized), score on that vector as a primary finding. If the **only** exploitable vector is ReDoS/CPU exhaustion with no data leakage, cap at 49 (availability-only).

**Correct mitigation:**
- Always escape regex metacharacters before constructing `RegExp`: `value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')`
- Use a centralized `safeRegExp(input, flags)` utility
- Set regex execution timeouts where the engine supports it
- Prefer database-native text search (MongoDB `$text`, PostgreSQL `to_tsvector`) over regex for user-facing search

---

## Mass Assignment / Over-Posting (all ORMs and ODMs)

| Pattern | Risk | Detection |
|---------|------|-----------|
| `Model.findByIdAndUpdate(id, req.body)` | High | Entire request body as update — attacker can modify `role`, `isAdmin`, `balance`, any field |
| `Object.assign(record, req.body)` | High | Same as above — uncontrolled field merge |
| `Model.create(req.body)` without schema filtering | High | Attacker injects extra fields at creation time |
| Spread operator merge: `{ ...record, ...req.body }` | High | Uncontrolled override of any field |

**Correct mitigation:**
- Always use field allowlists: `pick(req.body, ['name', 'email', 'phone'])` or a DTO/schema that strips unknown fields
- Mongoose: use `Schema({ ... }, { strict: true })` and avoid `{ strict: false }` or `{ overwrite: true }`
- Sequelize/TypeORM: use explicit `update({ field: value })` instead of spreading the body
- Define `ALLOWED_FIELDS` per endpoint and use a shared `pickAllowedFields(body, allowedFields)` utility

---

## GraphQL Injection and Abuse

| Pattern | Risk | Detection |
|---------|------|-----------|
| Introspection enabled in production | Medium | `{ __schema { types { name } } }` exposes entire API surface |
| Deeply nested queries (DoS) | High | No query depth limit — `{ user { posts { comments { author { posts ... } } } } }` |
| Batch query abuse | High | Array of queries in single request without rate limiting |
| Resolver injection | Critical | User input passed directly to database query within resolver |

**Correct mitigation:** Disable introspection in production, enforce query depth and complexity limits, rate-limit batch operations, parameterize all resolver queries.

---

## ORM/ODM-Specific Patterns

| ORM/ODM | Pattern to detect | Risk |
|---------|--------------------|------|
| Mongoose | `.findOne(req.body)`, `.find(req.body)`, `{strict: false}` | Critical/High |
| Sequelize | `.query(rawSQL)`, `literal(userInput)` | Critical |
| TypeORM | `.query(rawSQL)`, `Raw(userInput)` | Critical |
| Prisma | `.$queryRaw(userInput)`, `.$executeRaw(userInput)` | Critical |
| Knex | `.raw(userInput)`, `.whereRaw(userInput)` | Critical |
| DynamoDB SDK | `FilterExpression` with string concatenation | High |

---

## Cross-Reference

- For database inspection procedures during assessment → see [`database-access-protocol.md`](database-access-protocol.md) *(domain framework — counts toward budget)*
- For storage layer vulnerabilities beyond databases → see [`storage-exfiltration.md`](storage-exfiltration.md) *(domain framework — counts toward budget)*
- For compliance standard mapping of injection findings → see [`compliance-standards.md`](compliance-standards.md) *(domain framework — counts toward budget)*
