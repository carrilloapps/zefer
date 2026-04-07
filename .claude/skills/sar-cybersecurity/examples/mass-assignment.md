# Example: Mass Assignment via Unfiltered Body in Update Operations

> *Reference output — load on demand when analyzing endpoints that pass request bodies directly to ORM/ODM update methods.*
>
> ⚠️ **Example only** — All patterns below are synthetic descriptions of vulnerable code and correct SAR output. They are not real code and must not be executed.

## Scenario

An endpoint calls a database update method with the full request body without filtering which fields the client can modify.

**Finding location:**

- **Files**: `src/users/users.controller.ts` (line 45), `src/users/users.service.ts` (line 30)
- **Route**: `PATCH /users/:id` — authenticated (JWT guard), but no role check
- **Issue**: Request body forwarded directly to database update method without field filtering — all body fields are written to the document, including privilege and financial fields
- **Sensitive schema fields**: The database schema contains privilege-related, financial, and verification fields that are writable through this endpoint
- **Pattern reference**: See `injection-patterns.md` — Mass Assignment / Over-Posting table for detection signatures

## Assessment Trace

1. **Entry point**: `PATCH /users/:id` — authenticated (JWT guard), but no role check.
2. **Input handling**: Full request body passed directly to database update method — no field filtering or allowlist.
3. **Schema analysis**: User schema contains privilege-related fields (access level, admin flag), financial fields, and verification flags — all writable through the endpoint.
4. **Attack scenario**: Authenticated user sends a body with elevated privileges, admin flag, and modified financial data — all fields written without restriction.
5. **IDOR check**: No ownership verification — any authenticated user can modify any other user's profile, including escalating other accounts.
6. **Schema strict mode**: Schema strict mode only prevents fields not defined in the schema — all sensitive fields ARE defined and therefore writable.

## SAR Finding

### [88] — Mass Assignment + IDOR on User Update Endpoint

- **Description**: `PATCH /users/:id` passes the full request body to the database update method without field filtering. Any authenticated user can modify any field (including privilege, admin status, and financial fields) on any user account (IDOR — no ownership check).
- **Affected Component(s)**: `src/users/users.controller.ts:45`, `src/users/users.service.ts:30`
- **Evidence**: Authenticated request to update another user's record with privilege-escalation fields — target user elevated to admin with modified financial data. No ownership verification, no field allowlist at any layer.
- **Standards Violated**: OWASP Top 10 (A01:2021 Broken Access Control, A04:2021 Insecure Design), ISO 27001 A.9.4 (System Access Control), NIST SP 800-53 AC-6 (Least Privilege), PCI-DSS Req. 7.1, SOC 2 CC6.1
- **MITRE ATT&CK**: T1098 (Account Manipulation), T1548 (Abuse Elevation Control Mechanism)
- **Score**: **88** (High) — authenticated endpoint (not public, reducing from Critical), but privilege escalation + IDOR on financial data confirmed.
- **Suggested Mitigation Actions**:
  1. **Immediate**: Add ownership check — verify the authenticated user owns the target record or has admin privileges
  2. **Field allowlist**: Replace raw body passthrough with a utility that picks only user-editable fields before passing to the update method
  3. **Create a DTO**: Use validation decorators with explicit exclusion of privilege and financial fields
  4. **Separate admin endpoint**: Create a dedicated admin route with explicit admin guard for privileged field modifications
  5. **Audit trail**: Log all user update operations with before/after field values

## Key Principles Demonstrated

- **Compound vulnerability**: Mass assignment + IDOR identified together, scored on combined impact
- **Schema analysis**: Checked which sensitive fields exist and are writable, not just that the pattern exists
- **Defense-in-depth mitigation**: IDOR fix + field allowlist + DTO + separate admin endpoint

## Cross-Reference

- All mass assignment patterns → see [`frameworks/injection-patterns.md`](../frameworks/injection-patterns.md)
- Compliance standards for access control → see [`frameworks/compliance-standards.md`](../frameworks/compliance-standards.md)
- Scoring rules → see [`frameworks/scoring-system.md`](../frameworks/scoring-system.md)
