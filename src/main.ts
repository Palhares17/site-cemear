/**
 * CEMEAR — Main TypeScript Entry
 *
 * Sistema de movimento: uma única curva de easing para o site inteiro e um
 * único loop de animação (o rAF do GSAP). Nada de listener de scroll cru
 * disputando a thread principal.
 *
 * Sem overshoot em nenhum lugar: o CEMEAR trata vertigem e distúrbios do
 * equilíbrio — movimento elástico seria uma escolha errada para este público.
 */

import "./style.css";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import { CustomEase } from "gsap/CustomEase";

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin, CustomEase);

// Curva assinatura: saída longa e decidida, chega e assenta sem quicar.
CustomEase.create("cemear", "M0,0 C0.22,1 0.36,1 1,1");

gsap.defaults({ ease: "cemear", duration: 0.9 });

// Evita refresh a cada aparecer/sumir da barra de endereço no mobile.
ScrollTrigger.config({ ignoreMobileResize: true });

/** Altura do header fixo — usada como respiro nas âncoras. */
const HEADER_OFFSET = 80;

const prefersReduced = (): boolean =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// ──────────────────────────────────────────────
// 1. Entrada do hero
// ──────────────────────────────────────────────
function initHero(): void {
  const elements = gsap.utils.toArray<HTMLElement>("#hero .gsap-reveal");
  if (!elements.length) return;

  gsap.set(elements, { opacity: 0, y: 34 });
  gsap.to(elements, {
    opacity: 1,
    y: 0,
    duration: 1.1,
    stagger: 0.09,
    delay: 0.15,
    clearProps: "willChange",
  });
}

// ──────────────────────────────────────────────
// 2. Revelação em ondas
//
// ScrollTrigger.batch agrupa o que entra na viewport junto, então uma fileira
// de cards escalona como um gesto só — em vez de um ScrollTrigger por elemento
// com atraso tirado da ordem do documento.
// ──────────────────────────────────────────────
function initReveals(): void {
  const reveals = gsap.utils
    .toArray<HTMLElement>(".gsap-reveal")
    .filter((el) => !el.closest("#hero"));
  if (!reveals.length) return;

  gsap.set(reveals, { opacity: 0, y: 32, willChange: "opacity, transform" });

  ScrollTrigger.batch(reveals, {
    start: "top 88%",
    once: true,
    interval: 0.08,
    batchMax: 6,
    onEnter: (batch) => {
      gsap.to(batch, {
        opacity: 1,
        y: 0,
        duration: 0.9,
        stagger: { each: 0.07, from: "start" },
        overwrite: true,
        onComplete: () => {
          gsap.set(batch, { willChange: "auto" });
        },
      });
    },
  });
}

// ──────────────────────────────────────────────
// 3. Atmosfera do hero (parallax das formas desfocadas)
//
// scrub com atraso: as camadas "alcançam" o scroll com folga, o que dá a
// sensação de profundidade sem colar no movimento do dedo.
// ──────────────────────────────────────────────
function initHeroAmbience(): void {
  const hero = document.getElementById("hero");
  if (!hero) return;

  const layers = gsap.utils.toArray<HTMLElement>("#hero .absolute > div");
  if (!layers.length) return;

  layers.forEach((layer, i) => {
    gsap.to(layer, {
      yPercent: 10 + i * 5,
      ease: "none",
      scrollTrigger: {
        trigger: hero,
        start: "top top",
        end: "bottom top",
        scrub: 0.8,
      },
    });
  });
}

// ──────────────────────────────────────────────
// 4. Header
//
// A pintura do fundo (cor + blur + sombra) vive num ::before que só transiciona
// opacidade — backdrop-filter não interpola de "ausente" para "presente", que
// era o motivo do header estalar ao rolar.
// ──────────────────────────────────────────────
function initHeader(): void {
  const header = document.getElementById("header");
  if (!header) return;

  const apply = (on: boolean): void => {
    header.classList.toggle("is-scrolled", on);
  };

  apply(window.scrollY > HEADER_OFFSET);

  ScrollTrigger.create({
    start: HEADER_OFFSET,
    end: "max",
    onToggle: (self) => apply(self.isActive),
  });
}

