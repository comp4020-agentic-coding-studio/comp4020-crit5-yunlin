# Process overview

## What I built

Far Bank: one mechanic, hold to charge a hop across a river of stepping
stones, release to land it. Land short or long and the round ends; land on
the stone and the score climbs while the gap widens and the stone narrows.
The opening screen is the whole game --- a figure at the river's edge, two
stones ahead, nothing else --- so the first press is the only instruction it
gets.

## The moments that mattered

1. **A rule under test, and the bug it was worth writing for.** The gap
   generator narrows the stone (down to a floor) and widens the distance (up
   to a ceiling) as score climbs, and each cap looked sane in isolation. But
   past score 26 the two combine into a stone whose near edge sits beyond
   the longest jump the charge mechanic can ever produce --- unwinnable, not
   hard, for about 0.56% of hops in that range. I found it by working the
   two formulas' bounds through algebra, not by playing (reaching score 26
   organically is already a feat), then confirmed the rate with a throwaway
   brute-force script before trusting the arithmetic. The fix clamps the
   generated gap to the caller's own max-reachable-distance constant, and
   `spec/game-logic.test.ts`'s "never hands out a stone whose near edge is
   past the longest reachable jump" sweeps every score 0--60 so this rule
   stays provably true rather than just believed --- the one rule the spec
   asks to put under a focused automated test.
   [`7696c1f`](https://github.com/comp4020-agentic-coding-studio/comp4020-crit5-yunlin/commit/7696c1f)

2. **A change that came from playing, not reading.** The charge meter (40x10
   in the game's 800x600 virtual space) read as merely marginal on desktop,
   where the canvas itself caps at 640px wide --- the constants looked
   plausible on paper. Only actually charging a jump and screenshotting the
   mobile viewport showed it as a barely-visible sliver, undermining the
   only readout for the "judge the hold" mechanic on one of the two marking
   viewports. Doubled both dimensions and thickened the border; the fix
   exists because I played the build, not because a number looked wrong in
   the source.
   [`2917cdc`](https://github.com/comp4020-agentic-coding-studio/comp4020-crit5-yunlin/commit/2917cdc)

3. **The no-tutorial constraint hides in channels a playtest never looks
   at.** The brief bars instructions "anywhere, on screen or off," and I'd
   checked the screen. Rereading every string and image the page actually
   emits found the same how-to-play sentence surviving in three places a
   sighted playtest and a green Lighthouse pass both miss: the canvas's
   `aria-label`, the `<meta name="description">`, and --- found last, by
   opening the link-preview PNG at full resolution rather than trusting its
   dimensions --- baked into the card image's own pixels as a subtitle.
   Each fix replaced the instruction with the same stakes-only line ("one
   wrong leap and it's over") so the three surviving channels now agree
   word-for-word instead of just independently avoiding the rule.
   [`976cf89...71b4cb0`](https://github.com/comp4020-agentic-coding-studio/comp4020-crit5-yunlin/compare/976cf89...71b4cb0)

4. **An event set is only as complete as its reset paths.** The charge
   gesture reset cleanly on key-up, pointer-up and pointer-cancel, but had
   no `blur` or `visibilitychange` handling. Alt-tabbing mid-hold could drop
   the matching release event entirely, leaving the meter frozen full and
   every later press silently swallowed --- no recovery short of a reload.
   Confirmed live with a dispatched `keydown` held past the charge cap
   across a simulated blur; fixed with a `cancelCharge()` wired to both
   `window`'s `blur` and `document`'s `visibilitychange`, which returns the
   player to ready with no score cost, since they never chose that hold.
   [`5b4a03d`](https://github.com/comp4020-agentic-coding-studio/comp4020-crit5-yunlin/commit/5b4a03d)

## Directing, grounding and correcting

Each moment above was a self-check pass I ran deliberately, not a tool
catching it for me: `tsc`, `vite build` and the vitest suite stayed green
through every one of these bugs, because none of them is a type error or a
markup-shape error --- they're a formula's combined range, a legibility
call, a wording constraint, and an event-completeness gap, each of which
only shows up by asking the code (or the running build) a specific question
no automated check was already asking. The correction that generalises
furthest is #3: finding the same defect shape in a second channel (the meta
description) was reason to go looking for a third (the image), rather than
treating the first fix as the end of the check.
