# Tech Leadership & Strategy Risks Framework

Load this file when analyzing technology strategy decisions, architectural direction, team structure, vendor choices, or build vs. buy decisions. Applicable roles: Tech Lead, Engineering Manager, CTO, VP Engineering.

---

## 1. Build vs. Buy vs. Integrate

This is one of the highest-leverage decisions a tech leader makes. It is almost always irreversible in the short term.

### Challenge Framework

| Question | Build | Buy / SaaS | Open Source |
|---|---|---|---|
| Who owns the roadmap? | You | Vendor | Community |
| Who absorbs operational burden? | Your team | Vendor | Your team |
| What is the switching cost? | High (custom code) | High (data migration + retraining) | Medium |
| Where is the risk? | Delivery, maintenance | Vendor viability, pricing | Security, support |
| When is it the right choice? | Core differentiator | Non-differentiating capability | Proven, active, licensed correctly |

### Common Failure Patterns

```
❌ Building What You Should Buy
   - Rebuilding auth, payments, notifications, CMS, or observability from scratch
   - "We can build it better" without evidence, and without accounting for maintenance cost
   - Underestimating that the vendor has 10+ years of edge cases you have not encountered yet

❌ Buying What You Should Build
   - Outsourcing a capability that is your core competitive differentiator
   - Adopting a vendor solution that cannot be configured to match your specific business logic
   - SaaS product that handles customer data in a way incompatible with your compliance requirements

❌ Vendor Lock-in Blind Spots
   - Data stored in proprietary format with no export API
   - Business logic implemented inside a vendor's workflow tool (no-code / low-code)
   - Critical path dependency on a single vendor with no exit plan
   - Pricing model that becomes uneconomical at scale (per-seat, per-event pricing cliffs)
```

---

## 2. Vendor & Dependency Risk

```
❌ Vendor Viability
   - Vendor is early-stage (< Series B) and revenue-dependent on you as a customer
   - No escrow or source code access clause in the contract for business-critical software
   - Single vendor for multiple critical capabilities (failure propagates across systems)

❌ Contractual Risks
   - No SLA with financial penalties for downtime
   - Auto-renewing annual contracts with no exit clause
   - Data ownership and portability not explicitly defined in contract
   - Vendor retains the right to use your data for model training (AI/ML vendors)

❌ Supply Chain & Open Source
   - No software composition analysis (SCA) for transitive dependencies
   - Dependencies on unmaintained packages (last commit > 2 years, single maintainer)
   - License incompatibility (AGPL dependency in a proprietary product)
   - No process to respond to a critical CVE in a transitive dependency within 24 hours
```

---

## 3. Conway's Law & Team Topology Risks

> "Organizations which design systems are constrained to produce designs which are copies of the communication structures of those organizations." — Melvin Conway

```
❌ Team Structure Misaligned with Architecture
   - Architecture requires cross-team coordination for every feature deployment
   - No team owns the full user journey end-to-end (feature falls between team boundaries)
   - Platform team exists but has no SLA with product teams — perceived as a blocker
   - Shared codebase owned by too many teams → merge conflicts, slow releases, unclear ownership

❌ Cognitive Load Overload
   - Team responsible for too many services to understand deeply
   - On-call rotation covering systems the on-call engineer did not build
   - No runbooks for the most common incident types
   - New joiners take > 2 weeks to make their first meaningful contribution

❌ Communication Overhead
   - More than 2 synchronization points needed between teams to ship a feature
   - Architecture decision records (ADRs) not written — context lost when people leave
   - RFC / design review process so heavyweight it is being bypassed
```

---

## 4. Technical Debt Strategy Risks

Not all technical debt is equal. The risk is failing to distinguish between strategic debt (conscious tradeoff) and reckless debt (accidental or ignored).

