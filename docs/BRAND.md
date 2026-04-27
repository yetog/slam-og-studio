# SLAM OG LLC, Brand & UI System

Single source of truth for the SLAM visual system. Every page on slamogllc.com
and every in-house application (plugins, web DAW, future tools) inherits from
this document. When something is not specified here, default to restraint.

---

## Identity

- **Name**: SLAM OG LLC
- **Tagline**: Infrastructure. Intelligence. Impact.
- **Positioning**: Managed service provider for cloud infrastructure, web hosting,
  AI automation, security, and creative production. Also a registered independent
  record label.
- **Service areas**: New York City, Philadelphia, Barbados.
- **Headquarters**: 1259 Ralph Ave, Brooklyn, NY 11236.

---

## Voice & tone

- Restrained, technical, confident. We do not oversell.
- Sentence case for body copy and most headings. Title case for nav and brand
  marks.
- Active voice. Short sentences. Specifics over adjectives.
- **Forbidden**: em dashes (—) and en dashes (–) anywhere, in copy, comments,
  prompts, or AI replies. Use commas, periods, colons, or hyphens. See
  `mem://constraints/no-dashes.md`.

---

## Color tokens

All colors defined as HSL in `src/index.css`. Never hardcode hex in components,
always reference the semantic token.

| Token | HSL | Hex | Use |
|---|---|---|---|
| `--background` | `0 0% 2%` | `#050505` | Page background |
| `--foreground` | `44 33% 95%` | `#F8F6F0` | Body text |
| `--surface` | `0 0% 8%` | `#151515` | Card / muted surface |
| `--surface-elevated` | `0 0% 11%` | `#1C1C1C` | Lifted card |
| `--primary` | `42 51% 54%` | `#C9A24A` | Gold, CTAs and accents only |
| `--muted-foreground` | `0 0% 65%` | `#A7A7A7` | Secondary text |
| `--border` | `0 0% 15%` | `#262626` | Hairline dividers |
| `--border-strong` | `0 0% 22%` | `#383838` | Stronger card borders |
| `--ring` | `42 51% 54%` | `#C9A24A` | Focus ring |

**Effects**

- `--gold-glow`: radial gold haze, used at top of hero sections.
- `--shadow-card`: subtle inset highlight + soft drop shadow on cards.
- `--transition-base`: `220ms cubic-bezier(0.4, 0, 0.2, 1)`.

Gold is an accent, not a fill. Reserve it for CTAs, eyebrows, primary icons,
and the gold glow background. Never tint large surfaces gold.

---

## Typography

- **Display**: Cinzel (serif). Used for `h1`-`h4` and the SLAM wordmark. Weight
  500 by default. Letter-spacing `0.005em`.
- **Body**: Inter (sans). Used for paragraphs, UI, and small text. Font feature
  settings `"ss01", "cv11"` enabled globally.
- **Eyebrows**: 12px, uppercase, tracking `0.18em`, primary gold.
- **Display scale** (Tailwind component classes):
  - `.display-xl`: 5xl, 6xl at md, 7xl at lg, leading 1.05
  - `.display-lg`: 4xl, 5xl at md, leading 1.1
  - `.display-md`: 3xl, 4xl at md, leading 1.15

Never use a third typeface. Bold only for emphasis inside body copy.

---

## Layout

- `.container-slam`: max width `1200px`, horizontal padding `px-6 md:px-8`.
- `.section-y`: vertical padding `5rem` (80px) top and bottom.
- 6 / 8 px gutter rhythm; gaps prefer 4, 6, 8, 12 in Tailwind units.
- `.hairline`: 1px gradient divider, transparent to `border-strong` to
  transparent. Use between sections instead of hard rules where possible.
- Sections separate with `border-t border-border/60`.

---

## Components

- **`.card-slam`**: rounded `md`, surface `bg-card`, hairline border, soft
  shadow. Lifts `2px` and strengthens border on hover.
- **Buttons**: shadcn `Button` defaults. Primary uses gold (`--primary`),
  outline uses `border-strong` and matches body type.
- **Hero pattern**: full-bleed section with `var(--gold-glow)` absolute
  background at top, eyebrow, display heading with one gold-accented word,
  short subhead. See `src/pages/Home.tsx` and `src/pages/About.tsx`.
