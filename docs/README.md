# Documentation

**[Live website](https://defexnn.github.io/vos-bud-roof-studio/en/)** · **[3D studio](https://defexnn.github.io/vos-bud-roof-studio/en/studio/)** · **[Repository overview](../README.md)**

## Start with your question

| I want to… | Read |
| --- | --- |
| Understand what the application does | [Repository overview](../README.md#the-experience) |
| Run, configure or deploy it | [Deployment and configuration](DEPLOYMENT.md) |
| Understand how quantities and totals are calculated | [Calculation model](CALCULATIONS.md) |
| Check a price, VAT assumption or publication date | [Pricing and evidence](PRICING.md) |
| See what was actually tested | [Verification report](QA.md) |
| Understand the loft redesign | [Design decisions](REDESIGN.md) |
| Find missing project photo requirements | [Photography review](PHOTOGRAPHY.md) |
| Propose a change or fix a bug | [Contributing](../CONTRIBUTING.md) |
| Report a security vulnerability | [Security policy](../SECURITY.md) |

## Reading the estimate

1. **Geometry:** real roof planes, openings and measured edges—not building floor area alone.
2. **Quantities:** effective coverage, physical material, laps, cutting loss and purchase-unit rounding remain distinct.
3. **Prices:** source VAT is normalized to net; the selected tax treatment is applied to the final estimate.
4. **Scope:** bundled installation replaces separate tasks; warnings identify incomplete or project-specific details.

The estimator is for planning. It does not replace a measured survey, engineered roof design or a contractor-approved order.

## Evidence and media

- [`verification/`](verification/) contains curated machine-readable result snapshots. Their dates and target environments are described in [QA.md](QA.md).
- [`assets/`](assets/) contains optimized application screenshots. The loft-redesign previews were captured from the local production export. Regenerate them with `npm run docs:screenshots`; set `DOCS_URL` to select the intended deployment (the default is the public site).
- Original photo audits, internal reference notes and generated local `qa/` downloads are intentionally not part of the public documentation.
