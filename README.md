# Noah Jones — Portfolio

A personal portfolio site for my QA engineering work, desktop apps, and Unreal
Engine 5 games. Built with plain HTML, CSS, and JavaScript — no frameworks, no
build step, no `npm install` required to run it.

**[→ Read STRUCTURE.md](docs/STRUCTURE.md)** for a full walkthrough of how the
site is built and why each decision was made.

---

## Running it

There are two ways. The second is better, and here's why.

### Option A — just open the file

Double-click `index.html`. It opens in your browser and works.

### Option B — a local server (recommended)

```bash
python3 -m http.server 8080
```

Then visit <http://localhost:8080>.

**Why bother?** Opening a file directly uses the `file://` protocol. Most sites
work fine that way, but the moment you add anything that loads data — fonts,
JSON, images fetched by script — browser security rules block it, and you get
confusing errors that have nothing to do with your code. Getting into the habit
of using a local server now saves you that afternoon later.

---

## Files

| File | Job |
|---|---|
| `index.html` | Structure and content — every word on the page |
| `styles.css` | All visual design, both colour themes, all animation |
| `script.js` | Interactivity — theme toggle, accordions, filters, scroll effects |
| `docs/STRUCTURE.md` | How it all fits together, written to be read |
| `docs/screenshots/` | Reference screenshots of every section, both themes |

Three files. That's the whole site.

---

## Editing it

**To change a colour:** open `styles.css` and edit the variables at the very
top. Nothing below that block hardcodes a colour, so one edit updates the whole
site.

**To add a project:** copy an existing `<article class="card">` block in
`index.html`, change the text, and give the accordion a unique `id`. The
`aria-controls` on the button must match the `id` on the panel.

**To change a category filter:** the `data-cat` attribute on a card must match a
`data-filter` value on one of the chip buttons.

---

## Deploying to GitHub Pages (free)

1. Push to GitHub (already done — this repo).
2. Repo → **Settings** → **Pages**.
3. Under *Source*, pick **Deploy from a branch**.
4. Branch: `main`, folder: `/ (root)`. Save.
5. Wait about a minute. Your site is live at
   `https://noah-jones-dev.github.io/ProjectPortfolio/`.

Because there's no build step, GitHub Pages serves these files as-is. That is
the main practical payoff of skipping a framework.

---

## Links

- **GitHub** — [noah-jones-dev](https://github.com/noah-jones-dev)
- **LinkedIn** — [noah-jones-sqa](https://www.linkedin.com/in/noah-jones-sqa)
- **Games** — [NoJo Studios on itch.io](https://nojo-studios.itch.io/)
