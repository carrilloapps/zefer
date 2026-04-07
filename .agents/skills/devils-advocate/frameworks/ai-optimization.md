# 🤖 AI Optimization Framework

> **Purpose**: Analyze, validate, and optimize AI-facing files — `AGENTS.md`, `.ai-context.md`, `.github/copilot-instructions.md`, `README.md`, `SKILL.md`, `.cursorrules`, `CLAUDE.md`, and any file intended to provide context to an AI agent or LLM.
>
> These files are the AI's operating instructions. Poorly structured AI context is a primary cause of hallucinations, inconsistent behavior, and context window saturation in production AI workflows.
>
> If the structure or content of a file under review is unclear, **request more context before proceeding** — never assume what an undocumented AI context file is supposed to do.

---

## Covered File Types

| File | Tool / Platform | Purpose |
|------|----------------|---------|
| `AGENTS.md` | GitHub Copilot CLI, Codex, OpenCode, Amp, Gemini CLI and most agents | Agent skill and behavior instructions |
| `SKILL.md` | skills.sh (40+ agents: GitHub Copilot, Claude Code, Cursor, Windsurf, Cline, Codex, and more) | Skill definition and protocol |
| `.github/copilot-instructions.md` | GitHub Copilot (VS Code, Web) | Workspace-level AI instructions |
| `CLAUDE.md` | Claude Code / Claude Projects | Project-level context for Claude |
| `.cursorrules` or `.cursor/rules/*.mdc` | Cursor editor | Cursor AI behavior rules |
| `.windsurf/rules/*.md` or `.windsurfrules` | Windsurf editor | Windsurf AI behavior rules |
| `.clinerules` | Cline | Cline AI behavior rules |
| `.roo/rules/*.md` | Roo Code | Roo AI behavior rules |
| `.gemini/GEMINI.md` | Gemini CLI | Gemini CLI project context |
| `.kiro/steering/*.md` | Kiro CLI | Kiro steering documents (always-on context) |
| `.ai-context.md` | Generic / custom | Project context for any AI |
| `README.md` | All tools | Primary human + AI documentation |
| `docs/` | All tools | Extended documentation context |
| `CONTRIBUTING.md` | All tools | Contribution and coding convention context |
| Architecture Decision Records (ADRs) | All tools | Technical decision context |

---

## Analysis Dimension 1: Context Window Budget

> **Why it matters**: LLMs have finite context windows. Files that exceed the effective budget cause truncation (the AI never reads the end), degraded attention (earlier instructions "forgotten"), or complete failure on small-context models.

### Token Estimation

```
Rough estimation:  1 token ≈ 4 characters (English prose) | ≈ 3.5 characters (code)

File size guidelines:
  < 2K tokens    — 🟢 Safe for all models including small/embedded
  2K–8K tokens   — 🟢 Safe for most production models
  8K–16K tokens  — 🟡 Caution — may hit limits on smaller or embedded models
  16K–32K tokens — 🟠 High risk — exceeds effective attention for most models
  > 32K tokens   — 🔴 Critical — exceeds context window of many models entirely
```

### Context Budget Per Scope

| Analysis type | Max recommended total loaded context |
|--------------|--------------------------------------|
| Single file review | 8K tokens (file + instructions) |
| Full project analysis | 32K tokens across all loaded files |
| Chat with code context | 16K tokens (code + instructions) |
| Agentic multi-step task | 64K tokens (model permitting) |

### What to Check

- [ ] Is the total token count of all simultaneously loaded files within the model's context budget?
- [ ] Is the most critical information positioned at the **beginning** of each file? (LLMs have stronger attention at start and end)
- [ ] Is there a progressive loading strategy — is only what is needed loaded, not everything at once?
- [ ] Are there sections that could be split into separate, on-demand files?
- [ ] Does each file have a clear purpose that justifies loading it in this context?
- [ ] Are always-loaded files compact (< 2K tokens) and focused?

---

## Analysis Dimension 2: Cross-Reference Integrity

> **Why it matters**: AI context files frequently reference other files, sections, or resources. A broken or stale reference causes the AI to either ignore the reference or hallucinate the referenced content.

### What to Check

- [ ] Do all `[link text](path)` references point to files that actually exist on disk?
- [ ] Do all section anchors (e.g., `[see here](#section-name)`) resolve to real headings?
- [ ] Are there references to external URLs that may have changed or gone offline?
- [ ] Are there references to code symbols (function names, class names) that may have been renamed?
- [ ] When one file says "see X for details", does X exist and contain those details?
- [ ] Are version numbers in cross-references consistent with current file versions?
- [ ] Are relative paths correct from the perspective of each file's directory?

