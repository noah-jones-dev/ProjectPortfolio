# How this site is built

A walkthrough of the portfolio, written for someone who hasn't built a website
before. Every section explains *what* the code does and *why* it was done that
way — including the places where the obvious approach is the wrong one.

---

## 1. The three-file split

```
index.html    STRUCTURE + CONTENT   what the page says
styles.css    PRESENTATION          what it looks like
script.js     BEHAVIOUR             what happens when you interact
```

This is called **separation of concerns**, and it's the oldest good idea on the
web. You *can* put styles and scripts directly inside your HTML. It works. It
also means that six months from now, changing one colour requires hunting
through hundreds of lines of markup.

The test for whether you've got the split right: *could you completely redesign
this site by editing only `styles.css`?* Here, the answer is yes.

**Rule of thumb:** if you're writing `style="..."` directly on an HTML element,
stop and ask whether it belongs in the stylesheet. It almost always does.

---

## 2. The page skeleton

```
<header class="nav">        sticky navigation + theme toggle
<main id="main">
  <section class="hero">    name, tagline, buttons, live stat counters
  <section id="about">      bio + quick-facts panel
  <section id="work">       filter chips + 8 project cards
  <section id="games">      2 game cards
  <section id="skills">     6 skill groups
  <section id="contact">    4 contact cards
</main>
<footer class="footer">
```

### Why semantic tags matter

Notice there are almost no plain `<div>`s in that outline. It's `<header>`,
`<main>`, `<section>`, `<article>`, `<footer>`, `<nav>`.

A `<div>` means nothing. It's a generic box. `<section>` and `<article>` tell
the browser, search engines, and screen readers *what a chunk of the page is*.

This is not cosmetic:

- **Screen readers** let blind users jump directly between landmarks. With
  `<div>` soup, there's nothing to jump between — they have to hear the whole
  page top to bottom.
- **Search engines** weight content in semantic containers more confidently.
- **Future you** can read the outline and understand the page instantly.

**Best practice:** reach for the tag that describes the meaning. Use `<div>`
only when you genuinely just need a box to hang styling on.

### One `<h1>` per page

The page has exactly one `<h1>` (my name), then `<h2>` for each section, `<h3>`
for cards, `<h4>` inside detail panels. Headings form an outline — like a table
of contents.

**The mistake to avoid:** picking a heading level because of how big it looks.
If `<h2>` is too big, make it smaller in CSS. Never skip from `<h1>` to `<h4>`
to get the size you want — you break the outline for everyone navigating by it.

---

## 3. Design tokens: why theming is easy here

At the top of `styles.css`:

```css
:root {
  --bg:   #0B0A10;
  --text: #F2F0F7;
  --c1:   #FF2E97;   /* magenta */
  --c2:   #00E5FF;   /* cyan    */
  --c3:   #7C3AED;   /* violet  */
}
```

These are **CSS custom properties** (variables). Everything below references
them — `background: var(--bg)`, never `background: #0B0A10`.

Light mode is then just the *same variable names with different values*:

```css
:root[data-theme="light"] {
  --bg:   #FBF9FF;
  --text: #171221;
  --c1:   #D6157E;
  ...
}
```

Flip `data-theme` on the `<html>` element and every colour on the page changes
at once. No JavaScript touches individual elements. That's the payoff of never
hardcoding a colour.

### The trap: neon colours don't survive on white

The dark theme uses cyan `#00E5FF`. On a near-black background it's crisp. On
white it's nearly invisible — there isn't enough contrast.

So the light theme deepens every accent: cyan becomes `#0286A6`, magenta becomes
`#D6157E`. Same *hue*, much darker.

**Best practice:** WCAG (the accessibility standard) asks for a contrast ratio of
at least **4.5:1** between normal text and its background. Bright, saturated
colours on white almost always fail. Test with your browser's DevTools — inspect
any text, and the colour picker shows the contrast ratio and whether it passes.

**The bigger principle:** never use colour as the *only* way to communicate
something. Around 1 in 12 men has some form of colour blindness. On this site,
the filter chips don't just change colour when active — they change background
weight and gain a shadow too.

---

## 4. Layout: Flexbox vs Grid

Both are used, for different jobs.

**Flexbox** — one direction, content-sized. The nav bar, tag lists, button rows:

```css
.tags { display: flex; flex-wrap: wrap; gap: 0.38rem; }
```

**Grid** — two dimensions, or when you want equal columns:

```css
.grid {
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 1.15rem;
}
```

That one line is the entire responsive card layout. Read it as: *"fit as many
columns as you can, each at least 320px wide, sharing leftover space equally."*

