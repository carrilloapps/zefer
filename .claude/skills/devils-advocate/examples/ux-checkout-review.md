# Example Devil's Advocate Analysis: UX Design — Subscription Checkout with Pre-Selected Annual Plan

> ⚠️ **EDUCATIONAL EXAMPLE — NOT FOR IMPLEMENTATION.** This file contains a fictional checkout flow with deliberately deceptive UX patterns, used solely to demonstrate how Devil's Advocate identifies dark patterns and FTC/GDPR compliance violations. No real product, company, or system is referenced.

> 🔍 **Adversarial analysis example.** The proposal below is intentionally a problematic dark pattern. This file demonstrates how Devil's Advocate identifies and blocks checkout flows that violate FTC disclosure requirements and GDPR transparency obligations.

> **Original proposal (from UX Designer):**Design a checkout flow for our SaaS product where: (1) annual billing is pre-selected with "BEST VALUE" badge and the monthly option is visually de-emphasized (smaller font, no badge); (2) the checkout button reads "Start Your Journey" instead of "Subscribe" or "Pay"; (3) the price displayed on the checkout page shows the monthly equivalent of the annual price (e.g., "$8/month"), with the annual total only visible in fine print; and (4) the post-purchase email says "Your subscription is active" without stating the charge amount or billing period.

> **Protocol note — Handbrake not activated**: This analysis contains 3 🟠 High findings, but they span **two independent domains** — UX/Design (pre-selection dark pattern, misleading CTA) and Legal/Compliance (FTC disclosure, GDPR transparency). Each domain independently has <3 High findings. The Handbrake threshold (3+ High in the *same single domain*) is not met. The ⚡ Immediate Report fired correctly for the first High finding.

---

## ⚡ IMMEDIATE REPORT — 🟠 High Finding

**Finding**: The combination of pre-selected option + misleading "per-month" pricing that hides the actual annual charge + non-descriptive CTA ("Start Your Journey") constitutes a dark pattern that violates FTC disclosure requirements and GDPR transparency obligations.
**Domain**: UX / Legal
**Why immediate**: Dark pattern checkout flows are under active FTC enforcement (2023–2024 actions against subscription services). The hidden annual total and vague CTA are the specific mechanics the FTC's 2024 negative option rule targets.
**Risk if not addressed**: FTC enforcement, consumer complaints, forced redesign, and — critically — erosion of user trust that causes higher long-term churn than an honest checkout would.

---
### 🔍 Context Needed

1. **Price presentation**: Is the full annual charge (e.g., "$96/year") displayed anywhere on the checkout page before the user clicks the CTA — or only in fine print after scrolling?
2. **Pre-selection intent**: Is the annual pre-selection designed to increase annual conversions by default, or to make the annual plan appear to be the "normal" choice?
3. **Regulatory markets**: Does this product serve EU or UK customers where UCPD and CMA unfair commercial practices regulations apply?

---
Reply: 📝 [answers] to raise confidence | `continue` to proceed at worst-case score

*(Context provided: "Annual total is in fine print below the fold. Yes, annual pre-selection is to drive annual plan conversions. US + EU + UK markets.")*

---

# 🟠 Devil's Advocate Analysis: Subscription Checkout UX Flow

**Analyzed**: 2026-02-20
**Skill version**: 2.9.0
**Scope**: UX / Legal — SaaS subscription checkout flow; US, EU, UK markets

---

## 📊 Executive Summary

**Overall Risk Rating**: 🟠 High

**Key Findings**:
1. Annual charge hidden below the fold — FTC requires "clear and conspicuous" disclosure of total charge before the CTA
2. Non-descriptive CTA ("Start Your Journey") violates FTC negative option rule's requirement that the CTA affirmatively state it triggers a charge
3. Pre-selected annual plan is a dark pattern (confirmshaming / trick question) — legal under careful design but risky without accessibility review
4. Post-purchase email without charge amount violates GDPR Art. 7 transparency and US state subscription law (ROSCA)

**Recommendation**: ⚠️ Revise — the pricing display and CTA require changes before this flow ships. The annual pre-selection can remain with proper disclosure.

**Analysis Confidence**: 🟢 High — team confirmed annual total below fold; US + EU + UK markets confirmed

---

## ✅ Strengths (What Works Well)

1. **Plan comparison is present** — showing both monthly and annual side by side gives users a real choice; this is the right foundation
2. **"BEST VALUE" badge on annual plan** — transparent value communication is acceptable and not a dark pattern when the actual prices are clearly shown
3. **Separate monthly option visible** — it exists; the problem is the de-emphasis, not its absence

---

## ❌ Weaknesses (What Could Fail)

### 🟠 High-Priority Issues

1. **Annual total charge not disclosed clearly before CTA — FTC "clear and conspicuous" violation**
   - **Risk**: FTC Negative Option Rule (2024, §425.4) requires: "Disclose clearly and conspicuously... the total amount and frequency of charges" before the consumer gives billing information or confirms the transaction
   - **Impact**: "Clear and conspicuous" = above the fold, near the CTA, in readable font — not fine print below the fold. This specific mechanic was cited in the FTC's 2024 actions
   - **Likelihood**: High — the current design has the annual total below the fold
   - **Mitigation**: Show the full annual charge prominently near the CTA:
     ```
     ✅ "$8/month, billed annually as $96/year"
     ❌ "$8/month" [fine print: "billed as $96/year" below the fold]
     ```

2. **Non-descriptive CTA — "Start Your Journey" does not communicate a charge**
   - **Risk**: FTC §425.4(d) requires the CTA to "affirmatively consent to the negative option feature" — the button must make clear that clicking it initiates a recurring charge
   - **Impact**: "Start Your Journey" could be the button to start a free trial — it does not communicate that clicking it charges the user $96
   - **Likelihood**: High — this is specifically mentioned in the FTC's guidance examples
   - **Mitigation**: CTA must describe the action: "Subscribe — $96/year" or "Start Annual Plan" or "Pay $96 and Subscribe"

