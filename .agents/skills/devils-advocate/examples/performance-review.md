# Example Devil's Advocate Analysis: Performance — N+1 Query in Cart Pricing API

> ⚠️ **EDUCATIONAL EXAMPLE — NOT FOR IMPLEMENTATION.** This file contains a fictional API implementation with a deliberate N+1 query anti-pattern, used solely to demonstrate how Devil's Advocate identifies performance risks on hot paths. All code, endpoints, and infrastructure details are fictional.

> 🔍 **Adversarial analysis example.** The proposal below is intentionally flawed — it contains an N+1 query pattern that would cause database connection pool exhaustion at production scale.

> **Original proposal (from Developer):**Add real-time pricing to the shopping cart API. For each item in the cart, call `getProductPrice(productId)` which executes a `SELECT price, discount FROM products WHERE id = ?` query. The cart can have up to 50 items. This will be called on every cart page render and every checkout initiation.

---

## ⚡ IMMEDIATE REPORT — 🟠 High Finding

**Finding**: The proposed implementation executes one database query per cart item, creating an N+1 query pattern that will degrade linearly with cart size and could generate 50+ sequential queries per API call on a hot path called on every cart page render.
**Domain**: Code / Performance
**Why immediate**: N+1 queries on hot paths are invisible in development (single-item test carts) but catastrophic at production scale. This will not be caught by unit tests; it will be discovered during load testing or — worse — during a peak traffic event.
**Risk if not addressed**: API response time degrades from ~20ms (single item) to 1000ms+ (50 items) under normal conditions; under concurrent load, database connection pool exhaustion triggers cascading failures across all services sharing the database.

---
### 🔍 Context Needed

1. **Database connection pool size**: What is the max connection pool size for this service? How many concurrent requests can it handle before exhausting the pool?
2. **Cart size distribution**: What is the P95 cart size in production? What is the maximum cart size allowed by the system?
3. **Call frequency**: How often is this endpoint called per minute at peak traffic? Is it called on every keystroke/update or only on explicit "view cart" actions?
4. **Caching infrastructure**: Is there a cache (Redis, Memcached) available for product pricing data? Are prices static or updated frequently?

---
Reply: 📝 [answers] to raise confidence | `continue` to proceed at worst-case score

*(Context provided: "DB pool: 20 connections shared with 3 other services. P95 cart size: 8 items; max allowed: 50. Endpoint called on every cart page render (~800 req/min at peak). Redis is available. Prices update daily via a batch job.")*

---

# 🟠 Devil's Advocate Analysis: Shopping Cart Pricing API — N+1 Query

**Analyzed**: 2026-02-20
**Skill version**: 2.9.0
**Scope**: Performance / Code — cart pricing API; N+1 query on hot path; 800 req/min peak; 20 shared DB connections

---

## 📊 Executive Summary

**Overall Risk Rating**: 🟠 High

**Key Findings**:
1. N+1 query pattern: 800 requests/min × P95 8 items = 6,400 DB queries/min at peak from one endpoint alone — on a 20-connection shared pool
2. At P95 load, each API call triggers 8 sequential queries; at worst-case (50 items), 50 sequential queries per request
3. Database connection pool exhaustion at peak will cause timeout failures across all 3 services sharing the pool
4. Redis is available and prices update only daily — a cache-first approach eliminates the DB calls entirely for pricing

**Recommendation**: ⚠️ Revise — the fix (batch query + Redis cache) is straightforward and takes less time to implement than debugging a production DB connection exhaustion incident.

**Analysis Confidence**: 🟢 High — team confirmed pool size, P95 cart size, peak rate, and Redis availability

---

## ✅ Strengths (What Works Well)

1. **Separation of concerns** — `getProductPrice()` as a dedicated function is the right abstraction; the problem is how it's called, not that it exists
2. **Real-time pricing goal is valid** — showing accurate prices per item is correct product behavior
3. **Redis infrastructure exists** — the fix does not require new infrastructure; it uses existing tooling

---

## ❌ Weaknesses (What Could Fail)

### 🟠 High-Priority Issues

1. **N+1 query pattern on a high-frequency hot path**

   **Math at current scale:**
   - Peak: 800 requests/min = 13.3 requests/second
   - P95 cart size: 8 items → 8 queries per request = 106 DB queries/second from this endpoint alone
   - Worst case (50 items): 667 DB queries/second from this endpoint alone
   - Shared pool: 20 connections / 3 services → ~6 connections available to this service
   - At 106 queries/sec, each query must complete in ≤ 56ms to avoid pool starvation — any spike breaks this

   **Impact**: DB connection pool exhaustion → timeout errors cascade across all 3 services sharing the pool — not just the cart service

   **Mitigation**: Replace N+1 with a single batch query:

   ```typescript
   // ❌ N+1 — one query per item
   async function getCartPrices(cartItems: CartItem[]): Promise<PriceMap> {
     const prices: PriceMap = {}
     for (const item of cartItems) {
       prices[item.productId] = await getProductPrice(item.productId)  // N queries
     }
     return prices
   }

   // ✅ Single batch query — O(1) queries regardless of cart size
   async function getCartPrices(cartItems: CartItem[]): Promise<PriceMap> {
     const productIds = cartItems.map(item => item.productId)
     const rows = await db.query(
       'SELECT id, price, discount FROM products WHERE id = ANY($1)',
       [productIds]
     )
     return Object.fromEntries(rows.map(row => [row.id, { price: row.price, discount: row.discount }]))
   }
   ```

