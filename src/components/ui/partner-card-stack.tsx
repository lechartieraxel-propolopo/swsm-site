"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export interface Partner {
  id: string;
  nom: string;
  role: string;
  niveau: string;
  photo?: string;
  logo?: string;
  couleur?: string;
  logoTint?: "white" | "black";
}

interface PartnerCardStackProps {
  partners: Partner[];
}

const positionStyles = [
  { scale: 1, y: 16 },
  { scale: 0.95, y: -21 },
  { scale: 0.9, y: -57 },
];

const exitAnimation = {
  y: 470,
  scale: 1,
  zIndex: 10,
};

const enterAnimation = {
  y: -21,
  scale: 0.9,
};

interface StackItem {
  uid: number;
  partner: Partner;
}

function PartnerCard({ partner }: { partner: Partner }) {
  const initials = partner.nom
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const handleDetails = () => {
    window.dispatchEvent(new CustomEvent("partner:open", { detail: partner.id }));
  };

  // Filtre CSS appliqué au logo si on veut le tinter (pour logos PNG/JPG sans variante)
  const logoFilter =
    partner.logoTint === "white"
      ? "brightness(0) invert(1)"
      : partner.logoTint === "black"
        ? "brightness(0)"
        : "none";

  return (
    <div className="flex h-full w-full flex-col gap-4">
      {/* Vignette : fond coloré + logo centré */}
      <div
        className="relative flex h-[275px] w-full items-center justify-center overflow-hidden rounded-md outline outline-1 -outline-offset-1 outline-swsm-white/10"
        style={{ backgroundColor: partner.couleur || "#171717" }}
      >
        {partner.logo ? (
          <img
            src={partner.logo}
            alt={`${partner.nom} — logo`}
            className="max-h-[55%] max-w-[65%] select-none object-contain"
            style={{ filter: logoFilter }}
            draggable={false}
          />
        ) : (
          <span className="select-none font-display text-6xl font-bold text-swsm-white/30 tracking-tight">
            {initials}
          </span>
        )}
        <span className="absolute top-3 left-3 inline-block px-2.5 py-1 bg-swsm-black/70 backdrop-blur-sm border border-swsm-white/15 text-[9px] uppercase tracking-[0.15em] font-display font-medium text-swsm-pink">
          {partner.niveau}
        </span>
      </div>

      {/* Footer infos + bouton */}
      <div className="flex w-full items-center justify-between gap-3 px-3 pb-5">
        <div className="flex min-w-0 flex-1 flex-col">
          <span className="truncate font-display font-bold text-base text-swsm-white tracking-tight">
            {partner.nom}
          </span>
          <span className="truncate text-xs uppercase tracking-[0.12em] font-display font-medium text-swsm-white/55 mt-0.5">
            {partner.role}
          </span>
        </div>
        <button
          type="button"
          onClick={handleDetails}
          className="flex h-10 shrink-0 cursor-pointer select-none items-center gap-1 rounded-full bg-swsm-pink pl-4 pr-3 text-xs font-display font-bold uppercase tracking-[0.12em] text-swsm-white transition-all hover:opacity-90 active:scale-[0.97]"
          aria-label={`Voir les détails de ${partner.nom}`}
        >
          Détails
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="square"
            aria-hidden="true"
          >
            <path d="M9.5 18L15.5 12L9.5 6" />
          </svg>
        </button>
      </div>
    </div>
  );
}

function StackedCard({
  item,
  index,
}: {
  item: StackItem;
  index: number;
}) {
  const { scale, y } = positionStyles[index] ?? positionStyles[2];
  const zIndex = 3 - index;

  const exitAnim = index === 0 ? exitAnimation : undefined;
  const initialAnim = index === 2 ? enterAnimation : undefined;

  return (
    <motion.div
      initial={initialAnim}
      animate={{ y, scale }}
      exit={exitAnim}
      transition={{ type: "spring", duration: 1, bounce: 0 }}
      style={{
        zIndex,
        left: "50%",
        x: "-50%",
        bottom: 0,
      }}
      className="absolute flex h-[390px] w-[420px] items-center justify-center overflow-hidden rounded-t-md border-x border-t border-swsm-white/15 bg-[#171717] p-1.5 shadow-[0_-12px_40px_-10px_rgba(236,45,124,0.25)] will-change-transform sm:w-[665px]"
    >
      <PartnerCard partner={item.partner} />
    </motion.div>
  );
}

export default function PartnerCardStack({ partners }: PartnerCardStackProps) {
  const [stack, setStack] = useState<StackItem[]>(() =>
    partners.slice(0, 3).map((p, i) => ({ uid: i, partner: p })),
  );
  const [cursor, setCursor] = useState(3 % partners.length);
  const [counter, setCounter] = useState(3);

  const handleNext = () => {
    if (partners.length === 0) return;
    const nextPartner = partners[cursor];
    setStack((prev) => [...prev.slice(1), { uid: counter, partner: nextPartner }]);
    setCursor((c) => (c + 1) % partners.length);
    setCounter((c) => c + 1);
  };

  return (
    <div className="flex w-full flex-col items-center justify-center pt-2">
      <div className="relative h-[520px] w-full overflow-hidden sm:w-[836px] max-w-full">
        <AnimatePresence initial={false}>
          {stack.map((item, index) => (
            <StackedCard key={item.uid} item={item} index={index} />
          ))}
        </AnimatePresence>
      </div>

      <div className="relative z-10 -mt-px flex w-full items-center justify-center border-t border-swsm-white/15 py-4">
        <button
          type="button"
          onClick={handleNext}
          className="flex h-10 cursor-pointer select-none items-center justify-center gap-2 overflow-hidden rounded-full border border-swsm-white/20 bg-swsm-white/[0.03] px-5 font-display font-medium text-xs uppercase tracking-[0.15em] text-swsm-white transition-all hover:bg-swsm-white/[0.08] hover:border-swsm-white/40 active:scale-[0.98]"
          aria-label="Partenaire suivant"
        >
          Suivant
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}
