# now

## State (this run, 45h to cutoff)

Sixteenth run, still a deepen run (prompt gave hours-to-cutoff but did not
call this the last one). Arrived clean, `pnpm check` 28/28 green, brief
re-fetched unchanged. Prior run's single most important next action named
exactly one untried thing: whether `public/card.png`'s own pixels (not
its alt text --- `og:image` has no alt in HTML) bake in any how-to-play
text the earlier aria-label/meta-description fixes wouldn't have caught.
They did.

## Done this run --- found and fixed a third how-to-play leak, this time baked into image pixels

`public/card.png`'s italic subtitle read "hold to charge a hop, release
to land it" --- the identical instruction text already dropped from the
canvas aria-label (`976cf89`) and the meta description (`2584f7e`), just
carried in the image's rendered pixels instead of markup text. Neither
Lighthouse nor a page-text grep can see text baked into a PNG, so this
sat undetected since the card was first drawn (`50248de`, week-1 of this
build). Read the whole image at full res with the `Read` tool (not just
`identify`/pixel-sampling) to actually see the subtitle rendered on the
mountain silhouette.

Tried to patch just the offending text region in place first, sampling
pixel colours (`convert ... crop ... txt:-`) to find the paper/mountain
boundary under the text band --- abandoned after the boundary turned out
not to follow a clean affine scale of `main.ts`'s virtual-canvas ridge
polygon (checked the maths, it diverges partway across the band), which
would have meant patching by eyeballed guesswork rather than a
reconstructable rule. Redrew the whole card from scratch as a fresh SVG
instead, in the same palette (verified the ridge/water rgba blends match
`main.ts`'s exactly by computing the alpha-composite over paper by hand:
`rgba(107,102,92,0.35)` over `#f3efe4` --- ink-soft at 35% --- comes out
`#c3bfb4`, the same grey I'd sampled from the original card), same rough
composition (title, ridge, water, two stones, charge meter, floating
player), new subtitle reworded to stakes only: "one wrong leap and it's
over" --- the exact same phrase already used in the meta description fix,
so the three channels now agree word-for-word rather than just avoiding
instructions independently. Rendered via `convert card.svg card.png`:
ImageMagick 6.9's `svg:` delegate is configured to shell out to
`rsvg-convert`, which isn't installed in this environment, but it silently
falls back to its own built-in MSVG/pangocairo renderer and produced a
clean result anyway --- confirmed by reading the rendered PNG before
trusting it, not just checking the `convert` exit code. New file is 64KB,
well under both the 5MB harness cap and the old file's 33KB (roughly
double, still trivial). `pnpm check` stays 28/28 green (nothing in CI
touches this asset, per this repo's own `CLAUDE.md`). Committed as
`71b4cb0`.

## Housekeeping

None needed.

## Not done yet (fine --- this isn't the last run)

`PROCESS.md` still has template boilerplate; `reflections/crit-5.md`
doesn't exist. Both correctly deferred to the final run. Citation list
for the final `PROCESS.md`, updated with this run's fix:

- `2917cdc` --- charge meter enlarged after playing at the mobile viewport.
- `b4ec821` --- Lighthouse audit port, fixed the contrast defect it found.
- `7696c1f` --- gap-reachability fix (two per-score formulas combining into
  an impossible constraint neither violated alone).
- The midpoint-sweep playthrough (no commit, around `e655ee9`) --- the
  fairness/depth check.
- `5b4a03d` --- window-blur/tab-switch stuck-charge fix.
- `1a618ea` --- cross-tab localStorage best-score race.
- `019351e` --- stale canvas resolution on a DPR-only change.
- `e84b7e1` --- ignore non-primary pointer buttons, suppress the canvas
  context menu.
- `976cf89`, `2584f7e`, `71b4cb0` --- the same how-to-play-leak bug shape
  found in three independent channels (canvas aria-label, meta
  description, link-preview image pixels) across three runs --- worth
  presenting as one moment in `PROCESS.md` ("reread every string/pixel the
  page emits, not just what a player sees while playing, across every
  channel it emits through"), not three separate ones. This is also a
  clean instance of the brief's "explain how the work was directed,
  grounded, and corrected" line, since each fix was caught by a deliberate
  self-check pass, not by any automated tool (Lighthouse and
  `spec/invariants.test.ts` both only assert non-empty content on the
  affected fields/assets, never wording or pixel content).

## Single most important next action

Checked every text-emitting channel this page has (title, meta
description, og:image pixels, canvas aria-label, nav link, h1, score
readout, favicon --- which is pure SVG shapes, no text) and every one is
now either clean by construction or already fixed. The self-referential/
off-screen-text lens (three runs' worth: `976cf89`, `2584f7e`, `71b4cb0`)
is genuinely dry now, not just quiet for one pass --- there is no
remaining page-emitted string or image left unchecked against the
no-instructions constraint. Combined with the interaction-robustness lens
already reading exhausted across runs 1--14 (MEMORY.md's long list), the
next run should treat both lenses as dry unless it can name a genuinely
new question neither has asked yet (per the crit-4 lesson: switch
questions, don't re-verify the existing checklist) --- and if it can't,
that's the signal `now.md` should act on to bring the finishing steps
forward, still waiting for either the prompt to call a run last or for
this dryness to hold across one more run's fresh read, per the standing
discipline of not trusting a single pass's "nothing here" as the final
word.
