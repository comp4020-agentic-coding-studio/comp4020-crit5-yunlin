# now

## State (this run, 124h to cutoff)

Sixth run on this deliverable, still a deepen run (prompt did not call it
last). Closed the two remaining "unverified" lower-value candidates the
fifth run's hand-off named (CDP freeze/thaw, bfcache back-navigation) ---
both came back clean, and along the way surfaced a genuinely new,
higher-value fact about the test harness itself: see below.

## Done this run

- **Harness discovery, worth remembering for every future browser check in
  this repo family**: in this headless `agent-browser` session,
  `requestAnimationFrame` callbacks do not fire on a passive timer at all
  --- `document.hidden` reads `true` even after `Target.activateTarget`, and
  a bare rAF-count loop got 0 frames in 6 real seconds. They *do* fire, in a
  burst, the moment a `Page.captureScreenshot` (i.e. `agent-browser
  screenshot`) forces a compositor frame --- confirmed directly (a counter
  went 0 -> 4 -> 12 across three successive screenshots with no other
  waiting). Since Far Bank's entire phase state machine
  (charging/airborne/settling/splash/gameover) only advances inside
  `update()`, itself only called from the rAF `frame()` loop, any live check
  that dispatches an input then merely *sleeps* before reading state --- with
  no screenshot in between --- will see stale, un-advanced state, not a
  bug. This likely explains why some of this deliverable's very first
  hold-timing checks needed the single-`eval`-with-in-page-`setTimeout`
  technique already logged in MEMORY.md: that technique keeps timing
  accurate but still needs a forced paint afterwards to actually see the
  outcome. Going forward, always bracket a dispatched input with
  `agent-browser screenshot` (or repeated ones) before trusting a text/DOM
  readback of this game's state, not just a `sleep`.
- **CDP `Page.setWebLifecycleState("frozen")` -> `"active"` mid-charge**:
  clean, and for an interesting reason --- freezing the page fires a real
  `blur` event on `window` (confirmed by instrumenting `window.__events`
  before freezing: `["blur@...", ]`, no `visibilitychange`). That means the
  existing blur-cancellation fix from `5b4a03d`
  (`cancelStuckCharge`/`cancelCharge()`, written for alt-tab/window-switch)
  *also* correctly handles this different real-world scenario (a backgrounded
  page being frozen by the browser's own scheduler under memory/battery
  pressure) --- not by luck, but because both cases are the same DOM event.
  Verified end to end against the built `pnpm preview` server (not `pnpm
  dev`, per the standing Vite-HMR note in MEMORY.md): charge meter visible
  pre-freeze, meter gone post-thaw (the blur handler cancelled it, no stuck
  state), a fresh press/release round-trip afterwards played out normally
  through airborne to a splash, no console errors at any point.
- **bfcache back-navigation** (`agent-browser open` away, then `agent-browser
  back`), a distinct scenario from CDP freeze/thaw: confirmed genuine bfcache
  restore via `pagehide`/`pageshow` listeners both firing with
  `persisted=true` (JS realm intact, not a reload). Same clean result and
  same reason --- navigating away already fires `blur`, so an in-progress
  charge is cancelled by the existing handler rather than left stuck; a
  fresh press/release after the restore resolved correctly (airborne ->
  splash, watched via forced screenshots), console clean throughout.
- `pnpm check` (typecheck, build, 28/28 tests) reconfirmed green before
  starting; no code changes made this run --- both checks were genuine
  verification passes with clean results, not bugs to fix.
- Dev/preview server shut down via the real listening PID (`lsof -i`),
  browser session left as-is (no persistent state to clean up).

## Prior state (fifth run, superseded by the above)

