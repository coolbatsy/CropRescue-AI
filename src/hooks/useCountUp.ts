import { useState, useEffect } from 'react';

export function useCountUp(target: number, duration: number = 1000, startOnMount: boolean = true): number {
  const [count, setCount] = useState<number>(0);

  useEffect(() => {
    if (!startOnMount || isNaN(target) || target <= 0) {
      setCount(target);
      return;
    }

    let start = 0;
    const end = target;
    const startTime = performance.now();

    const updateCount = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // easeOutExpo
      const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const current = Math.floor(easeProgress * (end - start) + start);

      setCount(current);

      if (progress < 1) {
        requestAnimationFrame(updateCount);
      } else {
        setCount(end);
      }
    };

    const frameId = requestAnimationFrame(updateCount);
    return () => cancelAnimationFrame(frameId);
  }, [target, duration, startOnMount]);

  return count;
}
