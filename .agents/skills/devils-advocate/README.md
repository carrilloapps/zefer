# 🔴 Devil's Advocate

> **The mandatory adversarial analysis gate for 40+ AI coding agents — runs first, before any action.**

[![License: MIT](https://img.shields.io/badge/License-MIT-red.svg)](LICENSE)
[![Version](https://img.shields.io/badge/version-2.9.0-blue.svg)](../../CHANGELOG.md)
[![skill.sh](https://img.shields.io/badge/skill.sh-devils--advocate-black.svg)](https://skills.sh/carrilloapps/skills/devils-advocate)
[![GitHub](https://img.shields.io/badge/GitHub-carrilloapps-181717.svg?logo=github)](https://github.com/carrilloapps/skills)
[![X / Twitter](https://img.shields.io/badge/@carrilloapps-000000.svg?logo=x)](https://x.com/carrilloapps)

---

Devil's Advocate is an [agent skill](https://skills.sh) compatible with **40+ AI coding agents** — including GitHub Copilot, Claude Code, Cursor, Windsurf, Cline, Codex, Gemini CLI, OpenCode, Roo Code, and more — that intercepts every plan, proposal, and action before execution and delivers a full adversarial risk analysis, blocking all operations until you explicitly authorize them.

It is not a linter. It is not a checklist. It is an adversarial analyst that:

- **Runs unconditionally first** — before any MCP tool, agent, skill, or file operation
- **Challenges every assumption** — finds what the plan missed, not what it got right
- **Fires alerts mid-sweep** — doesn't wait until the end to surface a Critical finding
- **Preserves your authority** — having permissions is not the same as having authorization

---

## Quick Install

```bash
npx skills add carrilloapps/skills@devils-advocate
```

### All install options

| Command | Effect |
|---------|--------|
| `npx skills add carrilloapps/skills@devils-advocate` | Install to all detected agents in current project |
| `npx skills add carrilloapps/skills@devils-advocate -g` | Install globally (available in every project) |
| `npx skills add carrilloapps/skills@devils-advocate -a github-copilot` | Install to a specific agent only |
| `npx skills add carrilloapps/skills@devils-advocate -a claude-code -a cursor` | Install to multiple specific agents |
| `npx skills add carrilloapps/skills@devils-advocate --all` | Install to all agents, skip confirmations |
| `npx skills add carrilloapps/skills@devils-advocate -g -y` | Global install, non-interactive (CI-friendly) |

Target a specific agent:

```bash
npx skills add carrilloapps/skills@devils-advocate -a github-copilot
npx skills add carrilloapps/skills@devils-advocate -a claude-code
npx skills add carrilloapps/skills@devils-advocate -a cursor
npx skills add carrilloapps/skills@devils-advocate -a windsurf
```

### Keeping it up to date

```bash
# Check if a newer version is available
npx skills check

# Update to the latest version
npx skills update
```

> See [skills.sh/carrilloapps/skills/devils-advocate](https://skills.sh/carrilloapps/skills/devils-advocate) for the canonical install command and latest release.

### Where files are installed

| Scope | Path |
|-------|------|
| Project (default) | `./<agent>/skills/devils-advocate/SKILL.md` |
| Global (`-g`) | `~/<agent>/skills/devils-advocate/SKILL.md` |

By default the CLI creates a **symlink** from each agent directory to a single canonical copy — one source of truth, easy to update. Use `--copy` if your environment does not support symlinks.

### CLI Reference — all commands

| Command | Description |
|---------|-------------|
| `npx skills add carrilloapps/skills@devils-advocate` | Install to all detected agents (current project) |
| `npx skills add carrilloapps/skills@devils-advocate -g` | Install globally (all projects) |
| `npx skills add carrilloapps/skills@devils-advocate -a <agent>` | Install to a specific agent |
| `npx skills add carrilloapps/skills@devils-advocate --all` | Install to all agents, skip prompts |
| `npx skills add carrilloapps/skills@devils-advocate -g -y` | Global + non-interactive (CI-friendly) |
| `npx skills add carrilloapps/skills@devils-advocate --copy` | Copy files instead of symlink |
| `npx skills list` | List all installed skills in current project |
| `npx skills list -g` | List globally installed skills |
| `npx skills find devils-advocate` | Search the skills.sh directory |
| `npx skills check` | Check if a newer version is available |
| `npx skills update` | Update all installed skills to latest |
| `npx skills remove devils-advocate` | Remove the skill from current project |
| `npx skills remove devils-advocate -g` | Remove from global scope |
| `npx skills remove devils-advocate -a <agent>` | Remove from a specific agent only |

---

## Compatible Agents

Works with every agent supported by the [skills.sh](https://skills.sh) ecosystem:

| Agent | `--agent` flag |
|-------|---------------|
| GitHub Copilot | `github-copilot` |
| Claude Code | `claude-code` |
| Cursor | `cursor` |
| Windsurf | `windsurf` |
| Cline | `cline` |
| OpenAI Codex | `codex` |
| Gemini CLI | `gemini-cli` |
| OpenCode | `opencode` |
| Roo Code | `roo` |
| Goose | `goose` |
| Continue | `continue` |
| Amp / Kimi CLI / Replit | `amp` |
| Antigravity | `antigravity` |
| Augment | `augment` |
| Droid | `droid` |
| Kilo Code | `kilo` |
| Kiro CLI | `kiro-cli` |
| OpenHands | `openhands` |
| Trae / Trae CN | `trae` |
| Zencoder | `zencoder` |
| + 20 more | `npx skills add --list` |

> **Kiro CLI note**: After installing, manually add the skill to your agent's `resources` in `.kiro/agents/<agent>.json`:
> ```json
> { "resources": ["skill://.kiro/skills/**/SKILL.md"] }
> ```

---

## What It Does

When you describe a plan, propose a change, or request any action, Devil's Advocate:

```
1. INTERCEPTS  — "Running Devil's Advocate before proceeding..."
                  Does NOT execute the action yet.
       │
       ▼
2. ANALYSES    — Loads relevant risk frameworks.
                  Fires ⚡ Immediate Report on first High/Critical finding.
                  Activates 🛑 Handbrake on any Critical finding.
       │
       ▼
3. REPORTS     — Full adversarial analysis: strengths, weaknesses,
                  assumptions challenged, edge cases, failure modes.
       │
       ▼
4. GATES       — Waits for your explicit decision before proceeding.
```

### The Gate (always at the end)

```
🔴 Devil's Advocate complete.

Before I proceed, please confirm:
  - [ ] I have reviewed all Critical and High issues above
  - [ ] I accept the risks marked as accepted (or they are mitigated)
  - [ ] I want to proceed with the approved action

Reply with:
  ✅ Proceed   — continue with the approved action as planned
  🔁 Revise    — describe the change and I will re-analyse
  ❌ Cancel    — stop, do not implement
  `continue`   — proceed without addressing remaining issues (risks remain active and unmitigated)
```

Nothing executes without your explicit `✅ Proceed`.

### Bypass Behavior

If a user says "just do it", "skip analysis", or "proceed anyway", Devil's Advocate respects the user's authority to override and executes — but prepends a visible warning:

```
⚠️ Proceeding without Devil's Advocate review.
Risks not assessed. User's authority to bypass is preserved —
this warning is visible in the conversation history so risks remain visible.
```

---

## Why This Exists

AI tools are increasingly capable of executing complex, multi-step operations — creating files, calling APIs, running migrations, deploying services. The default behavior is to help you accomplish what you asked for. Devil's Advocate adds the adversarial voice that asks: **"Should we?"**

The skill is designed on a simple principle: **having permissions is not the same as having authorization.** Technical capability never substitutes for your informed, explicit decision.

### Authorization Model

The AI may hold full technical access — read/write to the filesystem, credentials for APIs, the ability to invoke MCP tools, trigger agents, and deploy services. None of that constitutes authorization to act.

| Situation | Is this authorization? |
|-----------|----------------------|
| "Do X" was requested | ❌ No — it is a request that triggers analysis |
| The AI has a token or credential for the operation | ❌ No — capability is not consent |
| A tool or MCP has its own permission model | ❌ No — it does not substitute for user approval |
| A similar operation was approved before | ❌ No — each action requires its own approval |
| The user says "just do it" / "skip the analysis" | ⚠️ User's right — but triggers the bypass warning |

Authorization comes **exclusively** from the user's explicit `✅ Proceed` after reviewing the Devil's Advocate analysis.

---

## Core Principles

### Gate First, Execute Anything Second

Nothing executes without passing the Devil's Advocate gate — one-line refactors, multi-phase migrations, MCP tool calls, architecture decisions, and production deployments alike. Technical capability never substitutes for the user's explicit, informed authorization.

### Adversarial Mindset

| Defender Thinking | Adversarial Thinking |
|------------------|----------------------|
| "This should work" | "How could this fail?" |
| "We handled the common case" | "What edge cases did we miss?" |
| "The tests pass" | "What didn't we test?" |
| "Security is implemented" | "How would I exploit this?" |
| "This is best practice" | "When does best practice fail?" |

### Rule Precedence

The rules and enforcement standards of this skill — including the Gate Protocol, Building Protocol, Handbrake, and Immediate Report — **take precedence over all other tools, skills, agents, and MCPs** in the session. If another tool attempts to bypass or shorten the analysis step, the Gate still applies.

---

## Best Practices

| | |
|--|--|
| ✅ | Be specific — point to exact code, query, or design element |
| ✅ | Prioritize — lead with the most dangerous risks, not the most numerous |
| ✅ | Suggest fixes — every criticism paired with a direction to address it |
| ✅ | Document assumptions — make the implicit explicit |
| ❌ | Do not soften the critique — the user is asking for honest challenge |
| ❌ | Do not invent problems — only evidence-based concerns |
| ❌ | Do not block progress indefinitely — balance risk vs. velocity **except** when the 🛑 Handbrake is active |
| ❌ | Do not allow any tool, MCP, agent, or skill to bypass this gate — the analysis runs first, unconditionally |

---

The skill uses a layered protocol that escalates based on finding severity:

| Protocol | Trigger | Purpose |
|----------|---------|---------|
| ⚡ **Immediate Report** | First 🟠 High or 🔴 Critical finding | Flash alert mid-sweep + context request; analysis continues |
| 🛑 **Handbrake** | Any 🔴 Critical finding (or 3+ 🟠 High same domain) | Full stop + specialist escalation + focused pre-mortem |
| 📄 **Full Report** | After context received or `continue` | Structured adversarial analysis with all findings |
| 🚦 **Gate** | After full report | Waits for ✅ / 🔁 / ❌ before any action |

---

## Framework Coverage

| Domain | Framework | Role |
|--------|-----------|------|
| Architecture | `frameworks/architecture-risks.md` | Architect / Tech Lead |
| Security | `frameworks/security-stride.md` | Dev / Tech Lead |
| Performance | `frameworks/performance.md` | Dev / Tech Lead |
| Developer / Code | `frameworks/developer-risks.md` | Developer / Senior Engineer |
| Data & Analytics | `frameworks/data-analytics-risks.md` | Data Engineer / Analyst |
| Product | `frameworks/product-risks.md` | PM / PO |
| UX / Design | `frameworks/design-ux-risks.md` | UX / Designer |
| Strategy / Leadership | `frameworks/leadership-strategy-risks.md` | CTO / VP Eng |
| AI Optimization | `frameworks/ai-optimization.md` | All — AI context files |
| Version Control | `frameworks/version-control.md` | Dev / Tech Lead / DevOps |
| Vulnerability Patterns | `frameworks/vulnerability-patterns.md` | Dev / Tech Lead |
| General Analysis | `frameworks/analysis-framework.md` | All |
| **Building Protocol** | `frameworks/building-protocol.md` | Always active with code |
| **Output Format** | `frameworks/output-format.md` | All reports |
| **Handbrake Protocol** | `frameworks/handbrake-protocol.md` | Auto on 🔴 Critical |
| **Immediate Report** | `frameworks/immediate-report.md` | Auto on 🟠 High / 🔴 Critical |
| **Pre-mortem** | `frameworks/premortem.md` | Auto on 🔴 Critical (Handbrake Step 6) |
| **Handbrake Checklist** | `frameworks/handbrake-checklist.md` | Rapid Handbrake activation decision sweep |

**Context budget**: Load a maximum of 2 domain frameworks per analysis to avoid context window saturation. Protocol files (`output-format.md`, `handbrake-protocol.md`, `immediate-report.md`, `premortem.md`, `handbrake-checklist.md`) are free and do not count toward the budget.

---

## Examples

Real-world analysis examples demonstrating the full protocol stack:

| Example | Domain | Trigger | Protocol |
|---------|--------|---------|----------|
| [`architecture-critique.md`](examples/architecture-critique.md) | Architecture | 12-service microservices decomposition, 3 engineers | ⚡ IR → 🛑 Handbrake → Gate |
| [`plan-critique.md`](examples/plan-critique.md) | Data / Operations | Database migration zero-downtime risk | ⚡ IR → 🛑 Handbrake → Gate |
| [`handbrake-example.md`](examples/handbrake-example.md) | Data / PII | Analytics pipeline with PII exposure | ⚡ IR → 🛑 Multi-Role Handbrake → Gate |
| [`security-review.md`](examples/security-review.md) | Security | JWT auth — hardcoded secret in git, HS256, no revocation | ⚡ IR → 🛑 AppSec Handbrake → STRIDE → Gate |
| [`ai-context-review.md`](examples/ai-context-review.md) | AI Optimization | AGENTS.md + copilot-instructions.md conflict | ⚡ IR → 🛑 AI Tooling Handbrake → Gate |
| [`version-control-review.md`](examples/version-control-review.md) | Version Control | Leaked DB credentials + force push to main | ⚡ IR → 🛑 Multi-Role Handbrake → remediation plan → Gate |
| [`product-feature-review.md`](examples/product-feature-review.md) | Product / Legal | Subscription cancellation dark pattern (FTC + GDPR) | ⚡ IR → 🛑 Legal Handbrake → Gate |
| [`data-pipeline-review.md`](examples/data-pipeline-review.md) | Data / Legal | PII migration to BigQuery without masking (GDPR Art. 25) | ⚡ IR → 🛑 Data Handbrake → Gate |
| [`cicd-pipeline-review.md`](examples/cicd-pipeline-review.md) | Security / Version Control | GitHub Actions — hardcoded secrets, write-all token, mutable Actions | ⚡ IR → 🛑 Handbrake → corrected YAML → Gate |
| [`vendor-decision-review.md`](examples/vendor-decision-review.md) | Strategy | Full AWS → GCP migration in 12 weeks — Type 1 decision | ⚡ IR → 🛑 CTO Handbrake → Gate |
| [`ux-checkout-review.md`](examples/ux-checkout-review.md) | UX / Legal | Subscription checkout dark patterns (FTC negative option rule) | ⚡ IR → Full Report → Gate |
| [`performance-review.md`](examples/performance-review.md) | Performance / Code | N+1 query on cart API hot path — DB pool exhaustion risk | ⚡ IR → Full Report with corrected implementation → Gate |

---

## Building Protocol

When code is generated or reviewed, the **Building Protocol** activates unconditionally:

| Rule | Requirement |
|------|-------------|
| **Code identifiers** | ALL in `en_US` — variables, functions, classes, files, DB columns, endpoints |
| **Conversation** | AI responds in the user's natural language. Spanish prompt → Spanish response + `en_US` code |
| **Naming** | `SCREAMING_SNAKE_CASE` constants · `camelCase`/`snake_case` per language · `kebab-case` URLs |
| **Quality** | SOLID · DRY · KISS · YAGNI · functions ≤ 20 lines · ≤ 3 parameters |
| **Security** | No hardcoded secrets · validate all input · parameterized queries · least privilege |
| **Commits** | [Conventional Commits](https://www.conventionalcommits.org/) · `en_US` · imperative mood |

See [`frameworks/building-protocol.md`](frameworks/building-protocol.md) for the full specification, violation severity table, and reference implementation.

---

## Automatic Trigger Detection

Devil's Advocate activates automatically — no invocation required — when it detects:

- Any plan or proposal ("I'm going to...", "The plan is to...", "We will...")
- Implementation intent ("Refactor X", "Migrate to Y", "Deploy Z")
- Architecture or vendor decisions
- Any action with side effects (create, edit, delete, run, deploy, call)
- Version control operations (force push, history rewrite, branch protection changes)
- Code reviews and PR analysis
- AI context file reviews (AGENTS.md, .cursorrules, .windsurfrules, .clinerules, copilot-instructions.md, etc.)

> **Scope guard**: Only activates for plans involving code, systems, data, infrastructure, or technical architecture. Does not activate for purely conversational or social statements.

---

## Roles Supported

| Role | Key use cases |
|------|--------------|
| **Developer** | Code review, testing gaps, CI/CD pipeline risks, dependency vulnerabilities, refactor safety |
| **Architect** | Distributed systems, coupling, API contracts, event-driven, CAP trade-offs |
| **Tech Lead** | Architecture decisions, build vs. buy, tech debt strategy, API governance |
| **CTO / VP Eng** | Technology strategy, vendor risk, Type 1/2 decisions, capacity vs. roadmap |
| **Product Manager** | Feature validation, launch risk, regulatory compliance, metric definition |
| **UX / Designer** | Flow review, dark pattern detection, WCAG audit, error state coverage |
| **Data Engineer** | Pipeline reliability, PII/governance, schema drift, data contracts |
| **DevOps Engineer** | CI/CD security, branch protection, secret management, deployment gates |
| **AI Tooling Lead** | AI context file review, context window budget, hallucination risk reduction |

---

## Checklists

| Checklist | Purpose |
|-----------|---------|
| [`checklists/risk-checklist.md`](checklists/risk-checklist.md) | 8-category structured risk sweep — percentage-based scoring |
| [`checklists/questioning-checklist.md`](checklists/questioning-checklist.md) | 15-dimension interrogation — correctness, security, performance, reliability, maintainability, operability, cost, product, UX, strategy, architecture, data, developer, building protocol, AI optimization |

---

## Integration with Postmortem Writing

```
Devil's Advocate (before) → Incident → Postmortem (after) → Lessons → Devil's Advocate (next)
     (Prevent)                              (Learn)          (Apply)       (Prevent better)
```

Use **@devils-advocate** before deployment to prevent incidents. A complementary `postmortem-writing` skill for post-incident analysis is pending.

---

## Contributing

Contributions are welcome! See [CONTRIBUTING.md](https://github.com/carrilloapps/skills/blob/main/.github/CONTRIBUTING.md) for:

- How to add a new framework or example
- Quality standards (fence balance, Gate prompt, version stamp, cross-references)
- PR process and review turnaround times

Please read [CODE_OF_CONDUCT.md](https://github.com/carrilloapps/skills/blob/main/.github/CODE_OF_CONDUCT.md) before contributing.

---

## Security

For vulnerability reports (harmful, misleading, or exploitable guidance), see [SECURITY.md](https://github.com/carrilloapps/skills/blob/main/.github/SECURITY.md). Do not open a public issue for security concerns.

---

## License

[MIT](LICENSE) — free to use, modify, and distribute. Attribution appreciated.

---

## Changelog

See [CHANGELOG.md](../../CHANGELOG.md) for the full version history.

---

*Built with adversarial thinking, for people who want to ship software that works.*

---

## Author

**José Carrillo** — [carrillo.app](https://carrillo.app)

[![Website](https://img.shields.io/badge/website-carrillo.app-FF5733.svg)](https://carrillo.app)
[![GitHub](https://img.shields.io/badge/GitHub-carrilloapps-181717.svg?logo=github)](https://github.com/carrilloapps)
[![X / Twitter](https://img.shields.io/badge/X-carrilloapps-000000.svg?logo=x)](https://x.com/carrilloapps)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-carrilloapps-0A66C2.svg?logo=linkedin)](https://linkedin.com/in/carrilloapps)
[![Email](https://img.shields.io/badge/email-m%40carrillo.app-EA4335.svg?logo=gmail)](mailto:m@carrillo.app)
