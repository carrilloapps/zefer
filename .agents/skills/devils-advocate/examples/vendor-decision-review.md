# Example Devil's Advocate Analysis: Strategy — CTO Migrating Entire Infrastructure from AWS to GCP

> ⚠️ **EDUCATIONAL EXAMPLE — NOT FOR IMPLEMENTATION.** This file contains a fictional infrastructure migration proposal driven by vendor pressure, used solely to demonstrate how Devil's Advocate identifies Type 1 irreversible decisions being made under artificial urgency. All company names, vendor details, and financial figures are fictional.

> 🔍 **Adversarial analysis example.** The proposal below is intentionally a high-risk strategic decision made under vendor-driven time pressure without proper due diligence.

> **Original proposal (from CTO):**We are moving our entire infrastructure from AWS to GCP in Q2 (12 weeks). Motivation: GCP's BigQuery pricing is better for our analytics workload, and a GCP salesperson offered 40% cloud credit for 12 months. The plan is to migrate all 23 AWS services (EC2, RDS, S3, SQS, Lambda, CloudFront, Route 53, IAM, and more) in parallel teams over the quarter. No rollback plan. Engineers will learn GCP on the job.

---

## ⚡ IMMEDIATE REPORT — 🔴 Critical Finding

**Finding**: A full infrastructure migration of 23 services in 12 weeks with no rollback plan, no parallel-run period, and engineers who don't know the target platform is a Type 1 irreversible decision being treated as a Type 2 reversible one.
**Domain**: Strategy
**Why immediate**: Once DNS, IAM, data, and deployment pipelines are migrated, the cost and complexity of reversing the decision grows non-linearly with each service completed. The "40% credit for 12 months" is a temporary incentive that doesn't offset the permanent cost of a failed migration.
**Risk if not addressed**: Extended production outage during migration; data loss from untested migration paths; team burnout from learning GCP while maintaining production; full reversal cost if migration fails mid-way is higher than the original migration cost.

---
### 🔍 Context Needed

1. **BigQuery-specific trigger**: Is the primary driver BigQuery analytics? Could a hybrid approach (BigQuery only, keep everything else on AWS) achieve 80% of the benefit at 10% of the risk?
2. **Rollback capability**: At what point during the migration would reverting to AWS become impossible or prohibitively expensive?
3. **Team GCP experience**: How many engineers on the team have shipped production infrastructure on GCP? Is there a migration timeline that accounts for a GCP learning curve?
4. **Credit terms**: What happens after the 12-month credit expires? What is the full unit economics comparison at list price?

---
Reply: 📝 [answers] to raise confidence | `continue` to proceed at worst-case score

*(Context provided: "The real driver is BigQuery. We haven't evaluated a hybrid approach. Rollback becomes hard after we migrate RDS to CloudSQL and decommission AWS. Team GCP experience: 2 of 8 engineers have used GCP non-trivially. Credits expire after 12 months and list price is comparable to AWS. 12-week timeline came from the GCP salesperson's estimate.")*

---

## 🛑 HANDBRAKE ACTIVATED

**Critical finding**: Type 1 irreversible platform decision based on a vendor's timeline estimate, with no hybrid evaluation, minimal team GCP experience, no rollback plan, and a financial incentive that expires in 12 months — at which point the economics may no longer favor GCP
**Domain**: Strategy
**Responsible role**: CTO / VP Engineering
**Why Handbrake level**: This is the definition of a Type 1 decision being made with Type 2 urgency. The 40% credit creates artificial time pressure that is making the team skip the due diligence required for an irreversible infrastructure platform choice.

**Specialist questions for CTO / VP Engineering:**

1. **Hybrid option evaluated?** Has a BigQuery-only approach been modeled — keeping all AWS services, adding GCP solely for analytics? This could deliver 80%+ of the BigQuery cost benefit without any infrastructure migration risk.
2. **True cost model**: The 40% credit covers 12 months. What is the TCO comparison at list price for 36 months, factoring in migration cost, engineering time, and potential downtime? Has Finance signed off?
3. **Critical path dependency**: Which of the 23 services, if migrated incorrectly, causes a production incident for customers? What is the blast radius if RDS → CloudSQL migration corrupts data?
4. **Reversibility trigger**: If the migration is 60% complete and the team encounters a blocking technical issue, what is the explicit decision framework for continuing vs. abandoning?

*(CTO answered: "Honest answer: we haven't evaluated hybrid. The credit deadline created urgency. Finance hasn't modeled post-credit TCO. We don't have a reversibility decision framework.")*

