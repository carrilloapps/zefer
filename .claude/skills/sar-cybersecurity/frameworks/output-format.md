# Output Specification

> *Protocol file — free to load, does not count toward context budget.*

## Directory

```
docs/security/
```

Create this directory if it does not exist. All SAR files go here and nowhere else.

## File Naming

Every report generates **exactly two linked files**:

```
[DD-MM-YYYY]_[SHORT-TITLE]_EN.md   ← English (en_US)
[DD-MM-YYYY]_[SHORT-TITLE]_ES.md   ← Spanish (es_VE)
```

### Title derivation rule — worst finding first

The `[SHORT-TITLE]` **must** reflect the highest-scoring (worst) vulnerability discovered during the assessment. The title is derived from the **#1 finding** (the one with the highest criticality score) using the pattern:

```
[VULN-TYPE]-[AFFECTED-COMPONENT]
```

| Worst finding | Generated SHORT-TITLE |
|---------------|-----------------------|
| SQL Injection on `/api/users` (score 92) | `SQLI-API-USERS` |
| Public S3 bucket with PII (score 97) | `PUBLIC-S3-PII-EXPOSURE` |
| NoSQL operator injection on login (score 92) | `NOSQL-INJECTION-AUTH-BYPASS` |
| 12 secrets in source control (score 93) | `SECRETS-IN-SOURCE-CONTROL` |
| Critical CVE in express@4.17.1 (score 90) | `CVE-2024-XXXXX-EXPRESS` |
| Mass assignment + IDOR (score 88) | `MASS-ASSIGNMENT-PRIVILEGE-ESCALATION` |
| No findings above 50 (clean assessment) | `CLEAN-ASSESSMENT` |

**Rules**:
- Use SCREAMING-KEBAB-CASE (uppercase, hyphens, no spaces)
- Maximum 50 characters for the SHORT-TITLE
- If the worst finding is a CVE in a dependency, include the CVE ID in the title
- If two findings tie for the highest score, use the one with the broader impact scope
- The report's `# [Report Title]` heading must also lead with the worst finding: `# [Score] [Vuln Type]: [Component] — Security Assessment Report — [LANG]`

Example with worst-finding title:

```
docs/security/12-03-2026_SQLI-API-USERS_EN.md
docs/security/12-03-2026_SQLI-API-USERS_ES.md
```

Each file must contain a cross-language link at the top:

```markdown
> 🌐 **Also available in:** [Español (es_VE)](./12-03-2026_SQLI-API-USERS_ES.md)
```

---

## Vulnerabilities Registry — `docs/security/vulnerabilities.csv`

Every SAR generation must create or update a CSV file at `docs/security/vulnerabilities.csv`. This file is the **single source of truth** for all security findings across all assessments. It includes both primary findings (score > 50) and warnings (score <= 50).

### CSV structure — exactly 11 columns, in this order

```csv
ID,Type,Score,Label,Title,Detection Date,Mitigation Date,Status,Assignee,Priority,Existing Mitigation
```

### Column definitions

| Column | Description |
|--------|-------------|
| `ID` | Sequential identifier: `F01, F02...` for Findings (score > 50), `W01, W02...` for Warnings (score <= 50). Numbering is sequential per type across the entire file, not per SAR. When adding new entries, continue from the last used number. |
| `Type` | `Finding` (score > 50) or `Warning` (score <= 50) |
| `Score` | Numeric criticality score from the SAR (0-100) |
| `Label` | Severity label derived from score: `Critical` (>= 90), `High` (70-89), `Medium` (50-69), `Low` (< 50) |
| `Title` | Concise finding title in English (same as the `### [SCORE] - [Title]` heading in the SAR) |
| `Detection Date` | Date the finding was first reported: `YYYY-MM-DD` (date of the SAR that first detected it) |
| `Mitigation Date` | Empty by default. Filled manually by the team when the finding is confirmed mitigated. The agent **never** fills this field automatically. |
| `Status` | `Pending` by default. Valid values (lifecycle order): `Pending`, `In Development`, `Processing`, `In QA`, `In Staging`, `Mitigated`. The agent always writes `Pending` for new findings. All other transitions are managed by the team — the agent **never** moves a status forward or backward. |
| `Assignee` | Empty by default. Assigned manually by the team. The agent **never** fills this field. |
| `Priority` | Derived from score: `P0 - Immediate` (>= 90), `P1 - Urgent` (70-89), `P2 - Planned` (50-69), `P3 - Scheduled` (< 50) |
| `Existing Mitigation` | Controls that **already exist** in the assessed code. Must reflect what the SAR documents as existing controls, **not** the suggested remediation actions. Decision criteria: `No` = zero controls found for this finding; a **named control** (e.g., `JWT required`, `express-mongo-sanitize`, `Helmet only`, `Rate limiting on gateway`) = a specific, identifiable control is present; `Partial` = multiple controls are expected but only some are present — append the present ones in parentheses (e.g., `Partial (JWT only, no RBAC)`). Prefer named controls over `Partial` when a single specific control can be identified. |

