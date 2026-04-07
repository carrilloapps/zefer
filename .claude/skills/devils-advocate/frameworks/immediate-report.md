# ⚡ Immediate Report Protocol

> **Purpose**: As soon as any 🟠 High or 🔴 Critical finding is detected during analysis — even before the full sweep is complete — emit an **Immediate Report** flash alert and request all additional context needed to complete an absolute, definitive analysis.
>
> The Immediate Report does **not** wait. It fires on the **first significant finding**.

---

## Position in the Protocol Stack

```
ANALYSIS BEGINS
       │
       ▼
First 🟠 High or 🔴 Critical detected?
       │ YES — immediately
       ▼
⚡ IMMEDIATE REPORT
   Flash alert emitted
   Context requested for this finding
   Analysis continues in parallel (does NOT stop yet)
       │
       ▼
🔴 Critical confirmed?
       │ YES
       ▼
🛑 HANDBRAKE
   Full stop
   Specialist escalation
   Deeper pre-mortem
       │
       ▼
Full report complete?
       │ YES
       ▼
🚦 GATE
   Verification prompt
   User confirms ✅ / 🔁 / ❌
```

**Key distinction from Handbrake:**
| | Immediate Report | Handbrake |
|---|---|---|
| Trigger | First 🟠 High OR 🔴 Critical | 🔴 Critical only (or 3+ 🟠 same domain) |
| Action | Flash alert + context request | Full stop + specialist escalation |
| Analysis | Continues | Pauses |
| Who provides context | Anyone — user, the person who proposed the plan | Domain specialist only |
| Depth | Broad: all dimensions | Deep: specific domain + pre-mortem |

> **When the first finding is already 🔴 Critical**: The Immediate Report and Handbrake fire on the same finding. Merge them into a **single combined block** — do not emit two separate messages. The combined block includes: the flash alert, the context request, and the Handbrake escalation question set. See the structure in `examples/handbrake-example.md`.

---

## Trigger Conditions

Activate immediately upon detecting **any** of:

| Condition | Threshold |
|-----------|-----------|
| Single 🔴 Critical finding | 1 finding |
| Single 🟠 High finding | 1 finding |
| Pattern of 🟡 Medium findings pointing to the same root cause | 3+ in same domain |
| An assumption that is **entirely unverified** and load-bearing | 1 assumption |
| A failure mode with **no defined mitigation** | 1 unmitigated High/Critical |
| An irreversible action with no rollback plan | 1 finding |

---

## Immediate Report Flash Format

Emit this block **the moment** the finding is identified, before continuing:

```markdown
---
## ⚡ IMMEDIATE REPORT — [🔴 Critical / 🟠 High] Finding

**Finding**: [One-sentence description]
**Domain**: [Architecture / Data / Security / Code / Product / UX / Strategy / Finance / Legal / AI Optimization / Version Control / Performance]
**Why immediate**: [Irreversible / Data loss / Security breach / Compliance / No mitigation / Unverified assumption]
**Risk if not addressed**: [Concrete consequence — not abstract]

---
### 🔍 Context Needed — Please Answer Before I Continue

To deliver a complete and definitive analysis of this finding, I need the following:

[Paste the relevant Context Request Block from the templates below]

---
I am continuing the analysis sweep in parallel. Any answers you provide will be incorporated into the final report and may change the risk rating of this and related findings.

Reply: 📝 [answers] to raise confidence | `continue` to proceed at worst-case score
---
```

---

## Context Request Templates

> One template per domain (14 total: Unmitigated Critical + 13 domain-specific). Use the template that matches the finding domain. If the finding spans multiple domains, use the closest match or the generic Unmitigated Critical template.

These are the questions to ask per finding type. Select the most relevant 3–6.

---

### 🔴 Unmitigated Critical — Any Domain

```markdown
1. **Known mitigations**: Is there any existing control, guard, or mitigation for this risk that was not mentioned in the plan?
2. **Historical incidents**: Has this exact failure mode happened before in this system or a similar one?
3. **Data at risk**: What is the worst-case data volume, user count, or financial exposure if this fails?
4. **Detection capability**: Would this failure be detected immediately (logs/alerts), or could it be silent for hours/days?
5. **Rollback capability**: If this fails in production, what is the rollback procedure and estimated recovery time?
6. **Owner**: Who is responsible for this component and who must sign off before it goes to production?
```

---

### 🏛️ Architecture — Distributed System / Coupling / Contract

