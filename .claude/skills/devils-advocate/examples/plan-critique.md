# Example Devil's Advocate Analysis: Database Migration Plan

> ⚠️ **EDUCATIONAL EXAMPLE — NOT FOR IMPLEMENTATION.** This file contains a fictional database migration plan with deliberately infeasible rollback assumptions, used solely to demonstrate how Devil's Advocate identifies migration risks. All company names, systems, timelines, infrastructure details, and technical specifications are entirely fictional. No real migration is described.

> 🔍 **Adversarial analysis example.** The proposal below is intentionally flawed — it attempts a large database migration in a narrow window with no viable rollback strategy. The scenario is fabricated to showcase the skill's risk detection capabilities.

> **Original plan [FICTIONAL SCENARIO]:** Acme Corp's platform team proposes migrating their production PostgreSQL 13 database (2TB, 40M daily active records) to PostgreSQL 16 on a new cloud provider during a 4-hour maintenance window on a Sunday.

---

## ⚡ IMMEDIATE REPORT — 🔴 Critical Finding

**Finding** *(fictional analysis)*: Rollback is not physically feasible — restoring a 2TB database takes 2–4 hours, which cannot fit inside the remaining maintenance window after any migration attempt.
**Domain**: Architecture
**Why immediate**: Irreversible — if the migration fails at hour 3, there is no recovery path. Acme Corp's team is forced to either go live on a potentially corrupted target or extend the outage into Monday business hours.
**Risk if not addressed**: Uncontrolled production outage beyond the maintenance window, with no safe state to return to.

---
### 🔍 Context Needed

1. **Dry-run performed?** Has the full migration been tested on a production-sized clone? What was the actual elapsed time?
2. **Rollback plan**: If pg_restore fails at hour 3, what is the explicit decision tree? Continue, extend window, or keep old primary live?
3. **Logical replication feasibility**: Is the target cloud provider's PostgreSQL 16 instance compatible with pglogical or built-in logical replication from the source?
4. **Downstream consumers**: How many ETL jobs, reporting pipelines, and application connection strings point to the current database endpoint?

---
Reply: 📝 [answers] to raise confidence | `continue` to proceed at worst-case score

*(For this example, context was provided: "No dry-run performed on production-sized clone. No explicit rollback decision tree exists. Target provider supports logical replication. 14 downstream consumers identified.")*

---

## 🛑 HANDBRAKE ACTIVATED

**Critical finding** *(fictional analysis)*: No viable rollback strategy for a 2TB database within a 4-hour window
**Domain**: Architecture / Database
**Responsible role**: DBA / Platform Architect
**Why Handbrake level**: Irreversible — once a 2TB pg_dump starts and the source is quiesced, there is no safe abort. Any failure leaves Acme Corp's production in an undefined state.

**Context received**: No dry-run, no rollback decision tree, but logical replication is feasible. Risk confirmed.

**Specialist context questions sent to DBA / Platform Architect:**

1. Is logical replication (pglogical or built-in) testable on the target provider before committing to a cutover date?
2. What is the maximum acceptable `max_replication_lag` before cutover is considered safe?
3. Should the initial sync run during off-hours with the actual cutover window reduced to a DNS/connection-string switch (~30 seconds)?

*(Specialist answered: "Logical replication confirmed viable on target. Acceptable lag threshold: < 500ms. Initial sync: 8–12 hours during off-peak. Actual cutover: < 60 seconds connection-string switch.")*

**Re-analysis**: The rollback risk has a concrete mitigation (logical replication with instant rollback). The 4-hour window plan is still rejected because logical replication is strictly safer. Second independent Critical: the current plan has zero buffer — no timed dry-run has been performed.

---

# 🔴 Devil's Advocate Analysis: PostgreSQL Migration Plan *(Fictional Example)*

**Analyzed**: 2026-02-20
**Skill version**: 2.9.0
**Scope**: Acme Corp production database migration — 2TB, new provider, 4-hour maintenance window *(all details fictional)*

