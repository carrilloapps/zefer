# Example Devil's Advocate Analysis: Data Pipeline — Customer Analytics Migration to BigQuery

> ⚠️ **EDUCATIONAL EXAMPLE — NOT FOR IMPLEMENTATION.** This file contains a fictional data migration plan with deliberately missing privacy controls, used solely to demonstrate how Devil's Advocate detects GDPR, PII, and data governance risks. All company names, infrastructure details, data flows, and regulatory scenarios are entirely fictional. No real migration or compliance gap is described.

> 🔍 **Adversarial analysis example.** The proposal below is intentionally flawed — it migrates PII without masking, access controls, or a compliance plan. The scenario is fabricated to showcase how Devil's Advocate activates the Handbrake protocol on data protection gaps.

> **Original proposal [FICTIONAL SCENARIO] (from Globex Corp's Data Engineer):** Migrate the customer behavior analytics pipeline from MySQL to BigQuery. The pipeline processes 2M events/day including click streams, purchase history, and support ticket content. Timeline: 2 weeks. Plan: extract full MySQL tables to GCS, load into BigQuery, point dashboards at BigQuery, decommission MySQL tables. No masking or access control changes planned — "we'll handle governance later."

---

## ⚡ IMMEDIATE REPORT — 🟠 High Finding

**Finding** *(fictional analysis)*: Customer PII (names, emails, purchase history, support ticket content) will be loaded into BigQuery without data masking, access controls, or a governance plan — "handle governance later" is not a valid compliance posture for a production PII migration.
**Domain**: Data
**Why immediate**: Any Globex Corp engineer or analyst with BigQuery project access will have unmasked PII accessible immediately after load — before the "governance later" work is ever done. In practice, "later" governance work often never ships.
**Risk if not addressed**: Regulatory violation in this fictional scenario; PII accessible to everyone with GCP project access; no audit trail; no ability to honor erasure requests against BigQuery.

---
### 🔍 Context Needed

1. **PII inventory**: Which specific fields are personally identifiable? Names, emails, IP addresses, free-text support tickets? Is any of this health, financial, or special-category data?
2. **Access scope**: How many people have BigQuery project access today? What IAM roles are assigned?
3. **Regulatory jurisdiction**: Do we serve EU or California customers? Are GDPR or CCPA obligations in scope?
4. **Erasure path**: If a user submits a GDPR Art. 17 "right to be forgotten" request today, how is their data removed from BigQuery event tables?

---
Reply: 📝 [answers] to raise confidence | `continue` to proceed at worst-case score

*(Context provided: "PII includes email, full name, IP, support ticket text (free text, may contain sensitive info). 12 engineers + 8 analysts = 20 people with project-level access today. Yes, EU customers — GDPR in scope. CCPA also applies. No erasure path exists for BigQuery.")*

---

## 🛑 HANDBRAKE ACTIVATED

**Critical finding** *(fictional analysis)*: 20 people will have unmasked access to customer PII in BigQuery with no erasure path — data protection by design requirements cannot be satisfied with this plan
**Domain**: Data
**Responsible role**: Data Engineer / Analytics Engineer + Legal / Compliance
**Why Handbrake level**: Privacy regulations require that privacy-protecting controls are built in from the start — not added later. In this fictional scenario, loading PII into an uncontrolled BigQuery project with 20 people's access creates an immediate compliance gap that starts the moment of load. The "later" plan does not satisfy regulatory requirements.

**Specialist questions for Data Engineer / Analytics Engineer:**

1. Is there a column-level security or data masking capability in BigQuery that can be applied at load time (BigQuery Column-Level Security + Policy Tags)?
2. What is the minimum set of fields that each consumer (analysts vs. engineers) actually needs — can we implement row-level and column-level access controls before migration?
3. What is the plan for honoring GDPR Art. 17 erasure requests in BigQuery event tables — partitioned deletion, manual deletion, or a separate pseudonymization table?
4. Has a Data Processing Agreement (DPA) been signed with Google Cloud for EU data?

*(Data Engineer answered: "BigQuery Policy Tags can mask columns. Analysts need email for cohort analysis but not for dashboards. No DPA confirmed — need to check. We can partition by user_id and delete partitions for erasure.")*

---

# 🟠 Devil's Advocate Analysis: Customer Analytics Pipeline to BigQuery *(Fictional Example)*

**Analyzed**: 2026-02-20
**Skill version**: 2.9.0
**Scope**: Data — Globex Corp BigQuery migration for 2M events/day with customer PII; regulatory compliance in scope *(all details fictional)*

---

## 📊 Executive Summary

**Overall Risk Rating**: 🟠 High (elevated from plan; not Critical because masking is technically feasible and a remediation path exists)

**Key Findings**:
1. PII will land in BigQuery with 20-person access and no masking — regulatory violation if shipped as proposed *(fictional scenario)*
2. No erasure path for BigQuery event tables — currently unresolvable without partitioning strategy
3. Data Processing Agreement with cloud provider for EU data processing not confirmed *(fictional scenario)*
4. Free-text support ticket content may contain special-category data (health, financial) not inventoried

**Recommendation**: ⚠️ Revise before migration — the technical path exists (BigQuery Policy Tags, partitioned erasure, IAM scoping) but must be implemented as part of the migration, not after.

**Analysis Confidence**: 🟢 High — Data Engineer confirmed masking approach; Legal input on DPA still needed

---

## 🛑 Handbrake & ⚡ Immediate Report Status

| Protocol | Finding | Domain | Escalated to | Context received | Risk change |
|----------|---------|--------|-------------|-----------------|-------------|
| ⚡ Immediate | PII in BigQuery without masking or access controls | Data | Team | ✅ Full — 20 people's access confirmed, EU + CCPA in scope | ➡️ Confirmed High |
| 🛑 Handbrake | GDPR Art. 25 + Art. 17 gap — no erasure path | Data | Data Engineer + Legal | ✅ Partial — masking approach confirmed; DPA status unknown | 🔻 Lowered to High: remediation path identified |

---

## ✅ Strengths (What Works Well)

1. **BigQuery is the right tool** — the scale (2M events/day) will strain MySQL; BigQuery's columnar storage and cost model are appropriate
2. **2-week timeline is realistic** for the technical migration alone
3. **Partitioned tables by user_id** — the engineer's proposed partitioning strategy enables the erasure path needed for GDPR

---

## ❌ Weaknesses (What Could Fail)

### 🟠 High-Priority Issues

1. **PII loaded without data protection by design** *(fictional finding)*
   - **Risk**: In this scenario, 20 Globex Corp employees get unmasked access to name, email, IP, support tickets immediately on migration. Privacy regulations require controls built in from the start
   - **Impact**: Regulatory investigation upon complaint; significant fines for non-compliance
   - **Mitigation**: Implement BigQuery Column-Level Security with Policy Tags before loading PII. Classify columns as `PII_DIRECT` (email, name), `PII_INDIRECT` (IP), `PII_SENSITIVE` (support text). Assign Policy Tags at schema creation; analysts without masking reader role see tokenized values only

2. **No erasure path for "right to be forgotten"** *(fictional finding)*
   - **Risk**: When a user submits a deletion request, there is no automated way to remove their events from BigQuery tables
   - **Impact**: Privacy regulations require erasure within a defined period. Manual deletion from event tables is infeasible at 2M events/day
   - **Mitigation**: Partition event tables by `user_id` hash + `event_date`. Erasure = `DELETE FROM events WHERE user_id = ?` on partitioned columns (BigQuery supports partition-scoped DML efficiently). Add this to the pre-migration schema design

3. **Data Processing Agreement with cloud provider not confirmed** *(fictional finding)*
   - **Risk**: Processing EU personal data without a signed DPA is a regulatory violation
   - **Impact**: Cloud provider's Data Processing Amendment is available and standard — but it must be explicitly accepted before EU data is loaded
   - **Mitigation**: Confirm DPA acceptance in cloud provider settings before migration date. Takes < 1 hour; blocks migration if not done

### 🟡 Medium-Priority Issues

1. **Support ticket free text not inventoried for special-category data**
   - **Risk**: Support tickets may contain health information, financial account details, or other Art. 9 special-category data — which requires explicit consent and stricter handling than standard PII
   - **Mitigation**: Run a sample classification job on 10K tickets before migration to identify special-category data patterns. Decide: mask entirely, or store separately with stricter access

2. **Schema drift: MySQL → BigQuery type mapping not documented**
   - **Risk**: MySQL `DATETIME` → BigQuery `TIMESTAMP` conversions have timezone semantics differences. MySQL `TINYINT(1)` is often used as boolean but BigQuery has a native `BOOL` type
   - **Impact**: Silent data corruption in aggregations if types are mapped incorrectly
   - **Mitigation**: Document and test all type mappings before cutover; run a row count and aggregation comparison between MySQL and BigQuery post-load

3. **No data quality baseline before decommission**
   - **Risk**: Once MySQL is decommissioned, there is no source-of-truth to reconcile against if BigQuery data is found to be incorrect
   - **Mitigation**: Keep MySQL in read-only mode for 30 days post-cutover; run daily row-count and aggregate-level checks

---

## ⚠️ Assumptions Challenged

| Assumption | Challenge | Evidence | Risk if wrong |
|---|---|---|---|
| "Governance can wait until after migration" | Privacy regulations require protection by design — at load time, not after | Regulatory text | Compliance gap starts day 1 of migration |
| "BigQuery access is limited to a small team" | 20 Globex Corp engineers + analysts confirmed | Confirmed by fictional team | All 20 get unmasked PII access |
| "Support tickets are safe to migrate as-is" | Free text may contain health/financial data | Regulatory classification requirements | Possible special-category violation |
| "MySQL decommission in 2 weeks" | No validation baseline + no erasure path = unsafe to decommission | Migration risk | Cannot decommission without 30-day parallel run |

---

## 🎯 Edge Cases & Failure Modes

| Scenario | What Happens | Handled? | Risk | Fix |
|----------|-------------|----------|------|-----|
| Erasure request received day 1 *(fictional)* | No erasure path; regulatory clock starts; SLA impossible | ❌ No | High | Partition by user_id before migration |
| BigQuery type mapping error on dates | Silent wrong aggregations in dashboards | ❌ No | Medium | Type mapping QA before cutover |
| Analyst queries unmasked email for debugging | PII accessed without business justification | ❌ No | High | Column-level masking before load |
| MySQL decommissioned; BigQuery has row count mismatch | No source of truth to compare against | ❌ No | Medium | 30-day parallel read-only retention |
| DPA not signed; cloud audit *(fictional)* | Regulatory violation documented | ❌ No | High | Check and sign DPA before migration |

---

## ✅ Revised Migration Plan (Recommended)

### Pre-Migration (Week 1, add to existing plan) *(fictional remediation plan)*
- [ ] Confirm and accept cloud provider's Data Processing Amendment (DPA) in Organization settings
- [ ] Design BigQuery schema with Policy Tags on PII columns (`email`, `name`, `ip_address`, `support_text`)
- [ ] Create IAM taxonomy: `analyst-pii-reader` role (masked), `engineer-pii-admin` role (unmasked for approved use cases), default = masked
- [ ] Run support ticket sample (10K records) through a text classifier to identify special-category data patterns
- [ ] Design erasure path: partition event tables by `user_id_hash` + `event_date`; document deletion query template

### Migration (Week 2, as planned)
- [ ] Load data with Policy Tags applied from day 1 — never load unmasked then mask later
- [ ] Validate row counts, aggregates, and type conversions before cutting over dashboards

### Post-Migration (Week 3–6 — do NOT decommission MySQL earlier)
- [ ] Run daily reconciliation: MySQL vs. BigQuery row counts and key aggregates
- [ ] Test the erasure path end-to-end with a synthetic user record
- [ ] After 30-day validation window: decommission MySQL

---
🔴 Devil's Advocate complete.

**Before I proceed, please confirm:**
- [ ] I have reviewed all Critical and High issues above
- [ ] I accept the risks marked as accepted (or they are mitigated)
- [ ] I want to proceed with the approved action

Reply with:
  ✅ Proceed   — continue with the approved action as planned
  🔁 Revise    — describe the change and I will re-analyse
  ❌ Cancel    — stop, do not implement
  `continue`   — proceed without addressing remaining issues (risks remain active and unmitigated)
