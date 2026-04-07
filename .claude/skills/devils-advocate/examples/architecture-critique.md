# Example Devil's Advocate Analysis: Microservices Architecture

> ⚠️ **EDUCATIONAL EXAMPLE — NOT FOR IMPLEMENTATION.** This file contains a fictional microservices migration proposal with deliberately missing distributed transaction and operational capacity safeguards, used solely to demonstrate how Devil's Advocate identifies architecture risks. All systems and team details are fictional.

> 🔍 **Adversarial analysis example.** The proposal below is intentionally flawed — it decomposes a monolith into 12 microservices without a saga pattern, observability, or sufficient team capacity.

> **Original proposal:**Decompose a monolithic e-commerce app into 12 microservices (users, orders, inventory, payments, notifications, search, reviews, cart, shipping, analytics, promotions, gateway). Each service owns its database. Deploy on Kubernetes. Team size: 3 engineers.

---

## ⚡ IMMEDIATE REPORT — 🔴 Critical Finding

**Finding**: No distributed transaction strategy — checkout flow spans orders, inventory, and payments with no saga or compensating transactions.
**Domain**: Architecture
**Why immediate**: Irreversible side effects on every purchase. Partial failure leaves system in inconsistent state (payment taken, order not placed).
**Risk if not addressed**: Data corruption, double charges, or phantom inventory on every failed transaction.

---
### 🔍 Context Needed

1. **Transaction boundary**: If payment succeeds but inventory reservation fails, what is the current rollback plan?
2. **Failure tested**: Has a failure of the payments service mid-checkout been simulated in any environment?
3. **Distributed transaction history**: Has the team implemented a saga pattern or outbox pattern before?

---
Reply: 📝 [answers] to raise confidence | `continue` to proceed at worst-case score

*(For this example, context was provided: "No saga defined yet. Team has not implemented distributed transactions before. Rollback is manual.")*

---

## 🛑 HANDBRAKE ACTIVATED

**Critical finding**: No distributed transaction strategy in checkout flow
**Domain**: Architecture
**Responsible role**: Software Architect
**Why Handbrake level**: Irreversible data consistency failure on production traffic; team lacks experience with the pattern

**Context received**: Team confirmed no saga, no compensating transactions, no prior distributed transaction experience. Risk confirmed and elevated.

**Specialist context questions sent to Software Architect:**

1. Which saga choreography vs. orchestration approach fits the team's current skill level?
2. Is an outbox pattern feasible with the chosen databases?
3. What is the estimated implementation timeline before the first service extraction is safe?

*(Specialist answered: "Use orchestration-based saga — simpler for a 3-person team. Outbox feasible with Postgres. Timeline: 3–4 weeks before extraction is safe.")*

**Re-analysis**: Distributed transaction risk confirmed Critical but has a defined mitigation path. Scope risk (3 engineers, 12 services) remains independently Critical — operational overload is a separate failure mode.

---

# 🔴 Devil's Advocate Analysis: E-Commerce Microservices Migration

**Analyzed**: 2026-02-20
**Skill version**: 2.9.0

---

## 📊 Executive Summary

**Overall Risk Rating**: 🔴 Critical

**Key Findings**:
1. No distributed transaction strategy — checkout inconsistency on every partial failure
2. 3-person team cannot safely operate 12 Kubernetes deployments, 12 databases, 12 CI pipelines
3. Root cause (slow monolith) unvalidated — microservices may not solve the actual bottleneck

**Recommendation**: ❌ Reject and redesign — start with a modular monolith; extract 2–3 services maximum after saga pattern is implemented and team capacity confirmed

**Analysis Confidence**: 🟡 Medium — distributed transaction risk verified with specialist; operational capacity based on documented industry patterns

---

## 🛑 Handbrake & ⚡ Immediate Report Status

| Protocol | Finding | Domain | Escalated to | Context received | Risk change |
|----------|---------|--------|-------------|-----------------|-------------|
| ⚡ Immediate | No distributed transaction strategy | Architecture | Team | ⚠️ Partial — no saga defined | ➡️ Confirmed Critical |
| 🛑 Handbrake | No distributed transaction strategy | Architecture | Software Architect | ✅ Full — orchestration saga recommended | 🔽 Critical → High with mitigation path |

**Re-analysis note**: Distributed transaction risk has a concrete mitigation path (orchestration saga, 3–4 week timeline). Operational capacity risk (3 engineers, 12 services) remains independently 🔴 Critical with no mitigation until team scales or scope reduces.

---

## ✅ Strengths (What Works Well)

1. **Independent deployability** — each service can be deployed without coordinating a full release
2. **Fault isolation** — a crash in the reviews service does not take down payments
3. **Database-per-service** — correct design principle; avoids shared schema coupling long-term

---

## ❌ Weaknesses (What Could Fail)

### 🔴 Critical Issues (Must fix before production)

