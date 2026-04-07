# Example: Same Vulnerability Type, Different Scores — SQL Injection Comparison

> *Reference output — load on demand to understand how the multi-factor scoring system produces different scores for the same vulnerability type based on exploitation complexity, impact scope, and data sensitivity.*
>
> ⚠️ **Example only** — All patterns below are synthetic descriptions of vulnerable code and correct SAR output. They are not real code and must not be executed.

## Purpose

This example demonstrates **why honest scoring matters**. Two SQL injection vulnerabilities exist in the same codebase. Both are real, confirmed, and exploitable. But they are **not equal** — treating them as equivalent would misrepresent the actual risk profile, generate unnecessary alarm for one and dangerous complacency for the other.

---

## Scenario A — Public Endpoint, Full Table Enumeration, PII Exposure

```text
Vulnerable pattern (pseudocode):

  File: src/search/search.controller.ts — line 18
  Route: GET /api/search/users?q=...
  Guards: None — public endpoint, no authentication required
    → query parameter 'q' passed directly to searchService.findUsers(q)

  File: src/search/search.service.ts — line 42
  Function: findUsers(query)
    → constructs: SELECT id, email, full_name, phone, address FROM users WHERE full_name LIKE '%${query}%'
    → string interpolation, no parameterization
    → no LIMIT clause — returns all matching rows
    → fields returned: id, email, full_name, phone, address (all PII)
```

### Assessment Trace — Scenario A

1. **Entry point**: `GET /api/search/users?q=...` — public, no authentication.
2. **Input handling**: Query parameter `q` interpolated directly into SQL string. No sanitization, no parameterization.
3. **Middleware check**: No WAF, no rate limiting, no input validation middleware.
4. **Attack payload**: `q=' OR '1'='1' --` → returns entire `users` table.
5. **Result set**: No `LIMIT` clause — all rows returned. Table contains 50,000+ records.
6. **Data exposed**: `email`, `full_name`, `phone`, `address` — all PII fields, subject to GDPR/CCPA.
7. **Monitoring**: No query logging, no anomaly detection on this endpoint.

### SAR Finding — Scenario A

#### [92] — SQL Injection on Public Search Endpoint with Full PII Enumeration

- **Description**: `GET /api/search/users` passes user input directly into a SQL query via string interpolation. No authentication, no input validation, no result set limit. An attacker can extract the entire `users` table (50,000+ records) including email, full name, phone, and address.
- **Affected Component(s)**: `src/search/search.controller.ts:18`, `src/search/search.service.ts:42`
- **Evidence**:
  ```text
  Attack payload: q=' OR '1'='1' --
  Query executed: SELECT id, email, full_name, phone, address FROM users WHERE full_name LIKE '%' OR '1'='1' -- %'
  Result: 50,000+ rows with PII returned
  ```
- **Standards Violated**: OWASP Top 10 (A03:2021 Injection), GDPR Art. 32 (PII exposure), NIST SP 800-53 SI-10, CIS Controls 16.4, ISO 27001 A.14.2, SOC 2 CC6.6
- **MITRE ATT&CK**: T1190 (Exploit Public-Facing Application)
- **Score**: **92** (Critical)
- **Score Justification**:
  - Base severity: 90 (SQL injection, confirmed exploitable)
  - Exploitation Complexity: no adjustment — public endpoint, no auth, no barriers
  - Impact Scope: +5 — full table enumeration, no LIMIT, 50,000+ records
  - Data Sensitivity: +5 — PII fields (email, phone, address), GDPR exposure
  - No monitoring or detection mechanisms: no further adjustment (already at base)
  - **Final: 92** (capped at range ceiling, factors push above base)
- **Suggested Mitigation Actions**:
  1. **Emergency**: Disable the endpoint or add authentication immediately
  2. **Immediate**: Refactor to parameterized query: `WHERE full_name LIKE $1` with `['%' + query + '%']`
  3. **Short-term**: Add `LIMIT 50` to all search queries; add pagination
  4. **Medium-term**: Remove PII from search results — return only `id` and `full_name`; require the client to fetch full details via authenticated endpoint

---

## Scenario B — Authenticated Endpoint + API Key, Single Record, Non-Sensitive Data

```text
Vulnerable pattern (pseudocode):

  File: src/reports/reports.controller.ts — line 56
  Route: GET /api/internal/reports/:id
  Guards: JwtAuthGuard + ApiKeyGuard (requires both valid JWT and valid API key header)
  Rate limit: 10 requests/minute per user
    → path parameter 'id' passed to reportsService.getById(id)

  File: src/reports/reports.service.ts — line 73
  Function: getById(id)
    → constructs: SELECT report_name, created_at, status FROM reports WHERE id = '${id}'
    → string interpolation, no parameterization
    → returns single row (id is unique primary key)
    → fields returned: report_name, created_at, status (operational data, no PII)
```

