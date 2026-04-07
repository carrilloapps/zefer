# Criticality Scoring System

> *Protocol file — free to load, does not count toward context budget.*

Score every finding from **100 (most critical) to 0 (no risk)**. Report only findings **above 50** as primary content. Items scoring 1–50 appear as **warnings** or **informational notes**.

| Score | Label         | Action Required       |
|-------|---------------|-----------------------|
| 90–100 | Critical     | Immediate remediation |
| 70–89  | High         | Urgent remediation    |
| 50–69  | Medium       | Planned remediation   |
| 25–49  | Low/Warning  | Monitor and log       |
| 1–24   | Informational | Optional improvement |
| 0      | None         | No action needed      |

---

## Scoring Principle: Honest Net Effective Risk

Every score must reflect the **real-world exploitability and actual impact** of a finding — not its theoretical maximum severity. Two findings of the same vulnerability type (e.g., two SQL injections) **must** receive different scores if their exploitation prerequisites, impact scope, or data sensitivity differ.

A SQL injection behind authentication + API key + rate limiting that returns a single non-sensitive record is **not** the same as a public SQL injection that enumerates an entire user table with PII. Scoring them identically is a professional failure that destroys report credibility and generates unnecessary alarm or dangerous complacency.

> **Mandatory**: Every finding must include a `Score Justification` line that lists every factor (exploitation complexity, impact scope, data sensitivity) that influenced the final score. A score without justification is incomplete.

---

## Confidentiality Primacy — Data Exfiltration Focus

This skill operates as a **senior cybersecurity expert** whose primary domain is **confidentiality and integrity** — the protection of data against unauthorized access, disclosure, and modification. Availability concerns (service degradation, resource exhaustion, DoS) are legitimate security topics, but they are **not this skill's core mandate**.

**Core rule**: Any vulnerability that enables **data exfiltration** — direct or indirect extraction of data that should not be accessible to the attacker — is scored significantly higher than a vulnerability of the same type whose only impact is service disruption.

| Impact classification | SAR domain | Scoring treatment |
|-----------------------|-----------|-------------------|
| **Data exfiltration** — attacker extracts records, PII, credentials, secrets, or any data beyond their authorization | **Primary** — core SAR mandate | Score normally (50–100). This is what the SAR exists to find and penalize. |
| **Data modification / integrity** — attacker alters records, escalates privileges, corrupts data | **Primary** — core SAR mandate | Score normally (50–100). Integrity violations enable further breaches. |
| **Dual-vector** — same vulnerability enables both data exfiltration AND service disruption | **Primary** — score on the exfiltration vector | Score based on the data exfiltration component. Note the DoS vector as a secondary observation. |
| **Availability-only** — sole impact is service degradation, CPU/memory exhaustion, or downtime with zero data exposure | **Secondary** — outside core mandate | **Cap at 49** (Warning). Document the finding, note that remediation is recommended, and delegate to performance, infrastructure, or observability tooling. |

> **Why this matters**: A regex injection that lets an attacker send a wildcard-match-all pattern and enumerate an entire product catalog is a **data leak** — scored as a primary finding. The same regex injection where the only exploitable vector is a nested-quantifier pattern causing CPU exhaustion is an **availability problem** — capped at 49 and delegated. Same vulnerability type, fundamentally different security impact.

---

## Gate Adjustments (apply first)
| Vulnerability fully mitigated by upstream validation, guard, pipe, or middleware | **Downgrade to 25–49**, document the mitigating control explicitly |
| Availability-only finding (no data exposure, no data modification) | **Cap at 49** (Warning max). Document and delegate to performance/infrastructure tooling |

If no gate applies, proceed to multi-factor scoring.

---

## Multi-Factor Scoring (for reachable, unmitigated findings)

After confirming reachability and absence of full mitigation, assign a **base severity** for the vulnerability type (50–100), then apply three adjustment dimensions to arrive at the **final score**.

### Dimension 1 — Exploitation Complexity (adjusts downward)

Evaluate what an attacker needs to successfully exploit the vulnerability:

| Factor | Adjustment | Rationale |
|--------|-----------|-----------|
| Requires valid authentication | −5 to −15 | Attacker must first obtain valid credentials |
| Requires specific role or privilege level | −5 to −10 | Reduces the attacker pool significantly |
| Requires API key, token, or shared secret (beyond auth) | −5 to −15 | Additional barrier; key is rotatable, limits exposure window |
| Requires chained exploitation (2+ steps) | −5 to −15 | Each step reduces probability of successful exploitation |
| Rate limiting, WAF, or request throttling in place | −5 to −10 | Partial barrier — slows exploitation, does not prevent it |
| Requires internal network access (not internet-facing) | −10 to −20 | Eliminates external attack surface entirely |

> **Cumulative floor**: Exploitation complexity adjustments cannot reduce a reachable, unmitigated finding below **51** (the primary finding threshold). If the total would push below 51, cap at 51 and document the reasoning. A score of exactly 50 or below falls into the Warning range (W-prefix in the vulnerabilities registry).

### Dimension 2 — Impact Scope (adjusts upward or downward)

Evaluate the blast radius upon successful exploitation. **Data exfiltration indicators elevate the score; availability-only impact does not.**

