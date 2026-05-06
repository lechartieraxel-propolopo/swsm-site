"use client";

import { useEffect, useRef } from "react";

interface Image {
  src: string;
  alt?: string;
}

export interface ManifestoContent {
  eyebrow: string;
  title1: string;
  title2: string;
  ctaLabel: string;
  ctaHref: string;
}

interface ZoomParallaxProps {
  images: Image[];
  manifesto?: ManifestoContent;
}

// Cibles de scale pour les 7 photos (mêmes valeurs que la version framer-motion)
const SCALES = [4, 5, 6, 5, 6, 8, 9];
// Index 0 (hero-1) est rendue en pleine taille dès le départ et scale-DOWN pour éviter
// la pixelisation au zoom max. Les autres scale-UP normalement.
const FULLSIZE_INDEX = 0;
const ZOOM_END = 0.8; // Le zoom se termine à 80% du scroll
const MANIFESTO_MID = 0.95; // Manifesto pleinement visible à 95%

export function ZoomParallax({ images, manifesto }: ZoomParallaxProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const photosRef = useRef<(HTMLDivElement | null)[]>([]);
  const overlayRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let ticking = false;

    const update = () => {
      const rect = container.getBoundingClientRect();
      const total = container.offsetHeight - window.innerHeight;
      const progress = total > 0 ? Math.max(0, Math.min(1, -rect.top / total)) : 0;

      // Photos scale — clamp à ZOOM_END
      const zoomP = Math.min(1, progress / ZOOM_END);
      photosRef.current.forEach((el, i) => {
        if (!el) return;
        const targetScale = SCALES[i % SCALES.length];
        if (i === FULLSIZE_INDEX) {
          // Photo principale rendue en pleine taille → scale DOWN au début (1/targetScale → 1)
          // Le buffer pixel reste haute résolution, pas de pixelisation au zoom max.
          const startScale = 1 / targetScale;
          const scale = startScale + (1 - startScale) * zoomP;
          el.style.transform = `scale(${scale})`;
        } else {
          // Autres photos : scale UP classique (1 → targetScale)
          const scale = 1 + (targetScale - 1) * zoomP;
          el.style.transform = `scale(${scale})`;
        }
      });

      // Manifesto fade-in entre ZOOM_END et MANIFESTO_MID
      if (manifesto) {
        const range = MANIFESTO_MID - ZOOM_END;
        const mP = range > 0 ? Math.max(0, Math.min(1, (progress - ZOOM_END) / range)) : 0;
        if (overlayRef.current) {
          overlayRef.current.style.opacity = String(mP * 0.85);
        }
        if (contentRef.current) {
          contentRef.current.style.opacity = String(mP);
          contentRef.current.style.transform = `translateX(${-80 * (1 - mP)}px)`;
          contentRef.current.style.pointerEvents = mP > 0.5 ? "auto" : "none";
        }
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
  }, [manifesto]);

  return (
    <div ref={containerRef} className="relative h-[300vh]">
      <div className="sticky top-0 h-screen overflow-hidden">
        {/* Photos */}
        {images.map(({ src, alt }, index) => {
          const isFullsize = index === FULLSIZE_INDEX;
          // Photo principale rendue à 100vh × 100vw natif (buffer haute résolution),
          // scale-down au début. Pas de pixelisation au zoom max.
          const innerSize = isFullsize ? "h-screen w-screen" : "h-[25vh] w-[25vw]";
          return (
            <div
              key={index}
              ref={(el) => { photosRef.current[index] = el; }}
              style={{ transformOrigin: "center center", willChange: "transform" }}
              className={`absolute top-0 flex h-full w-full items-center justify-center ${index === 1 ? "[&>div]:!-top-[30vh] [&>div]:!left-[5vw] [&>div]:!h-[30vh] [&>div]:!w-[35vw]" : ""} ${index === 2 ? "[&>div]:!-top-[10vh] [&>div]:!-left-[25vw] [&>div]:!h-[45vh] [&>div]:!w-[20vw]" : ""} ${index === 3 ? "[&>div]:!left-[27.5vw] [&>div]:!h-[25vh] [&>div]:!w-[25vw]" : ""} ${index === 4 ? "[&>div]:!top-[27.5vh] [&>div]:!left-[5vw] [&>div]:!h-[25vh] [&>div]:!w-[20vw]" : ""} ${index === 5 ? "[&>div]:!top-[27.5vh] [&>div]:!-left-[22.5vw] [&>div]:!h-[25vh] [&>div]:!w-[30vw]" : ""} ${index === 6 ? "[&>div]:!top-[22.5vh] [&>div]:!left-[25vw] [&>div]:!h-[15vh] [&>div]:!w-[15vw]" : ""} `}
            >
              <div className={`relative ${innerSize}`}>
                <img
                  src={src || "/placeholder.svg"}
                  alt={alt || `Parallax image ${index + 1}`}
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
          );
        })}

        {/* Overlay manifeste */}
        {manifesto && (
          <>
            <div
              ref={overlayRef}
              className="pointer-events-none absolute inset-0"
              style={{
                zIndex: 50,
                opacity: 0,
                background:
                  "linear-gradient(90deg, rgba(13,13,13,1) 0%, rgba(13,13,13,0.75) 45%, rgba(13,13,13,0.4) 100%)",
                willChange: "opacity",
              }}
              aria-hidden="true"
            />

            <div
              ref={contentRef}
              className="absolute inset-0 flex items-center px-6 md:px-10"
              style={{
                zIndex: 60,
                opacity: 0,
                transform: "translateX(-80px)",
                pointerEvents: "none",
                willChange: "opacity, transform",
              }}
            >
              <div className="w-full max-w-[1240px] mx-auto">
                <div className="max-w-2xl text-swsm-white">
                  <p className="font-display font-medium text-xs uppercase tracking-[0.18em] text-swsm-pink mb-7">
                    {manifesto.eyebrow}
                  </p>
                  <h2 className="font-display font-bold tracking-[-0.01em] leading-[1.05]">
                    <span className="block text-3xl md:text-5xl lg:text-6xl">
                      {manifesto.title1}
                    </span>
                    <span className="block text-2xl md:text-4xl lg:text-5xl text-swsm-white/85 mt-3 md:mt-4">
                      {manifesto.title2}
                    </span>
                  </h2>
                  <div className="mt-10 md:mt-12">
                    <a
                      href={manifesto.ctaHref}
                      className="btn-cta btn-cta-light font-display font-bold text-sm uppercase tracking-[0.15em] px-7 py-4"
                    >
                      <span>{manifesto.ctaLabel}</span>
                      <span className="btn-cta-arrow">→</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
