# Version Control Framework

> **Role**: Developer / Tech Lead / Senior Engineer / DevOps Engineer
> **Load when**: Any operation that touches a repository — branching strategy changes, force pushes, history rewriting, PR/MR workflows, branch protection changes, release tagging, CI/CD pipeline changes, repository migration, access control changes, or any `git` command with irreversible consequences.
>
> **Always paired with**: `frameworks/building-protocol.md` — commit message conventions, branch naming rules, and secret management are enforced by the Building Protocol. Any violation found here cross-references that protocol.
>
> **Platform detection (automatic — no user action required)**:
>
> | Signal | Platform |
> |--------|----------|
> | `.github/` directory present | GitHub |
> | `.github/workflows/*.yml` files present | GitHub Actions |
> | `.gitlab-ci.yml` present | GitLab CI |
> | URL contains `github.com` | GitHub |
> | URL contains `gitlab.com` or self-hosted GitLab pattern | GitLab |
> | User explicitly states "GitHub" / "GitLab" | Use stated platform |
> | `CODEOWNERS` file present | GitHub (or GitLab if `.gitlab/` present) |
> | `.gitlab/` directory present | GitLab |
> | `Jenkinsfile` present (no `.github/`, no `.gitlab-ci.yml`) | Generic Git + Jenkins |
> | No platform signal detected | Generic Git — platform-neutral analysis; ask before applying platform-specific rules |
>
> **Cross-reference**: Platform detection must be confirmed before applying GitHub-specific or GitLab-specific sections. If context is ambiguous, ask: *"Is this repository hosted on GitHub, GitLab, or another platform?"*

---

## Platform Context Summary

When analyzing a version control operation, identify:

```
Platform     : [ GitHub / GitLab / GitHub Enterprise / GitLab Self-Hosted / Generic Git ]
Branch model : [ Trunk-Based / GitFlow / GitHub Flow / GitLab Flow / Custom ]
Default branch: [ main / master / develop / other ]
Team size    : [ Solo / Small (<10) / Medium (10–50) / Large (>50) ]
Environment  : [ Personal / Team / Open Source / Enterprise ]
```

If any field is unknown, request it before applying platform-specific risk rules.

---

## Force Push & History Rewriting Risks

> **Severity baseline**: Any force push to a shared branch is **🟠 High** by default.
> A force push to the default branch (main/master) is **🔴 Critical** unless protected.

### ❌ Force Push Anti-Patterns

```
❌ Force push to main/master/develop (shared integration branch)
   - Permanently rewrites public history
   - Breaks all clones pointing to overwritten commits
   - CI/CD pipelines that started on overwritten SHAs will fail silently
   - Other developers' local branches become orphaned (cannot pull)

❌ git push --force instead of git push --force-with-lease
   - --force overwrites regardless of remote state
   - --force-with-lease checks that your local ref matches remote before forcing
   - --force can silently discard commits pushed by other developers

❌ History rewriting (rebase, squash, amend) on commits already pushed to shared branches
   - Changes commit SHAs — all references (PRs, MRs, tags, CI builds) point to ghost commits
   - Tags on rewritten commits become dangling references

❌ git filter-repo / git filter-branch without audit and coordination
   - Used to remove secrets from history — necessary, but requires full team coordination
   - All local clones retain the old history until explicitly re-cloned or reset
   - Forks of the repo (on GitHub/GitLab) are NOT automatically cleaned
   - CI/CD caches and artifact stores may retain the compromised commit
```

### ✅ Safe Alternatives

```
✅ For secret removal: Use git filter-repo (not filter-branch — it's deprecated)
   After filter-repo:
   1. Force push to all branches (coordinated with team)
   2. Notify all contributors to re-clone (not pull)
   3. Rotate the exposed secret IMMEDIATELY — removal from history does not undo exposure
   4. Audit all forks, CI caches, artifact stores, and pipeline logs
   5. Request GitHub/GitLab to purge cached views and advisory notifications

✅ For interactive rebase on personal/feature branches (not yet pushed or force-with-lease on solo branches)

✅ For squash merges: Use platform's "Squash and Merge" button — keeps original PRs intact

✅ git push --force-with-lease over git push --force — always
```

---

## Secrets & Credentials in Repository

