# Design: "Field Notes"

This is the design philosophy for the blog (and, by extension, the shared
site chrome — nav/footer/portfolio/resume inherit it too). It exists so
future pages/content follow the same reasoning instead of each becoming a
one-off. If you're adding a page, a component, or new content, start here.

## The idea

A technical journal, not a marketing page. Two forces held in tension:
**mono = code/technical**, **serif = journal/personal**. Every typography
and layout decision traces back to that duality — if a new element doesn't
obviously belong to one side or the other, that's a sign it needs more
thought, not a coin flip.

This was a deliberate reaction against two defaults: the Statue-ssg
reference site's dark/bold marketing aesthetic (not what this is — a
personal blog isn't selling a product), and the generic "AI-generated
design" cliché of warm-cream-background + serif-display + terracotta-accent
(avoided specifically by using mono, not serif, for display type).

## Palette

Warm paper, single accent. The table below is the light theme (`notebook`,
the default); a `notebook-dark` variant inverts these tokens — see
**Restraint**.

| Token                | Hex       | Use                                                             |
| -------------------- | --------- | --------------------------------------------------------------- |
| `base-100`           | `#F1ECE1` | page background (paper)                                         |
| `base-200`           | `#FBF8F2` | card/surface background                                         |
| `base-300`           | `#DDD3C0` | borders                                                         |
| `base-content`       | `#2B2620` | body text (ink)                                                 |
| `primary` / `accent` | `#AD4E27` | the **only** accent — links, one CTA, the interview left-border |

Muted text is `base-content` at reduced opacity (`/50`, `/60`, `/70`), not
a separate gray scale — one ink color, several strengths.

**Rule: never hardcode a Tailwind color utility** (`bg-slate-50`,
`text-blue-600`, etc.) in a route or component. Always use the daisyUI
semantic tokens (`bg-base-100`, `text-primary`, `border-base-300`, ...)
defined in the `notebook` theme in `src/lib/index.css`. This is what makes
a future re-theme a one-file change instead of a site-wide grep-and-replace
— which is exactly the situation this redesign started from.

## Type

- **IBM Plex Mono** — headlines, nav, dates, labels, eyebrows. The "code"
  half.
- **IBM Plex Serif** — body copy, prose. The "journal" half.

One type family, two purpose-built cuts, not a random pairing. Jost (the
previous font) is retired. When in doubt about which cut a new UI element
should use: if it's metadata/UI-chrome/a label, it's mono; if it's
something a reader would read at length, it's serif.

## Components

daisyUI (`btn`, `card`, `rounded-box`/`rounded-field`, etc.) over hand-rolled
utility soup. Chosen over shadcn-svelte because this is a static content
site with almost no interactive UI (no dialogs, dropdowns, popovers) —
daisyUI's pure-CSS theme-token approach fits; a JS-primitive component kit
would mostly sit unused.

## Signature element: the interview format

A distinct post template for Q&A-style posts, alongside normal prose posts.
Chosen because the user wants to write interview-style journal entries —
this needed a real, distinguishable presentation, not just "prose with bold
question lines."

**Authoring**: add to a post's frontmatter —

```yaml
format: interview
qa:
  - q: Question text
    a: Answer text, rendered as markdown (mermaid fences work too)
  - pause: Optional caption for a session break
  - q: Another question
    a: Another answer
```

When `format: interview` is set, the post body (markdown content) is
**ignored** — only `qa` renders, as an annotated transcript. Each turn
applies the site's own mono/serif duality: `q` is a small muted mono
eyebrow (metadata voice), `a` is compiled through the same markdown +
mermaid pipeline as a regular post body and rendered in the serif body
face (reading voice), with the rust accent on the `A` label and the
left-border. A `{ pause: "..." }` entry (no `q`/`a`) renders as a quiet
hairline divider with a caption — for marking a break in a long interview,
no animation. Regular posts (no `format` field) render their markdown
body as prose, unchanged.
No post uses this format yet, so the frontmatter block above is the
reference rather than a file. The implementation is `compileQaTurns` in
`src/lib/cms/content-processor.js` (which puts each `a` through the same
markdown + mermaid pipeline as a body) and the `isInterview` branch in
`src/lib/components/BlogPost.svelte` — not in a route file.

## Reading width

Three presets — Cozy / Comfortable (default) / Wide — toggled from the
header's settings dropdown, persisted via `localStorage`. Two CSS custom
properties drive it: `--content-w` sizes the page shell (header/main/
footer share one column width) and `--prose-w` sizes article body text
independently, so widening the shell never stretches prose past a
readable measure — `.prose`'s own max-width is overridden per preset
(`article.prose, div.prose` in `src/lib/index.css`) instead of neutralized
with `max-w-none`. Article titles/headers stay siblings _before_ the
`.prose` block (see `src/routes/blog/[slug]/+page.svelte`), never nested
inside it, so they always span the full shell width regardless of preset.

## Restraint

- Dark mode is an explicit user toggle, not an OS-driven auto-switch: a
  `notebook-dark` daisyUI theme inverts the palette (light theme's ink
  becomes the dark bg, light theme's paper becomes the text, same rust
  accent lightened for AA contrast), persisted via `localStorage`.
- No second accent color/hue — `accent` reuses `primary` on purpose, in
  both themes.
- No decorative motion. The interview format is the one memorable thing;
  everything else stays quiet.
