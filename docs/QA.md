# Verification report

**Application verification: 26 October 2026.** Verified revision: [`7f56c9a`](https://github.com/DeFexNN/vos-bud-roof-studio/commit/7f56c9a32eea64f0586a6b3547267fa27a86c7b8).

The baseline production export was tested at `http://localhost:3000`, then the complete main browser suite and supplemental flows were run again against **[the public GitHub Pages deployment](https://defexnn.github.io/vos-bud-roof-studio/)**, including its real `/vos-bud-roof-studio` base path. Browser environment: Windows, Node.js 25.9.0 and Playwright Chromium, with software WebGL when necessary. The [initial public deployment](https://github.com/DeFexNN/vos-bud-roof-studio/actions/runs/40402472225) also passed its Linux/Node.js 22 build gates.

## Current local polish — 28 October 2026

The current material/3D/mobile polish was separately verified against a fresh **local production export using `/vos-bud-roof-studio`**: 37 unit tests, 122 browser checks, 14 supplemental checks, 48 focused mobile checks, 12 presentation checks, 32 axe audits, PL/EN seven-page PDFs, build and typecheck all passed. Real desktop/mobile screenshots and all ten rendered photo crops were inspected; all 27 original JPEG hashes still match the existing audit.

Focused tests cover jump/return focus, native touch scrolling and rotation, viewer controls, keyboard-viewport changes, measured safe-area clearance and final footer access in both languages. Full details and limits: [current design verification](REDESIGN.md#verification). This work has **not** been deployed; the public-release table and curated snapshots below retain their earlier dates.

## Results

| Gate | Actual result |
| --- | --- |
| `npm test` | **36/36 passed** |
| `npm run typecheck` | Passed, no TypeScript errors |
| `npm run build` | Passed; 36 PL/EN content routes plus entry/error/metadata routes; finalized `out/` |
| `npm run test:browser` | **122/122 checks passed on GitHub Pages**; no captured page exceptions or failed same-site responses |
| `npm run test:a11y` | **20/20 local page/dialog audits**, zero violations in tested axe WCAG A/AA rules; five principal-page audits also pass within the public browser suite |
| `npm run test:extended` | **13/13 supplemental checks passed on GitHub Pages** |
| `python -X utf8 scripts/inspect-pdf.py` | PL and EN PDFs passed; **7 pages each**, embedded Unicode fonts, correct text extraction, source URLs and text within page bounds; rechecked 27 October 2026 |
| `npm audit` | **0 vulnerabilities**, including development dependencies; rechecked 27 October 2026 |

These suites overlap in coverage; the counts are not a claim of that many distinct accessibility criteria or certified requirements.

## What was exercised

- All four roof types, dimensional changes, pitch/overhang, six systems, roof color/finish, real window/chimney penetrations, rafter spacing, camera views/rotation/zoom/reset, actual dimension overlays, exploded layers and fullscreen entry/exit.
- Pixel hashes of the actual WebGL canvas change after relevant controls. Rendered plane count and measured area agree with the calculator. Tests distinguish gross area from net opening area.
- Exact mathematical references for simple roof areas, hip triangles/trapezoids and T-plan partitioning; sloped-plane geometry, opening deductions, clipped battens, effective/physical sheet widths, package/roll rounding, waste reconciliation, price/VAT arithmetic and invalid configurations. A 72-configuration grid checks nonnegative quantities and whole purchase units.
- Unit-price overrides, exclusive bundled/itemized installation, supply-only mode, confirmed residential VAT with the 300/400 floor-area proportion, and scenario-specific totals.
- Genuine PL/EN PDF downloads, real JSON downloads/import, page-reload persistence, clipboard share links reconstructed in an independent browser context, and remembered language preference.
- All ten original photograph pairs via before/after extremes and keyboard range adjustment; mouse dragging; actual CDP touch-event dragging; fullscreen case navigation and Escape. Material deep links and comparison controls.
- All **36 localized content routes**: one H1, correct document language, no Cyrillic UI text, canonical/hreflang metadata, no completed broken images or horizontal page overflow at the desktop check.
- Five principal page types at **320, 390, 768, 1024 and 1920 px**; no document-level horizontal overflow. The wide purchasing table scrolls inside its own container. Mobile menu opening, navigation and Escape.
- Axe audits of all eight page types and a case study in each language, plus the fullscreen gallery and mobile navigation dialog. Manual/interaction checks include visible focus, studio/layer arrow-key navigation and native modal behavior.
- Contact-field validation and an actual downloaded inquiry containing selected configuration; no POST request or simulated “sent” state.
- Forced failure of both WebGL context types: the geometric SVG fallback remains visible and changing pitch still changes calculated roof area.

## Visual/PDF review

Reviewed desktop/mobile homepage composition and camera framing, the loaded WebGL roof-layer section, featured project photography, contact layout, mobile studio, fullscreen photographic comparison and PDF typography. Project 01 uses the corrected semantic before/after mapping. Fullscreen views retain original image proportions and disclose differing viewpoints.

Public, curated machine-readable evidence:

- [Browser results](verification/browser.json): all 122 result records, captured exceptions and same-site request failures.
- [Supplemental flows](verification/interactions.json): touch, share links, persistence, scenarios, VAT and labor checks. Environment-specific timing samples are intentionally omitted from this published snapshot.
- [Accessibility audits](verification/accessibility.json): all 20 local page/dialog reports, with their exact audit targets.
- [PDF inspection](verification/pdf.json): extracted-character, embedded-font and page-bound results for both downloads.

The repository [preview images](assets/) are presentation assets, not substitute evidence for mathematical correctness. The current loft-redesign previews were refreshed from a local production export; the dated verification snapshots above still describe the earlier public release.

Running the suites creates full screenshots, PDFs, extracted text and download artifacts under the ignored `qa/` directory. They use synthetic input data and are intentionally not committed as a bulk QA dump. Curated snapshots above preserve the run dates and target environments; they are not silently regenerated by every build.

## Performance strategy, not an invented score

Implementation measures include static HTML, self-hosted subset web fonts, responsive WebP images, lazy scenes/PDF code, capped pixel ratio, instanced roof elements, render-on-demand, visibility suspension and explicit GPU resource disposal.

The supplemental runner records a navigation/resource timing sample for diagnostics. Unthrottled automation is **not** a real-network performance guarantee, a Lighthouse score or a physical-phone GPU benchmark; ordinary LCP measurements also do not represent the canvas-rendered house. No Lighthouse score or universal mobile-performance rating is claimed here.

## Limits of the proof

- Chromium automation is not Safari/Firefox, a physical-phone test, a screen-reader certification or WCAG conformance certification.
- The public GitHub Pages deployment and its repository subpath were verified. An unrelated custom domain or different hosting provider was not exercised.
- No email recipient or submission service is configured. The tested contact behavior is a genuine local inquiry download, not real email delivery.
- Prices are documented planning references, not guaranteed stock/offers. Some retailer references came from indexed listings and some labor VAT treatment is an explicit assumption.
- Roof design, structural checks, hydraulic sizing, arbitrary plans/dormers and all project-specific material/accessory details are outside the estimator's certified scope. Shingle ridge ventilation is explicitly excluded from its price. Review `CALCULATIONS.md` and `PRICING.md` before using quantities for an order.
