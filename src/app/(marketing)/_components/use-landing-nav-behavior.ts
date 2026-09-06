"use client";

import { useEffect, useRef, useState } from "react";

export const LANDING_NAV_LINKS = [
  { href: "#produto", label: "Produto" },
  { href: "#como-funciona", label: "Como funciona" },
  { href: "#planos", label: "Planos" },
] as const;

const MIN_WIDTH = 640;
const MAX_SCROLL = 1000;

export function useLandingNavBehavior() {
  const navRef = useRef<HTMLElement>(null);
  const [activeHref, setActiveHref] = useState("#produto");

  const updateNav = (scrollY: number) => {
    const nav = navRef.current;
    if (!nav) return;

    if (window.innerWidth < 768) {
      nav.style.width = "100%";
      nav.dataset.scrolling = scrollY > 0 ? "true" : "false";
      return;
    }

    if (scrollY > 0) {
      nav.dataset.scrolling = "true";
      const progress = Math.min(scrollY / MAX_SCROLL, 1);
      const eased = 1 - (1 - progress) ** 4;
      const maxWidth = window.innerWidth * 0.8;
      nav.style.width = `${maxWidth - (maxWidth - MIN_WIDTH) * eased}px`;
    } else {
      nav.dataset.scrolling = "false";
      nav.style.width = "80%";
    }
  };

  useEffect(() => {
    const onScroll = () => updateNav(window.scrollY);
    updateNav(window.scrollY);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  useEffect(() => {
    const sections = LANDING_NAV_LINKS.map((link) =>
      document.getElementById(link.href.slice(1)),
    ).filter((el): el is HTMLElement => Boolean(el));

    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const id = entry.target.getAttribute("id");
          if (id) setActiveHref(`#${id}`);
        });
      },
      { threshold: 0.35, rootMargin: "-12% 0px -45% 0px" },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  const onNavClick = (
    event: React.MouseEvent<HTMLAnchorElement>,
    href: string,
  ) => {
    if (href === "#top") {
      event.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    const target = document.getElementById(href.slice(1));
    if (!target) return;

    event.preventDefault();
    const offset = window.innerWidth < 768 ? -72 : -24;
    const top = target.getBoundingClientRect().top + window.scrollY + offset;
    window.scrollTo({ top, behavior: "smooth" });
    setActiveHref(href);
  };

  return { navRef, activeHref, onNavClick };
}
