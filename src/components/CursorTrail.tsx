import React, { useEffect, useState } from 'react';

interface Particle {
  id: number;
  x: number;
  y: number;
  color: string;
}

export const CursorTrail: React.FC = () => {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    // Only enable on desktop pointer devices, not touch
    if (window.matchMedia('(pointer: fine)').matches && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setEnabled(true);
    }
  }, []);

  useEffect(() => {
    if (!enabled) return;

    let idCounter = 0;
    const colors = ['#22C55E', '#A3E635', '#166534'];

    const handleMouseMove = (e: MouseEvent) => {
      // Throttle creation
      if (Math.random() > 0.4) return;

      const newParticle: Particle = {
        id: ++idCounter,
        x: e.clientX,
        y: e.clientY,
        color: colors[idCounter % colors.length],
      };

      setParticles((prev) => [...prev.slice(-12), newParticle]);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    const cleanupInterval = setInterval(() => {
      setParticles((prev) => (prev.length > 0 ? prev.slice(1) : prev));
    }, 120);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      clearInterval(cleanupInterval);
    };
  }, [enabled]);

  if (!enabled || particles.length === 0) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden select-none">
      {particles.map((p) => (
        <span
          key={p.id}
          className="absolute w-1.5 h-1.5 rounded-full opacity-60 animate-ping"
          style={{
            left: `${p.x}px`,
            top: `${p.y}px`,
            backgroundColor: p.color,
            transition: 'opacity 0.4s ease-out, transform 0.4s ease-out',
          }}
        />
      ))}
    </div>
  );
};
