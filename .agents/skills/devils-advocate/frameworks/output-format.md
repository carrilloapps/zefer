# Output Format

Standard report structure for Devil's Advocate analysis. Load this file when producing the final analysis report. Use this structure directly — do NOT wrap the output in a code block.

> **Protocol order** — apply these checks BEFORE writing a single line of the report below:
>
> **PRECONDITION A — Immediate Report**: Did ⚡ Immediate Report already fire for this analysis?
> If not, and a 🟠 High or 🔴 Critical was found mid-sweep, fire it NOW before continuing. Load `immediate-report.md`.
>
> **PRECONDITION B — Handbrake**: Is there any 🔴 Critical finding in this analysis?
> If YES → **STOP. Do NOT write the report below.** Activate the Handbrake. Load `handbrake-protocol.md`. Emit the Handbrake Output Block. Wait for specialist context. Only after context is received (or user types `continue`) may the report below be written.
>
> **PRECONDITION C — Protocol order summary:**
> 1. ⚡ **Immediate Report** — fires mid-sweep on first 🟠 High or 🔴 Critical
> 2. 🛑 **Handbrake** — full stop on 🔴 Critical; waits for specialist context
> 3. 📄 This **Full Report** — written only after preconditions A and B are satisfied
> 4. 🚦 **Gate** — closes the report; awaits ✅ / 🔁 / ❌

---

# 🔴 Devil's Advocate Analysis: [Name]

**Analyzed**: [Date]
**Skill version**: [version — use the current version from SKILL.md frontmatter at time of analysis]
**Scope**: [What was analyzed — component, plan, decision]

---

## 📊 Executive Summary

**Overall Risk Rating**: 🔴 Critical / 🟠 High / 🟡 Medium / 🟢 Low

**Key Findings**:
1. [Most critical issue]
2. [Second critical issue]
3. [High-risk issue]

**Recommendation**: ✅ Approve with conditions / ⚠️ Needs fixes / ❌ Reject and redesign

**Analysis Confidence**: 🟢 High (≥80% context verified) / 🟡 Medium (50–79%) / 🔴 Low (<50% — worst-case scores applied)

> ⚠️ Findings marked **[Unverified Context]** below were scored at worst-case due to missing information. Provide the requested context to refine them.

---

## 🛑 Handbrake & ⚡ Immediate Report Status

> Include this section only when either protocol was activated. Omit if neither fired.

| Protocol | Finding | Domain | Escalated to | Context received | Risk change |
|----------|---------|--------|-------------|-----------------|-------------|
| ⚡ Immediate | [Finding] | [Domain] | [Anyone] | ✅ Full / ⚠️ Partial / ❌ None | 🔽 Lowered / ➡️ Unchanged / 🔺 Raised |
| 🛑 Handbrake | [Finding] | [Domain] | [Specialist role] | ✅ Full / ⚠️ Partial / ❌ None | 🔽 Lowered / ➡️ Unchanged / 🔺 Raised |

**Re-analysis note**: [How the received context changed the risk assessment — which findings were downgraded, confirmed, or newly surfaced.]

---

## ✅ Strengths (What Works Well)

1. **[Strength]** — Why this is good and what it protects against
2. **[Strength]** — Benefit to system or team

---

## ❌ Weaknesses (What Could Fail)

### 🔴 Critical Issues (Must fix before production)

1. **[Issue]**
   - **Risk**: What goes wrong
   - **Impact**: Consequence (data loss / outage / security breach)
   - **Likelihood**: High / Medium / Low
   - **Mitigation**: How to fix

### 🟠 High-Priority Issues (Should fix soon)

1. **[Issue]**
   - **Risk**: What goes wrong
   - **Impact**: Consequence
   - **Likelihood**: High / Medium / Low *(include when quantifiable)*
   - **Mitigation**: How to fix

### 🟡 Medium-Priority Issues (Technical debt)

1. **[Issue]**
   - **Risk**: Long-term consequence if ignored
   - **Likelihood**: Medium / Low *(include when quantifiable)*
   - **Mitigation**: How to address when time allows

---

## ⚠️ Assumptions Challenged

| Assumption | Challenge | Evidence | Risk if wrong |
|---|---|---|---|
| [What the plan assumes] | What if this is wrong? | ✅ Verified / ❌ Not verified | [Consequence] |

---

## 🎯 Edge Cases & Failure Modes

| Scenario | What Happens | Handled? | Risk | Fix |
|----------|-------------|----------|------|-----|
| [Edge case] | [Outcome] | ❌ No | High | [Solution] |
| [Edge case] | [Outcome] | ⚠️ Partial | Medium | [Solution] |

---

## 🔒 Security Concerns

### STRIDE Summary
- **Spoofing**: [Risk or ✅ Mitigated]
- **Tampering**: [Risk or ✅ Mitigated]
- **Repudiation**: [Risk or ✅ Mitigated]
- **Information Disclosure**: [Risk or ✅ Mitigated]
- **Denial of Service**: [Risk or ✅ Mitigated]
- **Elevation of Privilege**: [Risk or ✅ Mitigated]

---

## ⚡ Performance Concerns

- **Bottleneck**: [Where and under what load]
- **Scalability limit**: [What breaks first]
- **Resource usage**: [Estimated memory / DB connections / IOPS]

---

## 💡 Alternative Solutions

1. **[Alternative A]**
   - Better at: [What]
   - Worse at: [What]
   - Consider if: [Condition]

---

## ✅ Recommendations

### Must Do (Before Production)
- [ ] [Critical fix with owner]
- [ ] [Critical fix with owner]

### Should Do (Next sprint)
- [ ] [High-priority improvement]
- [ ] [High-priority improvement]

### Consider (Backlog)
- [ ] [Medium-priority improvement]

---

## 📋 Follow-Up Questions

1. [Question that changes the risk level if answered]
2. [Missing information needed to complete the analysis]
3. [Assumption that must be validated before proceeding]

---

## 🚦 Gate

> **Mandatory closing block — include on every report, no exceptions.**

```
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
---
```
