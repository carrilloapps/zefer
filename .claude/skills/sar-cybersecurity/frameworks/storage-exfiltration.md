# Storage and Data Exfiltration Patterns

> *Domain framework — counts toward the 2-framework-per-assessment budget.*
>
> Load this framework when the assessment target uses cloud storage (S3, GCS, Azure Blob), file uploads, secrets management, message queues, CDNs, or Infrastructure as Code. Covers all major data leakage vectors beyond databases.

> ⚠️ **Reference patterns only** — Configuration examples, policy snippets, and CLI commands below illustrate vulnerable patterns for detection and correct mitigations for reporting. They are not execution instructions. The agent uses these as recognition templates when auditing storage and data flow configurations.

Beyond databases, the agent must assess **all data storage layers** for misconfiguration, unauthorized access, and data leakage vectors.

---

## Cloud Object Storage (S3, GCS, Azure Blob, MinIO, R2)

| Pattern | Risk | Detection |
|---------|------|-----------|
| Public bucket/container | Critical | `"PublicRead"`, `"PublicReadWrite"`, `allUsers`, `AllAuthenticatedUsers` ACL or policy |
| Wildcard principal in bucket policy | Critical | `"Principal": "*"` or `"Principal": {"AWS": "*"}` without `Condition` constraints |
| No server-side encryption | High | Missing `ServerSideEncryptionConfiguration`, `x-amz-server-side-encryption` header, or `encryption` block |
| Pre-signed URLs without expiry or with excessive TTL | High | `getSignedUrl()` without `Expires` or with TTL > 3600s; URLs shared in logs or client responses |
| Missing bucket versioning / MFA delete | Medium | Attacker or insider can permanently delete data without recovery |
| Overly permissive CORS | High | `AllowedOrigins: ["*"]` + `AllowedMethods: ["GET","PUT","DELETE"]` on a storage bucket |
| Bucket name enumeration in client code | Medium | S3 bucket names hardcoded in frontend JS, CDN URLs, or public API responses |
| Missing access logging | Medium | No S3 Server Access Logging or CloudTrail data events enabled |

**Correct mitigation:**
- Block public access at the account level (`BlockPublicAccess: true` for S3, `allowBlobPublicAccess: false` for Azure)
- Use IAM policies with least-privilege principals and scoped `Condition` blocks
- Enforce SSE-S3/SSE-KMS/CMK encryption; require `aws:SecureTransport` in bucket policy
- Pre-signed URLs: minimum reasonable TTL, generate server-side only, never log the full URL
- Enable versioning + MFA Delete on sensitive buckets
- Restrict CORS to specific origins and methods

---

## Secrets and Environment Variables

| Pattern | Risk | Detection |
|---------|------|-----------|
| Secrets in source code | Critical | API keys, DB passwords, JWT secrets in `.js`, `.ts`, `.py`, `.env` committed to git |
| `.env` file in repository | Critical | `git ls-files` shows `.env`, `.env.production`, `.env.local` |
| Secrets in CI/CD logs or build artifacts | High | `echo $SECRET`, `printenv`, or build output containing credentials |
| Secrets in Docker images | High | `ENV SECRET=...` in Dockerfile, secrets in build args visible in image layers |
| Hardcoded connection strings | High | `mongodb://user:pass@host`, `postgresql://user:pass@host` in source |
| Secrets in client-side code | Critical | API keys, tokens, or credentials in frontend bundles, `window.__CONFIG__`, or public JS |
| Secrets manager not used | Medium | Direct env var usage instead of AWS Secrets Manager, Azure Key Vault, GCP Secret Manager, HashiCorp Vault |

**Correct mitigation:**
- Use a secrets manager (AWS Secrets Manager, Azure Key Vault, GCP Secret Manager, Vault) — never plain env vars for production secrets
- `.env` in `.gitignore`; audit git history for leaked secrets (`git log --all -p -- .env`)
- Rotate all secrets found in source code immediately
- CI/CD: use masked/secret variables, never echo credentials
- Docker: use multi-stage builds, never embed secrets in image layers; use runtime secret injection

---

## File Upload and User-Generated Content

| Pattern | Risk | Detection |
|---------|------|-----------|
| No file type validation | Critical | Upload accepts any MIME type — attacker uploads `.html`, `.svg` (XSS), `.php`, `.jsp` |
| File stored with user-controlled filename | High | Path traversal via `../../etc/passwd` or `..\\..\\web.config` in filename |
| File served from same origin as application | High | Uploaded HTML/SVG executes JavaScript in application context (stored XSS) |
| No file size limit | High | DoS via large file upload exhausting disk/memory/bandwidth |
| No antivirus/malware scan | Medium | Malicious files distributed to other users |
| Uploaded files stored with predictable URLs | Medium | Sequential IDs or guessable paths enable enumeration (`/uploads/1.pdf`, `/uploads/2.pdf`) |