### Priority derivation

| Score range | Priority value |
|-------------|---------------|
| >= 90 (Critical) | `P0 - Immediate` |
| 70-89 (High) | `P1 - Urgent` |
| 50-69 (Medium) | `P2 - Planned` |
| < 50 (Low/Warning) | `P3 - Scheduled` |

### Generation rules

1. **All findings must be included** — every finding and warning from the SAR, regardless of score.
2. **Sort by status group, then Score descending** — (1) open findings (score > 50) by score descending, (2) open warnings (score <= 50) by score descending, (3) mitigated entries by score descending. Within each group, highest score first.
3. **No additional columns** — exactly 11 columns as specified above, no more.
4. **Agent-controlled fields**: `ID`, `Type`, `Score`, `Label`, `Title`, `Detection Date`, `Status` (always `Pending`), `Priority`, `Existing Mitigation`.
5. **Team-controlled fields**: `Mitigation Date`, `Assignee`. The agent writes these as empty and **never** overwrites them if they already contain values.
6. **Status preservation** — when updating an existing `vulnerabilities.csv`, if a row has **any** status other than `Pending` (i.e., `In Development`, `Processing`, `In QA`, `In Staging`, or `Mitigated`), the agent must **not** overwrite it. Only new entries get `Pending`. The status lifecycle is entirely team-managed.
7. **Recurring findings** — if a finding from a previous SAR still exists in the current assessment, keep its original `ID`, `Detection Date`, `Mitigation Date`, `Status`, and `Assignee`. Update `Score`, `Label`, `Priority`, `Title`, and `Existing Mitigation` if they changed.
8. **Rows are never deleted** — if a finding from a previous SAR no longer appears in the current assessment, keep the row exactly as-is. Do **not** delete it, do **not** change its `Status`. The team manages the full lifecycle. Mitigated findings remain in the CSV as historical record.
9. **ID continuity** — IDs are permanent. Once `F01` is assigned, it is never reassigned to a different finding even if the original is mitigated.
10. **Score reclassification** — if a recurring finding's score crosses the 50 threshold (e.g., W03 was 45, now scores 55), keep the original `ID` (W03) but update `Type` to `Finding`, `Score`, `Label`, and `Priority`. The ID prefix may no longer match the Type — this is expected and preserves traceability. Do not create a new ID.

### Status lifecycle

The following statuses represent the remediation lifecycle. Only `Pending` is set by the agent; all transitions are team-managed:

```
Pending → In Development → Processing → In QA → In Staging → Mitigated
```

| Status | Meaning | Set by |
|--------|---------|--------|
| `Pending` | Finding detected, no remediation started | Agent (on creation) |
| `In Development` | Developer is actively working on a fix | Team |
| `Processing` | Fix is being reviewed (code review, PR) | Team |
| `In QA` | Fix is deployed to QA environment for testing | Team |
| `In Staging` | Fix is deployed to staging for final validation | Team |
| `Mitigated` | Fix confirmed in production, vulnerability resolved | Team |

### Example

```csv
ID,Type,Score,Label,Title,Detection Date,Mitigation Date,Status,Assignee,Priority,Existing Mitigation
F01,Finding,92,Critical,SQL Injection in /api/users endpoint,2026-03-12,,Pending,,P0 - Immediate,No
F02,Finding,85,High,express@4.17.1 CVE-2024-12345 (XSS),2026-03-12,,Pending,,P1 - Urgent,Helmet only
F03,Finding,72,High,Regex injection with data enumeration in /api/search,2026-03-12,,Pending,,P1 - Urgent,Partial (regex escaping on search only)
F04,Finding,55,Medium,Missing encryption at rest on user_sessions table,2026-03-12,,Pending,,P2 - Planned,TLS in transit only
W01,Warning,45,Low,Missing rate limiting on public API,2026-03-12,,Pending,,P3 - Scheduled,No
W02,Warning,38,Low,Inline validation without formal structure on /api/profile,2026-03-12,,Pending,,P3 - Scheduled,Partial (inline checks only, no schema)
W03,Warning,35,Low,Unreachable SQL injection in deprecated admin module,2026-03-12,,Pending,,P3 - Scheduled,No
```

