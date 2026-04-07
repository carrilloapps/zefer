# Dependency & Supply Chain Security Framework

> *Protocol file — free to load, does not count toward context budget.*
>
> Loaded for every assessment. All codebases use dependencies or integrate external components. Covers dependency vulnerability analysis, supply chain attack vectors, integrated skills/plugins evaluation, and compliance mapping against CWE/MITRE Top 25, OWASP Top 10, and CIS Controls (SANS Top 20).

> **Reference patterns only** — Detection signatures and vulnerable patterns below are for recognition and reporting purposes. The agent must never install, execute, or modify any package or dependency.

---

## Scope

This framework mandates the evaluation of **every external component** integrated into the assessed system:

| Component type | Examples | Inspection required |
|---------------|----------|-------------------|
| **Package dependencies** | npm, pip, Maven, NuGet, Go modules, Cargo, Composer, RubyGems, CocoaPods | Version audit, CVE lookup, license review, maintainer trust |
| **Transitive dependencies** | Sub-dependencies pulled automatically by direct dependencies | Same inspection as direct — transitive vulns are equally exploitable |
| **Integrated skills** | AI agent skills, plugins, extensions, MCP servers | Permission scope, data access, write capability, update mechanism |
| **Container base images** | Docker FROM statements, OCI images | Known CVEs, image provenance, tag mutability |
| **CI/CD pipeline dependencies** | GitHub Actions, GitLab CI templates, pre-built orbs/steps | Source trust, pinning (SHA vs. tag), permissions granted |
| **Infrastructure modules** | Terraform modules, CloudFormation templates, Helm charts | Source registry, version pinning, permission scope |

---

## Mandatory Analysis Steps

### Step D1 — Inventory All Dependencies

Enumerate all dependency manifests in the project:

| Ecosystem | Manifest files | Lock files |
|-----------|---------------|------------|
| Node.js | `package.json` | `package-lock.json`, `yarn.lock`, `pnpm-lock.yaml`, `bun.lockb` |
| Python | `requirements.txt`, `pyproject.toml`, `setup.py`, `Pipfile` | `Pipfile.lock`, `poetry.lock` |
| Java/Kotlin | `pom.xml`, `build.gradle`, `build.gradle.kts` | `gradle.lockfile` |
| .NET | `*.csproj`, `packages.config`, `Directory.Packages.props` | `packages.lock.json` |
| Go | `go.mod` | `go.sum` |
| Rust | `Cargo.toml` | `Cargo.lock` |
| PHP | `composer.json` | `composer.lock` |
| Ruby | `Gemfile` | `Gemfile.lock` |

For each manifest, record: total direct dependencies, total transitive dependencies (from lock file), and presence/absence of lock file.

### Step D2 — Vulnerability Audit Against Known Databases

For each dependency (direct and transitive), check against:

| Database | Coverage | Lookup method |
|----------|----------|---------------|
| **NVD (National Vulnerability Database)** | All ecosystems | CVE identifiers, CPE matching |
| **GitHub Advisory Database** | All ecosystems | GHSA identifiers, ecosystem-specific |
| **OSV (Open Source Vulnerabilities)** | All ecosystems | OSV identifiers, cross-database |
| **npm audit / Snyk DB** | Node.js | Advisory IDs |
| **PyPI Advisory DB** | Python | PYSEC identifiers |

Record for each vulnerable dependency: package name, installed version, vulnerable version range, CVE/GHSA ID, CVSS score, fix version (if available), and whether exploitation is reachable from the project's code.

### Step D3 — Evaluate Against CWE/MITRE Top 25

Map every dependency vulnerability and every code-level finding to the **CWE/MITRE Top 25 Most Dangerous Software Weaknesses**. These represent the most frequent and critical programming errors:

| CWE ID | Name | Category |
|--------|------|----------|
| CWE-787 | Out-of-bounds Write | Memory safety |
| CWE-79 | Cross-site Scripting (XSS) | Injection |
| CWE-89 | SQL Injection | Injection |
| CWE-416 | Use After Free | Memory safety |
| CWE-78 | OS Command Injection | Injection |
| CWE-20 | Improper Input Validation | Input validation |
| CWE-125 | Out-of-bounds Read | Memory safety |
| CWE-22 | Path Traversal | Access control |
| CWE-352 | Cross-Site Request Forgery (CSRF) | Session management |
| CWE-434 | Unrestricted Upload of File with Dangerous Type | Input validation |
| CWE-862 | Missing Authorization | Access control |
| CWE-476 | NULL Pointer Dereference | Memory safety |
| CWE-287 | Improper Authentication | Authentication |
| CWE-190 | Integer Overflow or Wraparound | Memory safety |
| CWE-502 | Deserialization of Untrusted Data | Input validation |
| CWE-77 | Command Injection | Injection |
| CWE-119 | Improper Restriction of Operations within Bounds of Memory Buffer | Memory safety |
| CWE-798 | Use of Hard-coded Credentials | Secrets management |
| CWE-918 | Server-Side Request Forgery (SSRF) | Access control |
| CWE-306 | Missing Authentication for Critical Function | Authentication |
| CWE-362 | Concurrent Execution Using Shared Resource with Improper Synchronization | Concurrency |
| CWE-269 | Improper Privilege Management | Access control |
| CWE-94 | Code Injection | Injection |
| CWE-863 | Incorrect Authorization | Access control |
| CWE-276 | Incorrect Default Permissions | Access control |

