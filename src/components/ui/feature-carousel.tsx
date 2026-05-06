"use client";
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

const cn = (...c: (string | undefined | false | null)[]) => c.filter(Boolean).join(" ");

export type IconName = "wrench" | "flag" | "bolt" | "tools" | "camera" | "circle";

export interface Feature {
  id: string;
  label: string;
  icon: IconName;
  image: string;
  description: string;
}

// SVG inline ultra-sobres — charte SWSM (lignes nettes, pas d'emoji)
const ICONS: Record<IconName, JSX.Element> = {
  wrench: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
      <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z" />
    </svg>
  ),
  flag: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
      <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
      <line x1="4" y1="22" x2="4" y2="15" />
    </svg>
  ),
  bolt: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  ),
  tools: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
      <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z" />
    </svg>
  ),
  camera: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
      <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
      <circle cx="12" cy="13" r="4" />
    </svg>
  ),
  circle: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-full h-full">
      <circle cx="12" cy="12" r="10" />
    </svg>
  ),
};

interface Props {
  features: Feature[];
  intervalMs?: number;
}

const ITEM_HEIGHT = 65;
const wrap = (min: number, max: number, v: number) => {
  const r = max - min;
  return ((((v - min) % r) + r) % r) + min;
};

export function FeatureCarousel({ features, intervalMs = 4000 }: Props) {
  const [step, setStep] = useState(0);
  const [paused, setPaused] = useState(false);
  const len = features.length;
  const currentIndex = ((step % len) + len) % len;

  const next = useCallback(() => setStep((s) => s + 1), []);

  const handleClick = (i: number) => {
    const diff = (i - currentIndex + len) % len;
    if (diff > 0) setStep((s) => s + diff);
  };

  useEffect(() => {
    if (paused) return;
    const id = setInterval(next, intervalMs);
    return () => clearInterval(id);
  }, [next, paused, intervalMs]);

  const cardStatus = (i: number) => {
    let d = i - currentIndex;
    if (d > len / 2) d -= len;
    if (d < -len / 2) d += len;
    if (d === 0) return "active";
    if (d === -1) return "prev";
    if (d === 1) return "next";
    return "hidden";
  };

  return (
    <div className="w-full max-w-7xl mx-auto">
      <div className="relative overflow-hidden rounded-sm flex flex-col lg:flex-row min-h-[600px] lg:aspect-video border border-swsm-white/10 bg-swsm-black">
        {/* Chips column */}
        <div className="w-full lg:w-[42%] min-h-[350px] md:min-h-[450px] lg:h-full relative z-30 flex flex-col items-start justify-center overflow-hidden px-8 md:px-16 lg:pl-16 bg-swsm-pink">
          <div className="absolute inset-x-0 top-0 h-12 md:h-20 bg-gradient-to-b from-swsm-pink via-swsm-pink/80 to-transparent z-40" />
          <div className="absolute inset-x-0 bottom-0 h-12 md:h-20 bg-gradient-to-t from-swsm-pink via-swsm-pink/80 to-transparent z-40" />
          <div className="relative w-full h-full flex items-center justify-center lg:justify-start z-20">
            {features.map((feature, index) => {
              const isActive = index === currentIndex;
              const wd = wrap(-(len / 2), len / 2, index - currentIndex);
              return (
                <motion.div
                  key={feature.id}
                  style={{ height: ITEM_HEIGHT, width: "fit-content" }}
                  animate={{
                    y: wd * ITEM_HEIGHT,
                    opacity: 1 - Math.abs(wd) * 0.25,
                  }}
                  transition={{ type: "spring", stiffness: 90, damping: 22, mass: 1 }}
                  className="absolute flex items-center justify-start"
                >
                  <button
                    type="button"
                    onClick={() => handleClick(index)}
                    onMouseEnter={() => setPaused(true)}
                    onMouseLeave={() => setPaused(false)}
                    className={cn(
                      "relative flex items-center gap-3 px-6 md:px-8 py-3.5 md:py-4 rounded-full transition-all duration-700 text-left border font-display font-medium uppercase tracking-[0.05em]",
                      isActive
                        ? "bg-swsm-white text-swsm-pink border-swsm-white z-10"
                        : "bg-transparent text-swsm-white/60 border-swsm-white/25 hover:border-swsm-white/50 hover:text-swsm-white",
                    )}
                  >
                    <span
                      className={cn(
                        "flex items-center justify-center transition-colors duration-500 w-4 h-4",
                        isActive ? "text-swsm-pink" : "text-swsm-white/50",
                      )}
                    >
                      {ICONS[feature.icon]}
                    </span>
                    <span className="text-sm md:text-[15px] whitespace-nowrap">
                      {feature.label}
                    </span>
                  </button>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Image column */}
        <div className="flex-1 min-h-[500px] md:min-h-[600px] lg:h-full relative bg-swsm-black flex items-center justify-center py-16 md:py-24 lg:py-16 px-6 md:px-12 lg:px-10 overflow-hidden border-t lg:border-t-0 lg:border-l border-swsm-white/10">
          <div className="relative w-full max-w-[480px] aspect-[4/5] flex items-center justify-center">
            {features.map((feature, index) => {
              const status = cardStatus(index);
              const isActive = status === "active";
              const isPrev = status === "prev";
              const isNext = status === "next";
              return (
                <motion.div
                  key={feature.id}
                  initial={false}
                  animate={{
                    x: isActive ? 0 : isPrev ? -100 : isNext ? 100 : 0,
                    scale: isActive ? 1 : isPrev || isNext ? 0.85 : 0.7,
                    opacity: isActive ? 1 : isPrev || isNext ? 0.4 : 0,
                    rotate: isPrev ? -3 : isNext ? 3 : 0,
                    zIndex: isActive ? 20 : isPrev || isNext ? 10 : 0,
                    pointerEvents: isActive ? "auto" : "none",
                  }}
                  transition={{ type: "spring", stiffness: 260, damping: 25, mass: 0.8 }}
                  className="absolute inset-0 rounded-sm overflow-hidden border-4 md:border-8 border-swsm-black bg-swsm-black origin-center"
                >
                  <img
                    src={feature.image}
                    alt={feature.label}
                    className={cn(
                      "w-full h-full object-cover transition-all duration-700",
                      isActive ? "grayscale-0 blur-0" : "grayscale blur-[2px] brightness-75",
                    )}
                  />
                  <AnimatePresence>
                    {isActive && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute inset-x-0 bottom-0 p-8 md:p-10 pt-32 bg-gradient-to-t from-swsm-black/95 via-swsm-black/50 to-transparent flex flex-col justify-end pointer-events-none"
                      >
                        <div className="bg-swsm-white text-swsm-black px-3 py-1.5 rounded-full text-[10px] font-display font-medium uppercase tracking-[0.2em] w-fit shadow-lg mb-3">
                          {String(index + 1).padStart(2, "0")} · {feature.label}
                        </div>
                        <p className="text-swsm-white font-display font-bold text-xl md:text-2xl leading-tight tracking-[-0.01em]">
                          {feature.description}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <div
                    className={cn(
                      "absolute top-6 left-6 flex items-center gap-2 transition-opacity duration-300",
                      isActive ? "opacity-100" : "opacity-0",
                    )}
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-swsm-pink shadow-[0_0_8px_#EC2D7C]" />
                    <span className="text-swsm-white/85 text-[10px] font-display font-medium uppercase tracking-[0.3em]">
                      Saison 2026
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
