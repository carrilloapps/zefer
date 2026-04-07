# Questioning Checklist

Load this file to run a rapid structured interrogation of any solution across 15 dimensions. Use before or during the analysis to ensure no dimension is skipped.

---

## For Every Solution, Ask:

### Correctness
- [ ] What edge cases are not handled?
- [ ] What assumptions might be wrong?
- [ ] What input could break this?
- [ ] What if the dependency fails?
- [ ] What if there is concurrent access?

### Security
- [ ] How would I exploit this as an attacker?
- [ ] What sensitive data is exposed or logged?
- [ ] Are all inputs validated and sanitized?
- [ ] Is authentication and authorization enforced at every layer?
- [ ] Are third-party dependencies audited for CVEs?

### Performance
- [ ] What is the worst-case time/space complexity?
- [ ] Where are the bottlenecks under realistic load?
- [ ] What happens at 10× current load?
- [ ] Are there N+1 queries or unbounded result sets?
- [ ] What is the memory footprint per request?

### Reliability
- [ ] What are the failure modes of each component?
- [ ] Is there a single point of failure?
- [ ] Can we roll back safely and completely?
- [ ] What happens on partial failure (some steps succeed, some fail)?
- [ ] Are all errors handled and surfaced correctly?

### Maintainability
- [ ] How much complexity does this add to the system?
- [ ] What technical debt is being created?
- [ ] How hard is this to debug in production?
- [ ] Is it documented well enough for someone new to own it?
- [ ] Can this be tested in isolation?

### Operability
- [ ] How is this deployed safely (zero-downtime, canary, feature flag)?
- [ ] What monitoring and alerting is needed?
- [ ] How do we know it is working correctly in production?
- [ ] What is the incident response runbook?
- [ ] Can it be debugged in production without downtime?

### Cost
- [ ] What is the estimated infrastructure cost at current and 10× load?
- [ ] Are there licensing or per-seat costs not yet budgeted?
- [ ] What is the Total Cost of Ownership (TCO) including maintenance?
- [ ] Does this create ongoing cost that grows with scale (e.g., per-API-call pricing)?
- [ ] Is there a cost ceiling or alert if spend exceeds budget?

### Product
- [ ] Is this solving a validated user problem, or an assumed one?
- [ ] What is the success metric, and can it be gamed without producing real value?
- [ ] What is the rollback or kill plan if the feature does not perform?
- [ ] Are there regulatory or compliance requirements that apply (GDPR, WCAG, HIPAA)?
- [ ] What happens to users who are mid-flow if this is rolled back?

### UX / Design
- [ ] Are all states designed: empty, loading, error, offline, partial failure?
- [ ] Does any part of the flow contain dark patterns or manipulative design?
- [ ] Is the flow accessible to users with disabilities (keyboard, screen reader, contrast)?
- [ ] Does the design match the mental model of the target user population?
- [ ] Has this flow been tested with real users, or only internally reviewed?

### Strategy
- [ ] Is this a Type 1 (irreversible) or Type 2 (reversible) decision?
- [ ] If Type 1, has it been reviewed with full adversarial rigor?
- [ ] Does this decision create vendor lock-in, and is there an exit plan?
- [ ] Is the team structured to own and operate this long-term (Conway's Law)?
- [ ] What is the key-person risk, and is knowledge documented?

### Architecture
- [ ] Are service boundaries clearly defined with no shared databases?
- [ ] Are all synchronous calls protected with timeouts and circuit breakers?
- [ ] Are retries bounded with exponential backoff and idempotent?
- [ ] Is there a schema or API contract version strategy?
- [ ] Can each component fail independently without taking down the system?
- [ ] Is there end-to-end distributed tracing with correlation IDs?

### Data
- [ ] Is the pipeline idempotent (safe to re-run without side effects)?
- [ ] Are data quality checks in place (nulls, duplicates, range, referential integrity)?
- [ ] Is PII identified, masked, and access-controlled appropriately?
- [ ] Is there a schema evolution strategy with backward compatibility?
- [ ] Are success metrics and KPIs defined consistently across teams?
- [ ] Is there a data retention and erasure policy that fulfills compliance obligations?

### Developer
- [ ] Are the critical paths covered by automated tests (unit + integration)?
- [ ] Are all dependencies pinned and scanned for vulnerabilities?
- [ ] Is the CI pipeline enforcing quality gates (lint, test, coverage, SAST)?
- [ ] Are all catch blocks handling errors explicitly (not swallowing them)?
- [ ] Is this safe to re-deploy multiple times (no duplicate side effects)?
- [ ] Does the local environment match production closely enough to prevent surprises?

### Building Protocol
- [ ] Are ALL identifiers (variables, functions, constants, files, DB columns, endpoints) written in `en_US`?
- [ ] Do naming conventions match the target language (camelCase, snake_case, PascalCase, SCREAMING_SNAKE_CASE)?
- [ ] Are there any magic numbers or magic strings that should be named constants?
- [ ] Are there any empty catch blocks, TODO stubs, or commented-out code in deliverable output?
- [ ] Are secrets, tokens, and credentials loaded from environment variables (never hardcoded)?
- [ ] Is all external input validated at the boundary before use?
- [ ] Do functions respect single responsibility (≤ 20 lines, ≤ 3 parameters)?
- [ ] Does each function have at least a happy-path test and one error/edge case test?
- [ ] Do commit messages follow Conventional Commits format in `en_US`?

### AI Optimization
- [ ] Are all always-loaded AI context files within safe token limits (target < 8K tokens; never > 16K)?
- [ ] Is there a single canonical source for each major instruction topic — no ambiguous duplicate rules?
- [ ] Are all cross-references (file links, section anchors, `See also` notes) valid and up to date?
- [ ] Are instructions specific enough to prevent hallucination — with concrete ✅ / ❌ examples, not just rules?
- [ ] Is there a progressive loading strategy — can irrelevant context be avoided for out-of-scope tasks?
- [ ] Are there any instruction conflicts across files that would cause non-deterministic AI behavior?
- [ ] Does each AI context file have a clear, explicit purpose and activation trigger?
- [ ] Are key domain terms, patterns, and constraints defined with at least one ✅ correct and one ❌ wrong example?

---

> 💡 **See also**: [`checklists/risk-checklist.md`](risk-checklist.md) — categorical risk scoring across Technical, Security, Operational, Cost, Organizational, Reversibility, Building Protocol, and AI Optimization. Use the risk checklist for fast pass/fail scoring; use this checklist for deep dimensional interrogation.