```markdown
1. **Blast radius**: If this service or component becomes unavailable, which downstream services, users, or workflows are affected?
2. **Failure mode tested**: Has a failure of this dependency been simulated (chaos engineering, fault injection, circuit breaker test)?
3. **Data ownership**: Does this service own its data exclusively, or is there a shared database with another service?
4. **Contract version**: Is there a versioned API or event schema contract between producer and consumer?
5. **Transaction boundary**: If this operation is multi-step and step N fails, what is the explicit rollback for steps 1–N-1?
6. **Tracing**: Is there end-to-end tracing that covers this path today?
```

---

### 📊 Data — Pipeline / Quality / PII / Schema

```markdown
1. **Data volume**: How many records are affected? What is the estimated processing time at that volume?
2. **PII scope**: Which fields in this dataset are personally identifiable? Who has access today?
3. **Idempotency guarantee**: If this pipeline runs twice due to a failure, are duplicate records or duplicate side effects prevented?
4. **Schema contract**: Is there a documented and enforced schema contract between the data producer and consumers?
5. **Quality baseline**: What is the current null rate, duplicate rate, and anomaly rate on this dataset?
6. **Regulatory exposure**: Is this data subject to GDPR, HIPAA, CCPA, or financial regulation? Is there a DPA or retention policy?
```

---

### 🔒 Security — Auth / Input / Encryption / Supply Chain

```markdown
1. **Attack vector reachability**: Is this code path reachable by an unauthenticated external user, or only by internal/authenticated requests?
2. **Existing controls**: Is there a WAF, API gateway rate limiter, or input sanitization layer in front of this?
3. **Sensitive data classification**: What is the data classification of what is exposed here (public / internal / confidential / restricted)?
4. **Pentest history**: Has this surface been tested by a penetration tester or security scanner recently? What were the findings?
5. **Dependency audit**: Has the dependency tree been scanned for known CVEs (SAST/SCA)? When was the last scan?
6. **Incident history**: Has this component or API been involved in a prior security incident or bug bounty report?
```

---

### 💻 Code / Testing — Correctness / Concurrency / Error Handling

```markdown
1. **Test coverage**: Is this code path covered by automated tests? What is the coverage percentage on this module?
2. **Concurrent access**: Can two requests or workers hit this code simultaneously? How is shared state or race conditions prevented?
3. **Error propagation**: If this fails, how is the error surfaced — to the caller, to logs, to an alert?
4. **Retry safety**: Is this operation idempotent? What prevents duplicate side effects on retry?
5. **Observed in production**: Has this code path been executed in production before? Were there any prior issues?
6. **Review coverage**: Has this change been reviewed by someone other than the author? Were edge cases discussed?
```

---

### 📦 Product — Feature / Launch / Metrics / Compliance

```markdown
1. **Assumption evidence**: What user research, experiment, or data validates the core assumption behind this plan?
2. **Rollback trigger**: What metric value or user signal would cause the team to roll back or kill this feature?
3. **Mid-flight users**: If this is rolled back after partial rollout, what happens to users who already used it?
4. **Regulatory review**: Has Legal or Compliance reviewed this feature? Which regulations apply?
5. **Guardrail metrics**: What counter-metrics are monitored to detect negative side effects of this change?
6. **Precedent risk**: Does this feature set a product precedent (pricing, data usage, permissions) that is hard to reverse?
```

---

### 🎨 UX / Design — Accessibility / Dark Patterns / Error States

```markdown
1. **User research basis**: Has this flow been validated with real users (usability test, A/B, analytics data)?
2. **Error state coverage**: Are error, empty, loading, offline, and partial-failure states designed and included in specs?
3. **Accessibility test**: Has this flow been tested with a screen reader, keyboard-only navigation, or automated WCAG checker?
4. **Dark pattern review**: Has each friction point been reviewed to confirm it is not manipulative (urgency, hidden costs, forced continuity)?
5. **Edge users**: Has the design been tested for users with low literacy, slow connections, or assistive technology?
6. **Reversibility for user**: Can the user undo or correct the action after completing the flow?
```

---

### 🏢 Strategy — Vendor / Irreversibility / Team / Build vs. Buy