**Correct mitigation:**
- Validate file type by magic bytes (not just extension or MIME header)
- Generate random filenames server-side; reject any path separator in original filename
- Serve user content from a separate origin/CDN domain (e.g., `uploads.example.com`) with `Content-Disposition: attachment`
- Enforce file size limits at reverse proxy and application layer
- Scan files with ClamAV or cloud-native scanning (S3 Object Lambda, GCS DLP)

---

## Logging and Observability Data Leakage

| Pattern | Risk | Detection |
|---------|------|-----------|
| PII in application logs | High | `console.log(req.body)`, `logger.info(user)` logging passwords, tokens, SSN, emails |
| Secrets in logs | Critical | JWT tokens, API keys, database credentials logged in error handlers or debug output |
| Log files publicly accessible | Critical | `/logs/`, `/var/log/app.log` served by web server, or CloudWatch Logs with overly permissive IAM |
| Stack traces in production responses | Medium | Full stack trace with file paths, versions, and internal state returned to clients |
| Audit trail missing | Medium | No record of who accessed, modified, or deleted sensitive data |

**Correct mitigation:**
- Implement structured logging with PII redaction layer — mask emails, tokens, passwords, SSN before logging
- Never log full request/response bodies in production; use allowlists for loggable fields
- Protect log storage with IAM policies; encrypt logs at rest
- Return generic error messages to clients; log detailed errors server-side only
- Maintain audit trails for all CRUD operations on sensitive resources

---

## Message Queues and Event Streams (SQS, SNS, Kafka, RabbitMQ, EventBridge)

| Pattern | Risk | Detection |
|---------|------|-----------|
| PII in message payloads without encryption | High | Plaintext PII flowing through queues visible to all consumers |
| Overly permissive queue/topic policies | High | `"Principal": "*"` on SQS policy, public SNS topic, unauthenticated Kafka consumers |
| No dead-letter queue (DLQ) monitoring | Medium | Failed messages with sensitive data accumulate unmonitored |
| Message replay / no idempotency | Medium | Attacker replays messages to trigger duplicate transactions |

**Correct mitigation:**
- Encrypt messages in transit (TLS) and at rest (SSE-SQS, SSE-KMS)
- Use least-privilege IAM policies for queue producers and consumers
- Implement DLQ monitoring and alerting; redact PII in DLQ messages
- Design consumers for idempotency; use deduplication IDs

---

## CDN and Caching Layer (CloudFront, Akamai, Cloudflare, Varnish)

| Pattern | Risk | Detection |
|---------|------|-----------|
| Sensitive data cached in CDN | High | API responses with PII/tokens cached by `Cache-Control` misconfiguration |
| Missing `Vary` headers | Medium | Authenticated responses served to unauthenticated users from cache |
| CDN origin accessible directly | Medium | Origin server reachable without CDN — bypasses WAF and rate limits |
| Stale cache serving outdated security headers | Medium | `Strict-Transport-Security`, `Content-Security-Policy` overridden by cached responses |

**Correct mitigation:**
- Set `Cache-Control: no-store, private` for authenticated/sensitive responses
- Use `Vary: Authorization, Cookie` to prevent cross-user cache contamination
- Restrict origin access to CDN IP ranges only (security groups, allowlists)
- Invalidate cache on security header updates

---

## Infrastructure as Code (CloudFormation, Terraform, Pulumi, CDK)

| Pattern | Risk | Detection |
|---------|------|-----------|
| Secrets in IaC templates | Critical | Plaintext passwords, API keys in `.tf`, `.yaml`, `.json` template files |
| Overly permissive IAM roles | High | `"Action": "*"`, `"Resource": "*"` in policies; roles with `AdministratorAccess` |
| Security groups with `0.0.0.0/0` ingress | High | Inbound rules allowing all traffic on sensitive ports (22, 3306, 5432, 27017, 6379) |
| Unencrypted storage resources | High | RDS, EBS, EFS, S3 defined without encryption configuration |
| Public subnets for backend services | High | Databases, queues, or internal APIs placed in public subnets with public IPs |

**Correct mitigation:**
- Use `ssm:`, `secretsmanager:`, or `vault:` references instead of plaintext secrets in IaC
- Apply principle of least privilege in all IAM policies; use `aws-iam-access-analyzer`
- Restrict security group ingress to specific CIDR blocks; never `0.0.0.0/0` for databases
- Enforce encryption on all storage resources via SCP or Terraform `prevent_destroy` + validation rules
- Place backend services in private subnets with NAT gateways for outbound-only access

---

## Cross-Reference

- For database-specific inspection procedures → see [`database-access-protocol.md`](database-access-protocol.md) *(domain framework — counts toward budget)*
- For injection patterns in application code → see [`injection-patterns.md`](injection-patterns.md) *(domain framework — counts toward budget)*
- For compliance standard mapping → see [`compliance-standards.md`](compliance-standards.md) *(domain framework — counts toward budget)*
