import { Variants } from "framer-motion";

export const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

export const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

export const prizeCardVariants: Variants = {
  hidden: { opacity: 0, scale: 0.9, rotateX: -10 },
  visible: {
    opacity: 1,
    scale: 1,
    rotateX: 0,
    transition: { duration: 0.6, ease: [0.34, 1.56, 0.64, 1] },
  },
  hover: {
    scale: 1.03,
    rotateY: 2,
    transition: { duration: 0.2, ease: "easeOut" },
  },
};

export const drawButtonVariants = {
  idle: {
    scale: 1,
    boxShadow: "0 0 20px rgba(59, 130, 246, 0.3)",
  },
  hover: {
    scale: 1.05,
    boxShadow: "0 0 30px rgba(59, 130, 246, 0.5)",
    transition: { duration: 0.2 },
  },
  tap: {
    scale: 0.97,
  },
  drawing: {
    scale: [1, 1.1, 1],
    transition: { duration: 0.3, repeat: Infinity },
  },
};

export const tableRowVariants: Variants = {
  hidden: { opacity: 0, x: -20 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: { duration: 0.4, delay: i * 0.05, ease: "easeOut" },
  }),
};

export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.34, 1.56, 0.64, 1] },
  },
};

export const numberReveal: Variants = {
  hidden: {
    opacity: 0,
    scale: 2,
    rotateY: 180,
  },
  visible: {
    opacity: 1,
    scale: 1,
    rotateY: 0,
    transition: {
      duration: 0.8,
      type: "spring",
      stiffness: 100,
      damping: 15,
    },
  },
};

export const sparkleVariants: Variants = {
  hidden: { opacity: 0, scale: 0 },
  visible: (i: number) => ({
    opacity: [0, 1, 0],
    scale: [0, 1, 0],
    transition: {
      duration: 1,
      delay: i * 0.1,
      repeat: Infinity,
      repeatDelay: 2,
    },
  }),
};

export const particleVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0,
    x: 0,
    y: 0,
  },
  visible: (i: number) => ({
    opacity: [0, 1, 0],
    scale: [0, 1, 0],
    x: Math.cos(i * 30) * 50,
    y: Math.sin(i * 30) * 50,
    transition: {
      duration: 1.5,
      delay: i * 0.05,
      ease: "easeOut",
    },
  }),
};

export const reducedMotion = {
  container: {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
  },
  item: {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  },
};

export function getVariants(useReducedMotion: boolean) {
  return useReducedMotion ? reducedMotion : { container: containerVariants, item: itemVariants };
}
