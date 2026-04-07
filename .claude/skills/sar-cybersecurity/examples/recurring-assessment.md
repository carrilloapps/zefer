# Example: Recurring Assessment with Mitigated Findings

> *Reference example — load on demand to see correct handling of mitigated findings, recurring entries, and `vulnerabilities.csv` updates across multiple SARs.*

## Scenario

Second SAR on the same project. The first SAR (January 15) found 3 findings. Between then and now (March 12):
- F01 (SQL Injection, score 92) was **mitigated** by the team (parameterized queries deployed Feb 20)
- W01 (Missing rate limiting, score 45) is **still present** but the team marked it `In Development`
- F02 (NoSQL operator injection, score 85) is **still present** with no status change

The current assessment also discovers 1 new finding: Regex injection (score 72).

---

## Input: Existing `vulnerabilities.csv` (before this SAR)

```csv
ID,Type,Score,Label,Title,Detection Date,Mitigation Date,Status,Assignee,Priority,Existing Mitigation
F01,Finding,92,Critical,SQL Injection in /api/users endpoint,2026-01-15,2026-02-20,Mitigated,@carlos,P0 - Immediate,No
F02,Finding,85,High,NoSQL operator injection on /api/products,2026-01-15,,Pending,,P1 - Urgent,No
W01,Warning,45,Low,Missing rate limiting on public API,2026-01-15,,In Development,@maria,P3 - Scheduled,No
```

---

## Step 6 — Read Vulnerabilities Registry (before writing)

The agent reads the CSV and identifies:
1. **Mitigated**: F01 (SQL Injection) — must appear in `## Mitigated Findings` section
2. **Recurring**: F02 (NoSQL injection) — keep ID `F02`, `Detection Date` 2026-01-15, `Status` `Pending`
3. **Recurring**: W01 (Rate limiting) — keep ID `W01`, `Detection Date` 2026-01-15, `Status` `In Development`, `Assignee` `@maria`

---

## Step 7 — Write Output Files

### SAR Title

Worst finding is F02 (NoSQL operator injection, score 85). Title:

```
docs/security/12-03-2026_NOSQL-INJECTION-API-PRODUCTS_EN.md
docs/security/12-03-2026_NOSQL-INJECTION-API-PRODUCTS_ES.md
```

### Mitigated Findings section (in the SAR)

```markdown
## Mitigated Findings

> 1 previously reported finding has been mitigated since its initial detection.

### [MITIGATED] — F01 SQL Injection in /api/users endpoint (was: 92 Critical)
- **Detection Date**: 2026-01-15
- **Mitigation Date**: 2026-02-20
- **Original SAR**: [15-01-2026_SQLI-API-USERS_EN.md](./15-01-2026_SQLI-API-USERS_EN.md)
```

### Findings section (active findings only)

```markdown
## Findings

### 85 — NoSQL operator injection on /api/products
- (Full finding documentation...)
- **Vulnerabilities Registry ID**: F02 (recurring from 2026-01-15)

### 72 — Regex injection with data enumeration in /api/search
- (Full finding documentation...)
- **Vulnerabilities Registry ID**: F03 (new)

---

### Warnings

### 45 — Missing rate limiting on public API
- (Warning documentation...)
- **Vulnerabilities Registry ID**: W01 (recurring from 2026-01-15, Status: In Development)
```

---

## Step 8 — Update Vulnerabilities Registry (after writing)

### Output: Updated `vulnerabilities.csv`

```csv
ID,Type,Score,Label,Title,Detection Date,Mitigation Date,Status,Assignee,Priority,Existing Mitigation
F02,Finding,85,High,NoSQL operator injection on /api/products,2026-01-15,,Pending,,P1 - Urgent,No
F03,Finding,72,High,Regex injection with data enumeration in /api/search,2026-03-12,,Pending,,P1 - Urgent,Partial (regex escaping on search only)
W01,Warning,45,Low,Missing rate limiting on public API,2026-01-15,,In Development,@maria,P3 - Scheduled,No
F01,Finding,92,Critical,SQL Injection in /api/users endpoint,2026-01-15,2026-02-20,Mitigated,@carlos,P0 - Immediate,No
```

### What changed:

| ID | Action | Details |
|----|--------|---------|
| F01 | **Preserved as-is** | Status `Mitigated`, `Mitigation Date`, `Assignee` — all team-managed fields untouched |
| F02 | **Preserved ID and Detection Date** | Score unchanged (85), Status still `Pending` — no team changes to preserve |
| F03 | **New entry** | Next available F-number (F03), `Detection Date` today, `Status: Pending` |
| W01 | **Preserved ID, Detection Date, Status, Assignee** | Status `In Development` and Assignee `@maria` are team-managed — agent does not overwrite |

### Sorting applied:

1. Open findings by Score descending: F02 (85), F03 (72)
2. Open warnings by Score descending: W01 (45)
3. Mitigated by Score descending: F01 (92)

---

## Key Lessons from This Example

1. **Step 6 (read CSV) happens BEFORE Step 7 (write report)** — the agent needs the mitigated findings list before generating the SAR.
2. **Mitigated findings appear in the SAR** under `## Mitigated Findings` with the `[MITIGATED]` label — they are not re-analyzed or re-scored.
3. **Team-managed fields are sacred** — `Status: In Development`, `Assignee: @maria`, `Mitigation Date: 2026-02-20` are never overwritten by the agent.
4. **New IDs continue the sequence** — F03 follows F02, not F01 (mitigated IDs are never reused).
5. **The CSV is sorted by Status groups** — open first (by Score desc), then mitigated (by Score desc).
