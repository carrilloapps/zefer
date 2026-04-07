# Pre-Mortem Template

Load this file when performing forward-looking failure analysis on a plan before it is executed. Imagine the solution has already failed — work backwards to find the cause.

Reference: [Google's Pre-Mortem Technique](https://hbr.org/2007/09/performing-a-project-premortem)

---

## Instructions

1. Set a future date (e.g., 3–6 months from now).
2. Assume the solution has caused a critical production incident or failed to deliver its goal.
3. Work backwards: what went wrong, why, and what warning signs were ignored.
4. Repeat for **3–5 distinct failure scenarios**.
5. For each scenario, derive concrete prevention actions to execute **now**.

---

## Pre-Mortem Report Template

```markdown
# Pre-Mortem: [Solution Name]

**Future Date**: [e.g., 6 months from now]
**Scenario**: This solution has caused a critical production incident.

---

## Failure Scenario 1: [Short title]

### What Went Wrong
[Describe the failure in concrete terms — what the user experienced, what alerted on-call]

### Root Cause
[Which weakness, assumption, or gap was the underlying cause?]

### Why We Missed It
[What was the flawed assumption? What did we not test? What did we dismiss as unlikely?]

### Warning Signs We Ignored
- Sign 1: [What we should have noticed earlier]
- Sign 2: [Red flag that was dismissed]
- Sign 3: [Test or monitor we chose not to add]

### Prevention Actions (do these NOW)
- [ ] [Concrete action — test, monitor, refactor, document]
- [ ] [Concrete action]
- [ ] [Concrete action]

---

## Failure Scenario 2: [Short title]

[Repeat structure above]

---

## Failure Scenario 3: [Short title]

[Repeat structure above]

---

## Summary: Top Prevention Priorities

| Action | Scenario it prevents | Priority |
|--------|----------------------|----------|
| [Action] | [Scenario] | 🔴 Critical |
| [Action] | [Scenario] | 🟠 High |
| [Action] | [Scenario] | 🟡 Medium |
```
