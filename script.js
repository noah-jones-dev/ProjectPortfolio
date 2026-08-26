/* =========================================================================
   Noah Jones · Portfolio behaviour
   =========================================================================

   CONTENTS
     1. initTheme()      dark <-> light toggle, remembered in localStorage
     2. initNavScroll()  frosted background on the nav once you scroll
     3. initScrollSpy()  underline the nav link for the section you're in
     4. initReveal()     fade sections up as they enter the viewport
     5. initAccordions() the chevron "Details" panels
     6. initFilters()    the Work category chips
     7. initCounters()   hero numbers ticking up from zero
     8. initCardGlow()   feed the cursor position to the CSS card glow
     9. showToast()      the slide-up confirmation message
    10. initCopyButtons() copy-to-clipboard for anything with data-copy
    11. initMisc()       copyright year

   HOW THIS FILE IS ORGANISED
     Nine small, INDEPENDENT features, each in its own function, all called
     at the very bottom. Nothing here depends on anything else here. If one
     breaks, the other eight keep working. That is the entire reason for
     the structure, and it's worth copying in your own projects.

   THE DIVISION OF LABOUR WITH CSS
     JavaScript's job here is almost never to animate anything. It toggles a
     CLASS, and CSS animates the result:

       script.js:  card.classList.toggle('is-open')
       styles.css: .card.is-open .accordion__panel { grid-template-rows: 1fr }

     Keeping animation in CSS means the browser can run it on the GPU, and it
     means you can restyle everything without touching this file. Any class
     starting `is-` is owned by this file.

   STYLE NOTES
     - `const` unless a value genuinely changes; never `var`.
     - Every element lookup is checked before use (`if (!el) return;`).
       Defensive, but it means one renamed class can't take the page down.
     - 'use strict' catches silent mistakes like assigning to an undeclared
       variable, turning them into visible errors.
   ========================================================================= */

'use strict';

/*
  Does this visitor prefer less movement?

  matchMedia lets JavaScript read the same media queries CSS uses. Some people
  get genuine motion sickness from drifting, animated interfaces and set an
  OS-level preference saying so. styles.css section 13 handles the CSS side;
  this constant lets the JS side skip animation work entirely rather than just
  running it very fast.

  Checked once at load and reused, because querying it repeatedly in a
  mousemove handler would be wasteful.
*/
const prefersReducedMotion =
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;


/* ------------------------------------------------------------------ *
 * 1. THEME TOGGLE
 * ------------------------------------------------------------------
 * Flips data-theme on <html> between "dark" and "light". That single
 * attribute is all it takes: styles.css defines a different set of colour
 * variables under :root[data-theme="light"], so every colour on the page
 * changes at once. No element is touched individually.
 *
 * Three behaviours, in priority order:
 *   1. A choice saved in localStorage always wins.
 *   2. Otherwise, follow the operating system's light/dark setting.
 *   3. Otherwise, dark.
 *
 * The initial read happens in the inline <script> in index.html's <head>,
 * NOT here. See the comment there for why.
 * ------------------------------------------------------------------ */
function initTheme() {
  const toggle = document.getElementById('themeToggle');
  if (!toggle) return;

  const root = document.documentElement;

  toggle.addEventListener('click', () => {
    const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
    root.dataset.theme = next;

    // Remember the choice so it survives a refresh.
    try {
      localStorage.setItem('theme', next);
    } catch (e) {
      /* Private browsing can block storage. The toggle still works for
         this session; it just won't be remembered. Fail quietly. */
    }
  });

  // If the visitor has never chosen manually, follow their OS if it changes.
  window.matchMedia('(prefers-color-scheme: light)')
    .addEventListener('change', (event) => {
      let hasChosen = false;
      try { hasChosen = localStorage.getItem('theme') !== null; } catch (e) {}
      if (!hasChosen) root.dataset.theme = event.matches ? 'light' : 'dark';
    });
}


/* ------------------------------------------------------------------ *
 * 2. STICKY NAV BACKGROUND
 * ------------------------------------------------------------------ */
