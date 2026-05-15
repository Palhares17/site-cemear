# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # Start Vite dev server
npm run build      # TypeScript check + production build (tsc && vite build)
npm run preview    # Preview production build
```

There are no tests or linting scripts configured. `npm run build` runs `tsc` first, and `tsconfig.json` enables `strict`, `noUnusedLocals`, `noUnusedParameters`, and `noUncheckedSideEffectImports` — so dead identifiers will fail the build.

## Architecture

A **multi-page, no-framework website** for CEMEAR (Centro Especializado em Diagnóstico e Reabilitação Auditiva), a Brazilian SUS auditory health center.

**Stack:** Vite 7 · TypeScript 5.9 (strict) · TailwindCSS v4 · GSAP 3 with ScrollTrigger

### Pages (Rollup inputs)

`vite.config.ts` declares 5 HTML entry points at the repo root, all built into `dist/`:

- `index.html` — main landing page (large, all home sections inline)
- `exame-auditivo-sus.html`
- `aparelho-auditivo-sus.html`
- `reabilitacao-auditiva-sus.html`
- `politica-de-privacidade.html`

**Every page loads the same `src/main.ts`.** Each `init*` function in `main.ts` uses defensive `if (!el) return` guards because not all pages contain every element (e.g. mobile menu, hero, header). When adding behavior to a single page, follow the same pattern rather than assuming an element exists.

### Key files

- `index.html` — markup for the main landing page (all home sections live here)
- `src/main.ts` — single JS entry shared by every page: scroll animations, header scroll behavior, mobile menu, smooth anchor scroll, hero parallax, **GA4 conversion tracking** (`window.gtag('event', 'cta_click', …)` on `#hero-cta` and `a[href="#atendimento" | "#contato" | "#localizacao"]`)
- `src/style.css` — TailwindCSS v4 entry + full CEMEAR design system
- `public/` — static assets served from `/` (logo `Logos_Cemear-01.png`, `image.webp`, `vite.svg`)

### TailwindCSS v4 config

There is **no `tailwind.config.js`**. Configuration is done entirely in CSS via `@theme` in `src/style.css`. The plugin is `@tailwindcss/vite` registered in `vite.config.ts`.

Custom brand tokens defined in `@theme`:
- `--color-cemear-green`, `--color-cemear-teal` (each with `-light` and `-dark` variants — note: there is no `cemear-purple`)
- Extended gray scale `--color-gray-50` … `--color-gray-900`
- Extra spacing tokens `--spacing-18`, `-22`, `-88`, `-100`, `-120`
- `--font-sans` → Inter

Custom component classes (in `@layer components`): `.hero-gradient`, `.glass-card`, `.area-card`, `.diff-card`, `.btn-primary`, `.btn-secondary`, `.nav-link`, `.badge-sus`, `.step-connector`, `.stat-highlight`, `.section-divider`, `.faq-item`, `.hamburger-line` / `.hamburger-active`

### GSAP animation pattern

Elements with class `.gsap-reveal` start as `opacity: 0; transform: translateY(40px)` (set in `@layer base`). They animate in via ScrollTrigger when entering the viewport (`start: "top 88%"`, `once: true`, staggered by `index % 4`). The hero section (`#hero .gsap-reveal`) uses an immediate entrance animation without ScrollTrigger.

`prefers-reduced-motion` resets `.gsap-reveal` to visible via CSS fallback — GSAP still runs but the CSS overrides keep content visible.
