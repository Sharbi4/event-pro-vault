import { useCallback, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';

interface ConfettiOptions {
  particleCount?: number;
  spread?: number;
  origin?: { x: number; y: number };
  colors?: string[];
  startVelocity?: number;
  decay?: number;
  scalar?: number;
}

export function useConfetti() {
  const hasPlayed = useRef(false);

  const fire = useCallback((options: ConfettiOptions = {}) => {
    const defaults: ConfettiOptions = {
      particleCount: 100,
      spread: 70,
      origin: { x: 0.5, y: 0.6 },
      colors: ['#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#EC4899'],
      startVelocity: 30,
      decay: 0.94,
      scalar: 1,
    };

    confetti({
      ...defaults,
      ...options,
    });
  }, []);

  const fireCelebration = useCallback(() => {
    // First burst from the left
    fire({
      particleCount: 50,
      spread: 55,
      origin: { x: 0.2, y: 0.7 },
    });

    // Second burst from the right
    setTimeout(() => {
      fire({
        particleCount: 50,
        spread: 55,
        origin: { x: 0.8, y: 0.7 },
      });
    }, 150);

    // Final burst from the center
    setTimeout(() => {
      fire({
        particleCount: 80,
        spread: 100,
        origin: { x: 0.5, y: 0.6 },
        startVelocity: 45,
      });
    }, 300);
  }, [fire]);

  const fireOnce = useCallback(() => {
    if (!hasPlayed.current) {
      hasPlayed.current = true;
      fireCelebration();
    }
  }, [fireCelebration]);

  const reset = useCallback(() => {
    hasPlayed.current = false;
  }, []);

  return {
    fire,
    fireCelebration,
    fireOnce,
    reset,
  };
}

/**
 * Hook that automatically fires confetti on mount (once)
 */
export function useConfettiOnMount(enabled: boolean = true) {
  const { fireOnce } = useConfetti();

  useEffect(() => {
    if (enabled) {
      // Small delay to ensure the page has rendered
      const timer = setTimeout(() => {
        fireOnce();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [enabled, fireOnce]);
}
