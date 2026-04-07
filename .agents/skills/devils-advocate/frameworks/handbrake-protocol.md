# 🛑 Handbrake Protocol

> **Purpose**: When a Devil's Advocate analysis surfaces a **Critical finding** in a specific domain, the Handbrake forces a full stop and escalates to the responsible specialist role for deeper context before any pre-mortem or implementation can proceed.
>
> The Handbrake is **stronger than the Gate**. The Gate waits for approval. The Handbrake waits for expert context first, then re-runs the analysis at a deeper level, then waits for approval.

---

## When to Activate the Handbrake

Activate the Handbrake when **any** of the following are true:

| Condition | Example |
|-----------|---------|
| One or more 🔴 Critical findings detected | SQL injection in payment flow, PII unmasked, no rollback on migration |
| Three or more 🟠 High findings in the same domain | Multiple auth gaps, multiple data quality issues in the same pipeline |
| A finding involves irreversible consequences | Data deletion without backup, schema drop, financial transaction without idempotency |
| A finding exposes user safety, legal, or compliance risk | GDPR erasure gap, WCAG failure on core flow, unlicensed OSS in commercial product |
| A multi-domain critical: two or more roles are affected simultaneously | Architecture + Security both Critical |

---

## Handbrake Flow

```
DEVIL'S ADVOCATE ANALYSIS
         │
         ▼
   🔴 Critical found?
   or 3+ 🟠 High same domain?
         │
        YES
         │
         ▼
  🛑 HANDBRAKE ACTIVATED
  ─────────────────────────────────────────────────────
  1. STOP         Stop all analysis output mid-stream.
                  Do NOT produce implementation plan.
                  Do NOT produce the Gate prompt yet.
         │
         ▼
  2. IDENTIFY     Name the critical finding.
                  Map it to the responsible role.
                  State why it is Handbrake-level.
         │
         ▼
  3. ESCALATE     Explicitly recommend that the responsible
                  role specialist is consulted or present
                  before proceeding.
         │
         ▼
  4. INTERROGATE  Ask 3–6 targeted context questions
                  specific to that role and domain.
                  (see Context Question Templates below)
         │
         ▼
  5. WAIT         Do NOT proceed. Do NOT continue analysis.
                  Wait for the requested context.
         │
         ▼
  6. RE-ANALYSE   Incorporate the new context.
                  Run a deeper pre-mortem (load premortem.md).
                  Re-score all risks with updated evidence.
         │
         ▼
  7. GATE         Now produce the full report.
                  Proceed with normal Gate Protocol.
  ─────────────────────────────────────────────────────
```

---

## Role → Escalation Map

| Critical Domain | Responsible Role | Escalation Action |
|-----------------|-----------------|-------------------|
| Distributed systems, API contracts, service coupling | **Software Architect** | "This must be reviewed with the Software Architect before proceeding." |
| Data pipeline, data quality, schema, PII, ML models | **Data Engineer / Analytics Engineer** | "This requires input from the Data Engineer responsible for this pipeline." |
| Security, auth, cryptography, supply chain | **Security Engineer / AppSec** | "This must be reviewed by the Security team before merging." |
| Code quality, CI/CD, testing strategy, dependencies | **Senior Developer / Tech Lead** | "This needs a senior engineering review before this change is approved." |
| Feature assumptions, metrics, regulatory, launch | **Product Manager / Product Owner** | "This requires the Product Manager to validate assumptions and compliance." |
| UX flows, accessibility, dark patterns, error states | **UX Designer / Accessibility Lead** | "This must be reviewed with the UX Designer or Accessibility Lead." |
| Technology strategy, vendor, team topology, build vs. buy | **CTO / VP Engineering** | "This is a strategic decision that requires CTO or VP Eng sign-off." |
| Financial calculations, billing, revenue recognition | **Finance / Accounting stakeholder** | "This must be validated by Finance before going to production." |
| Legal / licensing / cross-border data / compliance | **Legal / Compliance team** | "This must be reviewed by Legal or the Compliance team before proceeding." |
| AI context / agent instructions quality | **Tech Lead / AI Tooling Lead** | "This must be reviewed by the Tech Lead or AI Tooling Lead responsible for the AI context strategy." |
| Version control / repository operations | **Senior Developer / Tech Lead** | "This must be reviewed by the Tech Lead before any irreversible git operation (force push, history rewrite, branch deletion) is executed." |
| Performance bottlenecks, scalability, resource limits, N+1 queries | **Senior Developer / Tech Lead** | "This must be reviewed by the Tech Lead before any deployment affecting performance-critical paths." |

