// =============================================
// TALENTGUARD AI: CENTRALIZED ANIMATION PRESETS
// =============================================

import { Variants, Transition } from "framer-motion";

// Timing Functions
export const easings = {
  spring: [0.34, 1.56, 0.64, 1] as const,
  smooth: [0.25, 0.1, 0.25, 1] as const,
  bounce: [0.68, -0.55, 0.265, 1.55] as const,
  easeOut: [0, 0, 0.2, 1] as const,
  easeIn: [0.4, 0, 1, 1] as const,
};

// Base Transitions
export const transitions = {
  fast: { duration: 0.15, ease: easings.smooth } as Transition,
  normal: { duration: 0.3, ease: easings.smooth } as Transition,
  slow: { duration: 0.5, ease: easings.smooth } as Transition,
  spring: { type: "spring", stiffness: 300, damping: 20 } as Transition,
  springBouncy: { type: "spring", stiffness: 400, damping: 15 } as Transition,
};

// =============================================
// FADE ANIMATIONS
// =============================================

export const fadeIn: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: transitions.normal },
  exit: { opacity: 0, transition: transitions.fast },
};

export const fadeInUp: Variants = {
  initial: { opacity: 0, y: 24, filter: "blur(4px)" },
  animate: { 
    opacity: 1, 
    y: 0, 
    filter: "blur(0px)",
    transition: { duration: 0.5, ease: easings.spring }
  },
  exit: { 
    opacity: 0, 
    y: -12, 
    filter: "blur(4px)",
    transition: transitions.fast 
  },
};

export const fadeInDown: Variants = {
  initial: { opacity: 0, y: -24, filter: "blur(4px)" },
  animate: { 
    opacity: 1, 
    y: 0, 
    filter: "blur(0px)",
    transition: { duration: 0.5, ease: easings.spring }
  },
  exit: { opacity: 0, y: 12, transition: transitions.fast },
};

export const fadeInLeft: Variants = {
  initial: { opacity: 0, x: -32 },
  animate: { 
    opacity: 1, 
    x: 0, 
    transition: { duration: 0.5, ease: easings.smooth }
  },
  exit: { opacity: 0, x: -16, transition: transitions.fast },
};

export const fadeInRight: Variants = {
  initial: { opacity: 0, x: 32 },
  animate: { 
    opacity: 1, 
    x: 0, 
    transition: { duration: 0.5, ease: easings.smooth }
  },
  exit: { opacity: 0, x: 16, transition: transitions.fast },
};

// =============================================
// SCALE ANIMATIONS
// =============================================

export const scaleIn: Variants = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { 
    opacity: 1, 
    scale: 1, 
    transition: { duration: 0.3, ease: easings.spring }
  },
  exit: { opacity: 0, scale: 0.95, transition: transitions.fast },
};

export const scaleInBounce: Variants = {
  initial: { opacity: 0, scale: 0.8 },
  animate: { 
    opacity: 1, 
    scale: 1, 
    transition: transitions.springBouncy
  },
  exit: { opacity: 0, scale: 0.9, transition: transitions.fast },
};

export const popIn: Variants = {
  initial: { opacity: 0, scale: 0.5 },
  animate: { 
    opacity: 1, 
    scale: 1, 
    transition: { 
      type: "spring", 
      stiffness: 500, 
      damping: 25 
    }
  },
  exit: { opacity: 0, scale: 0.5, transition: transitions.fast },
};

// =============================================
// SLIDE ANIMATIONS
// =============================================

export const slideUp: Variants = {
  initial: { opacity: 0, y: "100%" },
  animate: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.4, ease: easings.spring }
  },
  exit: { opacity: 0, y: "100%", transition: transitions.normal },
};

export const slideDown: Variants = {
  initial: { opacity: 0, y: "-100%" },
  animate: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.4, ease: easings.spring }
  },
  exit: { opacity: 0, y: "-100%", transition: transitions.normal },
};

export const slideLeft: Variants = {
  initial: { opacity: 0, x: "100%" },
  animate: { 
    opacity: 1, 
    x: 0, 
    transition: { duration: 0.4, ease: easings.spring }
  },
  exit: { opacity: 0, x: "-100%", transition: transitions.normal },
};

export const slideRight: Variants = {
  initial: { opacity: 0, x: "-100%" },
  animate: { 
    opacity: 1, 
    x: 0, 
    transition: { duration: 0.4, ease: easings.spring }
  },
  exit: { opacity: 0, x: "100%", transition: transitions.normal },
};

// =============================================
// STAGGER ANIMATIONS
// =============================================

export const staggerContainer: Variants = {
  initial: {},
  animate: { 
    transition: { 
      staggerChildren: 0.06, 
      delayChildren: 0.1 
    } 
  },
  exit: {
    transition: {
      staggerChildren: 0.03,
      staggerDirection: -1,
    }
  }
};

export const staggerContainerFast: Variants = {
  initial: {},
  animate: { 
    transition: { 
      staggerChildren: 0.03, 
      delayChildren: 0.05 
    } 
  },
};

export const staggerContainerSlow: Variants = {
  initial: {},
  animate: { 
    transition: { 
      staggerChildren: 0.1, 
      delayChildren: 0.15 
    } 
  },
};

export const staggerItem: Variants = {
  initial: { opacity: 0, y: 16, scale: 0.97 },
  animate: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: { duration: 0.4, ease: easings.spring }
  },
  exit: { opacity: 0, y: -8, scale: 0.97, transition: transitions.fast },
};

export const staggerItemFade: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: transitions.normal },
  exit: { opacity: 0, transition: transitions.fast },
};

// =============================================
// PAGE TRANSITIONS
// =============================================