> **Severity**: ANY secret committed to a repository — even if immediately removed — is **🔴 Critical**.
> The secret must be treated as compromised regardless of removal, because:
> - GitHub and GitLab cache commit content in their CDN
> - Any clone or fork made before removal retains the secret
> - CI/CD logs may have printed the secret during pipeline execution
> - Bots and scanners continuously harvest new commits for secrets (within seconds of push)

### ❌ Secret Anti-Patterns

```
❌ Hardcoded credentials in source files (API keys, passwords, tokens, private keys)
❌ Secrets committed in .env files (even if later .gitignored — history retains them)
❌ Secrets in CI/CD YAML files checked into the repo
❌ Private keys or certificates committed to repo
❌ Database connection strings with credentials in config files
❌ Secrets in commit messages or PR/MR descriptions
❌ Secrets printed in CI/CD pipeline logs (exposed via $SECRET in echo commands)
```

### ✅ Remediation Protocol

```
When a secret is confirmed in git history:
1. IMMEDIATE: Rotate / revoke the secret NOW — do not wait for history cleanup
2. AUDIT: Check CI/CD logs for any runs that printed the secret value
3. CLEAN: Use git filter-repo to remove from history
4. FORCE PUSH: Push all branches (coordinated), including all active feature branches
5. RE-CLONE: All contributors must delete local clone and re-clone (pull will not fix it)
6. FORKS: If repo is forked (GitHub/GitLab), contact platform to purge caches
7. NOTIFY: Inform security team and affected system owners
8. MONITOR: Enable secret scanning going forward (GitHub Advanced Security / GitLab Secret Detection)
```

### 🔍 Secret Detection Tools

```
GitHub:  GitHub Advanced Security → Secret Scanning (auto-alerts on push)
         Dependabot → alerts for vulnerable dependencies
GitLab:  GitLab Secret Detection (CI job in .gitlab-ci.yml)
         GitLab Vulnerability Report in Security dashboard
Generic: git-secrets, truffleHog, detect-secrets (pre-commit hooks)
         gitleaks — scans full history
```

---

## Branching Strategy Risks

### ❌ Branching Anti-Patterns

```
❌ Long-lived feature branches (> 2 weeks diverged from main)
   - Merge conflicts compound exponentially
   - Integration risk hidden until last minute
   - CI/CD feedback loop broken (testing old code in isolation)

❌ Direct commits to main/master (no PR/MR review)
   - No peer review; no automated checks before merge
   - Bypasses branch protection rules
   - Breaks audit trail

❌ Mixing GitFlow and trunk-based development inconsistently
   - Teams don't agree on what "done" means
   - Hotfixes go to wrong branch
   - Release branches diverge unexpectedly

❌ Undocumented branching conventions
   - New team members invent their own naming
   - CI/CD rules break silently (e.g., pipeline only triggers on feat/* but branch is named feature/*)

❌ No branch cleanup policy
   - Hundreds of stale branches obscure active work
   - Merged branches still receive commits (developer forgot to switch)
```

### ✅ Branching Best Practices

```
Branch naming (Building Protocol — en_US, kebab-case, with prefix):
  feat/<ticket-id>-short-description   (new feature)
  fix/<ticket-id>-short-description    (bug fix)
  hotfix/<ticket-id>-description       (critical production fix)
  chore/<description>                  (tooling, deps, cleanup)
  release/<version>                    (release prep — GitFlow only)
  docs/<description>                   (documentation only)

Branch lifetime targets:
  Feature branches: ≤ 5 days (trunk-based) / ≤ 2 weeks (GitFlow)
  Hotfix branches: ≤ 24 hours
  Release branches (GitFlow): duration of release stabilization only

Branch protection minimum requirements (main/master/develop):
  ✅ Require PR/MR before merging
  ✅ Require at least 1 approving review
  ✅ Require status checks to pass before merging (CI must be green)
  ✅ Block force pushes
  ✅ Block deletions
```

---

## PR / MR Workflow Risks

### ❌ PR/MR Anti-Patterns

```
❌ Self-merging PRs/MRs (no external review)
❌ Reviews approved without reading (rubber-stamp approvals)
❌ PRs larger than 400 lines diff — statistically proven to reduce review quality
❌ No required status checks — CI optional, not gate
❌ Stale review approvals not dismissed after new commits
❌ No CODEOWNERS / code ownership rules — random reviewer assignment
❌ Merge before all requested changes are resolved
❌ Merging during a deployment freeze or incident without emergency process
```

