# Contributing

Thanks for helping improve V.O.S_BUD Roof Studio. The priorities are **clear interactions, accurate calculations, honest scope and consistent PL/EN content**.

Before starting a large change, [open an issue](https://github.com/DeFexNN/vos-bud-roof-studio/issues/new/choose) describing the problem and intended scope. For security issues, use [private reporting](SECURITY.md) instead.

## Local development

Node.js 22+ and npm are required.

```sh
git clone https://github.com/DeFexNN/vos-bud-roof-studio.git
cd vos-bud-roof-studio
npm ci
npm run dev
```

Open `/pl/` or `/en/` on port 3000. Create a focused branch for your change. The checked-in assets are sufficient; `npm run assets` is an optional operator-side regeneration task that requires the original media inputs.

## Change-quality checklist

### Geometry and calculations

- Keep calculation functions pure under `src/calculators/`. The renderer and estimator must continue to consume the same measured geometry.
- Add an independent mathematical reference or regression test for changed geometry, rounding, units, openings, VAT or labor behavior.
- Never hide missing scope behind an arbitrary cost multiplier. Keep actual quantities, assumptions and exclusions visible.
- Keep itemized and bundled installation mutually exclusive. Do not apply waste or overlaps twice.

### Prices and product data

- Record the exact reference product, dimensions, purchase unit, physical/effective billing basis and source VAT treatment.
- Add source URL and publication date, or explicitly mark the source undated. Do not change the review date without reviewing the affected prices.
- Follow [the price-book update procedure](docs/PRICING.md#updating-the-price-book). Reconfirm accessory compatibility rather than assuming it from a similar name.

### Interface and content

- Update Polish and English together. Do not introduce invented project specifications, business credentials, contact details or customer claims.
- Preserve keyboard/touch operation, visible focus, meaningful labels, reduced-motion behavior and the WebGL fallback.
- Use the supplied project photographs only within their permitted scope. Do not infer product brands or measured roof area from a photograph.
- Keep private form fields out of logs, persistent storage, fixtures and shared URLs. Do not replace the local inquiry download with a fake delivery confirmation.

## Check your change

```sh
npm test
npm run docs:check
npm run build
npm run typecheck
```

The first build generates Next.js route types. For browser checks, serve the production export with `npm run preview` in a separate terminal, then:

```sh
npx playwright install chromium
npm run test:browser
npm run test:a11y
npm run test:extended
```

Do not rebuild during a browser run. Generated evidence belongs in the ignored `qa/` directory. If UI changes affect the repository previews, run `npm run docs:screenshots` against the intended deployment (`DOCS_URL` can override the default live site).

## Pull requests

- Describe **what changes and why**, with the issue link if applicable.
- Include the relevant test results; explicitly mark checks that do not apply to a documentation-only change.
- Include before/after screenshots for visible UI changes and the affected PL/EN routes.
- Keep unrelated refactors, dependency upgrades and generated downloads out of the patch.
- Use a short, descriptive commit subject such as `fix: preserve net area around roof openings`.

Contribution acceptance does not grant a new license for the application or its media. See [rights and attribution](README.md#rights-and-attribution).
