# Compliance Standards Reference

> *Domain framework — counts toward the 2-framework-per-assessment budget.*
>
> Load this framework when the assessment requires the **full expanded reference** or lesser-known standards (ISA/IEC 62443, FedRAMP, FIPS 140-3, etc.). The agent can map findings to well-known standards (OWASP, CWE, NIST, ISO 27001, PCI-DSS, GDPR, MITRE ATT&CK) from training knowledge without loading this file. Load it when the target operates under specific regulatory requirements or when the Standard Selection Guide is needed for precise mapping.

## Minimum Required Baseline

The following standards represent the **minimum required baseline** for every SAR — they are explicitly not exhaustive. The agent must also apply any additional standards, frameworks, regulations, or industry-specific best practices that its cybersecurity expertise identifies as relevant to the specific assessment context.

Map every finding to all applicable standards and justify each selection.

| Standard          | Domain                                                                       |
|-------------------|------------------------------------------------------------------------------|
| ISO/IEC 27001     | ISMS establishment, implementation, certification                            |
| ISO/IEC 27002     | Security controls catalog and best practices                                 |
| NIST CSF          | Identify · Protect · Detect · Respond · Recover                              |
| NIST SP 800-53    | Comprehensive security & privacy controls                                    |
| CIS Controls (SANS Top 20) | Prioritized defensive actions — software inventory, vulnerability management, application security (v8: 18 control categories) |
| COBIT             | IT governance aligned with business objectives                               |
| OWASP Top 10      | Critical web & API security risks                                            |
| SOC 2             | Service provider data security (Trust Services Criteria)                    |
| ISO/IEC 27017     | Cloud-specific information security controls                                 |
| CSA STAR          | Cloud provider security posture assessment and certification                 |
| FedRAMP           | US government cloud authorization standard                                   |
| PCI-DSS           | Payment card data protection                                                 |
| HIPAA             | Healthcare data confidentiality and integrity                                |
| SOX               | Financial IT controls and electronic records integrity                       |
| ISA/IEC 62443     | OT/ICS cybersecurity for industrial automation and critical infrastructure   |
| GDPR              | EU personal data privacy and security by design                              |
| ISO/IEC 27701     | Privacy Information Management System (PIMS), extends ISO 27001             |
| FIPS 140-3        | Cryptographic module security validation                                     |
| MITRE ATT&CK      | Threat modeling via real-world adversary tactics and techniques              |
| NIST SP 800-171   | Protecting Controlled Unclassified Information (CUI)                        |
| CWE/MITRE Top 25  | Most dangerous software weaknesses — mandatory CWE mapping for every finding |

## Expanded Standards Reference

These descriptions provide the full context for when and why each standard applies. They are the minimum expected knowledge base for the agent:

