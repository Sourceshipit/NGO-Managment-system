import { useState, useEffect, useRef } from 'react';

/**
 * Animated count-up hook using requestAnimationFrame with easeOutExpo.
 *
 * @param target - The final number to count to
 * @param duration - Duration in ms (default 1200)
 * @param decimals - Number of decimal places (default 0)
 * @returns The current animated value as a formatted string
 */
export function useCountUp(target: number, duration: number = 1200, decimals: number = 0): string {
  const [value, setValue] = useState(0);
  const startRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);
  const prevTarget = useRef(target);

  useEffect(() => {
    // Reset if target changes significantly
    if (Math.abs(prevTarget.current - target) > 0.01) {
      startRef.current = null;
      prevTarget.current = target;
    }

    const easeOutExpo = (t: number): number => {
      return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
    };

    const animate = (timestamp: number) => {
      if (startRef.current === null) startRef.current = timestamp;
      const elapsed = timestamp - startRef.current;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeOutExpo(progress);

      setValue(easedProgress * target);

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      }
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [target, duration]);

  return decimals > 0 
    ? value.toFixed(decimals) 
    : Math.round(value).toLocaleString();
}

export default useCountUp;
