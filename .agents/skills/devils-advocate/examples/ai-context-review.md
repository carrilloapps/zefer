# Example Devil's Advocate Analysis: AI Context File Review

> ⚠️ **EDUCATIONAL EXAMPLE — NOT FOR IMPLEMENTATION.** This file contains a fictional AI context file review with deliberately conflicting instructions, used solely to demonstrate how Devil's Advocate identifies instruction conflicts, context starvation, and hallucination root causes. All file contents, function names, and team details are fictional.

> 🔍 **Adversarial analysis example.** The scenario below is intentionally flawed — it contains conflicting naming conventions across AI context files and missing function inventories that cause hallucinations.

> **Original request (from AI Tooling Lead):**"Review our AI context setup. We have a AGENTS.md at the repo root, a .github/copilot-instructions.md, and a README.md. The team says Copilot has been generating inconsistent code — sometimes camelCase, sometimes snake_case — and recently hallucinated a function that doesn't exist in our codebase."

---

## ⚡ IMMEDIATE REPORT — 🔴 Critical Finding

**Finding**: Direct instruction conflict detected between AGENTS.md and `.github/copilot-instructions.md` — one says `camelCase` for all functions, the other says `snake_case` for Python functions — no precedence rule defined.
**Domain**: AI Optimization
**Why immediate**: Active hallucination trigger — the AI alternates between both rules non-deterministically across sessions. This is the confirmed root cause of the reported inconsistency.
**Risk if not addressed**: Every code generation session may produce a different naming convention. Code review overhead increases permanently; codebase consistency degrades with every AI-assisted contribution.

---
### 🔍 Context Needed

1. **Canonical source**: Which file is authoritative for naming conventions — AGENTS.md or `.github/copilot-instructions.md`? Is this documented anywhere?
2. **Stack**: Is this a mixed-language codebase (Python + TypeScript)? Or pure Python?
3. **File sizes**: What are the approximate sizes (KB or token count) of each AI context file currently?
4. **Missing function hallucination**: What function did Copilot hallucinate? Is it a function that exists in docs but not in code, or entirely invented?

---
Reply: 📝 [answers] to raise confidence | `continue` to proceed at worst-case score

*(Context provided: "AGENTS.md is authoritative — copilot-instructions.md was added later by a different engineer without updating AGENTS.md. Mixed stack: Python backend + TypeScript frontend. AGENTS.md: ~14KB. copilot-instructions.md: ~4KB. README.md: ~8KB. Hallucinated function: `user_service.get_by_email_verified()` — doesn't exist; we have `get_by_email()` and `is_verified()` separately.")*

---

## 🛑 HANDBRAKE ACTIVATED

**Critical finding**: Instruction conflict + context starvation causing confirmed hallucinations in production
**Domain**: AI Optimization
**Responsible role**: Tech Lead / AI Tooling Lead
**Why Handbrake level**: Multi-cause hallucination pattern confirmed — instruction conflict (naming), context starvation (function inventory missing), and context budget risk (AGENTS.md at ~14KB is 3,500 tokens, combined always-loaded context ~6,500 tokens — approaching limits). Non-deterministic AI behavior is a production quality risk.

**Context received**: AGENTS.md is authoritative but copilot-instructions.md contradicts it. Full stack confirmed. AGENTS.md is oversized for an always-loaded file. Hallucination traceable to absent function inventory context.

**Specialist context questions sent to Tech Lead / AI Tooling Lead:**

1. Is AGENTS.md meant to be always loaded, or only when explicitly invoked? Is there a Tier 0 / Tier 1 strategy?
2. Is there any documentation of which functions exist in `user_service` that the AI could reference instead of hallucinating?
3. What is the update process when a developer adds a new module — is AGENTS.md reviewed as part of the PR checklist?

*(Specialist answered: "AGENTS.md is meant to always load. No Tier 0/1 strategy — it was never designed. No function inventory exists. AGENTS.md is never in the PR checklist — it's updated ad hoc.")*

**Re-analysis**: Three independent root causes confirmed: (1) instruction conflict with no precedence rule, (2) context starvation on codebase structure, (3) no progressive loading strategy causing unnecessary context budget consumption on every task. Combined, these systematically degrade AI output quality over time.

---

# 🔴 Devil's Advocate Analysis: AI Context File Architecture

**Analyzed**: 2026-02-20
**Skill version**: 2.9.0
**Scope**: AI Optimization — AGENTS.md, .github/copilot-instructions.md, README.md

---

## 📊 Executive Summary

**Overall Risk Rating**: 🔴 Critical

**Key Findings**:
1. Direct naming convention conflict (camelCase vs snake_case) with no precedence rule — confirmed root cause of reported inconsistency
2. AGENTS.md at ~14KB (~3,500 tokens) has no progressive loading strategy; all content loads for every task including irrelevant sections
3. No function/module inventory in any AI context file — confirmed root cause of `get_by_email_verified()` hallucination

