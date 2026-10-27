# Security

## Report privately

Please **do not disclose vulnerabilities in a public issue**, especially reports containing personal information, access tokens, browser data or exploit details.

Use **[GitHub private vulnerability reporting](https://github.com/DeFexNN/vos-bud-roof-studio/security/advisories/new)** for this repository. Include:

- the affected route, component and revision;
- the impact and prerequisites;
- minimal reproduction steps using synthetic data;
- a suggested mitigation, if available.

Reports are reviewed on a best-effort basis. No response-time guarantee or bug-bounty program is offered.

## Supported version

Security fixes target the current `main` branch. Older commits are not maintained as separate supported releases.

## Application boundaries

- This is a static client-side application. No application database, SMTP service, contact-submission API or analytics integration is configured.
- Contact fields remain in page memory and the downloaded inquiry document; the form does not automatically transmit them.
- Roof configuration and language are saved in localStorage. Share links serialize roof configuration, including any price overrides. They are **not private storage**.
- All `NEXT_PUBLIC_*` environment variables are public build-time configuration. Never put secrets, service tokens or private recipient credentials in them.
- Imported/shared configurations are validated before use. This does not make user-controlled files trusted HTML or executable content.
- External Instagram, supplier and documentation links are governed by those services. GitHub Pages hosting has its own infrastructure and access logs.

If adding a real submission service, implement server-side validation, abuse protection, secret management and appropriate privacy disclosures before enabling it.

## Dependency checks

```sh
npm ci
npm audit
```

An audit is a point-in-time dependency check, not a security certification. Do not run `npm audit fix --force` blindly; review compatibility, the resulting lockfile and the test/build gates.
