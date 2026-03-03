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
// Initialize everything on DOM ready
// ──────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  initHeroAnimation();
  initScrollAnimations();
  initHeaderBehavior();
  initMobileMenu();
  initSmoothScroll();
  initParallax();
});
