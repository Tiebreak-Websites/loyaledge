# LoyalEdge — Careers Landing Page

A single-page, conversion-focused recruitment site for **LoyalEdge**, the Customer
Support careers program for **Peak Services Ltd** in Malta. It recruits multilingual
customer-support professionals across Europe to relocate for paid training, relocation
support and career progression.

> Copy on this page is legally reviewed. Before changing any wording, read the **Legal
> review** block at the top of [`BRIEF.md`](BRIEF.md) — it overrides the rest of the brief.

## Stack

[Astro 7](https://astro.build) static site. Pages, layout and components live in `src/`.
Styles and the original progressive-enhancement script are imported from `src/styles`
and `src/scripts`. Images in `src/assets/` are hashed into the build.

| Path | Purpose |
|------|---------|
| `src/pages/index.astro` | Careers landing page, `JobPosting` structured data |
| `src/pages/privacy.astro` | Privacy Policy |
| `src/pages/terms.astro` | Terms & Conditions |
| `src/layouts/Layout.astro` | Document shell, meta/OG tags, shared chrome |
| `src/styles/global.css` | All styling and motion — light theme, brand `#4780FF` / `#1B3476` |
| `src/scripts/site.js` | Progressive enhancement: nav, accordions, scrollspy, counters, reveals, form |
| `src/assets/` | Wordmark and photography |
| `BRIEF.md` | The build brief — goal, content rules, decisions, section-by-section spec |

Requires **Node.js 22.12.0** or later (even-numbered releases).

## Running locally

```bash
npm install
npm run dev
```

Then open the URL printed in the terminal (usually `http://localhost:4321`).

Production build:

```bash
npm run build
npm run preview
```

Legal pages keep their original URLs: `/privacy.html` and `/terms.html`.

## Before going live

- **Wire the application form.** `#applyForm` carries `data-endpoint="REPLACE_WITH_ATS_ENDPOINT"`.
  Set it to your ATS or webhook URL; until then the form validates but sends nothing.
- **Adding roles.** The page carries one multilingual `.role` block by design — per legal,
  language-specific variants must not appear here. Language requirements belong on the
  individual open positions. If a genuinely different role is added, duplicate the `.role`
  block with a new `data-role-id` and add a matching `<option>` to the form's role select.

## Accessibility & motion

WCAG 2.1 AA: semantic landmarks, keyboard-operable menu and accordions, visible focus
rings, and text/background contrast verified against the brand palette. All motion is
decorative and disabled under `prefers-reduced-motion`. Counters and scroll reveals have
failsafes so content is never left hidden if scripting is interrupted.

---

Brand and role-terminology guidance lives in [`BRIEF.md`](BRIEF.md).
