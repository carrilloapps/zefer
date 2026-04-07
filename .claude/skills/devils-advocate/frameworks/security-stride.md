# Security Analysis — STRIDE Threat Model

> **Role**: Developer / Security Engineer / AppSec / Tech Lead
> **Load when**: The plan involves authentication, authorization, data handling, APIs, cryptography, secrets, supply chain, or infrastructure security.
> **Always paired with**: `frameworks/vulnerability-patterns.md` for anti-patterns and known failure modes; `frameworks/building-protocol.md` when code is involved.

Reference: [STRIDE Threat Modeling](https://docs.microsoft.com/en-us/azure/security/develop/threat-modeling-tool-threats) | [OWASP Top 10](https://owasp.org/www-project-top-ten/)

---

## STRIDE Template

For each component under review, complete the following:

## Component: [Name]

### S — Spoofing
**Threat**: Attacker impersonates legitimate user/service  
**Attack Vector**: [How]  
**Mitigation**: [What we do]  
**Gap**: [What's missing]  
**Severity**: 🔴 / 🟠 / 🟡

### T — Tampering
**Threat**: Attacker modifies data in transit or at rest  
**Attack Vector**: [How]  
**Mitigation**: [What we do]  
**Gap**: [What's missing]  
**Severity**: 🔴 / 🟠 / 🟡

### R — Repudiation
**Threat**: User denies an action they performed  
**Attack Vector**: [How]  
**Mitigation**: [What we do — audit logs, signatures, non-repudiation tokens]  
**Gap**: [What's missing]  
**Severity**: 🔴 / 🟠 / 🟡

### I — Information Disclosure
**Threat**: Unauthorized access to sensitive data  
**Attack Vector**: [How]  
**Mitigation**: [What we do]  
**Gap**: [What's missing]  
**Severity**: 🔴 / 🟠 / 🟡

### D — Denial of Service
**Threat**: Service becomes unavailable  
**Attack Vector**: [How — flood, resource exhaustion, deadlock, malformed input]  
**Mitigation**: [What we do — rate limiting, circuit breakers, input limits]  
**Gap**: [What's missing]  
**Severity**: 🔴 / 🟠 / 🟡

### E — Elevation of Privilege
**Threat**: Normal user gains admin or unauthorized access  
**Attack Vector**: [How]  
**Mitigation**: [What we do — RBAC, least privilege, defense in depth]  
**Gap**: [What's missing]  
**Severity**: 🔴 / 🟠 / 🟡

---

## STRIDE Quick Summary (for report output)

| Threat | Risk | Mitigation in place | Gap |
|--------|------|---------------------|-----|
| Spoofing | 🔴/🟠/🟡/🟢 | [Yes/Partial/No] | [What's missing] |
| Tampering | 🔴/🟠/🟡/🟢 | [Yes/Partial/No] | [What's missing] |
| Repudiation | 🔴/🟠/🟡/🟢 | [Yes/Partial/No] | [What's missing] |
| Information Disclosure | 🔴/🟠/🟡/🟢 | [Yes/Partial/No] | [What's missing] |
| Denial of Service | 🔴/🟠/🟡/🟢 | [Yes/Partial/No] | [What's missing] |
| Elevation of Privilege | 🔴/🟠/🟡/🟢 | [Yes/Partial/No] | [What's missing] |

---

## Extended Threat Vectors (beyond classic STRIDE)

- **Supply chain**: Are third-party dependencies audited? Is the build pipeline tamper-proof?
- **Social engineering**: Can an attacker impersonate a developer or ops engineer to gain access?
- **Insider threat**: Does the system protect against a malicious internal actor with valid credentials?
- **Side channels**: Does timing, memory usage, or error messages leak information about internal state?