# now

## State

First run on this deliverable (165h to cutoff at run start --- a plan/build
run, not the last one). Brief: `crits/05-game`, "A game" --- one mechanic,
obvious in ten seconds, still interesting at five minutes, no tutorial
anywhere (no modal, no instructions page, nothing in the README standing in
for either). Full text is quoted in the previous conversation's summary if
needed again; the short version: a game has rules, stakes, an ending, and the
opening screen alone has to make the first move obvious.

Built **Far Bank**: hold to charge a hop across a river, release to land it
on the next stone. One rule (`resolveJump` in `game-logic.ts`): land inside
the stone's span or the round ends in the water. Each cleared hop narrows the
stone and widens the possible gap, so the same "judge the hold" skill has to
keep sharpening --- the brief's "one mechanic is usually enough" move, not two
mechanics. No instructions anywhere: the opening screen shows the river, two
stones and the player token at rest, and the charge meter itself only appears
once you press, so the mechanic teaches itself.

Camera always recenters the player at a fixed screen x (`PLAYER_X`) while the
world scrolls under it via an eased `scrollOffset` --- an under/overshoot
reads as the target stone landing short or long on screen, not the player
jittering. Aesthetic: continues the paper-tone/serif/`--seal` throughline
(crits 1, 2, 4), this time the accent marks one meaning, "the moment of
decision/consequence" (charge meter, splash rings, score readout) --- see
`MEMORY.md`'s Aesthetic throughline section, now updated with a crit 5
paragraph.

## Done this run

- `game-logic.ts` + `spec/game-logic.test.ts`: pure rules, the brief's
  explicit "put one rule under a focused automated test" requirement,
  no DOM needed. Committed as `e347079`.
- `index.html`, `main.ts`, `styles.css`: the full game engine and page.
  Canvas-rendered at a fixed 800x600 virtual coordinate space, scaled via
  `devicePixelRatio` + `ctx.setTransform` so physics/layout is independent
  of real screen size. Pointer input scoped per `pointerId`, listens for
  both `pointerup` and `pointercancel` (crit 4 lesson, applied proactively).
  Keyboard Space drives the identical charge/release path, wired on
  `window` so no focus/tabindex is needed. `prefers-reduced-motion` checked
  once via `matchMedia`, shortens animation durations. `localStorage` best
  score, wrapped in try/catch. Inline SVG favicon (recurring template gap
  per `MEMORY.md`, fixed proactively). Committed as `41d73e9`.
- `pnpm check` green: typecheck, build, 27/27 tests.
- Verified live in a real browser (not just the automated suite): both
  marking viewports (1920x1080 desktop, 390x844 mobile per this course's
  assessment page) render correctly with no letterboxing; both pointer and
  keyboard input paths charge and release correctly at both viewports;
  console has no page-originated errors (only the browser-automation tool's
  own unrelated Slack-workspace noise, already a known false-positive
  pattern from prior crits); a precise 10-point hold-duration scan
  (dispatching synthetic `PointerEvent`s with in-page `setTimeout` inside a
  single `agent-browser eval`, to avoid ~120ms/call CLI round-trip latency
  that made naive mouse-down/sleep/mouse-up commands miss by 100ms+)
  confirmed a genuine, narrow, learnable sweet-spot window that narrows as
  score climbs --- the depth/fairness check the brief specifically asks for
  ("only playing can tell you whether the collision feels fair"). Dev
  server shut down cleanly afterwards (`lsof -i :5173` to find the real
  listener, per the standing PID-tracking lesson).
- `MEMORY.md` updated: crit 5 aesthetic-continuation paragraph, plus two new
  Working-environment lessons (CLI-latency-safe timing technique via
  single-`eval` synthetic events; the "two paths, same clock, different
  easing curves" desync class of bug, caught by review before it shipped).

## Not done yet (fine --- this isn't the last run)

- `public/card.png` is still the template placeholder (1200x630, generic).
  Nothing in CI checks it; only visible on the deployed page's actual head.
  Worth replacing with something representing Far Bank before the final run.
- No Lighthouse accessibility+performance audit script (`scripts/audit.ts`)
  ported into this repo yet, per the standing `MEMORY.md` practice --- worth
  doing once the game's structure feels settled, since it's caught real
  defects in multiple past crits that a green `pnpm check` alone missed.
- Haven't checked resize-mid-gesture (a charge held while the viewport
  changes size) --- crit 4's precedent found real bugs in a structurally
  similar "recompute hit-test/position live" pattern. Worth a live check
  with `agent-browser set viewport` mid-hold before calling this settled.
- `PROCESS.md` still has its template boilerplate (including the literal
  "TEMPLATE:" marker) and `reflections/crit-5.md` doesn't exist yet ---
  both are finishing-step items, correctly deferred until the run the
  prompt marks as last (doctrine step 4). Don't write them early.
- Haven't looked at the game past score ~2 in live testing --- worth a
  longer real playthrough (not just a synthetic scan) at some point to feel
  out whether the difficulty ramp stays fun rather than just "technically
  narrows," per the brief's five-minute depth bar.

## Single most important next action

Live-check resize-mid-charge/mid-jump at a real browser session (same
technique as crit 4's precedent), then port the Lighthouse audit script.
After that, this deliverable is in solid deepen-phase territory: re-read the
brief's own bar ("still interesting at five minutes") against an actual
multi-minute playthrough rather than trusting the synthetic hold-duration
scan alone.
