"use client";

import { useState, useEffect, useRef, useCallback, useTransition } from "react";
import Image from "next/image";

import { Loader2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

import { signInWithGoogle } from "@/lib/actions/auth";
import { cn } from "@/lib/utils";

// ============================================================================
// TYPES
// ============================================================================

type Vector2D = {
  x: number;
  y: number;
};

type BallState = {
  x: number;
  y: number;
  vx: number;
  vy: number;
};

type WorldLayout = {
  isMobile: boolean;
  scale: number;
  screenW: number;
  screenH: number;
  groundY: number;
  ballRadius: number;
  rimWidth: number;
  rimX: number;
  rimY: number;
  playerScale: number;
  playerX: number;
  playerY: number;
  shoulderX: number;
  shoulderY: number;
  armLength: number;
};

type ReturnAnim = {
  startX: number;
  startY: number;
  progress: number;
};

type LaunchVelocity = {
  vx: number;
  vy: number;
};

type SportLabel = {
  name: string;
  color: string;
  x: number;
  y: number;
  speed: number;
};

type BasketballLoginProps = {
  error?: string;
};

// ============================================================================
// CONSTANTS
// ============================================================================

// ============================================================================
// CANVAS THEME
// Hardcoded hex values are required here — Canvas2D paints pixels directly
// and cannot reference CSS variables or Tailwind classes. These map 1:1 to
// the design-system tokens defined in globals.css / design.md.
// ============================================================================

const CANVAS = {
  background: "#011627",      // fb-galaxy
  backgroundGrad: "#0A2540",  // fb-galaxy-light
  court: "#0A2540",           // fb-galaxy-light
  courtLine: "#1B3A4B",       // fb-galaxy-muted
  glow: "#17F2E3",            // fb-aqua
  accent: "#17F2E3",          // fb-aqua
  accentBright: "#49CBE8",    // fb-sky
  ballDark: "#0A2540",        // fb-galaxy-light
  ballMid: "#1B3A4B",         // fb-galaxy-muted
  ballLight: "#17F2E3",       // fb-aqua
  ballHighlight: "#49CBE8",   // fb-sky
  rim: "#17F2E3",             // fb-aqua
  net: "#0ED2C5",             // fb-aqua-dark
  text: "#FFFFFF",
  textDim: "#49CBE8",         // fb-sky
  red: "#EF4444",             // destructive
  playerHi: "#1B3A4B",       // fb-galaxy-muted
  playerEdge: "rgba(23,242,227,0.1)",
  playerShades: [
    "#011627", "#0A2540", "#0d2e4a", "#081e38", "#112d4a",
    "#1B3A4B", "#091f3a", "#0c2842", "#102c48", "#143452",
  ],
} as const;

const GRAVITY = 0.45;
const BOUNCE_FACTOR = 0.6;
const BALL_COLORS = [CANVAS.ballLight, CANVAS.ballMid, CANVAS.ballDark];

const GAME_STATE = {
  HELD: "held",
  AIM: "aim",
  FLY: "fly",
  SCORE: "score",
  MISS: "miss",
  RETURN: "return",
} as const;

type GameStateName = (typeof GAME_STATE)[keyof typeof GAME_STATE];

const SPORT_LABELS: SportLabel[] = [
  { name: "Soccer", color: "#22C55E", x: 0.82, y: 0.12, speed: 0.15 },
  { name: "Basketball", color: "#F59E0B", x: 0.15, y: 0.08, speed: 0.12 },
  { name: "Tennis", color: "#3B82F6", x: 0.72, y: 0.55, speed: 0.18 },
  { name: "Hockey", color: "#0EA5E9", x: 0.88, y: 0.38, speed: 0.10 },
  { name: "Volleyball", color: "#F97316", x: 0.60, y: 0.22, speed: 0.14 },
  { name: "Football", color: "#A855F7", x: 0.05, y: 0.42, speed: 0.16 },
  { name: "Cricket", color: "#22C55E", x: 0.92, y: 0.65, speed: 0.11 },
  { name: "Golf", color: "#10B981", x: 0.10, y: 0.58, speed: 0.13 },
];

const LEAGUE_NAMES = ["NBA", "NHL", "MLS", "AFL", "Serie A", "La Liga", "NWSL", "SEC"];

const TICKER_STATS = [
  "55+ Pro Leagues Powered",
  "AI Schedule Engine",
  "8 PhDs in Optimization",
  "2,847 Events Managed",
  "Charlotte, NC",
  "14,200+ Teams Scheduled",
  "312 Venues Optimized",
  "RPI Rankings · Bracket Generator",
];

// Ghost player mesh — simplified triangulated silhouette
const GHOST_TRIANGLES: [number, number][][] = [
  [[-15, 0], [15, 0], [0, -50]],
  [[-15, 0], [15, 0], [5, 40]],
  [[0, -50], [25, -80], [10, -45]],
  [[25, -80], [40, -90], [30, -70]],
  [[0, -50], [-30, -35], [-15, -20]],
  [[5, 40], [25, 70], [15, 55]],
  [[25, 70], [30, 100], [18, 85]],
  [[5, 40], [-15, 75], [-5, 55]],
  [[-15, 75], [-25, 105], [-8, 90]],
  [[-8, -55], [8, -55], [0, -70]],
  [[-8, -55], [8, -55], [0, -45]],
];

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function lerp(from: number, to: number, amount: number): number {
  return from + (to - from) * amount;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function easeInOut(t: number): number {
  return t < 0.5 ? 2 * t * t : 1 - ((-2 * t + 2) ** 2) / 2;
}

// ============================================================================
// LAYOUT CALCULATOR
// Derives all positions/sizes from screen dimensions so the game scales
// correctly across phones, tablets, and desktops.
// ============================================================================

function computeLayout(
  screenW: number,
  screenH: number,
  groundPercent: number,
): WorldLayout {
  const isMobile = screenW < 680;
  const scale = screenW < 400 ? 0.52
    : screenW < 600 ? 0.68
    : screenW < 900 ? 0.88
    : 1;

  const groundY = screenH * (groundPercent / 100);
  const ballRadius = Math.max(12, Math.round(16 * scale));

  const rimWidth = Math.max(34, Math.round(ballRadius * 2 * 2.25));
  const rimX = isMobile ? screenW * 0.68 : screenW * 0.76;
  const rimY = screenH * (isMobile ? 0.26 : 0.28);

  // Player feet sit exactly on the ground line (local-space feet at y=+112)
  const playerScale = isMobile
    ? Math.max(0.6, scale * 1.25)
    : Math.max(0.9, Math.min(1.45, screenW / 980));
  const playerX = isMobile ? screenW * 0.13 : screenW * 0.16;
  const playerY = groundY - 112 * playerScale;

  const shoulderX = playerX + 24 * playerScale;
  const shoulderY = playerY - 80 * playerScale;
  const armLength = 58 * playerScale;

  return {
    isMobile, scale, groundY, ballRadius,
    rimWidth, rimX, rimY,
    playerScale, playerX, playerY,
    shoulderX, shoulderY, armLength,
    screenW, screenH,
  };
}

// ============================================================================
// PHYSICS — LAUNCH TRAJECTORY SOLVER
// Finds the ideal velocity to arc the ball from start to target with a
// natural-looking parabola by testing multiple flight durations.
// ============================================================================

function computeLaunchVelocity(
  startX: number,
  startY: number,
  targetX: number,
  targetY: number,
  gravity: number,
): LaunchVelocity {
  const dx = targetX - startX;
  const dy = targetY - startY;

  let bestVelocity: LaunchVelocity | null = null;
  let bestScore = Infinity;

  for (let flightTime = 15; flightTime <= 55; flightTime++) {
    const vx = dx / flightTime;
    const vy = (dy - 0.5 * gravity * flightTime * flightTime) / flightTime;

    // Ball must arrive going downward
    if (vy + gravity * flightTime <= 0) continue;

    const peakTime = -vy / gravity;
    const peakHeight = startY - (startY + vy * peakTime + 0.5 * gravity * peakTime * peakTime);

    if (peakHeight > 15 && peakHeight < 500) {
      const deviation = Math.abs(peakHeight - 120);
      if (deviation < bestScore) {
        bestScore = deviation;
        bestVelocity = { vx, vy };
      }
    }
  }

  if (!bestVelocity) {
    const fallbackTime = 28;
    return {
      vx: dx / fallbackTime,
      vy: (dy - 0.5 * gravity * fallbackTime * fallbackTime) / fallbackTime,
    };
  }

  return bestVelocity;
}

// ============================================================================
// PARTICLE SYSTEM
// ============================================================================

class Spark {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  decay: number;
  size: number;
  isTriangle: boolean;
  color: string;

  constructor(x: number, y: number, color: string = CANVAS.accent) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 1.5 + Math.random() * 5;
    this.x = x;
    this.y = y;
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed - 2;
    this.life = 1;
    this.decay = 0.02 + Math.random() * 0.03;
    this.size = 2 + Math.random() * 4;
    this.isTriangle = Math.random() > 0.5;
    this.color = color;
  }

  update(): void {
    this.x += this.vx;
    this.y += this.vy;
    this.vy += 0.08;
    this.life -= this.decay;
  }

  draw(ctx: CanvasRenderingContext2D): void {
    if (this.life <= 0) return;
    ctx.globalAlpha = this.life;
    ctx.fillStyle = this.color;

    if (this.isTriangle) {
      const s = this.size;
      ctx.beginPath();
      ctx.moveTo(this.x, this.y - s);
      ctx.lineTo(this.x - s * 0.87, this.y + s * 0.5);
      ctx.lineTo(this.x + s * 0.87, this.y + s * 0.5);
      ctx.closePath();
      ctx.fill();
    } else {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size * 0.7, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.globalAlpha = 1;
  }
}

class AmbientTriangle {
  boundsW: number;
  boundsH: number;
  x: number;
  y: number;
  size: number;
  dx: number;
  dy: number;
  rotation: number;
  rotSpeed: number;
  opacity: number;
  isGlass: boolean;
  glassOpacity: number;

  constructor(boundsW: number, boundsH: number) {
    this.boundsW = boundsW;
    this.boundsH = boundsH;
    this.x = 0;
    this.y = 0;
    this.size = 0;
    this.dx = 0;
    this.dy = 0;
    this.rotation = 0;
    this.rotSpeed = 0;
    this.opacity = 0;
    this.isGlass = false;
    this.glassOpacity = 0;
    this.randomize();
  }

  randomize(): void {
    this.x = Math.random() * this.boundsW;
    this.y = Math.random() * this.boundsH;
    this.size = 4 + Math.random() * 18;
    this.dx = (Math.random() - 0.5) * 0.35;
    this.dy = (Math.random() - 0.5) * 0.18;
    this.rotation = Math.random() * Math.PI * 2;
    this.rotSpeed = (Math.random() - 0.5) * 0.01;
    this.opacity = 0.015 + Math.random() * 0.09;
    this.isGlass = Math.random() > 0.6;
    this.glassOpacity = 0.03 + Math.random() * 0.06;
  }

  update(): void {
    this.x += this.dx;
    this.y += this.dy;
    this.rotation += this.rotSpeed;

    if (
      this.x < -30 || this.x > this.boundsW + 30 ||
      this.y < -30 || this.y > this.boundsH + 30
    ) {
      this.randomize();
    }
  }

  draw(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);

    const s = this.size;
    ctx.beginPath();
    ctx.moveTo(0, -s);
    ctx.lineTo(-s * 0.87, s * 0.5);
    ctx.lineTo(s * 0.87, s * 0.5);
    ctx.closePath();

    if (this.isGlass) {
      ctx.globalAlpha = this.glassOpacity;
      ctx.fillStyle = CANVAS.accentBright;
      ctx.fill();
      ctx.globalAlpha = this.opacity * 1.5;
      ctx.strokeStyle = CANVAS.accent;
      ctx.lineWidth = 0.6;
      ctx.stroke();
    } else {
      ctx.globalAlpha = this.opacity;
      ctx.fillStyle = CANVAS.accent;
      ctx.fill();
    }

    ctx.globalAlpha = 1;
    ctx.restore();
  }
}

// ============================================================================
// CANVAS RENDERERS
// ============================================================================

function drawBall(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  glowing: boolean,
): void {
  if (glowing) {
    ctx.save();
    ctx.shadowColor = CANVAS.accentBright;
    ctx.shadowBlur = 18;
    ctx.beginPath();
    ctx.arc(x, y, radius + 2, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(79,195,247,0.1)";
    ctx.fill();
    ctx.restore();
  }

  // Outer facets — 8 triangular slices
  for (let i = 0; i < 8; i++) {
    const angle1 = (i / 8) * Math.PI * 2 - Math.PI / 2;
    const angle2 = ((i + 1) / 8) * Math.PI * 2 - Math.PI / 2;
    const edgeR = radius * (0.93 + Math.sin(i * 2.1) * 0.07);

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + Math.cos(angle1) * edgeR, y + Math.sin(angle1) * edgeR);
    ctx.lineTo(x + Math.cos(angle2) * edgeR, y + Math.sin(angle2) * edgeR);
    ctx.closePath();
    ctx.fillStyle = BALL_COLORS[i % 3];
    ctx.fill();
    ctx.strokeStyle = "rgba(79,195,247,0.18)";
    ctx.lineWidth = 0.5;
    ctx.stroke();
  }

  // Inner facets — 5 pentagon slices
  const innerR = radius * 0.42;
  for (let i = 0; i < 5; i++) {
    const a1 = (i / 5) * Math.PI * 2;
    const a2 = ((i + 1) / 5) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + Math.cos(a1) * innerR, y + Math.sin(a1) * innerR);
    ctx.lineTo(x + Math.cos(a2) * innerR, y + Math.sin(a2) * innerR);
    ctx.closePath();
    ctx.fillStyle = i % 2 ? CANVAS.ballMid : CANVAS.ballHighlight + "28";
    ctx.fill();
  }

  // Seam lines
  ctx.strokeStyle = CANVAS.accent + "30";
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.moveTo(x - radius * 0.65, y);
  ctx.lineTo(x + radius * 0.65, y);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x, y - radius * 0.65);
  ctx.lineTo(x, y + radius * 0.65);
  ctx.stroke();

  // Specular highlight
  ctx.beginPath();
  ctx.arc(x - radius * 0.22, y - radius * 0.22, radius * 0.16, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(79,195,247,0.22)";
  ctx.fill();
}

