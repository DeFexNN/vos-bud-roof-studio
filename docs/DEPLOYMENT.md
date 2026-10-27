# Deployment and operating notes

**Live site:** [defexnn.github.io/vos-bud-roof-studio](https://defexnn.github.io/vos-bud-roof-studio/) · [Documentation index](README.md)

## GitHub Pages

The repository deploys automatically from **`main`** through [`.github/workflows/pages.yml`](../.github/workflows/pages.yml).

1. GitHub Actions checks out the source and sets up Node.js 22.
2. `actions/configure-pages` supplies the actual public base URL and repository subpath.
3. `npm ci` installs the lockfile; documentation links/evidence and domain tests are checked.
4. The build receives `NEXT_PUBLIC_SITE_URL` and `NEXT_PUBLIC_BASE_PATH`, exports static HTML/assets and runs the portable-export finalizer.
5. TypeScript is checked against the generated route types.
6. The `out/` artifact is deployed to the `github-pages` environment over HTTPS.

The workflow uses repository-scoped Pages/OIDC permissions, not a manually stored deployment token. A failed install, test, build or typecheck prevents deployment.

### Deploy a fork

1. Enable GitHub Actions in your fork.
2. In **Settings → Pages**, select **GitHub Actions** as the build source.
3. Push to `main` or run **Deploy GitHub Pages** from the Actions tab. If the initial run preceded Pages enablement, rerun it.
4. Verify the published URL from the deployment environment.

The application derives its path from Pages metadata; it does not need a source-code rewrite for a different repository name. README/demo links and the documentation screenshot default still point to this repository—update those if maintaining a separate public project.

For a custom domain, configure the domain and DNS through GitHub Pages, enforce HTTPS and rebuild so canonical, sitemap and asset URLs use the new metadata.

## Static production build

For a static host other than GitHub Pages:

1. Install Node.js 22+ and run `npm ci` in the repository directory.
2. Copy `.env.example` to `.env.local`.
3. Set `NEXT_PUBLIC_SITE_URL` to the **full public HTTPS base URL**, without a trailing slash.
4. If hosting at the domain root, leave `NEXT_PUBLIC_BASE_PATH` empty. If hosting in `/roof`, use `NEXT_PUBLIC_BASE_PATH=/roof` and `NEXT_PUBLIC_SITE_URL=https://your-domain.pl/roof`.
5. Optionally set a **verified** `NEXT_PUBLIC_CONTACT_EMAIL`. Without it, the form downloads an inquiry; with it, the completed form also offers a mailto link. This does not create a server-side email service or guarantee delivery.
6. Run `npm test`, `npm run build`, then `npm run typecheck`. The build generates Next.js route types.
7. Publish the **contents of `out/`** to any static HTTPS host that serves directory `index.html` files and the generated `.txt` navigation payloads. Preserve filenames, including `$` characters. Do not replace all paths with a single SPA fallback.
8. Keep `404.html` as the custom not-found page. Verify `/pl/`, `/en/`, deep case-study links, `/sitemap.xml`, `/robots.txt` and downloads on the actual origin.

The root route defaults to Polish unless a visitor has previously selected English. Language selection and roof settings are stored locally; language switching retains the configuration.

| Variable | Meaning | Example |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Full public URL, including an optional base path | `https://example.com/roof` |
| `NEXT_PUBLIC_BASE_PATH` | Empty at the origin root, or a leading-slash subdirectory | `/roof` |
| `NEXT_PUBLIC_CONTACT_EMAIL` | Optional verified public recipient for a mail-client link | Leave empty if not configured |

These are **public build-time values**, not secrets. GitHub Pages supplies the first two automatically. To enable an email link there, add the verified value to the build step's environment; no email delivery API is created by doing so.

`npm run build` automatically runs `scripts/finalize-export.mjs`. It adds portable dot-separated navigation aliases for Next's Windows static-export output without removing any original files. Correct Linux builds need no such aliases. Upload the finalized export, not an intermediate build.

## Local preview

```sh
npm run build
npm run preview
```

Default: http://localhost:3000/pl/. `npm start` is the same static preview. It is a development/verification server, not a hardened public server. Production should use a proper static CDN/web server with HTTPS, compression and appropriate security headers. The preview's `PORT` defaults to 3000.

Windows PowerShell example:

```powershell
$env:PORT = '3001'
npm run preview
```

Stop with Ctrl+C. Do not run the development server and preview on the same port. Do not rebuild while browser QA is navigating the export.

For a base-path build, provide the same base path when launching the local preview (through the process environment). The preview is a plain Node script; unlike Next, it does not load `.env.local` itself:

```powershell
$env:NEXT_PUBLIC_BASE_PATH = '/roof'
npm run preview
```

## Browser proof

With production preview running in a separate terminal:

```sh
npx playwright install chromium
npm run test:browser
npm run test:a11y
npm run test:extended
```

The suite uses headless Chromium with software WebGL when necessary. It verifies changed rendered pixels, shared area values, materials/openings/cameras/layers, exports/imports, all 10 comparisons, localized routes, automated WCAG rules, responsive widths, contact validation and forced-WebGL fallback. Evidence is written under `qa/`.

Optional deeper PDF proof (not a website runtime dependency): install Python/PyMuPDF with `python -m pip install pymupdf`, then run `python -X utf8 scripts/inspect-pdf.py` after browser QA. It checks embedded Unicode fonts, Polish/English text extraction, source URLs and text bounds, and renders the first two pages for visual review.

For another origin/port, set `QA_URL` to its origin (include a base path if used). Automated accessibility checks are **not a WCAG certification**; manual keyboard, touch, screen-reader, actual-phone and cross-browser testing is still recommended. A local software-rendered run is not a mobile GPU performance benchmark.

## Contact and privacy

- No API endpoint, SMTP integration, analytics or tracking cookies are configured.
- Inquiry validation produces a local `.txt` file with the supplied details and optional current estimate/configuration. It sends nothing over the network. The notice states this explicitly.
- Instagram links and optional mailto links leave the site and use those services' privacy policies. Mailto relies on the visitor's configured email client; large inquiries may exceed client URL limits, so the downloaded document is the reliable handoff.
- Roof configuration and language use localStorage. Share links contain a serialized roof configuration, including user-entered **unit-price overrides**, but no contact form fields. Anyone with a share link can read those configuration values.
- The privacy page can reset browser-saved settings. Before a public launch, the operator must provide/approve legally required business identity, data-controller details and jurisdiction-specific privacy disclosures, especially if a real submission service or analytics is added.

## Assets and licensing

Optimized project photography is bundled under `public/images/projects/`. Original source photos and internal inspection/audit records are not needed to install, build or deploy the repository. Do not publish raw originals, private audit metadata or generated contact/QA downloads unintentionally.

`npm run assets` is an optional operator-side regeneration task requiring the source media/font inputs. It is not part of the normal build. Repository screenshots are separate: `npm run docs:screenshots` captures the live site into `docs/assets/`; `DOCS_URL` can point at another deployment.

Project 01 filenames were semantically reversed in the supplied set and are corrected in the asset mapping. Before/after views may have different camera angles; the site discloses this and provides uncropped fullscreen views. Case 02's 440 m² is attributed to its supplied description, not measured from a photograph. Obtain the operator's permission/rights for public reuse of the supplied photographs.

Manrope, DM Serif Display and Noto Sans are self-hosted with their OFL licenses in `public/fonts/`. No external font service is required. 3D geometry/material textures are procedural; no downloaded model is needed.

## Before a new deployment or integration

- Approve brand, case-study descriptions, photograph permissions and verified contact channel.
- For manual hosting, configure the actual public base URL before building; the local default intentionally uses localhost. The Pages workflow already supplies the live URL.
- Reconfirm dated price lists, live retail availability, VAT eligibility and contractor scopes; see `PRICING.md`.
- Keep the planning-estimate disclaimer. Confirm low-pitch waterproofing, accessory compatibility and all project-specific exclusions with the roofer.
- If actual web submission is required, integrate a verified recipient/service with server-side validation, abuse protection and appropriate privacy disclosures. Do not change the current honest download confirmation into a fake “sent” message.
- Verify real mobile devices, Safari/Firefox, screen-reader behavior and host-level caching/compression after deployment.