```
❌ Debt Accumulation Patterns
   - No tech debt budget in sprint capacity (0% allocated to refactoring)
   - Debt items tracked nowhere — invisible until they cause an incident
   - "We'll clean it up after launch" with no date or owner assigned
   - Entire team knows about a critical fragile component but no one owns fixing it

❌ Debt Paydown Risks
   - Big-bang rewrite of a core system while the product continues shipping features
   - Refactor without regression tests — no way to verify correctness after changes
   - Tech debt addressed in isolation without aligning with upcoming feature work that touches the same area
   - Addressing symptoms (slow queries) without the root cause (wrong data model)

❌ Irreversibility
   - Data model decision that becomes impossible to change once at scale
   - API contract published externally without versioning strategy
   - Framework or language choice without an exit path if it becomes unmaintained
```

---

## 5. Roadmap & Capacity Risks

```
❌ Estimation & Commitment
   - Commitments made without engineering input on feasibility or complexity
   - Roadmap built on best-case estimates with no slack for incidents, tech debt, or learning
   - Dependencies on other teams not surfaced in the plan (optimism about coordination)
   - No buffer for discovery work — architecture designed while building, not before

❌ Prioritization Risks
   - Roadmap optimizes for feature volume rather than user and business outcomes
   - Technical enablers (observability, security, platform work) perpetually deprioritized
   - Multiple competing priorities with no explicit stack rank — team pulls in different directions
   - Product and engineering roadmaps not synchronized — engineering builds ahead of validated product decisions

❌ Capacity vs. Investment
   - Team at > 70% feature delivery capacity with no room for learning, improvement, or incidents
   - No investment in developer experience (slow CI, poor local dev, missing tooling)
   - Key-person risk: only one engineer understands a critical system
```

---

## 6. Architecture Governance & Decision Risks

```
❌ Decision-Making
   - Major architecture decisions made without documentation (ADR) or review
   - Decisions reversed repeatedly due to lack of written context (the "why" is lost)
   - No escalation path for cross-cutting technical concerns
   - Junior engineers making irreversible infrastructure decisions without review

❌ Consistency & Standards
   - No agreed coding standards, reviewed by linter/tooling
   - Inconsistent error handling, logging format, or API conventions across services
   - Multiple solutions to the same problem in the codebase (3 different ways to handle auth)
   - No deprecation policy — old patterns persist indefinitely alongside new ones

❌ Security & Compliance Governance
   - Security review not part of the architecture review process
   - No threat modeling for new system components
   - Compliance requirements (SOC 2, ISO 27001, HIPAA) not reflected in engineering process
   - No clear owner for security incidents — reactive, not proactive
```

---

## 7. Type 1 vs. Type 2 Decision Framework

Adapted from Jeff Bezos's decision framework. Apply before any major strategic decision.

| | Type 1 (Irreversible) | Type 2 (Reversible) |
|---|---|---|
| **Examples** | Data model at scale, external API contract, vendor with lock-in, language/framework choice | Feature flag, UI change, A/B test, internal refactor with tests |
| **Risk if wrong** | High — cannot easily undo | Low — can revert quickly |
| **Required process** | Full devil's advocate review, cross-functional alignment, written ADR | Lightweight review, ship and measure |
| **Common mistake** | Treating as Type 2 and deciding too fast | Over-processing as Type 1 and moving too slow |

**Challenge every major decision**: Is this actually reversible? What would it cost to undo this in 12 months?

---

## 8. Leadership Pre-Mortem Scenarios

Apply these when performing a strategy-level pre-mortem (load `frameworks/premortem.md`):

1. **"The rewrite took 18 months and the product fell behind the competition"** — What scope, dependency, or team topology assumption was wrong?
2. **"The vendor we built on top of raised prices 5× or shut down"** — Which dependency had no exit plan?
3. **"The team burned out and 3 key engineers left"** — What sustainable capacity violation was normalized over time?
4. **"A security incident exposed customer data"** — Which governance gap allowed an unreviewed architectural decision to reach production?
5. **"The architecture cannot support the scale we need"** — Which Type 1 decision was made under time pressure without proper review?