---

# 🔴 Devil's Advocate Analysis: Full Infrastructure Migration AWS → GCP

**Analyzed**: 2026-02-20
**Skill version**: 2.9.0
**Scope**: Strategy — full infrastructure platform migration for a production system, 12-week timeline, 23 AWS services, team of 8 engineers

---

## 📊 Executive Summary

**Overall Risk Rating**: 🔴 Critical

**Key Findings**:
1. Type 1 irreversible decision made under artificial urgency (vendor credit deadline) without evaluating the obvious lower-risk alternative (BigQuery hybrid)
2. No rollback plan — partial migration failure has no defined recovery path
3. Finance has not modeled post-credit TCO — the economic case may not hold at list price
4. Timeline provided by the GCP salesperson, not by the engineering team — 12 weeks for 23 services with 6/8 engineers learning GCP is not a credible estimate

**Recommendation**: ❌ Pause full migration — evaluate BigQuery-only hybrid first. If full migration is still desired after that analysis, build a proper 6-month plan with a rollback gate at each service milestone.

**Analysis Confidence**: 🟢 High — CTO confirmed hybrid not evaluated, Finance not consulted, timeline is vendor-sourced

---

## 🛑 Handbrake & ⚡ Immediate Report Status

| Protocol | Finding | Domain | Escalated to | Context received | Risk change |
|----------|---------|--------|-------------|-----------------|-------------|
| ⚡ Immediate | Type 1 decision with no rollback plan or hybrid evaluation | Strategy | CTO | ✅ Full — hybrid unreviewed, Finance not consulted, timeline is vendor estimate | ➡️ Confirmed Critical |
| 🛑 Handbrake | Full infrastructure migration under vendor-driven urgency | Strategy | CTO / VP Eng | ✅ Full — CTO confirmed no hybrid evaluation, no Finance model, no reversibility framework | 🔺 Raised: decision framework entirely absent |

---

## ✅ Strengths (What Works Well)

1. **BigQuery economics** — the analytics cost benefit is real and worth pursuing; the question is how to get there with the least risk
2. **Clear trigger identified** — knowing the primary driver is BigQuery allows for a much lower-risk path (hybrid)
3. **Team is willing** — 8 engineers ready to execute is a real asset; the question is channeling that capacity safely

---

## ❌ Weaknesses (What Could Fail)

### 🔴 Critical Issues

1. **Type 1 decision treated as Type 2 — driven by vendor incentive deadline**
   - **Risk**: Platform migrations of this scale typically take 12–24 months in well-staffed engineering organizations. A 12-week timeline for 23 services at 6/8 GCP-inexperienced engineers is not a technical estimate — it's a sales pitch
   - **Impact**: Rushed migration → data corruption, production outages, security misconfigurations on a platform nobody knows. Cost to recover from a failed mid-migration is higher than the original migration cost
   - **Mitigation**: Decouple the BigQuery opportunity from the full migration decision. Evaluate and execute them separately on their own timelines

2. **No rollback plan — partial migration has no defined exit**
   - **Risk**: At 60% completion, if a critical service migration fails, the infrastructure is split across two platforms with inconsistent state. There is no defined "abort and revert" procedure
   - **Impact**: Extended production incident; impossible to go forward or backward without major disruption
   - **Mitigation**: Define a rollback gate at each service migration: explicit criteria for continuing vs. stopping, and what "stopping" means technically for each service already migrated

3. **TCO not modeled past the credit period**
   - **Risk**: 40% credit for 12 months → 0% credit at month 13. The true comparison is 36-month TCO including migration cost, engineering time, training, and list pricing
   - **Impact**: Migration completes, credit expires, and the economics are neutral or negative vs. staying on AWS — the team has absorbed all the risk and disruption for a flat outcome
   - **Mitigation**: Finance models 36-month TCO before approving the migration budget; include: GCP list pricing, migration engineering cost (at loaded salary), training, estimated downtime cost

### 🟠 High-Priority Issues

1. **Hybrid approach not evaluated**
   - **Risk**: BigQuery-only hybrid achieves the stated goal (analytics cost savings) at approximately 1/10 the migration risk
   - **Impact**: The team is about to spend 3–6 months migrating 23 services when the real problem could be solved by one service (BigQuery + a data pipeline from AWS RDS → BigQuery)
   - **Mitigation**: 2-week spike: evaluate BigQuery-only hybrid. Model: AWS stays as-is + BigQuery for analytics. If this achieves 80%+ of the cost benefit, execute this instead