Three columns on a desktop, two on a tablet, one on a phone — with **no media
queries at all**. The browser does the maths.

### `auto-fit` vs `auto-fill` — a real bug I hit

The Games section has only two cards. With `auto-fill`, the browser reserves
empty column slots, so the two cards sat in the left two-thirds with a dead gap
on the right. `auto-fit` *collapses* the empty tracks, letting the real cards
stretch to fill the row.

**Rule:** `auto-fit` when you want items to expand and fill; `auto-fill` when
you want a consistent grid even if it's half empty.

### Equal-height cards

The grid uses `align-items: stretch` so every card in a row is the same height,
combined with `margin-top: auto` on the Details button to pin it to the bottom.
That's what makes the buttons line up in a neat row instead of floating at
whatever height each card's text happened to end at.

---

## 5. The accordion — and the trick that makes it animate

You asked for expandable detail panels, and they're the most technically
interesting part of the build.

**The problem:** CSS cannot animate `height: auto`. It's the single most common
"why doesn't this work" in web development. The browser needs two concrete
numbers to interpolate between, and `auto` isn't a number.

**The workaround** (a genuinely modern CSS trick):

```css
.accordion__panel {
  display: grid;
  grid-template-rows: 0fr;                 /* collapsed */
  transition: grid-template-rows 420ms;
}
.card.is-open .accordion__panel {
  grid-template-rows: 1fr;                 /* expanded */
}
.accordion__inner { overflow: hidden; }
```

Grid *fractions* are numbers, so `0fr → 1fr` animates smoothly — and the content
still sizes itself naturally. No JavaScript measuring heights, no hardcoded
pixel values that break when you edit the text.

### Making it work for screen readers

The visual chevron rotating is meaningless if you can't see it. So the button
carries state in markup:

```html
<button class="accordion__trigger" aria-expanded="false" aria-controls="d-counter">
```

- `aria-expanded` — JavaScript flips this to `"true"` on open. A screen reader
  announces "expanded" / "collapsed".
- `aria-controls` — points at the `id` of the panel it opens.

**And a subtle one:** when the panel is collapsed, its links are still in the
DOM. Without care, a keyboard user tabbing through the page would land on
invisible links inside closed panels — deeply confusing. The fix is
`visibility: hidden` on the collapsed inner wrapper, which removes it from the
tab order while still permitting the height transition.

**Best practice:** it must be a real `<button>`. A `<div>` with a click handler
isn't focusable, doesn't respond to Enter or Space, and is invisible to
assistive tech. Native elements give you all of that free.

---

## 6. Progressive enhancement

The detail panels are collapsed by JavaScript. So what happens if JavaScript
fails to load?

Without a fallback: the panels stay collapsed, the buttons do nothing, and the
GitHub links *inside* those panels become permanently unreachable.

The fix is in `index.html`:

```html
<noscript>
  <style>
    .accordion__panel  { display: block !important; }
    .accordion__trigger { display: none !important; }
  </style>
</noscript>
```

No JavaScript? Every panel is simply open and the toggle buttons disappear. The
content is always reachable.

**The principle:** build so the content works first, then layer enhancements on
top. JavaScript should make a working page *nicer*, not be the thing that makes
it work at all.

---

## 7. Animation

You chose "playful but tasteful," which mostly means knowing what *not* to
animate.

### Only animate `transform` and `opacity`

Rendering a frame has stages: **layout** (where things go) → **paint** (what
colour) → **composite** (stack the layers).

- Animating `width`, `height`, `top`, `margin` → triggers **layout** → the
  browser recalculates the position of everything. Expensive. Janky.
- Animating `transform` and `opacity` → **composite only** → handled by the GPU.
  Smooth, essentially free.

So cards lift with `transform: translateY(-6px)`, never `top: -6px`. Identical
look, completely different performance.

### Easing is where "cheap" or "polished" is decided

```css
--ease:     cubic-bezier(0.22, 0.61, 0.36, 1);   /* smooth settle  */
--ease-pop: cubic-bezier(0.34, 1.56, 0.64, 1);   /* slight bounce  */
```

`linear` motion feels robotic — nothing in the physical world moves at constant
speed. The `1.56` in the second curve overshoots slightly past the target and
settles back. That tiny bounce is what makes the icons and chevron feel alive.

### A shadow inside a clipped container

A bug worth knowing, because it looks like a rendering glitch and isn't.

The "View on GitHub" button showed a **pale square block** around its pill
shape. The button is fine; the container is the problem.

