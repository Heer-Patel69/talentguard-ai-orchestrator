import { useCallback } from "react";
import confetti from "canvas-confetti";

export function useConfetti() {
  const fireConfetti = useCallback(() => {
    // Launch confetti from both sides
    const count = 200;
    const defaults = {
      origin: { y: 0.7 },
      zIndex: 9999,
    };

    function fire(particleRatio: number, opts: confetti.Options) {
      confetti({
        ...defaults,
        ...opts,
        particleCount: Math.floor(count * particleRatio),
      });
    }

    fire(0.25, {
      spread: 26,
      startVelocity: 55,
      origin: { x: 0.2, y: 0.7 },
    });

    fire(0.2, {
      spread: 60,
      origin: { x: 0.4, y: 0.7 },
    });

    fire(0.35, {
      spread: 100,
      decay: 0.91,
      scalar: 0.8,
      origin: { x: 0.6, y: 0.7 },
    });

    fire(0.1, {
      spread: 120,
      startVelocity: 25,
      decay: 0.92,
      scalar: 1.2,
      origin: { x: 0.8, y: 0.7 },
    });

    fire(0.1, {
      spread: 120,
      startVelocity: 45,
      origin: { x: 0.5, y: 0.7 },
    });
  }, []);

  const fireSuccess = useCallback(() => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#22c55e", "#16a34a", "#15803d"],
      zIndex: 9999,
    });
  }, []);

  const fireStars = useCallback(() => {
    const defaults = {
      spread: 360,
      ticks: 100,
      gravity: 0,
      decay: 0.94,
      startVelocity: 30,
      shapes: ["star"] as confetti.Shape[],
      colors: ["#FFE400", "#FFBD00", "#E89400", "#FFCA6C", "#FDFFB8"],
      zIndex: 9999,
    };

    function shoot() {
      confetti({
        ...defaults,
        particleCount: 40,
        scalar: 1.2,
        origin: { x: Math.random(), y: Math.random() * 0.5 },
      });

      confetti({
        ...defaults,
        particleCount: 10,
        scalar: 0.75,
        origin: { x: Math.random(), y: Math.random() * 0.5 },
      });
    }

    setTimeout(shoot, 0);
    setTimeout(shoot, 100);
    setTimeout(shoot, 200);
  }, []);

  return { fireConfetti, fireSuccess, fireStars };
}

// Hook for shortlist celebration
export function useShortlistConfetti() {
  const { fireConfetti, fireStars } = useConfetti();

  const celebrate = useCallback(() => {
    fireConfetti();
    setTimeout(fireStars, 300);
  }, [fireConfetti, fireStars]);

  return celebrate;
}
