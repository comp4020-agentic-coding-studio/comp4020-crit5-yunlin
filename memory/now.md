# now

## State (this run, 93h to cutoff)

Tenth run on this deliverable, still a deepen run (prompt gave hours only,
no "last run" language). Re-fetched the brief from the course source ---
unchanged. Arrived with `git status` clean, `pnpm check` green (28/28) at
start. The prior two hand-offs both said the deepen list read genuinely
dry with no new candidate identified; per the standing "ask a different
question, don't re-verify the checklist" lesson, went looking for a
subsystem nobody had asked a question of yet rather than re-checking any
of the eight already-closed angles.

## Done this run --- found and fixed a real bug

**The pointerdown handler never checked `event.button`, so a right-click
(or middle-click) on the canvas started a charge exactly like a left
click.** Read `main.ts`'s input wiring fresh looking for "what kind of
input event could reach `press()`/`release()` that the code doesn't
expect" rather than re-checking event *sequencing* (already covered by the
pointercancel/blur/per-pointer-scoping/capture/resize angles). Traced the
consequence: a right-click's `contextmenu` event reliably reaches the
page, but whether the *native menu it opens* fires `window.blur` first is
platform/browser-dependent (confirmed via `WebSearch` against a Mozilla
bugzilla thread and a CodeMirror issue --- macOS explicitly does not shift
focus on a bare right-click, only once a menu item is chosen; other
browser/OS combos have shown spurious blur+focus). That means the existing
blur-cancels-a-stuck-charge safety net (`5b4a03d`, logged in `MEMORY.md`)
cannot be trusted to recover a charge a right-click started, on every
platform.

Verified live with `agent-browser` against the built `pnpm preview`
server: instrumented `contextmenu`/`pointerdown`/`pointerup` listeners,
then drove a real CDP `mouse down right` / `mouse up right` over the
canvas. Pre-fix: `pointerdown` opened the meter (screenshot confirmed),
`contextmenu` fired after it with no blur in this harness, and CDP's
synthetic release did eventually deliver `pointerup` here --- but that's
this sandboxed session's behaviour, not a guarantee about a real desktop
browser's native context-menu capture, which the WebSearch evidence says
varies. Rather than chase an unverifiable platform matrix, removed the
whole risk: gated `pointerdown` on `event.button === 0` and added a
`contextmenu` listener on the canvas that just `preventDefault()`s it,
since a native browser menu has nothing relevant to offer over a
full-canvas single-mechanic game anyway. Confirmed post-fix live: right
mouse button no longer opens the charge meter (screenshot), left click and
keyboard Space both still work exactly as before, `pnpm check` stayed
28/28 green. Committed as `e84b7e1`.

This is a different bug shape from every prior event-completeness finding
in `MEMORY.md`: those were all about a gesture that *should* end not
finding every event that ends it (pointercancel, blur, per-pointer
scoping) or a gesture's *coordinates* drifting (touch capture, resize,
DPR). This one is about a gesture *starting* from an input the mechanic
was never meant to respond to at all --- worth remembering as its own
question ("what can trigger `press()` that isn't the intended input?") the
next time an event-wiring deepen pass runs dry on the "does every started
gesture end cleanly" angle.

## Not done yet (fine --- this isn't the last run)

`PROCESS.md` still has template boilerplate; `reflections/crit-5.md`
doesn't exist. Both correctly deferred to the final run. Citation list,
appending this run's fix:

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
  context menu (this run).

## Single most important next action

The "does every started gesture end cleanly" angle and the "does a
gesture start from the right input" angle are now both explored. A future
run should still look for a genuinely fresh question before declaring the
list dry --- candidates not yet asked: whether anything in the render or
update loop assumes a monotonically-increasing `now` (what happens if
`performance.now()` itself is clamped/rounded more coarsely under a
privacy-hardened browser, e.g. Tor Browser's reduced timer precision,
which could make `held`/`t` computations see repeated identical
timestamps); or whether the game behaves reasonably with a very large
`devicePixelRatio` (e.g. 4x, some accessibility zoom settings) rather than
just a DPR *change* (already covered). If a genuinely fresh angle stops
turning up for another run or two, move toward the finishing steps early
per doctrine rather than waiting out the clock --- but at 93h out (versus
crit 1's 28h precedent for that call), there's still real runway, so treat
that threshold as further off than it was for a one-week deliverable this
close to done.