## Required Document Structure (each file)

```markdown
# [Report Title] — [LANG]

> 🌐 Also available in: [link to counterpart]

## Table of Contents
## Executive Summary
## Scope & Methodology
## Findings  (ordered 100 → 51, then warnings 50 → 1)
### [SCORE] — [Finding Title]
- Description
- Affected Component(s)
- Evidence / Code Reference
- Standards Violated
- CWE ID(s) (mandatory — map to CWE/MITRE Top 25 when applicable)
- MITRE ATT&CK Technique (if applicable)
- Score Justification (list every exploitation complexity, impact scope, and data sensitivity factor)
- Suggested Mitigation Actions
## Mitigated Findings
### [MITIGATED] — [ID] [Original Title] (was: [Original Score])
- Original Detection Date
- Mitigation Date
- Original SAR Reference
## Dependency & Supply Chain Analysis
### Dependency Inventory Summary
### Vulnerable Dependencies (CVE list)
### Integrated Skills/Plugins Evaluation
### CWE/MITRE Top 25 Coverage Matrix
### OWASP Top 10 Alignment
### SANS/CIS Controls Alignment
## Security Posture Dashboard
## Risk Matrix
## Compliance Gap Summary
## Appendix
```

---

## Mitigated Findings Section (mandatory when mitigated entries exist)

When the existing `vulnerabilities.csv` contains entries with `Status: Mitigated`, the SAR must include a **Mitigated Findings** section between Findings and Dependency & Supply Chain Analysis. This section provides visibility into the project's remediation progress.

### When to include

- Read `vulnerabilities.csv` before generating the SAR.
- If **any** row has `Status: Mitigated`, include the section.
- If **no** rows are mitigated, omit the section entirely.

### Presentation format

Each mitigated finding appears as a compact subsection:

```markdown
## Mitigated Findings

> 3 previously reported findings have been mitigated since their initial detection.

### [MITIGATED] — F01 SQL Injection in /api/users endpoint (was: 92 Critical)
- **Detection Date**: 2026-01-15
- **Mitigation Date**: 2026-02-20
- **Original SAR**: [15-01-2026_SQLI-API-USERS_EN.md](./15-01-2026_SQLI-API-USERS_EN.md)

### [MITIGATED] — W02 Inline validation without formal structure (was: 38 Low)
- **Detection Date**: 2026-01-15
- **Mitigation Date**: 2026-03-01
- **Original SAR**: [15-01-2026_SQLI-API-USERS_EN.md](./15-01-2026_SQLI-API-USERS_EN.md)
```

### Rules

1. **Source of truth is `vulnerabilities.csv`** — the agent reads the CSV to determine which findings are mitigated. It does not infer mitigation from code analysis.
2. **Include ID, Title, original Score, and Label** — these come directly from the CSV row.
3. **Link to the original SAR** — if the original SAR file is still present in `docs/security/`, link to it.
4. **Order by Mitigation Date descending** — most recently mitigated first.
5. **Summary count** — start the section with a count: "N previously reported findings have been mitigated since their initial detection."
6. **No re-analysis** — mitigated findings are not re-scored or re-evaluated. They are displayed as a historical summary only.

---

## Security Posture Dashboard (mandatory)

Every SAR must include a **Security Posture Dashboard** section immediately after Dependency & Supply Chain Analysis and before Risk Matrix (matching the Required Document Structure template above). This section provides quantitative metrics that serve as measurable OKRs for the assessed system.

### Required metrics

Calculate and present the following metrics based on the assessment results:

