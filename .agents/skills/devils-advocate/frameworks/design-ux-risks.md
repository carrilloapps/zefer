# Design & UX Risks Framework

Load this file when analyzing UI/UX designs, design system decisions, user flows, information architecture, or interaction patterns. Applicable roles: UX Designer, Product Designer, Product Manager, Tech Lead.

---

## 1. Dark Patterns & Ethical Design Risks

Dark patterns are design choices that manipulate users into actions they did not intend. They carry legal risk (FTC, CMA, EU DSA) and destroy long-term trust.

```
❌ Consent & Privacy Dark Patterns
   - Confirmshaming: "No thanks, I don't want to save money" opt-out labels
   - Pre-ticked checkboxes for newsletter or data sharing consent
   - Cookie consent with "Accept All" prominent and "Reject All" buried or absent
   - Privacy settings requiring multiple steps to opt out vs. one click to opt in

❌ Subscription & Payment Dark Patterns
   - Roach motel: easy to subscribe, intentionally difficult to cancel
   - Hidden costs revealed only at final checkout step
   - Free trial that auto-converts to paid without a prominent reminder
   - Disguised ads styled identically to organic content without clear labeling

❌ Urgency & Scarcity Manipulation
   - Fake countdown timers that reset on reload
   - False scarcity ("Only 2 left!" when inventory is not actually limited)
   - Pressure messaging that implies consequences for inaction that do not exist

❌ Misdirection & Trick Questions
   - Double negatives in consent options ("Uncheck to not receive...")
   - Interface interference: disabling the back button or trapping focus
   - Forced continuity: requiring credit card for a "free" trial with no reminder before charge
```

---

## 2. Accessibility Failure Modes (WCAG 2.1)

Accessibility is both a legal requirement in many jurisdictions and a quality signal. Failures affect 15–20% of users globally.

### Perceivable
```
❌ Visual
   - Color contrast ratio below 4.5:1 for normal text, 3:1 for large text (AA standard)
   - Information conveyed by color alone (no icon or text alternative)
   - Images without alt text, or decorative images with non-empty alt text
   - Text embedded in images (cannot be resized or read by screen readers)

❌ Audio / Video
   - Video without captions or transcript
   - Audio-only content without a text alternative
   - Auto-playing media with no control to pause or stop
```

### Operable
```
❌ Keyboard Navigation
   - Interactive elements not reachable by Tab key
   - No visible focus indicator (outline removed via CSS without replacement)
   - Keyboard trap: focus enters a component and cannot escape
   - Custom widgets (dropdowns, modals, carousels) without keyboard support

❌ Motion & Timing
   - Animations with no option to reduce motion (prefers-reduced-motion not respected)
   - Session timeout with insufficient warning or no way to extend
   - Moving content that cannot be paused
```

### Understandable
```
❌ Language & Readability
   - Page language not declared (lang attribute missing)
   - Reading level significantly above the target audience without justification
   - Jargon or abbreviations without explanation on first use

❌ Predictability
   - Focus change on input (selecting an option in a dropdown navigates the page automatically)
   - Inconsistent navigation: same element has different labels or positions across pages
   - Error messages that do not identify the field in error or explain how to fix it
```

### Robust
```
❌ Compatibility
   - ARIA roles misused (e.g., role="button" on a div without keyboard event handlers)
   - Form inputs without associated labels (for/id pairing missing)
   - Status messages not exposed to assistive technology (aria-live missing)
```

---

## 3. Cognitive Load & Usability Risks

```
❌ Information Architecture
   - More than 7 ± 2 items in a navigation menu without grouping
   - Category labels that are meaningful to the business but not to users
   - Search as the only wayfinding mechanism (users who don't know the exact term are lost)
   - Breadcrumbs absent on deep nested pages

❌ Decision Overload
   - Too many options presented simultaneously without progressive disclosure
   - Choice paralysis at a critical conversion step (pricing pages with too many tiers)
   - Required fields that collect data the user doesn't understand why you need

❌ Mental Model Mismatches
   - Terminology that differs from the user's domain vocabulary
   - Interaction pattern that contradicts OS or platform convention (e.g., swipe direction, pull-to-refresh)
   - Destructive actions that do not require confirmation and cannot be undone
   - Visual hierarchy that does not reflect actual task priority
```