`.accordion__inner` must keep `overflow: hidden` — that's what clips the
content while the `0fr → 1fr` height animation runs. The button sits *flush*
against that container's left and bottom edges, zero gap. Its shadow
(`0 8px 24px`) needs about 24px to each side and 32px below.

So the browser drew the soft glow, then the clip sliced it off — leaving
dead-straight vertical and horizontal edges. A blurred shadow with square
corners doesn't read as a shadow; it reads as a stray coloured rectangle.

```css
.btn--small,
.btn--small:hover { box-shadow: none; }
```

**The general rule:** a blurred shadow needs clear space around its element.
`overflow: hidden` on any ancestor will cut it into a hard edge. Either give
the element room — padding on the container — or don't draw the shadow.

**How to diagnose this class of bug:** don't guess, bisect. Toggle one
property at a time in DevTools and see which one makes the artifact vanish.
Here, `box-shadow: none` fixed it while `overflow: visible` and
`transition: none` changed nothing — which pinned the cause to the shadow in
one step rather than three theories.

### Duration

Interface animation lives between **150ms and 400ms**. Under 100ms reads as an
instant jump; over 500ms and people feel like they're waiting on the site.
Hovers are fast (140ms), panel expansions slower (420ms) because more is moving.

### The counters

The hero numbers count up using `requestAnimationFrame` with an easing curve:

```js
const eased = 1 - Math.pow(1 - progress, 3);   // easeOutCubic
```

Fast at first, gently settling. `requestAnimationFrame` syncs to the display's
refresh rate — the right tool for this. `setInterval` would drift and stutter.

### Reveal on scroll

Sections fade up as they enter the viewport, using `IntersectionObserver`:

```js
const observer = new IntersectionObserver((entries, obs) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add('is-visible');
    obs.unobserve(entry.target);          // reveal ONCE
  });
});
```

The old way was listening to every scroll event and calculating positions —
which fires hundreds of times a second and makes scrolling stutter.
`IntersectionObserver` lets the browser do it natively and tells you only when
something actually crosses the threshold.

Note `obs.unobserve()`. Without it, elements re-animate every time you scroll
past. Charming once, irritating by the third time.

---

## 8. Accessibility — the parts that matter most

This is where portfolio sites usually fall down, and it's very visible to
anyone technical looking at your work.

### Respect reduced motion

Some people get genuine motion sickness from drifting, parallaxing interfaces,
and set an OS-level preference saying so. Honouring it is not optional:

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.001ms !important;
    transition-duration: 0.001ms !important;
  }
  .reveal { opacity: 1; transform: none; }
  .blob   { animation: none; }
}
```

Critically, `.reveal` is reset to visible. Elements start at `opacity: 0` and are
revealed by transition — if you only disabled transitions, content would stay
invisible forever. **Disabling animation must never hide content.**

`script.js` checks the same preference and skips the counter animation and
cursor-tracking entirely.

### Never remove focus outlines

```css
:focus-visible {
  outline: 3px solid var(--c2);
  outline-offset: 3px;
}
```

You will find advice online saying `outline: none` to "clean up" the design.
**Don't.** Keyboard users navigate entirely by that ring; removing it makes the
site unusable for them. If you dislike the default, restyle it — as here.

`:focus-visible` (rather than `:focus`) is the modern refinement: the ring shows
for keyboard navigation but not on mouse clicks. Best of both.

### Announce changes that only happen visually

When you click a filter chip, cards disappear. A sighted user sees it instantly.
A screen reader user gets *nothing* — the page silently changed.

```html
<p class="filter-status" role="status" aria-live="polite"></p>
```

JavaScript writes "Showing 2 projects in this category." into it, and
`aria-live="polite"` makes the screen reader announce it at the next natural
pause.

### The skip link

The first focusable element on the page:

```html
<a class="skip-link" href="#main">Skip to content</a>
```

Invisible until focused. Keyboard users otherwise have to tab through every nav
link on every visit. One line of HTML, enormous quality-of-life difference.

### Alt text and decoration

The floating background blobs are `aria-hidden="true"` — they're pure
decoration, and announcing them would be noise. Conversely, any *meaningful*
image needs `alt` text describing it.

**The rule:** decorative → hide it from assistive tech. Meaningful → describe it.

---

## 8b. Copy to clipboard — more subtle than it looks

The email card does two things: tapping it opens your mail app, and a small
button copies the address. Four things had to be got right.

### Why it isn't one big link

A `<button>` cannot be nested inside an `<a>`. Nested interactive elements are
invalid HTML, and browsers and screen readers handle them unpredictably — you
get one control where you meant two, and keyboard focus order goes strange.

So the email card is a plain `<div>` holding two separate controls: an `<a>` for
the mailto and a `<button>` for the copy. The other three contact cards are
still a single `<a>`, because they only do one thing.

**Rule:** one interactive element per interactive element. If a card needs two
actions, the card itself stops being the control.

### Why the mailto doesn't fire when you copy

The copy button sits inside the card, so a click on it would bubble up and also
trigger the link:

```js
event.preventDefault();    // don't follow the link
event.stopPropagation();   // don't let the click bubble any further
```

Without these two lines, copying the address also launches your mail client —
which is exactly what someone pressing "copy" is trying to avoid.

### Why there are two copy implementations

```js
if (navigator.clipboard && window.isSecureContext) {
  return navigator.clipboard.writeText(text);
}
// ...otherwise fall back to a hidden textarea + execCommand('copy')
```

`navigator.clipboard` is the modern API, but it only exists in a **secure
context** — `https://` or `localhost`. Open the page from a `file://` path or
serve it over plain `http://` and it's simply `undefined`. The deprecated
`execCommand('copy')` still works essentially everywhere, so it's the fallback.

