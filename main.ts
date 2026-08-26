// Far Bank --- hold to charge a hop across the river, release to land it.
// One mechanic: judge the hold. Land short or long and the round ends in the
// water. The rules in game-logic.ts are the contract; everything here is
// timing, drawing and input.
import { chargeToDistance, nextGap, resolveJump, type Gap, type JumpOutcome } from "./game-logic.ts";

const VW = 800;
const VH = 600;
const WATER_Y = 380;
const PLAYER_X = 220;
const MAX_CHARGE_MS = 900;
const MAX_DISTANCE = 260;
const JUMP_MS = 380;
const SETTLE_MS = 160;
const SPLASH_MS = 550;
const START_STONE_WIDTH = 74;
const BEST_KEY = "far-bank-best";

type Phase = "ready" | "charging" | "airborne" | "settling" | "splash" | "gameover";

function loadBest(): number {
  try {
    return Number(localStorage.getItem(BEST_KEY)) || 0;
  } catch {
    return 0;
  }
}

function saveBest(value: number): void {
  try {
    localStorage.setItem(BEST_KEY, String(value));
  } catch {
    // storage unavailable (private browsing) --- the run still plays fine
  }
}

function easeInOutQuad(t: number): number {
  return t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2;
}

function easeOutCubic(t: number): number {
  return 1 - (1 - t) ** 3;
}

class FarBank {
  private readonly ctx: CanvasRenderingContext2D;
  private readonly scoreEl: HTMLElement;
  private readonly reducedMotion: boolean;

  private phase: Phase = "ready";
  private score = 0;
  private best = loadBest();

  private currentStoneWorldX = 0;
  private currentStoneWidth = START_STONE_WIDTH;
  private gap: Gap = nextGap(0, Math.random, MAX_DISTANCE);
  private scrollOffset = 0;

  private chargeStart = 0;
  private hopStart = 0;
  private hopFrom = 0;
  private jumpDistance = 0;
  private outcome: JumpOutcome = "stone";
  private settleStart = 0;
  private settleFrom = 0;
  private splashStart = 0;

  constructor(
    private readonly canvas: HTMLCanvasElement,
    scoreEl: HTMLElement,
  ) {
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("2D canvas context unavailable");
    this.ctx = ctx;
    this.scoreEl = scoreEl;
    this.reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
    this.updateScoreText();
  }

  private duration(ms: number): number {
    return this.reducedMotion ? Math.min(ms, 60) : ms;
  }

  private updateScoreText(): void {
    this.scoreEl.textContent =
      this.phase === "gameover"
        ? `In the water --- score ${this.score}, best ${this.best}`
        : `Score ${this.score}`;
  }

  press(now: number): void {
    if (this.phase === "gameover") this.reset();
    if (this.phase !== "ready") return;
    this.phase = "charging";
    this.chargeStart = now;
  }

  release(now: number): void {
    if (this.phase !== "charging") return;
    const held = now - this.chargeStart;
    this.jumpDistance = chargeToDistance(held, MAX_CHARGE_MS, MAX_DISTANCE);
    this.outcome = resolveJump(this.jumpDistance, this.gap);
    this.hopFrom = this.scrollOffset;
    this.hopStart = now;
    this.phase = "airborne";
  }

  private reset(): void {
    this.phase = "ready";
    this.score = 0;
    this.currentStoneWorldX = 0;
    this.currentStoneWidth = START_STONE_WIDTH;
    this.gap = nextGap(0, Math.random, MAX_DISTANCE);
    this.scrollOffset = 0;
    this.updateScoreText();
  }

