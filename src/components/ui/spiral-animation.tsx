"use client";
import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";

class Vector2D {
  constructor(public x: number, public y: number) {}
  static random(min: number, max: number): number {
    return min + Math.random() * (max - min);
  }
}
class Vector3D {
  constructor(public x: number, public y: number, public z: number) {}
}

class AnimationController {
  private timeline: gsap.core.Timeline;
  private time = 0;
  private ctx: CanvasRenderingContext2D;
  private size: number;
  private stars: Star[] = [];

  private readonly changeEventTime = 0.32;
  public readonly cameraZ = -400;
  public readonly cameraTravelDistance = 3400;
  private readonly startDotYOffset = 28;
  public readonly viewZoom = 100;
  private readonly numberOfStars = 4000;
  private readonly trailLength = 80;

  constructor(_canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, _dpr: number, size: number) {
    this.ctx = ctx;
    this.size = size;
    this.timeline = gsap.timeline({ repeat: -1 });
    this.setupRandomGenerator();
    this.createStars();
    this.setupTimeline();
  }

  private setupRandomGenerator() {
    const original = Math.random;
    let seed = 1234;
    Math.random = () => {
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280;
    };
    this.createStars();
    Math.random = original;
  }

  private createStars() {
    for (let i = 0; i < this.numberOfStars; i++) {
      this.stars.push(new Star(this.cameraZ, this.cameraTravelDistance));
    }
  }

  private setupTimeline() {
    this.timeline.to(this, {
      time: 1,
      duration: 15,
      repeat: -1,
      ease: "none",
      onUpdate: () => this.render(),
    });
  }

  public ease(p: number, g: number): number {
    if (p < 0.5) return 0.5 * Math.pow(2 * p, g);
    return 1 - 0.5 * Math.pow(2 * (1 - p), g);
  }

  public easeOutElastic(x: number): number {
    const c4 = (2 * Math.PI) / 4.5;
    if (x <= 0) return 0;
    if (x >= 1) return 1;
    return Math.pow(2, -8 * x) * Math.sin((x * 8 - 0.75) * c4) + 1;
  }

  public map(value: number, s1: number, e1: number, s2: number, e2: number) {
    return s2 + (e2 - s2) * ((value - s1) / (e1 - s1));
  }
  public constrain(v: number, mn: number, mx: number) {
    return Math.min(Math.max(v, mn), mx);
  }
  public lerp(a: number, b: number, t: number) {
    return a * (1 - t) + b * t;
  }

  public spiralPath(p: number): Vector2D {
    p = this.constrain(1.2 * p, 0, 1);
    p = this.ease(p, 1.8);
    const turns = 6;
    const theta = 2 * Math.PI * turns * Math.sqrt(p);
    const r = 170 * Math.sqrt(p);
    return new Vector2D(r * Math.cos(theta), r * Math.sin(theta) + this.startDotYOffset);
  }

  public showProjectedDot(position: Vector3D, sizeFactor: number) {
    const t2 = this.constrain(this.map(this.time, this.changeEventTime, 1, 0, 1), 0, 1);
    const newCameraZ = this.cameraZ + this.ease(Math.pow(t2, 1.2), 1.8) * this.cameraTravelDistance;
    if (position.z > newCameraZ) {
      const depth = position.z - newCameraZ;
      const x = (this.viewZoom * position.x) / depth;
      const y = (this.viewZoom * position.y) / depth;
      const sw = (400 * sizeFactor) / depth;
      this.ctx.lineWidth = sw;
      this.ctx.beginPath();
      this.ctx.arc(x, y, 0.5, 0, Math.PI * 2);
      this.ctx.fill();
    }
  }

  public render() {
    const ctx = this.ctx;
    if (!ctx) return;
    // Transparent background → mix-blend-mode screen via CSS will show particles only
    ctx.clearRect(0, 0, this.size, this.size);
    ctx.save();
    ctx.translate(this.size / 2, this.size / 2);

    const t1 = this.constrain(this.map(this.time, 0, this.changeEventTime + 0.25, 0, 1), 0, 1);
    const t2 = this.constrain(this.map(this.time, this.changeEventTime, 1, 0, 1), 0, 1);
    ctx.rotate(-Math.PI * this.ease(t2, 2.7));

    this.drawTrail(t1);
    ctx.fillStyle = "#F7F7F5"; // SWSM white
    for (const star of this.stars) star.render(t1, this);

    if (this.time > this.changeEventTime) {
      const dy = (this.cameraZ * this.startDotYOffset) / this.viewZoom;
      this.showProjectedDot(new Vector3D(0, dy, this.cameraTravelDistance), 2.5);
    }
    ctx.restore();
  }

