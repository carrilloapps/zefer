# Architecture Risks Framework

> **Role**: Software Architect / Tech Lead / CTO
> **Load when**: Reviewing system design, proposing new components, evaluating architectural patterns, planning integrations, or making structural decisions that are hard to reverse.

---

## Architecture Anti-Patterns

### ❌ Distributed Systems

```
❌ Distributed Monolith
- Services deployed independently but tightly coupled at data/logic level
- Any change requires coordinated deployment of multiple services
- Single shared database across multiple services

❌ Chatty Microservices
- Multiple synchronous HTTP calls per user request
- No aggregation layer; frontend calls 10+ services
- Latency compounds: 10 services × 50ms = 500ms baseline

❌ Synchronous Where Async Is Safer
- Long-running operations block the caller
- No queue/worker pattern for jobs > 2 seconds
- Cascading failures when one service is slow

❌ Missing Idempotency
- Retried requests cause duplicate side-effects (double charges, double emails)
- No idempotency keys on POST endpoints
- Message consumers not idempotent (duplicates processed)
```

### ❌ Coupling & Cohesion

```
❌ Shared Database Anti-Pattern
- Two or more services read/write the same tables directly
- Schema changes require coordinating multiple teams
- Impossible to change data model independently

❌ Implicit Service Contracts
- Services share DTOs or model objects across package boundaries
- No versioned API contract (OpenAPI/AsyncAPI/Protobuf)
- Breaking change in one service silently breaks consumers

❌ God Service
- One service handles all business logic for a domain
- 50+ endpoints, 100k+ lines, no clear bounded context
- Impossible to scale or deploy parts independently

❌ Circular Dependencies
- Service A calls B, B calls C, C calls A
- No clear ownership or direction of dependency
- Deadlock risk under load
```

### ❌ Data Architecture

```
❌ No Schema Evolution Strategy
- No migration plan for in-flight events when schema changes
- Breaking changes pushed to Kafka/queue without consumer migration
- JSON without schema validation (any shape accepted)

❌ Missing Event Sourcing Considerations
- Mutable state without audit trail
- No ability to replay events to reconstruct state
- No projection/read-model strategy for query performance

❌ Synchronous Saga Without Compensation
- Multi-step distributed transaction with no rollback
- Step 3 fails but steps 1 and 2 already committed
- No compensating transactions defined
```

### ❌ API Design

```
❌ Anemic REST (CRUD ≠ Domain)
- APIs expose DB tables directly
- No domain operations (e.g., only GET/POST Order, no PlaceOrder/CancelOrder)
- Business logic leaks into clients

❌ Missing API Versioning
- Breaking changes deployed to /api/endpoint without version
- All clients break on next deploy
- No deprecation policy or sunset headers

❌ No Rate Limiting / Throttling
- Public endpoints with no request limits
- One client can starve all others
- No backpressure mechanism

❌ Chatty Pagination / Missing Cursor
- Offset pagination on large datasets (slow for page 500+)
- No cursor-based pagination for real-time feeds
- No max page size enforcement
```

### ❌ Observability Gaps

```
❌ No Distributed Tracing
- Requests span multiple services but no correlation ID
- Cannot reconstruct end-to-end request path
- No trace ID propagated through queues

❌ Metrics Without Context
- CPU/memory metrics but no business metrics
- No SLI/SLO defined (latency p99, error rate, availability)
- Alerts on symptoms not causes (disk full, not "order processing stopped")

❌ Silent Failures
- Errors swallowed in catch blocks with no logging
- Dead letter queue not monitored
- Background jobs fail silently for hours
```

---

## CAP Theorem Checklist

For any distributed data store or partition:

```markdown
| Question | Answer | Implication |
|----------|--------|-------------|
| Is network partition possible? | Yes (always assume yes) | Must choose CP or AP |
| What happens on split-brain? | ? | Data inconsistency or unavailability |
| Is eventual consistency acceptable? | ? | AP: higher availability, stale reads |
| Do we need strong consistency? | ? | CP: lower availability, no stale reads |
| What is our consistency model? | ? | Linearizable / Sequential / Eventual |
| How do we handle conflict resolution? | ? | Last-write-wins / CRDT / Manual merge |
```

---

## Architecture Decision Records (ADR) Gaps

**Every major architectural decision should have an ADR. Check for:**

```markdown
- [ ] Is this decision documented with context, options considered, and rationale?
- [ ] Are the trade-offs explicitly stated?
- [ ] Is the decision reversible or irreversible (Type 1 vs Type 2)?
- [ ] Who is the decision owner and who was consulted?
- [ ] What triggers would cause us to revisit this decision?
- [ ] Are the consequences (positive and negative) tracked?
```

---

## Event-Driven Architecture Risks

```markdown
| Risk | Symptom | Mitigation |
|------|---------|------------|
| Message ordering lost | Events processed out of sequence | Partition by entity ID |
| Schema drift | Consumer fails on new field | Schema registry + backward compat |
| Consumer lag explosion | Queue grows unbounded | Lag monitoring + auto-scaling |
| Poison pill message | Consumer crash-loops | Dead letter queue + alert |
| Exactly-once semantics missing | Duplicate processing | Idempotent consumers + deduplication key |
| Event without correlation ID | Cannot trace end-to-end | Propagate trace ID in event headers |
| No event replay capability | Cannot recover from consumer bug | Retention policy + offset reset plan |
```

---

## Service Mesh & Infrastructure Concerns

```markdown
❌ No Circuit Breaker
- Downstream failure causes upstream to queue indefinitely
- No fallback behavior defined
- Timeout not set (or too long)

❌ No Bulkhead Pattern
- One slow downstream consumes all thread pool capacity
- Failure in non-critical service takes down critical path
- No resource isolation between workloads

❌ Hardcoded Service Discovery
- Services call each other via hardcoded IPs or hostnames
- No service registry or DNS-based discovery
- Blue/green or canary deployment impossible

❌ No Graceful Degradation
- Feature fails hard when dependency is unavailable
- No cached fallback or reduced-functionality mode
- All-or-nothing behavior with no partial response
```

---

## Architecture Review Checklist

```markdown
### Structural
- [ ] Are bounded contexts clearly defined?
- [ ] Does each service own its data (no shared DB)?
- [ ] Are service contracts versioned and documented?
- [ ] Is there a dependency graph with no circular dependencies?

### Resilience
- [ ] Is there a circuit breaker on every synchronous external call?
- [ ] Are retries bounded with exponential backoff and jitter?
- [ ] Is there a timeout on every I/O operation?
- [ ] Are bulkheads in place to isolate failure domains?

### Observability
- [ ] Is there end-to-end distributed tracing with correlation IDs?
- [ ] Are SLIs and SLOs defined and monitored?
- [ ] Are dead letter queues monitored with alerts?
- [ ] Can you reconstruct a complete request timeline post-incident?

### Data
- [ ] Is there a schema evolution strategy (backward/forward compatibility)?
- [ ] Are events replayable for at least the retention window?
- [ ] Are compensating transactions defined for distributed workflows?

### Operations
- [ ] Can you deploy a single service without downtime?
- [ ] Can you roll back a deployment in < 5 minutes?
- [ ] Is there a runbook for every alert?
- [ ] Can you scale horizontally without re-architecture?
```