  update(now: number): void {
    if (this.phase === "airborne") {
      const t = Math.min((now - this.hopStart) / this.duration(JUMP_MS), 1);
      this.scrollOffset = this.hopFrom + this.jumpDistance * easeInOutQuad(t);
      if (t >= 1) {
        if (this.outcome === "stone") {
          const landedStoneWorldX = this.hopFrom + this.gap.distance;
          this.currentStoneWorldX = landedStoneWorldX;
          this.currentStoneWidth = this.gap.stoneWidth;
          this.score += 1;
          if (this.score > this.best) {
            this.best = this.score;
            saveBest(this.best);
          }
          this.gap = nextGap(this.score, Math.random, MAX_DISTANCE);
          this.settleFrom = this.scrollOffset;
          this.settleStart = now;
          this.phase = "settling";
        } else {
          this.splashStart = now;
          this.phase = "splash";
        }
        this.updateScoreText();
      }
    } else if (this.phase === "settling") {
      const t = Math.min((now - this.settleStart) / this.duration(SETTLE_MS), 1);
      this.scrollOffset = this.settleFrom + (this.currentStoneWorldX - this.settleFrom) * easeOutCubic(t);
      if (t >= 1) this.phase = "ready";
    } else if (this.phase === "splash") {
      const t = Math.min((now - this.splashStart) / this.duration(SPLASH_MS), 1);
      if (t >= 1) {
        this.phase = "gameover";
        this.updateScoreText();
      }
    }
  }

  private worldToScreen(worldX: number): number {
    return worldX - this.scrollOffset + PLAYER_X;
  }

  render(now: number): void {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, VW, VH);

    ctx.fillStyle = "#f3efe4";
    ctx.fillRect(0, 0, VW, VH);

    // Ni Zan style far bank: a sparse ridge and two bare strokes for trees ---
    // drawn once per frame, at a fixed screen position, never resolvable by
    // crossing --- the far bank recedes exactly as fast as you approach it.
    ctx.fillStyle = "rgba(107, 102, 92, 0.35)";
    ctx.beginPath();
    ctx.moveTo(0, 170);
    ctx.lineTo(140, 100);
    ctx.lineTo(260, 150);
    ctx.lineTo(430, 90);
    ctx.lineTo(620, 145);
    ctx.lineTo(VW, 115);
    ctx.lineTo(VW, WATER_Y);
    ctx.lineTo(0, WATER_Y);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = "rgba(36, 33, 29, 0.55)";
    ctx.lineWidth = 2;
    for (const x of [95, 560]) {
      ctx.beginPath();
      ctx.moveTo(x, WATER_Y - 4);
      ctx.lineTo(x - 6, WATER_Y - 60);
      ctx.moveTo(x - 6, WATER_Y - 60);
      ctx.lineTo(x - 22, WATER_Y - 70);
      ctx.moveTo(x - 6, WATER_Y - 50);
      ctx.lineTo(x + 14, WATER_Y - 62);
      ctx.stroke();
    }

    // water
    ctx.fillStyle = "rgba(107, 102, 92, 0.18)";
    ctx.fillRect(0, WATER_Y, VW, VH - WATER_Y);
    ctx.strokeStyle = "rgba(107, 102, 92, 0.4)";
    ctx.lineWidth = 1.5;
    const drift = (now / 900) % (2 * Math.PI);
    for (let row = 0; row < 4; row++) {
      const y = WATER_Y + 30 + row * 45;
      ctx.beginPath();
      for (let x = 0; x <= VW; x += 20) {
        const wave = Math.sin(x / 60 + drift + row) * 3;
        if (x === 0) ctx.moveTo(x, y + wave);
        else ctx.lineTo(x, y + wave);
      }
      ctx.stroke();
    }

    // stones
    this.drawStone(this.currentStoneWorldX, this.currentStoneWidth);
    this.drawStone(this.currentStoneWorldX + this.gap.distance, this.gap.stoneWidth);

    // charge meter --- the single accent colour marks the moment of decision.
    // Sized to stay legible scaled down to the ~350px-wide mobile canvas,
    // where a smaller bar (found by playing at that viewport) read as a
    // barely-visible sliver.
    if (this.phase === "charging") {
      const t = Math.min((now - this.chargeStart) / MAX_CHARGE_MS, 1);
      const barWidth = 70;
      const barHeight = 16;
      const barX = PLAYER_X - barWidth / 2;
      const barY = WATER_Y - 100;
      ctx.strokeStyle = "rgba(36, 33, 29, 0.5)";
      ctx.lineWidth = 3;
      ctx.strokeRect(barX, barY, barWidth, barHeight);
      ctx.fillStyle = "#a13f2f";
      ctx.fillRect(barX + 2, barY + 2, (barWidth - 4) * t, barHeight - 4);
    }

