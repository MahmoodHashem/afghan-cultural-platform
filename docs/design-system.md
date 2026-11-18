# Mirasaf Design System

Version 2.0 — the "reference" redesign (branch `design/reference-migration`).

This document describes the visual language of میراث افغانستان (Mirasaf) as it is implemented in
`apps/web`. The source of truth is the code: tokens in `src/app/globals.css`, primitives in
`src/components/ui`, shared blocks in `src/components/common`. A live reference page is available
at `/ui` in development (or with `NEXT_PUBLIC_UI_REFERENCE=1`); it is `noindex`.

---

## 1. Principles

Mirasaf is a collaborative archive. Every screen should help people **discover** Afghan culture
and feel invited to **contribute** what they know.

- **Warm, not decorative.** Calligraphy, tiles and arches are used as quiet background marks,
  never as content. Decorative elements are `aria-hidden` and never carry meaning alone.
- **Persian first.** The whole app is RTL (`<html dir="rtl">`, Base UI `DirectionProvider
  direction="rtl"`). Use logical properties (`ps-`, `pe-`, `ms-`, `start-`, `end-`, `inset-s-`).
- **One red, used sparingly.** Red marks the primary action, the active state and section bars.
- **Invite contribution.** Empty states, page ends and guides point to `/entries/new` with plain,
  encouraging copy («دانسته‌ی خود را ثبت کنید»).
- **Accessible by default.** WCAG AA contrast, visible focus (`:focus-visible` 2px ring), status is
  never colour-only (text or icon always accompanies it), motion respects
  `prefers-reduced-motion`.

---

## 2. Tokens

Tokens are defined in three layers in `globals.css`:

1. **Raw palette** on `:root` and `.dark` (`--paper`, `--ink`, `--brand`, …).
2. **shadcn mapping** (`--background`, `--primary`, `--muted-foreground`, …) so shadcn/Base UI
   primitives follow the palette automatically.
3. **`@theme inline` utilities** that expose both as Tailwind classes.

New code should use the **palette utilities** (`bg-paper`, `text-ink`, `text-copy`, `border-line`,
`bg-brand-soft`, …). The shadcn names remain only inside `src/components/ui`.

### 2.1 Colour

| Token | Light | Dark | Use |
|---|---|---|---|
| `paper` | `#f6f7f9` | `#0f1622` | Page background |
| `surface` | `#ffffff` | `#16202e` | Cards, dialogs, inputs' container |
| `line` / `line-soft` | `#e7e9ee` / `#eef0f4` | `#233043` / `#1d2837` | Borders, dividers, skeletons |
| `ink` | `#182c41` | `#e9edf3` | Headings, strong text |
| `copy` | `#43515f` | `#b3bdc9` | Body text |
| `faint` | `#67707b` | `#8b96a4` | Meta, hints, captions |
| `brand` | `#e0253c` | `#ef4257` | Section bars, focus ring, markers |
| `brand-ink` | `#c11e33` | `#f27182` | Red text and links (AA on surface) |
| `brand-soft` | `#fdecee` | `#33202a` | Active backgrounds, icon chips |
| `primary` | `#e0253c` | `#e0253c` | Filled buttons (`primary-hover` `#c11e33`) |
| `ok` / `ok-soft` | `#157a4b` / `#e8f6ee` | `#4fd394` / `#122a1e` | Success, published |
| `tint-navy`, `tint-sand`, `tint-rose` | pale tints | dark tints | Notes and callouts |
| `gold` | `#dfa63e` | same | Eyebrows on navy, active underline, admin active bar |

Fixed (theme-independent) colours:

| Token | Value | Use |
|---|---|---|
| `hero-navy` → `hero-navy-deep` | `#1e3854` → `#101c2b` | Page heroes, status pages, closing callouts (`bg-linear-155`) |
| `band-red-deep` | `#b41b2f` | Red feature band gradient end (`from-primary to-band-red-deep`) |
| `footer` | `--footer-bg` | Footer and the admin sidebar |
| `lapis`, `turquoise`, `saffron`, `anar` (+ `-deep`) | tile colourways | Topic tiles, "what you can share" tiles, step numerals |
| `leaf` | `#fffaef` | Illustrated auth panel |
| `media-ph` | `#22303f` | Image placeholder behind photos |
| `scrim` | `#0d141d` | Overlay behind dialogs (`bg-scrim/50` + 3px blur) |

