"use client";
import { useEffect, useState } from "react";

export interface NextRace {
  lieu: string;
  departement?: string;
  organisateur?: string;
  date: string; // ISO date-only ex "2026-06-06"
  dateFin?: string;
  lienCompteRendu?: string;
}

interface Props {
  race: NextRace;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  ended: boolean;
}

function computeTimeLeft(targetIso: string): TimeLeft {
  // Cible : 8h00 le matin du jour de la course (heure de Paris approximée en UTC+2)
  const target = new Date(`${targetIso}T08:00:00+02:00`).getTime();
  const now = Date.now();
  const diff = target - now;
  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, ended: true };
  }
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
    ended: false,
  };
}

function formatWeekend(start: string, end?: string): string {
  const fmt = (iso: string) =>
    new Date(iso + "T12:00:00").toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  if (!end) return fmt(start);
  const ds = new Date(start);
  const de = new Date(end);
  if (ds.getMonth() === de.getMonth() && ds.getFullYear() === de.getFullYear()) {
    return `${ds.getDate()} → ${fmt(end)}`;
  }
  return `${fmt(start)} → ${fmt(end)}`;
}

export function RaceCountdown({ race }: Props) {
  const [t, setT] = useState<TimeLeft>(() => computeTimeLeft(race.date));

  useEffect(() => {
    const id = setInterval(() => setT(computeTimeLeft(race.date)), 1000);
    return () => clearInterval(id);
  }, [race.date]);

  const blocks: Array<{ value: number; label: string }> = [
    { value: t.days, label: "Jours" },
    { value: t.hours, label: "Heures" },
    { value: t.minutes, label: "Minutes" },
    { value: t.seconds, label: "Secondes" },
  ];

  return (
    <div className="relative w-full max-w-[1240px] mx-auto px-6 md:px-10 py-12 md:py-16 grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-10 items-center">
      {/* Colonne gauche : info manche */}
      <div className="md:col-span-5">
        <p className="text-[10px] md:text-xs uppercase tracking-[0.25em] font-display font-medium text-swsm-pink mb-3 flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-swsm-pink animate-[race-pulse_2s_ease-in-out_infinite]" />
          Prochaine manche
        </p>
        <h3 className="font-display font-bold text-swsm-white tracking-[-0.01em] leading-[1.05] text-3xl md:text-4xl lg:text-5xl mb-3">
          {race.lieu}
          {race.departement && (
            <span className="text-swsm-white/50 ml-2 text-2xl md:text-3xl">
              ({race.departement})
            </span>
          )}
        </h3>
        <p className="font-body text-sm md:text-base text-swsm-white/75 leading-relaxed">
          {formatWeekend(race.date, race.dateFin)}
          {race.organisateur && (
            <span className="text-swsm-white/55"> · {race.organisateur}</span>
          )}
        </p>
      </div>

      {/* Colonne droite : compte à rebours */}
      <div className="md:col-span-7">
        {t.ended ? (
          <p className="font-display font-bold text-swsm-pink text-2xl md:text-3xl text-center md:text-right">
            La course commence aujourd'hui.
          </p>
        ) : (
          <div className="grid grid-cols-4 gap-3 md:gap-4">
            {blocks.map((b, i) => (
              <div
                key={b.label}
                className="relative flex flex-col items-center justify-center bg-swsm-white/[0.04] border border-swsm-white/10 rounded-sm px-2 py-5 md:py-7 backdrop-blur-sm transition-colors duration-300 hover:border-swsm-pink/40"
              >
                <span
                  className="font-display font-bold text-swsm-white tracking-[-0.02em] leading-none text-4xl md:text-5xl lg:text-6xl tabular-nums"
                  aria-live={i === 3 ? "off" : undefined}
                >
                  {String(b.value).padStart(2, "0")}
                </span>
                <span className="mt-3 text-[9px] md:text-[10px] uppercase tracking-[0.25em] font-display font-medium text-swsm-white/60">
                  {b.label}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        @keyframes race-pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(236, 45, 124, 0.5); }
          50% { box-shadow: 0 0 0 8px rgba(236, 45, 124, 0); }
        }
      `}</style>
    </div>
  );
}
