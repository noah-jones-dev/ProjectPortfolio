# Working agreements for this repo

## Always open a pull request when pushing

Never leave commits on a branch that no open PR points at.

- Before pushing, check whether an open PR already tracks the branch.
- If one exists, push — the commits join that PR automatically.
- If none exists, **push and open a PR in the same step.** Don't wait to be
  asked, and don't wait until the work "feels finished".

A PR tracks a *branch*, not a commit, which is why later pushes flow into an
already-open PR. The failure mode is pushing to a branch whose PR has just been
merged: the PR is closed, so the new commits are tracked by nothing and are easy
to lose.

**After a PR is merged**, that PR is finished and cannot carry more work.
Rebase any remaining unmerged commits onto the updated default branch, keep the
same branch name, and open a *new* PR:

```bash
git fetch origin main
git rebase origin/main      # keeps unmerged commits, drops merged ones
git push --force-with-lease
# then open a new PR
```

## Site conventions

This is a static site — plain HTML, CSS, and JavaScript, no build step and no
dependencies. Keep it that way; it's what lets GitHub Pages serve the files
as-is.

- All colours, sizes, and timings are CSS custom properties at the top of
  `styles.css`. Never hardcode a colour anywhere else.
- JavaScript toggles classes; CSS does the animating. Classes prefixed `is-`
  are owned by `script.js`.
- Animate only `transform` and `opacity`.
- Keep both themes passing WCAG AA (4.5:1 for normal text). Neon accents that
  work on the dark ground usually need deepening for the light one.
- Preserve the accessibility work: focus rings, `prefers-reduced-motion`,
  `aria-live` regions, the skip link, the `<noscript>` fallback, and 44px
  touch targets under `@media (pointer: coarse)`.
- New hover effects need a matching reset in the `@media (hover: none)` block,
  or they stick after a tap on touchscreens.

See `docs/STRUCTURE.md` for the reasoning behind each of these.