`saffron` is darkened from the reference (`#bd851c` → `#9a6a17`) so white text on it passes AA.

### 2.2 Typography

| Family | Variable | Use |
|---|---|---|
| **Kalameh** (400/500/600/700) | `font-sans` | All UI and reading text |
| **Reyhan** | `font-calli` | Large calligraphic watermark words only (decorative) |
| **Leila** | `font-hand` | Handwritten eyebrows ("داشبورد من"), numerals in steps and 404 |

Fonts are loaded with `next/font/local`; Reyhan and Leila have ascent/descent overrides so their
huge native metrics do not push layout.

Type scale (utility classes; smaller steps apply below 1024px / 640px):

| Class | Size / line-height | Use |
|---|---|---|
| `text-display` | 40 / 1.5 | Hero titles |
| `text-page-title` | 31 / 1.8 | Page `h1` in content pages, moderator pages, auth |
| `text-section-title` | 24 / 2 | Section headings (`SectionHead`) |
| `text-card-title` | 17 / 1.8 | Card titles |
| `text-card-title-sm` | 14.5 / 1.85 | Compact card titles |
| `text-body` | 15 / 2 | Default body |
| `text-article` | 15 / 2.25 | Long reading (Tiptap documents use 16 / 2.15) |
| `text-small`, `text-meta`, `text-micro` | 13, 12, 11.5 | Hints, meta, badges |
| `text-form-label`, `text-button` | 12.5, 13.5 | Forms and buttons |

### 2.3 Shape

| Token | Value | Use |
|---|---|---|
| `rounded-control` | 12px | Inputs, small buttons, list items |
| `rounded-card` | 18px | Cards, panels, tables |
| `rounded-media` | 22px | Media frames |
| `rounded-bubble` | 22 22 22 6 | Signature "speech bubble" corner (one sharp corner at the bottom-start) |
| `rounded-bubble-md/-sm/-xs` | 18/12/10 with 6/4/4 | Same shape at smaller sizes |
| `rounded-arch` | 999 999 12 6 | Province cards (an arch/niche) |
| `rounded-full` | — | Pills: tabs, chips, primary actions |

Arbitrary bubble radii such as `rounded-[28px_28px_28px_8px]` are used for very large surfaces
(auth card, writing sheet, closing callouts).

### 2.4 Elevation

`shadow-card` (resting), `shadow-lift` (hover / floating bars), `shadow-header`, `shadow-menu`
(popovers), `shadow-figure` (matted images), `shadow-float` (toolbars on media),
`shadow-focus` (input focus halo). Shadows are ink-tinted in light mode and darker in dark mode.

### 2.5 Motion

- Easings: `ease-expo` (default UI), `ease-spring` (small bounces), `ease-write` (reveals).
- Scroll-driven CSS: `.calli-reveal` (watermark words), `.bar-reveal` (section bars),
  `.read-progress` (reading bar in the header). Guarded by `@supports` and
  `prefers-reduced-motion: no-preference`.
- Motion (`motion/react`): `ScrollReveal` on the home page, active-tab `layoutId` pills.
  `MotionConfig reducedMotion="user"` is set globally.

### 2.6 Layout

- `content-container` 1200px, `article-container` 780px, 24px side padding (16px below 640px).
- The public header is fixed (66px). Page heroes add the offset themselves:
  `pt-[calc(4.125rem+2.5rem)] sm:pt-[calc(4.125rem+3rem)]`.
- Mobile uses the app shell (top bar 56px + bottom navigation with a raised red "افزودن" button).

---

## 3. Primitives (`src/components/ui`)

| Component | Variants worth knowing |
|---|---|
| `Button` | `default`, `outline`, `secondary`, `ghost`, `destructive`, `link`, **`pill`** (red filled pill — the main call to action), **`cta`** (outline pill that fills red on hover, for light backgrounds), **`more`** ("see all"), **`glass`** (white outline on navy/photos). Sizes incl. `lg` (46px) |
| `Badge` | `chip`, `glass`, `corner` (category on card images), `count` |
| `Input` / `Textarea` | 46px, 1.5px border, `bg-paper`, `shadow-focus` on focus |
| `Card` | `rounded-card`, `border-line-soft`, `shadow-card` |
| `Tabs` | Pill list; active tab `bg-primary` |
| Overlays | `Dialog`, `AlertDialog`, `Sheet`, `Drawer`, `Popover`, `DropdownMenu`, `Select`, `Combobox`, `Tooltip` share the scrim, bubble corners and `shadow-menu` |
| `StatusBadge` + `status-tone.ts` | Six tones (`neutral`, `info`, `warning`, `success`, `danger`, `muted`) for entry, report and user states — always with a text label |