3. **Post-purchase email omits charge amount and billing period**
   - **Risk**: ROSCA (Restore Online Shoppers' Confidence Act) requires post-transaction confirmation to include: the goods/services, the amount charged, and contact information. GDPR Art. 13 requires data subjects to receive this information at collection
   - **Impact**: UK/EU regulators can fine for failure to provide clear purchase confirmation with amount
   - **Mitigation**: Post-purchase email must state: "You've subscribed to [Product] Annual Plan at $96/year. Your next billing date is [date]."

### 🟡 Medium-Priority Issues

1. **Annual pre-selection without a clear "monthly" alternative — WCAG 3.3.2 (Labels or Instructions)**
   - **Risk**: Pre-selected options must have an accessible label that makes it unambiguous the selection was made on the user's behalf, not chosen by the user
   - **Mitigation**: Add "(pre-selected)" or a visible indicator that annual was selected by default; ensure keyboard users can change this selection easily

2. **Monthly option in smaller font / de-emphasized — Cognitive Load risk**
   - **Risk**: De-emphasizing the cheaper option via visual hierarchy creates a misleading choice architecture. Dark pattern researchers classify this as "visual interference"
   - **Impact**: Users who intend to subscribe monthly accidentally select annual; higher refund requests; reduced trust
   - **Mitigation**: Both options should be legible at the same font size; differentiation through "badge" is acceptable, font size reduction is not

3. **Price framing ("$8/month") without context is misleading for screen reader users**
   - **Risk**: Screen readers will announce "$8/month" without reading the fine print annual total — the accessible name of the plan does not convey the full cost
   - **Mitigation**: `aria-label` for the annual plan should read: "Annual plan, $96 per year, equivalent to $8 per month" — not just "$8/month"

4. **No error state for payment failure designed**
   - **Risk**: If the payment fails, what does the user see? A generic error? A specific message? This is unspecified in the proposal
   - **Mitigation**: Design the failed payment state: clear message, retry option, support contact, no accidental double-charge on retry

---

## ⚠️ Assumptions Challenged

| Assumption | Challenge | Evidence | Risk if wrong |
|---|---|---|---|
| "Per-month pricing is standard" | Standard only when the annual total is equally prominent | FTC 2024 guidance: both must be "clear and conspicuous" | FTC enforcement |
| "'Start Your Journey' is inspiring" | Inspiring ≠ transparent. FTC requires the CTA to communicate the charge | FTC §425.4(d) CTA requirements | Dark pattern finding |
| "Pre-selected annual increases conversions" | True in short term; but refunds + chargebacks from confused users erode the gain | Baymard Institute: unexpected charges = #1 cart abandonment reason post-purchase | Net negative conversion effect |
| "Fine print is legal" | "Fine print" is specifically prohibited by "clear and conspicuous" doctrine | FTC Act §5; FTC endorsement and testimonial guides; 2024 negative option rule | Enforcement action |

---

## 🎯 Edge Cases & Failure Modes

| Scenario | What Happens | Handled? | Risk | Fix |
|----------|-------------|----------|------|-----|
| User sees "$8/month", expects $8 charge, gets $96 charge | Chargeback; refund demand; review bomb | ❌ No | High | Prominent annual total before CTA |
| Screen reader user gets "$8/month" without annual context | Inaccessible purchase decision | ❌ No | Medium | `aria-label` with full annual price |
| FTC test purchase documents the hidden annual total | Primary evidence in enforcement action | ❌ No | High | Fix disclosure before launch |
| Monthly-intending user clicks on annual pre-selection without noticing | Locked into annual; refund request | ⚠️ Partial (monthly option exists) | Medium | Increase monthly option visibility |
| Payment fails; user retries; double-charged | Chargeback + trust loss | ❌ No design | Medium | Design idempotent payment retry flow |

---

## ✅ Compliant Design Pattern

```
┌─────────────────────────────────────────────┐
│  Choose Your Plan                           │
│                                             │
│  ┌──────────────────┐  ┌────────────────┐  │
│  │ ● ANNUAL  ★BEST   │  │ ○ MONTHLY      │  │
│  │   VALUE          │  │                │  │
│  │  $8/month        │  │  $12/month     │  │
│  │  Billed as $96/yr│  │  Billed monthly│  │
│  └──────────────────┘  └────────────────┘  │
│                                             │
│  You will be charged: $96.00 today          │  ← clear and conspicuous
│  Renews annually. Cancel anytime.           │
│                                             │
│  [  Subscribe — $96/year  ]                 │  ← CTA states action and amount
└─────────────────────────────────────────────┘
```

---

## ✅ Recommendations

### Must Fix (Before launch — FTC/GDPR compliance)
- [ ] Add "$96/year" (full annual charge) prominently above the CTA — same visual weight as the "$8/month" figure
- [ ] Change CTA from "Start Your Journey" to "Subscribe — $96/year" or equivalent action-describing text
- [ ] Update post-purchase email to include: plan name, total charged, billing frequency, next billing date, and cancellation path

### Should Fix (Before launch — UX quality)
- [ ] Increase monthly option font to same size as annual option; differentiate via badge only, not font reduction
- [ ] Add `aria-label` to annual plan option that includes full annual price for screen reader users
- [ ] Design payment failure state with clear error message and idempotent retry

### Recommended Validation
- [ ] WCAG 2.1 AA automated check (axe, Lighthouse) before launch
- [ ] Usability test with 5 users: "Which plan were you charged for and how much?" — goal is 100% accuracy
- [ ] Legal review of final design copy before launch

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