**Mapping rule**: Every finding in the SAR must include its CWE identifier(s). If a dependency has a CVE, cross-reference the CVE's CWE classification. If a code-level finding matches a CWE pattern, document it explicitly.

> **Staleness note**: This list reflects the CWE Top 25 as of 2025. MITRE updates the list annually. When web search is available, the agent should verify against the current year's list at the official MITRE CWE site to ensure no new entries are missed. When web search is unavailable, use the 2025 list as the baseline and note in the SAR appendix: "CWE Top 25 list was not verified against the current year's publication."

### Step D4 — Evaluate Against OWASP Top 10

Map dependency and code findings to the **OWASP Top 10 (2021)** categories:

| ID | Category | Dependency relevance |
|----|----------|---------------------|
| A01:2021 | Broken Access Control | Dependencies with auth bypass CVEs, skills with excessive permissions |
| A02:2021 | Cryptographic Failures | Dependencies using deprecated crypto (MD5, SHA1, DES), weak TLS |
| A03:2021 | Injection | Dependencies vulnerable to SQL/NoSQL/OS/LDAP injection |
| A04:2021 | Insecure Design | Architectural weaknesses in dependency integration patterns |
| A05:2021 | Security Misconfiguration | Default configs in dependencies, debug modes left enabled |
| A06:2021 | Vulnerable and Outdated Components | **Primary category** — any dependency with known CVEs or that is end-of-life |
| A07:2021 | Identification and Authentication Failures | Dependencies with authentication bypass, session fixation CVEs |
| A08:2021 | Software and Data Integrity Failures | **Primary category** — unsigned packages, unpinned versions, missing integrity checks, compromised supply chain |
| A09:2021 | Security Logging and Monitoring Failures | Dependencies that suppress or leak security events |
| A10:2021 | Server-Side Request Forgery (SSRF) | Dependencies vulnerable to SSRF, URL parsing inconsistencies |

> **A06 and A08 are the primary OWASP categories for dependency/supply chain findings.** Every vulnerable or outdated dependency maps to A06. Every integrity/provenance gap maps to A08.

### Step D5 — Evaluate Against SANS/CIS Top 20 (CIS Controls v8)

Map findings to the relevant **CIS Controls** (formerly SANS Top 20):

| Control | Title | Dependency/supply chain relevance |
|---------|-------|----------------------------------|
| CIS 2 | Inventory and Control of Software Assets | All dependencies must be inventoried; unknown/shadow dependencies are a finding |
| CIS 7 | Continuous Vulnerability Management | Dependencies with known CVEs that lack a remediation plan |
| CIS 16 | Application Software Security | Secure coding practices in dependency usage, input validation at integration points |
| CIS 18 | Penetration Testing | Dependency attack surface should be included in penetration scope |

---

## Supply Chain Attack Vectors

The agent must evaluate the following supply chain attack vectors for all dependencies and integrated skills:

### Dependency Confusion / Substitution

| Vector | Detection | Scoring guidance |
|--------|-----------|-----------------|
| Private package name exists in public registry | Check if internal package names are claimable on public registries | 75–90 (High–Critical) — enables arbitrary code execution |
| Typosquatting | Check for similarly-named packages in dependencies | 70–85 (High) — social engineering vector |
| Star jacking | GitHub stars/metadata copied from legitimate project | Document as warning if detected |

### Version Pinning and Integrity

| Check | Expected state | Finding if absent |
|-------|---------------|-------------------|
| Lock file present and committed | Lock file exists in version control | 60–70 (Medium) — builds are non-reproducible |
| Dependencies pinned to exact versions | No `^`, `~`, `*`, `>=` ranges in production | 50–60 (Medium) — automatic updates can introduce compromised versions |
| Integrity hashes in lock file | SHA-256/SHA-512 hashes for every resolved package | 55–65 (Medium) — no verification of package integrity |
| Container image tags are SHA-pinned | `FROM image@sha256:...` not `FROM image:latest` | 60–70 (Medium) — tag mutation attack |
| CI/CD actions pinned to SHA | `uses: action@sha256` not `uses: action@v1` | 60–70 (Medium) — action hijacking risk |

