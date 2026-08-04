/* =========================================================================
   Noah Jones — Portfolio behaviour
   =========================================================================
   Seven small, independent features. Each one is wrapped in its own
   function and called at the bottom. If one ever breaks, the others keep
   working — that is the whole reason for the structure.

     1. Theme toggle       — dark <-> light, remembered
     2. Sticky nav state   — blur background once scrolled
     3. Scroll spy         — highlight the nav link you're looking at
     4. Reveal on scroll   — fade sections in as they arrive
     5. Accordions         — the chevron "Details" panels
     6. Project filter     — the category chips
     7. Count-up stats     — hero numbers ticking up

   Style note: "const" everywhere unless a value genuinely changes, and
   every element lookup is checked before use. Defensive, but it means a
   single renamed class can't take the whole page down.
   ========================================================================= */

'use strict';

/* Does this visitor prefer less movement? Checked once, reused everywhere. */
const prefersReducedMotion =
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;


/* ------------------------------------------------------------------ *
 * 1. THEME TOGGLE
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
         this session — it just won't be remembered. Fail quietly. */
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
      // easeOutCubic — fast at first, gently settling. Linear feels robotic.
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
 * 9. SMALL BITS
 * ------------------------------------------------------------------ */
function initMisc() {
  // Keep the copyright year honest without anyone editing it each January.
  const year = document.getElementById('year');
  if (year) year.textContent = String(new Date().getFullYear());
}


/* ------------------------------------------------------------------ *
 * GO
 * ------------------------------------------------------------------ */
initTheme();
initNavScroll();
initScrollSpy();
initReveal();
initAccordions();
initFilters();
initCounters();
initCardGlow();
initMisc();