1. **No distributed transaction strategy** *(Handbrake resolved — mitigation path defined)*
   - **Risk**: Checkout flow spans orders, inventory, and payments. Partial failure leaves inconsistent state
   - **Impact**: Double charges, phantom inventory, order/payment desync
   - **Likelihood**: High — exercises on every purchase
   - **Mitigation**: Implement orchestration-based saga before extracting first service (3–4 weeks per architect's estimate)

2. **Team capacity insufficient for operational surface**
   - **Risk**: 3 engineers cannot safely own 12 Kubernetes deployments, 12 databases, 12 CI pipelines, distributed tracing, and a service mesh
   - **Impact**: Infrastructure toil consumes 30–50% of sprint capacity; feature delivery stops; incidents go unresolved
   - **Likelihood**: High — documented pattern in teams under 8 engineers attempting full microservices
   - **Mitigation**: Reduce scope to 2–3 services maximum, or grow team to 6–8 before full extraction

### 🟠 High-Priority Issues

1. **Root cause not validated**
   - **Risk**: "The monolith is slow" has not been profiled. The bottleneck may be a single slow query or a missing cache — addressable without decomposition
   - **Impact**: 6–12 months of migration work that does not solve the performance problem
   - **Mitigation**: Run profiling (APM, slow query log, load test) before committing to migration

2. **No observability strategy**
   - **Risk**: 12 services with no distributed tracing means a single user request touching 5 services cannot be traced end-to-end
   - **Impact**: MTTR triples; incidents that take 30 minutes to debug now take hours
   - **Mitigation**: Define tracing (OpenTelemetry), correlation IDs, and SLOs before first service extraction

3. **No API contract versioning**
   - **Risk**: Services will evolve independently; without versioned contracts, a breaking change in the orders service silently breaks cart and gateway
   - **Mitigation**: Adopt OpenAPI specs and a contract testing strategy (Pact) from day one

### 🟡 Medium-Priority Issues

1. **No rollback strategy per service** — if a bad deploy reaches production, rolling back one service may leave its data schema ahead of the running code
2. **Kubernetes complexity for 3 engineers** — K8s adds significant operational overhead; consider managed platform (ECS, Cloud Run, Railway) until team grows

---

## ⚠️ Assumptions Challenged

| Assumption | Challenge | Evidence | Risk if wrong |
|---|---|---|---|
| Microservices will fix the performance problem | Bottleneck has not been identified | ❌ No profiling done | 12-month migration solves nothing |
| 3 engineers can operate 12 services | Industry data says 6–8 engineers minimum | ✅ Documented pattern | Sprint capacity consumed by toil |
| Database-per-service is achievable now | Requires extracting shared queries first | ⚠️ Partial — no data migration plan | Shared DB coupling persists despite service split |
| Saga pattern is straightforward to add later | Retrofitting distributed transactions is much harder | ❌ No saga experience on team | Inconsistency bug ships to production |

---

## 🎯 Edge Cases & Failure Modes

| Scenario | What Happens | Handled? | Risk | Fix |
|----------|-------------|----------|------|-----|
| Payment succeeds, inventory fails | Inconsistent state — money taken, no stock reserved | ❌ No | Critical | Orchestration saga with compensation |
| One service slow, blocks checkout | Synchronous chain amplifies latency | ❌ No | High | Circuit breaker + timeout on every call |
| K8s node fails mid-deploy | Rolling update leaves mixed versions | ⚠️ Partial | High | Define pod disruption budgets |
| Schema migration on live service | Downstream services break on new field | ❌ No | High | Expand-contract migration pattern |
| All 3 engineers on vacation simultaneously | No on-call capacity for 12 services | ❌ No | Medium | Reduce service count before scaling team |

---

## 🔒 Security Concerns

### STRIDE Summary
- **Spoofing**: Service-to-service calls — no mTLS defined; any service inside the cluster can impersonate another ⚠️
- **Tampering**: No request signing between services ⚠️
- **Repudiation**: Distributed audit trail not defined across service boundaries ⚠️
- **Information Disclosure**: Inter-service calls over plain HTTP in initial design ❌
- **Denial of Service**: No rate limiting between internal services — one misbehaving service can flood others ⚠️
- **Elevation of Privilege**: Service accounts not scoped per-service — overprivileged ⚠️

---

## ⚡ Performance Concerns

- **Bottleneck**: Synchronous checkout chain (cart → orders → inventory → payments → notifications) — 5 network hops minimum per purchase
- **Scalability limit**: The payments service is the narrowest bottleneck; cannot scale independently without saga pattern in place
- **Resource usage**: 12 services × minimum 256MB = 3GB baseline memory on K8s, before any traffic

---

## 💡 Alternative Solutions

1. **Modular Monolith first**
   - Better at: Operational simplicity, team capacity fit, no distributed transaction complexity
   - Worse at: Independent deployment per module
   - Consider if: Team is < 6 engineers or root cause is unvalidated

2. **Extract 2–3 services only (strangler fig)**
   - Better at: Incremental complexity growth, team can learn patterns safely
   - Worse at: Slower full decomposition
   - Consider if: Performance profile shows 2–3 clear, high-load hot paths

---

## ✅ Recommendations

### Must Do (Before Production)
- [ ] Implement orchestration-based saga for checkout before extracting any service (Architect confirmed: 3–4 weeks)
- [ ] Profile the monolith — identify actual bottleneck before committing to full decomposition
- [ ] Reduce scope to 2–3 services maximum with current team size

### Should Do (Next sprint)
- [ ] Define OpenTelemetry tracing + SLO targets for each extracted service
- [ ] Establish OpenAPI contracts with Pact contract testing from day one
- [ ] Replace Kubernetes with a managed platform until team reaches 6+ engineers

### Consider (Backlog)
- [ ] Define mTLS between services once mesh is stable
- [ ] Create on-call runbook for each service before it reaches production

---

## 📋 Follow-Up Questions

1. What does the APM/profiling data say is the actual bottleneck in the current monolith?
2. Is there budget/timeline to grow the engineering team before the migration starts?
3. Has the team worked with any orchestration framework (Temporal, AWS Step Functions) before?

---
🔴 Devil's Advocate complete.

**Before I proceed, please confirm:**
- [ ] I have reviewed all Critical and High issues above
- [ ] I accept the risks marked as accepted (or they are mitigated)
- [ ] I want to proceed with the approved action

Reply with:
  ✅ Proceed — continue with the approved action as planned
  🔁 Revise  — describe the change and I will re-analyse
  ❌ Cancel  — stop, do not implement
  `continue` — proceed without addressing remaining issues (risks remain active and unmitigated)