---

## Context Question Templates

### 🏛️ For Architecture Critical Findings

Ask the **Software Architect**:

```markdown
🛑 HANDBRAKE — Architecture Critical Finding
I need the following context from the Software Architect before the analysis can continue:

1. **Service boundaries**: How is this service's bounded context defined? What data does it own exclusively?
2. **Failure isolation**: If this service fails completely, what other services are affected? Is there a bulkhead?
3. **Contract versioning**: How are breaking API changes communicated to consumers today? What is the migration window?
4. **Distributed transaction**: If step N fails, what is the explicit compensation or rollback for steps 1 to N-1?
5. **Observability**: What tracing and alerting exists today that covers this critical path?
6. **Reversibility**: Is this a structural change that cannot be undone once deployed (Type 1)? What is the exit plan?
```

### 📊 For Data / Analytics Critical Findings

Ask the **Data Engineer / Analytics Engineer**:

```markdown
🛑 HANDBRAKE — Data Critical Finding
I need the following context from the Data Engineer before the analysis can continue:

1. **Idempotency**: Is this pipeline safe to re-run after a partial failure? What is the deduplication strategy?
2. **PII inventory**: Which fields in this dataset contain personally identifiable information, and how are they masked or access-controlled?
3. **Data contract**: Is there a documented schema contract between the producer and consumers? Who owns it?
4. **Erasure & retention**: If a user requests deletion under GDPR/CCPA, how is their data removed from this table, partition, or event log?
5. **Quality gates**: What automated checks run to validate the data before it reaches downstream consumers?
6. **Schema evolution**: How are breaking schema changes communicated and migrated without breaking downstream consumers?
```

### 🔒 For Security Critical Findings

Ask the **Security Engineer / AppSec**:

```markdown
🛑 HANDBRAKE — Security Critical Finding
I need the following context from the Security team before the analysis can continue:

1. **Threat model**: Is there an existing threat model for this component? Has STRIDE been applied?
2. **Attack surface**: What external inputs reach this code path? Are any user-controlled?
3. **Authentication boundary**: Where exactly is authentication enforced? Is authorization checked at every layer?
4. **Sensitive data scope**: What is the classification of data exposed here (public / internal / confidential / restricted)?
5. **Existing controls**: What WAF, rate limiting, or intrusion detection covers this endpoint today?
6. **Incident history**: Has this component or a similar one been involved in a previous security incident?
```

### 💻 For Developer / Code Critical Findings

Ask the **Senior Developer / Tech Lead**:

```markdown
🛑 HANDBRAKE — Code Critical Finding
I need the following context from the responsible developer before the analysis can continue:

1. **Test coverage**: What automated tests currently cover this code path? What is the coverage percentage on this module?
2. **Error handling**: How are failures in this code path surfaced — to logs, to alerts, to the user?
3. **Retry & idempotency**: Is this operation safe to retry? What prevents duplicate side effects?
4. **Dependency chain**: Which upstream and downstream services does this change affect?
5. **Rollback plan**: If this change causes a regression in production, what is the rollback procedure and estimated time?
6. **Concurrent access**: Can multiple requests or workers hit this code path simultaneously? How is shared state protected?
```

### 📦 For Product / PM Critical Findings

Ask the **Product Manager / Product Owner**:

