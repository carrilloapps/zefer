# Data Analytics & Data Engineering Risks Framework

> **Role**: Data Engineer / Data Analyst / Data Scientist / Analytics Engineer
> **Load when**: Reviewing data pipelines, ML models, analytics solutions, data contracts, warehouse/lake design, or any solution involving data collection, processing, storage, or reporting.

---

## Data Pipeline Risks

### ❌ Reliability & Correctness

```
❌ No Data Freshness SLA
- Pipeline runs but no guarantee on when data is available
- Dashboards show stale data with no staleness indicator
- Downstream teams unaware of delays without monitoring

❌ Silent Data Quality Failures
- Null values in non-nullable columns silently accepted
- Aggregation queries return wrong results due to duplicate rows
- No row-count or checksum validation between source and target

❌ No Idempotent Pipeline
- Re-running a failed pipeline creates duplicate records
- Backfills cause double-counting in aggregations
- No deduplication key or upsert strategy

❌ Schema Drift
- Source schema changes break downstream consumers silently
- JSON without schema enforcement (any payload accepted)
- No data contract between producer and consumer
- ALTER TABLE on production table causes downstream failures
```

### ❌ Data Quality

```
❌ Missing Data Quality Checks
- No null checks, range validation, or referential integrity tests
- Anomaly detection not in place (sudden drops/spikes not alerted)
- No expectation framework (dbt tests, Great Expectations, Soda)

❌ Garbage In, Garbage Out
- Raw data ingested without validation at source
- Business definitions not enforced at ingestion layer
- Metrics calculated differently across teams (revenue means different things)

❌ Duplicate Records
- No deduplication in streaming ingestion
- Event-at-least-once delivery not handled idempotently
- Change Data Capture (CDC) replays cause duplicates on retry

❌ Late-Arriving Data Not Handled
- Watermark too aggressive; late events discarded
- Backfills not supported or cause full-table rewrites
- Time-zone issues in event timestamps (UTC vs local)
```

---

## Governance & Compliance Risks

### ❌ PII & Sensitive Data

```
❌ PII in Raw Tables Without Masking
- Emails, names, SSNs, payment info in unmasked columns
- Analysts can query PII without role-based access control
- No audit log of who queried sensitive data

❌ Right to Erasure Not Implemented
- No mechanism to delete a user's data across all tables/partitions
- Event logs immutable with PII embedded (Kafka, S3)
- GDPR Article 17 / CCPA deletion requests cannot be fulfilled

❌ Data Retention Policy Not Enforced
- Data retained indefinitely with no TTL or archiving policy
- Logs containing PII kept for years without need
- Regulatory maximum retention period exceeded

❌ Cross-Border Data Transfer Risk
- Data from EU users stored in US without SCCs or adequacy decision
- No data residency controls in multi-region deployments
- Third-party analytics tools receive raw PII
```

### ❌ Access Control

```
❌ Over-Privileged Analysts
- All analysts have read access to all tables including PII
- No column-level security on sensitive fields
- Service accounts have write access to production tables

❌ No Row-Level Security
- Analysts can query all customers' data regardless of their scope
- Multi-tenant data stored in same tables without tenant isolation
- Reports expose competitor or cross-customer data
```

---

## ML / AI Model Risks

### ❌ Training Data Risks

```
❌ Data Leakage
- Future information in training features (target encoded with future labels)
- Train/test split not temporal for time-series problems
- Validation set contaminated by preprocessing on full dataset

❌ Sampling Bias
- Training data not representative of production distribution
- Over/under-represented demographic groups in dataset
- Selection bias: only successful outcomes in training data (survivorship bias)

❌ Label Quality
- Labels created from proxy metrics that don't match real objective
- Class imbalance not addressed (95% negative, 5% positive)
- Label noise from human annotators not audited
```

### ❌ Model Deployment Risks

```
❌ No Model Monitoring
- Model deployed with no drift detection
- Distribution shift in production inputs not detected
- Model performance degradation only noticed months later

❌ No Rollback Strategy
- No shadow mode or canary deployment for model releases
- Rollback requires full redeploy from scratch
- A/B test infrastructure not in place

❌ Explainability & Fairness Gaps
- Black-box model in high-stakes decision (credit, hiring, health)
- No fairness analysis across protected attributes
- No explanation provided to affected users (GDPR Art. 22)

❌ Training-Serving Skew
- Feature computation differs between training and serving
- Online feature store not consistent with offline training data
- Preprocessing steps not captured in pipeline artifact
```

---

## Analytics & Reporting Risks

### ❌ Metric Definition Problems

```
❌ Metric Inconsistency Across Teams
- Revenue, MAU, and conversion defined differently per team
- No single source of truth (semantic layer / metrics layer)
- Finance and Product report different numbers for the same KPI

❌ Vanity Metrics Without Guardrails
- Optimizing for CTR without tracking downstream quality
- Engagement metric rises but satisfaction falls
- No counter-metrics to detect negative side effects

❌ Attribution Model Errors
- Last-touch attribution misrepresents marketing channel value
- Multi-touch attribution not validated
- Double-counting conversions in funnel analysis
```

### ❌ Warehouse & Lake Design

```
❌ No Medallion / Layering Architecture
- Raw, cleansed, and aggregated data mixed in same layer
- Analysts query raw tables directly and apply ad-hoc transformations
- No documented lineage from source to report

❌ Uncontrolled Table Proliferation
- Analysts create personal tables in production schemas
- 500+ tables with no ownership, no documentation
- Duplicate tables for the same concept owned by different teams

❌ Partition & Clustering Strategy Missing
- Full table scans on multi-TB tables for every query
- No partition pruning; all queries scan all partitions
- No clustering on common filter columns
```

---

## Data Contract Checklist

Every data producer→consumer relationship should be validated:

```markdown
- [ ] Is the schema version-controlled and documented?
- [ ] Are nullability, data types, and value ranges specified?
- [ ] Is there a compatibility policy (backward / forward / full)?
- [ ] Is there an SLA on freshness and availability?
- [ ] Is there an owner responsible for schema changes?
- [ ] Is there a breaking-change migration process and notice period?
- [ ] Are consumers notified of schema changes before they are deployed?
```

---

## Data Quality Validation Checklist

```markdown
### Completeness
- [ ] Are all expected rows present (row count vs source)?
- [ ] Are there unexpected nulls in required columns?
- [ ] Are all time partitions populated (no missing dates)?

### Accuracy
- [ ] Do totals match source system reconciliation?
- [ ] Are numeric ranges within expected bounds?
- [ ] Are categorical values from a controlled vocabulary?

### Consistency
- [ ] Are the same metrics computed consistently across models?
- [ ] Are timestamps in a consistent timezone (UTC)?
- [ ] Are foreign keys referentially valid?

### Timeliness
- [ ] Does data arrive within the SLA window?
- [ ] Is late-arriving data handled correctly?
- [ ] Are stale data alerts in place?

### Uniqueness
- [ ] Are deduplication keys defined and enforced?
- [ ] Is the primary key constraint validated on load?
- [ ] Are idempotent upserts used instead of blind inserts?
```
