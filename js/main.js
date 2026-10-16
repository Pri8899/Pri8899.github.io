/* ══════════════════════════════════════════════════════════════
   Partho Paul — macOS-Themed Portfolio
   JavaScript: Animations, Typing, Dock, Scroll Reveals
   ══════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  // ── 1. Typing Animation ──────────────────────────────────
  const GREETING = "Hi, I'm Partho Paul";
  const SUBTITLE = "CS Undergrad @ AUST · Competitive Programmer · Builder";

  const greetingEl = document.getElementById('typed-greeting');
  const subtitleEl = document.getElementById('typed-subtitle');

  function typeText(el, text, speed, callback) {
    let i = 0;
    function tick() {
      if (i <= text.length) {
        el.textContent = text.slice(0, i);
        i++;
        setTimeout(tick, speed);
      } else if (callback) {
        callback();
      }
    }
    tick();
  }

  // Start typing after a short delay
  setTimeout(() => {
    typeText(greetingEl, GREETING, 50, () => {
      setTimeout(() => {
        typeText(subtitleEl, SUBTITLE, 25);
      }, 300);
    });
  }, 800);

  // ── 2. Scroll Reveal (Intersection Observer) ─────────────
  const revealElements = document.querySelectorAll('.reveal');

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const delay = parseInt(entry.target.dataset.delay || '0', 10);
          setTimeout(() => {
            entry.target.classList.add('revealed');
          }, delay);
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -60px 0px' }
  );

  revealElements.forEach((el) => revealObserver.observe(el));

  // ── 3. Animated Counters ─────────────────────────────────
  const counters = document.querySelectorAll('[data-count]');

  const counterObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          counterObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.3 }
  );

  counters.forEach((el) => counterObserver.observe(el));

  function animateCounter(el) {
    const target = parseFloat(el.dataset.count);
    const isFloat = target % 1 !== 0;
    const duration = 1500;
    const startTime = performance.now();

    function update(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = eased * target;

      if (isFloat) {
        el.textContent = current.toFixed(1);
      } else {
        el.textContent = Math.round(current);
      }

      if (progress < 1) {
        requestAnimationFrame(update);
      }
    }

    requestAnimationFrame(update);
  }

  // ── 4. Platform Bar Animation ────────────────────────────
  const platformBars = document.querySelectorAll('.platform-bar-fill');

  const barObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const width = entry.target.dataset.width;
          setTimeout(() => {
            entry.target.style.width = width + '%';
          }, 400);
          barObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.3 }
  );

  platformBars.forEach((bar) => barObserver.observe(bar));

  // ── 5. Menu Bar Scroll Effect ────────────────────────────
  const menubar = document.getElementById('menubar');

  window.addEventListener(
    'scroll',
    () => {
      if (window.scrollY > 20) {
        menubar.classList.add('scrolled');
      } else {
        menubar.classList.remove('scrolled');
      }
    },
    { passive: true }
  );

  // ── 6. Active Section Tracking (Menu & Dock) ─────────────
  const sections = document.querySelectorAll('.section');
  const menuLinks = document.querySelectorAll('.menu-link[data-section]');
  const dockItems = document.querySelectorAll('.dock-item[data-section]');

  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const sectionId = entry.target.id;

          // Update menu links
          menuLinks.forEach((link) => {
            link.classList.toggle('active', link.dataset.section === sectionId);
          });

          // Update dock items
          dockItems.forEach((item) => {
            item.classList.toggle('active', item.dataset.section === sectionId);
          });
        }
      });
    },
    { threshold: 0.3, rootMargin: '-36px 0px -40% 0px' }
  );

  sections.forEach((section) => sectionObserver.observe(section));

  // ── 7. Smooth Scroll for Navigation Links ────────────────
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const href = anchor.getAttribute('href');
      if (href === '#') return;

      e.preventDefault();
      const target = document.querySelector(href);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // ── 8. Dock Magnification (Mouse Proximity) ──────────────
  const dock = document.getElementById('dock');
  const dockContainer = dock.querySelector('.dock-container');
  const allDockItems = dock.querySelectorAll('.dock-item');

  dockContainer.addEventListener('mousemove', (e) => {
    const containerRect = dockContainer.getBoundingClientRect();

    allDockItems.forEach((item) => {
      const itemRect = item.getBoundingClientRect();
      const itemCenterX = itemRect.left + itemRect.width / 2;
      const distance = Math.abs(e.clientX - itemCenterX);
      const maxDist = 100;

      if (distance < maxDist) {
        const scale = 1 + 0.4 * (1 - distance / maxDist);
        const translateY = -8 * (1 - distance / maxDist);
        item.style.transform = `scale(${scale}) translateY(${translateY}px)`;
      } else {
        item.style.transform = '';
      }
    });
  });

  dockContainer.addEventListener('mouseleave', () => {
    allDockItems.forEach((item) => {
      item.style.transform = '';
    });
  });

  // ── 9. Hide Scroll Indicator on Scroll ───────────────────
  const scrollIndicator = document.querySelector('.scroll-indicator');
  if (scrollIndicator) {
    let hidden = false;
    window.addEventListener(
      'scroll',
      () => {
        if (!hidden && window.scrollY > 100) {
          scrollIndicator.style.opacity = '0';
          scrollIndicator.style.transform = 'translateX(-50%) translateY(20px)';
          hidden = true;
        }
      },
      { passive: true }
    );
  }

  // ── 10. Preload Optimization ─────────────────────────────
  // Mark page as loaded for any CSS transitions gated on load
  window.addEventListener('load', () => {
    document.body.classList.add('loaded');
  });
})();