```markdown
🛑 HANDBRAKE — Product Critical Finding
I need the following context from the Product Manager before the analysis can continue:

1. **Assumption validation**: Which core assumptions in this plan have been validated with real user research (vs. internal opinion)?
2. **Success definition**: What is the primary success metric, and what is the guardrail metric that would cause us to kill this feature?
3. **Regulatory exposure**: Has Legal or Compliance reviewed this feature for GDPR, WCAG, HIPAA, COPPA, financial regulation, or sector-specific compliance?
4. **Rollback scenario**: If the feature ships and fails to meet the success metric, what is the plan to roll it back or pivot?
5. **Affected users in flight**: If we roll back mid-rollout, what happens to users who are mid-flow or have already used the feature?
6. **Precedent risk**: Does this feature create a product precedent that is hard to reverse (pricing model, data usage, user permissions)?
```

### 🎨 For UX / Design Critical Findings

Ask the **UX Designer / Accessibility Lead**:

```markdown
🛑 HANDBRAKE — UX / Design Critical Finding
I need the following context from the UX Designer before the analysis can continue:

1. **User research basis**: Has this flow been tested with real users? What methodology (usability test, A/B, analytics)?
2. **Accessibility audit**: Has this flow been evaluated against WCAG 2.1 AA? Which criteria are not yet covered?
3. **All states designed**: Are error, empty, loading, offline, and partial-failure states explicitly designed and included in specs?
4. **Dark pattern review**: Has each interaction in this flow been reviewed for manipulative design (urgency, hidden costs, forced continuity)?
5. **i18n & localization**: Does this design accommodate RTL languages, different date/number formats, and varying text lengths?
6. **Cognitive load**: On the most complex screen, how many decisions or pieces of information does the user need to process simultaneously?
```

### 🏢 For Strategy / CTO Critical Findings

Ask the **CTO / VP Engineering**:

```markdown
🛑 HANDBRAKE — Strategic Critical Finding
I need the following context from the CTO / VP Engineering before the analysis can continue:

1. **Decision reversibility**: Is this a Type 1 (irreversible) decision? If yes, what is the explicit evidence that alternatives were fully considered?
2. **Vendor lock-in**: If we choose this vendor or platform, what does migration away look like in 2 years, and what is the estimated switching cost?
3. **Conway's Law alignment**: Does the proposed architecture match how our teams are structured today? If not, which teams need to change?
4. **Capacity vs. roadmap**: Does the team have the capacity to build, operate, and maintain this, or does it require hiring, training, or external support?
5. **Strategic alignment**: How does this decision align with the 12–18 month technical strategy? Does it advance or conflict with it?
6. **Precedent**: Does approving this set a precedent for future decisions? What is the risk if every team makes the same choice?
```

---

### 💰 For Financial / Billing Critical Findings

Ask the **Finance / Accounting stakeholder**:

```markdown
🛑 HANDBRAKE — Financial / Billing Critical Finding
I need the following context from Finance / Accounting before the analysis can continue:

1. **Calculation audit**: Has the billing or financial calculation logic been reviewed by Finance? Are the rounding, proration, and currency-conversion rules documented and tested?
2. **Idempotency**: Can this financial operation run twice without creating a duplicate charge or double credit? What is the deduplication strategy?
3. **Revenue recognition**: Does this change affect how or when revenue is recognized? Has the accounting treatment been confirmed (ASC 606 / IFRS 15)?
4. **Reconciliation**: How will the output of this system be reconciled against the source of truth (ledger, payment processor, bank statement)?
5. **Regulatory exposure**: Are there financial regulations that apply (PCI-DSS, SOX, PSD2, local tax law)? Has compliance been confirmed?
6. **Rollback impact**: If this change is reversed in production, what is the financial impact — refunds owed, accounting adjustments needed, customer communications required?
```

---

### ⚖️ For Legal / Compliance Critical Findings

Ask the **Legal / Compliance team**:

