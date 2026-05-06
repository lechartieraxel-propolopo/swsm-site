import { useEffect, useRef, useCallback } from "react";

interface DynamicHeroProps {
  eyebrow?: string;
  heading?: string;
  tagline?: string;
  primaryCtaLabel?: string;
  primaryCtaHref?: string;
  secondaryCtaLabel?: string;
  secondaryCtaHref?: string;
}

export function DynamicHero({
  eyebrow = "Partenariat 2026",
  heading = "Faites partie de l'écurie.",
  tagline = "Cinq partenaires nous accompagnent déjà. Associez votre marque à SWSM Racing Team — trois pilotes en Championnat de France de Supermotard.",
  primaryCtaLabel = "Télécharger le dossier",
  primaryCtaHref = "/dossier-sponsoring.pdf",
  secondaryCtaLabel = "Découvrir les niveaux",
  secondaryCtaHref = "#niveaux",
}: DynamicHeroProps) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const targetRef = useRef<HTMLAnchorElement | null>(null);
  const mousePosRef = useRef<{ x: number | null; y: number | null }>({ x: null, y: null });
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const animationFrameIdRef = useRef<number | null>(null);
  const isVisibleRef = useRef(true);

  const drawArrow = useCallback(() => {
    if (!canvasRef.current || !targetRef.current || !ctxRef.current) return;
    if (!isVisibleRef.current) return;

    const targetRect = targetRef.current.getBoundingClientRect();
    if (targetRect.bottom < 0 || targetRect.top > window.innerHeight) return;

    const targetEl = targetRef.current;
    const ctx = ctxRef.current;
    const mouse = mousePosRef.current;

    const x0 = mouse.x;
    const y0 = mouse.y;

    if (x0 === null || y0 === null) return;

    const rect = targetEl.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;

    const a = Math.atan2(cy - y0, cx - x0);
    const x1 = cx - Math.cos(a) * (rect.width / 2 + 16);
    const y1 = cy - Math.sin(a) * (rect.height / 2 + 16);

    const midX = (x0 + x1) / 2;
    const midY = (y0 + y1) / 2;
    const offset = Math.min(220, Math.hypot(x1 - x0, y1 - y0) * 0.5);
    const t = Math.max(-1, Math.min(1, (y0 - y1) / 200));
    const controlX = midX;
    const controlY = midY + offset * t;

    const r = Math.sqrt((x1 - x0) ** 2 + (y1 - y0) ** 2);
    const opacity = Math.min(0.95, (r - Math.max(rect.width, rect.height) / 2) / 450);

    if (opacity <= 0) return;

    // Couleur SWSM pink (#EC2D7C) — cohérent charte
    ctx.strokeStyle = `rgba(236, 45, 124, ${opacity})`;
    ctx.lineWidth = 2;
    ctx.lineCap = "round";

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.quadraticCurveTo(controlX, controlY, x1, y1);
    ctx.setLineDash([10, 6]);
    ctx.stroke();
    ctx.restore();

    const angle = Math.atan2(y1 - controlY, x1 - controlX);
    const headLength = 14;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(
      x1 - headLength * Math.cos(angle - Math.PI / 6),
      y1 - headLength * Math.sin(angle - Math.PI / 6),
    );
    ctx.moveTo(x1, y1);
    ctx.lineTo(
      x1 - headLength * Math.cos(angle + Math.PI / 6),
      y1 - headLength * Math.sin(angle + Math.PI / 6),
    );
    ctx.stroke();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const section = sectionRef.current;
    if (!canvas || !targetRef.current || !section) return;

    ctxRef.current = canvas.getContext("2d");
    const ctx = ctxRef.current;
    if (!ctx) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisibleRef.current = entry.isIntersecting;
        if (!entry.isIntersecting && ctx && canvas) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
      },
      { threshold: 0 },
    );
    observer.observe(section);

    const dpr = window.devicePixelRatio || 1;
    const updateCanvasSize = () => {
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.scale(dpr, dpr);
    };

    const handleMouseMove = (e: MouseEvent) => {
      mousePosRef.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseLeave = () => {
      mousePosRef.current = { x: null, y: null };
    };

    window.addEventListener("resize", updateCanvasSize);
    window.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseleave", handleMouseLeave);
    updateCanvasSize();

    const animateLoop = () => {
      if (ctx && canvas) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawArrow();
      }
      animationFrameIdRef.current = requestAnimationFrame(animateLoop);
    };
    animateLoop();

    return () => {
      window.removeEventListener("resize", updateCanvasSize);
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
      observer.disconnect();
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
    };
  }, [drawArrow]);

  return (
    <section
      ref={sectionRef}
      className="dh-root relative bg-swsm-black text-swsm-white overflow-hidden flex items-center justify-center min-h-screen"
      aria-label="Devenir partenaire de SWSM Racing Team"
    >
      <div className="dh-aurora absolute inset-0 z-0" aria-hidden="true">
        <div className="dh-blob dh-blob-1" />
        <div className="dh-blob dh-blob-2" />
        <div className="dh-blob dh-blob-3" />
        <div className="dh-blob dh-blob-4" />
      </div>

      <div className="dh-grain absolute inset-0 z-[5] pointer-events-none" aria-hidden="true" />
      <div className="absolute inset-0 z-10 bg-black/35" aria-hidden="true" />

      <div className="relative z-20 max-w-[1240px] mx-auto px-6 md:px-10 text-center flex flex-col items-center gap-6">
        <p className="text-xs uppercase tracking-[0.05em] font-display font-medium text-swsm-pink">
          {eyebrow}
        </p>

        <h1 className="font-display font-bold text-swsm-white tracking-[-0.01em] leading-[0.95] text-4xl md:text-6xl lg:text-7xl max-w-5xl">
          {heading}
        </h1>

        <p className="font-body text-base md:text-lg text-swsm-white/85 max-w-2xl leading-relaxed mt-2">
          {tagline}
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
          <a
            ref={targetRef}
            href={primaryCtaHref}
            download
            className="dh-cta-primary group relative inline-flex items-center justify-center gap-2 font-display font-bold text-sm uppercase tracking-[0.05em] px-8 py-4 bg-swsm-pink text-swsm-white rounded-sm transition-transform duration-200 hover:scale-[1.03] focus:outline-none focus-visible:ring-2 focus-visible:ring-swsm-pink focus-visible:ring-offset-2 focus-visible:ring-offset-swsm-black"
          >
            <span>{primaryCtaLabel}</span>
            <span className="transition-transform duration-200 group-hover:translate-x-1">→</span>
          </a>

          <a
            href={secondaryCtaHref}
            className="inline-flex items-center justify-center gap-2 font-display font-bold text-sm uppercase tracking-[0.05em] px-8 py-4 border border-swsm-white/30 text-swsm-white rounded-sm backdrop-blur-sm hover:bg-swsm-white/10 hover:border-swsm-white/60 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-swsm-white"
          >
            <span>{secondaryCtaLabel}</span>
            <span>↓</span>
          </a>
        </div>
      </div>

      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none z-30"
        aria-hidden="true"
      />

      <style>{`
        .dh-grain {
          background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='240' height='240'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>");
          background-size: 240px 240px;
          opacity: 0.08;
          mix-blend-mode: overlay;
        }
        .dh-aurora {
          mix-blend-mode: screen;
          filter: blur(55px);
          transform: translate3d(0, 0, 0);
          opacity: 0.55;
        }
        @media (max-width: 768px) {
          .dh-aurora { filter: blur(40px); }
        }
        .dh-blob {
          position: absolute;
          border-radius: 50%;
          will-change: transform;
        }
        .dh-blob-1 {
          width: 84vw; height: 84vw; top: -25%; left: -20%;
          background: radial-gradient(circle, rgba(236,45,124,1) 0%, rgba(236,45,124,0) 65%);
          animation: dh-flow-1 7s ease-in-out infinite;
        }
        .dh-blob-2 {
          width: 96vw; height: 96vw; top: 10%; right: -30%;
          background: radial-gradient(circle, rgba(91,33,182,1) 0%, rgba(91,33,182,0) 65%);
          animation: dh-flow-2 9s ease-in-out infinite;
        }
        .dh-blob-3 {
          width: 60vw; height: 60vw; bottom: -20%; left: 18%;
          background: radial-gradient(circle, rgba(255,70,150,0.9) 0%, rgba(255,70,150,0) 65%);
          animation: dh-flow-3 6s ease-in-out infinite;
        }
        .dh-blob-4 {
          width: 72vw; height: 72vw; top: -15%; right: 0%;
          background: radial-gradient(circle, rgba(124,58,237,0.95) 0%, rgba(124,58,237,0) 65%);
          animation: dh-flow-4 8s ease-in-out infinite;
        }
        @keyframes dh-flow-1 {
          0%{transform:translate(0,0) scale(1)} 25%{transform:translate(15vw,16vh) scale(1.25)}
          50%{transform:translate(18vw,4vh) scale(0.85)} 75%{transform:translate(6vw,-12vh) scale(1.3)}
          100%{transform:translate(0,0) scale(1)}
        }
        @keyframes dh-flow-2 {
          0%{transform:translate(0,0) scale(1)} 33%{transform:translate(-18vw,14vh) scale(1.3)}
          66%{transform:translate(-10vw,-16vh) scale(0.82)} 100%{transform:translate(0,0) scale(1)}
        }
        @keyframes dh-flow-3 {
          0%{transform:translate(0,0) scale(1)} 20%{transform:translate(16vw,-12vh) scale(1.28)}
          40%{transform:translate(-10vw,-18vh) scale(0.88)} 60%{transform:translate(-18vw,8vh) scale(1.2)}
          80%{transform:translate(4vw,14vh) scale(0.85)} 100%{transform:translate(0,0) scale(1)}
        }
        @keyframes dh-flow-4 {
          0%{transform:translate(0,0) scale(1)} 50%{transform:translate(-14vw,20vh) scale(1.3)}
          100%{transform:translate(0,0) scale(1)}
        }
        @media (prefers-reduced-motion: reduce) {
          .dh-blob { animation: none !important; }
        }
      `}</style>
    </section>
  );
}
