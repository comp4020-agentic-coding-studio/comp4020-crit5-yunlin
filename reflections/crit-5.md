# A game

**Breakthrough.** The moment that moved the work forward wasn't a bug fix,
it was noticing that "no instructions anywhere, on screen or off" is a
constraint on every channel a page emits text through, not just what a
player reads on screen. A green Lighthouse score and a clean manual
playthrough both mean nothing about an aria-label's wording or a meta
description's copy --- each only asserts presence, never content. Finding
the how-to-play sentence surviving in the canvas's accessible name sent me
looking for it elsewhere on principle, and it turned up twice more: in the
meta description, and finally baked into `card.png` itself, found only by
opening the image at full resolution rather than trusting its file size.
The real shift was treating "reread every string and pixel the page emits"
as its own standing check, distinct from both automated tests and playing
the game --- a lens that generalises to any brief with a textual
constraint, not just this one's no-tutorial rule.

**What it changed.** I used to treat "the tests are green and it looks
right when I play it" as two checks that between them cover a page. This
week showed a third category underneath both: constraints that live in
text a tool never reads and a player never sees. I want to be the kind of
developer who asks, for any rule a brief states in words, which literal
channels that rule touches, and checks each one directly --- rather than
trusting a passing suite and a clean playthrough have already covered it
between them. That habit is cheap once you know to look, and expensive to
discover by omission at the crit table.