- **`PartnerStrip`**: monochrome wordmarks at low opacity, gold underline on
  hover. No multi-color logos, ever.
- **`ServiceCarousel`**: card-per-service, gold icon chip, rounded `md`.
- **`CTA`**: gold-glow card-slam with two buttons (Calendly + contact).

---

## Imagery

- Matte black, off-white, restrained warm tones.
- Workspace, gear, and architectural detail photography.
- Avoid stock photography of generic teams. Avoid bright product photography.
- Gold is the only accent color allowed in marketing imagery.

---

## Iconography

- Lucide icons only. Stroke `1.5`. Sized `h-4 w-4` to `h-10 w-10`.
- Primary slot icons render in gold (`text-primary`).
- Decorative icons render in `text-muted-foreground` or `text-foreground/60`.

---

## SEO branding

- Site name: `SLAM OG LLC`. Title separator: `|`.
- Global JSON-LD: `ProfessionalService` with geo-coded `areaServed` for New
  York City, Philadelphia, and Barbados. Defined in `src/components/Seo.tsx`
  and `src/lib/site.ts`.
- Meta description must mention "managed service provider" and at least one
  service area.

---

## Forbidden

- Em dashes (—) and en dashes (–) in any copy, comment, or prompt.
- Multi-color logo grids. Render partner brands as monochrome wordmarks.
- "Lovable" or "Bolt" branding outside the partners list.
- Hardcoded hex / rgb in components. Use semantic tokens.
- A third typeface. A non-gold accent on marketing pages.

---

## Application sub-theme (`.theme-app`)

Applications, plugins, and the web DAW may extend the brand with a HUD-style
sub-theme inspired by Final Fantasy VII Rebirth. The sub-theme is **opt-in**,
scoped, and never bleeds onto marketing pages.

- Wrap any application surface with `<div class="theme-app">`. The class is
  defined in `src/index.css` under the `.theme-app` block.
- The base layer (matte black, gold, Cinzel, Inter, container, section rhythm)
  is preserved. The sub-theme only adds.

**Added tokens** (scoped to `.theme-app`):

| Token | HSL | Hex | Use |
|---|---|---|---|
| `--app-accent` | `183 56% 60%` | `#5FD2D6` | Materia cyan, secondary accent |
| `--app-accent-soft` | `183 56% 60% / 0.12` | | Tinted backgrounds |
| `--app-glow` | radial cyan + soft gold | | Hero glow on app pages |

**Added utilities**:

- `.app-hud`: panel with thin grid + scanline overlay and elevated surface gradient.
- `.app-border-sweep`: animated gold-to-cyan sweep on featured panel borders.
- `.app-orb`: 8px materia-orb status dot, with `data-status` variants for
  `concept`, `in-development`, `beta`, `released`.
- `.app-cta`: gold-to-cyan gradient button background.
- `.app-accent-text`: cyan accent for inline emphasis.

**Rules**:

- Cyan is a *product* accent. Never use it on marketing pages.
- Gold remains the primary CTA color; cyan complements it.
- Animations stay subtle (6s sweep, no chromatic aberration on text, no
  particle storms).
- Cinzel display + Inter body still apply. Do not switch typefaces.

This keeps the luxury MSP brand intact for buyers while letting the products
feel kinetic and immersive.

---

## Where things live

- Tokens: `src/index.css`
- Tailwind config: `tailwind.config.ts`
- Site config (nav, contact, locations): `src/lib/site.ts`
- SEO defaults and JSON-LD: `src/components/Seo.tsx`
- Services registry: `src/content/services/index.ts`
- Insights registry: `src/content/insights/index.ts`
- Showcase registry: `src/content/showcase/index.ts`
- Partners registry: `src/content/partners/index.ts`
- Events registry: `src/content/events/index.ts`
- Applications registry: `src/content/applications/index.ts`
- Brand assets:
  - Full logo (header, footer, OG): `src/assets/slam-og-logo.png`, `public/slam-og-logo.png`, `public/og-image.png`
  - Vinyl mark (favicons, in-app marks): `src/assets/slam-og-mark.png`, `public/favicon.ico`, `public/favicon-16.png`, `public/favicon-32.png`, `public/apple-touch-icon.png`

When in doubt, mirror an existing page. The system is deliberately small.