2. **Prices change daily via batch job — Redis cache eliminates all DB calls for pricing**

   **Opportunity**: Prices are stable for 24 hours. A Redis cache with a 1-hour TTL means:
   - Cache hit rate: ~99% at steady state (prices don't change between renders)
   - DB queries for pricing: reduced from 6,400/min to ~64/min (cache misses only)
   - Cart response time: ~2ms (Redis) vs. 20–200ms (DB per query)

   ```typescript
   // ✅ Cache-first with batch DB fallback
   const PRICE_CACHE_TTL_SECONDS = 3600  // 1 hour — safe given daily batch updates

   async function getCartPrices(cartItems: CartItem[]): Promise<PriceMap> {
     const productIds = cartItems.map(item => item.productId)
     const cacheKeys = productIds.map(id => `product:price:${id}`)

     // Try Redis first (batch mget — one round trip)
     const cached = await redis.mget(...cacheKeys)
     const priceMap: PriceMap = {}
     const missingIds: string[] = []

     for (let i = 0; i < productIds.length; i++) {
       if (cached[i]) {
         priceMap[productIds[i]] = JSON.parse(cached[i])
       } else {
         missingIds.push(productIds[i])
       }
     }

     // DB fallback for cache misses only (single batch query)
     if (missingIds.length > 0) {
       const rows = await db.query(
         'SELECT id, price, discount FROM products WHERE id = ANY($1)',
         [missingIds]
       )
       const pipeline = redis.pipeline()
       for (const row of rows) {
         priceMap[row.id] = { price: row.price, discount: row.discount }
         pipeline.setex(`product:price:${row.id}`, PRICE_CACHE_TTL_SECONDS, JSON.stringify(priceMap[row.id]))
       }
       await pipeline.exec()
     }

     return priceMap
   }
   ```

### 🟡 Medium-Priority Issues

1. **No timeout on individual DB queries**
   - **Risk**: If the DB is slow (disk pressure, lock contention), the N+1 pattern chains slow queries — a 200ms query × 50 items = 10 seconds blocked
   - **Mitigation**: Set query timeout: `SET statement_timeout = '200ms'` in the query context; return a stale cached price if the DB is slow (fail open, not fail closed)

2. **No monitoring on DB connection pool utilization**
   - **Risk**: Pool exhaustion is invisible until requests start timing out — no leading indicator metric exists today
   - **Mitigation**: Expose `pool.totalCount`, `pool.idleCount`, `pool.waitingCount` as Prometheus metrics; alert if `waitingCount > 0` for > 30 seconds

3. **Price cache invalidation on batch job execution not handled**
   - **Risk**: If the daily batch job updates prices at 2am, cached prices from before the batch will be served until TTL expires (up to 1 hour stale)
   - **Mitigation**: Batch job publishes a cache invalidation event (e.g., Redis keyspace notification or a Pub/Sub message) to flush affected keys when prices change; or use a TTL aligned with the batch window

---

## ⚠️ Assumptions Challenged

| Assumption | Challenge | Evidence | Risk if wrong |
|---|---|---|---|
| "Works fine in development" | Dev has 1–3 item carts; production P95 is 8; max is 50 | N+1 is invisible at dev scale | Discovered first in production during peak |
| "20 DB connections is plenty" | Shared across 3 services + N queries per request = pool exhaustion | Math: 800 req/min × 8 queries = 6,400 queries/min / 6 available connections | Cascading timeout failures across all 3 services |
| "DB queries are fast enough" | "Fast enough" at 1 item ≠ fast enough at 50 items in sequence | Sequential N queries cannot be parallelized in this design | Linear degradation with cart size |
| "Redis is for sessions, not product data" | Redis is suitable for any hot read-heavy data with a known TTL | Product prices: ~100 bytes, updated once daily, read thousands of times | Unused infrastructure solving a solved problem |

---

## 🎯 Edge Cases & Failure Modes

| Scenario | What Happens | Handled? | Risk | Fix |
|----------|-------------|----------|------|-----|
| Cart with 50 items, peak traffic | 50 sequential queries per request; pool exhaustion | ❌ No | High | Batch query + cache |
| DB slow (lock contention during batch job) | All cart renders blocked for duration of batch | ❌ No | High | Cache-first; DB timeout; stale fallback |
| Redis unavailable | Cache-first falls through to DB; load spike | ⚠️ If fallback is implemented | Medium | Circuit breaker on Redis; fallback to batch DB |
| Price updated mid-TTL | Users see old price until cache expires | ⚠️ Acceptable if documented | Low | Cache invalidation on batch job; or TTL = batch frequency |
| Parallel requests for same product flood DB | Cache stampede on cold start | ❌ No | Medium | Probabilistic early expiry or lock-based cache fill |

---

## ⚡ Performance Projections

| Approach | Queries per request (P95) | Response time (P95) | DB queries/min (peak) |
|----------|--------------------------|--------------------|-----------------------|
| ❌ Current (N+1) | 8 sequential | ~180ms | 6,400 |
| ✅ Batch query only | 1 | ~25ms | 800 |
| ✅ Cache + batch fallback | 0 (cache hit) / 1 (miss) | ~3ms / ~25ms | ~8 (1% miss rate) |

---

## ✅ Recommendations

### Must Fix (Before production)
- [ ] Replace the N+1 loop with a single batch `WHERE id = ANY($1)` query
- [ ] Implement Redis cache-first with batch DB fallback (code above)
- [ ] Set query timeout (200ms) on DB pricing queries

### Should Do (This sprint)
- [ ] Add DB connection pool utilization metrics (Prometheus)
- [ ] Add cache invalidation step to the daily price batch job

### Recommended Tests
- [ ] Load test with P95 cart size (8 items) at 800 req/min: verify DB query count ≤ 800/min
- [ ] Worst-case test with 50-item cart: verify single query executed, response time ≤ 50ms
- [ ] Cache failure test: verify graceful DB fallback when Redis is unavailable

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