function initNavScroll() {
  const nav = document.getElementById('nav');
  if (!nav) return;

  const update = () => nav.classList.toggle('is-scrolled', window.scrollY > 12);

  update();
  // passive: true tells the browser we'll never call preventDefault(),
  // so it can keep scrolling smooth instead of waiting on us.
  window.addEventListener('scroll', update, { passive: true });
}


/* ------------------------------------------------------------------ *
 * 3. SCROLL SPY
 * ------------------------------------------------------------------ */
function initScrollSpy() {
  const links = Array.from(document.querySelectorAll('.nav__links a'));
  if (!links.length) return;

  // Pair each nav link with the section it points at.
  const pairs = links
    .map((link) => ({ link, section: document.querySelector(link.hash) }))
    .filter((pair) => pair.section);

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        pairs.forEach(({ link, section }) =>
          link.classList.toggle('is-current', section === entry.target)
        );
      });
    },
    // Trigger when a section crosses the upper-middle band of the screen.
    { rootMargin: '-45% 0px -50% 0px', threshold: 0 }
  );

  pairs.forEach(({ section }) => observer.observe(section));
}


/* ------------------------------------------------------------------ *
 * 4. REVEAL ON SCROLL
 * ------------------------------------------------------------------ */
function initReveal() {
  const items = Array.from(document.querySelectorAll('.reveal'));
  if (!items.length) return;

  // Reduced motion: show everything at once, skip the observer entirely.
  if (prefersReducedMotion) {
    items.forEach((item) => item.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        // Stagger siblings slightly so a grid cascades instead of popping.
        const siblings = Array.from(entry.target.parentElement.children);
        const delay = Math.min(siblings.indexOf(entry.target), 7) * 65;

        entry.target.style.transitionDelay = delay + 'ms';
        entry.target.classList.add('is-visible');

        // Reveal once, then stop watching. Re-animating on every scroll
        // past is a common mistake and it gets annoying fast.
        obs.unobserve(entry.target);
      });
    },
    { rootMargin: '0px 0px -8% 0px', threshold: 0.08 }
  );

  items.forEach((item) => observer.observe(item));
}


/* ------------------------------------------------------------------ *
 * 5. ACCORDIONS
 * ------------------------------------------------------------------
 * The chevron "Details" panels on every project and game card.
 *
 * All this does is toggle the .is-open class on the card. The actual
 * expansion is pure CSS, using a trick worth knowing:
 *
 *   CSS cannot animate height: auto. It needs two concrete numbers to
 *   interpolate between, and "auto" isn't one. The workaround is to make
 *   the panel a grid and animate its single row from 0fr to 1fr.
 *   Fractions ARE numbers, so they animate, and the content still sizes
 *   itself naturally. No measuring heights in JavaScript, no hardcoded
 *   pixel values that break when you edit the text.
 *
 * The accessibility half is done here though, because a rotating chevron
 * means nothing if you can't see it. aria-expanded is what actually tells
 * a screen reader the panel opened.
 * ------------------------------------------------------------------ */
function initAccordions() {
  const triggers = Array.from(document.querySelectorAll('.accordion__trigger'));

  triggers.forEach((trigger) => {
    const panel = document.getElementById(
      trigger.getAttribute('aria-controls')
    );
    const card = trigger.closest('.card');
    if (!panel || !card) return;

    // The markup ships with hidden="" so that a visitor without JS still
    // gets sane output (see the <noscript> block in index.html). Now that
    // JS is running, hand control over to CSS.
    panel.hidden = false;

    trigger.addEventListener('click', () => {
      const isOpen = card.classList.toggle('is-open');

      // aria-expanded is what tells a screen reader the state changed.
      // The chevron rotating is only meaningful if you can see it.
      trigger.setAttribute('aria-expanded', String(isOpen));
      trigger.querySelector('span').textContent = isOpen ? 'Hide details' : 'Details';
    });
  });
}


