import { describe, expect, it } from "vitest";
import { chargeToDistance, nextGap, resolveJump } from "../game-logic.ts";

// The brief's one testable rule: a mistimed landing ends the round. These
// assert the boundary directly, in world units, with no canvas or DOM
// involved --- the contract the render loop has to honour, not how it draws.
describe("resolveJump", () => {
  const gap = { distance: 100, stoneWidth: 20 }; // stone spans [90, 110]

  it("lands on the stone inside its span", () => {
    expect(resolveJump(100, gap)).toBe("stone");
    expect(resolveJump(90, gap)).toBe("stone");
    expect(resolveJump(110, gap)).toBe("stone");
  });

  it("ends the round in the water just short of the stone", () => {
    expect(resolveJump(89.9, gap)).toBe("water");
  });

  it("ends the round in the water just past the stone", () => {
    expect(resolveJump(110.1, gap)).toBe("water");
  });

  it("ends the round in the water for a jump with no distance at all", () => {
    expect(resolveJump(0, gap)).toBe("water");
  });
});

describe("chargeToDistance", () => {
  it("maps zero hold to zero distance", () => {
    expect(chargeToDistance(0, 900, 260)).toBe(0);
  });

  it("maps a full hold to the maximum distance", () => {
    expect(chargeToDistance(900, 900, 260)).toBe(260);
  });

  it("clamps a hold longer than the charge window", () => {
    expect(chargeToDistance(5000, 900, 260)).toBe(260);
  });

  it("is linear in between", () => {
    expect(chargeToDistance(450, 900, 260)).toBeCloseTo(130, 5);
  });
});

describe("nextGap", () => {
  it("keeps every gap and stone width within a sane, positive range", () => {
    for (let score = 0; score < 40; score++) {
      const gap = nextGap(score, () => 0.5);
      expect(gap.distance).toBeGreaterThan(0);
      expect(gap.stoneWidth).toBeGreaterThan(0);
    }
  });

  it("narrows the stone as the score climbs, never past a minimum", () => {
    const early = nextGap(0, () => 0.5);
    const late = nextGap(30, () => 0.5);
    expect(late.stoneWidth).toBeLessThan(early.stoneWidth);
    expect(late.stoneWidth).toBeGreaterThanOrEqual(18);
  });

  it("never hands out a stone whose near edge is past the longest reachable jump", () => {
    // A high score widens the gap range faster than it narrows the stone,
    // so an uncapped roll could ask for a landing beyond maxReachable ---
    // one no hold, however well timed, could actually make.
    const maxReachable = 260;
    for (let score = 0; score <= 60; score++) {
      const gap = nextGap(score, () => 1, maxReachable);
      const nearEdge = gap.distance - gap.stoneWidth / 2;
      expect(nearEdge).toBeLessThanOrEqual(maxReachable);
    }
  });
});