**Recommendation**: ⚠️ Needs fixes — restructure into Tier 0 (compact index) + Tier 1 (domain detail files); resolve instruction conflict; add architecture overview

**Analysis Confidence**: 🟢 High — AI Tooling Lead provided full context on all findings

---

## 🛑 Handbrake & ⚡ Immediate Report Status

| Protocol | Finding | Domain | Escalated to | Context received | Risk change |
|----------|---------|--------|-------------|-----------------|-------------|
| ⚡ Immediate | Naming convention conflict — camelCase vs snake_case | AI Optimization | Team | ✅ Full — AGENTS.md is authoritative | ➡️ Confirmed Critical |
| 🛑 Handbrake | Multi-cause hallucination pattern | AI Optimization | AI Tooling Lead | ✅ Full — no Tier 0/1, no function inventory | 🔺 Raised: 3 independent root causes confirmed |

**Re-analysis note**: Instruction conflict is the immediate fix (remove duplicate rule from copilot-instructions.md). Context starvation requires adding a lightweight module/function map to AGENTS.md or a new Tier 1 file. Progressive loading requires a Tier 0 restructure — architectural change, medium effort.

---

## ✅ Strengths (What Works Well)

1. **Canonical source identified** — AGENTS.md is accepted as authoritative; no organizational dispute about ownership
2. **Mixed-stack awareness** — the team knows Python and TypeScript coexist; the intent to handle both is correct
3. **Active monitoring** — team noticed the inconsistency and hallucination; feedback loop exists

---

## ❌ Weaknesses (What Could Fail)

### 🔴 Critical Issues (Must fix before next AI-assisted sprint)

1. **Naming convention conflict — active hallucination trigger**
   - **Risk**: AGENTS.md says `camelCase` for all functions; copilot-instructions.md says `snake_case` for Python; AI alternates between them non-deterministically
   - **Impact**: Code review friction on every AI-generated PR; codebase inconsistency accumulates
   - **Likelihood**: Certain — already occurring per reported symptoms
   - **Mitigation**: Remove the naming convention section from copilot-instructions.md entirely; add a single deference line: "For all naming conventions, see AGENTS.md — it is the canonical source"

2. **Context starvation — function inventory absent**
   - **Risk**: No AI context file documents what functions, classes, or modules exist; AI fills the gap by hallucinating plausible-sounding names
   - **Impact**: `user_service.get_by_email_verified()` hallucination is a symptom; other invented APIs are being generated silently
   - **Likelihood**: High — confirmed hallucination with no function inventory
   - **Mitigation**: Add a lightweight module map section to AGENTS.md (or a new Tier 1 `architecture.md`) listing key services and their public functions

### 🟠 High-Priority Issues

1. **AGENTS.md has no progressive loading strategy**
   - **Risk**: At ~14KB (~3,500 tokens), AGENTS.md loads entirely for every task — a question about Python formatting loads the TypeScript section too
   - **Impact**: Unnecessary context budget consumption; later content ("forgotten" due to attention degradation) may be the most critical section
   - **Mitigation**: Split into Tier 0 index (~500 tokens: purpose, trigger conditions, file inventory) + Tier 1 language-specific files loaded on demand

2. **AGENTS.md never reviewed in PR process**
   - **Risk**: As the codebase evolves, AGENTS.md drifts — outdated function names, removed modules, stale conventions referenced with confidence
   - **Impact**: AI generates code using patterns from 6 months ago; hallucination frequency increases over time
   - **Mitigation**: Add AGENTS.md to the PR checklist: "If you added a module, function, or changed a convention — update AGENTS.md"

3. **copilot-instructions.md added without cross-reference audit**
   - **Risk**: A second always-loaded file was added without checking for overlap or conflict with AGENTS.md; no process prevents this from happening again
   - **Impact**: Next engineer adds a third file; conflicts compound
   - **Mitigation**: Add a "single canonical source" rule to the PR checklist and document which file governs which topic

### 🟡 Medium-Priority Issues

1. **README.md at ~8KB is AI-facing but not structured for AI** — no "key files" section, no architecture overview, no quickstart; AI loads it and gains little signal
2. **No ✅ / ❌ examples in naming convention rules** — AI cannot distinguish "camelCase for variables" from "camelCase for all identifiers including constants"; ambiguity causes drift
3. **No output format specified for code generation** — AI invents a new comment/docstring style on each session; no `///`, `#`, or JSDoc convention is enforced

---

## ⚠️ Assumptions Challenged