/* ------------------------------------------------------------------ *
 * 6. PROJECT FILTER
 * ------------------------------------------------------------------
 * Matches each card's data-cat against the clicked chip's data-filter and
 * hides the ones that don't match.
 *
 * Note the click listener is on the CONTAINER, not on each chip. This is
 * called EVENT DELEGATION: one listener handles all four buttons, and it
 * would keep working if you added a fifth chip to the HTML without
 * touching this file. event.target.closest('.chip') finds which chip was
 * actually clicked (or the nearest chip ancestor, if you hit text inside
 * one). Fewer listeners, less memory, no re-binding.
 * ------------------------------------------------------------------ */
function initFilters() {
  const bar = document.getElementById('filters');
  const grid = document.getElementById('projectGrid');
  const status = document.getElementById('filterStatus');
  if (!bar || !grid) return;

  const chips = Array.from(bar.querySelectorAll('.chip'));
  const cards = Array.from(grid.querySelectorAll('.card'));

  const apply = (filter) => {
    let shown = 0;

    cards.forEach((card) => {
      const match = filter === 'all' || card.dataset.cat === filter;
      card.classList.toggle('is-hidden', !match);
      if (match) shown += 1;
    });

    // aria-live on this element means screen readers announce the change.
    // Without it, filtering is completely silent to a non-sighted visitor.
    if (status) {
      status.textContent =
        `Showing ${shown} project${shown === 1 ? '' : 's'}` +
        (filter === 'all' ? '' : ' in this category') + '.';
    }
  };

  bar.addEventListener('click', (event) => {
    const chip = event.target.closest('.chip');
    if (!chip) return;

    chips.forEach((c) => c.classList.toggle('is-active', c === chip));
    apply(chip.dataset.filter);
  });

  apply('all');
}


/* ------------------------------------------------------------------ *
 * 7. COUNT-UP STATS
 * ------------------------------------------------------------------ */
function initCounters() {
  const counters = Array.from(document.querySelectorAll('[data-count]'));
  if (!counters.length) return;

  if (prefersReducedMotion) {
    counters.forEach((el) => { el.textContent = el.dataset.count; });
    return;
  }

  const run = (el) => {
    const target = Number(el.dataset.count) || 0;
    const duration = 1100;
    const start = performance.now();

    const step = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      // easeOutCubic, fast at first, gently settling. Linear feels robotic.
      const eased = 1 - Math.pow(1 - progress, 3);

      el.textContent = String(Math.round(target * eased));

      if (progress < 1) requestAnimationFrame(step);
    };

    requestAnimationFrame(step);
  };

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        run(entry.target);
        obs.unobserve(entry.target);
      });
    },
    { threshold: 0.5 }
  );

  counters.forEach((el) => observer.observe(el));
}


/* ------------------------------------------------------------------ *
 * 8. CARD GLOW FOLLOWS THE CURSOR
 * ------------------------------------------------------------------ */
function initCardGlow() {
  if (prefersReducedMotion) return;

  // Pointer-based effects are meaningless on touch, and listening for
  // mousemove there is wasted battery. Skip it entirely.
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

  document.querySelectorAll('.card').forEach((card) => {
    card.addEventListener('mousemove', (event) => {
      const box = card.getBoundingClientRect();
      // Feed the cursor position to CSS as percentages; the radial
      // gradient in styles.css reads them via var(--mx) / var(--my).
      card.style.setProperty('--mx', ((event.clientX - box.left) / box.width) * 100 + '%');
      card.style.setProperty('--my', ((event.clientY - box.top) / box.height) * 100 + '%');
    });
  });
}


/* ------------------------------------------------------------------ *
 * 9. TOAST
 * ------------------------------------------------------------------
 * A small confirmation message that slides up from the bottom.
 *
 * Deliberately NOT alert(). alert() freezes the whole page until it's
 * dismissed, can't be styled, and reads as a browser error rather than a
 * confirmation. A toast confirms and gets out of the way.
 *
 * The element carries role="status" aria-live="polite" in the HTML, so
 * writing text into it is enough for a screen reader to announce it.
 * ------------------------------------------------------------------ */
