# Security Policy

## Supported Versions

| Version | Supported |
|---------|-----------|
| Latest (`main`) | Yes |

## Reporting a Vulnerability

**Please do not open a public issue for security vulnerabilities.**

If you discover a security vulnerability in Zefer, please report it responsibly:

1. **GitHub Security Advisory** (preferred): [Report a vulnerability](https://github.com/carrilloapps/zefer/security/advisories/new)
2. **Email**: [m@carrillo.app](mailto:m@carrillo.app)
3. **Telegram**: [@carrilloapps](https://t.me/carrilloapps)

### What to include

- Description of the vulnerability
- Steps to reproduce
- Affected component (e.g., `crypto.ts`, `zefer.ts`, `DecryptForm.tsx`)
- Potential impact (data exposure, encryption bypass, etc.)
- Suggested fix (if applicable)

### Response timeline

- **Acknowledgment**: Within 48 hours
- **Initial assessment**: Within 7 days
- **Fix release**: As soon as possible, depending on severity

### Scope

The following are in scope:

- Cryptographic weaknesses (AES-256-GCM, PBKDF2-SHA256 implementation)
- Key derivation flaws
- Authentication bypass (secret question, dual key, reveal key)
- Information leakage from the public header
- XSS, injection, or other OWASP Top 10 vulnerabilities
- Privacy violations (unintended data transmission)

The following are **out of scope** (by design, documented in [docs/SECURITY.md](docs/SECURITY.md)):

- `localStorage` attempt tracking bypass (client-side friction, not a guarantee)
- Expiration bypass via system clock manipulation
- IP restriction bypass via JavaScript modification or VPN
- Browser memory inspection during active session

## Security Architecture

Zefer is a 100% client-side encryption tool. No plaintext, passphrases, or encryption keys ever leave the browser.

| Primitive | Algorithm | Parameters |
|-----------|-----------|------------|
| Symmetric encryption | AES-256-GCM | 256-bit key, 96-bit IV, 128-bit auth tag |
| Key derivation | PBKDF2-SHA256 | 300k/600k/1M iterations, 256-bit salt |
| Answer hashing | PBKDF2-SHA256 | 100,000 iterations |
| Random generation | `crypto.getRandomValues` | OS-level CSPRNG |

For the full threat model, see [docs/SECURITY.md](docs/SECURITY.md).

## Acknowledgments

We appreciate responsible disclosure. Contributors who report valid vulnerabilities will be credited in the project (with permission).