  private drawTrail(t1: number) {
    for (let i = 0; i < this.trailLength; i++) {
      const f = this.map(i, 0, this.trailLength, 1.1, 0.1);
      const sw = (1.3 * (1 - t1) + 3.0 * Math.sin(Math.PI * t1)) * f;
      this.ctx.fillStyle = "#EC2D7C"; // SWSM pink for trail
      this.ctx.lineWidth = sw;
      const pos = this.spiralPath(t1 - 0.00015 * i);
      this.ctx.beginPath();
      this.ctx.arc(pos.x, pos.y, sw / 2, 0, Math.PI * 2);
      this.ctx.fill();
    }
  }

  public destroy() {
    this.timeline.kill();
  }
}

class Star {
  private dx: number;
  private dy: number;
  private spiralLocation: number;
  private strokeWeightFactor: number;
  private z: number;
  private angle: number;
  private rotationDirection: number;
  private expansionRate: number;
  private finalScale: number;

  constructor(cameraZ: number, cameraTravelDistance: number) {
    this.angle = Math.random() * Math.PI * 2;
    const distance = 30 * Math.random() + 15;
    this.rotationDirection = Math.random() > 0.5 ? 1 : -1;
    this.expansionRate = 1.2 + Math.random() * 0.8;
    this.finalScale = 0.7 + Math.random() * 0.6;
    this.dx = distance * Math.cos(this.angle);
    this.dy = distance * Math.sin(this.angle);
    this.spiralLocation = (1 - Math.pow(1 - Math.random(), 3.0)) / 1.3;
    this.z = Vector2D.random(0.5 * cameraZ, cameraTravelDistance + cameraZ);
    const lerp = (a: number, b: number, t: number) => a * (1 - t) + b * t;
    this.z = lerp(this.z, cameraTravelDistance / 2, 0.3 * this.spiralLocation);
    this.strokeWeightFactor = Math.pow(Math.random(), 2.0);
  }

  render(p: number, c: AnimationController) {
    const sp = c.spiralPath(this.spiralLocation);
    const q = p - this.spiralLocation;
    if (q <= 0) return;
    const dp = c.constrain(4 * q, 0, 1);
    let sx: number, sy: number;
    if (dp < 0.3) {
      sx = c.lerp(sp.x, sp.x + this.dx * 0.3, dp / 0.3);
      sy = c.lerp(sp.y, sp.y + this.dy * 0.3, dp / 0.3);
    } else if (dp < 0.7) {
      const m = (dp - 0.3) / 0.4;
      const cs = Math.sin(m * Math.PI) * this.rotationDirection * 1.5;
      const bx = sp.x + this.dx * 0.3, by = sp.y + this.dy * 0.3;
      const tx = sp.x + this.dx * 0.7, ty = sp.y + this.dy * 0.7;
      const px = -this.dy * 0.4 * cs, py = this.dx * 0.4 * cs;
      sx = c.lerp(bx, tx, m) + px * m;
      sy = c.lerp(by, ty, m) + py * m;
    } else {
      const fp = (dp - 0.7) / 0.3;
      const bx = sp.x + this.dx * 0.7, by = sp.y + this.dy * 0.7;
      const td = (Math.hypot(this.dx, this.dy)) * this.expansionRate * 1.5;
      const sa = this.angle + 1.2 * this.rotationDirection * fp * Math.PI;
      sx = c.lerp(bx, sp.x + td * Math.cos(sa), fp);
      sy = c.lerp(by, sp.y + td * Math.sin(sa), fp);
    }
    const vx = ((this.z - c.cameraZ) * sx) / c.viewZoom;
    const vy = ((this.z - c.cameraZ) * sy) / c.viewZoom;
    let sm = 1.0;
    if (dp < 0.6) sm = 1.0 + dp * 0.2;
    else {
      const t = (dp - 0.6) / 0.4;
      sm = 1.2 * (1 - t) + this.finalScale * t;
    }
    c.showProjectedDot(new Vector3D(vx, vy, this.z), 8.5 * this.strokeWeightFactor * sm);
  }
}

export function SpiralAnimation() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<AnimationController | null>(null);
  const [dim, setDim] = useState({ w: 0, h: 0 });

  useEffect(() => {
    const onResize = () => setDim({ w: window.innerWidth, h: window.innerHeight });
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !dim.w) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;
    const size = Math.max(dim.w, dim.h);
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = `${dim.w}px`;
    canvas.style.height = `${dim.h}px`;
    ctx.scale(dpr, dpr);
    animationRef.current = new AnimationController(canvas, ctx, dpr, size);
    return () => {
      animationRef.current?.destroy();
      animationRef.current = null;
    };
  }, [dim]);

  return (
    <div className="relative w-full h-full">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ mixBlendMode: "screen" }}
      />
    </div>
  );
}