```markdown
1. **Decision reversibility**: Is this a Type 1 (irreversible) decision? If yes, what is the estimated switching cost and timeline if we regret it in 12 months?
2. **Alternatives considered**: What alternatives were evaluated, and why were they ruled out?
3. **Team ownership**: Does the current team have the skills and capacity to own and operate this long-term?
4. **Vendor risk**: What is the vendor's financial stability, support SLA, and track record for breaking changes?
5. **Conway's Law**: Does this decision match the current team structure, or does it require reorganisation to own effectively?
6. **Strategic alignment**: How does this align with the 12–18 month technical or product strategy?
```

---

### 💰 Financial / Billing — Calculations / Revenue / Compliance

```markdown
1. **Calculation audit**: Has the billing or financial calculation logic been reviewed by Finance? Are rounding, proration, and currency-conversion rules documented and tested?
2. **Idempotency**: Can this financial operation run twice without creating a duplicate charge or double credit? What is the deduplication strategy?
3. **Revenue recognition**: Does this change affect how or when revenue is recognized? Has the accounting treatment been confirmed?
4. **Reconciliation**: How will this system's output be reconciled against the source of truth (ledger, payment processor, bank statement)?
5. **Regulatory exposure**: Are there financial regulations that apply (PCI-DSS, SOX, PSD2, local tax law)?
6. **Rollback impact**: If reversed in production, what is the financial impact — refunds owed, accounting adjustments, customer communications?
```

---

### ⚖️ Legal / Compliance — Licensing / Cross-Border Data / Regulation

```markdown
1. **Applicable regulations**: Which specific regulations govern this data, feature, or operation (GDPR, CCPA, HIPAA, PCI-DSS, SOC 2, export control, sector-specific law)?
2. **Licensing audit**: What open-source licenses are in use across the affected dependencies? Are any copyleft licenses (GPL, LGPL, AGPL) incompatible with the commercial use model?
3. **Cross-border data transfers**: In which jurisdictions is data stored, processed, or transferred? Are SCCs, BCRs, or equivalent legal mechanisms in place where required?
4. **DPA and processor agreements**: Are Data Processing Agreements signed with all third-party processors that handle personal data in this flow?
5. **Retention and erasure obligations**: What is the required retention period for this data? Is the deletion/erasure path tested and auditable?
6. **Prior legal review**: Has a similar feature or data flow been reviewed and approved by Legal before? If yes, what were the conditions or caveats of that approval?
```

---

### 🤖 AI Optimization — Context / Instructions Quality

```markdown
1. **File inventory**: List all AI context files in the project (AGENTS.md, .cursorrules, .ai-context.md, CLAUDE.md, README.md, etc.) and their approximate sizes in tokens or KB.
2. **Load strategy**: Which files are always loaded vs. loaded on-demand? Is there an explicit loading strategy documented for this project?
3. **Canonical rule**: For the conflicting or duplicate instruction found, which file is the authoritative source of truth?
4. **Token measurement**: Have the AI context files been measured for token count? What AI tools and context window limits apply to this project?
5. **Conflict history**: Has the AI produced inconsistent or incorrect behavior that could be traced to this instruction conflict, missing context, or stale reference?
6. **Update process**: When project conventions change, how are AI context files kept in sync? Is there a review step when files are modified?
```

---

### 🔀 Version Control — Repository Operations / Git Hygiene

```markdown
1. **Platform**: Is this repository on GitHub, GitLab, or another platform? Are branch protection rules enabled on the default branch?
2. **Secret exposure**: If a secret is involved — has it been rotated yet? Were any CI/CD pipelines triggered that may have printed the value in plain text in job logs?
3. **Contributor state**: How many contributors have active local clones or branches pointing to the commits to be modified? Is there a coordination channel to notify them?
4. **Active branches**: Are there other branches (feature, release) that share the affected commits and also need to be rewritten or force-pushed?
5. **Force push safety**: Will `--force-with-lease` be used instead of `--force`? Is there a write-freeze window planned to prevent concurrent pushes during the operation?
6. **Downstream impact**: Which systems reference the current commit SHAs — CI/CD pipelines, open PRs/MRs, release tags, external artifact stores, or deployment tooling?
```

---
### ⚡ Performance — Bottlenecks / Scalability / Resource Limits