### 📋 PR/MR Checklist

```markdown
Before merging:
- [ ] All CI checks pass (tests, lint, security scan, build)
- [ ] At least 1 approval from a qualified reviewer
- [ ] All review comments resolved (or explicitly deferred with a tracked issue)
- [ ] Branch is up to date with the target branch
- [ ] No merge conflicts
- [ ] CODEOWNERS approval received (if applicable)
- [ ] Deployment freeze check: is this a safe time to merge?
- [ ] If this is a hotfix: was the standard emergency process followed?
```

---

## Commit Message & History Hygiene

> **Building Protocol enforces**: Conventional Commits format, `en_US`, imperative mood, type prefix required.

### ❌ Commit Anti-Patterns

```
❌ Vague messages: "fix", "changes", "WIP", "update", "asdf"
❌ Non-English commit messages in a shared/enterprise repo
❌ Commits that mix multiple unrelated concerns (harder to bisect, harder to revert)
❌ Amending or rebasing already-pushed commits on shared branches
❌ Merge commits disabled globally (lose context in complex integrations)
❌ Squash everything (loses incremental intent; makes bisect harder)
```

### ✅ Conventional Commits (Building Protocol standard)

```
<type>(<scope>): <short description> [en_US, imperative, ≤72 chars]

[optional body — explain WHY this change was made]

[optional footer — BREAKING CHANGE: ..., Closes #issue]
```

| Type | Use |
|------|-----|
| `feat` | New feature or behavior |
| `fix` | Bug fix |
| `perf` | Performance improvement |
| `refactor` | Restructure without behavior change |
| `test` | Add or modify tests |
| `docs` | Documentation only |
| `chore` | Dependencies, tooling, build |
| `ci` | CI/CD pipeline changes |
| `hotfix` | Critical production fix |
| `revert` | Revert a previous commit |

---

## Tag & Release Management Risks

### ❌ Tag / Release Anti-Patterns

```
❌ Mutable tags (tags that point to different commits over time)
   - Git tags CAN be force-moved — this is dangerous and unexpected
   - Most CI/CD systems cache by tag name; a moved tag will serve old artifacts

❌ Tags on untested or unreviewed commits
❌ No semantic versioning (SemVer) discipline
   - Consumers cannot determine if an update is safe
   - Breaking changes not communicated via MAJOR version bump

❌ Tags not signed (unsigned tags can be spoofed if repo access is compromised)
❌ Production deploys triggered by moving a tag vs. creating a new one
❌ No CHANGELOG.md or release notes in tags
❌ Pre-release versions shipped as stable (e.g., 1.0.0-beta tagged as latest)
```

### ✅ Tag Best Practices

```
✅ Immutable tags — never force-move a tag once published
✅ Semantic versioning: MAJOR.MINOR.PATCH
   MAJOR: breaking change
   MINOR: new backward-compatible feature
   PATCH: backward-compatible bug fix
✅ Signed tags (git tag -s) for production releases
✅ Protected tags on GitHub/GitLab — only CI/CD or designated roles can create
✅ CHANGELOG.md updated as part of the release commit before tagging
✅ GitHub Releases / GitLab Releases created from tags (not just raw tags)
```

---

## Access Control & Permission Risks

### ❌ Access Control Anti-Patterns

```
❌ Personal Access Tokens (PATs) with full repo scope used for CI/CD
   - If the PAT owner leaves, CI/CD breaks
   - Full repo scope = read/write to all repos in the org

❌ Long-lived PATs with no expiry date
❌ Shared service account credentials across multiple pipelines
❌ Deploy keys with write access (read-only is sufficient for most CI/CD)
❌ External contributors given direct write access to main branch
❌ No audit log review for repository permission changes
❌ GitHub/GitLab bot accounts with organization-wide admin rights
❌ Secrets stored in repository settings without rotation policy
```

### ✅ Access Control Best Practices