Note the fallback puts its temporary `<textarea>` off-screen with
`position: fixed; top: -1000px` rather than `display: none` — **the browser
cannot select text inside an element it isn't rendering.** It's removed in a
`finally` block so it's cleaned up even if the copy throws.

Both approaches also require a genuine user gesture. Browsers block clipboard
writes that aren't tied to a real click, so a page can't silently hijack what
you've copied.

### Why the confirmation is a toast, not an alert

`alert()` freezes the entire page until dismissed, can't be styled, and reads as
a browser error rather than a confirmation.

The toast is a fixed-position element that slides up, waits, and slides away. It
uses `pointer-events: none` so it can never block a click on whatever it covers,
and it animates only `transform` and `opacity`.

The accessibility half matters as much as the visual:

```html
<div class="toast" role="status" aria-live="polite"></div>
```

Writing text into a live region is what makes a screen reader announce it. A
purely visual confirmation tells a non-sighted visitor nothing.

And the failure case is handled — if both copy methods fail, the toast says
*"Press Ctrl+C to copy: …"* rather than silently doing nothing. **Never leave
someone guessing whether a control worked.**

---

## 9. Performance

The whole site is roughly 60 KB of HTML, CSS, and JS. For comparison, a single
unoptimised photo is often 2 MB. The main things that keep it fast:

- **No frameworks.** React would add ~140 KB before a single word of your
  content. For a portfolio, that's a lot of cost for no benefit.
- **No web fonts.** The site uses the system font stack, so text renders
  instantly with zero download. A custom font is typically 100 KB+ and causes
  the flash of invisible text you see on slow sites.
- **`defer` on the script.** `<script src="script.js" defer>` downloads the file
  in parallel with parsing the HTML, then runs it after. Without `defer`, the
  browser stops parsing and waits.
- **`passive: true` on scroll listeners.** Promises the browser you won't call
  `preventDefault()`, so it can scroll without waiting for your code.

### The one inline script

There's a small script in `<head>` that runs *before* anything renders. This is
the exception that proves the rule about keeping JS in its own file.

If theme loading waited for `script.js`, a visitor who chose light mode would
see a dark flash on every page load. Setting `data-theme` before first paint
eliminates it. This pattern is sometimes called the "FOUC killer" (flash of
unstyled content).

---

## 10. Mobile

The CSS is written **mobile-considerate**: fluid units first, media queries only
where layout genuinely must change.

```css
font-size: clamp(3.2rem, 13vw, 8.5rem);
```

`clamp(minimum, preferred, maximum)` — never smaller than `3.2rem`, never larger
than `8.5rem`, otherwise 13% of viewport width. One line replaces about four
media queries, and it scales smoothly rather than jumping at breakpoints.

Four real breakpoints exist (880px, 680px, 430px, and one keyed to *height*),
each placed where *the design breaks*, not at named device sizes. Chasing "the
iPhone size" is a losing game — there are hundreds, and they change yearly.
Resize the window until it looks wrong, then add a breakpoint there.

### Three bugs found by actually testing on small screens

Testing at 320px (iPhone SE) turned up problems that were invisible at 390px.

**1. The whole page scrolled sideways.**

The sticky nav is a flex row: brand + links + theme toggle. At 320px it needed
378px, and with `flex-wrap: nowrap` the toggle was pushed off-screen — dragging
the entire document with it.