### Cross-Reference Map Template

```markdown
| Source file | References | Target exists? | Content matches? | Risk |
|-------------|-----------|----------------|-----------------|------|
| AGENTS.md | SKILL.md | ✅ | ✅ | 🟢 Low |
| README.md | docs/architecture.md | ✅ | ⚠️ Stale | 🟡 Medium |
| SKILL.md | examples/foo.md | ❌ Missing | N/A | 🟠 High |
```

---

## Analysis Dimension 3: Feature Overlap & Duplication

> **Why it matters**: When the same instruction appears in multiple files, the AI receives repeated and potentially contradictory signals. This wastes context budget and creates inconsistency when one copy is updated but not the other.

### Overlap Patterns to Detect

```
🔴 Critical overlap:
   Same rule stated differently in two files — contradictory signal
   Canonical source unclear — AI cannot determine which file wins on conflict

🟠 High overlap:
   Same content duplicated verbatim across files
   Same concept explained twice at different levels of detail, no clear hierarchy
   Multiple files each partially covering a topic with no canonical source

🟡 Medium overlap:
   Related (but not identical) instructions that could cause confusion
   Two files each contain a "quick start" or "overview" section

✅ Acceptable overlap:
   One file summarizes, another provides full detail — with a clear "see X for full detail"
   Same constraint restated in different contexts (security rule in README + code comment)
   — as long as both copies are consistent and deference is explicit
```

### Overlap Detection Checklist

- [ ] Is there a single canonical source for each major topic?
- [ ] When content appears in multiple files, does each non-canonical copy clearly defer to the source?
- [ ] Are there rules or instructions that contradict each other across files?
- [ ] Is the division of concern between files explicit (e.g., README for humans, .ai-context.md for AI)?
- [ ] Would an AI loading all files simultaneously receive conflicting instructions?

---

## Analysis Dimension 4: Context Starvation

> **Why it matters**: Too little context is as dangerous as too much. When an AI lacks critical context, it fills the gap with plausible-sounding fabrications. Most common with: missing architecture context, undefined terminology, undocumented constraints, and absent examples.

### Starvation Indicators

```
🔴 Critical starvation signals:
   A file references a concept, pattern, or constraint with no definition
   A file says "always do X" without explaining why — the AI cannot generalize
   No examples provided — the AI invents examples that may be incorrect
   Domain-specific terms used without definition

🟠 High starvation signals:
   Architecture described at a high level with no structural detail
   Business rules mentioned without edge cases
   A "See also" reference that is missing or unhelpful
   Only success paths documented — no failure examples shown
```

### Minimum Context Requirements Per File Type

| File | Minimum required content |
|------|--------------------------|
| `AGENTS.md` / `SKILL.md` | Purpose, trigger conditions, output format, at least 1 example |
| `.github/copilot-instructions.md` | Language/stack, coding conventions, forbidden patterns with examples |
| `CLAUDE.md` | Project purpose, key entities, architecture overview, tech stack |
| `README.md` (AI-facing) | What the project does, how to run it, key files, architecture |
| `.cursorrules` | Language conventions, project structure, naming rules with examples |

---

## Analysis Dimension 5: Instruction Conflicts

> **Why it matters**: Conflicting instructions create non-deterministic AI behavior. The AI may follow whichever instruction appears later (recency bias), ignore both, or alternate unpredictably across sessions.

### Conflict Detection Template

```markdown
| Instruction A | Source | Instruction B | Source | Conflict type |
|--------------|--------|--------------|--------|--------------|
| "Always use camelCase" | .cursorrules | "Use snake_case for functions" | AGENTS.md | Direct contradiction |
| "Never add comments" | README | "Document all public functions" | SKILL.md | Scope ambiguity |
| "Respond in Spanish" | .ai-context | "All output in English" | AGENTS.md | Language conflict |
```

### Common Conflict Patterns

- [ ] Language rules: conversation language vs. code language vs. documentation language
- [ ] Naming conventions: camelCase vs. snake_case in the same codebase
- [ ] Comment policies: always comment vs. self-documenting code
- [ ] Response format: terse vs. verbose, markdown vs. plain text
- [ ] Tool usage: "always use X" vs. "prefer Y over X" in different files

---

## Analysis Dimension 6: Progressive Loading Strategy

> **Why it matters**: Loading all AI context simultaneously is a context budget anti-pattern. A well-designed AI context system loads only what is needed for the current task — just-in-time context.

### Progressive Loading Design Pattern