```
GitHub:
  ✅ Use GitHub Apps over PATs for CI/CD integrations
     (scoped permissions, token rotation, audit log support)
  ✅ Fine-grained PATs (repo-scoped, expiry set) when PATs are required
  ✅ Deploy keys: read-only unless write is explicitly required
  ✅ Branch protection: restrict who can push to main/master/develop
  ✅ Required reviewers via CODEOWNERS
  ✅ Environment protection rules: require approvals before deploying to production

GitLab:
  ✅ Project Access Tokens over personal tokens for CI/CD
  ✅ Use CI/CD variable scoping (environment-specific, masked, protected)
  ✅ Protected branches + protected tags: restrict push/merge to specific roles
  ✅ Deployment environments with required approval gates
  ✅ Audit events enabled for permission changes and login anomalies
  ✅ Minimal role: Reporter (read) / Developer (write) / Maintainer (admin-ish)
     Avoid: Owner-level for service accounts
```

---

## GitHub-Specific Risks

### Branch Protection Rules

```
Minimum requirements for main/master:
  ✅ Require pull request reviews before merging
     - Required approving reviews: ≥ 1 (≥ 2 for production-facing changes)
     - Dismiss stale pull request approvals when new commits are pushed
     - Require review from Code Owners
  ✅ Require status checks to pass before merging
     - Require branches to be up to date before merging
     - Specific CI checks listed (not just "any")
  ✅ Require conversation resolution before merging
  ✅ Do not allow bypassing the above settings (even for admins!)
  ✅ Restrict who can push to matching branches
  ✅ Block force pushes
  ✅ Block deletions

Risk if not set:
  - Any team member can push directly to main
  - Force pushes can silently erase history
  - Broken code can ship without CI passing
```

### GitHub Actions Risks

```
❌ GITHUB_TOKEN with write permissions used in workflows triggered by pull_request_target
   - Allows fork PRs to access write-scoped tokens → arbitrary code execution risk

❌ Using third-party Actions at a mutable tag (e.g., actions/checkout@v3)
   - Tag can be moved to malicious code; use SHA pinning instead
   ✅ Use: actions/checkout@abc123def (commit SHA)

❌ Secrets printed in workflow logs (echo ${{ secrets.MY_SECRET }})
❌ No `permissions:` block in workflow YAML → defaults to over-permissive
   ✅ Always declare: permissions: contents: read (or minimum required)

❌ `pull_request_target` trigger without careful scoping
   - Runs in the context of the base branch (has write access)
   - A malicious fork PR can read secrets or write to the repo

❌ Self-hosted runners with persistent state shared across untrusted PRs
   ✅ Use ephemeral runners for untrusted code (GitHub-hosted or per-job)

❌ Environment secrets not scoped to specific environments
   ✅ Production secrets in "production" environment with required reviewers
```

### CODEOWNERS

```
✅ CODEOWNERS ensures domain experts review relevant changes
❌ CODEOWNERS file not present → any reviewer can approve any change
❌ CODEOWNERS with stale team references (team disbanded, people left)
❌ CODEOWNERS only covers src/ but not infra/, migrations/, or .github/workflows/

Location: .github/CODEOWNERS (GitHub) | root CODEOWNERS (also GitHub/GitLab)
```

---

## GitLab-Specific Risks

### Protected Branches

```
GitLab Protected Branch minimum (main/master/develop):
  ✅ Allowed to merge: Developers + Maintainers (not Reporter or Guest)
  ✅ Allowed to push: No one (force merges through MR only) OR Maintainers only
  ✅ Require approval: Merge request approvals ≥ 1
  ✅ Code owner approval required
  ✅ All discussions must be resolved before merge

Risk if not set: Same as GitHub — direct push to main bypasses all quality gates
```

### GitLab CI/CD Variable Risks

```
❌ CI/CD variables not masked — secrets visible in job logs
❌ Variables not scoped to protected branches/tags — available to any branch
❌ Group-level CI/CD variables with production secrets accessible to all projects
❌ YAML anchors used to print env vars during debug and left in production pipelines

✅ Masked variables: never printed in logs even if accidentally echoed
✅ Protected variables: only available in pipelines for protected branches/tags
✅ Environment-scoped variables: production secrets only in production environment
✅ Regular rotation: CI/CD service tokens and access tokens rotated per policy
```

### GitLab MR Workflow

```
✅ Required approvals: ≥ 1 approval before merge
✅ Code owners approval: enabled for critical paths
✅ "Prevent approval by author": enabled — self-merge not allowed
✅ "Remove approvals on new commits": enabled — stale approvals dismissed
✅ Require all threads resolved before merging
✅ Pipelines must succeed before merging
✅ Squash commits option: configured per project standard
```

### GitLab Runner Security

