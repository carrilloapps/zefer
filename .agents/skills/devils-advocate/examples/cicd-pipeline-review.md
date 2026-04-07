# Example Devil's Advocate Analysis: CI/CD Pipeline — GitHub Actions with Over-Permissive Tokens and Hardcoded Secrets

> ⚠️ **EDUCATIONAL EXAMPLE — NOT FOR IMPLEMENTATION.** This file contains fictional, deliberately insecure CI/CD configurations used solely to demonstrate how Devil's Advocate detects supply-chain and credential-exposure risks. All secrets, hostnames, and repository names are fictional. Code blocks marked `❌ Wrong` are negative examples — they must never be committed or executed.

> 🔍 **Adversarial analysis example.** The scenario below is intentionally flawed to demonstrate how Devil's Advocate identifies security risks. The code marked `❌ Wrong` must never be used in production.

> **Original proposal (from Developer):**Set up a GitHub Actions workflow that runs our test suite, builds a Docker image, pushes it to Docker Hub, and deploys to our staging environment via SSH. The workflow YAML includes our `DOCKER_PASSWORD` as a plain environment variable, uses `permissions: write-all` for the `GITHUB_TOKEN`, and uses `actions/checkout@v3` (mutable tag reference). Deploying via: `ssh staging-user@staging.server.com` with the private key stored as a repository variable.

---

## ⚡ IMMEDIATE REPORT — 🔴 Critical Finding

**Finding**: `DOCKER_PASSWORD` hardcoded as a plain environment variable in the workflow YAML — this value is visible to anyone who can read the repository file and will be printed in job logs.
**Domain**: Security / Version Control
**Why immediate**: Once committed, a hardcoded secret in workflow YAML is immediately exposed to all repo contributors and any CI/CD log viewer. GitHub's secret scanning may alert, but the credential is already compromised at push time.
**Risk if not addressed**: Docker Hub account takeover; any image pushed to that registry can be replaced with a malicious one; supply chain attack on everyone pulling the image.

---
### 🔍 Context Needed

1. **Current commit status**: Has the workflow YAML already been committed and pushed? Is the `DOCKER_PASSWORD` currently in the git history?
2. **Docker Hub access scope**: Does this Docker Hub account hold other images used in production? How many consumers pull from this registry?
3. **Mutable tag usage**: Is `actions/checkout@v3` used in other workflows in this repository?

---
Reply: 📝 [answers] to raise confidence | `continue` to proceed at worst-case score

*(Context provided: "Not committed yet — this is the draft YAML being reviewed. Docker Hub account has 4 production images. actions/checkout@v3 is used across 8 other workflows.")*

---

## 🛑 HANDBRAKE ACTIVATED

**Critical finding**: Multiple Critical security misconfigurations in CI/CD pipeline design — hardcoded secret, over-permissive GITHUB_TOKEN, mutable Action references across 9 workflows, and SSH key as a repository variable
**Domain**: Security / Version Control
**Responsible role**: Senior Developer / Tech Lead + Security Engineer
**Why Handbrake level**: Four independent Critical/High security findings in a CI/CD pipeline that will have write access to production registry and SSH access to staging. This is a supply chain attack surface that, if exploited, can push malicious images affecting all downstream users.

**Specialist questions for Tech Lead / Security Engineer:**

1. Does this repository use any fork-based PR workflow? If `pull_request_target` is ever used, `write-all` GITHUB_TOKEN creates an immediate arbitrary code execution risk from forked PRs.
2. What is the minimum set of GITHUB_TOKEN permissions actually required? (Most pipelines need `contents: read` only; pushing to registry uses an external secret, not GITHUB_TOKEN.)
3. For the SSH deploy — is there a secrets manager (GitHub Environments + required reviewers) that should gate the staging deploy, rather than a plain repository-level variable accessible to all branches?

*(Tech Lead answered: "No fork PRs — internal repo only. GITHUB_TOKEN only needs to read checkout and write to packages registry (if we use GHCR instead of Docker Hub). Staging should require an environment approval gate.")*

---

# 🔴 Devil's Advocate Analysis: GitHub Actions CI/CD Pipeline Setup

**Analyzed**: 2026-02-20
**Skill version**: 2.9.0
**Scope**: Version Control / Security — GitHub Actions workflow for test + Docker build + staging deploy; internal repository

---

## 📊 Executive Summary

