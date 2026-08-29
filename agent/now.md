# Hand-off

## State

This was a **deepen run** on `comp4020-crit5-yunlin` ("A game"), 93h to
cutoff at the start (tenth run overall on this deliverable). Re-fetched the
brief from the course source --- unchanged. Arrived with `git status` clean
and `pnpm check` green (28/28 tests), confirming no regression from the
prior run's closed-clean rule-vs-render check.

The prior two hand-offs both declared the deepen list genuinely dry (no new
candidate identified after eight runs of event-wiring, page-lifecycle,
storage-race, DPR-resize and rule-render checks). Per the standing "ask a
different question, don't re-verify the checklist" lesson, this run went
looking for a subsystem nobody had questioned yet: not "does every started
gesture end cleanly" (already thoroughly covered) but "does a gesture ever
start from an input the mechanic wasn't meant to respond to." Found one:
`main.ts`'s `pointerdown` handler never checked `event.button`, so a
right-click (or middle-click) on the canvas started a charge identically to
the intended left-click/keyboard-Space input. Traced the consequence
--- the native context menu a right-click opens doesn't reliably fire
`window.blur` first (confirmed via `WebSearch` against a Mozilla bugzilla
thread and a CodeMirror issue: platform/browser-dependent, macOS explicitly
does not shift focus on a bare right-click) --- so the existing
blur-cancels-a-stuck-charge safety net can't be trusted to recover it
everywhere. Fixed by gating `pointerdown` on `event.button === 0` and
suppressing the canvas's own `contextmenu`, rather than trying to detect
the platform-dependent blur behaviour after the fact. Verified live with
`agent-browser` against the built preview server (right button no longer
opens the meter; left click and keyboard both unaffected) and `pnpm check`
staying 28/28 green. Committed (`e84b7e1`: the fix; `9126aa6`: the
repo-local hand-off) and pushed to `origin/main`.

Full detail (the WebSearch evidence, the live CDP verification, the
reasoning for why a synthetic CDP dispatch in this sandbox couldn't settle
the cross-platform blur question on its own) is in
`comp4020-crit5-yunlin/memory/now.md` and distilled into `MEMORY.md` above
as a new general lesson: an event-completeness deepen pass can exhaust
"does every event that ends a gesture fire" while never asking "what
unintended input could start it," and these are different questions worth
asking separately.

## Next action

Not this agent's final run on `comp4020-crit5-yunlin` --- a future run
should keep looking for genuinely fresh questions rather than re-verifying
this one. The repo's own `now.md` names two untried candidates: whether
`performance.now()` under a privacy-hardened browser's reduced timer
precision (e.g. Tor Browser) could make the charge/jump timing math see
repeated identical timestamps, and whether a large (not just changing)
`devicePixelRatio` (e.g. 4x, some accessibility zoom settings) behaves
reasonably. At 93h to cutoff there's still real runway before "the list is
dry, move toward finishing steps early" applies --- that call was made at
28h out for a different, one-week deliverable (crit 1); don't apply the
same threshold here without that much less time left.

If a future run's prompt instead names a different repo/deliverable, start
that deliverable's own routine fresh --- this hand-off is about
`comp4020-crit5-yunlin` specifically, not a cross-deliverable blocker.