```
❌ Shared runners used for pipelines that access production secrets
   ✅ Use project-specific or group runners for production deployments

❌ Privileged Docker runners (--privileged flag)
   - Allows container breakout; only use when absolutely required (Docker-in-Docker)
   ✅ Use rootless Docker or Kaniko for image builds

❌ Runner tags not used → any available runner executes the job
   ✅ Tag runners for production (e.g., "production-runner") and restrict by tag

❌ No runner autoscaling → shared state between builds from different contributors
```

---

## Monorepo vs. Polyrepo Trade-offs

```markdown
| Dimension | Monorepo | Polyrepo |
|-----------|----------|----------|
| Atomic cross-service commits | ✅ Single commit | ❌ Coordinated PRs |
| CI build time | ❌ Grows with repo size (mitigate with affected-path triggers) | ✅ Per-service CI |
| Access control granularity | ❌ All-or-nothing unless using CODEOWNERS | ✅ Per-repo permissions |
| Dependency management | ✅ Internal deps always in sync | ❌ Version matrix across repos |
| Onboarding complexity | ❌ Large clone, complex tooling (nx, turborepo, Bazel) | ✅ Smaller, focused repos |
| Secret exposure blast radius | ❌ One leaked PAT → all services | ✅ Blast radius per repo |
| Branch strategy complexity | ❌ Harder to reason about affected paths | ✅ Simpler per-service |
```

> **Key risk**: Migrating from polyrepo to monorepo (or vice versa) is a **Type 1 irreversible decision** — triggers Strategic Handbrake review (CTO/VP Eng).

---

## CI/CD Integration Risks (Version Control Perspective)

```
❌ Pipeline triggered on every branch push (high cost, high noise)
   ✅ Scope triggers: main merges, PRs targeting main, release branches

❌ Pipeline succeeds but doesn't gate the merge (status check not required)
   ✅ Mark CI check as required in branch protection

❌ Deployment pipeline runs on every push to main without manual approval gate
   ✅ Add manual approval step before production deploy
   ✅ Use GitHub Environments with required reviewers
   ✅ Use GitLab Environments with manual deployment trigger

❌ No pipeline-as-code versioning — pipeline config drifts between branches
   ✅ Pipeline config lives in the repo (.github/workflows/, .gitlab-ci.yml)
   ✅ Changes to pipeline reviewed in PR/MR like any other code

❌ CI/CD artifacts not signed or verified
   ✅ Sign build artifacts (Docker images, packages) and verify signature before deploy
```

---

## Version Control Risk Scoring

Use these baselines when assigning severity to VCS findings:

| Finding | Default Severity | Rationale |
|---------|-----------------|-----------|
| Secret / credential confirmed in git history | 🔴 Critical | Already exposed; rotation required regardless of removal |
| Force push to main/master/develop proposed | 🔴 Critical | Irreversible public history rewrite; breaks all consumers |
| No branch protection on default branch | 🔴 Critical | Anyone can push directly; no quality gate |
| Force push --force instead of --force-with-lease | 🟠 High | Can silently discard team commits |
| Long-lived PAT with full scope used in CI/CD | 🟠 High | Single point of compromise for all repos |
| No required status checks before merge | 🟠 High | Broken code can ship without CI passing |
| Self-approving PRs/MRs allowed | 🟠 High | No independent review; audit trail misleading |
| GitHub Actions using mutable tag references | 🟠 High | Supply chain attack surface |
| Stale branch protection rules (CI check not in required list) | 🟡 Medium | Quality gate present but incomplete |
| No CODEOWNERS file for critical paths | 🟡 Medium | Wrong reviewer can approve domain changes |
| Missing Conventional Commits format | 🟢 Low | Changelog quality degraded; not a safety issue |
| Unsigned release tags | 🟢 Low | Low risk in non-critical projects; higher for OSS packages |

---

## Context Questions for Version Control Review

When context is missing before analysis, ask:

```markdown
1. **Platform**: Is this repository hosted on GitHub, GitLab, or another platform?
2. **Branch model**: What branching strategy does the team use (trunk-based, GitFlow, GitHub Flow)?
3. **Branch protection**: Are branch protection rules currently enabled on the default branch?
4. **Team size**: How many active contributors have write access to this repository?
5. **CI/CD status**: Is there a CI/CD pipeline? Is it required to pass before merge?
6. **Secret scanning**: Is any form of automated secret scanning enabled on this repository?
```
