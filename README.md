# Noah Jones — Portfolio

> [!note]
> **Site link**: 
> [portfolio site](http://noah-jones-dev.github.io/ProjectPortfolio)

A personal portfolio site covering my QA engineering work, desktop apps, and
Unreal Engine 5 games. Built with plain HTML, CSS, and JavaScript — no
frameworks, no build step, no `npm install` needed to run it.

**[→ Read `docs/STRUCTURE.md`](docs/STRUCTURE.md)** for the deeper walkthrough of
*why* each technique was chosen, with the web best practices behind them.

---

## Contents

- [Running it](#running-it)
- [What's in each file](#whats-in-each-file)
- [How the page is laid out](#how-the-page-is-laid-out)
- [The three moving parts](#the-three-moving-parts)
- [Common edits](#common-edits)
- [Anatomy of a project card](#anatomy-of-a-project-card)
- [Rules worth not breaking](#rules-worth-not-breaking)
- [Troubleshooting](#troubleshooting)
- [Deploying](#deploying)

---

## Running it

Two ways. The second is better, and here's why.

### Option A — just open the file

Double-click `index.html`. It opens in your browser and works.

### Option B — a local server (recommended)

```bash
python3 -m http.server 8080
```

Then visit <http://localhost:8080>.

**Why bother?** Opening a file directly uses the `file://` protocol. Most things
work, but the moment you add anything that *loads* something — fonts, a JSON
file, images fetched by script — browser security rules block it, and the error
messages point nowhere near the real cause. Getting into the habit now saves you
that afternoon later.

To stop the server, press `Ctrl+C`.

---

## What's in each file

| File | Lines | What it's for |
|---|---|---|
| `index.html` | ~700 | Structure and content. Every word visible on the page. |
| `styles.css` | ~900 | All visual design, both themes, all animation. |
| `script.js` | ~330 | Interactivity — 9 independent features. |
| `docs/STRUCTURE.md` | — | The teaching document: how and why. |
| `docs/screenshots/` | — | Reference captures of every section, both themes. |
| `.gitignore` | — | Keeps `node_modules/` out of the repo. |

**Three files is the whole site.** That's the point of skipping a framework.

Every file opens with a **CONTENTS block** listing its sections in order, so you
can find things by scrolling to a banner comment rather than hunting.

---

## How the page is laid out

Top to bottom in `index.html`:

```
<head>            metadata, favicon, stylesheet, anti-flash theme script
.skip-link        keyboard shortcut past the nav
.blobs            three drifting background shapes (decorative)
<header .nav>     sticky navigation + theme toggle
<main>
  .hero           name, tagline, buttons, animated stat counters
  #about          bio + quick-facts panel
  #work           filter chips + 8 project cards
  #games          3 NoJo Studios game cards
  #skills         6 skill groups + specialties banner
  #contact        4 contact cards
<footer>          copyright + back-to-top
```

Each of those regions has a big banner comment in the HTML explaining what it's
for and how to edit it.

---

## The three moving parts

Understanding these three ideas is most of understanding the codebase.

### 1. Design tokens — why theming is nearly free

Every colour, size, and timing is a **CSS variable** declared once at the top of
`styles.css`:

```css
:root {
  --bg:   #0B0A10;
  --text: #F2F0F7;
  --c1:   #FF2E97;   /* magenta */
}
```

Nothing below that block hardcodes a colour — it's `var(--bg)` everywhere. Light
mode is then just *the same variable names with different values*:

```css
:root[data-theme="light"] {
  --bg:   #FBF9FF;
  --text: #171221;
  --c1:   #D6157E;
}
```

Flip `data-theme` on `<html>` and the entire site recolours. **To change any
colour on this site, you only ever edit section 1 of `styles.css`.**

### 2. JavaScript toggles classes; CSS does the animating

This is the pattern used everywhere here:

```js
// script.js — just flips a class
card.classList.toggle('is-open');
```

```css
/* styles.css — does the actual work */
.card.is-open .accordion__panel { grid-template-rows: 1fr; }
```

The browser can run CSS animation on the GPU, and you can restyle the entire
site without touching the JavaScript. **Any class starting `is-` is owned by
`script.js`** — `is-open`, `is-visible`, `is-hidden`, `is-active`, `is-scrolled`,
`is-current`.

### 3. Class naming (BEM-ish)

```
.card          the component        ("block")
.card__title   a part inside it     ("element", double underscore)
.card--game    a variant of it      ("modifier", double dash)
.is-open       a state set by JS
```

You can tell what any class does from its shape, which matters a lot when you
come back in six months.

---

## Common edits

### Change a colour

`styles.css`, section 1. Nowhere else.

> ⚠️ If you brighten a light-theme accent, check the contrast — see
> [Rules worth not breaking](#rules-worth-not-breaking).

### Add a project

1. Copy the whole `<article class="card">` block for **Practice Test Tool** in
   `index.html` — it's the fully annotated reference card.
2. Change the title, description, tags, and GitHub link.
3. Set `data-cat` to `web`, `mobile`, or `desktop`.
4. **Give the accordion a new unique id.** The button's `aria-controls="d-xyz"`
   and the panel's `id="d-xyz"` must match each other and be unique on the page.

### Add a game

Same, but copy a `<article class="card card--game">` from `#games` and add a
gradient class in `styles.css` next to `.card__art--crc`.

### Add a filter category

1. Add a chip: `<button class="chip" type="button" data-filter="tools">Tools</button>`
2. Set matching `data-cat="tools"` on the relevant cards.

No JavaScript changes needed — the filter uses event delegation, so new chips
work automatically.

### Update the hero numbers

Change the `data-count` attribute, not the `0` between the tags:

```html
<dd data-count="9">0</dd>
```

### Add another copy-to-clipboard button

The copy logic is wired to **any** element carrying a `data-copy` attribute, so
no JavaScript changes are needed:

```html
<button class="copybtn" type="button"
        data-copy="the text to copy"
        aria-label="Copy something to clipboard">…</button>
```

It shows a toast, swaps to a tick for a moment, and falls back to the legacy
copy method when the modern Clipboard API isn't available (e.g. over plain
`http://` or from a `file://` path).

### Update your résumé

**Do it in Google Drive, not here.** The site embeds one Drive file by its ID,
and Drive serves whatever that file currently contains:

> Drive → right-click the PDF → **File information** → **Manage versions**
> → **Upload new version**

The file ID stays the same, so the preview and the download button both show
the new version immediately. No commit, no deploy.

**The trap:** uploading a *new* file per version (`Resume 2025.9`,
`Resume 2026`, …). Each new file gets a new ID, the page keeps pointing at the
old one, and the site quietly goes stale. Same file, new version.

The PDF must be shared as **Anyone with the link → Viewer**, or visitors get a
Google sign-in wall instead of the document.

### Add a nav link

Add an `<a href="#yourSection">` inside `.nav__links`. Smooth scrolling and the
active-link underline both work automatically.

### Swap the game placeholders for real screenshots

Replace the emoji `<span>` inside `.card__art` with:

```html
<img src="assets/bored-crc.jpg" alt="Bored CRC Specialist gameplay"
     width="800" height="450" loading="lazy">
```

Always set `width`/`height` (stops the page jumping as images load), use
`loading="lazy"` below the fold, and export to WebP or JPEG under ~200 KB.

---

## Anatomy of a project card

```html
<article class="card reveal" data-cat="desktop">   <!-- filter group -->
  <div class="card__glow"></div>                   <!-- hover glow layer -->
  <header class="card__head"> … </header>          <!-- icon, title, language -->
  <p class="card__desc"> … </p>                    <!-- the skim-able summary -->
  <ul class="tags"> … </ul>                        <!-- tech tags -->

  <button class="accordion__trigger"               <!-- the Details toggle -->
          aria-expanded="false"
          aria-controls="d-practicetest">…</button>

  <div class="accordion__panel" id="d-practicetest" hidden>
    <div class="accordion__inner"> … </div>        <!-- REQUIRED wrapper -->
  </div>
</article>
```

Two things people get wrong when copying this:

- **`aria-controls` must equal the panel's `id`,** and that id must be unique.
  Duplicate ids mean clicking one card toggles a different one.
- **Don't delete the inner `<div>`.** The expand animation needs a child to clip
  with `overflow: hidden`. Without it the panel won't collapse.

---

## Rules worth not breaking

These are the ones that cause real, visible damage:

| Rule | What breaks if you don't |
|---|---|
| Never `outline: none` on focus styles | Keyboard users can't see where they are. Site becomes unusable for them. |
| Animate `transform` / `opacity` only | Animating `width`, `height`, `top`, `margin` forces layout recalculation every frame → visible jank. |
| Keep the `prefers-reduced-motion` block | It disables motion **without hiding content**. If you only disabled transitions, `.reveal` elements would stay invisible forever. |
| Contrast ≥ 4.5:1 for normal text | Text becomes unreadable for low-vision users. Neon colours on white almost always fail — the light-theme cyan here had to be deepened to `#01718C`. |
| Use real `<button>` elements | A `<div>` with a click handler isn't focusable, ignores Enter/Space, and is invisible to screen readers. |
| Keep `rel="noopener noreferrer"` on `target="_blank"` | Without `noopener`, the opened page can redirect *your* tab via `window.opener`. |
| Keep the `<noscript>` block | Without it, a visitor with JS disabled can't open detail panels — so the GitHub links inside become unreachable. |
| Keep `aria-live` on the filter status | Filtering becomes completely silent to screen-reader users. |

Check contrast with browser DevTools: inspect any text, click the colour swatch,
and it shows the ratio and whether it passes.

---

## Troubleshooting

**The accordion doesn't open.**
`aria-controls` on the button doesn't match the panel's `id`, or that id is used
twice on the page.

**The accordion opens but won't animate.**
The inner `<div class="accordion__inner">` was removed, or the panel isn't
`display: grid`.

**A card vanished from every filter.**
Its `data-cat` doesn't exactly match any chip's `data-filter`. Values are
case-sensitive.

**The page flashes dark before going light.**
The inline script in `<head>` was moved or deleted. It has to run *before* the
browser paints, which is why it can't live in `script.js`.

**Sections never fade in / stay invisible.**
JavaScript threw an error before `initReveal()` ran. Open DevTools → Console.
`.reveal` elements start at `opacity: 0`, so a JS failure leaves them hidden.

**Everything is 40px too wide.**
Something is overriding `box-sizing: border-box`.

**Text is tiny on mobile.**
The `<meta name="viewport">` tag was removed from `<head>`.

**The page scrolls sideways on a phone.**
Something is wider than the viewport. Find it in DevTools console:

```js
document.documentElement.scrollWidth - document.documentElement.clientWidth
```

Above 0 means overflow. Don't paper over it with `overflow-x: hidden` — and
never put that on `<html>`, because it can break the sticky nav. Fix the wide
element. This is what caused the nav to push its theme toggle off-screen at
320px before the nav was made to wrap.

**A card stays lifted after I tap it on my phone.**
That's `:hover` sticking, because touchscreens have no cursor to move away.
The `@media (hover: none)` block in section 15 of `styles.css` resets it — if
you add a new hover effect, add its reset there too.

**The hero title is enormous when I rotate my phone sideways.**
`vw` units don't know the screen's height. Size it with a height-keyed media
query, as the landscape block in section 14 does.

---

## Deploying to GitHub Pages (free)

1. Push to GitHub.
2. Repo → **Settings** → **Pages**.
3. *Source*: **Deploy from a branch**.
4. Branch `main`, folder `/ (root)`. Save.
5. Wait ~1 minute. Live at
   `https://noah-jones-dev.github.io/ProjectPortfolio/`.

Because there's no build step, Pages serves these files exactly as they are.
That's the main practical payoff of skipping a framework.

---

## Links

- **GitHub** — [noah-jones-dev](https://github.com/noah-jones-dev)
- **LinkedIn** — [noah-jones-sqa](https://www.linkedin.com/in/noah-jones-sqa)
- **Games** — [NoJo Studios on itch.io](https://nojo-studios.itch.io/)
