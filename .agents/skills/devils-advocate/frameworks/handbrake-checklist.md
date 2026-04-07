# Handbrake Decision Checklist

> A rapid structured sweep to determine whether the Handbrake should activate. Run this internally whenever a finding might be Critical.

---

## Should the Handbrake activate?

Answer each question. One YES → activate the Handbrake.

| # | Question | YES → Handbrake |
|---|----------|----------------|
| 1 | Is the risk **irreversible** if the plan proceeds? (deleted data, deployed code, force-pushed history) | ✅ Activate |
| 2 | Could this cause **production failure or data loss** within one release cycle? | ✅ Activate |
| 3 | Does this involve **PII, financial data, or regulated information** without a verified compliance path? | ✅ Activate |
| 4 | Is the finding in a **domain where the analyst lacks authoritative expertise** (e.g., legal, security crypto, AI alignment)? | ✅ Activate |
| 5 | Are there **3 or more High-priority findings in the same domain** that compound each other? | ✅ Activate |
| 6 | Does the plan **assume something that has not been verified** and cannot be safely assumed? | ✅ Activate |
| 7 | Is there **no known mitigation** for the Critical finding within the scope of the current plan? | ✅ Activate |
| 8 | Would proceeding **silently degrade trust, security posture, or system integrity** in a way that's hard to detect? | ✅ Activate |

---

## If Handbrake activates — minimum steps

1. **Identify the responsible role** → use the escalation map in `handbrake-protocol.md`
2. **Select the context template** for that domain → ask 3–6 targeted questions
3. **Wait for answers** before completing the full report
4. **Run pre-mortem** using `premortem.md` (Step 6 of the Handbrake — free protocol file)
5. **Re-score all risks** after incorporating context
6. **Resume** → full Devil's Advocate report → Gate prompt

---

## If Handbrake bypassed — mandatory disclosure

```
⚠️ HANDBRAKE BYPASSED
The following critical finding was NOT reviewed by the responsible specialist:
- [Finding]: [Domain] — [Risk summary]

Proceeding without this context increases the risk of undetected production failure.
This bypass is visible in the conversation history.
```

The Gate still applies after a bypass. The bypass skips specialist context only — it does **not** reduce the severity rating or remove the finding from the report.

---

*Part of the [Devil's Advocate](https://github.com/carrilloapps/skills) skill · MIT · [carrillo.app](https://carrillo.app)*
