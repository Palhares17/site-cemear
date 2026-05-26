/**
 * CEMEAR — Main TypeScript Entry
 * GSAP scroll animations, navigation interactions, header behavior
 */

import "./style.css";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

// ──────────────────────────────────────────────
// 1. GSAP Scroll Reveal Animations
// ──────────────────────────────────────────────
function initScrollAnimations(): void {
  const reveals = document.querySelectorAll<HTMLElement>(".gsap-reveal");

  reveals.forEach((el, index) => {
    gsap.fromTo(
      el,
      { opacity: 0, y: 40 },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        delay: (index % 4) * 0.1, // Stagger within groups
        ease: "power3.out",
        scrollTrigger: {
          trigger: el,
          start: "top 88%",
          once: true,
        },
      },
    );
  });
}

// ──────────────────────────────────────────────
// 2. Hero-specific entrance animation
// ──────────────────────────────────────────────
function initHeroAnimation(): void {
  const heroElements = document.querySelectorAll("#hero .gsap-reveal");

  gsap.fromTo(
    heroElements,
    { opacity: 0, y: 50 },
    {
      opacity: 1,
      y: 0,
      duration: 1,
      stagger: 0.15,
      ease: "power3.out",
      delay: 0.3,
    },
  );
}

// ──────────────────────────────────────────────
// 3. Header scroll behavior (solid on scroll)
// ──────────────────────────────────────────────
function initHeaderBehavior(): void {
  const header = document.getElementById("header");
  if (!header) return;

  const updateHeader = () => {
    if (window.scrollY > 80) {
      header.classList.add("bg-white/95", "backdrop-blur-md", "shadow-sm");
      header.classList.remove("bg-white/0");
    } else {
      header.classList.remove("bg-white/95", "backdrop-blur-md", "shadow-sm");
      header.classList.add("bg-white/0");
    }
  };

  window.addEventListener("scroll", updateHeader, { passive: true });
  updateHeader();
}

// ──────────────────────────────────────────────
// 4. Mobile menu toggle
// ──────────────────────────────────────────────
function initMobileMenu(): void {
  const toggle = document.getElementById("mobile-toggle");
  const menu = document.getElementById("mobile-menu");
  if (!toggle || !menu) return;

  toggle.addEventListener("click", () => {
    const isOpen = !menu.classList.contains("hidden");
    menu.classList.toggle("hidden");
    toggle.classList.toggle("hamburger-active");

    if (!isOpen) {
      // Animate menu items in
      const links = menu.querySelectorAll(".mobile-nav-link, .btn-primary");
      gsap.fromTo(
        links,
        { opacity: 0, x: -20 },
        { opacity: 1, x: 0, duration: 0.3, stagger: 0.05, ease: "power2.out" },
      );
    }
  });

  // Close menu when a link is clicked
  const navLinks = menu.querySelectorAll("a");
  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      menu.classList.add("hidden");
      toggle.classList.remove("hamburger-active");
    });
  });
}

// ──────────────────────────────────────────────
// 5. Smooth scroll for anchor links
// ──────────────────────────────────────────────
function initSmoothScroll(): void {
  document
    .querySelectorAll<HTMLAnchorElement>('a[href^="#"]')
    .forEach((anchor) => {
      anchor.addEventListener("click", (e: Event) => {
        e.preventDefault();
        const target = document.querySelector(
          anchor.getAttribute("href") || "",
        );
        if (target) {
          target.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      });
    });
}

// ──────────────────────────────────────────────
// 6. Parallax subtle effect on hero decorations
// ──────────────────────────────────────────────
function initParallax(): void {
  const heroDecorations = document.querySelectorAll("#hero .absolute > div");

  window.addEventListener(
    "scroll",
    () => {
      const scrollY = window.scrollY;
      heroDecorations.forEach((dec, i) => {
        const speed = 0.15 + i * 0.05;
        (dec as HTMLElement).style.transform =
          `translateY(${scrollY * speed}px)`;
      });
    },
    { passive: true },
  );
}

// ──────────────────────────────────────────────
// 7. GA4 Conversion Tracking
// Dispara evento quando usuário clica em CTAs principais
// ──────────────────────────────────────────────
function initConversionTracking(): void {
  const ctaSelectors = [
    "#hero-cta",
    'a[href="#atendimento"]',
    'a[href="#contato"]',
    'a[href="#localizacao"]',
  ];

  ctaSelectors.forEach((selector) => {
    document.querySelectorAll<HTMLElement>(selector).forEach((el) => {
      el.addEventListener("click", () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const w = window as any;
        if (typeof w.gtag === "function") {
          w.gtag("event", "cta_click", {
            event_category: "engagement",
            event_label: el.textContent?.trim() ?? selector,
          });
        }
      });
    });
  });
}

