"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

const cn = (...c: (string | undefined | null | false)[]) => c.filter(Boolean).join(" ");

export interface StorySlide {
  img: string;
  eyebrow?: string;
  title?: string;
  caption?: string;
}

export interface StoryData {
  id: string;
  avatarLabel: string; // texte court en bas de l'avatar (ex: "Course")
  avatarImage: string; // image dans le cercle avatar
  accentColor?: string; // couleur du contour quand non vue (par défaut rose SWSM)
  slides: StorySlide[];
}

interface Props {
  stories: StoryData[];
  slideDuration?: number;
}

export function StoriesRow({ stories, slideDuration = 5000 }: Props) {
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  const [seenIds, setSeenIds] = useState<Set<string>>(new Set());

  const open = (i: number) => {
    setOpenIdx(i);
    setSeenIds((s) => new Set(s).add(stories[i].id));
  };
  const close = () => setOpenIdx(null);

  const goNext = useCallback(() => {
    setOpenIdx((i) => {
      if (i === null) return null;
      if (i >= stories.length - 1) return null; // ferme à la fin
      const next = i + 1;
      setSeenIds((s) => new Set(s).add(stories[next].id));
      return next;
    });
  }, [stories]);

  const goPrev = useCallback(() => {
    setOpenIdx((i) => (i === null || i === 0 ? i : i - 1));
  }, []);

  return (
    <>
      {/* Rangée d'avatars */}
      <div className="flex gap-5 md:gap-6 overflow-x-auto pb-2 -mx-1 px-1 snap-x">
        {stories.map((s, i) => {
          const seen = seenIds.has(s.id);
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => open(i)}
              className="group flex flex-col items-center gap-3 shrink-0 snap-start focus:outline-none focus-visible:ring-2 focus-visible:ring-swsm-pink rounded-full"
              aria-label={`Ouvrir la story ${s.avatarLabel}`}
            >
              <span
                className={cn(
                  "relative inline-flex p-[2.5px] rounded-full transition-transform duration-300 group-hover:scale-[1.04]",
                )}
                style={{
                  background: seen
                    ? "rgba(247,247,245,0.25)"
                    : `conic-gradient(from 0deg, ${s.accentColor || "#EC2D7C"}, #5B21B6, ${s.accentColor || "#EC2D7C"})`,
                }}
              >
                <span className="block bg-swsm-black p-[2px] rounded-full">
                  <img
                    src={s.avatarImage}
                    alt=""
                    className="block w-16 h-16 md:w-20 md:h-20 object-cover rounded-full"
                    loading="lazy"
                  />
                </span>
              </span>
              <span className="text-[10px] md:text-[11px] uppercase tracking-[0.15em] font-display font-medium text-swsm-white/80 group-hover:text-swsm-white transition-colors">
                {s.avatarLabel}
              </span>
            </button>
          );
        })}
      </div>

      {/* Player modale */}
      <AnimatePresence>
        {openIdx !== null && (
          <StoryPlayer
            key={`player-${openIdx}`}
            story={stories[openIdx]}
            slideDuration={slideDuration}
            onClose={close}
            onNext={goNext}
            onPrev={goPrev}
            hasNext={openIdx < stories.length - 1}
            hasPrev={openIdx > 0}
          />
        )}
      </AnimatePresence>
    </>
  );
}

interface PlayerProps {
  story: StoryData;
  slideDuration: number;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
  hasNext: boolean;
  hasPrev: boolean;
}

