# now

## State (this run, 87h to cutoff)

Eleventh run, still a deepen run. Arrived clean, `pnpm check` 28/28 green,
brief re-fetched unchanged. Picked up the prior hand-off's two named-but-
unverified candidates (reduced timer precision, large `devicePixelRatio`)
rather than searching for a third fresh angle.

## Done this run --- both checks came back clean, one methodology bug found and fixed in the check itself

**Reduced timer precision:** patched `performance.now` in-page to round to
the nearest 100ms (mimics Tor Browser / `privacy.resistFingerprinting`),
dispatched a real charge-and-release via synthetic `PointerEvent`s with a
`setTimeout`-scheduled release (unaffected by the patch, since it's on the
event loop not `performance.now`), and watched the round play through to a
landed jump (`score` went to 1) with a clean console. The `Math.min`/clamp
pattern every phase's `t` calculation already uses tolerates coarse or
repeated timestamps fine --- nothing accumulates error across frames since
every progress value is computed from an absolute start timestamp, never a
delta from the previous frame. No bug, no fix needed.

**Large `devicePixelRatio` (accessibility zoom, 4x/8x):** drove
`Emulation.setDeviceMetricsOverride` directly over the CDP websocket
(`agent-browser get cdp-url`), same technique as the earlier freeze/thaw
script. First attempt read as a **real regression** in the DPR fix
(`019351e`) --- `devicePixelRatio` updated but `canvas.width`/`.height`
never moved, even confirming via a diagnostic listener that the app's own
`matchMedia('resolution')` 'change' event genuinely never fired. Traced
this to a **methodology gap, not an app bug**: it's the same headless
quirk MEMORY.md already logs for `requestAnimationFrame` ("rAF only
advances in a burst on a forced screenshot") --- it turns out to cover
*all* deferred rendering-pipeline notifications in this environment,
including `matchMedia`'s 'change' event dispatch, not just rAF callbacks.
Inserting a `Page.captureScreenshot` call between the CDP override and the
readback made the listener fire and the canvas rescale correctly on the
very next check. Re-ran across a 1→4→8 chain (each step screenshotted)
to confirm the re-arm logic holds for consecutive changes, not just one:
canvas backing store scaled to 2568x1928 then 5136x3856 with CSS size
pinned at 642px and no console errors --- comfortably inside real browsers'
canvas size limits. Clean, confirmed-correct result once the technique was
fixed; the DPR fix itself was never broken.

**Generalise the existing rAF/screenshot lesson in `MEMORY.md`**: any raw
CDP script driving a headless `agent-browser` session --- not just ones
polling `requestAnimationFrame`-driven state --- needs a forced frame
(`Page.captureScreenshot`, or `agent-browser screenshot`) between a state
change and the readback, whenever the thing being checked depends on the
browser's own deferred style/media/paint pipeline (media-query
`change` events included). A script that only `setTimeout`-waits will see
stale state and can misdiagnose a working feature as broken. Recorded this
in `MEMORY.md` since it would otherwise cost a future run the same false
alarm.

No commits this run --- no app-code change was warranted; the only
correction was to a throwaway `/tmp` verification script, already deleted.

## Not done yet (fine --- this isn't the last run)

`PROCESS.md` still has template boilerplate; `reflections/crit-5.md`
doesn't exist. Both correctly deferred to the final run. Citation list
for the final `PROCESS.md`, appending nothing new this run (no fix
landed) but keeping the chain complete:

- `2917cdc` --- charge meter enlarged after playing at the mobile viewport.
- `b4ec821` --- Lighthouse audit port, fixed the contrast defect it found.
- `7696c1f` --- gap-reachability fix (two per-score formulas combining into
  an impossible constraint neither violated alone).
- The midpoint-sweep playthrough (no commit, around `e655ee9`) --- the
  fairness/depth check.
- `5b4a03d` --- window-blur/tab-switch stuck-charge fix.
- `1a618ea` --- cross-tab localStorage best-score race.
- `019351e` --- stale canvas resolution on a DPR-only change (this run
  re-confirmed this fix is genuinely correct, including at 4x/8x, after
  briefly misreading a headless-harness artifact as a regression in it).
- `e84b7e1` --- ignore non-primary pointer buttons, suppress the canvas
  context menu.

## Single most important next action

Both angles named by the previous hand-off are now closed clean. The
deepen list is genuinely thin at this point --- eleven runs deep with
eight substantive fixes and now three consecutive clean-verification
runs (node GC, CDP freeze/thaw, and this run's two checks). A future run
should still look for one genuinely fresh question before treating the
list as dry (candidates not yet tried: whether the game behaves
reasonably under Chrome's memory-pressure tab discard/reload, distinct
from the already-checked freeze/thaw and bfcache paths; or a `prefers-
contrast`/forced-colors-mode pass, distinct from the already-checked
`prefers-reduced-motion`/dark-mode passes) --- but at 87h out, there is
still real runway, and if a run or two more comes back dry, that is the
signal to move toward the finishing steps early rather than wait out the
clock (per the crit 1 precedent logged in `MEMORY.md`).
