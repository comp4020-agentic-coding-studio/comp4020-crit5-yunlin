# now

## State

Second run on this deliverable (159h to cutoff at run start --- still a
deepen run, not the last one). Far Bank (charge-and-release river crossing)
was already built and committed on the prior run; this run worked the
queued deepen-phase list from that hand-off.

## Done this run

- Live-checked resize mid-charge and mid-airborne with `agent-browser set
  viewport` (1920x1080 -> 800x600 -> 390x844, mid-gesture both times): clean
  both times, no console errors, canvas rescales correctly, landing outcome
  still computed correctly. Confirms what the code already implied --- the
  800x600 virtual coordinate space is fully decoupled from real pixel size
  --- but worth having actually checked rather than trusted, per the
  standing practice. No fix needed.
- Ported `scripts/audit.ts` (Lighthouse accessibility+performance,
  `chrome-launcher` pointed at agent-browser's own Chrome binary) from crit
  4's pattern, `check:audit` script added. First run found a real defect:
  the nav link colour (`#0b5fff` on `--paper`) was 4.46:1, just under the
  4.5:1 AA floor for normal text. Fixed by switching to `#0000ee` (`#00e`
  shorthand) --- the actual historical "classic blue link" colour this
  repo's own aesthetic throughline already claims to be using --- which
  clears at 8.18:1. Re-ran clean: 100/100 both categories. Committed as
  `b4ec821`.
- Did a real multi-round playthrough (synthetic `PointerEvent`s with an
  in-page `setTimeout` for the hold, per the standing CLI-latency-avoidance
  technique, but hold durations chosen by eye from each screenshot rather
  than computed from the formula --- i.e. actually playing, not scripting
  against known constants). Found a genuine feel problem only visible this
  way: the charge meter (40x10 virtual units) is already marginal on
  desktop (canvas caps at 640px CSS width via `max-width: 40rem`) and reads
  as a near-illegible ~17x4px sliver at the 390px mobile marking viewport
  --- undermining the one visual readout for the core "judge the hold"
  mechanic on one of the two required marking viewports. Enlarged to 70x16
  with a thicker border; confirmed clearly legible at both viewports by
  screenshot. Committed as `2917cdc` --- this is the run's "one change that
  came from playing rather than reading the code" the brief's spec asks
  for, worth citing directly in `PROCESS.md` when that's written.
- Separately, reading `nextGap`'s formulas turned up a real fairness bug
  (not from playing --- from working through the numbers, same category as
  crit 5's pre-ship linear/eased desync catch): at score >= 26, the
  stone-narrowing and gap-widening formulas can combine so a stone's near
  edge sits past 260, the longest jump `chargeToDistance`'s own cap can
  produce --- an unwinnable stone, not a hard one, about 0.56% of hops
  there (verified by brute-forcing `nextGap` 2M times, both before and
  after the fix, in a throwaway `node --experimental-strip-types -e`
  one-liner). Fixed by giving `nextGap` a `maxReachable` parameter (default
  260, main.ts passes its own `MAX_DISTANCE` constant explicitly) and
  clamping the gap range to it; added a regression test asserting this
  across score 0--60. Committed as `7696c1f`.
- `pnpm check` (28/28 tests now) and `pnpm check:audit` both green after
  every change in this run. Dev server always shut down cleanly afterwards
  (`lsof -i :5173` for the real listening PID each time, per the standing
  lesson).

## Not done yet (fine --- this isn't the last run)

- `public/card.png` still the template placeholder (1200x630). Worth
  replacing with something representing Far Bank before the final run.
- Haven't played a genuinely long (multiple real minutes, not a dozen
  scripted hops) session start-to-finish purely for "does this stay fun,"
  as opposed to hunting specific bugs --- what got done this run was
  play-with-a-purpose (find the mobile meter issue, then verify the fix),
  which is different from a straight five-minute fun-check. Worth one
  before calling the depth bar fully settled.
- `PROCESS.md` still has its template boilerplate and `reflections/crit-5.md`
  doesn't exist yet --- both correctly deferred to the final run (doctrine
  step 4). When writing `PROCESS.md`, the charge-meter-from-playing moment
  (`2917cdc`) is the strongest candidate for the "one change came from
  playing" citation; the audit-driven contrast fix (`b4ec821`) and the
  gap-reachability fix (`7696c1f`) are both good "corrected the harness /
  caught it before it shipped" moments for the other slots.
- Haven't re-checked whether the two-mechanics-that-interact stretch goal
  ("the harder, better move") is worth attempting --- current build is
  deliberately one mechanic per the brief's own "usually enough" framing,
  and MEMORY.md's restraint-ceiling lesson (crit 1) argues against adding
  scope without a reason grounded in what the piece is arguing. Worth a
  deliberate decision, not a default, before the final run.

## Single most important next action

A real, unhurried five-minute playthrough purely for fun/depth (not bug
hunting), now that the mobile-legibility and gap-reachability fixes are in
--- then decide deliberately (not by default) whether the brief's optional
two-interacting-mechanics stretch is worth doing here, before treating the
deepen phase as dry.
