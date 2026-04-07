# Product Risks Framework

Load this file when analyzing product decisions, feature proposals, launch plans, roadmap priorities, or go-to-market strategies. Applicable roles: Product Manager, Product Owner, Tech Lead, CTO.

---

## 1. Feature & Scope Risks

### Assumption Challenge Template for Product Decisions

For every feature or product decision, challenge:

| Assumption | Adversarial Question |
|---|---|
| "Users need this" | What is the evidence? Gut feeling or validated research? |
| "This will increase conversion" | What is the counter-hypothesis? What else could explain the change? |
| "We can build this in X sprints" | What is the history of similar estimates on this team? |
| "Users will understand how to use it" | What happens when they don't? Is there an error path? |
| "This is a must-have" | Who would cancel their subscription if we removed it? |
| "The market wants this" | Is this one vocal customer, or evidence from many? |

### Scope & Feature Coupling Risks

```
❌ Scope Creep Patterns
   - "While we're at it" additions that inflate scope without going through validation
   - Feature flags that become permanent — technical debt disguised as flexibility
   - MVP that ships without the minimum viable part (just the product)
   - Solution defined before the problem is validated

❌ Feature Coupling
   - Two features that cannot be independently released or rolled back
   - UI changes that require backend changes that require data migrations — all or nothing
   - Feature that works only when another unreleased feature is also live
   - Dependency on a third-party integration that has not been contracted
```

---

## 2. Launch & Rollout Risks

### Pre-Launch Checklist

```
❌ Validation Gaps
   - No user testing before launch (assumption that design is self-evident)
   - A/B test with insufficient sample size or duration (underpowered, early stopping)
   - Beta group that does not represent the actual user population
   - Success metric defined after seeing early results (p-hacking)

❌ Rollout Risks
   - Big-bang release with no feature flag or canary rollout
   - No rollback plan if the new feature increases churn or errors
   - No dark launch to validate backend performance under real traffic before UI launch
   - Missing communication plan for users affected by breaking changes

❌ Data & Instrumentation
   - Feature ships without tracking — cannot measure if it is working
   - Tracking implemented but key funnel step is missing
   - Metrics defined inconsistently across teams (different definitions of "active user")
   - No baseline measurement before launch (cannot calculate the delta)
```

### Failure Mode Analysis for Product Launches

| Failure Mode | Cause | User Impact | Business Impact | Mitigation |
|---|---|---|---|---|
| Low adoption | Feature is hard to discover | Users never use it | Investment wasted | Onboarding flow + in-app prompts |
| High abandonment | Cognitive overload / unclear value prop | User frustration | Increased churn | User testing pre-launch |
| Metric gaming | Metric is a proxy, not the real goal | No direct impact | Wrong decisions | Define guardrail metrics alongside primary |
| Silent errors | No error tracking on new flows | Users blocked silently | Support spike | Error monitoring on every new path |

---

## 3. Regulatory & Compliance Risks

Challenge every product decision against applicable regulations. These are not optional — violations can result in fines, litigation, or forced shutdown.

### Data & Privacy
```
❌ GDPR / CCPA / LGPD
   - Collecting data without explicit consent or legal basis
   - No mechanism for users to export or delete their data
   - Third-party analytics/tracking scripts added without consent banner
   - Data retained longer than necessary without documented retention policy
   - Personal data sent to third parties without a Data Processing Agreement (DPA)

❌ Children's Privacy (COPPA / GDPR-K)
   - Product accessible to under-13 users without verifiable parental consent
   - No age gate where legally required
```

### Accessibility & Inclusion
```
❌ WCAG 2.1 / ADA / EAA (European Accessibility Act)
   - Launching in a jurisdiction where WCAG AA compliance is legally required without audit
   - No keyboard navigation for core user flows
   - Color-only indicators (no text or icon alternatives)
   - Forms without associated labels (screen reader inaccessible)
   - Video content without captions
```

### Financial & Industry-Specific
```
❌ Financial Products
   - No disclosure of fees, APR, or risk (required by FCA, SEC, CFPB depending on jurisdiction)
   - Subscription auto-renewal without clear pre-authorization language

❌ Healthcare (HIPAA / MDR)
   - Storing or transmitting health data without HIPAA BAA in place
   - Medical device software (SaMD) shipped without regulatory clearance

❌ General Consumer
   - Dark patterns that may constitute deceptive trade practices (FTC, CMA scrutiny)
   - Cookie walls that do not offer a genuine consent-free alternative (GDPR)
```

---

## 4. Metrics & Success Definition Risks

```
❌ Metric Selection
   - Vanity metric as primary KPI (page views, downloads) with no proxy to business value
   - No guardrail metrics (optimizing conversion at the cost of support volume or churn)
   - Single metric that can be gamed without producing real value
   - North Star metric misaligned with what customers actually value

❌ Measurement Design
   - No holdout group — impossible to measure the counterfactual
   - Experiment contamination (control group exposed to treatment via shared features)
   - Short-term metric improvement masking long-term harm (e.g., dark patterns boost short-term conversion, increase long-term churn)
   - Attribution model that inflates a channel's contribution
```

---

## 5. User Adoption & Retention Failure Modes

```
❌ Onboarding
   - Time-to-value too long — user churns before experiencing the core benefit
   - Empty state not designed (new user sees a blank screen with no guidance)
   - Required setup step that a significant % of users cannot complete

❌ Retention
   - Feature solves a one-time problem, not a recurring one (no natural re-engagement)
   - Notification strategy is frequency-based, not value-based → users disable notifications
   - No re-engagement path for dormant users

❌ Monetization
   - Paywall placed before user has experienced enough value to justify paying
   - Pricing model that penalizes the exact user behavior you want to encourage
   - Free tier so generous it eliminates the upgrade motivation
   - No clear upgrade trigger — users don't know what they're missing
```

---

## 6. Pre-Mortem: Product-Specific Failure Scenarios

Apply these when performing a product pre-mortem (load `frameworks/premortem.md`):

1. **"The feature launched but nobody used it"** — What would have caused this? Discovery, value prop clarity, activation friction?
2. **"The feature increased a metric but hurt the business"** — What proxy metric was optimized at the expense of a guardrail?
3. **"A competitor launched the same feature 2 weeks later and it worked better"** — What did we ship too early without validating?
4. **"We got a regulatory notice 6 months post-launch"** — Which compliance gap did we knowingly or unknowingly skip?
5. **"The feature had to be rolled back after 48 hours"** — What edge case in the user population did we not account for?
