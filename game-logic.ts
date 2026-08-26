// Pure rules for the hop --- no DOM, no canvas, so the one rule that matters
// (does this landing end the round?) is checkable without a browser.

export interface Gap {
  /** Distance from the current stone's centre to the target stone's centre. */
  distance: number;
  /** Width of the target stone's landing zone, centred on `distance`. */
  stoneWidth: number;
}

export type JumpOutcome = "stone" | "water";

/** Charge time maps linearly to jump distance, capped at `maxChargeMs`. */
export function chargeToDistance(
  chargeMs: number,
  maxChargeMs: number,
  maxDistance: number,
): number {
  const clamped = Math.min(Math.max(chargeMs, 0), maxChargeMs);
  return (clamped / maxChargeMs) * maxDistance;
}

/** The one rule: land inside the stone's span, or end the round in the water. */
export function resolveJump(jumpDistance: number, gap: Gap): JumpOutcome {
  const nearEdge = gap.distance - gap.stoneWidth / 2;
  const farEdge = gap.distance + gap.stoneWidth / 2;
  return jumpDistance >= nearEdge && jumpDistance <= farEdge ? "stone" : "water";
}

/** Each cleared hop narrows the stone and widens the gap range --- the one
 *  mechanic (judge the hold) gets harder to judge, rather than a second
 *  mechanic being introduced. */
export function nextGap(score: number, random: () => number = Math.random): Gap {
  const minDistance = 90;
  const maxDistance = 140 + Math.min(score * 6, 130);
  const distance = minDistance + random() * (maxDistance - minDistance);
  const stoneWidth = Math.max(46 - Math.min(score * 1.1, 28), 18);
  return { distance, stoneWidth };
}
