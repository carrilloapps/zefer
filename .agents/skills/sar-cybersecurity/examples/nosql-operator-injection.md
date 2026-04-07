# Example: NoSQL Operator Injection via Direct Body Passthrough

> *Reference output — load on demand when analyzing MongoDB/NoSQL query patterns with user input.*
>
> ⚠️ **Example only** — All patterns below are synthetic descriptions of vulnerable code and correct SAR output. They are not real code and must not be executed.

## Scenario

An authentication endpoint passes unvalidated user input directly to a database query. An attacker sends a query operator object instead of the expected string value to extract unauthorized records.

**Finding location:**

- **Files**: `src/auth/auth.service.ts` (line 34), `src/auth/auth.controller.ts` (line 12)
- **Route**: `POST /login` — public endpoint, no authentication required
- **Issue**: Request body field forwarded to database query method without type validation or sanitization — the field accepts arbitrary objects where only a string is expected
- **Missing controls**: No input sanitization middleware, no DTO or schema validation
- **Pattern reference**: See `injection-patterns.md` — NoSQL Injection table for detection signatures

## Assessment Trace

1. **Entry point**: `POST /login` — public endpoint, no auth required.
2. **Input handling**: Request body field forwarded to database query function without type validation — accepts arbitrary objects where a string is expected.
3. **Schema check**: Database schema defines the field as String type, but strict mode only applies to document creation, not query filters.
4. **Middleware check**: No input sanitization middleware in the application chain.
5. **Impact**: Attacker sends a query operator object instead of a string → the database filter matches unintended documents → returns the **first document in the collection** (typically an admin created early). Combined with password-less flows or password reset, this enables full account takeover.
6. **Scale**: Searched codebase for similar patterns — found **14 additional endpoints** forwarding request body fields directly to database query methods without validation.

## SAR Finding

### [92] — NoSQL Operator Injection via Direct Body Passthrough (15 Endpoints)

- **Description**: `POST /login` and 14 additional endpoints pass user input directly to database query filters without sanitization. An attacker can inject query operator objects to bypass authentication, enumerate data, or extract the entire collection.
- **Affected Component(s)**: `src/auth/auth.service.ts:34`, `src/auth/auth.controller.ts:12`, and 14 additional endpoints (see Appendix for full list)
- **Evidence**: Operator object injected via request body field on public endpoint — database query returns first document in collection (admin account). No authentication barriers, no input validation at any layer.
- **Standards Violated**: OWASP Top 10 (A03:2021 Injection), NIST SP 800-53 SI-10, CIS Controls 16.4, ISO 27001 A.14.2, GDPR Art. 32 (if PII exposed), SOC 2 CC6.6
- **MITRE ATT&CK**: T1190 (Exploit Public-Facing Application), T1078 (Valid Accounts — via auth bypass)
- **Score**: **92** (Critical) — public endpoint, no sanitization at any layer, full collection exfiltration possible, PII exposure confirmed (email, name, phone fields in user schema).
- **Suggested Mitigation Actions**:
  1. **Immediate**: Install and apply input sanitization middleware globally to strip query operators from user input
  2. **Short-term**: Create DTOs for all endpoints with strict type enforcement on every field
  3. **Medium-term**: Audit all 15 endpoints for explicit field validation; enforce type coercion on all query filter values
  4. **Schema hardening**: Enable strict mode on all database schemas
  5. **Testing**: Add integration tests with operator injection payloads to verify sanitization

## Key Principles Demonstrated

- **Systemic pattern detection**: Found 14 additional vulnerable endpoints beyond the initial finding
- **Full attack chain**: Traced from public endpoint to database query to data exposure
- **PII impact assessment**: Evaluated which fields are exposed, not just that a query is injectable
- **Layered mitigation**: Immediate → short-term → medium-term remediation path

## Cross-Reference

- All NoSQL injection patterns → see [`frameworks/injection-patterns.md`](../frameworks/injection-patterns.md)
- MongoDB inspection procedures → see [`frameworks/database-access-protocol.md`](../frameworks/database-access-protocol.md)
- Standard mapping guide → see [`frameworks/compliance-standards.md`](../frameworks/compliance-standards.md)
