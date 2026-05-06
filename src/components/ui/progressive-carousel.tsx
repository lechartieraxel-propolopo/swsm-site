"use client";
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  type ReactNode,
  type FC,
  Children,
  isValidElement,
} from "react";
import { motion, AnimatePresence } from "framer-motion";

const cn = (...c: (string | undefined | null | false)[]) => c.filter(Boolean).join(" ");

interface Ctx {
  active: string;
  progress: number;
  handleClick: (v: string) => void;
  vertical: boolean;
}

const ProgressSliderCtx = createContext<Ctx | undefined>(undefined);

export const useProgressSlider = (): Ctx => {
  const c = useContext(ProgressSliderCtx);
  if (!c) throw new Error("useProgressSlider must be inside <ProgressSlider>");
  return c;
};

interface ProgressSliderProps {
  children: ReactNode;
  duration?: number;
  fastDuration?: number;
  vertical?: boolean;
  activeSlider: string;
  className?: string;
}

export const ProgressSlider: FC<ProgressSliderProps> = ({
  children,
  duration = 5000,
  fastDuration = 400,
  vertical = false,
  activeSlider,
  className,
}) => {
  const [active, setActive] = useState(activeSlider);
  const [progress, setProgress] = useState(0);
  const [isFast, setIsFast] = useState(false);
  const frame = useRef(0);
  const firstFrameTime = useRef(performance.now());
  const target = useRef<string | null>(null);
  const [values, setValues] = useState<string[]>([]);

  useEffect(() => {
    const slot = Children.toArray(children).find(
      (c) => isValidElement(c) && (c as any).type === SliderContent,
    ) as any;
    if (slot) {
      const v = Children.toArray(slot.props.children).map(
        (c) => (c as any).props.value as string,
      );
      setValues(v);
    }
  }, [children]);

  useEffect(() => {
    if (values.length === 0) return;
    firstFrameTime.current = performance.now();
    const animate = (now: number) => {
      const dur = isFast ? fastDuration : duration;
      const t = (now - firstFrameTime.current) / dur;
      if (t <= 1) {
        setProgress(isFast ? progress + (100 - progress) * t : t * 100);
        frame.current = requestAnimationFrame(animate);
      } else {
        if (isFast) {
          setIsFast(false);
          if (target.current) {
            setActive(target.current);
            target.current = null;
          }
        } else {
          const i = values.indexOf(active);
          setActive(values[(i + 1) % values.length]);
        }
        setProgress(0);
        firstFrameTime.current = performance.now();
      }
    };
    frame.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame.current);
  }, [values, active, isFast]);

  const handleClick = (v: string) => {
    if (v === active) return;
    target.current = v;
    setIsFast(true);
    firstFrameTime.current = performance.now();
  };

  return (
    <ProgressSliderCtx.Provider value={{ active, progress, handleClick, vertical }}>
      <div className={cn("relative", className)}>{children}</div>
    </ProgressSliderCtx.Provider>
  );
};

export const SliderContent: FC<{ children: ReactNode; className?: string }> = ({
  children,
  className,
}) => <div className={cn("", className)}>{children}</div>;

export const SliderWrapper: FC<{
  children: ReactNode;
  value: string;
  className?: string;
}> = ({ children, value, className }) => {
  const { active } = useProgressSlider();
  return (
    <AnimatePresence mode="popLayout">
      {active === value && (
        <motion.div
          key={value}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className={cn("", className)}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export const SliderBtnGroup: FC<{ children: ReactNode; className?: string }> = ({
  children,
  className,
}) => <div className={cn("", className)}>{children}</div>;

export const SliderBtn: FC<{
  children: ReactNode;
  value: string;
  className?: string;
  progressBarClass?: string;
}> = ({ children, value, className, progressBarClass }) => {
  const { active, progress, handleClick, vertical } = useProgressSlider();
  return (
    <button
      type="button"
      onClick={() => handleClick(value)}
      className={cn(
        "relative",
        active === value ? "opacity-100" : "opacity-50 hover:opacity-80",
        "transition-opacity",
        className,
      )}
    >
      {children}
      <div
        className="absolute inset-0 overflow-hidden -z-10 max-h-full max-w-full"
        role="progressbar"
        aria-valuenow={active === value ? progress : 0}
      >
        <span
          className={cn("absolute left-0 top-0", progressBarClass)}
          style={{
            [vertical ? "height" : "width"]: active === value ? `${progress}%` : "0%",
          }}
        />
      </div>
    </button>
  );
};
