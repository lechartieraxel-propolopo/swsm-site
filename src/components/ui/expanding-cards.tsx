"use client";

import * as React from "react";

// Mini util cn — pas besoin de clsx/tailwind-merge pour ce simple cas
const cn = (...classes: (string | undefined | null | false)[]) =>
  classes.filter(Boolean).join(" ");

export type IconKey = "flag" | "calendar" | "trophy" | "target" | "zap";

export interface CardItem {
  id: string | number;
  title: string;
  description: string;
  imgSrc: string;
  /** ID d'icône intégrée OU JSX direct (utilisé en React-only) */
  icon: IconKey | React.ReactNode;
  linkHref?: string;
  badge?: string;
}

// Icônes inline (évite lucide-react)
const Icons: Record<IconKey, React.ReactNode> = {
  flag: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
      <line x1="4" y1="22" x2="4" y2="15" />
    </svg>
  ),
  calendar: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  ),
  trophy: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
      <path d="M4 22h16" />
      <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
      <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
      <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
    </svg>
  ),
  target: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  ),
  zap: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  ),
};

const resolveIcon = (icon: IconKey | React.ReactNode): React.ReactNode => {
  if (typeof icon === "string" && icon in Icons) {
    return Icons[icon as IconKey];
  }
  return icon as React.ReactNode;
};

interface ExpandingCardsProps extends React.HTMLAttributes<HTMLUListElement> {
  items: CardItem[];
  defaultActiveIndex?: number;
}

export const ExpandingCards = React.forwardRef<HTMLUListElement, ExpandingCardsProps>(
  ({ className, items, defaultActiveIndex = 0, ...props }, ref) => {
    const [activeIndex, setActiveIndex] = React.useState<number | null>(defaultActiveIndex);
    const [isDesktop, setIsDesktop] = React.useState(false);

    React.useEffect(() => {
      const handleResize = () => setIsDesktop(window.innerWidth >= 768);
      handleResize();
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }, []);

    const gridStyle = React.useMemo(() => {
      if (activeIndex === null) return {};
      if (isDesktop) {
        const columns = items
          .map((_, index) => (index === activeIndex ? "5fr" : "1fr"))
          .join(" ");
        return { gridTemplateColumns: columns };
      } else {
        const rows = items
          .map((_, index) => (index === activeIndex ? "5fr" : "1fr"))
          .join(" ");
        return { gridTemplateRows: rows };
      }
    }, [activeIndex, items, isDesktop]);

    const handleInteraction = (index: number) => setActiveIndex(index);

    return (
      <ul
        ref={ref}
        className={cn(
          "w-full max-w-[1240px] gap-2 grid",
          "h-[600px] md:h-[480px]",
          "transition-[grid-template-columns,grid-template-rows] duration-500 ease-out",
          className,
        )}
        style={{
          ...gridStyle,
          ...(isDesktop ? { gridTemplateRows: "1fr" } : { gridTemplateColumns: "1fr" }),
        }}
        {...props}
      >
        {items.map((item, index) => {
          const Wrapper: React.ElementType = item.linkHref ? "a" : "div";
          const wrapperProps = item.linkHref ? { href: item.linkHref } : {};
          return (
            <li
              key={item.id}
              className={cn(
                "group relative cursor-pointer overflow-hidden rounded-md border border-swsm-black/10 bg-swsm-black/5 shadow-sm",
                "md:min-w-[80px]",
                "min-h-0 min-w-0",
              )}
              onMouseEnter={() => handleInteraction(index)}
              onFocus={() => handleInteraction(index)}
              onClick={() => handleInteraction(index)}
              tabIndex={0}
              data-active={activeIndex === index}
            >
              <Wrapper
                {...wrapperProps}
                className="block h-full w-full"
                aria-label={item.linkHref ? `Voir ${item.title}` : item.title}
              >
                <img
                  src={item.imgSrc}
                  alt={item.title}
                  className="absolute inset-0 h-full w-full object-cover transition-all duration-500 ease-out scale-110 grayscale group-data-[active=true]:scale-100 group-data-[active=true]:grayscale-0"
                  draggable={false}
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-swsm-black/90 via-swsm-black/45 to-transparent" />

                <article className="absolute inset-0 flex flex-col justify-end gap-2 p-4 md:p-5">
                  {/* Titre tourné à 90° quand inactif (desktop only) */}
                  <h3 className="hidden origin-left rotate-90 text-[10px] uppercase tracking-[0.2em] font-display font-medium text-swsm-white/85 opacity-100 transition-all duration-300 ease-out md:block group-data-[active=true]:opacity-0 whitespace-nowrap">
                    {item.title}
                  </h3>

                  {/* Bloc actif : icon + badge + titre + description */}
                  <div className="text-swsm-pink opacity-0 transition-all duration-300 delay-75 ease-out group-data-[active=true]:opacity-100">
                    {resolveIcon(item.icon)}
                  </div>

                  {item.badge && (
                    <span className="inline-block w-fit px-2.5 py-1 bg-swsm-white/10 backdrop-blur-sm border border-swsm-white/20 text-[9px] uppercase tracking-[0.18em] font-display font-medium text-swsm-white/90 opacity-0 transition-all duration-300 delay-100 ease-out group-data-[active=true]:opacity-100 rounded-full">
                      {item.badge}
                    </span>
                  )}

                  <h3 className="font-display font-bold text-2xl md:text-3xl text-swsm-white tracking-[-0.01em] opacity-0 transition-all duration-300 delay-150 ease-out group-data-[active=true]:opacity-100">
                    {item.title}
                  </h3>

                  <p className="w-full max-w-md font-body text-sm md:text-base text-swsm-white/85 leading-relaxed opacity-0 transition-all duration-300 delay-225 ease-out group-data-[active=true]:opacity-100">
                    {item.description}
                  </p>

                  {item.linkHref && (
                    <span className="inline-flex items-center gap-2 mt-2 text-[10px] md:text-xs uppercase tracking-[0.18em] font-display font-bold text-swsm-pink opacity-0 transition-all duration-300 delay-300 ease-out group-data-[active=true]:opacity-100">
                      Lire le compte rendu
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M5 12h14M12 5l7 7-7 7" />
                      </svg>
                    </span>
                  )}
                </article>
              </Wrapper>
            </li>
          );
        })}
      </ul>
    );
  },
);
ExpandingCards.displayName = "ExpandingCards";