---

## 📊 Executive Summary

**Overall Risk Rating**: 🔴 Critical

**Key Findings**:
1. Rollback is physically impossible — restoring 2TB takes 2–4h, which cannot fit in the remaining window after any failure
2. A pg_dump of 2TB takes 2–4 hours alone — the 4-hour window has zero buffer for validation or issues
3. A zero-downtime alternative (logical replication) exists and is not being used

**Recommendation**: ❌ Reject and redesign — switch to logical replication with an off-peak initial sync and a < 60-second cutover window

**Analysis Confidence**: 🟡 Medium — rollback risk confirmed with specialist; dry-run timing based on industry benchmarks (no actual measurement performed)

---

## 🛑 Handbrake & ⚡ Immediate Report Status

| Protocol | Finding | Domain | Escalated to | Context received | Risk change |
|----------|---------|--------|-------------|-----------------|-------------|
| ⚡ Immediate | No viable rollback within 4-hour window | Architecture | Team | ✅ Full — no dry-run, no decision tree | ➡️ Confirmed Critical |
| 🛑 Handbrake | No viable rollback within 4-hour window | Architecture | DBA / Platform Architect | ✅ Full — logical replication confirmed feasible | 🔽 Critical → High with mitigation path |

**Re-analysis note**: The rollback risk has a defined mitigation (logical replication, instant rollback). The pg_dump window plan is still rejected — logical replication is strictly safer and eliminates the irreversibility. The 4-hour window itself remains High risk due to zero buffer.

---

## ✅ Strengths (What Works Well)

1. **Clear target** — PostgreSQL 16 brings measurable performance and security improvements
2. **Sunday timing instinct is correct** — lower traffic windows reduce user impact, even if the assumption needs validation
3. **Single ownership** — the plan implies one team owns end-to-end execution, reducing coordination risk

---

## ❌ Weaknesses (What Could Fail)

### 🔴 Critical Issues (Must fix before production)

1. **4-hour window has no buffer**
   - **Risk**: pg_dump of 2TB takes 2–4 hours on commodity hardware. Add schema migration, validation, DNS cutover, and any unexpected issue — 4 hours is best-case
   - **Impact**: Window overruns into Monday business hours with a partially migrated database and no clear recovery path
   - **Likelihood**: High — most 2TB migrations take 6+ hours end-to-end on first attempt
   - **Mitigation**: Do a full timed dry-run on a production-sized clone before committing to the window

2. **Rollback is not feasible within the window**
   - **Risk**: If validation fails at hour 3.5, restoring a 2TB database takes another 2–4 hours — well beyond the window
   - **Impact**: Forced to go live with unvalidated data or extend the outage indefinitely
   - **Likelihood**: Medium — validation failures are common on first migrations
   - **Mitigation**: Switch to logical replication — rollback becomes a connection string change (seconds, not hours)

### 🟠 High-Priority Issues (Should fix soon)

1. **DNS TTL split-brain at cutover**
   - **Risk**: DNS propagation delay means some app servers point to old DB, some to new. In-flight writes during this window can corrupt records in both databases
   - **Impact**: Data loss for transactions in flight during cutover
   - **Mitigation**: Pre-warm DNS TTL to 60s 48 hours before cutover; use application-level connection string switch instead of DNS

2. **Extension compatibility not validated**
   - **Risk**: Cloud providers customize PostgreSQL — uuid-ossp, pg_trgm, PostGIS versions may differ or be absent on the target
   - **Impact**: Application failures immediately post-cutover that are hard to diagnose under pressure
   - **Mitigation**: Run a full extension compatibility matrix against the target provider before scheduling the window

### 🟡 Medium-Priority Issues (Technical debt)

1. **Monitoring blind spot on new provider**
   - **Risk**: Existing APM and alerting is tuned to the old provider's metrics. The team will be partially blind during the highest-risk period
   - **Mitigation**: Configure monitoring on the new provider and run it in parallel for 48 hours before cutover