**Overall Risk Rating**: 🔴 Critical

**Key Findings**:
1. `DOCKER_PASSWORD` as plain env var in YAML — Building Protocol Critical (hardcoded secret) + supply chain attack surface
2. `permissions: write-all` on GITHUB_TOKEN — over-permissive; only `contents: read` + `packages: write` needed
3. Mutable Action tag `actions/checkout@v3` across 9 workflows — supply chain attack surface (tag can be moved to malicious commit)
4. SSH private key stored as repository variable — accessible to all branches, not gated by environment approval

**Recommendation**: ⚠️ Revise before committing — do not commit the current YAML draft. The fixes are all straightforward and take < 2 hours to implement correctly.

**Analysis Confidence**: 🟢 High — Tech Lead confirmed scope; no fork PRs; environment approval approach confirmed feasible

---

## 🛑 Handbrake & ⚡ Immediate Report Status

| Protocol | Finding | Domain | Escalated to | Context received | Risk change |
|----------|---------|--------|-------------|-----------------|-------------|
| ⚡ Immediate | Hardcoded DOCKER_PASSWORD in workflow YAML | Security | Team | ✅ Full — not yet committed; 4 production images in registry | ✅ Not yet exposed — preventable |
| 🛑 Handbrake | 4 critical security misconfigurations in CI/CD design | Security | Tech Lead + Security Eng | ✅ Full — fork risk confirmed nil; minimal perms identified | 🔻 Lowered: all fixable before first commit |

---

## ✅ Strengths (What Works Well)

1. **Review before commit** — catching this in design review, not after push, means zero exposure has occurred
2. **GitHub Actions is the right tool** — native, well-supported, appropriate for this stack
3. **Staging environment separate from production** — staging SSH deploy is lower risk than a direct production deploy

---

## ❌ Weaknesses (What Could Fail)

### 🔴 Critical Issues (Building Protocol violations)

1. **`DOCKER_PASSWORD` hardcoded as plain environment variable** *(Building Protocol: 🔴 Critical)*
   - **Risk**: Plain env vars in workflow YAML appear in git history and are printed in job logs for every run
   - **Impact**: Docker Hub account takeover; malicious image push to 4 production images; supply chain compromise
   - **Mitigation**: Use `${{ secrets.DOCKER_PASSWORD }}` — store in GitHub repository secrets (encrypted, not visible in logs). Never in `env:` block with literal value

   ```yaml
   # ❌ Wrong — NEVER hardcode secrets in workflow YAML
   env:
     DOCKER_PASSWORD: "REDACTED_EXAMPLE_VALUE"  # ← vulnerability: plaintext secret exposed in git history and CI logs

   # ✅ Correct
   - name: Log in to Docker Hub
     uses: docker/login-action@v3
     with:
       username: ${{ secrets.DOCKER_USERNAME }}
       password: ${{ secrets.DOCKER_PASSWORD }}
   ```

2. **`permissions: write-all` on GITHUB_TOKEN**
   - **Risk**: Grants the workflow write access to every repository scope — code, PRs, issues, packages, deployments, secrets. Minimum necessary principle violated
   - **Impact**: A compromised workflow step can write to the repository, approve its own PRs, or exfiltrate repository secrets
   - **Mitigation**: Declare minimum permissions explicitly:
   ```yaml
   permissions:
     contents: read
     packages: write   # only if pushing to GHCR
   ```

### 🟠 High-Priority Issues

1. **Mutable Action tag references (`actions/checkout@v3`) across 9 workflows**
   - **Risk**: Git tags can be force-moved to point to different commits. An attacker who compromises the `actions/checkout` repository (or any other Action used) can move the tag to malicious code — every workflow using that tag automatically runs the malicious version
   - **Impact**: Full supply chain compromise — attacker runs arbitrary code in your CI with your secrets in scope
   - **Mitigation**: Pin all Actions to full commit SHA, not tag:
   ```yaml
   # ❌ Mutable — tag can be moved
   uses: actions/checkout@v3

   # ✅ Immutable — SHA cannot be changed without a new commit
   uses: actions/checkout@11bd71901bbe5b1630ceea73d27597364c9af683  # v4.2.2
   ```
   - Use a tool like `pin-github-action` or `Dependabot` (Actions updates) to manage and update SHA pins