---

## 4. Error State & Edge Case Design Failures

```
❌ Error Messages
   - Generic error: "Something went wrong" with no actionable next step
   - Technical error codes exposed to end users (HTTP 500, NullPointerException)
   - Inline validation that triggers only on submit, not during or after field completion
   - Error messages that blame the user ("You entered an invalid value")

❌ Empty States
   - Empty state with no explanation of how to populate it (blank screen on first use)
   - Empty state that looks identical to a loading state (no distinction between "loading" and "no data")
   - Search with no results and no suggestion, filter hint, or alternative path

❌ Loading & Async States
   - No loading indicator for operations taking > 300ms
   - No skeleton screen or placeholder for content that loads progressively
   - Button that can be clicked multiple times during an async operation (double-submit)
   - Progress indicator that does not reflect actual progress (fake 99% hang)

❌ Offline & Degraded States
   - No offline message — app appears broken with no explanation
   - Data entered by the user lost when connectivity drops
   - No retry mechanism after a failed request
```

---

## 5. Trust & Credibility Risks

```
❌ First Impression
   - Broken images, placeholder content, or lorem ipsum visible on any path to production
   - Inconsistent visual language (mixed font scales, color tokens, spacing units)
   - Design that is inconsistent with the brand established on marketing/landing pages

❌ Data & Social Proof
   - Unverified or fabricated testimonials and ratings
   - Review counts that are suspiciously round or never change
   - "As seen in" logos that are out of date or unauthorized

❌ Security Signals
   - No HTTPS lock indicator or HTTPS forced on all pages collecting personal data
   - Payment form that looks different from the rest of the site (hosted field mismatch)
   - No clear privacy policy link at the point of data collection
   - Permission requests (camera, location) without explanation of why they are needed
```

---

## 6. Internationalization (i18n) & Localization Risks

```
❌ Layout & Text
   - Fixed-width containers that break with longer translated strings (German, Finnish are ~30% longer than English)
   - Right-to-left (RTL) layout not implemented or not tested (Arabic, Hebrew, Farsi)
   - Hardcoded strings not extracted to translation files

❌ Formats & Conventions
   - Dates in MM/DD/YYYY format shown to users in DD/MM/YYYY regions
   - Currency amounts without locale-specific formatting (comma vs. period as decimal separator)
   - Phone number fields that reject international formats
   - Name fields that assume Western name order (given name first, family name last)

❌ Cultural Sensitivity
   - Icons or imagery with culture-specific connotations used globally (e.g., thumbs up, OK sign)
   - Color choices with strong cultural meanings (red = danger in the West; red = luck in China)
   - Humor or idioms that do not translate and may cause confusion or offense
```

---

## 7. Mobile & Cross-Platform Risks

```
❌ Touch Targets
   - Tap targets smaller than 44×44px (Apple HIG) or 48×48dp (Material Design)
   - Interactive elements too close together (< 8px gap) causing mis-taps

❌ Responsive Behavior
   - Desktop-only layout that does not adapt (horizontal scroll on mobile)
   - Hover-dependent interactions with no touch equivalent
   - Fixed positioning elements that cover content on small screens (sticky headers + keyboards)

❌ Performance Perception
   - Images not optimized for mobile bandwidth
   - No lazy loading for below-the-fold content
   - Core interaction requires JavaScript with no graceful degradation
```

---

## Design Review Checklist

Before sign-off on any design, verify:

**Ethical**
- [ ] No dark patterns present in the flow
- [ ] Consent is explicit, informed, and easy to withdraw
- [ ] Urgency and scarcity claims are accurate

**Accessible**
- [ ] Color contrast passes AA (4.5:1 text, 3:1 large text)
- [ ] All interactive elements are keyboard reachable
- [ ] All images have meaningful alt text
- [ ] Error messages identify the problem and the fix

**Usable**
- [ ] Empty, loading, error, and offline states are all designed
- [ ] Destructive actions require confirmation
- [ ] Flow has been tested with real users (or explicit rationale why not)

**Compliant**
- [ ] Applicable regulations identified (GDPR, WCAG, COPPA, etc.)
- [ ] Legal review requested for consent flows and data collection
