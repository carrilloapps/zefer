# Analysis Framework

Five-step process for systematic adversarial analysis. Load this file when performing a full Devil's Advocate review.

> **Non-software plans** (business, organizational, process): substitute the technical surfaces in Step 1 with — Process Surface (missing steps, no rollback), People Surface (bus factor, skill gaps), Budget Surface (cost overruns, unvalidated estimates). All other steps apply as-is.

---

## Step 1: Identify Attack Surfaces

**Technical Surface**
- Database queries (SQL injection, performance)
- API endpoints (authentication, authorization, rate limiting)
- Input validation (missing checks, type confusion)
- Error handling (information leakage, unhandled cases)
- Dependencies (vulnerabilities, supply chain)
- Infrastructure (configuration, network, permissions)

**Business Logic Surface**
- Race conditions (concurrent access)
- State machines (invalid transitions)
- Calculations (overflow, precision, rounding)
- Workflows (missing steps, incomplete rollback)
- Data consistency (eventual consistency issues)

**Operational Surface**
- Deployment process (rollback capability, zero-downtime)
- Monitoring (blind spots, alert fatigue)
- Scaling (bottlenecks, thundering herd)
- Data migration (data loss, partial failure)
- Disaster recovery (backup validity, RTO/RPO)

**Product Surface** *(PM / PO / CTO)*
- Feature assumptions (validated by research vs. opinion?)
- Success metric definition (proxy vs. real value, guardrail metrics)
- Regulatory and compliance exposure (GDPR, WCAG, HIPAA, financial)
- Adoption and retention failure modes (onboarding, activation, re-engagement)
- Launch and rollout risks (dark launch, feature flags, rollback plan)

**Design & UX Surface** *(UX Designer / PM)*
- Dark patterns and ethical design risks
- Accessibility coverage (WCAG 2.1 AA)
- Cognitive load and information architecture
- Error, empty, loading, and offline state design
- Trust signals and credibility
- Internationalization and cross-platform behavior

**Strategy Surface** *(Tech Lead / CTO)*
- Build vs. buy vs. integrate decision quality
- Vendor lock-in and exit plan
- Team topology alignment (Conway's Law)
- Type 1 (irreversible) vs. Type 2 (reversible) classification
- Key-person risk and bus factor

**Architecture Surface** *(Architect / Tech Lead)*
- Service coupling and bounded context clarity
- Distributed systems failure modes (split-brain, partition, cascading failure)
- API contract versioning and backward compatibility
- Event-driven patterns (idempotency, ordering, schema drift, poison pills)
- Observability coverage (tracing, SLOs, dead letter queues)

**Data Surface** *(Data Engineer / Analyst / Data Scientist)*
- Pipeline idempotency and failure recovery
- Data quality and validation (nulls, duplicates, range checks)
- Schema evolution and data contracts
- PII exposure and regulatory compliance (GDPR erasure, retention)
- ML training risks (data leakage, bias, training-serving skew)

---

## Step 2: Challenge Every Assumption

**Template: Assumption Challenge**

```markdown
## Assumption: [State the assumption]

**Context**: Where/why is this assumed?

**Challenge**: What if this assumption is wrong?

**Evidence**: What proof exists that this is valid?
- ✅ Proof 1
- ✅ Proof 2
- ❌ Missing proof 3

**Failure Scenarios**:
1. **Scenario A**: [How it fails]
   - Impact: [Critical/High/Medium/Low]
   - Likelihood: [High/Medium/Low]
   - Risk Score: Impact × Likelihood

2. **Scenario B**: [How it fails]
   - Impact: [Critical/High/Medium/Low]
   - Likelihood: [High/Medium/Low]
   - Risk Score: Impact × Likelihood

**Mitigation**:
- [ ] Option 1: [How to prevent/detect]
- [ ] Option 2: [Alternative approach]
```

---

## Step 3: Pros & Cons Analysis

```markdown
## Solution: [Proposed approach]

### ✅ Pros (Strengths)
1. **[Advantage]** - Why this is beneficial
2. **[Advantage]** - Impact on system

### ❌ Cons (Weaknesses)
1. **[Weakness]** - Why this is problematic
   - **Risk**: What could go wrong
   - **Impact**: Consequence if it happens
   - **Mitigation**: How to address

2. **[Weakness]** - Hidden cost
   - **Risk**: Long-term consequence
   - **Impact**: Technical debt created
   - **Mitigation**: Preventive measure

### ⚠️ Trade-offs
1. **[Trade-off]** - What we sacrifice for what we gain
   - **Cost**: What we give up
   - **Benefit**: What we get
   - **Worth it?**: Analysis

### 🚨 Red Flags (Critical Issues)
1. **[Critical concern]** - Why this is dangerous
   - **Must address before production**
   - **Suggested fix**: [Approach]

### 💡 Alternatives Considered
1. **Alternative A** - [Brief description]
   - Better at: [What]
   - Worse at: [What]
   - Why not chosen: [Reason]

2. **Alternative B** - [Brief description]
   - Better at: [What]
   - Worse at: [What]
   - Why not chosen: [Reason]
```

---

## Step 4: Failure Mode Analysis (FMEA)

```markdown
| Failure Mode | Cause | Effect | Severity (1-5) | Likelihood (1-5) | Detectability (1-5) | RPN | Mitigation |
|--------------|-------|--------|----------------|------------------|---------------------|-----|------------|
| SQL Injection | Unparameterized query | Data breach | 5 | 3 | 2 | 30 | Use prepared statements |
| Timeout | Slow dependency | User error | 3 | 4 | 5 | 60 | Add circuit breaker |
| Data race | Concurrent updates | Incorrect balance | 4 | 2 | 4 | 32 | Use transactions |
```

**RPN** = Severity × Likelihood × Detectability (higher = worse, prioritize for mitigation)  
**Severity**: 1=Negligible → 5=Catastrophic  
**Likelihood**: 1=Rare → 5=Almost Certain  
**Detectability**: 1=Obvious/easy to catch → 5=Invisible/silent failure  
⚠️ **Note**: Detectability=5 means the failure is *hardest* to detect — it makes RPN *worse*, not better.

---

## Step 5: Edge Case Enumeration

```markdown
## Input Validation

| Input | Edge Case | Expected Behavior | Actual Behavior | Risk |
|-------|-----------|-------------------|-----------------|------|
| Amount | Negative value | Reject | ? | High |
| Amount | Zero | Accept or reject? | ? | Medium |
| Amount | MAX_INT + 1 | Overflow error | ? | High |
| Date | Past date | Reject | ? | Medium |
| Date | Far future (2099) | Accept | ? | Low |
| String | Empty string | ? | ? | Medium |
| String | NULL vs "" | Different? | ? | Medium |
| String | SQL special chars | Escaped | ? | Critical |
| Array | Empty array | Handle gracefully | ? | Medium |
| Array | 10,000 items | Performance | ? | High |

## State Transitions

| From State | To State | Valid? | Edge Case | Risk |
|------------|----------|--------|-----------|------|
| PENDING | COMPLETED | ✅ | Skip PROCESSING? | High |
| COMPLETED | PENDING | ❌ | Idempotency issue | Critical |
| FAILED | PROCESSING | ❓ | Retry logic | Medium |

## Concurrent Access

| Scenario | Potential Issue | Mitigation |
|----------|----------------|------------|
| Two users update same record | Lost update | Optimistic locking |
| Read during write | Dirty read | Transaction isolation |
| Multiple pending transactions | Deadlock | Timeout + retry |
```
