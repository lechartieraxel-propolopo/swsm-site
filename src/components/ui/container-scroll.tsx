"use client";

import React, { useRef } from "react";
import { useScroll, useTransform, motion, type MotionValue } from "framer-motion";

interface ContainerScrollProps {
  eyebrow?: string;
  titleTop?: string;
  titleBottom?: string;
  description?: string;
  children: React.ReactNode;
}

export const ContainerScroll = ({
  eyebrow,
  titleTop,
  titleBottom,
  description,
  children,
}: ContainerScrollProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: containerRef });
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const scaleDimensions = () => (isMobile ? [0.7, 0.9] : [1.05, 1]);

  const rotate = useTransform(scrollYProgress, [0, 1], [20, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], scaleDimensions());
  const translate = useTransform(scrollYProgress, [0, 1], [0, -100]);

  return (
    <div
      ref={containerRef}
      className="h-[68rem] md:h-[95rem] flex items-start justify-center relative p-2 md:p-12"
    >
      <div className="pt-8 md:pt-16 w-full relative" style={{ perspective: "1000px" }}>
        {/* Header */}
        <motion.div
          style={{ translateY: translate }}
          className="max-w-5xl mx-auto text-center px-4"
        >
          {eyebrow && (
            <p className="text-xs md:text-sm uppercase tracking-[0.18em] font-display font-medium text-swsm-pink mb-5">
              {eyebrow}
            </p>
          )}
          {titleTop && (
            <h1 className="font-display font-bold text-swsm-black tracking-[-0.01em] leading-[1.05]">
              <span className="block text-3xl md:text-5xl">{titleTop}</span>
              {titleBottom && (
                <span className="block text-5xl md:text-[6rem] font-bold mt-1 leading-none tracking-[-0.02em]">
                  {titleBottom}
                </span>
              )}
            </h1>
          )}
          {description && (
            <p className="font-body text-base md:text-lg text-swsm-black/65 mt-6 max-w-2xl mx-auto leading-relaxed">
              {description}
            </p>
          )}
        </motion.div>

        {/* Card — agrandi (h passe de 40rem à 52rem, max-w de 5xl à 6xl) */}
        <motion.div
          style={{
            rotateX: rotate,
            scale,
            boxShadow:
              "0 0 #0000004d, 0 9px 20px #0000004a, 0 37px 37px #00000042, 0 84px 50px #00000026, 0 149px 60px #0000000a, 0 233px 65px #00000003",
          }}
          className="max-w-6xl mt-10 md:mt-16 mx-auto h-[36rem] md:h-[52rem] w-full border-4 border-swsm-black/40 p-2 md:p-4 bg-swsm-black rounded-[30px] shadow-2xl"
        >
          <div className="h-full w-full overflow-hidden rounded-2xl bg-swsm-black md:rounded-2xl">
            {children}
          </div>
        </motion.div>
      </div>
    </div>
  );
};
