"use client";

import { useRef } from "react";
import {
  gsap,
  prefersReducedMotion,
  registerLandingMotion,
  useGSAP,
} from "./landing-motion";

registerLandingMotion();

/** Reveal suave ao entrar no viewport (uma vez). */
export function useLandingReveal(selector = "[data-reveal]", stagger = 0.08) {
  const ref = useRef<HTMLElement | null>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const root = ref.current;
      if (!root) return;

      const targets = root.querySelectorAll(selector);
      if (targets.length === 0) return;

      gsap.from(targets, {
        opacity: 0,
        y: 28,
        duration: 0.7,
        ease: "power2.out",
        stagger,
        immediateRender: false,
        scrollTrigger: {
          trigger: root,
          start: "top 80%",
          once: true,
          toggleActions: "play none none none",
        },
      });
    },
    { scope: ref },
  );

  return ref;
}
