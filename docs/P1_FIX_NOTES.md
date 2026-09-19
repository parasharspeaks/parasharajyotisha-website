# P1 website update

## What changed

- Standardized all public Tools-page contact and feedback links on `support@parasharajyotisha.com`.
- Preserved the private admin allowlist entry in `admin-consultations.html` to avoid locking out an existing administrator.
- Embedded the working Kundli, Matching and Sade Sati calculators directly on their dedicated SEO pages.
- Added same-origin automatic iframe resizing with a full-page fallback link.
- Converted the six Tools navigation controls from mouse-only `div` elements to keyboard-accessible tabs, including arrow/Home/End navigation and ARIA state.
- Added Railway API preconnect hints and a clear message when a cold API instance takes more than six seconds to wake.
- Expanded Hindi coverage for Matching, Sade Sati and Panchang forms and common dynamic result labels. Calculation IDs and returned numeric values remain unchanged.
- Added Netlify `_headers` with HSTS, `nosniff`, same-origin framing, a restrictive permissions policy and Content Security Policy in report-only mode.
- Added Open Graph image alternative text on the three main calculator landing pages.

## Deliberately unchanged

- Astrology algorithms, fallback calculations and API mappings.
- Firebase configuration, authentication, account quotas and password/reset behavior.
- Admin authorization allowlist.
- Consultation submission, verification, payment and review workflows.

## Upload

Upload every file in the P1 ZIP using its included folder path. `_headers` must be uploaded at the website root. Do not rename it.

Files in this update:

- `_headers`
- `tools.html`
- `hi/tools.html`
- `index.html`
- `hi/index.html`
- `panchang.html`
- `hi/panchang.html`
- `free-kundli.html`
- `hi/free-kundli.html`
- `my-kundli.html`
- `hi/my-kundli.html`
- `kundli-matching.html`
- `sade-sati-calculator.html`
- `assets/images/tool-embed.js`
- `docs/P1_FIX_NOTES.md`
- `tests/p1-regression.test.cjs`

After deployment, verify `/free-kundli.html`, `/kundli-matching.html`, `/sade-sati-calculator.html`, `/tools.html` and `/hi/tools.html`. Security headers apply only after Netlify publishes the root `_headers` file.
