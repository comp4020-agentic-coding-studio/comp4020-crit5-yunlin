# now

## State (this run, 111h to cutoff)

Eighth run on this deliverable, still a deepen run (prompt gave hours only,
no "last run" language). Re-fetched the brief from the course source ---
unchanged. `git status` clean, `pnpm check` and `pnpm check:audit` both
green on arrival (28/28 tests, a11y+perf 100/100), so no regressions from
the seventh run's localStorage-race/DPR fixes. No code changes this run ---
both angles the seventh run flagged as genuinely untried came back clean,
closing them out rather than finding new bugs.

## Done this run

- **Large-`now`-jump during `airborne`, checked live, clean.** The seventh
  run's open question was whether anything assumes `now` advances smoothly
  frame-to-frame. Exploited the standing "rAF doesn't advance without a
  forced screenshot" fact (MEMORY.md, crit 4) as the tool: dispatched a real
  synthetic `pointerdown`/`pointerup` to start a hop, then let 5+ real
  seconds elapse with **no** `agent-browser screenshot` call in between (so
  no rAF frame ran), then forced one. `update()`'s `Math.min(t, 1)` clamps
  handled the resulting huge `now - hopStart` correctly --- the game landed
  cleanly on the far stone in the first catch-up frame with a consistent
  score, no console errors, no visual corruption (screenshot confirmed).
  This is a stronger, more concrete version of the abstract "is `now`
  monotonic across sources" question than could be reasoned out from source
  alone --- a genuine backgrounded-tab-style time gap, not just a differing
  clock source.
- **Same-tick double-press hazard, checked live, clean.** The seventh run's
  other open question was whether two press-equivalent events landing in
  the same task could double-fire `press()`. Dispatched two synchronous
  `keydown` Space events back-to-back inside one `agent-browser eval` call
  (a genuine same-tick double dispatch, unlike two separate CLI calls)
  while already `"charging"`: the second call's `phase !== "ready"` guard
  correctly no-op'd, score stayed consistent, no console errors. Read
  through `press()`'s `gameover -> reset() -> charging` path too and
  confirmed by inspection it has the same guard (`reset()` sets phase to
  `"ready"`, so a same-tick second call would see `"charging"`, not
  `"ready"`, and return) --- JS's non-reentrant, run-to-completion handler
  model means this was never actually reachable from real browser-dispatched
  events in the first place (there's also no `click` listener at all, so a
  synthetic-click-based double-fire path the seventh run also flagged as a
  possibility doesn't exist here), but worth confirming live rather than
  resting on that reasoning alone.
- Preview server (port 4340) and `agent-browser` session both shut down
  cleanly afterward (`lsof` confirmed the port free).

## Not done yet (fine --- this isn't the last run)

`PROCESS.md` still has template boilerplate; `reflections/crit-5.md`
doesn't exist. Both correctly deferred to the final run. Citation list,
unchanged from last hand-off plus nothing new to add (this run found no
bugs, just closed two open questions):

- `2917cdc` --- charge meter enlarged after playing at the mobile viewport.
- `b4ec821` --- Lighthouse audit port, fixed the contrast defect it found.
- `7696c1f` --- gap-reachability fix (two per-score formulas combining into
  an impossible constraint neither violated alone).
- The midpoint-sweep playthrough (no commit, around `e655ee9`) --- the
  fairness/depth check.
- `5b4a03d` --- window-blur/tab-switch stuck-charge fix.
- `1a618ea` --- cross-tab localStorage best-score race.
- `019351e` --- stale canvas resolution on a DPR-only change.

## Single most important next action

Both angles named as "genuinely untried" by the seventh run are now closed,
clean. Before assuming the deepen list is dry again, a future run should
find a fresh question rather than re-verifying either of these two. One
candidate not yet tried: the `stone`/`water` outcome only checks
`jumpDistance` against `gap.distance +/- stoneWidth/2` in world units ---
worth checking whether `resolveJump`'s boundary (`>=`/`<=`, inclusive) ever
produces a *visually* wrong verdict against the rendered stone ellipse,
i.e. whether `drawStone`'s rendered width (`width/2` radius) actually
matches the hit-test width used by `resolveJump`, since these are two
independent uses of the same `stoneWidth` number and nothing currently
cross-checks that a landing judged "stone" by the rules also visually looks
like it lands on the drawn stone (or vice versa) at the extremes of the
narrowing range (`stoneWidth` -> 18, its floor). Speculative, not yet
checked either analytically or live.
