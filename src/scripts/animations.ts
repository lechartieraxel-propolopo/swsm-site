/**
 * Module d'animations partagées — initialise Lenis (smooth scroll), SplitText,
 * Photo Reveal et Parallax. Synchronise ScrollTrigger avec Lenis.
 *
 * Lenis est utilisé en remplacement de ScrollSmoother car compatible avec
 * framer-motion useScroll (utilisé par le ZoomParallax React).
 */

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import Lenis from "lenis";

gsap.registerPlugin(ScrollTrigger, SplitText);

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const isMobile = window.matchMedia("(max-width: 768px)").matches;

// ─── 1. Smooth scroll : DÉSACTIVÉ pour cette version ─────
// ScrollSmoother cassait useScroll de framer-motion (ZoomParallax).
// Lenis cassait les ScrollTrigger pin (Pilotes section).
// Le scroll natif est conservé. ScrollTrigger et useScroll fonctionnent
// nativement sur window.scrollY.
let lenis: Lenis | null = null;

// ─── 2. SplitText premium : 3 modes ─────────────────────────────
// Mode A : data-split-hero      → Hero h1, par mot, blur 8px → 0 + Y 40px
// Mode B : data-split-mask      → titres section, par ligne, mask reveal Y 100% → 0
// Mode C : data-split="words"   → fallback compat ancien code
function applySplitText() {
  // ── Mode A : Hero (joue immédiatement, sans ScrollTrigger) ──
  const heroTargets = document.querySelectorAll<HTMLElement>("[data-split-hero]");
  heroTargets.forEach((el) => {
    if (el.dataset.splitDone === "true") return;
    el.dataset.splitDone = "true";

    let split: SplitText;
    try {
      split = new SplitText(el, { type: "words", wordsClass: "split-word" });
    } catch (err) {
      console.warn("[swsm] SplitText hero failed:", err);
      return;
    }

    if (reduceMotion) {
      gsap.set(split.words, { opacity: 1, y: 0, filter: "blur(0px)" });
      return;
    }

    gsap.set(split.words, { opacity: 0, y: 40, filter: "blur(8px)" });
    gsap.to(split.words, {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      duration: 1.1,
      ease: "expo.out",
      stagger: 0.1,
      delay: 0.2,
    });
  });

  // ── Mode B : titres section (mask reveal au scroll) ──
  const maskTargets = document.querySelectorAll<HTMLElement>("[data-split-mask]");
  maskTargets.forEach((el) => {
    if (el.dataset.splitDone === "true") return;
    el.dataset.splitDone = "true";

    let split: SplitText;
    try {
      split = new SplitText(el, {
        type: "lines",
        linesClass: "split-line",
        mask: "lines", // wrap chaque ligne dans un parent overflow:hidden (v3.13+)
      });
    } catch (err) {
      console.warn("[swsm] SplitText mask failed:", err);
      return;
    }

    if (reduceMotion) {
      gsap.set(split.lines, { yPercent: 0 });
      return;
    }

    gsap.set(split.lines, { yPercent: 100 });
    gsap.to(split.lines, {
      yPercent: 0,
      duration: 0.9,
      ease: "power3.out",
      stagger: 0.15,
      scrollTrigger: {
        trigger: el,
        start: "top 85%",
        toggleActions: "play none none none",
      },
    });
  });

  // ── Mode C : data-split="words" (compat ancien) ──
  const legacyTargets = document.querySelectorAll<HTMLElement>('[data-split="words"]');
  legacyTargets.forEach((el) => {
    if (el.dataset.splitDone === "true") return;
    el.dataset.splitDone = "true";

    let split: SplitText;
    try {
      split = new SplitText(el, { type: "words", wordsClass: "split-word" });
    } catch (err) {
      return;
    }

    if (reduceMotion) {
      gsap.set(split.words, { opacity: 1, y: 0 });
      return;
    }

    gsap.set(split.words, { opacity: 0, y: 30 });
    gsap.to(split.words, {
      opacity: 1,
      y: 0,
      duration: 0.7,
      ease: "power3.out",
      stagger: 0.05,
      scrollTrigger: {
        trigger: el,
        start: "top 85%",
        toggleActions: "play none none none",
      },
    });
  });

  // ── Mode D : data-split="lines" (compat ancien) ──
  const legacyLinesTargets = document.querySelectorAll<HTMLElement>('[data-split="lines"]:not([data-split-done])');
  legacyLinesTargets.forEach((el) => {
    if (el.dataset.splitDone === "true") return;
    el.dataset.splitDone = "true";

    // Si le titre contient déjà des <span class="block">, on les anime tels quels
    const blocks = el.querySelectorAll<HTMLElement>("span.block");
    if (blocks.length > 0) {
      blocks.forEach((line) => {
        const original = line.innerHTML;
        line.innerHTML = `<span class="split-line-inner" style="display:inline-block;will-change:transform">${original}</span>`;
        line.style.overflow = "hidden";
        line.style.display = "block";
      });
      const inners = el.querySelectorAll(".split-line-inner");
      if (reduceMotion) {
        gsap.set(inners, { yPercent: 0 });
      } else {
        gsap.set(inners, { yPercent: 110 });
        gsap.to(inners, {
          yPercent: 0,
          duration: 0.9,
          ease: "power3.out",
          stagger: 0.15,
          scrollTrigger: {
            trigger: el,
            start: "top 85%",
            toggleActions: "play none none none",
          },
        });
      }
    }
  });
}

// ─── 3. Photo Reveal : masking reveal au scroll ─────────────────
function applyPhotoReveal() {
  const targets = document.querySelectorAll<HTMLElement>("[data-photo-reveal]");

  targets.forEach((el) => {
    if (el.dataset.photoRevealDone === "true") return;
    el.dataset.photoRevealDone = "true";

    if (reduceMotion) {
      gsap.set(el, { clipPath: "inset(0% 0% 0% 0%)", scale: 1, opacity: 1 });
      return;
    }

    gsap.set(el, {
      clipPath: "inset(100% 0% 0% 0%)",
      scale: 1.08,
      transformOrigin: "center center",
      willChange: "clip-path, transform",
    });

    gsap.to(el, {
      clipPath: "inset(0% 0% 0% 0%)",
      scale: 1,
      duration: 1.2,
      ease: "cubic-bezier(0.77, 0, 0.175, 1)",
      scrollTrigger: {
        trigger: el,
        start: "top 80%",
        toggleActions: "play none none none",
      },
    });
  });
}

// ─── 4. Parallax via ScrollTrigger scrub ──
function applyParallax() {
  if (reduceMotion || isMobile) return;
  const targets = document.querySelectorAll<HTMLElement>("[data-parallax]");

  targets.forEach((el) => {
    const distance = parseFloat(el.dataset.parallax || "0");
    if (!distance) return;

    gsap.fromTo(
      el,
      { y: -distance },
      {
        y: distance,
        ease: "none",
        scrollTrigger: {
          trigger: el,
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        },
      },
    );
  });
}

// ─── Init après DOM ready ────────────────────────────────────────
const init = () => {
  applySplitText();
  applyPhotoReveal();
  applyParallax();
  ScrollTrigger.refresh();
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}

window.addEventListener("load", () => {
  ScrollTrigger.refresh();
});

// Expose pour inspection (ScrollSmoother retiré, conservé pour compat)
(window as any).__swsmSmoother = null;