---

## ⚠️ Assumptions Challenged

| Assumption | Challenge | Evidence | Risk if wrong |
|---|---|---|---|
| "4 hours is enough" | pg_dump alone takes 2–4h; no buffer for validation | ❌ No timed dry-run performed | Window overruns, Monday outage |
| "Sunday is low traffic" | B2B apps often see Sunday batch spikes; international users in different timezones | ❌ Not validated against traffic data | Migration runs during unexpected load spike |
| "The new provider is compatible" | Extensions and PostgreSQL configs differ across providers | ❌ No compatibility test run | Application failures immediately post-cutover |
| "Rollback is possible" | Restoring 2TB takes 2–4h — cannot fit in remaining window time | ❌ Physically impossible at this data size | Forced to go live on corrupted data |

---

## 🎯 Edge Cases & Failure Modes

| Scenario | What Happens | Handled? | Risk | Fix |
|----------|-------------|----------|------|-----|
| Migration takes 6h instead of 4h | Window overruns; old system live Monday morning with split state | ❌ No | Critical | Logical replication eliminates this scenario |
| Silent data corruption (encoding/locale diff) | Reports produce wrong results weeks later | ❌ No | Critical | Checksum validation on critical tables pre-cutover |
| ETL pipeline misconfigured for new endpoint | Nightly jobs fail silently after migration | ❌ No | High | Audit all downstream consumers before window |

---

## 🔒 Security Concerns

### STRIDE Summary
- **Spoofing**: 🟢 — Migration uses authenticated provider credentials
- **Tampering**: 🟡 — Data in transit during migration should use TLS; verify the dump/restore connection is encrypted
- **Repudiation**: 🟡 — No audit log of who executed the migration or at what timestamp
- **Information Disclosure**: 🟠 — Dump file on intermediate storage is a data exposure risk in this fictional scenario; ensure encryption at rest and immediate deletion post-migration
- **Denial of Service**: 🟠 — Migration load may saturate the old primary if no read replica is used for the dump
- **Elevation of Privilege**: 🟢 — No new permissions being introduced

---

## ⚡ Performance Concerns

- **Bottleneck**: pg_dump from primary saturates IOPS during the window; use a read replica for the dump if available
- **Scalability limit**: The 4-hour window is fixed by business constraints, but the data volume is not — this plan doesn't scale beyond ~500GB safely
- **Resource usage**: DNS TTL propagation is uncontrolled — budget 5–10 minutes of split-brain risk at cutover

---

## 💡 Alternative Solutions

1. **Logical replication (pglogical or built-in)**
   - Better at: zero-downtime, instant rollback, no hard window required, can validate in parallel
   - Worse at: requires more upfront setup (replication slot, schema pre-migration)
   - Consider if: **always** — for databases over 100GB this is the only safe approach

2. **Blue/green database switch with connection pooler (PgBouncer)**
   - Better at: instant cutover, rollback in seconds, no DNS dependency
   - Worse at: requires a connection pooler in front of the database
   - Consider if: logical replication is not available on the target provider

---

## ✅ Recommendations

### Must Do (Before Production)
- [ ] Run a full timed dry-run on a production-sized clone and record actual elapsed time
- [ ] Switch to logical replication strategy — the current plan's rollback is physically infeasible

### Should Do (Next sprint)
- [ ] Validate all extension versions on the target provider against the production schema
- [ ] Audit all downstream consumers (ETL, reporting, app servers) and verify they are reconfigured

### Consider (Backlog)
- [ ] Pre-configure monitoring and alerting on the new provider and run in parallel before cutover
- [ ] Set DNS TTL to 60s at least 48 hours before the migration window

---

## 📋 Follow-Up Questions

1. Has a timed dry-run been performed on a production-sized clone to the target provider?
2. Is a read replica available to offload the dump from the primary?
3. Have all downstream systems (ETL, reporting, cron jobs, app servers) been reconfigured and tested against the new endpoint?

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