| Metric | Formula | Example |
|--------|---------|--------|
| **Assessment Coverage** | (Endpoints/components analyzed ÷ total endpoints/components discovered) × 100 | 87% (48/55 endpoints analyzed) |
| **Secure Surface** | (Endpoints with no findings > 50 ÷ total endpoints analyzed) × 100 | 62% (30/48 endpoints secure) |
| **Critical Exposure** | (Endpoints with findings ≥ 90 ÷ total endpoints analyzed) × 100 | 8% (4/48 critical) |
| **High Exposure** | (Endpoints with findings 70–89 ÷ total endpoints analyzed) × 100 | 12% (6/48 high) |
| **Medium Exposure** | (Endpoints with findings 50–69 ÷ total endpoints analyzed) × 100 | 17% (8/48 medium) |
| **Auth Coverage** | (Endpoints with authentication enforced ÷ total endpoints analyzed) × 100 | 91% (44/48 authenticated) |
| **Input Validation Coverage** | (Endpoints with input validation ÷ endpoints that accept user input) × 100 | 73% (32/44 validated) |
| **Parameterized Query Rate** | (DB queries using parameterized/prepared statements ÷ total DB queries found) × 100 | 85% (34/40 parameterized) |
| **Secrets Hygiene** | (Secrets managed via secrets manager ÷ total secrets discovered) × 100 | 58% (7/12 managed) |
| **Encryption Coverage** | (Data stores with encryption at rest ÷ total data stores) × 100 | 75% (3/4 encrypted) |
| **Compliance Alignment** | (Standards with zero critical gaps ÷ total applicable standards) × 100 | 65% (13/20 aligned) |
| **Mean Finding Score** | Sum of all finding scores ÷ number of findings (primary only, > 50) | 74.3 |
| **Remediation Priority Index** | (Critical + High findings ÷ total primary findings) × 100 | 56% (10/18 urgent) |
| **CWE/MITRE Top 25 Coverage** | (CWE Top 25 categories with zero findings ÷ 25) × 100 | 88% (22/25 clean) |
| **OWASP Top 10 Alignment** | (OWASP Top 10 categories with zero critical gaps ÷ 10) × 100 | 70% (7/10 aligned) |

### Conditional metrics

Include these when the assessment scope covers the relevant area:

| Metric | When to include | Formula |
|--------|----------------|--------|
| **Cloud Storage Secure Rate** | Cloud storage in scope | (Buckets/containers with proper ACL + encryption ÷ total) × 100 |
| **CORS Policy Compliance** | APIs with CORS | (Endpoints with restrictive CORS ÷ endpoints with CORS enabled) × 100 |
| **Rate Limiting Coverage** | Public APIs | (Public endpoints with rate limiting ÷ total public endpoints) × 100 |
| **Logging & Monitoring Rate** | Observability in scope | (Endpoints with security event logging ÷ total endpoints) × 100 |
| **RBAC Enforcement Rate** | Role-based access in scope | (Endpoints with role checks ÷ endpoints requiring role checks) × 100 |
| **Dependency Vulnerability Rate** | Dependency audit in scope | (Dependencies with known CVEs ÷ total dependencies) × 100 |
| **Version Pinning Rate** | Dependency audit in scope | (Dependencies pinned to exact version ÷ total dependencies) × 100 |
| **Skills/Plugins Security Rate** | Integrated skills in scope | (Skills/plugins passing all checks ÷ total skills/plugins) × 100 |

### Presentation format

Present the dashboard as a single summary table at the top of the section, followed by a severity distribution breakdown:

```markdown
## Security Posture Dashboard

| Metric | Value | Rating |
|--------|-------|--------|
| Assessment Coverage | 87% (48/55) | ✅ |
| Secure Surface | 62% (30/48) | ⚠️ |
| Critical Exposure | 8% (4/48) | 🟥 |
| ... | ... | ... |

### Severity Distribution

| Severity | Count | % of Findings | % of Surface |
|----------|-------|---------------|-------------|
| Critical (90–100) | 4 | 22% | 8% |
| High (70–89) | 6 | 33% | 12% |
| Medium (50–69) | 8 | 44% | 17% |
| Warning (≤50) | 5 | — | 10% |
| **Secure (no findings)** | **30** | **—** | **62%** |
```

### Rating thresholds

| Rating | Symbol | Condition |
|--------|--------|----------|
| Good | ✅ | Metric ≥ 80% (or ≤ 10% for exposure metrics) |
| Needs improvement | ⚠️ | Metric 50–79% (or 11–30% for exposure) |
| Critical | 🟥 | Metric < 50% (or > 30% for exposure) |

> **Rule**: All percentages must show both the percentage and the raw count in parentheses (e.g., `62% (30/48)`). Raw counts without percentages or percentages without raw counts are incomplete.
>
> **Scope rule**: Metrics must reflect only the assessed surface. If certain areas were outside the assessment scope (e.g., only 2 domain frameworks loaded), mark unassessed metrics as `N/A — outside assessment scope` rather than omitting them or inflating denominators with unverified data.