// ──────────────────────────────────────────────
// 8. Modal "Áreas de atuação"
// Os cards <details> servem apenas como gatilhos: o clique no summary
// é interceptado (sem abrir o accordion nativo) e abre um pop-up
// elegante com animação fluida via GSAP timeline.
// ──────────────────────────────────────────────
function initAreaModal(): void {
  const triggers =
    document.querySelectorAll<HTMLDetailsElement>("details.area-trigger");
  const modal = document.getElementById("area-modal");
  if (!modal || triggers.length === 0) return;

  const backdrop = modal.querySelector<HTMLElement>(".area-modal__backdrop");
  const dialog = modal.querySelector<HTMLElement>(".area-modal__dialog");
  const iconHolder = modal.querySelector<HTMLElement>("#area-modal-icon");
  const titleEl = modal.querySelector<HTMLElement>("#area-modal-title");
  const bodyEl = modal.querySelector<HTMLElement>("#area-modal-body");
  const closeBtn = modal.querySelector<HTMLElement>(".area-modal__close");
  if (!backdrop || !dialog || !iconHolder || !titleEl || !bodyEl) return;

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  let lastFocused: HTMLElement | null = null;
  let isOpen = false;
  let tl: gsap.core.Timeline | null = null;

  const openModal = (trigger: HTMLElement): void => {
    lastFocused = trigger;
    isOpen = true;

    // Popula o conteúdo a partir do card clicado
    const icon = trigger.querySelector<HTMLElement>(".area-icon");
    const title = trigger.querySelector<HTMLElement>("h3");
    const content =
      trigger.querySelector<HTMLElement>("summary")?.nextElementSibling;
    iconHolder.innerHTML = icon ? icon.outerHTML : "";
    titleEl.textContent = title?.textContent?.trim() ?? "";
    bodyEl.innerHTML = content ? content.innerHTML : "";

    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    closeBtn?.focus();

    if (prefersReducedMotion) {
      gsap.set([backdrop, dialog], { clearProps: "opacity,transform" });
      return;
    }

    tl?.kill();
    tl = gsap.timeline();
    tl.fromTo(
      backdrop,
      { opacity: 0 },
      { opacity: 1, duration: 0.3, ease: "power1.out" },
    )
      .fromTo(
        dialog,
        { opacity: 0, y: 32, scale: 0.94 },
        { opacity: 1, y: 0, scale: 1, duration: 0.5, ease: "power3.out" },
        "-=0.15",
      )
      .fromTo(
        [iconHolder, titleEl, bodyEl],
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.4, stagger: 0.08, ease: "power2.out" },
        "-=0.3",
      );
  };

  const closeModal = (): void => {
    if (!isOpen) return;
    isOpen = false;
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";

    const finish = (): void => {
      modal.classList.remove("is-open");
      lastFocused?.focus();
    };

    if (prefersReducedMotion) {
      finish();
      return;
    }

    tl?.kill();
    tl = gsap.timeline({ onComplete: finish });
    tl.to(dialog, {
      opacity: 0,
      y: 24,
      scale: 0.96,
      duration: 0.3,
      ease: "power2.in",
    }).to(backdrop, { opacity: 0, duration: 0.25, ease: "power1.in" }, "-=0.2");
  };

  triggers.forEach((trigger) => {
    const summary = trigger.querySelector<HTMLElement>("summary");
    if (!summary) return;
    summary.addEventListener("click", (e: Event) => {
      e.preventDefault(); // impede o toggle nativo do <details>
      openModal(trigger);
    });
  });

  modal.querySelectorAll<HTMLElement>("[data-area-close]").forEach((el) => {
    el.addEventListener("click", closeModal);
  });

  document.addEventListener("keydown", (e: KeyboardEvent) => {
    if (e.key === "Escape" && isOpen) closeModal();
  });
}

// ──────────────────────────────────────────────
// Initialize everything on DOM ready
// ──────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  initHeroAnimation();
  initScrollAnimations();
  initHeaderBehavior();
  initMobileMenu();
  initSmoothScroll();
  initParallax();
  initConversionTracking();
  initAreaModal();
});
