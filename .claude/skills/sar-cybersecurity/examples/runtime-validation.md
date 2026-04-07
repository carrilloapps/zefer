# Example: Runtime Validation Without Formal Structure

> *Reference output — load on demand when analyzing inputs with ad-hoc validation logic.*
>
> ⚠️ **Example only** — All code snippets below are synthetic illustrations of vulnerable patterns and correct SAR output. They are not real code and must not be executed.

## Scenario

No `Pipe`, `Guard`, `Validator class`, `Transformer`, or `Schema` object exists for an input, but inline logic effectively prevents unauthorized access or injection.

```typescript
// src/users/users.controller.ts — line 82
@Post('update-profile')
async updateProfile(@Body() body: any, @Req() req: Request) {
  // No ValidationPipe, no DTO, no class-validator
  const name = typeof body.name === 'string' ? body.name.trim().slice(0, 100) : '';
  const bio = typeof body.bio === 'string' ? body.bio.trim().slice(0, 500) : '';

  if (!name) throw new BadRequestException('Name is required');

  return this.usersService.update(req.user.id, { name, bio });
}
```

The inline checks effectively prevent injection and enforce constraints, but there is no formal validation layer.

## Assessment Trace

1. **Entry point**: `POST /update-profile` — authenticated route (JWT guard at controller level).
2. **Input handling**: `body.name` and `body.bio` are type-checked, trimmed, and truncated inline. Only these two fields are destructured — mass assignment is not possible.
3. **Database query**: `usersService.update()` uses Mongoose `findByIdAndUpdate` with only the explicit `{ name, bio }` object — no raw body passthrough.
4. **Conclusion**: Risk is mitigated at runtime, but the mitigation is not testable, auditable, or reusable.

## SAR Finding

### [38] — Absence of Formal Validation Layer on Profile Update

- **Description**: `POST /update-profile` lacks a `ValidationPipe`, DTO class, or schema validator. Inline type checks and truncation effectively prevent injection, but this pattern is fragile and not auditable.
- **Affected Component(s)**: `src/users/users.controller.ts:82`
- **Evidence**: `typeof body.name === 'string' ? body.name.trim().slice(0, 100) : ''` — effective but inline.
- **Standards Violated**: OWASP Top 10 (A03:2021 Injection — partial mitigation), ISO 27001 A.14 (secure development lifecycle)
- **Score**: **38** (Low/Warning) — mitigated at runtime, downgraded from medium per scoring adjustment rule.
- **Suggested Mitigation Actions**:
  1. Create a `UpdateProfileDto` with `class-validator` decorators
  2. Apply `@UsePipes(new ValidationPipe({ whitelist: true }))` to the endpoint
  3. Remove inline validation and trust the pipe / DTO layer
  4. Add unit tests for the DTO validation rules

## Key Principles Demonstrated

- **Mitigation acknowledgment**: Inline logic is effective — score reflects reality, not theoretical severity
- **Warning range**: 25–49 for mitigated risks
- **Improvement path**: Recommends formal replacement without overstating urgency

## Cross-Reference

- Mass assignment patterns → see [`frameworks/injection-patterns.md`](../frameworks/injection-patterns.md)
- Scoring adjustments → see [`frameworks/scoring-system.md`](../frameworks/scoring-system.md)