- **ISO/IEC 27001**: Used to establish, implement, and certify an Information Security Management System (ISMS) at the organizational level.
- **ISO/IEC 27002**: Serves as a detailed catalog of security controls and best practices to implement the requirements of ISO 27001.
- **NIST CSF (Cybersecurity Framework)**: Used to understand, manage, and reduce cybersecurity risks based on five core functions: Identify, Protect, Detect, Respond, and Recover.
- **NIST SP 800-53**: Provides an exhaustive catalog of security and privacy controls, originally used by the US government but adopted globally for its rigor.
- **CIS Controls (SANS Top 20)**: A prioritized guide of defensive actions (formerly known as SANS Top 20, now CIS Controls v8 with 18 control categories) to protect against the most common cyberattacks. For dependency and supply chain security, the most relevant controls are: CIS 2 (Inventory and Control of Software Assets), CIS 7 (Continuous Vulnerability Management), CIS 16 (Application Software Security), and CIS 18 (Penetration Testing).
- **COBIT**: Used for corporate IT governance, aligning security and technology objectives with business objectives.
- **OWASP Top 10**: The de facto standard used by development teams to identify and mitigate the 10 most critical security risks in web applications and APIs.
- **SOC 2 (Type 2)**: Used to audit and demonstrate that a service provider (e.g., SaaS) securely manages customer data based on the Trust Services Criteria: security, availability, processing integrity, confidentiality, and privacy.
- **ISO/IEC 27017**: Provides information security controls specific to the use and provision of cloud computing services.
- **CSA STAR**: Used to evaluate and certify the security posture of cloud service providers.
- **FedRAMP**: The mandatory standard for evaluating and authorizing cloud products and services intended for use by US government agencies.
- **PCI-DSS**: Strictly mandatory for protecting cardholder data during processing, storage, and transmission in payment gateways and merchants.
- **HIPAA**: Used in the healthcare sector (primarily in the US, but as a global reference) to protect the confidentiality and integrity of patient medical information.
- **SOX (Sarbanes-Oxley)**: A financial law whose IT provisions enforce strict controls over electronic records and prevent corporate fraud.
- **ISA/IEC 62443**: Used to ensure cybersecurity in industrial automation and control systems (OT/ICS), protecting critical infrastructure such as power plants and factories.
- **GDPR**: The European regulation (and global gold standard) used to guarantee the privacy and protection of citizens' personal data, requiring security by design.
- **ISO/IEC 27701**: An extension of ISO 27001 used to establish a Privacy Information Management System (PIMS).
- **FIPS 140-3**: Used to validate and certify the security level of cryptographic modules (hardware or software) that protect sensitive information.
- **MITRE ATT&CK**: A technical knowledge base used for threat modeling, simulating the real tactics and techniques used by cybercriminals to attack networks.
- **NIST SP 800-171**: Used to protect Controlled Unclassified Information (CUI) residing in contractor and non-governmental institution networks.
- **CWE/MITRE Top 25**: The 25 most dangerous software weaknesses as catalogued by MITRE. Every finding in the SAR must include its corresponding CWE identifier(s). This list captures the most frequent and critical programming errors that lead to exploitable vulnerabilities — including injection (CWE-89, CWE-78, CWE-79), broken access control (CWE-862, CWE-863, CWE-22), authentication failures (CWE-287, CWE-306), deserialization (CWE-502), SSRF (CWE-918), and hardcoded credentials (CWE-798). Dependency CVEs must be cross-referenced to their CWE classification.

## Standard Selection Guide

When mapping findings to standards, use this decision flow:

| If the finding involves... | Always map to... | Also consider... |
|---------------------------|-----------------|-----------------|
| Web application vulnerability | OWASP Top 10, CIS Controls | NIST SP 800-53 |
| Cloud misconfiguration | ISO 27017, CSA STAR | FedRAMP (if US gov) |
| Personal data exposure | GDPR, ISO 27701 | HIPAA (if healthcare) |
| Payment data | PCI-DSS | SOX (if financial) |
| Access control failure | ISO 27001, NIST CSF | SOC 2 |
| Cryptographic weakness | FIPS 140-3 | NIST SP 800-53 |
| Industrial control system | ISA/IEC 62443 | NIST CSF |
| Threat modeling needed | MITRE ATT&CK | NIST SP 800-53 |
| Government / CUI data | NIST SP 800-171, FedRAMP | ISO 27001 |
| Vulnerable dependency / outdated package | OWASP Top 10 (A06), CWE/MITRE Top 25, CIS Controls (2, 7) | NIST SP 800-53 |
| Supply chain integrity (unsigned, unpinned, unverified) | OWASP Top 10 (A08), CIS Controls (2, 16) | NIST CSF |
| Integrated skill/plugin with excessive permissions | CWE/MITRE Top 25 (CWE-269, CWE-862), OWASP Top 10 (A01) | ISO 27001 |
| Any code-level finding | CWE/MITRE Top 25 (map to specific CWE ID) | OWASP Top 10 |
