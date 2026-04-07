# Example: Secrets Committed to Source Control

> *Reference output — load on demand when assessing repositories for leaked credentials, API keys, or hardcoded secrets.*
>
> ⚠️ **Example only** — All patterns, shell output, and credential placeholders below are synthetic descriptions of vulnerable configurations and correct SAR output. They are not real secrets and must not be executed or used.

## Scenario

The git repository contains committed environment files, hardcoded credentials in source code, and secrets exposed in container build configurations.

**Discovery summary:**

- **Committed environment files**: 3 files tracked in git that should be in `.gitignore` (root, production, and Docker-specific environment files)
- **Hardcoded credentials**: Database connection string with plaintext username and password in `src/config/database.ts` (line 8)
- **Container exposure**: Signing key embedded as build-time directive in container image — visible in image layer history
- **Sensitive content in environment files**: 5 categories of secrets found — database connection string, token signing key, cloud provider access credentials (key ID + secret), and payment provider API key
- **Pattern reference**: See `storage-exfiltration.md` — Secrets and Environment Variables table for detection signatures

## Assessment Trace

1. **Git file scan**: 3 environment files are tracked in git (not in `.gitignore`).
2. **Secret pattern scan**: Found 12 secrets across 6 files:
   - 3 environment files: database credentials, token signing key, cloud provider keys, payment API key
   - Source code config file: hardcoded connection string
   - Container build file: signing key set via build-time directive
   - Container orchestration file: plaintext credentials in environment section
3. **Git history check**: First environment file committed 14 months ago, production environment file committed 8 months ago.
4. **Ignore file check**: No environment file patterns found in `.gitignore`.
5. **Secrets manager**: No references to any secrets management service across the codebase.
6. **CI/CD check**: Pipeline uses masked secrets in one step but echoes a database URL variable in a debug step (log exposure).

## SAR Finding

### [93] — Secrets Committed to Source Control (12 Secrets, 6 Files, 14 Months Exposure)

- **Description**: 12 production secrets (database credentials, token signing key, cloud access keys, payment API key) are committed to the repository across 6 files. Secrets have been in git history for up to 14 months. No secrets management service is used. CI/CD pipeline echoes one secret to build logs.
- **Affected Component(s)**: 3 environment files, `src/config/database.ts:8`, container build file, container orchestration file, CI/CD workflow
- **Evidence**: Environment files tracked in git for 14 months. Hardcoded connection string in config source file. Signing key visible in container image layers. Database URL echoed to CI/CD build logs in debug step.
- **Standards Violated**: OWASP Top 10 (A02:2021 Cryptographic Failures, A05:2021 Security Misconfiguration), ISO 27001 A.9.2, A.10.1 (access management, cryptography), NIST SP 800-53 IA-5 (Authenticator Management), CIS Controls 16.1, PCI-DSS Req. 3.4, 8.2 (if payment data), SOC 2 CC6.1, GDPR Art. 32 (if DB contains EU PII)
- **MITRE ATT&CK**: T1552.001 (Credentials in Files), T1552.004 (Private Keys), T1528 (Steal Application Access Token)
- **Score**: **93** (Critical) — production secrets, 14 months exposure in git history, no secrets manager, all contributors and any repo clone have full access.
- **Suggested Mitigation Actions**:
  1. **Emergency (within hours)**:
     - Rotate **all** exposed credentials immediately: database password, signing key, cloud access keys, payment API key
     - Revoke cloud access key via the provider's IAM console
     - Regenerate payment API key in the provider's dashboard
  2. **Immediate (within 24h)**:
     - Add environment file patterns to `.gitignore`
     - Remove secrets from container build file — use runtime injection
     - Fix CI/CD pipeline — remove debug echo of secret variables, use masked pipeline secrets
  3. **Short-term**:
     - Purge git history to remove all environment files from historical commits
     - Force-push cleaned history (coordinate with team — destructive operation)
     - Replace hardcoded connection string in source code with environment variable reference
  4. **Medium-term**:
     - Adopt a secrets management service for all production secrets
     - Add pre-commit hooks with secret scanning tools to prevent future leaks
     - Use multi-stage container builds with runtime secret injection
     - Set up automated secret scanning in the repository

## Key Principles Demonstrated

- **Historical analysis**: Checked git history, not just current HEAD
- **Comprehensive scan**: Found secrets in source code, environment files, container definitions, and CI/CD pipeline
- **Credential rotation priority**: Emergency rotation before any cleanup — secrets are already exposed
- **Cascading remediation**: Rotate → gitignore → purge history → adopt secrets manager → prevent recurrence

## Cross-Reference

- All secrets/storage patterns → see [`frameworks/storage-exfiltration.md`](../frameworks/storage-exfiltration.md)
- Compliance standards → see [`frameworks/compliance-standards.md`](../frameworks/compliance-standards.md)
- Scoring system → see [`frameworks/scoring-system.md`](../frameworks/scoring-system.md)