2. **SSH private key stored as repository variable (not environment-scoped)**
   - **Risk**: Repository variables are accessible to pipelines triggered by any branch. A developer on any feature branch can trigger a job that accesses the staging SSH key
   - **Impact**: Unauthorized access to staging server from any branch pipeline
   - **Mitigation**: Move SSH private key to a **GitHub Environment** named `staging` with required reviewers; restrict to deploys from `main` branch only:
   ```yaml
   jobs:
     deploy:
       environment: staging  # requires approval; restricts variable access
       if: github.ref == 'refs/heads/main'
   ```

### 🟡 Medium-Priority Issues

1. **No pipeline failure notification** — if the deploy step fails silently, there is no alert
2. **Docker image not tagged with commit SHA** — using `latest` tag only means rollback requires re-running the previous pipeline, not pulling a specific image
3. **No smoke test after staging deploy** — pipeline completes without verifying the deployed service is actually responding

---

## ⚠️ Assumptions Challenged

| Assumption | Challenge | Evidence | Risk if wrong |
|---|---|---|---|
| "Plain env var is just a placeholder" | Once committed, it's in git history permanently | git log behaviour | Exposed immediately on push |
| "`write-all` is easier to set up" | One compromised step = write access to the entire repo | GitHub docs: principle of least privilege | Arbitrary code can merge PRs, write releases |
| "`@v3` is fine — it's a trusted action" | Tags are mutable; Actions maintainer accounts have been compromised before | actions/checkout v3.5.0 supply chain incident (hypothetical but documented attack pattern) | Malicious code runs in your CI with secrets in scope |
| "Staging deploy is low risk" | Staging has the same credentials as prod-adjacent infrastructure | Common attack path: compromise staging → pivot to prod | Staging = attack staging ground for production |

---

## 🔒 Corrected Workflow Structure

```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

# ✅ Minimal permissions — declare explicitly
permissions:
  contents: read
  packages: write

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      # ✅ Pinned to commit SHA — not mutable tag
      - uses: actions/checkout@11bd71901bbe5b1630ceea73d27597364c9af683  # v4.2.2

      - name: Run tests
        run: npm test

  build-and-push:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@11bd71901bbe5b1630ceea73d27597364c9af683  # v4.2.2

      # ✅ Secret via encrypted GitHub Secret — never plain env var
      - name: Log in to Docker Hub
        uses: docker/login-action@9780b0c442fbb1117ed29e0efdff1e18412f7567  # v3.3.0
        with:
          username: ${{ secrets.DOCKER_USERNAME }}
          password: ${{ secrets.DOCKER_PASSWORD }}

      # ✅ Tag with commit SHA for rollback capability
      - name: Build and push
        run: |
          docker build -t myorg/myapp:${{ github.sha }} .
          docker push myorg/myapp:${{ github.sha }}

  deploy-staging:
    needs: build-and-push
    runs-on: ubuntu-latest
    # ✅ Environment gates: required reviewers + branch restriction
    environment: staging
    if: github.ref == 'refs/heads/main'
    steps:
      - name: Deploy to staging
        uses: appleboy/ssh-action@v1.0.0  # ⚠️ MUTABLE TAG — replace with SHA-pinned ref (e.g. appleboy/ssh-action@7eaf98bf61c1cd37f10400b0b25b44abd61ea2a9) before use
        with:
          host: ${{ secrets.STAGING_HOST }}
          username: ${{ secrets.STAGING_USER }}
          key: ${{ secrets.STAGING_SSH_KEY }}  # ✅ Environment-scoped secret
          script: |
            docker pull myorg/myapp:${{ github.sha }}
            docker-compose up -d
```

---

## ✅ Recommendations

### Must Do (Before first commit)
- [ ] Replace `DOCKER_PASSWORD` plain env var with `${{ secrets.DOCKER_PASSWORD }}` (GitHub encrypted secret)
- [ ] Change `permissions: write-all` to minimum required (`contents: read`, `packages: write` if using GHCR)
- [ ] Pin all Action references to full commit SHA (not mutable tags) in all 9 workflows
- [ ] Move SSH key from repository variable to `staging` GitHub Environment with required reviewers and `main`-branch restriction

### Should Do (This sprint)
- [ ] Tag Docker images with `${{ github.sha }}` for rollback capability
- [ ] Add smoke test step after staging deploy (curl health endpoint; fail if non-200)
- [ ] Set up Dependabot for GitHub Actions to auto-PR SHA pin updates

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