```markdown
1. **Current load profile**: What are the expected requests/sec, concurrent users, and data volume for the affected endpoint or process in production?
2. **Performance baseline**: Is there an existing benchmark, SLA, or p95/p99 latency target for this path? Has it been measured recently?
3. **Bottleneck location**: Is the performance issue in the application tier (CPU, memory), database tier (queries, indexes, connection pool), or network/external calls?
4. **Query / N+1 analysis**: Has the query plan been inspected (EXPLAIN ANALYZE)? Is ORM lazy-loading involved? What is the number of queries per request under realistic load?
5. **Caching strategy**: Is there an existing caching layer (Redis, CDN, in-memory) that could absorb this load? Is it currently bypassed or misconfigured?
6. **Deployment risk**: Will this change affect a hot path serving live traffic? Is there a feature flag or canary rollout strategy available?
```

---

### 🔍 General Analysis — Assumptions / Cross-Cutting / Unknown Unknowns

```markdown
1. **Scope boundary**: What is the exact scope of this change — which systems, services, data stores, and users are affected? What is explicitly out of scope?
2. **Assumptions made**: What assumptions are baked into this plan that have not been explicitly validated? Who validated them, and when?
3. **Unknown unknowns**: What parts of this system or codebase are least understood by the team proposing this change? Who holds the most context on those areas?
4. **Dependencies**: What does this change depend on that is outside this team's control — third-party services, other teams' APIs, scheduled jobs, infrastructure config?
5. **Reversibility**: If this change turns out to be wrong, what is the rollback path? How long does rollback take, and what data loss or service disruption does it cause?
6. **Evidence basis**: What evidence, data, or prior incident reports support the risk concern raised? Has this failure mode occurred before in this system or a comparable one?
```

---

When multiple High/Critical findings are detected in the same sweep, group them:

```markdown
---
## ⚡ IMMEDIATE REPORT — Multiple High/Critical Findings

**Findings detected so far** (analysis still in progress):

| # | Severity | Finding | Domain | Unmitigated? |
|---|----------|---------|--------|-------------|
| 1 | 🔴 Critical | [Description] | [Domain] | ❌ Yes |
| 2 | 🟠 High | [Description] | [Domain] | ⚠️ Partial |
| 3 | 🟠 High | [Description] | [Domain] | ❌ Yes |

**Combined blast radius**: [What fails if all three occur simultaneously]

---
### 🔍 Priority Context Needed

To complete a definitive analysis, please provide:

**For Finding #1 (🔴 Critical — [Domain]):**
[3 most critical questions from the relevant template]

**For Finding #2 (🟠 High — [Domain]):**
[2 most critical questions]

**For Finding #3 (🟠 High — [Domain]):**
[2 most critical questions]

---
Reply with what you know. Partial answers are better than none.
Type `continue` to proceed without additional context (findings will be marked ⚠️ Unverified).
---
```

---

## Context Sufficiency Assessment

After receiving context, assess it before incorporating:

```markdown
| Question | Answered? | Impact on Risk Rating |
|----------|----------|----------------------|
| [Q1] | ✅ Full / ⚠️ Partial / ❌ No | Risk lowered / unchanged / raised |
| [Q2] | ✅ Full / ⚠️ Partial / ❌ No | Risk lowered / unchanged / raised |

**Context sufficiency**: 🟢 Complete (≥80% answered) / 🟡 Partial (50–79%) / 🔴 Insufficient (<50%)

**Analysis confidence**: [High / Medium / Low] — reflects how much unverified context remains.
```

---

## `continue` Command Behavior

When the user types `continue` without providing context:
- Mark all findings with unanswered questions as **⚠️ Unverified Context**
- Assign **conservative (worst-case) risk score** to those findings
- Note in the report: `"Risk rated at worst-case due to missing context. Actual risk may be lower if [specific condition] is confirmed."`
- If the finding is 🔴 Critical: the 🛑 **Handbrake activates as the next step** — `continue` skips IR context collection only, it does **not** bypass the Handbrake
- If the finding is 🟠 High only: proceed to the full report and Gate prompt normally

---

## Integration Rules

| Situation | What happens |
|-----------|-------------|
| 🟠 High found, no Critical | ⚡ Immediate Report fires. Analysis continues. Gate at end. |
| 🔴 Critical found | ⚡ Immediate Report fires first. Then 🛑 Handbrake activates. |
| Multiple Critical findings | ⚡ Multi-Finding Immediate Report. 🛑 Multi-Role Handbrake. |
| User answers context before analysis ends | Incorporate immediately into remaining analysis steps |
| User types `continue` | Mark as unverified, worst-case score; proceed to Handbrake (if Critical) or full report (if High only) |
| User bypasses | ⚠️ Warning prepended, proceed with Gate |