### Assessment Trace — Scenario B

1. **Entry point**: `GET /api/internal/reports/:id` — requires JWT authentication + API key header.
2. **Guards**: `JwtAuthGuard` validates JWT token; `ApiKeyGuard` validates `x-api-key` header against a rotatable key stored in Secrets Manager.
3. **Rate limiting**: 10 requests/minute per authenticated user — limits enumeration speed.
4. **Input handling**: Path parameter `id` interpolated into SQL. Vulnerable to injection, but attacker must first have valid JWT + API key.
5. **Attack payload**: `id=1' OR '1'='1' --` → query returns first row only (SELECT returns single row due to PK lookup behavior and ORM single-result method).
6. **Data exposed**: `report_name`, `created_at`, `status` — internal operational data, no PII, no financial data, no credentials.
7. **Monitoring**: Request logging with user identification enabled on all authenticated endpoints.

### SAR Finding — Scenario B

#### [55] — SQL Injection on Authenticated Internal Reports Endpoint

- **Description**: `GET /api/internal/reports/:id` interpolates the path parameter into a SQL query without parameterization. The endpoint requires valid JWT authentication + API key, is rate-limited to 10 req/min, and returns only operational metadata (report name, date, status). No PII or sensitive data is exposed.
- **Affected Component(s)**: `src/reports/reports.controller.ts:56`, `src/reports/reports.service.ts:73`
- **Evidence**:
  ```text
  Attack payload: id=1' OR '1'='1' --
  Query executed: SELECT report_name, created_at, status FROM reports WHERE id = '1' OR '1'='1' --'
  Result: Single report metadata row (operational data only)
  Prerequisites: Valid JWT + valid API key + under rate limit
  ```
- **Standards Violated**: OWASP Top 10 (A03:2021 Injection), CIS Controls 16.4, ISO 27001 A.14.2
- **MITRE ATT&CK**: T1190 (Exploit Public-Facing Application) — mitigated by auth requirements
- **Score**: **55** (Medium)
- **Score Justification**:
  - Base severity: 90 (SQL injection, confirmed exploitable)
  - Exploitation Complexity: −10 (JWT auth required), −10 (API key required), −5 (rate limiting)
  - Impact Scope: −7 (single record return, PK lookup, no enumeration path)
  - Data Sensitivity: −10 (non-sensitive operational data, no PII, no financial, no credentials)
  - Monitoring: request logging active — attacker is identifiable
  - **Final: 55** (Medium — still a valid finding, but proportional to real risk)
- **Suggested Mitigation Actions**:
  1. **Short-term**: Refactor to parameterized query: `WHERE id = $1` with `[id]`
  2. **Medium-term**: Add input validation — `id` should be validated as UUID or integer before reaching the service layer
  3. **Low priority**: Add parameterized query lint rule to CI pipeline to prevent recurrence

---

## Side-by-Side Comparison

| Factor | Scenario A (Score: 92) | Scenario B (Score: 55) |
|--------|----------------------|----------------------|
| **Vulnerability type** | SQL Injection | SQL Injection |
| **Authentication** | None (public) | JWT + API Key |
| **Rate limiting** | None | 10 req/min |
| **Data returned** | 50,000+ PII records | Single operational record |
| **PII exposure** | Yes (email, phone, address) | No |
| **Enumeration possible** | Yes (no LIMIT) | No (PK lookup, single row) |
| **Monitoring** | None | Request logging with user ID |
| **Remediation urgency** | Emergency | Planned (short-term) |
| **Score** | **92 — Critical** | **55 — Medium** |

> Both findings are **real SQL injections** that must be fixed. The difference is **when and how urgently**. Scenario A is an emergency that could result in a data breach within hours. Scenario B is a legitimate finding that should be fixed in the next sprint, but it does not represent an imminent threat to user data.

---

## Key Principles Demonstrated

- **Same type, different scores**: Both are SQL injection — but real-world risk is not determined by vulnerability type alone
- **Multi-factor justification**: Every score explicitly lists the exploitation complexity, impact scope, and data sensitivity factors
- **Proportional urgency**: Remediation timelines match actual risk — emergency vs. planned
- **Professional honesty**: Neither finding is omitted or inflated — both are documented with evidence, but scored proportional to their real impact

## Cross-Reference

- Multi-factor scoring system → see [`frameworks/scoring-system.md`](../frameworks/scoring-system.md)
- SQL injection patterns → see [`frameworks/injection-patterns.md`](../frameworks/injection-patterns.md)
- Compliance standards → see [`frameworks/compliance-standards.md`](../frameworks/compliance-standards.md)
