import { stagger, type Variants } from 'motion/react';

export const cinematicEase = [0.16, 1, 0.3, 1] as const;
export const travelEase = [0.45, 0.05, 0.25, 1] as const;

export const motionTiming = {
  opening: 1.15,
  travel: 1.2,
  arrival: 0.38,
  reveal: 0.78,
  stagger: 0.1,
} as const;

export const revealGroup: Variants = {
  hidden: {},
  visible: { transition: { delayChildren: stagger(motionTiming.stagger) } },
};

export const revealItem: Variants = {
  hidden: { opacity: 0, y: 38, filter: 'blur(8px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: motionTiming.reveal, ease: cinematicEase },
  },
};

export const slideReveal: Variants = {
  hidden: { opacity: 0, x: -34 },
  visible: (index = 0) => ({
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.68,
      delay: index * 0.09,
      ease: cinematicEase,
    },
  }),
};

export function curvedTravel(
  from: { x: number; y: number },
  to: { x: number; y: number },
) {
  const bend = Math.max(5, Math.min(13, Math.abs(to.x - from.x) * 0.22));
  return {
    x: [`${from.x}%`, `${(from.x + to.x) / 2}%`, `${to.x}%`],
    y: [`${from.y}%`, `${Math.min(from.y, to.y) - bend}%`, `${to.y}%`],
    path: `M ${from.x} ${from.y} Q ${(from.x + to.x) / 2} ${Math.min(from.y, to.y) - bend} ${to.x} ${to.y}`,
  };
}
