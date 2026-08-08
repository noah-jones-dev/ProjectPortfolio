# Working agreements for this repo

## Always open a pull request when pushing

Never leave commits on a branch that no open PR points at.

### Check the live state before every push — don't rely on memory

Query GitHub for the branch's **currently open** PRs immediately before pushing:

```bash
gh pr list --head <branch> --state open      # or the equivalent API call
```

"I opened a PR for this branch earlier" is **not** evidence that one is open
now. A PR can be merged or closed between two pushes in the same session, and
that is exactly when commits go missing. Re-check every time — it is one cheap
call, and the failure it prevents is silent.

Then:

- **An open PR tracks the branch** → push; the commits join it automatically.
- **None does** → **push and open a PR in the same step.** Don't wait to be
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

### When to open a new PR rather than push to the open one

Open a **new** PR when:

- The open PR has just been merged or closed — it can't carry more work.
- The change is a distinct piece of work with its own reason to exist, so it
  can be reviewed, merged, or reverted on its own.
- The open PR is being reviewed and unrelated commits would muddy the diff.

Push to the **existing** PR when:

- The work continues or fixes what that PR already covers.
- It's a follow-up to review feedback on that PR.
- Splitting it out would produce a PR too small to stand alone, and no separate
  branch exists to raise it from.

Prefer one coherent subject per PR. When something unrelated has to ride along
because only one branch is available, say so explicitly rather than quietly
widening the PR's scope.

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
  or they stick after a tap on touchscreens. This especially covers colours
  set for *another* hover effect's background — reset only half a hover state
  and you strand, say, white text on a wash that never appeared. Genuine
  states (`.is-copied`) must survive the reset.

See `docs/STRUCTURE.md` for the reasoning behind each of these.