let toastTimer = null;

function showToast(message, isError) {
  const toast = document.getElementById('toast');
  if (!toast) return;

  toast.textContent = message;
  toast.classList.toggle('toast--error', Boolean(isError));
  toast.classList.add('is-visible');

  // Reset any countdown already running, so rapid clicks don't hide the
  // toast early, each new message gets the full display time.
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('is-visible'), 2200);
}


/* ------------------------------------------------------------------ *
 * 10. COPY TO CLIPBOARD
 * ------------------------------------------------------------------
 * Wired to any element with a data-copy attribute, so adding a second
 * copy button anywhere needs no changes here.
 *
 * TWO WAYS TO COPY, because one isn't enough:
 *
 *   navigator.clipboard  is the modern API, but it only exists in a
 *                        "secure context", https:// or localhost. Open
 *                        the page as a file:// and it is undefined.
 *   execCommand('copy')  is the deprecated fallback that still works
 *                        essentially everywhere, including file://.
 *
 * Both must be triggered by a real user gesture; browsers block clipboard
 * writes that aren't tied to a click, to stop pages hijacking it.
 * ------------------------------------------------------------------ */
function copyText(text) {
  // Preferred path. Returns a promise.
  if (navigator.clipboard && window.isSecureContext) {
    return navigator.clipboard.writeText(text);
  }

  // Fallback: put the text in an off-screen textarea, select it, and let
  // the browser copy the selection.
  return new Promise((resolve, reject) => {
    const helper = document.createElement('textarea');
    helper.value = text;
    // Off-screen rather than display:none, the browser can't select text
    // inside an element it isn't rendering.
    helper.setAttribute('readonly', '');
    helper.style.position = 'fixed';
    helper.style.top = '-1000px';
    helper.style.opacity = '0';
    document.body.appendChild(helper);

    helper.select();
    helper.setSelectionRange(0, text.length);   // iOS needs the explicit range

    try {
      document.execCommand('copy') ? resolve() : reject(new Error('copy rejected'));
    } catch (err) {
      reject(err);
    } finally {
      document.body.removeChild(helper);
    }
  });
}

function initCopyButtons() {
  const buttons = Array.from(document.querySelectorAll('[data-copy]'));
  if (!buttons.length) return;

  buttons.forEach((button) => {
    button.addEventListener('click', (event) => {
      // The button sits inside a card whose link opens the mail app.
      // Without this, copying would ALSO launch the mail client.
      event.preventDefault();
      event.stopPropagation();

      const text = button.dataset.copy;

      copyText(text)
        .then(() => {
          showToast('Copied ' + text);

          // Icon swaps to a tick, then back. Purely visual, the toast is
          // what actually announces success to assistive tech.
          button.classList.add('is-copied');
          setTimeout(() => button.classList.remove('is-copied'), 1800);
        })
        .catch(() => {
          // Never leave the visitor guessing. If copying is blocked, say
          // so and tell them what to do instead.
          showToast('Press Ctrl+C to copy: ' + text, true);
        });
    });
  });
}


/* ------------------------------------------------------------------ *
 * 11. SMALL BITS
 * ------------------------------------------------------------------ */
function initMisc() {
  // Keep the copyright year honest without anyone editing it each January.
  const year = document.getElementById('year');
  if (year) year.textContent = String(new Date().getFullYear());
}


/* ------------------------------------------------------------------ *
 * GO, start everything
 * ------------------------------------------------------------------
 * No DOMContentLoaded wrapper is needed because index.html loads this with
 * <script src="script.js" defer>. `defer` downloads the file in parallel
 * with parsing the HTML, then runs it once the document is fully parsed,
 * so every element these functions look for already exists.
 *
 * Without `defer`, the browser would stop parsing the page to fetch and run
 * this file, and every querySelector below would return null.
 * ------------------------------------------------------------------ */
initTheme();
initNavScroll();
initScrollSpy();
initReveal();
initAccordions();
initFilters();
initCounters();
initCardGlow();
initCopyButtons();
initMisc();