| Factor | Adjustment | Rationale |
|--------|-----------|----------|
| Single record exposure only | −5 to −10 | Limited blast radius, contained damage |
| Paginated or limited collection exposure | No adjustment | Default assumption for list endpoints |
| Full collection or table enumeration possible | +5 to +10 | **Mass data exfiltration** — core SAR domain |
| Blind data extraction possible (timing, boolean, out-of-band) | +5 to +10 | Exfiltration through indirect channels — still a data leak |
| Cross-system, cross-database, or lateral access | +5 to +10 | Blast radius extends beyond the initial target |
| Write, modify, or delete capability (not just read) | +5 to +10 | Integrity impact beyond confidentiality |
| Privilege escalation possible | +5 to +10 | Enables further attacks, multiplies impact |
| Impact is service disruption or resource exhaustion only | Use availability-only gate | **Not SAR's primary domain** — cap at 49 |

### Dimension 3 — Data Sensitivity (adjusts upward or downward)

Evaluate the classification of the data exposed or affected:

| Data type | Adjustment | Rationale |
|-----------|-----------|-----------|
| Public or non-sensitive data | −10 to −15 | No confidentiality impact |
| Internal operational data (logs, metrics, non-PII) | −5 | Limited sensitivity, no regulatory exposure |
| Personal data — PII (names, emails, phones, addresses) | +5 | Regulatory exposure: GDPR, CCPA, LGPD |
| Financial data (balances, transactions, card numbers) | +5 to +10 | PCI-DSS, fraud risk, direct financial harm |
| Health data — PHI (medical records, diagnoses) | +5 to +10 | HIPAA, strict regulatory exposure |
| Credentials, secrets, or authentication tokens | +10 to +15 | Enables cascading compromise across systems |

---

## Scoring Decision Flow

```
Finding identified
       │
       ▼
Is the vulnerability reachable via any network-exposed surface?
       │
   NO ─┤── Cap score at 40 (Low/Warning max)
       │
   YES ▼
Are existing controls FULLY mitigating the risk?
       │
   YES ┤── Downgrade to 25–49, document the mitigating control
       │
   NO  ▼
Assign base severity (50–100) for the vulnerability type
       │
       ▼
Apply Dimension 1: Exploitation Complexity (downward adjustments)
       │
       ▼
Apply Dimension 2: Impact Scope (upward or downward)
       │
       ▼
Apply Dimension 3: Data Sensitivity (upward or downward)
       │
       ▼
Document Score Justification — list EVERY factor applied
       │
       ▼
Map to applicable standards + MITRE ATT&CK
       │
       ▼
Write actionable mitigation steps
```

---

## Comparative Scoring Reference

The same vulnerability type can produce vastly different scores. This table demonstrates correct differentiated scoring:

| Scenario | Type | Score | Key factors |
|----------|------|-------|-------------|
| Public endpoint, no auth, `SELECT *` dumps user table with PII | SQL Injection | **92** | No barriers, full enumeration, PII confirmed |
| Authenticated endpoint + API key, returns single record, non-sensitive data | SQL Injection | **55** | Auth (−10), key (−10), single record (−7), public data (−10) |
| Public endpoint, `$ne` operator bypass on login, returns admin user | NoSQL Injection | **92** | No barriers, auth bypass, credential exposure |
| Internal endpoint, authenticated, field injection on non-sensitive search | NoSQL Injection | **52** | Internal (−15), auth (−10), limited data (−5), non-sensitive (−10) |
| Public S3 bucket with PII, database backups, and secrets in logs | Cloud Storage | **97** | No barriers, mass data, PII + credentials |
| Private S3 bucket — proper ACL, missing encryption only | Cloud Storage | **55** | Access controlled, encryption gap only, no exfiltration path |
| Public search endpoint, `new RegExp(input)`, wildcard `.*` leaks full product catalog | Regex Injection | **72** | Public, data exfiltration confirmed (product data exposed via wildcard match) |
| Same regex pattern — only ReDoS vector, `.limit(1)` prevents data exposure | ReDoS (availability-only) | **45** | Availability-only cap (49 max) — no data exposed. Delegate to performance tooling |
| Internal admin-only endpoint, regex injection with data exposure | Regex Injection | **55** | Auth (−10), admin role (−5), but data exfiltration still present |

> **Mandatory rule**: If two findings in the same SAR share a vulnerability type but differ in exploitation complexity, impact scope, or data sensitivity, they **must** have visibly different scores. Identical scores for materially different risk profiles indicate a scoring failure and must be corrected before the SAR is finalized.

---

## Score Boundary Rules

| Boundary | Rule |
|----------|------|
| **Maximum**: 100 | Reserved exclusively for zero-barrier, mass-impact, credential- or PII-exposing findings with no detection, mitigation, or monitoring |
| **Minimum for primary findings**: 51 | Below 51 = warning or informational only |
| **Unreachable cap**: 40 | Hard cap — unreachable findings never exceed 40, regardless of theoretical severity |
| **Availability-only cap**: 49 | Hard cap — findings with no data exposure or modification never exceed 49, regardless of service impact severity |
| **Mitigated floor**: 25 | Fully mitigated findings score no lower than 25 (below 25 = informational, below 1 = no risk) |
| **Final score**: always an integer | No decimal scores |
