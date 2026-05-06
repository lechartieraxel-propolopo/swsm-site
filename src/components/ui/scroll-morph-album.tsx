"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { motion } from "framer-motion";

export type AnimationPhase = "scatter" | "line" | "circle" | "morph";

interface FlipCardProps {
  src: string;
  index: number;
  target: { x: number; y: number; rotation: number; scale: number; opacity: number };
}

const IMG_WIDTH = 60;
const IMG_HEIGHT = 85;

function FlipCard({ src, index, target }: FlipCardProps) {
  return (
    <motion.div
      animate={{
        x: target.x,
        y: target.y,
        rotate: target.rotation,
        scale: target.scale,
        opacity: target.opacity,
      }}
      transition={{ type: "spring", stiffness: 90, damping: 18 }}
      style={{
        position: "absolute",
        width: IMG_WIDTH,
        height: IMG_HEIGHT,
        transformStyle: "preserve-3d",
        perspective: "1000px",
      }}
      className="cursor-pointer group"
    >
      <motion.div
        className="relative h-full w-full"
        style={{ transformStyle: "preserve-3d" }}
        transition={{ duration: 0.6, type: "spring", stiffness: 260, damping: 20 }}
        whileHover={{ rotateY: 180 }}
      >
        {/* Front */}
        <div
          className="absolute inset-0 h-full w-full overflow-hidden rounded-md shadow-lg bg-swsm-black/5"
          style={{ backfaceVisibility: "hidden" }}
        >
          <img src={src} alt={`album-${index}`} className="h-full w-full object-cover" loading="lazy" />
          <div className="absolute inset-0 bg-black/5 transition-colors group-hover:bg-transparent" />
        </div>

        {/* Back */}
        <div
          className="absolute inset-0 h-full w-full overflow-hidden rounded-md shadow-lg bg-swsm-black flex flex-col items-center justify-center p-2"
          style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
        >
          <div className="text-center">
            <p className="text-[7px] font-bold text-swsm-pink uppercase tracking-[0.2em] mb-1">
              Album
            </p>
            <p className="text-[10px] font-medium text-swsm-white tracking-wide">SWSM</p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

const TOTAL_IMAGES = 20;

const lerp = (start: number, end: number, t: number) => start * (1 - t) + end * t;

interface ScrollMorphAlbumProps {
  images: string[];
  introTitle?: string;
  introSubtitle?: string;
  arcTitle?: string;
  arcSubtitle?: string;
  ctaLabel?: string;
  ctaHref?: string;
}

export default function ScrollMorphAlbum({
  images,
  introTitle = "L'écurie en images.",
  introSubtitle = "Continuez à scroller",
  arcTitle = "L'album SWSM",
  arcSubtitle = "Une saison capturée. Photos, instants, coulisses.",
  ctaLabel = "Voir l'album complet",
  ctaHref = "/album",
}: ScrollMorphAlbumProps) {
  const [introPhase, setIntroPhase] = useState<AnimationPhase>("scatter");
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  // Progress 0 → 1 driven by scroll position within the section
  const [scrollProgress, setScrollProgress] = useState(0);
  const [parallaxX, setParallaxX] = useState(0);

  const sectionRef = useRef<HTMLDivElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const introStartedRef = useRef(false);

  // Container size (sticky inner)
  useEffect(() => {
    if (!stickyRef.current) return;
    const handleResize = (entries: ResizeObserverEntry[]) => {
      for (const entry of entries) {
        setContainerSize({ width: entry.contentRect.width, height: entry.contentRect.height });
      }
    };
    const observer = new ResizeObserver(handleResize);
    observer.observe(stickyRef.current);
    setContainerSize({
      width: stickyRef.current.offsetWidth,
      height: stickyRef.current.offsetHeight,
    });
    return () => observer.disconnect();
  }, []);

  // Scroll listener — calcule progress en fonction de la position de la section
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    let ticking = false;

    const update = () => {
      const rect = section.getBoundingClientRect();
      const vh = window.innerHeight;
      const scrollable = section.offsetHeight - vh;
      const scrolled = -rect.top;

      // Progress 0 quand top de section au top viewport, 1 quand bottom de section quitte le bas
      const p = scrollable > 0 ? Math.max(0, Math.min(1, scrolled / scrollable)) : 0;
      setScrollProgress(p);

      // Démarrer l'intro quand la section est ~50% visible et qu'on scrolle dedans
      if (!introStartedRef.current && rect.top < vh * 0.7 && rect.bottom > 0) {
        introStartedRef.current = true;
        // Phase line après 300ms, circle après 1500ms
        setTimeout(() => setIntroPhase("line"), 300);
        setTimeout(() => setIntroPhase("circle"), 1500);
      }

      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(update);
        ticking = true;
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", update, { passive: true });
    update();

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", update);
    };
  }, []);

  // Mouse parallax (uniquement quand sticky est en vue)
  useEffect(() => {
    const sticky = stickyRef.current;
    if (!sticky) return;
    const handleMouseMove = (e: MouseEvent) => {
      const rect = sticky.getBoundingClientRect();
      const relativeX = e.clientX - rect.left;
      const normalizedX = (relativeX / rect.width) * 2 - 1;
      setParallaxX(normalizedX * 50);
    };
    sticky.addEventListener("mousemove", handleMouseMove);
    return () => sticky.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Random scatter positions
  const scatterPositions = useMemo(() => {
    return Array.from({ length: TOTAL_IMAGES }, () => ({
      x: (Math.random() - 0.5) * 1200,
      y: (Math.random() - 0.5) * 800,
      rotation: (Math.random() - 0.5) * 180,
      scale: 0.6,
      opacity: 0,
    }));
  }, []);

  // Sécurité : si moins de 20 images fournies, on cycle
  const safeImages = useMemo(() => {
    if (images.length === 0) return [];
    return Array.from({ length: TOTAL_IMAGES }, (_, i) => images[i % images.length]);
  }, [images]);

  // Mapping du progress :
  //   [0, 0.2]   → intro (scatter/line/circle gérés via timers)
  //   [0.2, 0.6] → morph cercle → arc (morphValue 0 → 1)
  //   [0.6, 1]   → arc bien visible, CTA pleinement affiché
  const morphValue = Math.max(0, Math.min(1, (scrollProgress - 0.2) / 0.4));
  const contentOpacity = Math.max(0, Math.min(1, (scrollProgress - 0.55) / 0.15));
  const introTextOpacity = Math.max(0, Math.min(1, 1 - morphValue * 2));

  return (
    <section
      ref={sectionRef}
      className="relative w-full bg-swsm-white"
      style={{ height: "200vh" }}
      aria-label="Aperçu de l'album SWSM"
    >
      <div ref={stickyRef} className="sticky top-0 h-screen w-full overflow-hidden">
        <div className="flex h-full w-full flex-col items-center justify-center perspective-1000">
          {/* Intro Text — visible jusqu'au début du morph */}
          <div
            className="absolute z-0 flex flex-col items-center justify-center text-center pointer-events-none top-1/2 -translate-y-1/2 px-6"
            style={{ opacity: introTextOpacity, transition: "opacity 0.2s linear" }}
          >
            <h2 className="font-display font-bold tracking-[-0.01em] text-2xl md:text-4xl lg:text-5xl text-swsm-black">
              {introTitle}
            </h2>
            <p className="mt-5 text-[10px] md:text-xs font-display font-medium tracking-[0.25em] text-swsm-pink uppercase">
              {introSubtitle}
            </p>
          </div>

          {/* Arc Active Content — fade in à la fin du morph */}
          <div
            className="absolute top-[10%] z-10 flex flex-col items-center justify-center text-center px-6"
            style={{
              opacity: contentOpacity,
              transform: `translateY(${(1 - contentOpacity) * 20}px)`,
              transition: "opacity 0.2s linear, transform 0.2s linear",
              pointerEvents: contentOpacity > 0.5 ? "auto" : "none",
            }}
          >
            <p className="text-[10px] md:text-xs font-display font-medium tracking-[0.2em] text-swsm-pink uppercase mb-4">
              Album
            </p>
            <h2 className="font-display font-bold text-swsm-black tracking-[-0.01em] leading-[1.05] text-3xl md:text-5xl lg:text-6xl mb-4">
              {arcTitle}
            </h2>
            <p className="font-body text-sm md:text-base text-swsm-black/65 max-w-xl leading-relaxed mb-8">
              {arcSubtitle}
            </p>
            <a
              href={ctaHref}
              className="btn-cta btn-cta-pink font-display font-bold text-sm uppercase tracking-[0.15em] px-8 py-4"
            >
              <span>{ctaLabel}</span>
              <span className="btn-cta-arrow">→</span>
            </a>
          </div>

          {/* Photos */}
          <div className="relative flex items-center justify-center w-full h-full">
            {safeImages.slice(0, TOTAL_IMAGES).map((src, i) => {
              let target = { x: 0, y: 0, rotation: 0, scale: 1, opacity: 1 };

              if (introPhase === "scatter") {
                target = scatterPositions[i];
              } else if (introPhase === "line") {
                const lineSpacing = 70;
                const lineTotalWidth = TOTAL_IMAGES * lineSpacing;
                const lineX = i * lineSpacing - lineTotalWidth / 2;
                target = { x: lineX, y: 0, rotation: 0, scale: 1, opacity: 1 };
              } else {
                const isMobile = containerSize.width < 768;
                const minDimension = Math.min(containerSize.width, containerSize.height);
                const circleRadius = Math.min(minDimension * 0.35, 350);
                const circleAngle = (i / TOTAL_IMAGES) * 360;
                const circleRad = (circleAngle * Math.PI) / 180;
                const circlePos = {
                  x: Math.cos(circleRad) * circleRadius,
                  y: Math.sin(circleRad) * circleRadius,
                  rotation: circleAngle + 90,
                };

                const baseRadius = Math.min(containerSize.width, containerSize.height * 1.5);
                const arcRadius = baseRadius * (isMobile ? 1.4 : 1.1);
                // Apex remonté pour que les photos restent dans la moitié supérieure
                const arcApexY = containerSize.height * (isMobile ? 0.25 : 0.10);
                const arcCenterY = arcApexY + arcRadius;
                const spreadAngle = isMobile ? 100 : 130;
                const startAngle = -90 - spreadAngle / 2;
                const step = spreadAngle / (TOTAL_IMAGES - 1);

                const currentArcAngle = startAngle + i * step;
                const arcRad = (currentArcAngle * Math.PI) / 180;

                const arcPos = {
                  x: Math.cos(arcRad) * arcRadius + parallaxX,
                  y: Math.sin(arcRad) * arcRadius + arcCenterY,
                  rotation: currentArcAngle + 90,
                  scale: isMobile ? 1.2 : 1.5,
                };

                target = {
                  x: lerp(circlePos.x, arcPos.x, morphValue),
                  y: lerp(circlePos.y, arcPos.y, morphValue),
                  rotation: lerp(circlePos.rotation, arcPos.rotation, morphValue),
                  scale: lerp(1, arcPos.scale, morphValue),
                  opacity: 1,
                };
              }

              return <FlipCard key={i} src={src} index={i} target={target} />;
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
