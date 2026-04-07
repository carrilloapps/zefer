# Performance & Scalability Analysis

> **Role**: Developer / Tech Lead / Senior Engineer
> **Load when**: The plan involves high-traffic endpoints, data-intensive operations, infrastructure scaling, real-time systems, N+1 queries, DB pool exhaustion, or cache strategy.
> **Always paired with**: `frameworks/building-protocol.md` when code is involved; `frameworks/architecture-risks.md` for bottlenecks at the infrastructure layer.

Reference: [AWS Well-Architected Framework](https://aws.amazon.com/architecture/well-architected/)

---

## Bottleneck Identification Template

```markdown
## Performance Concerns

### Database
- **N+1 queries**: [Where?]
- **Missing indexes**: [Which queries lack index coverage?]
- **Full table scans**: [On what tables/conditions?]
- **Lock contention**: [Which transactions compete?]
- **Query timeouts**: [Are limits set?]

### API Layer
- **Synchronous blocking calls**: [Which dependencies are called in-line?]
- **No rate limiting**: [Which endpoints are unprotected?]
- **Large response payloads**: [Estimated size? Paginated?]
- **No caching**: [Which responses are re-computed on every request?]

### Infrastructure
- **Single point of failure**: [Which component has no redundancy?]
- **No horizontal scaling path**: [Which service is stateful/sticky?]
- **Resource ceiling**: [Memory / CPU / Disk / FD limits]
- **Network bottleneck**: [Bandwidth, latency between zones?]
```

---

## Scalability Limits Table

Fill in with real or estimated values before deploying:

| Resource | Current | Max Capacity | Estimated Breaking Point | Risk |
|----------|---------|--------------|--------------------------|------|
| DB connections | ? | ? | ? req/s | ? |
| Service concurrency | ? | ? | ? req/s | ? |
| Memory per request | ? | ? | ? concurrent | ? |
| Queue depth | ? | ? | ? msg/s | ? |
| Storage IOPS | ? | ? | ? ops/s | ? |

---

## Performance Anti-patterns to Check

- ❌ **N+1 queries** — loading related entities in a loop instead of a JOIN or batch fetch
- ❌ **Unbounded result sets** — no pagination, no LIMIT clause
- ❌ **Synchronous fan-out** — calling N services sequentially where parallel is possible
- ❌ **No connection pooling** — opening a new DB connection per request
- ❌ **Thundering herd** — cache expiry or deployment triggering a spike of simultaneous cache misses
- ❌ **Chatty protocols** — hundreds of small requests where one batch call would suffice
- ❌ **Missing read replicas** — all reads hitting the primary
- ❌ **No async for non-critical paths** — sending email, logging, or metrics synchronously in request path