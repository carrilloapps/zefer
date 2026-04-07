# Example: Public Cloud Storage Bucket with Sensitive Data

> *Reference output — load on demand when assessing cloud storage configurations (S3, GCS, Azure Blob).*
>
> ⚠️ **Example only** — All patterns, IaC descriptions, and configuration references below are synthetic illustrations of vulnerable configurations and correct SAR output. They are not real infrastructure and must not be executed or deployed.

## Scenario

A cloud storage bucket is configured with public read access and contains user uploads, database backups, and application logs.

**Finding location:**

- **File**: `terraform/s3.tf` — infrastructure-as-code definition for the storage bucket
- **Issue**: Bucket ACL allows public read access, no public-access-block resource defined, no encryption, no versioning, no access logging
- **Bucket policy**: Grants object-read access to any unauthenticated user (wildcard principal) on all objects in the bucket
- **Pattern reference**: See `storage-exfiltration.md` — Cloud Object Storage table for detection signatures

## Assessment Trace

1. **IaC scan**: Infrastructure-as-code definition configures the bucket with public-read ACL and no public-access-block resource.
2. **Policy analysis**: Bucket policy grants object-read access to a wildcard principal on all objects — any unauthenticated user can download any file.
3. **Bucket contents**: Contains three prefixes:
   - `uploads/` — user-uploaded documents (IDs, contracts, personal files)
   - `backups/` — daily database dumps with customer PII
   - `logs/` — application logs containing authentication tokens and API keys in error traces
4. **Encryption**: No server-side encryption configuration — data stored unencrypted.
5. **Access logging**: No access logging configured — no audit trail of who accessed what.
6. **Frontend exposure**: Bucket name hardcoded in `src/config/storage.ts` and visible in client-side code.

## SAR Finding

### [97] — Public S3 Bucket Containing PII, Database Backups, and Application Secrets

- **Description**: Production cloud storage bucket is publicly readable via ACL and bucket policy (principal set to wildcard). The bucket contains user-uploaded personal documents, database backups with customer PII, and application logs with authentication tokens and API keys. No encryption at rest, no access logging.
- **Affected Component(s)**: `terraform/s3.tf`, bucket policy, `src/config/storage.ts`
- **Evidence**: Backup prefix accessible without authentication (HTTP 200). Policy allows any unauthenticated user to read all objects. ACL permits public read. No encryption. No access logging.
- **Standards Violated**: OWASP Top 10 (A01:2021 Broken Access Control, A02:2021 Cryptographic Failures), GDPR Art. 32 (data protection), PCI-DSS Req. 3 & 7 (if payment data in backups), ISO 27001 A.8, A.10 (asset management, cryptography), NIST SP 800-53 AC-3, SC-28, AU-2, SOC 2 CC6.1, CC6.7, CSA STAR CCM DSI-04
- **MITRE ATT&CK**: T1530 (Data from Cloud Storage Object), T1552.005 (Cloud Instance Metadata API — if credentials in logs)
- **Score**: **97** (Critical) — public access, PII confirmed, database backups accessible, secrets in logs, no encryption, no audit trail.
- **Suggested Mitigation Actions**:
  1. **Emergency (within hours)**:
     - Enable public-access-block at the account level
     - Remove wildcard principal from bucket policy
     - Set ACL to private
  2. **Immediate (within 24h)**:
     - Enable server-side encryption on the bucket
     - Rotate all signing keys and API keys found in log files
     - Rotate database credentials (visible in backup contents)
  3. **Short-term**:
     - Enable access logging and cloud audit trail data events
     - Enable versioning and delete protection
     - Move database backups to a separate, private bucket with cross-account access only
     - Remove bucket name from frontend code — use pre-signed URLs generated server-side
  4. **Medium-term**:
     - Implement malware scanning on uploads
     - Add data loss prevention scanning for PII in uploaded documents
     - Set up automated alerts for public bucket configuration changes

## Key Principles Demonstrated

- **Data classification**: Distinguished between user uploads, backups, and logs — each with different risk profiles
- **Multiple violation mapping**: Mapped to 7 standards with justification
- **Tiered remediation**: Emergency → immediate → short-term → medium-term timeline
- **Collateral impact**: Identified cascading risks (credential rotation needed from exposed logs)

## Cross-Reference

- All cloud storage patterns → see [`frameworks/storage-exfiltration.md`](../frameworks/storage-exfiltration.md)
- Compliance standards → see [`frameworks/compliance-standards.md`](../frameworks/compliance-standards.md)
- Scoring system → see [`frameworks/scoring-system.md`](../frameworks/scoring-system.md)