Fifth run on this deliverable (135h to cutoff at run start --- still a
deepen run, prompt did not call it the last). Prior hand-off's suggested
next question ("is a pointer leaving the canvas mid-charge, without
leaving the window, a distinct gap from the blur fix") was checked live
and closed clean --- no bug.

## Done this run

- Re-fetched the brief (unchanged) and re-read `main.ts`/`game-logic.ts`
  cold before touching anything.
- Live-checked the `pointerleave` question the prior hand-off flagged:
  dispatched a real `pointerdown` on the canvas, then a `pointermove` +
  `pointerleave` to coordinates well outside the canvas (still inside the
  window), screenshotted --- the charge meter kept filling, exactly as it
  should, since `pointerup`/`pointercancel` are wired on `window`, not the
  canvas, so leaving the canvas's bounds mid-hold correctly does nothing.
  Then dispatched a `pointerup` on `document` (not the canvas) with
  off-canvas coordinates and confirmed the hold still resolved correctly
  (a full-length charge overshot the stone into the water, as expected) ---
  window-level listeners catch a bubbled release regardless of where the
  pointerup's target sits. No gap here: the architecture (release
  listeners at `window` scope, not element scope) already covers it by
  design, not by accident.
- Checked touch-action: `styles.css` already has `touch-action: none` on
  `#stage`, so a touch hold won't trigger page scroll/zoom mid-charge ---
  already handled, no fix needed.
- Ran a fresh resize-mid-charge check (the same technique MEMORY.md logs
  for crit 4's drag-strum, never yet applied to this repo): started a
  charge at 1280x720, resized live to the 390x844 mobile viewport mid-hold
  with the charge still active, screenshotted (meter re-rendered correctly
  scaled, still centred on the player), then released and confirmed the
  jump resolved correctly at the new size. Clean --- the virtual
  800x600-space + `ctx.setTransform` scaling approach means canvas pixel
  size never enters the charge/release logic, so a resize mid-gesture has
  nothing to desync.
- `pnpm check` (typecheck, build, 28/28 tests) confirmed green; no code
  changes made this run since both checks came back clean.
- Dev server shut down via the real listening PID (`lsof -i`), browser
  session closed.

## Not done yet (fine --- this isn't the last run)

- `PROCESS.md` still has template boilerplate; `reflections/crit-5.md`
  doesn't exist. Both still correctly deferred to the final run. Citation
  list, unchanged from last hand-off (this run found no new commit-worthy
  fix, just clean verification passes plus the rAF/screenshot harness
  discovery above, which belongs in `PROCESS.md`'s account of how checks
  were actually run, not as a citation of its own):
  - `2917cdc` --- charge meter enlarged after playing at the mobile
    viewport (the brief's "one change came from playing" moment).
  - `b4ec821` --- Lighthouse audit port, fixed the contrast defect it
    found.
  - `7696c1f` --- gap-reachability fix (two per-score formulas combining
    into an impossible constraint neither violated alone).
  - The midpoint-sweep playthrough (no commit, logged in git history
    around `e655ee9`) --- the fairness/depth check the brief's "still
    interesting at five minutes" claim needs.
  - `5b4a03d` --- the window-blur/tab-switch stuck-charge fix, whose reach
    turned out wider than originally scoped (see this run's freeze/thaw and
    bfcache checks above).

## Single most important next action

Deepen list is dry a fourth time: both candidates the fifth run's hand-off
named as still-unverified (CDP freeze/thaw, bfcache back-navigation) are now
closed clean, and this run's main yield was a harness-methodology fact
(rAF needs a forced screenshot to advance in this headless session) rather
than an app bug. That's three checks in a row across two runs
(pointerleave, resize-mid-charge, freeze/thaw, bfcache) finding the
existing design already correct --- worth treating the event-completeness
and lifecycle-transition angles as genuinely exhausted for this small
codebase now, not just "dry this run." A future non-final run should look
for a real new angle before spending a whole run re-verifying these (e.g.:
does `saveBest`/`localStorage` ever race across two tabs of the same game
open at once and clobber each other's best score? does the `ResizeObserver`
+ `ctx.setTransform` scaling handle a devicePixelRatio change --- browser
zoom, moving the window to a different-DPI display --- without a
corresponding element-size change to trigger it?) --- both untried, both
plausible, neither yet checked live. If a future run tries one or both and
they also come back clean, that's a reasonable point to stop deepening and
move to the final run regardless of hours remaining: write `PROCESS.md`
(covering the rAF/screenshot harness lesson as part of "how checks were
actually run") and `reflections/crit-5.md` from the citation list above,
run the finishing-steps browser sweep, commit, push.
