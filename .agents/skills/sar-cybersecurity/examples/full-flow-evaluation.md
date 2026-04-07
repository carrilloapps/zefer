# Example: Full Flow Evaluation — Apparently Insecure Endpoint

> *Reference output — load on demand when an endpoint appears unprotected at code level but may be secured upstream.*
>
> ⚠️ **Example only** — All code snippets below are synthetic illustrations of vulnerable patterns and correct SAR output. They are not real code and must not be executed.

## Scenario

A route appears to lack authentication upon direct code inspection.

```typescript
// src/payments/payments.controller.ts — line 15
@Controller('payments')
export class PaymentsController {
  // No @UseGuards, no AuthMiddleware visible

  @Get('history')
  async getPaymentHistory(@Query('userId') userId: string) {
    return this.paymentsService.getHistory(userId);
  }
}
```

No guard, middleware, or decorator is visible on the controller or route.

## Assessment Trace

1. **Code-level check**: No `@UseGuards()`, no `AuthMiddleware`, no JWT decorator. Appears unprotected.
2. **Module-level check**: `payments.module.ts` does not apply middleware in `configure()`.
3. **Global middleware check**: `main.ts` applies `helmet()` and `cors()`, but no global auth guard.
4. **Infrastructure check**: Kubernetes ingress manifest (`k8s/ingress.yaml`) routes `/payments/*` through an **OAuth2 proxy** sidecar that validates JWT tokens before traffic reaches the pod.
5. **API gateway check**: AWS API Gateway configuration requires a Lambda authorizer on all `/payments/*` routes.
6. **Conclusion**: Authentication is enforced at infrastructure layer (OAuth2 proxy + API Gateway authorizer). The endpoint is protected end-to-end.

## SAR Finding

### [30] — Missing Application-Layer Authentication on Payment History Endpoint

- **Description**: `GET /payments/history` has no application-level authentication guard. Authentication is enforced exclusively by the infrastructure layer (OAuth2 proxy + API Gateway authorizer). If the infrastructure configuration changes or the service is deployed outside the current environment, the endpoint becomes fully exposed.
- **Affected Component(s)**: `src/payments/payments.controller.ts:15`, `k8s/ingress.yaml`, API Gateway configuration
- **Evidence**: No `@UseGuards()` in code; OAuth2 proxy sidecar in K8s manifest; Lambda authorizer in API Gateway.
- **Standards Violated**: OWASP Top 10 (A01:2021 Broken Access Control — defense-in-depth gap), ISO 27001 A.9 (Access Control), NIST SP 800-53 AC-3
- **MITRE ATT&CK**: T1078 (Valid Accounts) — risk if infrastructure auth is bypassed
- **Score**: **30** (Low/Warning) — currently protected by upstream infrastructure, but violates defense-in-depth principle.
- **Suggested Mitigation Actions**:
  1. Add application-level `@UseGuards(JwtAuthGuard)` as defense-in-depth
  2. Add IDOR protection: verify `req.user.id === userId` before returning payment data
  3. Document the infrastructure dependency explicitly in the service's README

### Alternate Outcome — If Truly Unprotected

If the trace had found **no infrastructure-level protection**:

- **Score**: **92** (Critical) — payment data accessible without any authentication
- **Standards**: OWASP A01, PCI-DSS Req. 7 & 8, GDPR Art. 32, SOC 2 CC6.1
- **MITRE ATT&CK**: T1190 (Exploit Public-Facing Application)
- **Immediate action**: Block the endpoint or add emergency auth middleware

## Key Principles Demonstrated

- **Full flow evaluation**: Traced from code → module → global → infrastructure → API gateway
- **Net effective security**: Score reflects actual posture, not isolated code appearance
- **Defense-in-depth recommendation**: Even when protected, recommends additional application-layer guard

## Cross-Reference

- Compliance standards for access control → see [`frameworks/compliance-standards.md`](../frameworks/compliance-standards.md)
- Scoring decision flow → see [`frameworks/scoring-system.md`](../frameworks/scoring-system.md)
