# Architectural loft redesign

## Decisions

- A warm off-white reading/work surface alternates with charcoal and dark-oak sections. Copper marks decisions and active states; it is not used as all-over decoration.
- The live 3D house leads the home page: an elevated three-quarter camera view, warm key light, balanced fill/rim light, softened directional shadows and a matte graphite ground with a soft contact shadow. There is no wood tabletop texture. It is explicitly labelled as an illustrative model, not company work. The masonry/scaffolding photograph stays in the gallery.
- Upright Manrope headings replace the repeated italic editorial serif. Navigation, captions and helper text are larger; the light calculator keeps its readable surfaces and visible pricing.
- The hero copy uses nearly solid smoked charcoal with barely perceptible fine grain; the studio header is solid. Copper controls, including Contact and Configure roof, are untextured and retain accessible contrast on hover. No decorative texture is applied over project photographs.
- Roof-focused crops from Projects 02 and 03 lead the photographic work section. The old-tile detail from Project 09 supports inspection content with a before-renovation label. Portfolio cards show roof previews; complete, labelled evidence is progressively disclosed.
- Two hero actions lead to projects and roof estimation. Contact is a separate header action. Project titles describe observed work rather than poetic themes; stable route IDs and original Instagram links are retained.
- Shape and size open first. Covering/colour follow through an explicit next-step button. Wall height, custom hip ridge, openings, technical assembly, labor and VAT remain progressively disclosed. All three tabs retain keyboard navigation.
- The current estimate stays at the top of the control column on desktop. On mobile, Configure roof immediately focuses the real settings tab and scrolls to it without a timer; Back to model and a model-side Configure roof action provide the return journey. The compact viewer and two-column shape choices also work at 320 px.
- The mobile cost bar's **border-box** height is observed, including safe-area padding, and used for studio-only bottom space and scroll padding. Focus clearance follows visual-viewport changes. The bar yields while the viewer/header or a text/select control is in use, and returns for settings and the estimate. Its **View estimate** link focuses the real cost breakdown. No extra bottom space leaks onto other pages after client-side navigation.
- OrbitControls' inline touch policy is explicitly changed to `pan-y pinch-zoom`: sideways gestures rotate; vertical gestures scroll the page. Camera, colour, reset, fullscreen, layers and zoom controls remain available. Quantities, formulas, price editing, scenarios, sources, PDF/JSON exports and sharing remain in the estimate section.
- Font subset fallbacks were corrected: the extended subset must not insert Arial ahead of the Latin font. Upright Manrope body copy and headings remain consistent in both languages.
- Contact still prepares a real local document. No submission service, verified email, invented business claim or new price review is implied.

See [the photo-by-photo replacement brief](PHOTOGRAPHY.md). The calculation, validation, state and price-book engines are unchanged.

## Verification

Verified on **28 October 2026**, against the local production static export with the real **`/vos-bud-roof-studio` base path**, in Chromium (software WebGL where required), in both languages. This is local verification, not a new public deployment.

| Gate | Result |
| --- | --- |
| `npm test` | 37 passed, including the photographic presentation policy |
| `npm run build` | Passed; static export and 38 portable navigation aliases generated |
| `npm run typecheck` | Passed |
| `npm run test:browser` | 122 passed; zero captured page exceptions or failed same-site responses |
| `npm run test:extended` | 14 passed, including the mobile shape → material → estimate journey |
| `npm run test:mobile` | 48 focused checks; PL/EN × 320/390 px × normal/reduced motion |
| `npm run test:presentation` | 12 PL/EN page/viewport checks; 18 overview/detail screenshots and 20 individual photograph crops |
| `npm run test:a11y` | 32 page/dialog/state audits, including copper-button hover; zero tested axe WCAG A/AA violations |
| `python -X utf8 scripts/inspect-pdf.py` | PL/EN PDFs: seven pages each, embedded Unicode fonts, text and page-bound checks passed |
| Original media integrity | All 27 source JPEG SHA-256 hashes match the pre-existing audit |

Responsive checks cover **320, 390, 768, 1024 and 1920 px**. Focused mobile checks use trusted CDP touch input for horizontal rotation and native vertical scrolling over both the homepage and studio models; they also exercise actual jump/return focus, every viewer-button position, reset/fullscreen, reduced viewport height, enlarged safe-area padding, measured bar height, destination-labelled estimate navigation, footer clearance and client-navigation cleanup. Safe-area growth and a reduced keyboard viewport are simulated in Chromium, not certified on physical iOS devices.

Actual desktop/mobile PL/EN screenshots, ten per-project card crops beside their full source frames, and generated PDF pages were visually inspected. Project 05 now uses a tighter card-only crop; Project 02 shares its reviewed position on the homepage and portfolio. Source limitations and exact client replacement requests are recorded in [PHOTOGRAPHY.md](PHOTOGRAPHY.md). Export/import, persistence, share links, all six materials, all four geometries, VAT/labor behavior, 3D cameras/fullscreen and WebGL fallback remain exercised.

The existing suites now follow the guided flow and verify separately labelled, uncropped photographic sequences instead of requiring ten misleading overlays. Raw results and screenshots are generated under ignored `qa/`; historical public snapshots retain their original dates and are not assertions about a later revision. The PDF inspection's expected wording follows the updated PL/EN source-price-range labels.

No live deployment or cross-browser/physical-device certification is implied. GitHub Pages configuration and deployment workflow are unchanged; publication was not performed as part of this local redesign.