### Maintainer and Provenance Trust

| Signal | Risk indicator |
|--------|---------------|
| Single maintainer with no organization backing | Bus factor risk; account takeover = supply chain compromise |
| Package has < 6 months of history | Possible newly created attack package |
| Recent ownership transfer | Potential account takeover or intentional handoff to malicious actor |
| No provenance attestation (SLSA, Sigstore) | Cannot verify build-to-source mapping |
| Excessive permissions requested by skill/plugin | Skill requests write access, network access, or system commands beyond its stated purpose |

---

## Integrated Skills and Plugins Evaluation

When the assessed system integrates other **AI agent skills, plugins, MCP servers, or extensions**, evaluate each one:

### Permission Scope Analysis

| Check | Expected | Finding if violated |
|-------|----------|-------------------|
| Skill declares minimal required permissions | Read-only where possible | 60–75 if skill has write access beyond its stated purpose |
| Skill does not access secrets or credentials | No access to `.env`, secrets managers, or auth tokens | 70–85 if skill can read secrets |
| Skill does not make network requests to undeclared endpoints | All external calls documented | 65–80 if undocumented outbound traffic possible |
| Skill version is pinned | Exact version, not `latest` or range | 55–65 if unpinned |
| Skill source is verified | Published on official registry, signed, or from trusted org | 60–75 if unverified source |

### Data Flow Through Skills

| Check | Expected | Finding if violated |
|-------|----------|-------------------|
| Skill does not receive sensitive data unnecessarily | Minimum data principle | 60–75 if PII or secrets passed to skill without need |
| Skill output is validated/sanitized before use | Output treated as untrusted | 65–80 if skill output used directly in queries, commands, or responses |
| Skill does not persist data beyond session | No unauthorized data retention | 70–85 if skill stores data externally |

---

## Scoring Guidance for Dependency Findings

| Scenario | Score range | Key factors |
|----------|-----------|-------------|
| Direct dependency with Critical CVE (CVSS ≥ 9.0), reachable from application code | 85–95 | Exploitable, high CVSS, direct dependency |
| Direct dependency with High CVE (CVSS 7.0–8.9), reachable | 70–85 | Exploitable, moderate CVSS |
| Direct dependency with Critical CVE, **not reachable** from application code | 35–40 | Unreachable cap applies (≤ 40) |
| Transitive dependency with Critical CVE, reachable | 75–90 | Exploitable but attacker must traverse dependency chain |
| No lock file committed | 60–70 | Non-reproducible builds, integrity risk |
| Dependencies with broad version ranges in production | 50–60 | Automatic upgrade attack surface |
| End-of-life dependency with no security patches | 65–80 | No fix available, must migrate |
| Skill/plugin with excessive permissions | 60–80 | Depends on permission type and data access |
| Skill/plugin from unverified source | 55–70 | Trust and provenance gap |
| Dependency confusion possible (private name on public registry) | 75–90 | Arbitrary code execution on install |

> **Reachability rule**: The [scoring system](scoring-system.md) unreachable cap (≤ 40) applies to dependency CVEs just as it does to code-level findings. A Critical CVE in a dependency whose vulnerable function is never called by the application scores ≤ 40.

---

## Dashboard Metrics for Dependencies

The following metrics must be included in the Security Posture Dashboard when dependency analysis is in scope:

| Metric | Formula |
|--------|---------|
| **Dependency Vulnerability Rate** | (Dependencies with known CVEs ÷ total dependencies) × 100 |
| **Direct Dependency Vulnerability Rate** | (Direct dependencies with known CVEs ÷ total direct dependencies) × 100 |
| **CWE/MITRE Top 25 Coverage** | (CWE Top 25 categories with zero findings ÷ 25) × 100 |
| **OWASP Top 10 Alignment** | (OWASP Top 10 categories with zero critical gaps ÷ 10) × 100 |
| **Lock File Integrity** | Present and committed: Yes/No |
| **Version Pinning Rate** | (Dependencies pinned to exact version ÷ total dependencies) × 100 |
| **End-of-Life Dependencies** | Count of dependencies past their EOL date |
| **Skills/Plugins Security Rate** | (Skills/plugins passing all permission checks ÷ total skills/plugins) × 100 |

---

## Cross-Reference

- For code-level injection patterns that may exist in dependencies → see [`injection-patterns.md`](injection-patterns.md) *(domain framework — counts toward budget)*
- For storage/secrets findings related to dependency configs → see [`storage-exfiltration.md`](storage-exfiltration.md) *(domain framework — counts toward budget)*
- For compliance standard mapping → see [`compliance-standards.md`](compliance-standards.md) *(domain framework — counts toward budget)*
- For scoring rules and gate adjustments → see [`scoring-system.md`](scoring-system.md) *(protocol file — free)*
