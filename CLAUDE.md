# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # Start Vite dev server
npm run build      # TypeScript check + production build (tsc && vite build)
npm run preview    # Preview production build
```

There are no tests or linting scripts configured.

## Architecture

This is a **single-page, no-framework website** for CEMEAR (Centro Especializado em Diagnóstico e Reabilitação Auditiva), a Brazilian SUS auditory health center.

**Stack:** Vite 7 · TypeScript 5.9 (strict) · TailwindCSS v4 · GSAP 3 with ScrollTrigger

**Key files:**
- `index.html` — entire page markup (all sections live here)
- `src/main.ts` — all JS logic: scroll animations, header behavior, mobile menu, smooth scroll, parallax
- `src/style.css` — TailwindCSS v4 entry + full CEMEAR design system

### TailwindCSS v4 config

There is **no `tailwind.config.js`**. Configuration is done entirely in CSS via `@theme` in `src/style.css`. The plugin is `@tailwindcss/vite` registered in `vite.config.ts`.

Custom brand tokens defined in `@theme`:
- `--color-cemear-green`, `--color-cemear-teal`, `--color-cemear-purple` (each with `-light` and `-dark` variants)
- `--font-sans` → Inter

Custom component classes (in `@layer components`): `.hero-gradient`, `.glass-card`, `.area-card`, `.diff-card`, `.btn-primary`, `.btn-secondary`, `.nav-link`, `.badge-sus`, `.step-connector`, `.stat-highlight`, `.section-divider`

### GSAP animation pattern

Elements with class `.gsap-reveal` start as `opacity: 0; transform: translateY(40px)` (set in `@layer base`). They animate in via ScrollTrigger when entering the viewport. The hero section (`#hero .gsap-reveal`) uses an immediate entrance animation without ScrollTrigger.

`prefers-reduced-motion` resets `.gsap-reveal` to visible via CSS fallback — GSAP still runs but the CSS overrides keep content visible.
