# Risk Identification Checklist for Devil's Advocate Analysis

Use this checklist when applying the devils-advocate skill to any proposal or design.
Work through each category and note any items that apply.

---

## 🏗️ Technical Risks

- [ ] Are there known performance bottlenecks under realistic load?
- [ ] Are there single points of failure (no redundancy)?
- [ ] Does the solution depend on third-party services with no SLA guarantees?
- [ ] Are there unhandled error / edge cases?
- [ ] Does this introduce N+1 queries, unbounded loops, or unbounded memory growth?
- [ ] Is there a risk of race conditions or concurrency issues?
- [ ] Are there implicit assumptions about data consistency (transactions, ordering)?
- [ ] Does this create hard-to-reverse state changes?
- [ ] Are there untested integration points?
- [ ] Does this depend on undocumented or unofficial API behavior?

---

## 🔐 Security Risks

- [ ] Does this expand the attack surface (new endpoints, ports, permissions)?
- [ ] Are secrets, credentials, or PII handled securely?
- [ ] Could an attacker abuse this feature (abuse cases, not just use cases)?
- [ ] Does this introduce new dependencies with unknown CVEs?
- [ ] Are authorization checks enforced at the right layer?
- [ ] Is user input validated and sanitized at all entry points?
- [ ] Are audit logs maintained for sensitive operations?

---

## 📦 Operational Risks

- [ ] Is there a tested rollback plan?
- [ ] Does the team have the operational knowledge to run this in production?
- [ ] Are monitoring, alerting, and dashboards in place before go-live?
- [ ] Is the deployment process automated and repeatable?
- [ ] Is there a runbook for the most likely failure modes?
- [ ] Will this require on-call changes or additional staffing?

---

## 💰 Cost & Sustainability Risks

- [ ] Are infrastructure costs validated with load estimates (not just unit costs)?
- [ ] Does this create ongoing maintenance burden with no owner?
- [ ] Are there licensing costs not captured in the proposal?
- [ ] Does this create vendor lock-in that increases switching costs later?
- [ ] Is the team sized to sustain this long-term?

---

## 🧑‍🤝‍🧑 Organizational & Process Risks

- [ ] Does this require cross-team coordination with no formal agreement?
- [ ] Are stakeholders aligned on the definition of success?
- [ ] Is the timeline based on measured estimates or guesses?
- [ ] Does this change who owns a piece of the system without explicit handoff?
- [ ] Will this increase cognitive load or context switching for the team?
- [ ] Is there a dependency on a person (bus factor = 1)?

---

## 🔄 Reversibility & Future-proofing Risks

- [ ] Is this decision easy to reverse if it turns out to be wrong?
- [ ] Does this foreclose better options in the future?
- [ ] Is this being designed for today's scale or tomorrow's scale (over-engineering risk)?
- [ ] Are there assumptions about future requirements that may not hold?

---

## 🏗️ Building Protocol Risks

> Apply this category whenever code is being generated, reviewed, or modified.

- [ ] Are there any identifiers (variables, functions, constants, files, DB columns, endpoints) NOT in `en_US`?
- [ ] Are there hardcoded secrets, API keys, tokens, or credentials anywhere in the code?
- [ ] Are there empty catch blocks (`catch (e) {}`) that silently swallow errors?
- [ ] Are there magic numbers or magic strings that should be named constants?
- [ ] Is all external input validated at the boundary before use?
- [ ] Are there SQL queries built by string concatenation instead of parameterized queries?
- [ ] Are there functions longer than 20 lines or with more than 3 parameters?
- [ ] Are there TODO stubs, commented-out code blocks, or dead code in deliverable output?

---

## 🤖 AI Optimization Risks

> Apply this category when reviewing or generating AI-facing files (`AGENTS.md`, `.ai-context.md`, `SKILL.md`, `.github/copilot-instructions.md`, `CLAUDE.md`, `.cursorrules`, `README.md`, or any file intended to provide context to an AI agent or LLM).

- [ ] Do any always-loaded AI context files exceed 8K tokens (risk of context window saturation or attention degradation)?
- [ ] Are there duplicate or contradictory instructions across multiple AI context files?
- [ ] Do all cross-references (file links, section anchors, `See also` notes) point to files and sections that actually exist?
- [ ] Are there instructions that use undefined terms or vague directives ("follow best practices") with no concrete examples?
- [ ] Is all context loaded simultaneously regardless of relevance (no progressive loading strategy)?
- [ ] Are there instructions that conflict with each other across files (naming conventions, language rules, output format)?
- [ ] Is the most critical information at the **top** of each AI context file, not buried at the end?
- [ ] Do any always-loaded files contain content only needed for specific tasks (unnecessary context budget waste)?

---

## ✅ Scoring Guide

Score each category as a **percentage of items checked** for that category:

| % of items checked | Interpretation |
|---|---|
| 0–20% | 🟢 Low risk in this area |
| 21–50% | 🟡 Moderate risk — address before proceeding |
| 51%+ | 🟠 High risk — this area needs a redesign or explicit mitigation plan |

Overall risk level — based on the highest-scoring category:

| Highest category score | Overall risk level |
|---|---|
| All categories ≤ 20% | 🟢 Low — proceed with standard care |
| Any category 21–50% | 🟡 Medium — address top findings before committing |
| Any category 51%+ | 🟠 High — significant rework or explicit risk acceptance required |

> ⚠️ **Critical override rule**: If any single item is assessed as **Critical severity** (potential data loss, security breach, or irreversible production impact), the overall risk level is automatically **🔴 Critical** regardless of category scores. A 🔴 Critical rating activates the Handbrake Protocol — load `frameworks/handbrake-protocol.md`.

---

> 💡 **See also**: [`checklists/questioning-checklist.md`](questioning-checklist.md) — 15-dimension interrogation (correctness, security, performance, reliability, architecture, data, building protocol, AI optimization, and more). Use the questioning checklist for deeper analysis; use this risk checklist for fast categorical risk scoring.