// ──────────────────────────────────────────────
// 5. Menu mobile
// ──────────────────────────────────────────────
function initMobileMenu(): void {
  const toggle = document.getElementById("mobile-toggle");
  const menu = document.getElementById("mobile-menu");
  if (!toggle || !menu) return;

  const links = menu.querySelectorAll<HTMLElement>(
    ".mobile-nav-link, .btn-primary",
  );
  let isOpen = false;
  let tl: gsap.core.Timeline | null = null;

  const setOpen = (next: boolean): void => {
    if (next === isOpen) return;
    isOpen = next;
    toggle.classList.toggle("hamburger-active", isOpen);
    toggle.setAttribute("aria-expanded", String(isOpen));
    toggle.setAttribute("aria-label", isOpen ? "Fechar menu" : "Abrir menu");
    tl?.kill();

    if (isOpen) {
      menu.classList.remove("hidden");
      if (prefersReduced()) {
        gsap.set([menu, links], { clearProps: "all" });
        return;
      }
      tl = gsap
        .timeline()
        .fromTo(
          menu,
          { height: 0, opacity: 0 },
          { height: "auto", opacity: 1, duration: 0.45 },
        )
        .fromTo(
          links,
          { opacity: 0, y: -8 },
          { opacity: 1, y: 0, duration: 0.4, stagger: 0.045 },
          "-=0.3",
        );
      return;
    }

    const close = (): void => {
      menu.classList.add("hidden");
      gsap.set(menu, { clearProps: "height,opacity" });
      gsap.set(links, { clearProps: "opacity,transform" });
    };

    if (prefersReduced()) {
      close();
      return;
    }
    tl = gsap
      .timeline({ onComplete: close })
      .to(links, { opacity: 0, y: -6, duration: 0.18, stagger: 0.02 })
      .to(menu, { height: 0, opacity: 0, duration: 0.3 }, "-=0.1");
  };

  toggle.addEventListener("click", () => setOpen(!isOpen));
  menu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => setOpen(false));
  });
}