// Single polygon triangle in the player mesh
function drawMeshTriangle(
  ctx: CanvasRenderingContext2D,
  points: [number, number][],
  colorIndex: number | "hi",
): void {
  ctx.beginPath();
  ctx.moveTo(points[0][0], points[0][1]);
  ctx.lineTo(points[1][0], points[1][1]);
  ctx.lineTo(points[2][0], points[2][1]);
  ctx.closePath();

  ctx.fillStyle = colorIndex === "hi"
    ? CANVAS.playerHi
    : CANVAS.playerShades[typeof colorIndex === "number" ? colorIndex % 10 : 0];
  ctx.fill();
  ctx.strokeStyle = CANVAS.playerEdge;
  ctx.lineWidth = 0.5;
  ctx.stroke();
}

function drawPlayer(
  ctx: CanvasRenderingContext2D,
  world: WorldLayout,
  armAngle: number,
  isHolding: boolean,
  throwAnim: number,
): void {
  ctx.save();
  ctx.translate(world.playerX, world.playerY);
  ctx.scale(world.playerScale, world.playerScale);

  // Legs
  drawMeshTriangle(ctx, [[-13, 0], [-21, 36], [-6, 32]], 0);
  drawMeshTriangle(ctx, [[-21, 36], [-27, 74], [-11, 70]], 1);
  drawMeshTriangle(ctx, [[-27, 74], [-29, 106], [-14, 103]], 2);
  drawMeshTriangle(ctx, [[-29, 106], [-35, 112], [-17, 112]], 3);
  drawMeshTriangle(ctx, [[13, 0], [21, 36], [6, 32]], 4);
  drawMeshTriangle(ctx, [[21, 36], [27, 74], [11, 70]], 5);
  drawMeshTriangle(ctx, [[27, 74], [25, 106], [13, 103]], 6);
  drawMeshTriangle(ctx, [[25, 106], [31, 112], [15, 112]], 7);

  // Torso
  drawMeshTriangle(ctx, [[-17, 0], [17, 0], [0, -16]], 0);
  drawMeshTriangle(ctx, [[-17, 0], [0, -16], [-19, -36]], 1);
  drawMeshTriangle(ctx, [[17, 0], [0, -16], [19, -36]], 2);
  drawMeshTriangle(ctx, [[-19, -36], [0, -16], [0, -46]], 3);
  drawMeshTriangle(ctx, [[19, -36], [0, -16], [0, -46]], 4);
  drawMeshTriangle(ctx, [[-19, -36], [0, -46], [-21, -60]], 5);
  drawMeshTriangle(ctx, [[19, -36], [0, -46], [21, -60]], 6);
  drawMeshTriangle(ctx, [[-21, -60], [0, -46], [0, -70]], "hi");
  drawMeshTriangle(ctx, [[21, -60], [0, -46], [0, -70]], "hi");
  drawMeshTriangle(ctx, [[-21, -60], [0, -70], [-17, -76]], 8);
  drawMeshTriangle(ctx, [[21, -60], [0, -70], [17, -76]], 9);

  // Shoulders
  drawMeshTriangle(ctx, [[-17, -76], [0, -70], [-24, -80]], 0);
  drawMeshTriangle(ctx, [[17, -76], [0, -70], [24, -80]], 1);

  // Head
  drawMeshTriangle(ctx, [[-9, -82], [9, -82], [0, -90]], 2);
  drawMeshTriangle(ctx, [[-10, -90], [10, -90], [0, -102]], 3);
  drawMeshTriangle(ctx, [[-10, -90], [0, -102], [-11, -104]], 4);
  drawMeshTriangle(ctx, [[10, -90], [0, -102], [11, -104]], 5);
  drawMeshTriangle(ctx, [[-11, -104], [0, -102], [-7, -114]], 6);
  drawMeshTriangle(ctx, [[11, -104], [0, -102], [7, -114]], 7);
  drawMeshTriangle(ctx, [[-7, -114], [7, -114], [0, -120]], 8);
  drawMeshTriangle(ctx, [[-7, -114], [0, -102], [7, -114]], 9);

  // Eyes
  ctx.fillStyle = CANVAS.accent + "50";
  ctx.beginPath();
  ctx.arc(-3.5, -106, 1.6, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(3.5, -106, 1.6, 0, Math.PI * 2);
  ctx.fill();

  // Left arm (static off-hand)
  drawMeshTriangle(ctx, [[-24, -80], [-33, -62], [-27, -66]], 2);
  drawMeshTriangle(ctx, [[-33, -62], [-38, -42], [-29, -46]], 3);
  drawMeshTriangle(ctx, [[-38, -42], [-42, -34], [-32, -36]], 4);

  // Right arm (throwing arm, rotates with aim)
  ctx.save();
  ctx.translate(24, -80);
  ctx.rotate(armAngle);

  const wobble = throwAnim > 0 ? Math.sin(throwAnim * 6) * 3 : 0;

  drawMeshTriangle(ctx, [[0, 0], [7, -26 + wobble], [-5, -24 + wobble]], 6);
  drawMeshTriangle(ctx, [[0, 0], [-5, -24 + wobble], [-7, -3]], 7);
  drawMeshTriangle(ctx, [[1, -26 + wobble], [9, -48 + wobble], [-4, -46 + wobble]], 8);
  drawMeshTriangle(ctx, [[1, -26 + wobble], [-4, -46 + wobble], [-5, -24 + wobble]], 9);
  drawMeshTriangle(ctx, [[3, -48 + wobble], [11, -56 + wobble], [-3, -54 + wobble]], "hi");
  drawMeshTriangle(ctx, [[11, -56 + wobble], [5, -62 + wobble], [-3, -54 + wobble]], "hi");

  if (isHolding) {
    ctx.beginPath();
    ctx.arc(4, -59 + wobble, 14, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(79,195,247,0.14)";
    ctx.fill();
  }

  ctx.restore();

  // Ground shadow
  ctx.beginPath();
  ctx.ellipse(0, 114, 26, 5, 0, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(79,195,247,0.04)";
  ctx.fill();

  ctx.restore();
}

function drawGhost(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  ghostScale: number,
): void {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(ghostScale, ghostScale);
  ctx.globalAlpha = 0.22;

  GHOST_TRIANGLES.forEach((tri, i) => {
    ctx.beginPath();
    ctx.moveTo(tri[0][0], tri[0][1]);
    ctx.lineTo(tri[1][0], tri[1][1]);
    ctx.lineTo(tri[2][0], tri[2][1]);
    ctx.closePath();
    ctx.fillStyle = CANVAS.playerShades[i % 10];
    ctx.fill();
  });

  ctx.globalAlpha = 1;
  ctx.restore();
}

function drawCourt(ctx: CanvasRenderingContext2D, world: WorldLayout): void {
  const { screenW, screenH, groundY, isMobile, scale, rimX } = world;

  ctx.fillStyle = CANVAS.court + "40";
  ctx.fillRect(0, groundY, screenW, screenH - groundY);

  // Glowing ground line
  ctx.save();
  ctx.shadowColor = CANVAS.glow;
  ctx.shadowBlur = 14;
  ctx.strokeStyle = CANVAS.glow + "88";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, groundY);
  ctx.lineTo(screenW, groundY);
  ctx.stroke();
  ctx.restore();

  // Zigzag pattern along ground
  const segmentWidth = isMobile ? 28 : 38;
  ctx.strokeStyle = CANVAS.accent + "12";
  ctx.lineWidth = 1;
  for (let i = 0; i < screenW / segmentWidth + 1; i++) {
    const sx = i * segmentWidth;
    ctx.beginPath();
    ctx.moveTo(sx, groundY);
    ctx.lineTo(sx + segmentWidth / 2, groundY + 10);
    ctx.lineTo(sx + segmentWidth, groundY);
    ctx.stroke();
  }

  // Half court arc
  ctx.strokeStyle = CANVAS.courtLine + "28";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(screenW * 0.5, groundY, 70 * scale, Math.PI, Math.PI * 2);
  ctx.stroke();

  // Three-point arc around hoop
  ctx.beginPath();
  ctx.arc(rimX + 8, groundY, 120 * scale, Math.PI, Math.PI * 2);
  ctx.strokeStyle = CANVAS.courtLine + "20";
  ctx.stroke();

  // Arena floor branding — league names painted on court like a real venue
  const leagues = isMobile
    ? ["NBA", "MLS", "NHL"]
    : ["NBA", "NHL", "MLS", "Serie A", "La Liga", "AFL", "NWSL"];
  const floorY = groundY + (isMobile ? 22 : 30);
  const spacing = screenW / (leagues.length + 1);

  ctx.save();
  ctx.font = `${isMobile ? 600 : 700} ${isMobile ? 10 : 13}px 'Orbitron', monospace`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  leagues.forEach((name, i) => {
    const fx = spacing * (i + 1);
    ctx.save();
    ctx.translate(fx, floorY);
    ctx.rotate(-0.08 + i * 0.025);
    ctx.globalAlpha = 0.045 + (i % 2) * 0.01;
    ctx.fillStyle = CANVAS.accent;
    ctx.fillText(name, 0, 0);
    ctx.restore();
  });
  ctx.restore();
}

function drawHoop(
  ctx: CanvasRenderingContext2D,
  world: WorldLayout,
  netSway: number,
): void {
  const { rimX, rimY, rimWidth, scale } = world;

  // Backboard
  const backboardHeight = rimWidth * 1.8;
  ctx.strokeStyle = CANVAS.accent + "55";
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(rimX + rimWidth + 4, rimY - backboardHeight / 2);
  ctx.lineTo(rimX + rimWidth + 4, rimY + backboardHeight / 2);
  ctx.stroke();

  ctx.strokeStyle = CANVAS.accent + "28";
  ctx.lineWidth = 1;
  ctx.strokeRect(rimX + rimWidth - 1, rimY - 10, 7, 20);

  // Rim
  ctx.save();
  ctx.shadowColor = CANVAS.rim;
  ctx.shadowBlur = 10;
  ctx.strokeStyle = CANVAS.rim;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(rimX, rimY);
  ctx.lineTo(rimX + rimWidth, rimY);
  ctx.stroke();
  ctx.restore();

  // Rim endpoint dots
  [rimX, rimX + rimWidth].forEach((dotX) => {
    ctx.beginPath();
    ctx.arc(dotX, rimY, 2.5, 0, Math.PI * 2);
    ctx.fillStyle = CANVAS.rim;
    ctx.fill();
  });

  // Net strings
  const swayOffset = Math.sin(netSway) * 2.5;
  const netHeight = 32 * scale;
  ctx.strokeStyle = CANVAS.net + "55";
  ctx.lineWidth = 0.8;
  for (let i = 0; i <= 6; i++) {
    const t = i / 6;
    const topX = rimX + t * rimWidth;
    const bottomX = rimX + rimWidth * 0.2 + t * rimWidth * 0.6 + swayOffset;
    ctx.beginPath();
    ctx.moveTo(topX, rimY + 2);
    ctx.quadraticCurveTo(
      (topX + bottomX) / 2 + Math.sin(i + netSway) * 3,
      rimY + netHeight * 0.6,
      bottomX,
      rimY + netHeight,
    );
    ctx.stroke();
  }

  // Horizontal net loops
  for (let row = 1; row <= 3; row++) {
    const rowY = rimY + (netHeight / 4) * row;
    const narrowing = row * 0.06;
    const leftX = rimX + rimWidth * narrowing + Math.sin(netSway + row) * 1.5;
    const rightX = rimX + rimWidth * (1 - narrowing) + Math.sin(netSway + row) * 1.5;
    ctx.beginPath();
    ctx.moveTo(leftX, rowY);
    ctx.lineTo(rightX, rowY);
    ctx.stroke();
  }
}

// ============================================================================
// COMPONENT
// ============================================================================

export function BasketballLogin({ error }: BasketballLoginProps): React.ReactElement {
  const [score, setScore] = useState(0);
  const [isRedBadge, setIsRedBadge] = useState(false);
  const [groundSlider, setGroundSlider] = useState([72]);
  const [isPending, startTransition] = useTransition();

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);
  const gameStateRef = useRef<GameStateName>(GAME_STATE.HELD);
  const ballRef = useRef<BallState>({ x: 0, y: 0, vx: 0, vy: 0 });
  const returnAnimRef = useRef<ReturnAnim>({ startX: 0, startY: 0, progress: 0 });
  const pauseCountRef = useRef(0);
  const sparksRef = useRef<Spark[]>([]);
  const isDraggingGroundRef = useRef(false);
  const ambientRef = useRef<AmbientTriangle[]>([]);
  const mouseRef = useRef<Vector2D>({ x: 400, y: 300 });
  const armAngleRef = useRef(-0.6);
  const throwAnimRef = useRef(0);
  const netSwayRef = useRef(0);
  const hasScoredRef = useRef(false);
  const worldRef = useRef<WorldLayout | null>(null);
  const scoreValueRef = useRef(0);
  const groundPercentRef = useRef(72);

  // -- Hand position in world coordinates --

  const getHandPosition = useCallback((): Vector2D => {
    const world = worldRef.current;
    if (!world) return { x: 0, y: 0 };

    const angle = armAngleRef.current;
    return {
      x: world.shoulderX + Math.cos(angle - Math.PI / 2) * world.armLength,
      y: world.shoulderY + Math.sin(angle - Math.PI / 2) * world.armLength,
    };
  }, []);

  // -- Score & miss handlers --

  const handleScore = useCallback((): void => {
    scoreValueRef.current++;
    setScore(scoreValueRef.current);
    setIsRedBadge(false);
    netSwayRef.current = 2.5;
    hasScoredRef.current = true;
    gameStateRef.current = GAME_STATE.SCORE;
    pauseCountRef.current = 35;

    const ball = ballRef.current;
    for (let i = 0; i < 28; i++) {
      sparksRef.current.push(new Spark(ball.x, ball.y, CANVAS.accent));
    }
  }, []);

  const handleMiss = useCallback((): void => {
    scoreValueRef.current = 0;
    setScore(0);
    setIsRedBadge(true);
    gameStateRef.current = GAME_STATE.MISS;
    pauseCountRef.current = 20;

    const ball = ballRef.current;
    for (let i = 0; i < 16; i++) {
      sparksRef.current.push(new Spark(ball.x, ball.y, CANVAS.red));
    }
  }, []);

  // ========================================================================
  // GAME LOOP
  // ========================================================================

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    function handleResize(): void {
      if (!canvas || !ctx) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = window.innerWidth;
      const height = window.innerHeight;

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = width + "px";
      canvas.style.height = height + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      worldRef.current = computeLayout(width, height, groundPercentRef.current);
    }

    handleResize();
    window.addEventListener("resize", handleResize);

    const initialHand = getHandPosition();
    ballRef.current = { x: initialHand.x, y: initialHand.y, vx: 0, vy: 0 };

    const initialWorld = worldRef.current;
    if (initialWorld) {
      const count = initialWorld.isMobile ? 24 : 45;
      ambientRef.current = Array.from(
        { length: count },
        () => new AmbientTriangle(initialWorld.screenW, initialWorld.screenH),
      );
    }

    // -- Physics tick --
    function tick(): void {
      const world = worldRef.current;
      if (!world) return;

      Object.assign(world, computeLayout(world.screenW, world.screenH, groundPercentRef.current));

      const ball = ballRef.current;
      const hand = getHandPosition();
      const currentState = gameStateRef.current;

      // Arm tracks mouse
      const targetAngle = Math.atan2(
        mouseRef.current.y - world.shoulderY,
        mouseRef.current.x - world.shoulderX,
      ) + Math.PI / 2;
      armAngleRef.current = lerp(
        armAngleRef.current,
        clamp(targetAngle, -2.9, 1.1),
        0.18,
      );

      if (throwAnimRef.current > 0) throwAnimRef.current -= 0.05;
      netSwayRef.current *= 0.97;

      // HELD / AIM — ball sticks to hand
      if (currentState === GAME_STATE.HELD || currentState === GAME_STATE.AIM) {
        ball.x = hand.x;
        ball.y = hand.y;
        ball.vx = 0;
        ball.vy = 0;
        return;
      }

      // SCORE / MISS — bounce while paused, then return
      if (currentState === GAME_STATE.SCORE || currentState === GAME_STATE.MISS) {
        ball.vy += GRAVITY;
        ball.x += ball.vx;
        ball.y += ball.vy;

        if (ball.y + world.ballRadius > world.groundY) {
          ball.y = world.groundY - world.ballRadius;
          ball.vy *= -BOUNCE_FACTOR;
          ball.vx *= 0.85;
        }
        if (ball.x < world.ballRadius) {
          ball.x = world.ballRadius;
          ball.vx *= -0.5;
        }
        if (ball.x > world.screenW - world.ballRadius) {
          ball.x = world.screenW - world.ballRadius;
          ball.vx *= -0.5;
        }

        pauseCountRef.current--;
        if (pauseCountRef.current <= 0) {
          returnAnimRef.current = { startX: ball.x, startY: ball.y, progress: 0 };
          gameStateRef.current = GAME_STATE.RETURN;
        }
        return;
      }

      // RETURN — lerp ball back to hand
      if (currentState === GAME_STATE.RETURN) {
        const anim = returnAnimRef.current;
        anim.progress += 0.05;

        const easedT = easeInOut(Math.min(anim.progress, 1));
        ball.x = lerp(anim.startX, hand.x, easedT);
        ball.y = lerp(anim.startY, hand.y, easedT);
        ball.vx = 0;
        ball.vy = 0;

        if (anim.progress >= 1) {
          gameStateRef.current = GAME_STATE.HELD;
          hasScoredRef.current = false;
          for (let i = 0; i < 6; i++) {
            sparksRef.current.push(new Spark(hand.x, hand.y, CANVAS.accentBright));
          }
        }
        return;
      }

      // FLY — full physics
      ball.vy += GRAVITY;
      ball.x += ball.vx;
      ball.y += ball.vy;

      // Wall bounces
      if (ball.x < world.ballRadius) {
        ball.x = world.ballRadius;
        ball.vx = Math.abs(ball.vx) * 0.4;
      }
      if (ball.x > world.screenW - world.ballRadius) {
        ball.x = world.screenW - world.ballRadius;
        ball.vx = -Math.abs(ball.vx) * 0.4;
      }
      if (ball.y < world.ballRadius) {
        ball.y = world.ballRadius;
        ball.vy = Math.abs(ball.vy) * 0.3;
      }

      // Rim collision
      const rimEndpoints: [number, number][] = [
        [world.rimX, world.rimY],
        [world.rimX + world.rimWidth, world.rimY],
      ];
      for (const [cx, cy] of rimEndpoints) {
        const distance = Math.hypot(ball.x - cx, ball.y - cy);
        if (distance < world.ballRadius + 4) {
          const bounceAngle = Math.atan2(ball.y - cy, ball.x - cx);
          ball.x = cx + Math.cos(bounceAngle) * (world.ballRadius + 5);
          ball.y = cy + Math.sin(bounceAngle) * (world.ballRadius + 5);

          const speed = Math.hypot(ball.vx, ball.vy) * 0.4;
          ball.vx = Math.cos(bounceAngle) * speed;
          ball.vy = Math.sin(bounceAngle) * speed;
          netSwayRef.current = 1;
        }
      }

      // Score detection — generous zone for the smaller hoop
      if (
        !hasScoredRef.current &&
        ball.vy > 0 &&
        ball.x > world.rimX - 8 &&
        ball.x < world.rimX + world.rimWidth + 8 &&
        ball.y > world.rimY - 10 &&
        ball.y < world.rimY + 45
      ) {
        handleScore();
        return;
      }

      // Miss detection — ball hits ground without scoring
      if (ball.y + world.ballRadius >= world.groundY) {
        ball.y = world.groundY - world.ballRadius;
        ball.vy *= -BOUNCE_FACTOR;
        if (Math.abs(ball.vy) < 0.8) ball.vy = 0;

        if (!hasScoredRef.current && currentState === GAME_STATE.FLY) {
          handleMiss();
        }
      }
    }

    // -- Render frame --
    function render(): void {
      const world = worldRef.current;
      if (!world || !ctx) return;
      const { screenW, screenH } = world;

      // Background gradient
      const gradient = ctx.createLinearGradient(0, 0, 0, screenH);
      gradient.addColorStop(0, CANVAS.background);
      gradient.addColorStop(1, CANVAS.backgroundGrad);
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, screenW, screenH);

      // Ambient triangles
      ambientRef.current.forEach((tri) => {
        tri.update();
        tri.draw(ctx);
      });

      // Glass panel decorations for depth
      const panelAlpha = 0.018;
      ctx.save();

      ctx.globalAlpha = panelAlpha;
      ctx.fillStyle = CANVAS.accent;
      ctx.beginPath();
      ctx.moveTo(screenW * 0.65, 0);
      ctx.lineTo(screenW, screenH * 0.35);
      ctx.lineTo(screenW, 0);
      ctx.closePath();
      ctx.fill();
      ctx.globalAlpha = panelAlpha * 3;
      ctx.strokeStyle = CANVAS.accent;
      ctx.lineWidth = 0.8;
      ctx.stroke();

      ctx.globalAlpha = panelAlpha * 0.8;
      ctx.fillStyle = CANVAS.accentBright;
      ctx.beginPath();
      ctx.moveTo(screenW * 0.08, screenH * 0.3);
      ctx.lineTo(screenW * 0.22, screenH * 0.45);
      ctx.lineTo(screenW * 0.08, screenH * 0.6);
      ctx.lineTo(screenW * -0.02, screenH * 0.45);
      ctx.closePath();
      ctx.fill();
      ctx.globalAlpha = panelAlpha * 2.5;
      ctx.strokeStyle = CANVAS.accent;
      ctx.lineWidth = 0.5;
      ctx.stroke();

      ctx.globalAlpha = panelAlpha * 0.6;
      ctx.fillStyle = CANVAS.accent;
      ctx.beginPath();
      ctx.moveTo(screenW * 0.35, screenH);
      ctx.lineTo(screenW * 0.55, screenH * 0.75);
      ctx.lineTo(screenW * 0.7, screenH);
      ctx.closePath();
      ctx.fill();

      ctx.globalAlpha = panelAlpha * 1.4;
      ctx.fillStyle = CANVAS.accentBright;
      ctx.beginPath();
      ctx.moveTo(screenW * 0.02, screenH * 0.05);
      ctx.lineTo(screenW * 0.15, screenH * 0.02);
      ctx.lineTo(screenW * 0.08, screenH * 0.15);
      ctx.closePath();
      ctx.fill();
      ctx.globalAlpha = panelAlpha * 4;
      ctx.strokeStyle = CANVAS.accent;
      ctx.lineWidth = 0.4;
      ctx.stroke();

      ctx.restore();

      // Floating sport labels
      const frameTime = Date.now() * 0.001;
      ctx.save();
      SPORT_LABELS.forEach((label) => {
        const driftX = Math.sin(frameTime * label.speed + label.x * 10) * 12;
        const driftY = Math.cos(frameTime * label.speed * 0.7 + label.y * 8) * 6;
        const lx = label.x * screenW + driftX;
        const ly = label.y * screenH + driftY;

        if (ly > world.groundY - 10) return;

        const fontSize = world.isMobile ? 8 : 10;
        ctx.font = `500 ${fontSize}px system-ui, sans-serif`;
        const textW = ctx.measureText(label.name).width;
        const padX = 6;
        const padY = 3;

        ctx.globalAlpha = 0.04;
        ctx.fillStyle = label.color;
        const rx = lx - padX;
        const ry = ly - fontSize / 2 - padY;
        const rw = textW + padX * 2;
        const rh = fontSize + padY * 2;
        ctx.beginPath();
        ctx.roundRect(rx, ry, rw, rh, 10);
        ctx.fill();

        ctx.globalAlpha = 0.07;
        ctx.strokeStyle = label.color;
        ctx.lineWidth = 0.5;
        ctx.stroke();

        ctx.globalAlpha = 0.065;
        ctx.fillStyle = label.color;
        ctx.textBaseline = "middle";
        ctx.fillText(label.name, lx, ly);
      });
      ctx.restore();

      // Ghost players
      if (!world.isMobile) {
        drawGhost(ctx, screenW * 0.45, world.groundY - 48, 0.75);
        drawGhost(ctx, screenW * 0.6, world.groundY - 52, 0.9);
      } else {
        drawGhost(ctx, screenW * 0.5, world.groundY - 26, 0.42);
      }

      drawCourt(ctx, world);
      drawHoop(ctx, world, netSwayRef.current);

      const isHolding = gameStateRef.current === GAME_STATE.HELD || gameStateRef.current === GAME_STATE.AIM;
      drawPlayer(ctx, world, armAngleRef.current, isHolding, throwAnimRef.current);

      const ball = ballRef.current;
      const isReturning = gameStateRef.current === GAME_STATE.RETURN;
      drawBall(ctx, ball.x, ball.y, world.ballRadius, isReturning);

      // Trajectory preview when aiming
      if (gameStateRef.current === GAME_STATE.AIM) {
        const hand = getHandPosition();
        const launchX = world.shoulderX;
        const launchY = world.shoulderY - world.armLength * 0.7;
        const { vx, vy } = computeLaunchVelocity(
          launchX, launchY,
          mouseRef.current.x, mouseRef.current.y,
          GRAVITY,
        );

        let traceX = hand.x;
        let traceY = hand.y;
        let traceVx = vx;
        let traceVy = vy;
        ctx.fillStyle = CANVAS.accent + "30";

        for (let step = 0; step < 22; step++) {
          traceVy += GRAVITY;
          traceX += traceVx;
          traceY += traceVy;
          const dotR = 2.5 - step * 0.08;
          if (dotR < 0.5) break;
          ctx.beginPath();
          ctx.arc(traceX, traceY, dotR, 0, Math.PI * 2);
          ctx.fill();
        }

        // Power bar
        const barWidth = world.isMobile ? 36 : 55;
        const barHeight = 4;
        const barX = hand.x - barWidth / 2;
        const barY = hand.y - 24;

        ctx.fillStyle = "rgba(10,22,40,0.65)";
        ctx.fillRect(barX - 1, barY - 1, barWidth + 2, barHeight + 2);

        const powerPct = clamp(Math.hypot(vx, vy) / 25, 0, 1);
        const powerGrad = ctx.createLinearGradient(barX, 0, barX + barWidth, 0);
        powerGrad.addColorStop(0, CANVAS.accent);
        powerGrad.addColorStop(1, "#ff6b6b");
        ctx.fillStyle = powerGrad;
        ctx.fillRect(barX, barY, barWidth * powerPct, barHeight);
      }

      // Grab hint circle
      if (gameStateRef.current === GAME_STATE.HELD) {
        const hand = getHandPosition();
        ctx.setLineDash([3, 5]);
        ctx.strokeStyle = CANVAS.accent + "12";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(hand.x, hand.y, 26, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Particles
      sparksRef.current = sparksRef.current.filter((p) => p.life > 0);
      sparksRef.current.forEach((p) => {
        p.update();
        p.draw(ctx);
      });
    }

    // -- Animation loop --
    function gameLoop(): void {
      tick();
      render();
      animFrameRef.current = requestAnimationFrame(gameLoop);
    }
    animFrameRef.current = requestAnimationFrame(gameLoop);

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animFrameRef.current);
    };
  }, [getHandPosition, handleScore, handleMiss]);

  // -- Prevent touch-scroll on canvas --
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const prevent = (e: Event): void => { e.preventDefault(); };
    canvas.addEventListener("touchstart", prevent, { passive: false });
    canvas.addEventListener("touchmove", prevent, { passive: false });

    return () => {
      canvas.removeEventListener("touchstart", prevent);
      canvas.removeEventListener("touchmove", prevent);
    };
  }, []);

  // -- Ground handle drag --
  const onGroundHandlePointerDown = useCallback((e: React.PointerEvent): void => {
    e.preventDefault();
    e.stopPropagation();
    isDraggingGroundRef.current = true;
  }, []);

  useEffect(() => {
    function onMove(e: MouseEvent | TouchEvent): void {
      if (!isDraggingGroundRef.current) return;
      const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
      const pct = Math.max(20, Math.min(90, (clientY / window.innerHeight) * 100));
      groundPercentRef.current = pct;
      setGroundSlider([pct]);
    }
    function onUp(): void {
      isDraggingGroundRef.current = false;
    }

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    window.addEventListener("touchmove", onMove, { passive: false });
    window.addEventListener("touchend", onUp);

    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend", onUp);
    };
  }, []);

  // ========================================================================
  // INPUT HANDLERS
  // ========================================================================

  const getPointerPosition = useCallback(
    (event: React.MouseEvent | React.TouchEvent): Vector2D => {
      const canvas = canvasRef.current;
      if (!canvas) return { x: 0, y: 0 };
      const rect = canvas.getBoundingClientRect();

      if ("touches" in event) {
        const touch = event.touches[0] || event.changedTouches[0];
        return { x: (touch?.clientX ?? 0) - rect.left, y: (touch?.clientY ?? 0) - rect.top };
      }
      return { x: event.clientX - rect.left, y: event.clientY - rect.top };
    },
    [],
  );

  const handlePointerDown = useCallback(
    (event: React.MouseEvent | React.TouchEvent): void => {
      const pos = getPointerPosition(event);
      mouseRef.current = pos;
      if (gameStateRef.current === GAME_STATE.HELD) {
        gameStateRef.current = GAME_STATE.AIM;
      }
    },
    [getPointerPosition],
  );

  const handlePointerMove = useCallback(
    (event: React.MouseEvent | React.TouchEvent): void => {
      mouseRef.current = getPointerPosition(event);
    },
    [getPointerPosition],
  );

  const handlePointerUp = useCallback(
    (event: React.MouseEvent | React.TouchEvent): void => {
      mouseRef.current = getPointerPosition(event);

      if (gameStateRef.current !== GAME_STATE.AIM) return;

      const world = worldRef.current;
      if (!world) return;

      const launchX = world.shoulderX;
      const launchY = world.shoulderY - world.armLength * 0.7;
      const { vx, vy } = computeLaunchVelocity(
        launchX, launchY,
        mouseRef.current.x, mouseRef.current.y,
        GRAVITY,
      );

      const ball = ballRef.current;
      ball.vx = vx;
      ball.vy = vy;

      gameStateRef.current = GAME_STATE.FLY;
      hasScoredRef.current = false;
      throwAnimRef.current = 1;

      const hand = getHandPosition();
      for (let i = 0; i < 10; i++) {
        sparksRef.current.push(new Spark(hand.x, hand.y));
      }
    },
    [getPointerPosition, getHandPosition],
  );

  function handleSignIn(): void {
    startTransition(async () => {
      await signInWithGoogle();
    });
  }

  // ========================================================================
  // JSX — Tailwind classes only, no inline styles
  // Sole exception: dynamic `top` on ground handle (JS-driven drag position)
  // ========================================================================

  return (
    <div className="relative w-screen overflow-hidden bg-fb-galaxy h-dvh touch-none">
      {/* Game canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full cursor-crosshair touch-none"
        onMouseDown={handlePointerDown}
        onMouseMove={handlePointerMove}
        onMouseUp={handlePointerUp}
        onMouseLeave={handlePointerUp}
        onTouchStart={handlePointerDown}
        onTouchMove={handlePointerMove}
        onTouchEnd={handlePointerUp}
      />

      {/* Score badge */}
      <div className="absolute top-2.5 right-2.5 z-10 md:top-4 md:right-5">
        <Badge
          variant="outline"
          className={cn(
            "login-score-badge font-bold border text-sm px-2.5 py-1.5",
            "md:text-base md:px-4 md:py-2",
            isRedBadge
              ? "bg-destructive/15 text-destructive border-destructive/50 shadow-score-miss"
              : "bg-fb-galaxy/80 text-fb-aqua border-fb-aqua/30",
          )}
        >
          🏀 {score}
        </Badge>
      </div>

      {/* Ground handle — before/after style drag circle on the ground line */}
      {/* Dynamic `top` is the one required inline style — driven by JS drag state */}
      <div
        onPointerDown={onGroundHandlePointerDown}
        className="absolute left-2.5 md:left-6 z-[12] -translate-x-1/2 -translate-y-1/2 cursor-ns-resize select-none touch-none"
        style={{ top: `${groundSlider[0]}%` }}
      >
        <div className="absolute left-1/2 -translate-x-1/2 -top-10 w-px h-20 login-ground-guide pointer-events-none" />
        <div className="login-ground-handle rounded-full flex flex-col items-center justify-center size-7 md:size-[34px] gap-px">
          <svg className="size-2 md:size-2.5" viewBox="0 0 10 6" fill="none">
            <path d="M1 5L5 1L9 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-fb-aqua/70" />
          </svg>
          <div className="w-2 md:w-2.5 h-px rounded-sm bg-fb-aqua/35" />
          <svg className="size-2 md:size-2.5" viewBox="0 0 10 6" fill="none">
            <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-fb-aqua/70" />
          </svg>
        </div>
      </div>

      {/* Login card */}
      <div className="absolute top-1/2 left-1/2 md:left-[35%] -translate-x-1/2 -translate-y-1/2 z-10 w-full max-w-[300px] md:max-w-[340px] px-3">
        <Card className="login-card-glass border-none">
          <CardHeader className="text-center pb-0 px-5 pt-[22px] md:px-8 md:pt-7">
            <Image
              src="/images/fastbreak-logo-reversed.svg"
              alt="Fastbreak AI"
              width={220}
              height={29}
              priority
              className="mx-auto w-[180px] md:w-[220px] h-auto login-logo-glow"
            />
            <p className="text-fb-sky text-[10px] md:text-[11px] mt-2 opacity-50 font-sans">
              Accelerate Your Game
            </p>
          </CardHeader>

          <CardContent className="px-5 pt-3.5 pb-2.5 md:px-8 md:pt-[18px] md:pb-3">
            <Separator className="mb-4 md:mb-5 login-separator" />

            {error && (
              <div className="mb-4 rounded-md bg-destructive/10 p-3 text-sm text-red-400 border border-destructive/20">
                Authentication failed. Please try again.
              </div>
            )}

            <Button
              onClick={handleSignIn}
              disabled={isPending}
              variant="outline"
              className="login-btn w-full h-11 md:h-12 text-sm md:text-base font-semibold rounded-lg text-white transition-all duration-300"
            >
              {isPending ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                <svg className="mr-2 h-4 w-4 shrink-0" viewBox="0 0 48 48">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                </svg>
              )}
              {isPending ? "Signing in..." : "Sign in with Google"}
            </Button>

            <p className="text-center text-fb-sky text-[8px] md:text-[9px] mt-2.5 md:mt-3.5 opacity-30 font-sans">
              <span className="md:hidden">Tap to aim · Release to shoot</span>
              <span className="hidden md:inline">Click to aim · Release to shoot</span>
            </p>
          </CardContent>

          <CardFooter className="justify-center px-5 pb-4 md:px-8 md:pb-5 pt-0">
            <p className="text-fb-sky text-[8px] md:text-[9px] opacity-25 font-sans">
              Powered by Fastbreak AI
            </p>
          </CardFooter>
        </Card>
      </div>

      {/* League bar — desktop only, broadcast scoreboard style */}
      <div className="absolute top-0 inset-x-0 z-[8] h-8 hidden md:flex items-center justify-center gap-8 login-glass-bar border-b">
        {LEAGUE_NAMES.map((league) => (
          <span
            key={league}
            className="text-fb-aqua text-[8px] font-orbitron font-bold tracking-[2px] opacity-20"
          >
            {league}
          </span>
        ))}
      </div>

      {/* Stats ticker — broadcast crawl */}
      <div className="absolute bottom-0 inset-x-0 z-[8] h-6 md:h-7 flex items-center overflow-hidden login-glass-bar border-t">
        <div className="flex whitespace-nowrap gap-10 md:gap-[60px] pl-[100%] animate-ticker">
          {TICKER_STATS.map((text, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-2 text-fb-aqua text-[7px] md:text-[9px] font-orbitron font-semibold opacity-[0.18] tracking-[1px]"
            >
              <span className="inline-block size-[3px] rounded-full bg-fb-aqua opacity-60" />
              {text}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