The tempting fix is shrinking the font until it fits. The better one is letting
the nav wrap:

```css
@media (max-width: 430px) {
  .nav        { flex-wrap: wrap; }
  .nav__links { order: 3; width: 100%; justify-content: space-between; }
}
```

Brand and toggle share row one, links spread across row two. `order: 3` moves
the links visually without touching the HTML.

**Diagnosing this class of bug** — one line in the console tells you whether a
page overflows, and this is worth remembering:

```js
document.documentElement.scrollWidth - document.documentElement.clientWidth
```

Anything above 0 means something is too wide. To find the culprit, loop over
every element and report any whose `getBoundingClientRect().right` exceeds the
viewport width.

> Note `body { overflow-x: hidden }` *hides* this symptom without fixing it.
> Worse, putting `overflow-x: hidden` on `<html>` can silently break
> `position: sticky`, because an overflow container becomes the scroll context.
> Fix the element that's too wide.

**2. Hover states stuck after tapping.**

Touchscreens have no cursor, so a tap fires `:hover` — and it *stays* applied
until you tap elsewhere. Cards sat permanently lifted and glowing.

```css
@media (hover: none) {
  .card:hover { transform: none; box-shadow: none; }
}
```

`(hover: none)` targets devices that genuinely can't hover, so desktops and
touch-screen laptops keep their effects. The `:active` states still fire on
press, so tapping keeps its feedback.

**3. Landscape was keyed off the wrong axis.**

A phone rotated sideways is ~844px wide, so every width-based rule treated it
like a small laptop. With `font-size: clamp(3.2rem, 13vw, 8.5rem)`, the hero
title rendered at 110px on a 390px-tall screen — one word filling the display.

The fix keys off height instead:

```css
@media (max-height: 500px) and (orientation: landscape) {
  .hero__title { font-size: clamp(2.2rem, 7vw, 4rem); }
}
```

**Lesson:** `vw` units know nothing about how tall the screen is. Any time you
size something large from viewport width, check it in landscape.

### Touch targets

Apple and Google both put the comfortable minimum around **44px**. Below that,
people miss or hit the neighbour. Only the *touchable box* grows — text size
stays as designed:

```css
@media (pointer: coarse) {
  .nav__links a, .chip, .btn { min-height: 44px; min-width: 44px; }
}
```

Both axes matter: a nav link can be 44px tall and still only 34px wide.

One deliberate exception: links inside sentences are left alone. WCAG's
target-size rule explicitly exempts targets embedded in a block of text, and
padding them to 44px would wreck the line spacing. Minimums are for standalone
controls.

### Notches and the tap flash

```css
.nav {
  padding-left: max(var(--gutter), env(safe-area-inset-left));
}
```

`env(safe-area-inset-*)` reports the physically obscured margin on phones with
a notch or rounded corners. `max()` keeps normal padding when the inset is 0,
which is every other device.

Mobile browsers also paint a grey box over whatever you tap. Removing it is
only safe *because* there's a visible replacement — the `:active` squish:

```css
a, button { -webkit-tap-highlight-color: transparent; }
```

### And on the JS side

The cursor-following card glow is skipped entirely on touch:

```js
if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
```

Listening for pointer moves on a device that has no pointer just wastes battery.

---

## 11. What I'd do next

Honest assessment of what's missing:

1. **Real game screenshots.** The game cards currently use gradient placeholders
   with an emoji. Actual captures would be the single biggest visual upgrade —
   this is where a portfolio earns attention.
2. **Compress any images you add.** Export as WebP, keep them under ~200 KB, and
   always set `width` and `height` attributes so the page doesn't jump around as
   they load.
3. **A custom domain.** GitHub Pages supports it and it reads more professional
   than a `github.io` URL.
4. **Verify the game descriptions.** They were assembled from search results
   because itch.io was unreachable from the build environment — worth checking
   against your actual store pages.

---

## Quick reference — the habits worth keeping

| Do | Don't |
|---|---|
| Semantic tags (`<section>`, `<article>`, `<nav>`) | `<div>` for everything |
| CSS variables for colour | Hardcoded hex codes scattered about |
| Animate `transform` / `opacity` | Animate `width` / `height` / `top` |
| Real `<button>` elements | `<div onclick="...">` |
| Style the focus ring | `outline: none` |
| Honour `prefers-reduced-motion` | Force animation on everyone |
| `clamp()` and fluid units | A media query for every screen size |
| Breakpoints where the design breaks | Breakpoints named after phones |
| Content works without JS | JS required to read anything |