2. **6 of 8 engineers lack GCP production experience**
   - **Risk**: Learning a new cloud platform while maintaining production services while executing a migration is a recipe for burnout and mistakes
   - **Impact**: Migration mistakes on unfamiliar infrastructure are harder to diagnose and recover from
   - **Mitigation**: If full migration proceeds: allocate dedicated learning sprints before migration begins; engage GCP Professional Services for the first 3 months; hire/contract a GCP-experienced engineer

3. **Conway's Law risk: AWS IAM model ≠ GCP IAM model**
   - **Risk**: GCP's IAM is fundamentally different from AWS (Projects > Folders > Organizations vs. AWS accounts and roles). Migrating IAM permissions without understanding the GCP model creates security gaps
   - **Impact**: Over-permissive or misconfigured IAM on GCP could expose resources that were correctly locked down on AWS
   - **Mitigation**: IAM migration must be reviewed by someone with GCP IAM expertise before any other service migration

---

## ⚠️ Assumptions Challenged

| Assumption | Challenge | Evidence | Risk if wrong |
|---|---|---|---|
| "12 weeks is realistic" | Salesperson estimate, not engineering estimate. AWS→GCP migrations take 6–24 months for 20+ services | Industry benchmarks (Google's own migration guides suggest 6–12 months for similar scope) | Extended production risk; team burnout |
| "GCP is cheaper" | True for BigQuery; unverified for the full stack at list price | No 36-month TCO model exists | Economics neutral or negative after credits expire |
| "Engineers will learn on the job" | Unfamiliar platform + production migration + maintenance = error rate increase | Cognitive load research | Migration mistakes on unfamiliar infrastructure |
| "This is reversible" | Post-RDS→CloudSQL decommission, reversal is extremely costly | CTO confirmed rollback not planned | No exit path if migration fails mid-way |

---

## 🎯 Edge Cases & Failure Modes

| Scenario | What Happens | Handled? | Risk | Fix |
|----------|-------------|----------|------|-----|
| RDS → CloudSQL migration corrupts data | Production database unusable; recovery from backup takes hours+ | ❌ No plan | Critical | Dual-write period; keep RDS read-only for 60 days post-migration |
| Team hits blocking GCP technical issue at week 8 | No rollback plan; 60% migrated; stuck | ❌ No | Critical | Rollback gate definition at each service |
| GCP credits expire; economics are flat vs. AWS | Migration cost unrecovered; no net benefit | ❌ No model | High | Finance 36-month TCO before approval |
| IAM misconfiguration on GCP | Security gap on migrated services | ❌ No GCP IAM expertise | High | IAM reviewed by GCP expert before migration |
| Key engineer leaves mid-migration | GCP knowledge concentrated in 2 people | ❌ No | Medium | GCP training for all engineers before migration starts |

---

## 💡 Recommended Decision Framework

### Option A (Recommended): BigQuery-Only Hybrid

```
Week 1–2:  Evaluate BigQuery hybrid (keep AWS; add BigQuery for analytics)
Week 3–8:  Build AWS RDS → BigQuery pipeline (CDC or batch export)
Week 9–12: Migrate analytics workloads to BigQuery; decommission MySQL analytics tables

Result: 80% of cost benefit at 10% of the risk. AWS stays stable.
```

### Option B: Full Migration (if hybrid is insufficient)

```
Month 1:   GCP training (all 8 engineers); GCP IAM design; 36-month TCO sign-off from Finance
Month 2–3: Migrate non-production services (dev/staging); validate GCP tooling
Month 4:   Migrate lowest-risk production services (S3 → GCS, SQS → Pub/Sub)
Month 5–6: Migrate stateful services (RDS → CloudSQL) with 60-day dual-write parallel run
Month 7:   Migrate DNS, CDN, IAM
Month 8–9: Decommission AWS services (only after 60-day validation per service)

Rollback gate: defined stopping criteria at each service milestone.
```

---

## ✅ Recommendations

### Must Do (This week — before committing to the migration)
- [ ] Evaluate BigQuery-only hybrid: 2-week spike with a clear go/no-go recommendation
- [ ] Commission a 36-month TCO model from Finance (migration cost + list pricing + engineering time)
- [ ] Do NOT commit to the 12-week timeline until the engineering team produces their own estimate

### Must Do (Before any migration work begins, if full migration is chosen)
- [ ] Define a rollback gate at each service milestone with explicit criteria
- [ ] Engage GCP Professional Services or hire a GCP-experienced engineer
- [ ] Get Finance sign-off on the 36-month TCO model

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