function StoryPlayer({
  story,
  slideDuration,
  onClose,
  onNext,
  onPrev,
  hasNext,
  hasPrev,
}: PlayerProps) {
  const [slideIdx, setSlideIdx] = useState(0);
  const [progress, setProgress] = useState(0);
  const [paused, setPaused] = useState(false);
  const startRef = useRef<number>(0);
  const elapsedAtPauseRef = useRef<number>(0);
  const rafRef = useRef<number>(0);

  const total = story.slides.length;
  const slide = story.slides[slideIdx];

  // Reset progress quand on change de slide ou de story
  useEffect(() => {
    elapsedAtPauseRef.current = 0;
    setProgress(0);
    startRef.current = performance.now();
  }, [slideIdx, story.id]);

  // Auto-play
  useEffect(() => {
    if (paused) return;
    startRef.current = performance.now() - elapsedAtPauseRef.current;
    const tick = (now: number) => {
      const elapsed = now - startRef.current;
      const p = Math.min(100, (elapsed / slideDuration) * 100);
      setProgress(p);
      if (p < 100) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        // Slide suivant ou story suivante
        if (slideIdx < total - 1) {
          setSlideIdx((i) => i + 1);
        } else if (hasNext) {
          onNext();
        } else {
          // Fin : on reste sur le dernier, paused
          setPaused(true);
        }
      }
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [paused, slideIdx, total, slideDuration, hasNext, onNext]);

  // Garder l'elapsed quand on pause pour reprendre où on en était
  useEffect(() => {
    if (paused) {
      elapsedAtPauseRef.current = performance.now() - startRef.current;
    }
  }, [paused]);

  // Clavier : ← → Echap, Space pause
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowRight") {
        if (slideIdx < total - 1) setSlideIdx((i) => i + 1);
        else if (hasNext) onNext();
      } else if (e.key === "ArrowLeft") {
        if (slideIdx > 0) setSlideIdx((i) => i - 1);
        else if (hasPrev) onPrev();
      } else if (e.key === " ") {
        e.preventDefault();
        setPaused((p) => !p);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [slideIdx, total, hasNext, hasPrev, onClose, onNext, onPrev]);

  // Lock body scroll
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  const tapPrev = () => {
    if (slideIdx > 0) setSlideIdx((i) => i - 1);
    else if (hasPrev) onPrev();
  };
  const tapNext = () => {
    if (slideIdx < total - 1) setSlideIdx((i) => i + 1);
    else if (hasNext) onNext();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-[1000] bg-swsm-black/90 backdrop-blur-md flex items-center justify-center p-4 md:p-8"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.96, y: 12 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.96, y: 12 }}
        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-[420px] aspect-[9/16] bg-swsm-black rounded-lg overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Stack d'images en cross-fade */}
        {story.slides.map((s, i) => (
          <img
            key={i}
            src={s.img}
            alt={s.title || ""}
            className={cn(
              "absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ease-out",
              i === slideIdx ? "opacity-100" : "opacity-0",
            )}
            loading={i === 0 ? "eager" : "lazy"}
            aria-hidden={i !== slideIdx}
          />
        ))}

        {/* Voile haut + bas pour lisibilité (renforcés sur fonds clairs) */}
        <div
          className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-black via-black/70 to-transparent pointer-events-none z-20"
          aria-hidden="true"
        />
        <div
          className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-black/95 via-black/55 to-transparent pointer-events-none z-20"
          aria-hidden="true"
        />

        {/* Header : barres de progression + avatar + close */}
        <div className="absolute top-0 left-0 right-0 z-40 px-3 pt-3" style={{isolation: "isolate"}}>
          <div className="flex gap-1">
            {story.slides.map((_, i) => {
              const isActive = i === slideIdx;
              const isDone = i < slideIdx;
              return (
                <div
                  key={i}
                  className="h-1 flex-1 rounded-full bg-white/40 overflow-hidden"
                >
                  <div
                    className="h-full bg-white"
                    style={{
                      width: isDone ? "100%" : isActive ? `${progress}%` : "0%",
                      transition: progress === 0 ? "none" : "width 0.1s linear",
                    }}
                  />
                </div>
              );
            })}
          </div>
          <div className="mt-3 flex items-center gap-3">
            <img
              src={story.avatarImage}
              alt=""
              className="w-8 h-8 rounded-full object-cover border border-swsm-white/40"
            />
            <span className="text-xs uppercase tracking-[0.15em] font-display font-medium text-swsm-white">
              {story.avatarLabel}
            </span>
            <button
              type="button"
              onClick={() => setPaused((p) => !p)}
              className="ml-auto w-8 h-8 inline-flex items-center justify-center rounded-full text-swsm-white hover:bg-swsm-white/15 transition-colors"
              aria-label={paused ? "Reprendre" : "Mettre en pause"}
            >
              {paused ? (
                <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
                  <path d="M8 5v14l11-7z" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
                  <path d="M6 5h4v14H6zM14 5h4v14h-4z" />
                </svg>
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 inline-flex items-center justify-center rounded-full text-swsm-white hover:bg-swsm-white/15 transition-colors"
              aria-label="Fermer"
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="6" y1="6" x2="18" y2="18" />
                <line x1="18" y1="6" x2="6" y2="18" />
              </svg>
            </button>
          </div>
        </div>

        {/* Tap zones gauche/droite (au-dessus du contenu, sous le header) */}
        <button
          type="button"
          onClick={tapPrev}
          className="absolute left-0 top-20 bottom-32 w-1/3 z-20 cursor-default focus:outline-none"
          aria-label="Slide précédent"
          tabIndex={-1}
        />
        <button
          type="button"
          onClick={tapNext}
          className="absolute right-0 top-20 bottom-32 w-1/3 z-20 cursor-default focus:outline-none"
          aria-label="Slide suivant"
          tabIndex={-1}
        />

        {/* Texte en bas */}
        {(slide.eyebrow || slide.title || slide.caption) && (
          <div className="absolute bottom-0 left-0 right-0 z-40 p-5 pb-6 space-y-1.5">
            {slide.eyebrow && (
              <p className="text-[10px] uppercase tracking-[0.2em] font-display font-medium text-swsm-pink">
                {slide.eyebrow}
              </p>
            )}
            {slide.title && (
              <h3 className="font-display font-bold text-swsm-white text-xl md:text-2xl tracking-[-0.01em] leading-tight">
                {slide.title}
              </h3>
            )}
            {slide.caption && (
              <p className="font-body text-sm text-swsm-white/85 leading-relaxed">
                {slide.caption}
              </p>
            )}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
