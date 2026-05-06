"use client";
import { useEffect, useRef, useState } from "react";

export interface Moment {
  img: string;
  title: string;
  desc: string;
  name: string;
}

interface Props {
  moments: Moment[];
  duration?: number;
}

export function MomentsCarousel({ moments, duration = 5000 }: Props) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [progress, setProgress] = useState(0);
  const startRef = useRef<number>(0);
  const rafRef = useRef<number>(0);

  // Auto-play : la barre remplit l'onglet actif en `duration` ms,
  // puis on passe au moment suivant.
  useEffect(() => {
    startRef.current = performance.now();
    setProgress(0);
    const tick = (now: number) => {
      const elapsed = now - startRef.current;
      const p = Math.min(100, (elapsed / duration) * 100);
      setProgress(p);
      if (p < 100) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        setActiveIdx((i) => (i + 1) % moments.length);
      }
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [activeIdx, duration, moments.length]);

  const handleClick = (i: number) => {
    if (i === activeIdx) return;
    setActiveIdx(i);
  };

  return (
    <div className="relative w-full h-[460px] md:h-[600px] overflow-hidden rounded-sm bg-swsm-black">
      {/* Stack toutes les images en absolute, on bascule l'opacité de l'active */}
      {moments.map((m, i) => {
        const isActive = i === activeIdx;
        return (
          <img
            key={m.name}
            src={m.img}
            alt={m.desc}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ease-out ${
              isActive ? "opacity-100" : "opacity-0"
            }`}
            loading={i === 0 ? "eager" : "lazy"}
            aria-hidden={!isActive}
          />
        );
      })}

      {/* Voile sombre en bas pour lisibilité des onglets */}
      <div
        className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-swsm-black/80 via-swsm-black/40 to-transparent pointer-events-none"
        aria-hidden="true"
      />

      {/* Onglets en overlay glassmorphism */}
      <div className="absolute bottom-0 left-0 right-0 grid grid-cols-2 md:grid-cols-4 bg-swsm-black/55 backdrop-blur-md text-swsm-white">
        {moments.map((m, i) => {
          const isActive = i === activeIdx;
          return (
            <button
              key={m.name}
              type="button"
              onClick={() => handleClick(i)}
              className={`relative text-left p-4 md:p-5 border-r border-swsm-white/15 last:border-r-0 transition-opacity overflow-hidden ${
                isActive ? "opacity-100" : "opacity-65 hover:opacity-90"
              }`}
            >
              {/* Barre de progression : remplit l'onglet en background rose translucide */}
              <span
                className="absolute inset-y-0 left-0 bg-swsm-pink/30 ease-linear pointer-events-none"
                style={{
                  width: isActive ? `${progress}%` : "0%",
                  transition: progress === 0 ? "none" : "width 0.1s linear",
                }}
                aria-hidden="true"
              />
              <h3 className="relative z-10 px-3 py-1 rounded-full w-fit bg-swsm-white text-swsm-black text-[11px] font-display font-medium uppercase tracking-[0.1em] mb-2">
                {m.title}
              </h3>
              <p className="relative z-10 text-xs md:text-sm font-body text-swsm-white/85 line-clamp-2">
                {m.desc}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
