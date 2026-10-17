# Game cover art

Drop the three cover images here. The site picks them up with no code change.

| File name (exactly this) | Game |
|---|---|
| `bored-crc-specialist.png` | Bored CRC Specialist |
| `bored-businessman.png` | Bored Businessman |
| `bored-kids-ding-dong-ditching.png` | Bored Kids Ding Dong Ditching Houses |

## Getting them from itch.io

Open the game's page on itch.io, right-click the cover image, and choose
**Save image as**. itch covers are 630x500, which is the size already set on
each `<img>` in `index.html`.

## Until a file is added

The `<img>` 404s, `script.js` removes it, and the gradient plus emoji
underneath show instead. A missing cover looks deliberate, not broken, so
these can be added one at a time.

## If you rename a game

Change the `src` on that card's `<img>` in `index.html` to match, and keep
the `alt` text describing the art for anyone using a screen reader.