```markdown
🛑 HANDBRAKE — Legal / Compliance Critical Finding
I need the following context from Legal / Compliance before the analysis can continue:

1. **Applicable regulations**: Which specific regulations govern this data, feature, or operation (GDPR, CCPA, HIPAA, PCI-DSS, SOC 2, sector-specific law, export control)?
2. **Licensing audit**: What open-source licenses are in use across the affected dependencies? Are any copyleft (GPL, LGPL, AGPL) licenses incompatible with the commercial use model?
3. **Cross-border data transfers**: In which jurisdictions is data stored, processed, or transferred? Are SCCs, BCRs, or equivalent mechanisms in place where required?
4. **DPA and processor agreements**: Are Data Processing Agreements signed with all third-party processors that handle personal data in this flow?
5. **Retention and erasure obligations**: What is the required retention period for this data? Is the erasure/deletion path tested and auditable?
6. **Legal sign-off precedent**: Has a similar feature or data flow been reviewed and approved by Legal before? If yes, what were the conditions or caveats of that approval?
```

### 🤖 For AI Optimization Critical Findings

Ask the **Tech Lead / AI Tooling Lead**:

```markdown
🛑 HANDBRAKE — AI Context Critical Finding
I need the following context from the Tech Lead / AI Tooling Lead before the analysis can continue:

1. **Canonical source**: Which file is the single authoritative source of truth for this instruction topic? Is this documented?
2. **Load strategy**: Which AI context files are always loaded vs. on-demand? Is there an explicit loading strategy for this project?
3. **Conflict resolution**: When two AI context files give conflicting instructions, which takes precedence and why?
4. **Token budget**: What is the context window of the AI tools used in this project? Have file sizes been measured against this limit?
5. **Ownership**: Who is responsible for maintaining each AI context file? Is there a review or update process when the project changes?
6. **Hallucination history**: Have there been incidents where the AI produced incorrect output traceable to a context file issue (missing context, stale reference, conflicting rule)?
```

---

### 🔀 For Version Control Critical Findings

Ask the **Senior Developer / Tech Lead**:

```markdown
🛑 HANDBRAKE — Version Control Critical Finding
I need the following context from the Tech Lead / Senior Developer before the analysis can continue:

1. **Platform and protection**: Is this repository hosted on GitHub or GitLab? Are branch protection rules enabled on the default branch (main/master)? Are force pushes currently blocked?
2. **Exposure window**: If this involves a secret in git history — when was the commit made? Has the secret already been rotated? Were any CI/CD pipelines triggered that may have printed the value in logs?
3. **Active branch state**: How many contributors currently have open local clones or active branches pointing to the commits to be rewritten? Will they be notified and coordinated before the operation?
4. **Blast radius**: What downstream systems depend on the current commit SHAs (CI/CD pipelines in flight, open PRs/MRs, tags, release artifacts, external references)?
5. **Rewrite completeness**: If this is a history rewrite, are ALL branches that contain the affected commits in scope — not only main but all feature and release branches?
6. **Irreversibility**: Once the force push is executed, is there a backup ref or reflog window in which the operation can be undone? What is the recovery plan if a contributor's work is accidentally overwritten?
```

---

### ⚡ For Performance Critical Findings

Ask the **Senior Developer / Tech Lead**:

```markdown
🛑 HANDBRAKE — Performance Critical Finding
I need the following context from the Tech Lead / Senior Developer before the analysis can continue:

1. **Current load profile**: What are the expected requests/sec, concurrent users, and data volume for the affected endpoint or process in production?
2. **Performance baseline**: Is there an existing benchmark, SLA, or p95/p99 latency target for this path? Has it been measured recently?
3. **Bottleneck location**: Is the performance issue in the application tier (CPU, memory), database tier (queries, indexes, connection pool), or network/external calls?
4. **Query / N+1 analysis**: Has the query plan been inspected (EXPLAIN ANALYZE)? Is ORM lazy-loading involved? What is the number of queries per request under realistic load?
5. **Caching strategy**: Is there an existing caching layer (Redis, CDN, in-memory) that could absorb this load? Is it currently bypassed or misconfigured?
6. **Deployment risk**: Will this change affect a hot path that is currently serving live traffic? Is there a feature flag or canary rollout strategy available?
```

---

## Handbrake Output Block

When the Handbrake activates, emit this block **immediately**, before the full report:

