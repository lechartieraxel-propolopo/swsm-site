"use client";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { motion } from "framer-motion";

interface Props {
  mediaType?: "video" | "image";
  mediaSrc: string;
  posterSrc?: string;
  bgImageSrc: string;
  title?: string;
  eyebrow?: string;
  scrollToExpand?: string;
  textBlend?: boolean;
  children?: ReactNode;
}

export function ScrollExpandHero({
  mediaType = "video",
  mediaSrc,
  posterSrc,
  bgImageSrc,
  title,
  eyebrow,
  scrollToExpand,
  textBlend = false,
  children,
}: Props) {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showContent, setShowContent] = useState(false);
  const [mediaFullyExpanded, setMediaFullyExpanded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const touchStartYRef = useRef(0);
  const sectionRef = useRef<HTMLDivElement | null>(null);

  // Reset au changement de mediaType
  useEffect(() => {
    setScrollProgress(0);
    setShowContent(false);
    setMediaFullyExpanded(false);
  }, [mediaType]);

  // Mobile detection
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Listeners scroll/wheel/touch — bloquent le scroll natif tant que la
  // vidéo n'est pas full expanded.
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (mediaFullyExpanded && e.deltaY < 0 && window.scrollY <= 5) {
        setMediaFullyExpanded(false);
        e.preventDefault();
      } else if (!mediaFullyExpanded) {
        e.preventDefault();
        const delta = e.deltaY * 0.0009;
        setScrollProgress((prev) => {
          const next = Math.min(Math.max(prev + delta, 0), 1);
          if (next >= 1) {
            setMediaFullyExpanded(true);
            setShowContent(true);
          } else if (next < 0.75) {
            setShowContent(false);
          }
          return next;
        });
      }
    };

    const handleTouchStart = (e: TouchEvent) => {
      touchStartYRef.current = e.touches[0].clientY;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!touchStartYRef.current) return;
      const touchY = e.touches[0].clientY;
      const deltaY = touchStartYRef.current - touchY;

      if (mediaFullyExpanded && deltaY < -20 && window.scrollY <= 5) {
        setMediaFullyExpanded(false);
        e.preventDefault();
      } else if (!mediaFullyExpanded) {
        e.preventDefault();
        const factor = deltaY < 0 ? 0.008 : 0.005;
        const delta = deltaY * factor;
        setScrollProgress((prev) => {
          const next = Math.min(Math.max(prev + delta, 0), 1);
          if (next >= 1) {
            setMediaFullyExpanded(true);
            setShowContent(true);
          } else if (next < 0.75) {
            setShowContent(false);
          }
          return next;
        });
        touchStartYRef.current = touchY;
      }
    };

    const handleTouchEnd = () => {
      touchStartYRef.current = 0;
    };

    const handleScroll = () => {
      if (!mediaFullyExpanded) {
        window.scrollTo(0, 0);
      }
    };

    window.addEventListener("wheel", handleWheel, { passive: false });
    window.addEventListener("scroll", handleScroll);
    window.addEventListener("touchstart", handleTouchStart, { passive: false });
    window.addEventListener("touchmove", handleTouchMove, { passive: false });
    window.addEventListener("touchend", handleTouchEnd);

    return () => {
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [mediaFullyExpanded]);

  const mediaWidth = 300 + scrollProgress * (isMobile ? 650 : 1250);
  const mediaHeight = 400 + scrollProgress * (isMobile ? 200 : 400);
  const textTranslateX = scrollProgress * (isMobile ? 180 : 150);

  const firstWord = title ? title.split(" ")[0] : "";
  const restOfTitle = title ? title.split(" ").slice(1).join(" ") : "";

  return (
    <div
      ref={sectionRef}
      className="transition-colors duration-700 ease-in-out overflow-x-hidden bg-swsm-black"
    >
      <section className="relative flex flex-col items-center justify-start min-h-[100dvh]">
        <div className="relative w-full flex flex-col items-center min-h-[100dvh]">
          {/* Background image */}
          <motion.div
            className="absolute inset-0 z-0 h-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 - scrollProgress }}
            transition={{ duration: 0.1 }}
          >
            <img
              src={bgImageSrc}
              alt=""
              className="w-screen h-screen object-cover object-center"
              style={{ objectPosition: "center" }}
            />
            <div className="absolute inset-0 bg-swsm-black/30" />
          </motion.div>

          <div className="container mx-auto flex flex-col items-center justify-start relative z-10">
            <div className="flex flex-col items-center justify-center w-full h-[100dvh] relative">
              {/* Media (video / image) */}
              <div
                className="absolute z-0 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 transition-none rounded-sm overflow-hidden"
                style={{
                  width: `${mediaWidth}px`,
                  height: `${mediaHeight}px`,
                  maxWidth: "95vw",
                  maxHeight: "85vh",
                  boxShadow: "0px 0px 60px rgba(0, 0, 0, 0.5)",
                }}
              >
                {mediaType === "video" ? (
                  <div className="relative w-full h-full pointer-events-none">
                    <video
                      src={mediaSrc}
                      poster={posterSrc}
                      autoPlay
                      muted
                      loop
                      playsInline
                      preload="auto"
                      className="w-full h-full object-cover rounded-sm"
                      controls={false}
                      disablePictureInPicture
                      disableRemotePlayback
                    />
                    <motion.div
                      className="absolute inset-0 bg-swsm-black/40 rounded-sm"
                      initial={{ opacity: 0.6 }}
                      animate={{ opacity: 0.5 - scrollProgress * 0.4 }}
                      transition={{ duration: 0.2 }}
                    />
                  </div>
                ) : (
                  <div className="relative w-full h-full">
                    <img
                      src={mediaSrc}
                      alt={title || ""}
                      className="w-full h-full object-cover rounded-sm"
                    />
                    <motion.div
                      className="absolute inset-0 bg-swsm-black/50 rounded-sm"
                      initial={{ opacity: 0.7 }}
                      animate={{ opacity: 0.7 - scrollProgress * 0.4 }}
                      transition={{ duration: 0.2 }}
                    />
                  </div>
                )}

                {/* Overlay date + scrollToExpand sur la vidéo */}
                <div className="absolute inset-x-0 bottom-6 flex flex-col items-center text-center z-10 transition-none gap-2">
                  {eyebrow && (
                    <p
                      className="text-[10px] md:text-xs uppercase tracking-[0.3em] font-display font-medium text-swsm-pink drop-shadow-lg"
                      style={{ transform: `translateX(-${textTranslateX}vw)` }}
                    >
                      {eyebrow}
                    </p>
                  )}
                  {scrollToExpand && (
                    <p
                      className="text-swsm-white/85 font-display font-medium text-xs md:text-sm uppercase tracking-[0.2em] drop-shadow-lg"
                      style={{ transform: `translateX(${textTranslateX}vw)` }}
                    >
                      {scrollToExpand}
                    </p>
                  )}
                </div>
              </div>

              {/* Titre splitté en deux mots qui s'écartent */}
              {title && (
                <div
                  className={`flex items-center justify-center text-center gap-4 w-full relative z-10 transition-none flex-col ${
                    textBlend ? "mix-blend-difference" : "mix-blend-normal"
                  }`}
                >
                  <motion.h2 className="font-display font-bold tracking-[-0.02em] leading-[0.95] text-5xl md:text-7xl lg:text-8xl text-swsm-white transition-none drop-shadow-2xl">
                    <span
                      className="inline-block"
                      style={{ transform: `translateX(-${textTranslateX}vw)` }}
                    >
                      {firstWord}
                    </span>
                  </motion.h2>
                  {restOfTitle && (
                    <motion.h2 className="font-display font-bold tracking-[-0.02em] leading-[0.95] text-5xl md:text-7xl lg:text-8xl text-swsm-white transition-none drop-shadow-2xl">
                      <span
                        className="inline-block"
                        style={{ transform: `translateX(${textTranslateX}vw)` }}
                      >
                        {restOfTitle}
                      </span>
                    </motion.h2>
                  )}
                </div>
              )}
            </div>

            {/* Contenu qui apparaît après expansion */}
            <motion.section
              className="flex flex-col w-full px-6 md:px-10 py-16 md:py-24"
              initial={{ opacity: 0 }}
              animate={{ opacity: showContent ? 1 : 0 }}
              transition={{ duration: 0.7 }}
            >
              {children}
            </motion.section>
          </div>
        </div>
      </section>
    </div>
  );
}