| Assumption | Challenge | Evidence | Risk if wrong |
|---|---|---|---|
| "AI reads AGENTS.md first" | No load order guarantee; tool may prioritize copilot-instructions.md | ❌ Tool-dependent | Wrong canonical source wins |
| "14KB is fine for always-loaded" | 3,500 tokens × 2 files = ~6,500 always-loaded context; leaves limited budget for actual code | ⚠️ Within limits but no headroom | Future file additions will exceed budget |
| "Copilot uses README.md for context" | README is unstructured for AI — it's human prose, not instruction format | ❌ No AI-facing sections | README wastes context budget without contributing signal |
| "Hallucination was a one-off" | No function inventory = systematic gap; all module functions are hallucination candidates | ❌ Confirmed pattern | Silent hallucinations in other modules not yet noticed |

---

## 🎯 Edge Cases & Failure Modes

| Scenario | What Happens | Handled? | Risk | Fix |
|----------|-------------|----------|------|-----|
| AI loads both AGENTS.md and copilot-instructions.md simultaneously | Both conflicting naming rules active; non-deterministic output | ❌ No | Critical | Remove duplicate from copilot-instructions.md |
| Developer adds new service without updating AGENTS.md | All functions in new service are hallucination candidates | ❌ No | High | PR checklist gate |
| Context window fills before AI reaches end of AGENTS.md | Rules in the second half of the file are ignored | ⚠️ Partial — under limit today | High | Tier 0/1 split |
| README updated but AGENTS.md not updated | Cross-reference in AGENTS.md points to stale architecture description | ❌ No | Medium | Coordinated update policy |
| New AI tool added to team's workflow | No AGENTS.md equivalent for the new tool; AI has no project context | ❌ No | Medium | Document which context files apply to which tools |

---

## 🔒 Security Concerns

### STRIDE Summary
- **Spoofing**: 🟢 — No auth surface in AI context files
- **Tampering**: 🟡 — Stale instructions could cause AI to generate code with outdated security patterns (e.g., old JWT implementation from 8 months ago still referenced)
- **Repudiation**: 🟢 — N/A for context files
- **Information Disclosure**: 🟠 — AGENTS.md may contain internal module names, endpoint paths, or schema details; confirm no secrets or credentials are referenced in any AI context file
- **Denial of Service**: 🟢 — N/A
- **Elevation of Privilege**: 🟢 — N/A

---

## ⚡ Performance Concerns

- **Bottleneck**: Always-loading ~6,500 tokens of context on every prompt reduces the effective working budget for actual code
- **Scalability limit**: If AGENTS.md grows to 8,000+ tokens, combined always-loaded context exceeds 12K; some models will truncate the README or task instructions
- **Resource usage**: Tier 0 target: < 1,000 tokens; Tier 1 per file: < 3,000 tokens each

---

## 💡 Alternative Solutions

1. **Tier 0 / Tier 1 restructure (recommended)**
   - Better at: Context budget efficiency; faster, focused loads; scalable as project grows
   - Worse at: Initial setup effort (~2–3 hours)
   - Consider if: Always — for any project with more than 2 AI context files

2. **Single unified AGENTS.md with explicit section markers**
   - Better at: One file to update; simpler governance
   - Worse at: No selective loading; budget grows with every new rule added
   - Consider if: Team is small and context budget is not yet a concern

---

## ✅ Recommendations

### Must Do (Before next AI-assisted sprint)
- [ ] Remove naming convention section from copilot-instructions.md; replace with: "Naming conventions: see AGENTS.md — it is the canonical source"
- [ ] Add a lightweight module map to AGENTS.md: list key services (`user_service`, `order_service`, etc.) with their 3–5 main public functions each

### Must Do (Before AGENTS.md grows further)
- [ ] Split AGENTS.md into Tier 0 index (~500 tokens) + Tier 1 domain files (Python conventions, TypeScript conventions, architecture overview)
- [ ] Add AGENTS.md to the PR checklist: "New module or changed convention? Update AGENTS.md"

### Should Do (Next sprint)
- [ ] Add ✅ / ❌ examples to all naming convention rules in AGENTS.md
- [ ] Add an "AI-facing quickstart" section to README.md: what does the project do, key files, tech stack, how to run
- [ ] Audit all AI context files for any referenced credentials, secrets, or internal-only URLs

### Consider (Backlog)
- [ ] Define a quarterly AI context file review: verify all cross-references, check for stale function names, measure token counts
- [ ] Add a `docs/ai-context-map.md` that documents which file governs which topic and why

---

## 📋 Follow-Up Questions

1. Are there any other AI context files beyond the three reviewed (e.g., `.cursorrules`, `CLAUDE.md`, per-directory context files)?
2. Is the hallucination of `get_by_email_verified()` the only confirmed case, or have others been reported that were dismissed as "Copilot mistakes"?
3. What AI tools is the team using — only Copilot, or also Cursor, Claude, or other agents? Each may have its own always-loaded context that needs to be consistent.

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