> **Merge note**: If ⚡ Immediate Report has already fired for this same finding, merge this block with the IR block into a single combined output rather than emitting two separate blocks. See `immediate-report.md` for the merged format.

```markdown
---
## 🛑 HANDBRAKE ACTIVATED

**Critical finding**: [One-sentence description of the critical issue]
**Domain**: [Architecture / Data / Security / Code / Product / UX / Strategy / Finance / Legal / AI Optimization / Version Control / Performance]
**Responsible role**: [Role title]
**Why Handbrake level**: [Irreversible / Legal / Safety / Data loss / Multi-domain]

---
**Analysis is paused.** The full Devil's Advocate report cannot be completed until the following context is provided by the [Role] responsible for this domain.

[Paste the relevant Context Question Template above — 3–6 questions]

---
Reply with the answers to continue the analysis.
If the responsible person is not available, you may answer on their behalf, but note that the analysis confidence will be lower.
---
```

---

## Multi-Role Handbrake

When two or more roles are affected by critical findings simultaneously:

```markdown
---
## 🛑 MULTI-ROLE HANDBRAKE ACTIVATED

**Domains affected**: [Architecture] + [Security] + [Data]
**Why multi-role**: [Each domain has an independent Critical finding]

This analysis requires input from multiple specialists before it can proceed.
Recommended: Run a joint review session with all responsible roles present.

**Context needed from each role:**

### From the Software Architect:
[Architecture questions 1–3 most relevant]

### From the Security Engineer:
[Security questions 1–3 most relevant]

### From the Data Engineer:
[Data questions 1–3 most relevant]

---
You may provide context on behalf of each role, or escalate this to a joint review.
---
```

---

## Pre-mortem Integration (Step 6: Re-Analyse)

After receiving context from the responsible role, run a **Focused Pre-mortem** using `frameworks/premortem.md` scoped to the critical finding:

```markdown
## Focused Pre-mortem: [Critical Finding Name]

**New context received**: [Summary of what the role provided]

### Scenario: This specific finding causes a production incident in 3 months

1. **What exactly fails**: [With the new context, what is the likely failure path?]
2. **Why we missed it**: [What assumption, gap, or complexity caused us not to catch it earlier?]
3. **Early warning signs**: [What metrics, logs, or user reports would have warned us 2 weeks earlier?]
4. **Blast radius**: [Who is affected — users, data, revenue, compliance, reputation?]
5. **Prevention actions**:
   - [ ] [Specific action with owner and timeline]
   - [ ] [Specific action with owner and timeline]
6. **Detection improvements**:
   - [ ] [Monitor or alert to add]
   - [ ] [Test to write]
```

---

## `continue` During Handbrake Wait

If the user types `continue` while the Handbrake is waiting for specialist context:

- Treat identically to an explicit Bypass — emit the `⚠️ HANDBRAKE BYPASSED` block below.
- The 🔴 Critical finding retains its severity rating. It is **not** downgraded.
- **The Gate still applies**: the user must still confirm `✅ Proceed` at the end of the full report.
- Note in the report: `"Risk rated at worst-case — specialist context was not provided. Actual risk may be lower if [specific condition] is confirmed."`

> **Key distinction**: `continue` at the ⚡ Immediate Report stage skips IR context collection only — the Handbrake still activates. `continue` at the 🛑 Handbrake stage skips Handbrake specialist context only — the Gate still applies.

---

## Handbrake Bypass

If the user explicitly requests to bypass the Handbrake (or types `continue` — see above):

- Execute, but prepend:

```markdown
⚠️ HANDBRAKE BYPASSED
The following critical finding was NOT reviewed by the responsible specialist:
- [Finding]: [Domain] — [Risk summary]

Proceeding without this context increases the risk of undetected production failure.
This bypass is visible in the conversation history.
```

- Continue with the full Devil's Advocate report and normal Gate Protocol.
- The bypass does **not** remove the finding from the report. It remains rated 🔴 Critical.
- **The Gate still applies**: the user must still confirm `✅ Proceed`. The bypass skips the Handbrake specialist context request only — it does not skip the Gate or reduce the severity rating.

---