// ──────────────────────────────────────────────
// 6. Âncoras
//
// Duração proporcional à distância (0.6s–1.4s). O scroll nativo levava vários
// segundos para percorrer a página inteira, sem forma de ajustar.
// ──────────────────────────────────────────────
function initSmoothScroll(): void {
  document
    .querySelectorAll<HTMLAnchorElement>('a[href^="#"]')
    .forEach((anchor) => {
      anchor.addEventListener("click", (e: Event) => {
        const href = anchor.getAttribute("href");
        if (!href || href === "#") return;
        const target = document.querySelector<HTMLElement>(href);
        if (!target) return;

        e.preventDefault();
        const top =
          target.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET;

        if (prefersReduced()) {
          window.scrollTo(0, top);
          return;
        }

        gsap.to(window, {
          duration: gsap.utils.clamp(
            0.6,
            1.4,
            Math.abs(top - window.scrollY) / 2400,
          ),
          scrollTo: { y: top, autoKill: true },
          overwrite: true,
        });
      });
    });
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
  const mediaHolder = modal.querySelector<HTMLElement>("#area-modal-media");
  const iconHolder = modal.querySelector<HTMLElement>("#area-modal-icon");
  const titleEl = modal.querySelector<HTMLElement>("#area-modal-title");
  const bodyEl = modal.querySelector<HTMLElement>("#area-modal-body");
  const closeBtn = modal.querySelector<HTMLElement>(".area-modal__close");
  if (!backdrop || !dialog || !mediaHolder || !titleEl || !bodyEl || !iconHolder)
    return;

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
    const titleText = title?.textContent?.trim() ?? "";
    titleEl.textContent = titleText;
    bodyEl.innerHTML = content ? content.innerHTML : "";

    // Mídia opcional: vídeo do YouTube ou imagem de destaque do card
    const videoId = trigger.dataset.areaVideo;
    const imageSrc = trigger.dataset.areaImage;
    if (videoId) {
      const frame = document.createElement("iframe");
      frame.src = `https://www.youtube.com/embed/${videoId}?rel=0`;
      frame.title = titleText;
      frame.loading = "lazy";
      frame.allow =
        "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
      frame.allowFullscreen = true;
      mediaHolder.replaceChildren(frame);
    } else if (imageSrc) {
      const img = document.createElement("img");
      img.src = imageSrc;
      img.alt = titleText;
      img.loading = "lazy";
      mediaHolder.replaceChildren(img);
    } else {
      mediaHolder.replaceChildren();
    }
    const hasMedia = Boolean(videoId || imageSrc);
    mediaHolder.classList.toggle("has-media", hasMedia);
    modal.classList.toggle("has-media", hasMedia);

    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    dialog.scrollTop = 0;
    closeBtn?.focus();

    if (prefersReduced()) {
      gsap.set([backdrop, dialog], { clearProps: "opacity,transform" });
      return;
    }

    tl?.kill();
    tl = gsap.timeline();
    tl.fromTo(backdrop, { opacity: 0 }, { opacity: 1, duration: 0.35 })
      .fromTo(
        dialog,
        { opacity: 0, y: 28, scale: 0.96 },
        { opacity: 1, y: 0, scale: 1, duration: 0.6 },
        "-=0.2",
      )
      .fromTo(
        [mediaHolder, iconHolder, titleEl, bodyEl],
        { opacity: 0, y: 14 },
        { opacity: 1, y: 0, duration: 0.45, stagger: 0.07 },
        "-=0.38",
      );
  };

  const closeModal = (): void => {
    if (!isOpen) return;
    isOpen = false;
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";

    const finish = (): void => {
      modal.classList.remove("is-open");
      // Remove o iframe/imagem para interromper a reprodução do vídeo
      mediaHolder.replaceChildren();
      mediaHolder.classList.remove("has-media");
      modal.classList.remove("has-media");
      lastFocused?.focus();
    };

    if (prefersReduced()) {
      finish();
      return;
    }

    tl?.kill();
    tl = gsap.timeline({ onComplete: finish });
    tl.to(dialog, {
      opacity: 0,
      y: 20,
      scale: 0.97,
      duration: 0.28,
      ease: "power2.in",
    }).to(
      backdrop,
      { opacity: 0, duration: 0.24, ease: "power1.in" },
      "-=0.18",
    );
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
  const mm = gsap.matchMedia();

  // Quem pede menos movimento recebe o conteúdo assentado, sem tween algum.
  mm.add("(prefers-reduced-motion: reduce)", () => {
    // Nenhum tween é criado neste ramo, então não há estilo inline do GSAP
    // para competir com o CSS. A classe assenta o conteúdo de imediato,
    // inclusive se a preferência mudar no meio da sessão (o matchMedia
    // reverte o ramo animado e este assume).
    document.documentElement.classList.add("motion-reduced");
    return () => document.documentElement.classList.remove("motion-reduced");
  });

  mm.add("(prefers-reduced-motion: no-preference)", () => {
    initHero();
    initReveals();
    initHeroAmbience();
  });

  initHeader();
  initMobileMenu();
  initSmoothScroll();
  initConversionTracking();
  initAreaModal();

  // Fontes e imagens mudam a altura da página: reposiciona os gatilhos depois
  // que o layout assenta, senão as revelações disparam fora do lugar.
  window.addEventListener("load", () => ScrollTrigger.refresh());
  document.fonts?.ready.then(() => ScrollTrigger.refresh());
});