export const pageEnter: Variants = {
  initial: { opacity: 0, y: 12 },
  animate: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.35, ease: easings.smooth }
  },
  exit: { 
    opacity: 0, 
    y: -12, 
    transition: { duration: 0.25, ease: easings.easeIn }
  },
};

export const pageSlide: Variants = {
  initial: { opacity: 0, x: 20 },
  animate: { 
    opacity: 1, 
    x: 0, 
    transition: { duration: 0.4, ease: easings.spring }
  },
  exit: { 
    opacity: 0, 
    x: -20, 
    transition: { duration: 0.3, ease: easings.easeIn }
  },
};

// =============================================
// HOVER & INTERACTION EFFECTS
// =============================================

export const hoverLift = {
  whileHover: { 
    y: -4, 
    scale: 1.02, 
    transition: { duration: 0.2, ease: easings.spring } 
  },
  whileTap: { scale: 0.98 },
};

export const hoverScale = {
  whileHover: { scale: 1.05, transition: { duration: 0.2 } },
  whileTap: { scale: 0.95 },
};

export const hoverGlow = {
  whileHover: { 
    boxShadow: "0 0 30px -5px hsla(226,100%,64%,0.4)",
    transition: { duration: 0.3 }
  },
};

export const hoverRotate = {
  whileHover: { rotate: 5, transition: { duration: 0.2 } },
  whileTap: { rotate: 0 },
};

export const hoverPulse = {
  whileHover: {
    scale: [1, 1.02, 1],
    transition: { duration: 0.5, repeat: Infinity }
  },
};

export const tapBounce = {
  whileTap: { 
    scale: 0.9,
    transition: transitions.springBouncy
  },
};

// =============================================
// SKELETON & LOADING
// =============================================

export const skeleton: Variants = {
  initial: { opacity: 0.5 },
  animate: { 
    opacity: [0.5, 1, 0.5],
    transition: { duration: 1.5, repeat: Infinity, ease: "linear" }
  },
};

export const pulse: Variants = {
  initial: { opacity: 1 },
  animate: {
    opacity: [1, 0.5, 1],
    transition: { duration: 2, repeat: Infinity, ease: "easeInOut" }
  },
};

export const spin: Variants = {
  animate: {
    rotate: 360,
    transition: { duration: 1, repeat: Infinity, ease: "linear" }
  },
};

// =============================================
// SPECIAL EFFECTS
// =============================================

export const typewriter = {
  initial: { width: 0 },
  animate: { 
    width: "100%",
    transition: { duration: 2, ease: "steps(40)" }
  },
};

export const countUp = {
  initial: { opacity: 0, y: 20 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6, ease: easings.spring }
  },
};

export const ripple: Variants = {
  initial: { scale: 0, opacity: 0.5 },
  animate: { 
    scale: 4, 
    opacity: 0,
    transition: { duration: 0.6, ease: easings.easeOut }
  },
};

export const shake: Variants = {
  animate: {
    x: [-10, 10, -10, 10, 0],
    transition: { duration: 0.4 }
  },
};

export const wiggle: Variants = {
  animate: {
    rotate: [-3, 3, -3, 3, 0],
    transition: { duration: 0.3 }
  },
};

export const float: Variants = {
  animate: {
    y: [-10, 10, -10],
    transition: { duration: 6, repeat: Infinity, ease: "easeInOut" }
  },
};

export const glow: Variants = {
  animate: {
    boxShadow: [
      "0 0 20px -5px hsla(226, 100%, 64%, 0.3)",
      "0 0 40px -5px hsla(226, 100%, 64%, 0.5)",
      "0 0 20px -5px hsla(226, 100%, 64%, 0.3)",
    ],
    transition: { duration: 2, repeat: Infinity, ease: "easeInOut" }
  },
};

// =============================================
// UTILITY FUNCTIONS
// =============================================

export const getStaggerDelay = (index: number, base = 0.05) => ({
  transition: { delay: index * base }
});

export const getScrollTrigger = (amount = 0.3) => ({
  initial: "initial",
  whileInView: "animate",
  viewport: { once: true, amount }
});

export const createDelayed = (variants: Variants, delay: number): Variants => {
  const animateValue = variants.animate;
  const baseTransition = typeof animateValue === 'object' && animateValue !== null 
    ? (animateValue as Record<string, unknown>).transition 
    : {};
  
  return {
    ...variants,
    animate: {
      ...(typeof animateValue === 'object' ? animateValue : {}),
      transition: {
        ...(typeof baseTransition === 'object' ? baseTransition : {}),
        delay,
      }
    }
  };
};

// For reduced motion users
export const respectMotionPreference = (variants: Variants): Variants => {
  if (typeof window !== 'undefined' && 
      window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return {
      initial: {},
      animate: {},
      exit: {},
    };
  }
  return variants;
};

// Combined preset objects for easy spreading
export const motionPresets = {
  fadeIn,
  fadeInUp,
  fadeInDown,
  fadeInLeft,
  fadeInRight,
  scaleIn,
  scaleInBounce,
  popIn,
  slideUp,
  slideDown,
  slideLeft,
  slideRight,
  staggerContainer,
  staggerContainerFast,
  staggerContainerSlow,
  staggerItem,
  staggerItemFade,
  pageEnter,
  pageSlide,
  skeleton,
  pulse,
  spin,
  shake,
  wiggle,
  float,
  glow,
  ripple,
  countUp,
};

export const hoverPresets = {
  lift: hoverLift,
  scale: hoverScale,
  glow: hoverGlow,
  rotate: hoverRotate,
  pulse: hoverPulse,
  tapBounce,
};