```
Tier 0 — Always loaded (core instructions, target < 2K tokens):
   Purpose, key conventions, trigger words, file index

Tier 1 — Load on relevant signal (domain context, target < 4K tokens each):
   Language-specific rules, architecture overview, domain glossary

Tier 2 — Load on demand (reference material, any size):
   Full examples, detailed specs, edge case documentation, history
```

### What to Check

- [ ] Is there a clear Tier 0 (always-loaded) file that is < 2K tokens?
- [ ] Are Tier 1 files loadable independently without requiring all other files?
- [ ] Does the Tier 0 index reference Tier 1/2 files so the AI knows what to load?
- [ ] Are large files structured with the most critical content at the top?
- [ ] Is there a mechanism to avoid loading irrelevant domain files for out-of-scope tasks?
- [ ] If a file is always loaded, is every section in it relevant to every task?

---

## Analysis Dimension 7: Hallucination Risk Assessment

> **Why it matters**: Hallucinations are the AI's response to insufficient or ambiguous context. Vague instructions, missing examples, undefined terms, and broken references are the primary causes.

### Hallucination Risk Factor Table

| Risk factor | Example | Severity |
|-------------|---------|---------|
| Vague instruction with no examples | "Follow best practices" | 🔴 Critical |
| Term used without definition | "Use the standard pattern" (undefined) | 🟠 High |
| Reference to missing or broken file | "See security.md" (file absent) | 🟠 High |
| Instruction that contradicts another file | Two opposing rules | 🟠 High |
| Success path only, no failure examples | No ❌ examples shown | 🟡 Medium |
| Over-specified constraint the AI cannot follow | "Never generate code over 20 lines" on a 22-line example | 🟡 Medium |
| No output format specified | AI invents a different format each session | 🟡 Medium |

### Anti-Hallucination Checklist

- [ ] Every rule has at least one ✅ correct example AND one ❌ wrong example
- [ ] Every term used in instructions is defined or linked to a definition
- [ ] Every "see also" reference points to an existing file with relevant content
- [ ] No instruction relies on the AI knowing context it cannot access from the loaded files
- [ ] Output format is explicitly specified with a template or fully worked example

---

## File-Specific Checklists

### `AGENTS.md` / `SKILL.md`

- [ ] Does the file have frontmatter or a header declaring its purpose and trigger conditions?
- [ ] Are trigger conditions explicit (when does this agent/skill activate? when does it NOT)?
- [ ] Is there a clear output format with a template or worked example?
- [ ] Are there at least 1–2 worked examples showing the full expected output?
- [ ] Is the file under 8K tokens?
- [ ] Are protocol dependencies listed (which other files to load and when)?

### `.github/copilot-instructions.md` / `.cursorrules` / `CLAUDE.md`

- [ ] Is the tech stack and primary language specified?
- [ ] Are forbidden patterns explicitly listed with ✅ / ❌ examples?
- [ ] Are naming conventions stated with concrete examples?
- [ ] Is the file under 4K tokens (always-loaded files must stay compact)?
- [ ] Are there no instructions that duplicate content in other always-loaded files?

### `README.md` (AI-facing assessment)

- [ ] Does the README explain what the project does in the first 200 words?
- [ ] Is there a quickstart an AI can follow to run the project?
- [ ] Are key files and directories explained?
- [ ] Is the architecture described at a level an AI can reason about?
- [ ] Are external dependencies listed with their purpose?
- [ ] Is there a coding conventions or "how AI should contribute" section?

---

## Optimization Recommendations by Issue Type

| Issue | Recommended fix |
|-------|----------------|
| File > 16K tokens | Split into index (always-loaded, < 2K) + detail files (on-demand) |
| Feature overlap / duplication | Choose canonical source; add deference cross-reference in others; remove duplicate |
| Broken cross-reference | Fix path or remove reference; consider adding a validation script |
| Context starvation | Add ✅ / ❌ examples; define key terms; add architecture overview |
| Instruction conflict | Decide canonical rule; update all files; add a "Rule Resolution" note |
| No progressive loading | Create Tier 0 index; move detail content to Tier 1/2 on-demand files |
| Hallucination trigger | Replace vague directive ("follow best practices") with a specific, concrete rule + example |
| Missing output format | Add template section with at least one fully filled example |
| Stale cross-reference | Update file paths, version numbers, and section anchors; document a review cadence |

---

> 💡 **See also**: [`checklists/risk-checklist.md`](../checklists/risk-checklist.md) — `🤖 AI Optimization Risks` category for fast categorical scoring. [`checklists/questioning-checklist.md`](../checklists/questioning-checklist.md) — `AI Optimization` dimension for structured interrogation.
