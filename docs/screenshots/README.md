# Screenshots

Captured from a real Chromium browser at 1440×900 (desktop) and 390×844
(mobile), with both colour themes.

| File | What it shows |
|---|---|
| `01-hero-*` | Landing view — animated gradient name, buttons, stat counters |
| `02-about-*` | Bio and quick-facts panel |
| `03-work-*` | Filter chips and all 8 project cards |
| `04-games-*` | NoJo Studios game cards |
| `05-skills-*` | Six skill groups plus the specialties banner |
| `06-contact-*` | Contact cards |
| `07-accordion-open-*` | A card with its detail panel expanded |
| `08-fullpage-*` | The entire page, top to bottom |
| `09-mobile-hero` | Mobile landing view |
| `10-mobile-fullpage` | Entire page on mobile |
| `11-filter-mobile-category` | Work section filtered to "Mobile automation" |
| `12-mobile-se-hero` | 320px (iPhone SE) — the nav wrapped to two rows |
| `12-mobile-ip12-hero` | 390px (iPhone 12) |
| `13-mobile-se-work` | 320px Work section — 44px filter chips |
| `13-mobile-ip12-work` | 390px Work section |

`-dark` and `-light` suffixes are the two themes.

The 12/13 pair were captured with touch emulation on (`hasTouch`), which is
what makes the browser report `pointer: coarse` and `hover: none`. Without it
the touch-specific CSS never applies and the capture is misleading.
