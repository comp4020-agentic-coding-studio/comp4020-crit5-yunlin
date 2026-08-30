# now

## State (this run, 63h to cutoff)

Fourteenth run, still a deepen run (prompt gave hours-to-cutoff but did not
call this the last one). Arrived clean, `pnpm check` 28/28 green, brief
re-fetched unchanged. Prior hand-off's instruction was explicit: do one
fresh read of the whole codebase and rubric looking for a genuinely new
question, not a re-verification --- and this run found one.

## Done this run --- fixed a real spec violation: the canvas aria-label was a how-to-play instruction

Read `main.ts`, `game-logic.ts` and `index.html` fresh, cover to cover.
Confirmed key-repeat on held Space is already guarded (`event.repeat`
check, `main.ts:378`) --- not a bug, already handled. Confirmed this game
has no audio at all (`grep Audio` empty) --- the long list of Web-Audio
deepen checks logged in `MEMORY.md` all came from crit 4 (the instrument)
and don't apply to this deliverable; don't keep reaching for that
audio-node-GC/oscillator-counting toolkit here, there's nothing to hook.

The actual find: `index.html`'s `<canvas>` had
`aria-label="A river with stepping stones. Hold to charge a hop, release
to land it."` --- that second sentence is a literal how-to-play
instruction, exposed to assistive tech, in a build whose brief says "no
instructions anywhere, on screen or off" and "nothing in the README
standing in for either." A sighted player never sees it, but it's exactly
the thing the no-tutorial rule rules out, and it had been there since the
canvas was first added, unnoticed across thirteen prior runs' worth of
checks (all of which were about interaction correctness/robustness, never
"does this page's own text violate the no-tutorial spec line").

Fixed by rewording to describe the scene without stating the mechanic:
`"Far Bank: a river with stepping stones, one figure at its edge."` ---
still a non-empty, meaningful accessible name (a bare `<canvas>` with no
label reads as blank to a screen reader), just not an instruction.
Confirmed live: `pnpm check` green, `pnpm check:audit` still
accessibility 100/100 (Lighthouse checks for a non-empty label, not its
wording), `curl` on the built preview served the new string, and
`agent-browser snapshot` showed it correctly in the real accessibility
tree. Played one real round through a synthetic-PointerEvent hold (same
timing-accurate technique logged in `MEMORY.md`) to confirm the mechanic
itself is untouched --- landed in the water, score/best text updated
correctly, zero console errors. Cleaned up: closed the browser, killed the
preview server (checked `ss -ltnp` for the real listening PID, same
tracked-PID-mismatch quirk logged before). Committed as `976cf89`.

General lesson, added to `MEMORY.md`: a no-tutorial brief's self-check
needs to include the page's *non-visual* text (aria-labels, alt text,
live-region copy), not just its rendered/visible copy --- a sighted
playtester and a Lighthouse accessibility pass can both stay green while
an aria-label quietly carries the exact instruction text the brief
forbids.

## Housekeeping this run --- fixed a memory-path mistake

Early in this run's memory write-up I wrote the hand-off into the wrong
file: `/home/ben/projects/comp4020/agents/yunlin/memory/now.md` (the
*outer*, cross-deliverable directory that only `MEMORY.md` lives in and
that `CLAUDE.md` includes) instead of this repo's own
`memory/now.md` --- the one thirteen prior commits have actually been
reading and committing each run. Caught it by rereading this file (still
showing the 13th-run content) after the stray write. Deleted the outer
file afterwards since nothing references it and it isn't git-tracked.
Worth remembering going forward: this repo's `memory/now.md` (relative to
the crit5 repo root) is the canonical hand-off file, not the
similarly-named one under the outer `agents/yunlin/` directory that
`CLAUDE.md`'s `@../memory/MEMORY.md` include points at --- that outer
directory holds only the global `MEMORY.md`, no `now.md` of its own.

## Not done yet (fine --- this isn't the last run)

`PROCESS.md` still has template boilerplate; `reflections/crit-5.md`
doesn't exist. Both correctly deferred to the final run. Citation list for
the final `PROCESS.md`, updated with this run's fix:

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
- `976cf89` --- dropped how-to-play text from the canvas aria-label (this
  run): the one spec-conformance bug found among many robustness fixes,
  worth naming as its own category in `PROCESS.md`.

## Single most important next action

Every interaction-robustness angle named by prior hand-offs is closed.
This run added a different category of finding (spec conformance, not
robustness) by reading the shipped page's own text against the brief's
exact words rather than testing interaction paths again. Next run: try
the same lens once more before assuming it's exhausted --- reread
`index.html`/`styles.css`/`PROCESS.md`/`README.md`'s literal copy (not
just the game code) against every spec line in the brief
(five-minute-depth, "a stranger reaches an ending," "one rule has a
focused test," "one change came from playing") for anything else the
build asserts about itself that doesn't hold up, the same self-referential
-claim discipline `MEMORY.md`'s "content practices" section already
established for crits 1--2. If that comes back genuinely empty, that's a
real signal the deepen phase is dry --- but still wait for the prompt to
call a run last, or for the dryness to be unambiguous, before bringing
finishing steps forward on its own arithmetic.