    // player
    this.drawPlayer(now);

    // splash
    if (this.phase === "splash") {
      const t = Math.min((now - this.splashStart) / this.duration(SPLASH_MS), 1);
      ctx.strokeStyle = `rgba(161, 63, 47, ${1 - t})`;
      ctx.lineWidth = 2;
      for (const ring of [0, 1, 2]) {
        const r = (t * 40 + ring * 10) * (1 - ring * 0.15);
        ctx.beginPath();
        ctx.ellipse(PLAYER_X, WATER_Y + 10, r, r * 0.4, 0, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
  }

  private drawStone(worldX: number, width: number): void {
    const x = this.worldToScreen(worldX);
    if (x < -width || x > VW + width) return;
    const ctx = this.ctx;
    ctx.fillStyle = "#24211d";
    ctx.beginPath();
    ctx.ellipse(x, WATER_Y, width / 2, 16, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "rgba(255, 255, 255, 0.12)";
    ctx.beginPath();
    ctx.ellipse(x - width / 6, WATER_Y - 5, width / 4, 6, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  private drawPlayer(now: number): void {
    const ctx = this.ctx;
    let y = WATER_Y - 20;

    if (this.phase === "airborne") {
      const t = Math.min((now - this.hopStart) / this.duration(JUMP_MS), 1);
      y -= Math.sin(Math.PI * t) * 70;
    } else if (this.phase === "splash") {
      const t = Math.min((now - this.splashStart) / this.duration(SPLASH_MS), 1);
      y = WATER_Y - 20 + t * 26;
      ctx.globalAlpha = Math.max(1 - t * 1.3, 0);
    } else if (this.phase === "gameover") {
      return;
    }

    // The camera always recentres on the player's own trajectory (see
    // worldToScreen), so the player is drawn at a fixed screen x in every
    // phase --- it's the stones that visibly slide short or long of it.
    ctx.fillStyle = "#24211d";
    ctx.beginPath();
    ctx.ellipse(PLAYER_X, y, 12, 14, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }
}

function main(): void {
  const canvas = document.querySelector<HTMLCanvasElement>("#stage");
  const scoreEl = document.querySelector<HTMLElement>("#score");
  if (!canvas || !scoreEl) return;

  const game = new FarBank(canvas, scoreEl);

  function resize(): void {
    const rect = canvas!.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas!.width = Math.max(1, Math.round(rect.width * dpr));
    canvas!.height = Math.max(1, Math.round(rect.height * dpr));
    const ctx = canvas!.getContext("2d");
    if (!ctx) return;
    const scale = Math.min(canvas!.width / VW, canvas!.height / VH);
    ctx.setTransform(
      scale,
      0,
      0,
      scale,
      (canvas!.width - VW * scale) / 2,
      (canvas!.height - VH * scale) / 2,
    );
  }

  new ResizeObserver(resize).observe(canvas);
  resize();

  let activePointerId: number | null = null;

  canvas.addEventListener("pointerdown", (event) => {
    if (activePointerId !== null) return;
    activePointerId = event.pointerId;
    event.preventDefault();
    game.press(performance.now());
  });
  const endPointer = (event: PointerEvent): void => {
    if (event.pointerId !== activePointerId) return;
    activePointerId = null;
    game.release(performance.now());
  };
  window.addEventListener("pointerup", endPointer);
  window.addEventListener("pointercancel", endPointer);

  window.addEventListener("keydown", (event) => {
    if (event.key !== " " && event.code !== "Space") return;
    event.preventDefault();
    if (event.repeat) return;
    game.press(performance.now());
  });
  window.addEventListener("keyup", (event) => {
    if (event.key !== " " && event.code !== "Space") return;
    event.preventDefault();
    game.release(performance.now());
  });

  function frame(now: number): void {
    game.update(now);
    game.render(now);
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

main();