`cn()` uses an extended `tailwind-merge` that knows the custom radius, shadow and type classes.

---

## 4. Shared blocks (`src/components/common`)

| Block | Purpose |
|---|---|
| `PageHero` | Navy band for inner pages: breadcrumb (`tone="onDark"`), handwritten eyebrow, title, description, actions, optional aside, faint calligraphy, `overlap` for matted figures |
| `SectionHead` | Section title with the red bar, optional calligraphic word behind it, optional "see all" pill; `tone="band"` for the red band, `size="prose"` inside articles |
| `EmptyState` | Dashed box with an arched niche + lamp drawing, one clear action |
| `StatusPage` | Full-height navy page for 404 and errors |
| `PageHeroSkeleton`, `EntryGridSkeleton` | Loading states matching the hero and card grid |
| `TiptapDocument` | Reading typography: red bar on `h2`, reference-style blockquote, dashed `hr` |
| `RichTextEditor` | Writing surface; selection toolbar is navy |

Feature-level reusable pieces: `ContributeBand` (red closing invitation on info pages),
`ContributionGuide` (writing tips beside the entry form), `AdminPageHeader`.

---

## 5. Page patterns

| Page | Pattern |
|---|---|
| Home | Photo hero with contribution message and prompt card → impact strip → "آنچه شما می‌دانید، میراث است" tiles → latest bento → three steps → province arches → red national band → topic chips → recently enriched → navy closing callout |
| Explore | `PageHero` + sticky toolbar (search + sort segment) + filter bar + grid with a lead card |
| Provinces / topics | `PageHero`; arch cards for provinces, tile colourways for topics |
| Reading | Hero with matted figure overlap; 3 columns on desktop: action rail, article, sticky TOC/taxonomy; "شما هم چیزی می‌دانید؟" note |
| About / contact / FAQ / legal | `InformationPage` (hero + reading column); FAQ has a sticky group index |
| Auth | One large bubble card: form + illustrated panel (desktop) |
| Profile | Navy dashboard band with avatar and stats; floating pill tabs; card lists |
| Create / edit | Floating toolbar, writing sheet card, `ContributionGuide` column |
| Moderator | Navy "میز بررسی" band with pill navigation overlapping it |
| Admin | Navy sidebar (gold active bar), `AdminPageHeader`, card tables |
| 404 / error | `StatusPage` |

---

## 6. Decorative language

- **Calligraphy watermarks** (`font-calli`, 5–10% opacity, large, bleeding off the inline-end edge):
  short words tied to the page (میراث، روایت، سرزمین، امانت…).
- **Tile colourways**: lapis, turquoise, saffron, anar gradients with an inner border and the
  eight-point star mark (`/images/star-icon.png`).
- **Line drawings**: the footer skyline (mountains, a minaret, a dome), the niche with a lamp.
- **Handwritten eyebrows** (`font-hand`, gold on navy, saffron on light).
- Never copy third-party logos, illustrations or portraits.

---

## 7. Writing and copy

- Address the reader directly and warmly («شما»), short sentences, Dari/Persian of Afghanistan.
- Contribution prompts are concrete: a folk tale from elders, a local wedding custom, an old fort
  nearby, a fading craft.
- Reassure: «به زبان ساده و خودتان»، «بدون نیاز به تخصص»، «بازبینی پیش از انتشار».
- Do not promise what the product does not do.

---

## 8. Contributing to the system

- Use tokens; avoid hex values and arbitrary shadows in feature code. Arbitrary sizes are fine
  for one-off layout values.
- Add new variants to the primitive (`cva`) rather than overriding classes at call sites.
- Keep RTL, reduced motion and AA contrast in mind; check light and dark themes.
- Biome is the only formatter/linter. Before finishing frontend work run `pnpm check`,
  `pnpm typecheck:web`, `pnpm test:web` and `pnpm build:web`.
