/* ══════════════════════════════════════════════════════════════
   Partho Paul — Pro Workstation Developer Portfolio Scripts
   Zero-Race Telemetry Sync, Composited Motion, 3D Tilt & Terminal
   ══════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ── Helper: Safe HTML Escaping & Toast HUD ──────────────────
  function escapeHTML(str) {
    return String(str ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  let toastTimer = null;
  function showToast(message) {
    const toast = document.getElementById('toast-hud');
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toast.classList.remove('show');
    }, 2400);
  }

  async function copyEmailToClipboard() {
    const email = 'parthopaul8899@gmail.com';
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(email);
      } else {
        const tmp = document.createElement('textarea');
        tmp.value = email;
        tmp.style.position = 'fixed';
        tmp.style.opacity = '0';
        document.body.appendChild(tmp);
        tmp.select();
        document.execCommand('copy');
        document.body.removeChild(tmp);
      }
      showToast('Copied: parthopaul8899@gmail.com');
    } catch (e) {
      showToast('Email: parthopaul8899@gmail.com');
    }
  }

  // ── 0. Audio FX Synthesizer (Mechanical Key Switch) ─────────
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  let audioCtx = null;
  let soundEnabled = localStorage.getItem('pri_sound_fx') === 'true';

  function playKeyClick() {
    if (!soundEnabled || !AudioCtx) return;
    try {
      if (!audioCtx) audioCtx = new AudioCtx();
      if (audioCtx.state === 'suspended') audioCtx.resume();

      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      const now = audioCtx.currentTime;

      osc.frequency.setValueAtTime(185 + Math.random() * 85, now);
      osc.frequency.exponentialRampToValueAtTime(48, now + 0.035);

      gain.gain.setValueAtTime(0.055, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);

      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(now);
      osc.stop(now + 0.04);
    } catch (e) {}
  }

  const soundBtn = document.getElementById('sound-btn');
  const soundLabel = document.getElementById('sound-state-label');
  function updateSoundBtn() {
    if (!soundBtn) return;
    soundBtn.classList.toggle('sound-on', soundEnabled);
    soundBtn.setAttribute('title', `Mechanical Sound: ${soundEnabled ? 'ON' : 'OFF'}`);
    if (soundLabel) soundLabel.textContent = `FX: ${soundEnabled ? 'ON' : 'OFF'}`;
  }
  if (soundBtn) {
    updateSoundBtn();
    soundBtn.addEventListener('click', () => {
      soundEnabled = !soundEnabled;
      localStorage.setItem('pri_sound_fx', String(soundEnabled));
      updateSoundBtn();
      if (soundEnabled) playKeyClick();
      showToast(`Mechanical Audio FX: ${soundEnabled ? 'ON' : 'OFF'}`);
    });
  }

  // ── 1. Unified System Theme Engine ──────────────────────────
  const THEME_LABELS = {
    obsidian: 'Obsidian',
    daylight: 'Daylight',
    cobalt: 'Cobalt',
    espresso: 'Espresso',
    forest: 'Forest'
  };
  const THEME_META_BG = {
    obsidian: '#09090b',
    daylight: '#f3f3f6',
    cobalt: '#0a0f1c',
    espresso: '#110e0c',
    forest: '#090d0b'
  };
  const THEME_ALIASES = {
    default: 'obsidian',
    macos: 'obsidian',
    dark: 'obsidian',
    light: 'daylight',
    white: 'daylight',
    tokyo: 'obsidian',
    catppuccin: 'obsidian',
    matrix: 'obsidian',
    cyber: 'obsidian'
  };
  let canvasThemeSyncCb = null;

  function setTheme(themeName, silent = false) {
    const raw = (themeName || 'obsidian').toLowerCase().trim();
    const target = THEME_ALIASES[raw] || raw;
    const validThemes = ['obsidian', 'daylight', 'cobalt', 'espresso', 'forest'];

    if (!validThemes.includes(target)) {
      return `Unknown theme '${themeName}'. Available: obsidian, daylight, cobalt, espresso, forest`;
    }

    if (target === 'obsidian') {
      document.documentElement.removeAttribute('data-theme');
      localStorage.removeItem('pri_theme_v2');
    } else {
      document.documentElement.setAttribute('data-theme', target);
      localStorage.setItem('pri_theme_v2', target);
    }

    const metaTheme = document.querySelector('meta[name="theme-color"]');
    if (metaTheme) metaTheme.setAttribute('content', THEME_META_BG[target] || '#09090b');

    const labelEl = document.getElementById('theme-current-label');
    if (labelEl) labelEl.textContent = THEME_LABELS[target] || 'Obsidian';

    document.querySelectorAll('.theme-option').forEach((opt) => {
      opt.classList.toggle('active', opt.getAttribute('data-theme-choice') === target);
    });

    if (typeof canvasThemeSyncCb === 'function') {
      canvasThemeSyncCb();
    }
    if (!silent) {
      showToast(`Theme switched to ${THEME_LABELS[target]}`);
    }
    return `Theme switched to '${target}'.`;
  }

  localStorage.removeItem('pri_theme');
  const savedTheme = localStorage.getItem('pri_theme_v2');
  setTheme(savedTheme || 'obsidian', true);

  const themeBtn = document.getElementById('theme-btn');
  const themeDropdown = document.getElementById('theme-dropdown');
  if (themeBtn && themeDropdown) {
    themeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const willOpen = !themeDropdown.classList.contains('open');
      themeDropdown.classList.toggle('open', willOpen);
      themeBtn.setAttribute('aria-expanded', String(willOpen));
      playKeyClick();
    });

    themeDropdown.querySelectorAll('.theme-option').forEach((opt) => {
      opt.addEventListener('click', () => {
        const choice = opt.getAttribute('data-theme-choice');
        setTheme(choice);
        themeDropdown.classList.remove('open');
        themeBtn.setAttribute('aria-expanded', 'false');
        playKeyClick();
      });
    });

    document.addEventListener('click', (e) => {
      if (!themeDropdown.contains(e.target) && e.target !== themeBtn) {
        themeDropdown.classList.remove('open');
        themeBtn.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // ── 2. Live Menu Bar Clock & Footer Year ────────────────────
  function updateSystemClock() {
    const clockEl = document.getElementById('system-clock');
    if (!clockEl) return;

    const now = new Date();
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    let hours = now.getHours();
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;

    clockEl.textContent = `${days[now.getDay()]} ${months[now.getMonth()]} ${now.getDate()} ${hours}:${minutes} ${ampm}`;
  }
  updateSystemClock();
  setInterval(updateSystemClock, 15000);

  const yearEl = document.getElementById('current-year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  // ── 3. Info Desk Slide Controller ───────────────────────────
  const slideMap = {
    terminal: 0,
    about: 1,
    projects: 2,
    cp: 3,
    skills: 4,
    contact: 5
  };
  const slideKeys = ['terminal', 'about', 'projects', 'cp', 'skills', 'contact'];
  const slideTitles = [
    'TERMINAL & PROFILE',
    'ABOUT DEVELOPER',
    'PROJECTS EXPLORER',
    'CP ACTIVITY MONITOR',
    'TECH STACK & CS',
    'CONTACT & CONNECT'
  ];

  let currentSlideIndex = 0;
  const deskTrack = document.getElementById('desk-slider-track');
  const deskSlides = document.querySelectorAll('.desk-slide');
  const boxItems = document.querySelectorAll('.section-box-item');
  const glider = document.getElementById('section-glider');
  const deskCounter = document.getElementById('desk-counter');
  const deskDots = document.querySelectorAll('.desk-dot');
  const menuNavItems = document.querySelectorAll('.menubar-item[href^="#"]');
  const sliderViewport = document.getElementById('desk-slider-viewport');

  function updateGlider(activeItem) {
    if (!glider || !activeItem) return;
    const left = activeItem.offsetLeft;
    const width = activeItem.offsetWidth;
    glider.style.left = '0px';
    glider.style.width = `${width}px`;
    glider.style.transform = `translate3d(${left}px, 0, 0)`;
  }

  function resetAllCardTilts() {
    document.querySelectorAll('[data-tilt]').forEach((card) => {
      card.style.transform = '';
      card.style.transition = '';
    });
  }

  function goToSlide(targetIdx, { smoothScroll = false, updateHistory = true } = {}) {
    if (isNaN(targetIdx)) return;
    const index = ((targetIdx % 6) + 6) % 6;
    currentSlideIndex = index;

    if (deskTrack) {
      deskTrack.style.transform = `translate3d(-${(index * (100 / 6)).toFixed(4)}%, 0, 0)`;
    }
    if (sliderViewport && sliderViewport.scrollLeft !== 0) {
      sliderViewport.scrollLeft = 0;
    }

    deskSlides.forEach((s, i) => {
      const isActive = i === index;
      s.classList.toggle('active-slide', isActive);
      s.inert = !isActive;
      s.setAttribute('aria-hidden', String(!isActive));
    });

    resetAllCardTilts();

    boxItems.forEach((btn, i) => {
      const isActive = i === index;
      btn.classList.toggle('active', isActive);
      if (isActive) updateGlider(btn);
    });

    deskDots.forEach((dot, i) => {
      dot.classList.toggle('active', i === index);
    });

    menuNavItems.forEach((m) => {
      const targetKey = (m.getAttribute('href') || '').replace('#', '');
      m.classList.toggle('active', slideMap[targetKey] === index);
    });

    if (updateHistory && slideKeys[index] && !window.location.hash.startsWith('#' + slideKeys[index])) {
      history.replaceState(null, '', '#' + slideKeys[index]);
    }

    if (deskCounter) {
      deskCounter.textContent = `DESK 0${index + 1} / 06 · ${slideTitles[index]}`;
    }

    if (smoothScroll && sliderViewport) {
      const rect = sliderViewport.getBoundingClientRect();
      if (rect.top < 0 || rect.top > 280) {
        window.scrollTo({ top: Math.max(0, sliderViewport.offsetTop - 95), behavior: 'smooth' });
      }
    }
  }

  // Initial glider alignment after layout & fonts settle
  const alignGliderNow = () => {
    const active = boxItems[currentSlideIndex] || boxItems[0];
    if (active) updateGlider(active);
  };
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(alignGliderNow);
  }
  setTimeout(alignGliderNow, 100);
  window.addEventListener('resize', alignGliderNow, { passive: true });

  // Pill navigation: click is immediate; mouseenter uses a 60ms intent delay so sweeping corners stays jitter-free
  let hoverIntentTimer = null;
  boxItems.forEach((btn) => {
    btn.addEventListener('mouseenter', () => {
      clearTimeout(hoverIntentTimer);
      const idx = parseInt(btn.getAttribute('data-index'), 10);
      hoverIntentTimer = setTimeout(() => {
        if (idx !== currentSlideIndex) {
          goToSlide(idx, { smoothScroll: false, updateHistory: true });
        }
      }, 60);
    });
    btn.addEventListener('mouseleave', () => {
      clearTimeout(hoverIntentTimer);
    });
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      clearTimeout(hoverIntentTimer);
      const idx = parseInt(btn.getAttribute('data-index'), 10);
      goToSlide(idx, { smoothScroll: false, updateHistory: true });
      playKeyClick();
    });
  });

  deskDots.forEach((dot) => {
    dot.addEventListener('click', () => {
      const idx = parseInt(dot.getAttribute('data-index'), 10);
      goToSlide(idx, { smoothScroll: true, updateHistory: true });
      playKeyClick();
    });
  });

  // Single unified hash-link click router (eliminates double handler triggers!)
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const href = anchor.getAttribute('href');
      if (!href || href === '#') return;
      const targetKey = href.replace('#', '').toLowerCase();
      if (slideMap[targetKey] !== undefined) {
        e.preventDefault();
        goToSlide(slideMap[targetKey], { smoothScroll: true, updateHistory: true });
        playKeyClick();
      }
    });
  });

  function syncFromHash() {
    if (window.location.hash) {
      const fullHash = window.location.hash.replace('#', '').toLowerCase();
      const targetKey = fullHash.split('/')[0];
      if (slideMap[targetKey] !== undefined) {
        goToSlide(slideMap[targetKey], { smoothScroll: false, updateHistory: false });
      }
    }
  }
  syncFromHash();

  const prevBtn = document.getElementById('desk-prev-btn');
  const nextBtn = document.getElementById('desk-next-btn');
  if (prevBtn) {
    prevBtn.addEventListener('click', (e) => {
      e.preventDefault();
      goToSlide(currentSlideIndex - 1);
      playKeyClick();
    });
  }
  if (nextBtn) {
    nextBtn.addEventListener('click', (e) => {
      e.preventDefault();
      goToSlide(currentSlideIndex + 1);
      playKeyClick();
    });
  }

  // Keyboard navigation
  window.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      if (spotlightOverlay && spotlightOverlay.classList.contains('open')) closeSpotlight();
      else openSpotlight();
      return;
    }

    if (e.key === 'Escape') {
      if (spotlightOverlay && spotlightOverlay.classList.contains('open')) {
        closeSpotlight();
        return;
      }
      if (themeDropdown && themeDropdown.classList.contains('open')) {
        themeDropdown.classList.remove('open');
        if (themeBtn) themeBtn.setAttribute('aria-expanded', 'false');
        return;
      }
    }

    const activeTag = document.activeElement ? document.activeElement.tagName : '';
    if (activeTag === 'INPUT' || activeTag === 'TEXTAREA') return;

    if (e.key === 'ArrowLeft') {
      goToSlide(currentSlideIndex - 1);
    } else if (e.key === 'ArrowRight') {
      goToSlide(currentSlideIndex + 1);
    } else if (!e.metaKey && !e.ctrlKey && !e.altKey && e.key >= '1' && e.key <= '6') {
      goToSlide(parseInt(e.key, 10) - 1);
    }
  });

  // Mobile Touch Swipe
  if (sliderViewport) {
    let touchStartX = 0;
    let touchStartY = 0;
    sliderViewport.addEventListener('touchstart', (e) => {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
    }, { passive: true });

    sliderViewport.addEventListener('touchend', (e) => {
      const dx = e.changedTouches[0].clientX - touchStartX;
      const dy = e.changedTouches[0].clientY - touchStartY;
      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.3) {
        if (dx < 0) goToSlide(currentSlideIndex + 1);
        else goToSlide(currentSlideIndex - 1);
      }
    }, { passive: true });
  }

  // ── 4. macOS Spotlight Search (⌘K / Ctrl+K) ─────────────────
  const spotlightBtn = document.getElementById('spotlight-btn');
  const spotlightOverlay = document.getElementById('spotlight-overlay');
  const spotlightInput = document.getElementById('spotlight-input');
  const spotlightResults = document.getElementById('spotlight-results');
  const spotlightEmpty = document.getElementById('spotlight-empty');
  let lastFocusedEl = null;

  function openSpotlight() {
    if (!spotlightOverlay) return;
    lastFocusedEl = document.activeElement;
    spotlightOverlay.inert = false;
    spotlightOverlay.setAttribute('aria-hidden', 'false');
    spotlightOverlay.classList.add('open');
    if (spotlightInput) {
      spotlightInput.value = '';
      filterSpotlight('');
      requestAnimationFrame(() => spotlightInput.focus());
    }
  }

  function closeSpotlight() {
    if (!spotlightOverlay) return;
    spotlightOverlay.classList.remove('open');
    spotlightOverlay.setAttribute('aria-hidden', 'true');
    spotlightOverlay.inert = true;
    if (lastFocusedEl && typeof lastFocusedEl.focus === 'function') {
      lastFocusedEl.focus();
    }
  }

  if (spotlightBtn) spotlightBtn.addEventListener('click', openSpotlight);
  if (spotlightOverlay) {
    spotlightOverlay.addEventListener('click', (e) => {
      if (e.target === spotlightOverlay) closeSpotlight();
    });
  }

  function filterSpotlight(query) {
    if (!spotlightResults) return;
    const items = Array.from(spotlightResults.querySelectorAll('.spotlight-item'));
    const q = query.toLowerCase().trim();
    const visibleItems = [];

    items.forEach((item) => {
      const match = !q || item.textContent.toLowerCase().includes(q);
      item.style.display = match ? 'flex' : 'none';
      item.classList.remove('selected');
      if (match) visibleItems.push(item);
    });

    if (visibleItems.length > 0) {
      visibleItems[0].classList.add('selected');
      if (spotlightEmpty) spotlightEmpty.style.display = 'none';
    } else if (spotlightEmpty) {
      spotlightEmpty.style.display = 'block';
    }
  }

  function handleSpotlightAction(action) {
    if (!action) return;
    closeSpotlight();
    if (action === 'action-view-lc') {
      goToSlide(slideMap.cp, { smoothScroll: true });
      setCPMode('lc', { playAudio: false });
    } else if (action === 'action-view-cf') {
      goToSlide(slideMap.cp, { smoothScroll: true });
      setCPMode('cf', { playAudio: false });
    } else if (action === 'action-view-cses') {
      goToSlide(slideMap.cp, { smoothScroll: true });
      setCPMode('cses', { playAudio: false });
    } else if (action === 'action-view-svg') {
      goToSlide(slideMap.cp, { smoothScroll: true });
      setCPMode('svg', { playAudio: false });
    } else if (action === 'action-copy-email') {
      copyEmailToClipboard();
    } else if (action.startsWith('theme:')) {
      setTheme(action.replace('theme:', ''));
    } else if (action.startsWith('#')) {
      const key = action.replace('#', '');
      if (key in slideMap) goToSlide(slideMap[key], { smoothScroll: true });
    }
    playKeyClick();
  }

  if (spotlightInput && spotlightResults) {
    spotlightInput.addEventListener('input', (e) => {
      filterSpotlight(e.target.value);
    });

    spotlightInput.addEventListener('keydown', (e) => {
      playKeyClick();
      const items = Array.from(spotlightResults.querySelectorAll('.spotlight-item')).filter(
        (i) => i.style.display !== 'none'
      );
      if (items.length === 0) return;

      const currentIndex = Math.max(0, items.findIndex((i) => i.classList.contains('selected')));

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        const nextIndex = (currentIndex + 1) % items.length;
        items.forEach((i) => i.classList.remove('selected'));
        items[nextIndex].classList.add('selected');
        items[nextIndex].scrollIntoView({ block: 'nearest' });
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        const prevIndex = (currentIndex - 1 + items.length) % items.length;
        items.forEach((i) => i.classList.remove('selected'));
        items[prevIndex].classList.add('selected');
        items[prevIndex].scrollIntoView({ block: 'nearest' });
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const active = items[currentIndex] || items[0];
        if (active) handleSpotlightAction(active.getAttribute('data-action'));
      }
    });

    spotlightResults.querySelectorAll('.spotlight-item').forEach((item) => {
      item.addEventListener('click', () => {
        handleSpotlightAction(item.getAttribute('data-action'));
      });
    });
  }

  // ── 5. Interactive Terminal Runner & Telemetry State ────────
  const termInput = document.getElementById('term-input');
  const termHistory = document.getElementById('term-history');
  const commandHistory = [];
  let historyIdx = -1;
  let matrixIntervalId = null;

  // Single Source of Truth State for all Portfolio CP Views & Terminal
  const cpState = {
    totalSolved: 159,
    streakDays: 54,
    accuracyPct: 38.1,
    totalSubmissions: 417,
    cfCount: 137,
    cfSubmissions: 239,
    cfAcCount: 141,
    cfRating: 953,
    cfMaxRating: 1001,
    cfRank: 'newbie',
    cfPeakDiff: 1300,
    cfPeakId: '25A',
    cfPeakName: 'IQ test',
    cfTopTag: 'Implementation (88 AC)',
    cfTopTagPct: 64.2,
    lcCount: 16,
    csesCount: 6,
    acCount: 0,
    tophCount: 0,
    lastSynced: 'Nov 26, 2026',
    langCppCount: 150,
    langJavaCount: 9,
    langCppPct: 94.3,
    langJavaPct: 5.7,
    cfSolves: [],
    lcSolves: [
      { platform: 'LC', id: '33', title: 'Search in Rotated Sorted Array', slug: 'search-in-rotated-sorted-array', diff: 'Medium', tags: ['Binary Search', 'Array'], time: 'Feb 24' },
      { platform: 'LC', id: '29', title: 'Divide Two Integers', slug: 'divide-two-integers', diff: 'Medium', tags: ['Math', 'Bit Manipulation'], time: 'Feb 24' },
      { platform: 'LC', id: '26', title: 'Remove Duplicates from Sorted Array', slug: 'remove-duplicates-from-sorted-array', diff: 'Easy', tags: ['Array', 'Two Pointers'], time: 'Feb 24' },
      { platform: 'LC', id: '9', title: 'Palindrome Number', slug: 'palindrome-number', diff: 'Easy', tags: ['Math'], time: 'Feb 24' },
      { platform: 'LC', id: '7', title: 'Reverse Integer', slug: 'reverse-integer', diff: 'Medium', tags: ['Math'], time: 'Feb 24' },
      { platform: 'LC', id: '4', title: 'Median of Two Sorted Arrays', slug: 'median-of-two-sorted-arrays', diff: 'Hard', tags: ['Binary Search', 'Divide and Conquer'], time: 'Feb 24' },
      { platform: 'LC', id: '1', title: 'Two Sum', slug: 'two-sum', diff: 'Easy', tags: ['Array', 'Hash Table'], time: 'Feb 24' },
      { platform: 'LC', id: '75', title: 'Sort Colors', slug: 'sort-colors', diff: 'Medium', tags: ['Array', 'Sorting'], time: 'Feb 10' },
      { platform: 'LC', id: '74', title: 'Search a 2D Matrix', slug: 'search-a-2d-matrix', diff: 'Medium', tags: ['Matrix', 'Binary Search'], time: 'Feb 10' },
      { platform: 'LC', id: '50', title: 'Pow(x, n)', slug: 'powx-n', diff: 'Medium', tags: ['Math', 'Recursion'], time: 'Feb 10' },
      { platform: 'LC', id: '69', title: 'Sqrt(x)', slug: 'sqrtx', diff: 'Easy', tags: ['Math', 'Binary Search'], time: 'Feb 10' },
      { platform: 'LC', id: '121', title: 'Best Time to Buy and Sell Stock', slug: 'best-time-to-buy-and-sell-stock', diff: 'Easy', tags: ['Dynamic Programming', 'Array'], time: 'Feb 10' },
      { platform: 'LC', id: '125', title: 'Valid Palindrome', slug: 'valid-palindrome', diff: 'Easy', tags: ['Two Pointers', 'String'], time: 'Feb 10' },
      { platform: 'LC', id: '81', title: 'Search in Rotated Sorted Array II', slug: 'search-in-rotated-sorted-array-ii', diff: 'Medium', tags: ['Binary Search', 'Array'], time: 'Feb 10' },
      { platform: 'LC', id: '2396', title: 'Strictly Palindromic Number', slug: 'strictly-palindromic-number', diff: 'Medium', tags: ['Math', 'Two Pointers'], time: 'Feb 10' },
      { platform: 'LC', id: '167', title: 'Two Sum II - Input Array Is Sorted', slug: 'two-sum-ii-input-array-is-sorted', diff: 'Medium', tags: ['Two Pointers', 'Binary Search'], time: 'Feb 10' }
    ],
    csesSolves: [
      { platform: 'CSES', id: '1068', title: 'Weird Algorithm', topic: 'Introductory Problems', diff: 'Introductory', tags: ['Introductory Problems'], time: 'Archive', path: '1068 - Weird Algorithm' },
      { platform: 'CSES', id: '1069', title: 'Repetitions', topic: 'Introductory Problems', diff: 'Introductory', tags: ['Introductory Problems'], time: 'Archive', path: '1069 - Repetitions' },
      { platform: 'CSES', id: '1070', title: 'Permutations', topic: 'Introductory Problems', diff: 'Introductory', tags: ['Introductory Problems'], time: 'Archive', path: '1070 - Permutations' },
      { platform: 'CSES', id: '1083', title: 'Missing Number', topic: 'Introductory Problems', diff: 'Introductory', tags: ['Introductory Problems'], time: 'Archive', path: '1083 - Missing Number' },
      { platform: 'CSES', id: '1094', title: 'Increasing Array', topic: 'Introductory Problems', diff: 'Introductory', tags: ['Introductory Problems'], time: 'Archive', path: '1094 - Increasing Array' },
      { platform: 'CSES', id: '1621', title: 'Distinct Numbers', topic: 'Sorting and Searching', diff: 'Sorting & Searching', tags: ['Sorting and Searching'], time: 'Archive', path: '1621 - Distinct Numbers' }
    ],
    combinedSolves: []
  };

  function runMatrixRain() {
    if (!termHistory) return;
    if (matrixIntervalId) {
      clearInterval(matrixIntervalId);
      matrixIntervalId = null;
    }

    const rainEl = document.createElement('pre');
    rainEl.style.color = '#00ff66';
    rainEl.style.fontFamily = 'var(--font-mono)';
    rainEl.style.fontSize = '11px';
    rainEl.style.lineHeight = '1.3';
    rainEl.style.textShadow = '0 0 8px #00ff66';
    rainEl.textContent = '01010101 MATRIX LINK INITIALIZED 01010101\n';
    termHistory.appendChild(rainEl);

    let frames = 0;
    const chars = '0101011001010123456789ABCDEF@#$%&*';
    matrixIntervalId = setInterval(() => {
      if (!rainEl.isConnected) {
        clearInterval(matrixIntervalId);
        matrixIntervalId = null;
        return;
      }
      let line = '';
      for (let i = 0; i < 48; i++) {
        line += chars[Math.floor(Math.random() * chars.length)];
      }
      rainEl.textContent += line + '\n';
      termHistory.scrollTop = termHistory.scrollHeight;
      frames++;
      if (frames >= 10) {
        clearInterval(matrixIntervalId);
        matrixIntervalId = null;
        rainEl.textContent += '\n[SYSTEM] Neural link calibrated. Type "theme obsidian" to restore.\n';
        setTheme('forest');
      }
    }, 95);
  }

  function buildNeofetchElement() {
    const wrap = document.createElement('div');
    wrap.className = 'term-neofetch';

    const crest = document.createElement('div');
    crest.className = 'term-nf-crest';
    const mono = document.createElement('div');
    mono.className = 'term-nf-monogram';
    mono.textContent = 'PRI // 8899';
    const sub = document.createElement('div');
    sub.className = 'term-nf-sub';
    sub.textContent = "AUST CSE '54";
    const swatches = document.createElement('div');
    swatches.className = 'term-nf-swatches';
    ['var(--accent-fill)', 'var(--accent-warm)', 'var(--cf-accent)', 'var(--accent-green)', 'var(--text-muted)'].forEach((col) => {
      const dot = document.createElement('span');
      dot.className = 'term-nf-swatch';
      dot.style.background = col;
      swatches.appendChild(dot);
    });
    crest.appendChild(mono);
    crest.appendChild(sub);
    crest.appendChild(swatches);

    const details = document.createElement('div');
    details.className = 'term-nf-details';
    const head = document.createElement('div');
    head.className = 'term-nf-head';
    head.textContent = `pri8899@aust.macOS · ${(document.documentElement.getAttribute('data-theme') || 'obsidian').toUpperCase()}`;

    const grid = document.createElement('div');
    grid.className = 'term-nf-grid';
    const rows = [
      ['Name', 'Partho Paul'],
      ['Degree', 'B.Sc. CSE Batch 54'],
      ['Academic', '2nd Year, 1st Sem'],
      ['Solved', `${cpState.totalSolved} (CF ${cpState.cfCount} · LC ${cpState.lcCount} · CSES ${cpState.csesCount})`],
      ['CF Rated', `${cpState.cfRating} (${cpState.cfRank} · max ${cpState.cfMaxRating})`],
      ['Streak', `${cpState.streakDays} Days Active`],
      ['Engines', 'Flutter · C++ · UE · Roblox']
    ];
    rows.forEach(([k, v]) => {
      const kEl = document.createElement('span');
      kEl.className = 'term-nf-k';
      kEl.textContent = k;
      const vEl = document.createElement('span');
      vEl.className = 'term-nf-v';
      vEl.textContent = v;
      grid.appendChild(kEl);
      grid.appendChild(vEl);
    });

    details.appendChild(head);
    details.appendChild(grid);
    wrap.appendChild(crest);
    wrap.appendChild(details);
    return wrap;
  }

  const terminalCommands = {
    help: () => `Available terminal commands:
  • neofetch     - System & developer workstation summary
  • projects     - Inspect featured software & bot projects
  • skills       - View languages, frameworks, & CS toolchain
  • cf / lc      - Open Codeforces or LeetCode live radar
  • cses / stats - View CSES & Unified CodeSync Pro metrics
  • theme <name> - Switch theme (obsidian, daylight, cobalt, espresso, forest)
  • sound        - Toggle mechanical keyboard audio FX (ON/OFF)
  • matrix       - Execute neural digital rain sequence
  • copy         - Copy email address to clipboard
  • whoami       - Partho Prithom Paul Sujoy (AUST CSE)
  • about        - Academic degree & student credentials
  • contact      - Reach out directly via email or GitHub
  • clear        - Clear terminal output`,

    neofetch: () => buildNeofetchElement(),

    whoami: () => `Partho Paul (Partho Prithom Paul Sujoy)
B.Sc. in Computer Science and Engineering · CSE Batch 54
Ahsanullah University of Science and Technology · 2nd Year, 1st Semester`,

    projects: () => {
      setTimeout(() => goToSlide(slideMap.projects), 220);
      return `Navigating to Projects Explorer...
[1] CodeSync Pro Extension (Chrome Manifest V3 · Monaco · GitHub API)
[2] BigOof (Node.js · discord.js v14 · SQLite · Codeforces API)
[3] CP — Algorithmic Archive (C++20 · DSA · Codeforces · LeetCode · CSES)`;
    },

    skills: () => {
      setTimeout(() => goToSlide(slideMap.skills), 220);
      return `Toolchain: C, C++, Java, Flutter, HTML, iGraphics, Unreal Engine, Roblox Studio, Android Studio, Xcode, VS Code, Git & GitHub.`;
    },

    cf: () => {
      setTimeout(() => {
        goToSlide(slideMap.cp);
        setCPMode('cf', { playAudio: false });
      }, 220);
      const pct = ((cpState.cfRating / 1200) * 100).toFixed(1);
      return `Codeforces Live Radar (Handle: Pri8899):
Current Rating: ${cpState.cfRating} (${cpState.cfRank}) | Peak: ${cpState.cfMaxRating} | Pupil Goal: ${pct}%
Total Solved: ${cpState.cfCount} problems | Peak Problem: ${cpState.cfPeakDiff} (${cpState.cfPeakId})`;
    },

    codeforces: () => terminalCommands.cf(),

    lc: () => {
      setTimeout(() => {
        goToSlide(slideMap.cp);
        setCPMode('lc', { playAudio: false });
      }, 220);
      return `LeetCode Telemetry (User: Pri8899):
Total Accepted Solves: ${cpState.lcCount}
Profile: https://leetcode.com/u/Pri8899/`;
    },

    leetcode: () => terminalCommands.lc(),

    cses: () => {
      setTimeout(() => {
        goToSlide(slideMap.cp);
        setCPMode('cses', { playAudio: false });
      }, 220);
      return `CSES Archive (Pri8899/CP/CSES): ${cpState.csesCount} solutions synced via CodeSync Pro.`;
    },

    stats: () => {
      setTimeout(() => {
        goToSlide(slideMap.cp);
        setCPMode('unified', { playAudio: false });
      }, 220);
      return `CodeSync Pro Unified Telemetry:
Total Solved: ${cpState.totalSolved} (CF: ${cpState.cfCount} · LC: ${cpState.lcCount} · CSES: ${cpState.csesCount})
Active Streak: ${cpState.streakDays} days | AC Accuracy: ${cpState.accuracyPct}% | Submissions: ${cpState.totalSubmissions}`;
    },

    cp: () => terminalCommands.stats(),

    theme: (arg) => {
      if (!arg) return `Usage: theme <name>\nAvailable themes: obsidian, daylight, cobalt, espresso, forest`;
      return setTheme(arg.toLowerCase());
    },

    sound: () => {
      soundEnabled = !soundEnabled;
      localStorage.setItem('pri_sound_fx', String(soundEnabled));
      updateSoundBtn();
      if (soundEnabled) playKeyClick();
      showToast(`Mechanical Audio FX: ${soundEnabled ? 'ON' : 'OFF'}`);
      return `Mechanical sound effects: ${soundEnabled ? 'ENABLED' : 'DISABLED'}`;
    },

    matrix: () => {
      runMatrixRain();
      return `Initiating Neural Digital Rain sequence...`;
    },

    about: () => {
      setTimeout(() => goToSlide(slideMap.about), 220);
      return `Ahsanullah University of Science and Technology
Degree: B.Sc. in Computer Science & Engineering (2nd Year, 1st Semester · CSE Batch 54)
Location: Dhaka, Bangladesh`;
    },

    copy: () => {
      copyEmailToClipboard();
      return `Copied parthopaul8899@gmail.com to clipboard.`;
    },

    contact: () => {
      setTimeout(() => goToSlide(slideMap.contact), 220);
      return `Email: parthopaul8899@gmail.com | GitHub: https://github.com/Pri8899`;
    },

    sudo: () => `Permission denied: Partho Paul is already root administrator.`,

    clear: () => {
      if (matrixIntervalId) {
        clearInterval(matrixIntervalId);
        matrixIntervalId = null;
      }
      if (termHistory) termHistory.innerHTML = '';
      return '';
    }
  };

  async function executeTerminalLine(rawLine) {
    if (!termHistory) return;
    const clean = (rawLine || '').trim();
    if (!clean) return;

    commandHistory.push(clean);
    historyIdx = commandHistory.length;

    const parts = clean.split(/\s+/);
    const cmd = parts[0].toLowerCase();
    const arg = parts.slice(1).join(' ');

    if (cmd === 'clear') {
      terminalCommands.clear();
      return;
    }

    const entry = document.createElement('div');
    entry.className = 'term-hist-item';

    const cmdDiv = document.createElement('div');
    cmdDiv.className = 'term-hist-cmd';
    cmdDiv.textContent = `pri8899@aust:~$ ${clean}`;

    const outPre = document.createElement('pre');
    outPre.className = 'term-hist-out';
    outPre.textContent = '⚡ Processing...';

    entry.appendChild(cmdDiv);
    entry.appendChild(outPre);
    termHistory.appendChild(entry);

    let output = '';
    if (terminalCommands[cmd]) {
      try {
        output = await terminalCommands[cmd](arg);
      } catch (err) {
        output = `Error executing command: ${err.message}`;
      }
    } else {
      output = `zsh: command not found: ${cmd}. Type 'help' for available commands.`;
    }

    if (output instanceof Node) {
      outPre.replaceWith(output);
    } else {
      outPre.textContent = output;
    }
    const body = termHistory.closest('.terminal-body');
    if (body) body.scrollTop = body.scrollHeight;
  }

  document.querySelectorAll('.term-quick-cmd').forEach((btn) => {
    btn.addEventListener('click', () => {
      playKeyClick();
      executeTerminalLine(btn.getAttribute('data-cmd'));
    });
  });

  if (termInput) {
    termInput.addEventListener('keydown', (e) => {
      playKeyClick();

      if (e.key === 'Tab') {
        e.preventDefault();
        const current = termInput.value.trim().toLowerCase();
        if (!current) return;
        const matches = Object.keys(terminalCommands).filter((cmd) => cmd.startsWith(current));
        if (matches.length === 1) {
          termInput.value = matches[0];
        } else if (matches.length > 1 && termHistory) {
          const entry = document.createElement('div');
          entry.className = 'term-hist-item';
          const pre = document.createElement('pre');
          pre.className = 'term-hist-out';
          pre.style.color = '#79c0ff';
          pre.textContent = matches.join('   ');
          entry.appendChild(pre);
          termHistory.appendChild(entry);
          const body = termHistory.closest('.terminal-body');
          if (body) body.scrollTop = body.scrollHeight;
        }
        return;
      }

      if (e.key === 'Enter') {
        const val = termInput.value;
        termInput.value = '';
        executeTerminalLine(val);
      } else if (e.key === 'ArrowUp') {
        if (commandHistory.length > 0 && historyIdx > 0) {
          historyIdx--;
          termInput.value = commandHistory[historyIdx] || '';
        }
      } else if (e.key === 'ArrowDown') {
        if (historyIdx < commandHistory.length - 1) {
          historyIdx++;
          termInput.value = commandHistory[historyIdx] || '';
        } else {
          historyIdx = commandHistory.length;
          termInput.value = '';
        }
      }
    });
  }

  // ── 6. Finder Sidebar Category Filter ───────────────────────
  const sidebarItems = document.querySelectorAll('.finder-sidebar .sidebar-item');
  const projectTiles = document.querySelectorAll('.project-tile');
  const finderContent = document.querySelector('.finder-content');
  const finderItemCount = document.getElementById('finder-item-count');

  sidebarItems.forEach((item) => {
    item.addEventListener('click', () => {
      playKeyClick();
      sidebarItems.forEach((i) => i.classList.remove('active'));
      item.classList.add('active');

      const filter = item.getAttribute('data-filter');
      let visibleCount = 0;

      projectTiles.forEach((tile) => {
        const cat = tile.getAttribute('data-cat');
        if (filter === 'all' || cat === filter) {
          tile.style.display = 'flex';
          if (!prefersReducedMotion) {
            tile.style.opacity = '0';
            tile.style.transform = 'scale(0.96)';
            const delay = visibleCount * 40;
            setTimeout(() => {
              tile.style.transition = 'opacity 0.25s ease, transform 0.28s var(--spring-ease)';
              tile.style.opacity = '1';
              tile.style.transform = '';
            }, 15 + delay);
          }
          visibleCount++;
        } else {
          tile.style.display = 'none';
        }
      });

      if (finderContent) {
        finderContent.classList.toggle('single-item', visibleCount === 1);
      }
      if (finderItemCount) {
        finderItemCount.textContent = `${visibleCount} Item${visibleCount === 1 ? '' : 's'}`;
      }
    });
  });

  // ── 7. Razor-Sharp 3D Card Tilt & Magnetic Buttons ──────────
  if (!prefersReducedMotion) {
    const tiltCards = document.querySelectorAll('[data-tilt]');
    tiltCards.forEach((card) => {
      let cachedRect = null;
      let rafId = null;
      let pendingX = 0;
      let pendingY = 0;
      let leaveTimer = null;

      card.addEventListener('pointerenter', (e) => {
        if (e.pointerType && e.pointerType !== 'mouse') return;
        clearTimeout(leaveTimer);
        cachedRect = card.getBoundingClientRect();
        card.style.transition = 'none';
      });

      card.addEventListener('pointermove', (e) => {
        if (e.pointerType && e.pointerType !== 'mouse') return;
        if (!cachedRect) cachedRect = card.getBoundingClientRect();
        pendingX = e.clientX - cachedRect.left;
        pendingY = e.clientY - cachedRect.top;

        if (!rafId) {
          rafId = requestAnimationFrame(() => {
            rafId = null;
            if (!cachedRect || !cachedRect.width || !cachedRect.height) return;
            card.style.setProperty('--mouse-x', `${pendingX.toFixed(1)}px`);
            card.style.setProperty('--mouse-y', `${pendingY.toFixed(1)}px`);

            const cx = cachedRect.width / 2;
            const cy = cachedRect.height / 2;
            const rotX = ((pendingY - cy) / cy) * -2.2;
            const rotY = ((pendingX - cx) / cx) * 2.2;

            // Omit fractional scale3d() to keep Retina typography & SVG vectors needle-sharp!
            card.style.transform = `perspective(1400px) rotateX(${rotX.toFixed(2)}deg) rotateY(${rotY.toFixed(2)}deg)`;
          });
        }
      });

      card.addEventListener('pointerleave', () => {
        cachedRect = null;
        if (rafId) {
          cancelAnimationFrame(rafId);
          rafId = null;
        }
        card.style.transition = 'transform 0.45s cubic-bezier(0.16, 1, 0.3, 1)';
        card.style.transform = 'perspective(1400px) rotateX(0deg) rotateY(0deg)';
        leaveTimer = setTimeout(() => {
          if (!card.matches(':hover')) {
            card.style.transform = '';
            card.style.transition = '';
          }
        }, 450);
      });
    });

    // Magnetic Elements via --mag-x / --mag-y (never breaks translateY(-50%) centering!)
    const magneticElements = document.querySelectorAll('.mac-btn, .spotlight-trigger, .desk-nav-btn');
    magneticElements.forEach((el) => {
      let rect = null;
      let magRaf = null;
      let mx = 0;
      let my = 0;

      el.addEventListener('pointerenter', (e) => {
        if (e.pointerType && e.pointerType !== 'mouse') return;
        rect = el.getBoundingClientRect();
      });

      el.addEventListener('pointermove', (e) => {
        if (e.pointerType && e.pointerType !== 'mouse') return;
        if (!rect) rect = el.getBoundingClientRect();
        mx = (e.clientX - rect.left - rect.width / 2) * 0.2;
        my = (e.clientY - rect.top - rect.height / 2) * 0.2;

        if (!magRaf) {
          magRaf = requestAnimationFrame(() => {
            magRaf = null;
            el.style.setProperty('--mag-x', `${mx.toFixed(1)}px`);
            el.style.setProperty('--mag-y', `${my.toFixed(1)}px`);
          });
        }
      });

      el.addEventListener('pointerleave', () => {
        rect = null;
        if (magRaf) {
          cancelAnimationFrame(magRaf);
          magRaf = null;
        }
        el.style.setProperty('--mag-x', '0px');
        el.style.setProperty('--mag-y', '0px');
      });
    });
  }

  // ── 8. Interactive Background Aurora Parallax & Particle Engine
  (function initBackgroundInteractive() {
    const isCoarseMobile =
      (window.matchMedia('(pointer: coarse)').matches && window.innerWidth < 900) ||
      /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);
    const canvas = document.getElementById('bg-canvas');

    if (isCoarseMobile || prefersReducedMotion) {
      if (canvas) canvas.style.display = 'none';
      return;
    }

    const spotlight = document.querySelector('.cursor-spotlight');
    const auroraP1 = document.getElementById('aurora-p1');
    const auroraP2 = document.getElementById('aurora-p2');
    const auroraP3 = document.getElementById('aurora-p3');
    const auroraP4 = document.getElementById('aurora-p4');

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let targetX = mouseX;
    let targetY = mouseY;
    let prevMouseX = mouseX;
    let prevMouseY = mouseY;
    let lightingRaf = null;
    let sceneRaf = null;

    let accent1 = '228, 228, 231';
    let accent2 = '217, 119, 6';
    let accent3 = '161, 161, 170';
    let neutralRgb = '228, 228, 231';
    let particlePalettes = [];

    function syncThemeColors() {
      const st = getComputedStyle(document.documentElement);
      accent1 = (st.getPropertyValue('--accent-1-rgb') || '228, 228, 231').trim();
      accent2 = (st.getPropertyValue('--accent-2-rgb') || '217, 119, 6').trim();
      accent3 = (st.getPropertyValue('--accent-3-rgb') || '161, 161, 170').trim();
      neutralRgb = (st.getPropertyValue('--particle-neutral-rgb') || '228, 228, 231').trim();
      particlePalettes = [
        `rgba(${accent1}, `,
        `rgba(${accent2}, `,
        `rgba(${accent3}, `,
        `rgba(${neutralRgb}, `
      ];
      if (typeof particles !== 'undefined') {
        particles.forEach((p, idx) => {
          p.colorBase = particlePalettes[idx % particlePalettes.length];
        });
      }
    }
    canvasThemeSyncCb = syncThemeColors;

    const ripples = [];
    const sparks = [];
    const cursorTrails = [];

    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      const vx = mouseX - prevMouseX;
      const vy = mouseY - prevMouseY;
      const speed = Math.min(Math.hypot(vx, vy), 60);
      prevMouseX = mouseX;
      prevMouseY = mouseY;

      if (!lightingRaf && !document.hidden) {
        lightingRaf = requestAnimationFrame(updateCursorLighting);
      }

      if (speed > 4 && cursorTrails.length < 14) {
        cursorTrails.push({
          x: mouseX + (Math.random() - 0.5) * 8,
          y: mouseY + (Math.random() - 0.5) * 8,
          vx: vx * 0.08 + (Math.random() - 0.5),
          vy: vy * 0.08 + (Math.random() - 0.5),
          radius: Math.random() * 1.9 + 0.9,
          alpha: 0.78,
          decay: Math.random() * 0.03 + 0.02,
          color: Math.random() > 0.5 ? accent1 : accent2
        });
      }
    }, { passive: true });

    function updateCursorLighting() {
      const dx = mouseX - targetX;
      const dy = mouseY - targetY;
      targetX += dx * 0.14;
      targetY += dy * 0.14;

      if (spotlight) {
        spotlight.style.setProperty('--cursor-x', `${targetX.toFixed(1)}px`);
        spotlight.style.setProperty('--cursor-y', `${targetY.toFixed(1)}px`);
      }

      const normX = targetX / (window.innerWidth || 1) - 0.5;
      const normY = targetY / (window.innerHeight || 1) - 0.5;

      // Apply parallax to wrapper elements so inner CSS keyframes work cleanly
      if (auroraP1) auroraP1.style.transform = `translate3d(${(normX * 36).toFixed(1)}px, ${(normY * 24).toFixed(1)}px, 0)`;
      if (auroraP2) auroraP2.style.transform = `translate3d(${(-normX * 42).toFixed(1)}px, ${(normY * 28).toFixed(1)}px, 0)`;
      if (auroraP3) auroraP3.style.transform = `translate3d(${(normX * 26).toFixed(1)}px, ${(-normY * 34).toFixed(1)}px, 0)`;
      if (auroraP4) auroraP4.style.transform = `translate3d(${(-normX * 30).toFixed(1)}px, ${(-normY * 22).toFixed(1)}px, 0)`;

      if (Math.hypot(dx, dy) > 0.6 && !document.hidden) {
        lightingRaf = requestAnimationFrame(updateCursorLighting);
      } else {
        lightingRaf = null;
      }
    }

    function triggerShockwave(x, y) {
      ripples.push({
        x,
        y,
        radius: 6,
        maxRadius: Math.min(window.innerWidth, window.innerHeight) * 0.4,
        alpha: 0.82,
        speed: 7.5
      });

      for (let i = 0; i < 14; i++) {
        const angle = (Math.PI * 2 * i) / 14 + (Math.random() - 0.5) * 0.35;
        const speed = Math.random() * 4.5 + 2.2;
        sparks.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          radius: Math.random() * 2 + 1,
          alpha: 0.95,
          decay: Math.random() * 0.024 + 0.018,
          color: i % 2 === 0 ? accent1 : accent2
        });
      }
    }

    // Only trigger canvas shockwave on atmospheric/non-interactive clicks
    window.addEventListener('click', (e) => {
      if (e.target && e.target.closest('a, button, input, .sidebar-item, .spotlight-item, .theme-option')) {
        return;
      }
      triggerShockwave(e.clientX, e.clientY);
    });

    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let dpr = 1;

    function resizeCanvas() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas, { passive: true });

    const particleCount = Math.min(28, Math.max(16, Math.floor(window.innerWidth / 52)));
    const particles = [];
    syncThemeColors();

    for (let i = 0; i < particleCount; i++) {
      const z = Math.random() * 1.4 + 0.55;
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.32 * z,
        vy: (Math.random() - 0.5) * 0.32 * z,
        fx: 0,
        fy: 0,
        z,
        radius: (Math.random() * 1.4 + 0.8) * Math.min(z, 1.35),
        colorBase: particlePalettes[i % particlePalettes.length],
        baseAlpha: (Math.random() * 0.28 + 0.18) * Math.min(z, 1.2),
        pulseSpeed: Math.random() * 0.02 + 0.01,
        pulseOffset: Math.random() * Math.PI * 2
      });
    }

    let time = 0;
    function renderCanvasScene() {
      if (document.hidden) {
        sceneRaf = null;
        return;
      }

      ctx.clearRect(0, 0, width, height);
      time += 1;

      // 1. Shockwave rings
      for (let i = ripples.length - 1; i >= 0; i--) {
        const rip = ripples[i];
        rip.radius += rip.speed;
        rip.alpha -= 0.018;
        if (rip.alpha <= 0 || rip.radius > rip.maxRadius) {
          ripples.splice(i, 1);
          continue;
        }
        ctx.beginPath();
        ctx.arc(rip.x, rip.y, rip.radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${accent1}, ${(rip.alpha * 0.45).toFixed(3)})`;
        ctx.lineWidth = 1.6;
        ctx.stroke();

        for (let p of particles) {
          const d = Math.hypot(p.x - rip.x, p.y - rip.y);
          if (Math.abs(d - rip.radius) < 40 && d > 0) {
            const push = (1 - Math.abs(d - rip.radius) / 40) * 4 * rip.alpha;
            p.fx += ((p.x - rip.x) / d) * push;
            p.fy += ((p.y - rip.y) / d) * push;
          }
        }
      }

      // 2. Cursor trail stardust
      for (let i = cursorTrails.length - 1; i >= 0; i--) {
        const t = cursorTrails[i];
        t.x += t.vx;
        t.y += t.vy;
        t.vx *= 0.94;
        t.vy *= 0.94;
        t.alpha -= t.decay;
        if (t.alpha <= 0) {
          cursorTrails.splice(i, 1);
          continue;
        }
        ctx.beginPath();
        ctx.arc(t.x, t.y, t.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${t.color}, ${t.alpha.toFixed(3)})`;
        ctx.fill();
      }

      // 3. Click sparks
      for (let i = sparks.length - 1; i >= 0; i--) {
        const s = sparks[i];
        s.x += s.vx;
        s.y += s.vy;
        s.vx *= 0.94;
        s.vy *= 0.94;
        s.alpha -= s.decay;
        if (s.alpha <= 0) {
          sparks.splice(i, 1);
          continue;
        }
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${s.color}, ${s.alpha.toFixed(3)})`;
        ctx.fill();
      }

      // 4. Particles & Batched Constellation Filaments
      ctx.beginPath();
      let hasConstellationLines = false;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx + p.fx;
        p.y += p.vy + p.fy;
        p.fx *= 0.92;
        p.fy *= 0.92;

        if (p.x < -20) p.x = width + 20;
        else if (p.x > width + 20) p.x = -20;
        if (p.y < -20) p.y = height + 20;
        else if (p.y > height + 20) p.y = -20;

        const jEnd = Math.min(i + 6, particles.length);
        for (let j = i + 1; j < jEnd; j++) {
          const p2 = particles[j];
          const pDist = Math.hypot(p.x - p2.x, p.y - p2.y);
          if (pDist < 95) {
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            hasConstellationLines = true;
          }
        }
      }
      if (hasConstellationLines) {
        ctx.strokeStyle = `rgba(${accent1}, 0.08)`;
        ctx.lineWidth = 0.7;
        ctx.stroke();
      }

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        const dx = targetX - p.x;
        const dy = targetY - p.y;
        const dist = Math.hypot(dx, dy);
        const maxDist = 175;

        let alpha = p.baseAlpha + Math.sin(time * p.pulseSpeed + p.pulseOffset) * 0.1;
        let radius = p.radius;

        if (dist < maxDist && dist > 0) {
          const prox = 1 - dist / maxDist;
          alpha = Math.min(0.92, alpha + prox * 0.5);
          radius = p.radius * (1 + prox * 0.75);

          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(targetX, targetY);
          ctx.strokeStyle = `rgba(${accent1}, ${(prox * 0.22).toFixed(3)})`;
          ctx.lineWidth = 0.85;
          ctx.stroke();

          const normalX = dx / dist;
          const normalY = dy / dist;
          p.fx -= normalX * prox * 0.35;
          p.fy -= normalY * prox * 0.35;
          p.fx += -normalY * prox * 0.3;
          p.fy += normalX * prox * 0.3;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
        ctx.fillStyle = `${p.colorBase}${alpha.toFixed(3)})`;
        ctx.fill();
      }

      sceneRaf = requestAnimationFrame(renderCanvasScene);
    }

    document.addEventListener('visibilitychange', () => {
      if (!document.hidden && !sceneRaf) {
        sceneRaf = requestAnimationFrame(renderCanvasScene);
      }
    });

    sceneRaf = requestAnimationFrame(renderCanvasScene);
  })();

  // ── 9. CP Activity Monitor & Live Telemetry Hub ─────────────
  const cpViewUnified = document.getElementById('cp-view-unified');
  const cpViewCF = document.getElementById('cp-view-cf');
  const cpViewLC = document.getElementById('cp-view-lc');
  const cpViewCSES = document.getElementById('cp-view-cses');
  const cpViewAC = document.getElementById('cp-view-ac');
  const cpViewTP = document.getElementById('cp-view-toph');
  const cpCardWrapper = document.getElementById('cp-card-wrapper');

  const btnShowUnified = document.getElementById('btn-show-unified');
  const btnShowCF = document.getElementById('btn-show-cf');
  const btnShowLC = document.getElementById('btn-show-lc');
  const btnShowCSES = document.getElementById('btn-show-cses');
  const btnShowAC = document.getElementById('btn-show-ac');
  const btnShowTP = document.getElementById('btn-show-toph');
  const btnShowSVG = document.getElementById('btn-show-svg');

  const LEETCODE_DIFFICULTY_MAP = {
    'search-in-rotated-sorted-array': 'Medium',
    'divide-two-integers': 'Medium',
    'remove-duplicates-from-sorted-array': 'Easy',
    'palindrome-number': 'Easy',
    'reverse-integer': 'Medium',
    'median-of-two-sorted-arrays': 'Hard',
    'two-sum': 'Easy',
    'sort-colors': 'Medium',
    'search-a-2d-matrix': 'Medium',
    'powx-n': 'Medium',
    'sqrtx': 'Easy',
    'best-time-to-buy-and-sell-stock': 'Easy',
    'valid-palindrome': 'Easy',
    'search-in-rotated-sorted-array-ii': 'Medium',
    'strictly-palindromic-number': 'Medium',
    'two-sum-ii-input-array-is-sorted': 'Medium'
  };

  let svgLoadedFromRemote = false;

  function replayOverviewSVGAnimations() {
    const ovMount = document.getElementById('cp-overview-mount');
    if (!ovMount) return;
    const svg = ovMount.querySelector('svg');
    if (svg && typeof svg.setCurrentTime === 'function') {
      try { svg.setCurrentTime(0); } catch (e) {}
    }
  }

  function setCPMode(mode, { updateHash = true, playAudio = true } = {}) {
    if (playAudio) playKeyClick();
    const switchBtns = [btnShowUnified, btnShowCF, btnShowLC, btnShowCSES, btnShowAC, btnShowTP, btnShowSVG];
    switchBtns.forEach((btn) => { if (btn) btn.classList.remove('active'); });

    const allViews = [cpViewUnified, cpViewCF, cpViewLC, cpViewCSES, cpViewAC, cpViewTP, cpCardWrapper];
    allViews.forEach((v) => { if (v) v.style.display = 'none'; });

    const modeMap = {
      unified: { view: cpViewUnified, btn: btnShowUnified, hash: '#cp' },
      cf: { view: cpViewCF, btn: btnShowCF, hash: '#cp/cf' },
      lc: { view: cpViewLC, btn: btnShowLC, hash: '#cp/lc' },
      cses: { view: cpViewCSES, btn: btnShowCSES, hash: '#cp/cses' },
      ac: { view: cpViewAC, btn: btnShowAC, hash: '#cp/ac' },
      toph: { view: cpViewTP, btn: btnShowTP, hash: '#cp/toph' },
      svg: { view: cpCardWrapper, btn: btnShowSVG, hash: '#cp/svg' }
    };

    const selected = modeMap[mode] || modeMap.unified;
    if (selected.view) selected.view.style.display = 'flex';
    if (selected.btn) selected.btn.classList.add('active');
    if (updateHash && currentSlideIndex === slideMap.cp && window.location.hash !== selected.hash) {
      history.replaceState(null, '', selected.hash);
    }

    if (mode === 'svg') {
      replayOverviewSVGAnimations();
      if (!svgLoadedFromRemote) autoSyncCPFromRepo();
    }
  }

  function checkCPHashMode({ playAudio = false } = {}) {
    const fullHash = (window.location.hash || '').toLowerCase();
    const parts = fullHash.replace('#', '').split('/');
    if (parts[0] !== 'cp') {
      setCPMode('unified', { updateHash: false, playAudio });
      return;
    }
    const sub = parts[1] || '';
    const isACVisible = btnShowAC && btnShowAC.style.display !== 'none';
    const isTPVisible = btnShowTP && btnShowTP.style.display !== 'none';

    if (sub === 'lc') setCPMode('lc', { updateHash: false, playAudio });
    else if (sub === 'cf') setCPMode('cf', { updateHash: false, playAudio });
    else if (sub === 'svg') setCPMode('svg', { updateHash: false, playAudio });
    else if (sub === 'cses') setCPMode('cses', { updateHash: false, playAudio });
    else if (sub === 'ac' || sub === 'atcoder') setCPMode(isACVisible ? 'ac' : 'unified', { updateHash: false, playAudio });
    else if (sub === 'toph') setCPMode(isTPVisible ? 'toph' : 'unified', { updateHash: false, playAudio });
    else setCPMode('unified', { updateHash: false, playAudio });
  }

  window.addEventListener('hashchange', () => {
    syncFromHash();
    checkCPHashMode({ playAudio: false });
  });

  if (btnShowUnified) btnShowUnified.addEventListener('click', () => setCPMode('unified'));
  if (btnShowCF) btnShowCF.addEventListener('click', () => setCPMode('cf'));
  if (btnShowLC) btnShowLC.addEventListener('click', () => setCPMode('lc'));
  if (btnShowCSES) btnShowCSES.addEventListener('click', () => setCPMode('cses'));
  if (btnShowAC) btnShowAC.addEventListener('click', () => setCPMode('ac'));
  if (btnShowTP) btnShowTP.addEventListener('click', () => setCPMode('toph'));
  if (btnShowSVG) btnShowSVG.addEventListener('click', () => setCPMode('svg'));

  // CodeSync Card Sub-Switcher (All Cards, Performance, Platform Overview)
  const btnToggleBoth = document.getElementById('btn-toggle-both');
  const btnToggleStats = document.getElementById('btn-toggle-stats');
  const btnToggleOverview = document.getElementById('btn-toggle-overview');
  const secStats = document.getElementById('section-card-stats');
  const secOverview = document.getElementById('section-card-overview');

  function setCardToggle(mode) {
    playKeyClick();
    if (btnToggleBoth) btnToggleBoth.classList.toggle('active', mode === 'both');
    if (btnToggleStats) btnToggleStats.classList.toggle('active', mode === 'stats');
    if (btnToggleOverview) btnToggleOverview.classList.toggle('active', mode === 'overview');
    if (secStats) secStats.style.display = (mode === 'both' || mode === 'stats') ? 'flex' : 'none';
    if (secOverview) secOverview.style.display = (mode === 'both' || mode === 'overview') ? 'flex' : 'none';
    if (mode === 'both' || mode === 'overview') replayOverviewSVGAnimations();
  }
  if (btnToggleBoth) btnToggleBoth.addEventListener('click', () => setCardToggle('both'));
  if (btnToggleStats) btnToggleStats.addEventListener('click', () => setCardToggle('stats'));
  if (btnToggleOverview) btnToggleOverview.addEventListener('click', () => setCardToggle('overview'));

  // Safe DOM Row Builder (Zero InnerHTML Injection!)
  function createSolveRow(entry) {
    const row = document.createElement('div');
    row.className = 'cf-solve-row';

    const left = document.createElement('div');
    left.className = 'cf-solve-left';

    const badge = document.createElement('span');
    const verdict = document.createElement('span');
    verdict.className = 'cf-verdict-tag';
    verdict.textContent = '✓ AC';

    const link = document.createElement('a');
    link.className = 'cf-solve-title';
    link.target = '_blank';
    link.rel = 'noopener noreferrer';

    const tagsWrap = document.createElement('span');
    tagsWrap.className = 'cf-solve-tags';

    const right = document.createElement('div');
    right.className = 'cf-solve-right';

    const diffSpan = document.createElement('span');
    diffSpan.className = 'cf-solve-diff';

    const timeSpan = document.createElement('span');
    timeSpan.textContent = entry.time || 'Recent';

    if (entry.platform === 'LC') {
      badge.className = 'platform-badge-micro lc-platform-tag';
      badge.textContent = 'LC';
      link.href = `https://leetcode.com/problems/${encodeURIComponent(entry.slug || '')}/`;
      link.textContent = entry.title || entry.slug || 'LeetCode Problem';
      diffSpan.classList.add((entry.diff || 'medium').toLowerCase());
      diffSpan.textContent = entry.diff || 'Medium';
    } else if (entry.platform === 'CSES') {
      badge.className = 'platform-badge-micro cses-platform-tag';
      badge.textContent = 'CSES';
      link.href = `https://github.com/Pri8899/CP/tree/main/CSES/${encodeURIComponent(entry.path || '')}`;
      link.textContent = `${entry.id} · ${entry.title}`;
      diffSpan.textContent = entry.topic || 'CSES';
    } else {
      badge.className = 'platform-badge-micro cf-platform-tag';
      badge.textContent = 'CF';
      let cid = entry.contestId;
      let idx = entry.index;
      if ((!cid || !idx) && entry.id) {
        const m = String(entry.id).match(/^(\d+)([A-Za-z]\d*)$/);
        if (m) { cid = m[1]; idx = m[2]; }
      }
      link.href = cid && idx ? `https://codeforces.com/contest/${cid}/problem/${idx}` : 'https://codeforces.com/problemset';
      link.textContent = `${entry.id} · ${entry.title}`;
      diffSpan.textContent = entry.rating ? `${entry.rating} pts` : 'Verified';
    }

    (entry.tags || []).slice(0, 2).forEach((t) => {
      const chip = document.createElement('span');
      chip.className = 'cf-tag-micro';
      chip.textContent = t;
      tagsWrap.appendChild(chip);
    });

    left.appendChild(badge);
    left.appendChild(verdict);
    left.appendChild(link);
    if (tagsWrap.childNodes.length > 0) left.appendChild(tagsWrap);

    right.appendChild(diffSpan);
    right.appendChild(timeSpan);

    row.appendChild(left);
    row.appendChild(right);
    return row;
  }

  function renderList(mountEl, list) {
    if (!mountEl) return;
    mountEl.innerHTML = '';
    if (!list || list.length === 0) {
      const empty = document.createElement('div');
      empty.style.cssText = 'text-align:center;color:var(--text-muted);padding:18px 10px;font-size:11px;';
      empty.textContent = 'No matching problems found.';
      mountEl.appendChild(empty);
      return;
    }
    const frag = document.createDocumentFragment();
    list.forEach((item) => frag.appendChild(createSolveRow(item)));
    mountEl.appendChild(frag);
  }

  function filterSolves(list, query) {
    if (!query) return list;
    const q = query.toLowerCase().trim();
    return list.filter((item) => {
      const title = (item.title || '').toLowerCase();
      const id = (item.id || '').toLowerCase();
      const diff = (item.diff || '').toLowerCase();
      const topic = (item.topic || '').toLowerCase();
      const platform = (item.platform || '').toLowerCase();
      const rating = String(item.rating || '');
      const tags = (item.tags || []).join(' ').toLowerCase();
      return title.includes(q) || id.includes(q) || diff.includes(q) || topic.includes(q) || platform.includes(q) || rating.includes(q) || tags.includes(q);
    });
  }

  function buildCombinedFeed() {
    const out = [];
    const maxLen = Math.max(cpState.cfSolves.length, cpState.lcSolves.length, cpState.csesSolves.length);
    for (let i = 0; i < maxLen; i++) {
      if (i < cpState.cfSolves.length) out.push(cpState.cfSolves[i]);
      if (i < cpState.lcSolves.length) out.push(cpState.lcSolves[i]);
      if (i < cpState.csesSolves.length) out.push(cpState.csesSolves[i]);
    }
    cpState.combinedSolves = out;
  }

  function renderAllTelemetryUI() {
    buildCombinedFeed();

    // Sync unified counts accurately across all elements
    const totalEl = document.getElementById('unified-total-solved');
    const cfChip = document.getElementById('unified-cf-chip');
    const lcChip = document.getElementById('unified-lc-chip');
    const csesChip = document.getElementById('unified-cses-chip');
    const balText = document.getElementById('unified-balance-text');
    const balBar = document.getElementById('unified-balance-bar');
    const streakEl = document.getElementById('unified-streak-val');
    const subsEl = document.getElementById('unified-subs-val');
    const accEl = document.getElementById('unified-accuracy-val');
    const accSubEl = document.getElementById('unified-acc-sub');
    const accPctLabelEl = document.getElementById('unified-acc-pct-label');
    const accBarEl = document.getElementById('unified-acc-bar');

    if (totalEl) totalEl.textContent = cpState.totalSolved;
    if (cfChip) cfChip.textContent = `CF: ${cpState.cfCount}`;
    if (lcChip) lcChip.textContent = `LC: ${cpState.lcCount}`;
    if (csesChip) csesChip.textContent = `CSES: ${cpState.csesCount}`;

    if (cpState.totalSolved > 0) {
      const cfPct = ((cpState.cfCount / cpState.totalSolved) * 100).toFixed(1);
      const otherPct = (100 - parseFloat(cfPct)).toFixed(1);
      if (balText) balText.textContent = `${cfPct}% CF · ${otherPct}% Others`;
      if (balBar) balBar.style.width = `${cfPct}%`;
    }

    if (streakEl) streakEl.innerHTML = `${cpState.streakDays} <span class="val-unit">Days</span>`;
    if (subsEl) subsEl.textContent = `${cpState.totalSubmissions} Submissions`;
    if (accEl) accEl.innerHTML = `${cpState.accuracyPct}% <span class="val-unit">AC</span>`;
    if (accBarEl) accBarEl.style.width = `${cpState.accuracyPct}%`;
    if (accPctLabelEl) accPctLabelEl.textContent = `${cpState.accuracyPct}% Verified`;
    if (accSubEl) {
      const acNum = Math.round((cpState.accuracyPct / 100) * cpState.totalSubmissions);
      accSubEl.textContent = `${acNum} AC of ${cpState.totalSubmissions} Subs`;
    }

    // Update top chrome, About mini pills & Tech Stack CP repo stats
    const menuStreak = document.getElementById('menubar-streak-text');
    if (menuStreak) menuStreak.textContent = `${cpState.streakDays}d Streak`;
    const termStatus = document.getElementById('term-status-pill');
    if (termStatus) termStatus.textContent = `● ${cpState.totalSolved} Solves`;
    const termCfBadge = document.getElementById('term-cf-badge');
    if (termCfBadge) termCfBadge.textContent = `🏆 Codeforces: pri8899 · ${cpState.cfRating}`;
    const aboutSolved = document.getElementById('about-solved-pill');
    if (aboutSolved) aboutSolved.textContent = `${cpState.totalSolved} Solved`;
    const aboutStreak = document.getElementById('about-streak-pill');
    if (aboutStreak) aboutStreak.textContent = `${cpState.streakDays}d Streak`;
    const aboutCf = document.getElementById('about-cf-pill');
    if (aboutCf) aboutCf.textContent = `${cpState.cfRating} CF`;
    const aboutSyncMeta = document.getElementById('about-sync-meta');
    if (aboutSyncMeta) aboutSyncMeta.textContent = `Auto-synced · Pri8899/CP · ${cpState.lastSynced}`;

    // CP Monitor Live Pri8899/CP Language Breakdown Strip
    const repoBreakdown = document.getElementById('cp-repo-breakdown');
    if (repoBreakdown) {
      repoBreakdown.textContent = `C++ ${cpState.langCppPct}% (${cpState.langCppCount}) · Java ${cpState.langJavaPct}% (${cpState.langJavaCount}) · Synced ${cpState.lastSynced}`;
    }
    const barCpp = document.getElementById('cp-bar-cpp');
    if (barCpp) barCpp.style.width = `${cpState.langCppPct}%`;
    const barJava = document.getElementById('cp-bar-java');
    if (barJava) barJava.style.width = `${cpState.langJavaPct}%`;

    // Switch buttons
    if (btnShowUnified) btnShowUnified.querySelector('span').textContent = `All Solves (${cpState.totalSolved})`;
    if (btnShowCF) btnShowCF.querySelector('span').textContent = `Codeforces (${cpState.cfCount})`;
    if (btnShowLC) btnShowLC.querySelector('span').textContent = `LeetCode (${cpState.lcCount})`;
    if (btnShowCSES) {
      btnShowCSES.style.display = cpState.csesCount > 0 ? 'inline-flex' : 'none';
      btnShowCSES.querySelector('span').textContent = `CSES (${cpState.csesCount})`;
    }
    if (btnShowAC) {
      btnShowAC.style.display = cpState.acCount > 0 ? 'inline-flex' : 'none';
      btnShowAC.querySelector('span').textContent = `AtCoder (${cpState.acCount})`;
    }
    if (btnShowTP) {
      btnShowTP.style.display = cpState.tophCount > 0 ? 'inline-flex' : 'none';
      btnShowTP.querySelector('span').textContent = `Toph (${cpState.tophCount})`;
    }

    // Codeforces View metrics
    const cfSolvedEl = document.getElementById('cf-solved-count');
    const cfSubsChip = document.getElementById('cf-subs-chip');
    const cfUniquePill = document.getElementById('cf-unique-pill');
    const cfVelocitySub = document.getElementById('cf-velocity-sub');
    const cfRatingEl = document.getElementById('cf-rating-val');
    const cfMaxRatingEl = document.getElementById('cf-max-rating');
    const cfRankPill = document.getElementById('cf-rank-pill');
    const cfFillEl = document.getElementById('cf-progress-fill');
    const cfPctEl = document.getElementById('cf-progress-pct');
    const cfPeakVal = document.getElementById('cf-peak-val');
    const cfPeakPill = document.getElementById('cf-peak-pill');
    const cfPeakName = document.getElementById('cf-peak-name');
    const cfTopTag = document.getElementById('cf-top-tag-label');
    const cfTopBar = document.getElementById('cf-top-tag-bar');

    if (cfSolvedEl) cfSolvedEl.textContent = cpState.cfCount;
    if (cfSubsChip) cfSubsChip.textContent = `${cpState.cfSubmissions} Submissions`;
    if (cfUniquePill) cfUniquePill.textContent = `${cpState.cfAcCount} AC`;
    if (cfVelocitySub) cfVelocitySub.textContent = `${cpState.cfCount} Problems Done`;
    if (cfRatingEl) cfRatingEl.textContent = cpState.cfRating;
    if (cfMaxRatingEl) cfMaxRatingEl.textContent = `Max: ${cpState.cfMaxRating}`;
    if (cfRankPill) {
      cfRankPill.textContent = cpState.cfRank.toUpperCase();
      cfRankPill.className = `cf-rank-pill ${cpState.cfRank.toLowerCase()}`;
    }
    const targetPct = Math.min(100, ((cpState.cfRating / 1200) * 100)).toFixed(1);
    if (cfFillEl) cfFillEl.style.width = `${targetPct}%`;
    if (cfPctEl) cfPctEl.textContent = `${targetPct}%`;
    if (cfPeakVal) cfPeakVal.innerHTML = `${cpState.cfPeakDiff} <span class="val-unit">pts</span>`;
    if (cfPeakPill) cfPeakPill.textContent = `Problem ${cpState.cfPeakId}`;
    if (cfPeakName) cfPeakName.textContent = cpState.cfPeakName;
    if (cfTopTag) cfTopTag.textContent = cpState.cfTopTag;
    if (cfTopBar) cfTopBar.style.width = `${cpState.cfTopTagPct}%`;

    // LeetCode View metrics (computed dynamically from lcSolves!)
    let easy = 0;
    let med = 0;
    let hard = 0;
    cpState.lcSolves.forEach((p) => {
      const d = (p.diff || '').toLowerCase();
      if (d === 'easy') easy++;
      else if (d === 'hard') hard++;
      else med++;
    });
    const lcTotal = Math.max(cpState.lcCount, cpState.lcSolves.length);
    const lcTotalValEl = document.getElementById('lc-total-val');
    const lcEasyBadge = document.getElementById('lc-easy-badge');
    const lcMedBadge = document.getElementById('lc-med-badge');
    const lcHardBadge = document.getElementById('lc-hard-badge');
    const lcDistText = document.getElementById('lc-dist-text');
    const lcDistBar = document.getElementById('lc-dist-bar');
    const lcAdvPct = document.getElementById('lc-adv-pct');
    const lcAdvSub = document.getElementById('lc-adv-sub');
    const lcAdvHeader = document.getElementById('lc-adv-header');
    const lcAdvBar = document.getElementById('lc-adv-bar');

    if (lcTotalValEl) lcTotalValEl.textContent = lcTotal;
    if (lcEasyBadge) lcEasyBadge.textContent = `${easy} Easy`;
    if (lcMedBadge) lcMedBadge.textContent = `${med} Med`;
    if (lcHardBadge) lcHardBadge.textContent = `${hard} Hard`;
    const sampleDen = Math.max(1, easy + med + hard);
    const ePct = ((easy / sampleDen) * 100).toFixed(1);
    const mPct = ((med / sampleDen) * 100).toFixed(1);
    const hPct = (100 - parseFloat(ePct) - parseFloat(mPct)).toFixed(1);
    const advCount = med + hard;
    const advRatio = ((advCount / sampleDen) * 100).toFixed(1);
    if (lcDistText) lcDistText.textContent = `${ePct}% E · ${mPct}% M · ${hPct}% H`;
    if (lcDistBar) {
      const stop1 = parseFloat(ePct);
      const stop2 = stop1 + parseFloat(mPct);
      lcDistBar.style.background = `linear-gradient(90deg, #00b8a3 ${stop1}%, #ffc01e ${stop1}% ${stop2}%, #ff375f ${stop2}% 100%)`;
    }
    if (lcAdvPct) lcAdvPct.textContent = `${advRatio}%`;
    if (lcAdvSub) lcAdvSub.textContent = `${advCount} Solves`;
    if (lcAdvHeader) lcAdvHeader.textContent = `${advCount} of ${sampleDen} Solves`;
    if (lcAdvBar) lcAdvBar.style.width = `${advRatio}%`;

    // Spotlight dynamic descriptions
    const spUnified = document.getElementById('spotlight-unified-desc');
    const spCF = document.getElementById('spotlight-cf-desc');
    const spLC = document.getElementById('spotlight-lc-desc');
    if (spUnified) spUnified.textContent = `Activity Monitor — ${cpState.totalSolved} Total Solves (CF + LC + CSES)`;
    if (spCF) spCF.textContent = `Codeforces Live Radar — ${cpState.cfRating} Rating & ${cpState.cfCount} Solves`;
    if (spLC) spLC.textContent = `LeetCode Live Telemetry — ${lcTotal} Solves (Easy / Med / Hard)`;

    // CSES metrics
    const csesCountEl = document.getElementById('cses-solved-count');
    if (csesCountEl) csesCountEl.textContent = cpState.csesCount;

    // Render problem lists & reapply active search queries if user already typed!
    const sUnified = document.getElementById('cp-search-unified');
    const sCF = document.getElementById('cp-search-cf');
    const sLC = document.getElementById('cp-search-lc');
    const sCSES = document.getElementById('cp-search-cses');

    const qU = sUnified ? sUnified.value : '';
    const qC = sCF ? sCF.value : '';
    const qL = sLC ? sLC.value : '';
    const qS = sCSES ? sCSES.value : '';

    const fU = filterSolves(cpState.combinedSolves, qU);
    const fC = filterSolves(cpState.cfSolves, qC);
    const fL = filterSolves(cpState.lcSolves, qL);
    const fS = filterSolves(cpState.csesSolves, qS);

    renderList(document.getElementById('unified-recent-solves-mount'), fU);
    renderList(document.getElementById('cf-recent-solves-mount'), fC);
    renderList(document.getElementById('lc-recent-solves-mount'), fL);
    renderList(document.getElementById('cses-recent-solves-mount'), fS);

    const countUnified = document.getElementById('cp-count-unified');
    const countCF = document.getElementById('cp-count-cf');
    const countLC = document.getElementById('cp-count-lc');
    const countCSES = document.getElementById('cp-count-cses');

    if (countUnified) {
      countUnified.textContent = qU
        ? `Showing ${fU.length} of ${cpState.combinedSolves.length} Solves`
        : `${cpState.cfCount} CF + ${cpState.lcCount} LC + ${cpState.csesCount} CSES = ${cpState.totalSolved} Solves`;
    }
    if (countCF) {
      countCF.textContent = qC
        ? `Showing ${fC.length} of ${cpState.cfSolves.length} CF Solves`
        : `${cpState.cfCount} Codeforces Solves`;
    }
    if (countLC) {
      countLC.textContent = qL
        ? `Showing ${fL.length} of ${cpState.lcSolves.length} LC Solves`
        : `${cpState.lcSolves.length} LeetCode Solves`;
    }
    if (countCSES) {
      countCSES.textContent = qS
        ? `Showing ${fS.length} of ${cpState.csesSolves.length} CSES Solves`
        : `${cpState.csesSolves.length} CSES Solves`;
    }
  }

  function setupSearchInputsImmediate() {
    const bindings = [
      { input: 'cp-search-unified', mount: 'unified-recent-solves-mount', count: 'cp-count-unified', getList: () => cpState.combinedSolves, idleLabel: () => `${cpState.cfCount} CF + ${cpState.lcCount} LC + ${cpState.csesCount} CSES = ${cpState.totalSolved} Solves`, unit: 'Solves' },
      { input: 'cp-search-cf', mount: 'cf-recent-solves-mount', count: 'cp-count-cf', getList: () => cpState.cfSolves, idleLabel: () => `${cpState.cfCount} Codeforces Solves`, unit: 'CF Solves' },
      { input: 'cp-search-lc', mount: 'lc-recent-solves-mount', count: 'cp-count-lc', getList: () => cpState.lcSolves, idleLabel: () => `${cpState.lcSolves.length} LeetCode Solves`, unit: 'LC Solves' },
      { input: 'cp-search-cses', mount: 'cses-recent-solves-mount', count: 'cp-count-cses', getList: () => cpState.csesSolves, idleLabel: () => `${cpState.csesSolves.length} CSES Solves`, unit: 'CSES Solves' }
    ];

    bindings.forEach((b) => {
      const inp = document.getElementById(b.input);
      if (!inp || inp.dataset.bound) return;
      inp.dataset.bound = 'true';
      inp.addEventListener('input', (e) => {
        const list = b.getList();
        const q = e.target.value;
        const filtered = filterSolves(list, q);
        renderList(document.getElementById(b.mount), filtered);
        const countEl = document.getElementById(b.count);
        if (countEl) {
          countEl.textContent = q.trim()
            ? `Showing ${filtered.length} of ${list.length} ${b.unit}`
            : b.idleLabel();
        }
      });
    });
  }

  async function fetchWithTimeout(url, options = {}, timeoutMs = 4500) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      return await fetch(url, { ...options, signal: controller.signal });
    } finally {
      clearTimeout(timer);
    }
  }

  async function fetchSVGFromSources(sources, timeoutMs = 6500) {
    for (const src of sources) {
      try {
        const headers = src.includes('api.github.com') ? { Accept: 'application/vnd.github.v3.raw' } : {};
        const res = await fetchWithTimeout(src, { cache: 'no-store', headers }, timeoutMs);
        if (res.ok) {
          const text = await res.text();
          if (text.includes('<svg') && text.includes('</svg>')) return text;
        }
      } catch (e) {}
    }
    return '';
  }

  function enhanceSVGMarkup(svgText) {
    return svgText
      .replace(/<g transform="translate\(390,\s*21\)">\s*<rect width="81"/g, '<g transform="translate(380, 21)">\n    <rect width="91"')
      .replace(/letter-spacing="0\.4px">AUTO-SYNC<\/text>/g, 'letter-spacing="0.3px">AUTO-SYNC</text>')
      .replace(/>Problem Solved by platform<\/text>/g, '>Problems Solved by Platform</text>');
  }

  async function autoSyncCPFromRepo(svgTextProvided) {
    const ts = Date.now();
    const mount = document.getElementById('cp-svg-mount');
    const overviewMount = document.getElementById('cp-overview-mount');

    const [statsText, ovText] = await Promise.all([
      svgTextProvided
        ? Promise.resolve(svgTextProvided)
        : fetchSVGFromSources([
            `https://raw.githubusercontent.com/Pri8899/CP/main/assets/codesync-stats.svg?t=${ts}`,
            'https://api.github.com/repos/Pri8899/CP/contents/assets/codesync-stats.svg',
            `assets/codesync-stats.svg?t=${ts}`
          ]),
      fetchSVGFromSources([
        `https://raw.githubusercontent.com/Pri8899/CP/main/assets/overview.svg?t=${ts}`,
        'https://api.github.com/repos/Pri8899/CP/contents/assets/overview.svg',
        `assets/overview.svg?t=${ts}`
      ])
    ]);

    if (mount && statsText) {
      mount.innerHTML = enhanceSVGMarkup(statsText);
      const svgEl = mount.querySelector('svg');
      if (svgEl) {
        svgEl.removeAttribute('width');
        svgEl.removeAttribute('height');
        svgEl.setAttribute('preserveAspectRatio', 'xMidYMid meet');
        svgEl.style.cssText = 'width:100%;max-width:680px;height:auto;display:block;shape-rendering:geometricPrecision;text-rendering:geometricPrecision;';
      }
      svgLoadedFromRemote = true;
    }

    if (overviewMount && ovText) {
      overviewMount.innerHTML = enhanceSVGMarkup(ovText);
      const ovSvg = overviewMount.querySelector('svg');
      if (ovSvg) {
        ovSvg.removeAttribute('width');
        ovSvg.removeAttribute('height');
        ovSvg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
        ovSvg.style.cssText = 'width:100%;max-width:780px;height:auto;display:block;shape-rendering:geometricPrecision;text-rendering:geometricPrecision;';
      }
    }
  }

  function applySVGMetricsToState(svgText) {
    if (!svgText) return;
    const pillRegex = />(CF|LC|CSES|AtCoder|AC|Toph|TP)<\/text>\s*<text[^>]*>(\d+)<\/text>/gi;
    let m;
    while ((m = pillRegex.exec(svgText)) !== null) {
      const k = m[1].toUpperCase();
      const val = parseInt(m[2], 10);
      if (isNaN(val)) continue;
      if (k === 'CF') cpState.cfCount = val;
      else if (k === 'LC') cpState.lcCount = val;
      else if (k === 'CSES') cpState.csesCount = val;
      else if (k === 'AC' || k === 'ATCODER') cpState.acCount = val;
      else if (k === 'TOPH' || k === 'TP') cpState.tophCount = val;
    }

    const totalMatch = svgText.match(/>(\d+)<\/text>\s*<text[^>]*>TOTAL SOLVED<\/text>/i);
    const streakMatch = svgText.match(/>(\d+)<tspan[^>]*>\s*days<\/tspan><\/text>\s*<text[^>]*>CURRENT STREAK<\/text>/i);
    const subsMatch = svgText.match(/>(\d+)<\/text>\s*<text[^>]*>SUBMISSIONS<\/text>/i);
    const accMatch = svgText.match(/>([\d.]+)%?<\/text>\s*<text[^>]*>AC ACCURACY<\/text>/i);
    const dateMatch = svgText.match(/Last Synced:\s*([^<]+)<\/text>/i);

    if (totalMatch) cpState.totalSolved = parseInt(totalMatch[1], 10);
    if (streakMatch) cpState.streakDays = parseInt(streakMatch[1], 10);
    if (subsMatch) cpState.totalSubmissions = parseInt(subsMatch[1], 10);
    if (accMatch) cpState.accuracyPct = parseFloat(accMatch[1]);
    if (dateMatch) cpState.lastSynced = dateMatch[1].trim();
  }

  function parseCPReadmeMarkdown(mdText) {
    if (!mdText) return;
    const lines = mdText.split('\n');
    let cppCount = 0;
    let javaCount = 0;
    const csesParsed = [];
    const lcParsed = [];

    const rowRegex = /^\|\s*\d+\s*\|\s*\*\*([^*]+)\*\*\s*\|\s*\[([^\]]+)\]\(([^)]+)\)\s*\|\s*([^|]+)\|\s*([^|]+)\|\s*([^|]+)\|\s*\[[^\]]*\]\(([^)]+)\)/;
    for (const line of lines) {
      const m = line.match(rowRegex);
      if (!m) continue;
      const plat = m[1].trim().toLowerCase();
      const titleRaw = m[2].trim();
      const cat = m[4].trim();
      const lang = m[5].trim().toLowerCase();
      const dateStr = m[6].trim();
      const solPath = decodeURIComponent(m[7].trim());

      if (lang.includes('c++')) cppCount++;
      else if (lang.includes('java')) javaCount++;

      if (plat === 'cses') {
        const idMatch = titleRaw.match(/CSES-(\d+)\s*-\s*(.+)/i);
        const id = idMatch ? idMatch[1] : solPath.split('/')[1]?.split(' - ')[0] || 'CSES';
        const title = idMatch ? idMatch[2].trim() : titleRaw;
        const dirPath = solPath.split('/')[1] || `${id} - ${title}`;
        csesParsed.push({
          platform: 'CSES',
          id,
          title,
          topic: cat || 'CSES Problem Set',
          diff: cat || 'CSES',
          tags: [cat || 'CSES'],
          time: dateStr || 'Archive',
          path: dirPath
        });
      } else if (plat === 'leetcode') {
        const diffFromPath = /LeetCode\/(Easy|Medium|Hard)\//i.exec(solPath);
        const diff = diffFromPath ? diffFromPath[1] : (LEETCODE_DIFFICULTY_MAP[titleRaw] || 'Medium');
        const cleanTitle = titleRaw.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
        const existing = cpState.lcSolves.find((x) => x.slug === titleRaw);
        lcParsed.push(existing || {
          platform: 'LC',
          id: String(lcParsed.length + 1),
          title: cleanTitle,
          slug: titleRaw,
          diff,
          tags: [m[5].trim()],
          time: dateStr || 'Archive'
        });
      }
    }

    if (cppCount > 0 || javaCount > 0) {
      cpState.langCppCount = cppCount;
      cpState.langJavaCount = javaCount;
      const sum = cppCount + javaCount;
      if (sum > 0) {
        cpState.langCppPct = parseFloat(((cppCount / sum) * 100).toFixed(1));
        cpState.langJavaPct = parseFloat((100 - cpState.langCppPct).toFixed(1));
      }
    }
    if (csesParsed.length > 0) {
      cpState.csesSolves = csesParsed;
      cpState.csesCount = Math.max(cpState.csesCount, csesParsed.length);
    }
    if (lcParsed.length > 0 && lcParsed.length >= cpState.lcSolves.length) {
      cpState.lcCount = Math.max(cpState.lcCount, lcParsed.length);
    }
  }

  async function loadAllLiveDataParallel() {
    // Fallback CF recent list only if live API is unreachable, without clobbering cfCount=137!
    cpState.cfSolves = [
      { platform: 'CF', id: '2231A', title: 'Construct an Array', rating: 800, tags: ['constructive algorithms'], time: 'Recent', contestId: 2231, index: 'A' },
      { platform: 'CF', id: '732A', title: 'Buy a Shovel', rating: 800, tags: ['implementation', 'math'], time: 'Recent', contestId: 732, index: 'A' },
      { platform: 'CF', id: '1256A', title: 'Payment Without Change', rating: 1000, tags: ['math'], time: 'Recent', contestId: 1256, index: 'A' },
      { platform: 'CF', id: '1903A', title: 'Halloumi Boxes', rating: 800, tags: ['greedy', 'sortings'], time: 'Recent', contestId: 1903, index: 'A' },
      { platform: 'CF', id: '472A', title: 'Design Tutorial: Learn from Math', rating: 800, tags: ['math', 'number theory'], time: 'Recent', contestId: 472, index: 'A' },
      { platform: 'CF', id: '25A', title: 'IQ test', rating: 1300, tags: ['brute force'], time: 'Archive', contestId: 25, index: 'A' },
      { platform: 'CF', id: '230A', title: 'Dragons', rating: 1000, tags: ['greedy', 'sortings'], time: 'Archive', contestId: 230, index: 'A' }
    ];

    // Render baseline IMMEDIATELY (0ms) and bind search inputs before any network fetch!
    renderAllTelemetryUI();
    setupSearchInputsImmediate();
    checkCPHashMode({ playAudio: false });

    const ts = Date.now();
    await Promise.allSettled([
      // 1. Live SVG from Pri8899/CP (with inline SVG fallback)
      (async () => {
        const svgText = await fetchSVGFromSources([
          `https://raw.githubusercontent.com/Pri8899/CP/main/assets/codesync-stats.svg?t=${ts}`,
          'https://api.github.com/repos/Pri8899/CP/contents/assets/codesync-stats.svg'
        ], 4500);
        if (svgText) {
          applySVGMetricsToState(svgText);
          await autoSyncCPFromRepo(svgText);
          renderAllTelemetryUI();
        }
      })(),

      // 2. Live Codeforces User Info
      (async () => {
        const res = await fetchWithTimeout('https://codeforces.com/api/user.info?handles=Pri8899', {}, 4500);
        if (!res.ok) return;
        const data = await res.json();
        if (data.status === 'OK' && data.result && data.result.length > 0) {
          const u = data.result[0];
          if (u.rating) cpState.cfRating = u.rating;
          if (u.maxRating) cpState.cfMaxRating = u.maxRating;
          if (u.rank) cpState.cfRank = u.rank;
          renderAllTelemetryUI();
        }
      })(),

      // 3. Live Codeforces Submissions (count=1000 prevents truncation past 300 subs)
      (async () => {
        const res = await fetchWithTimeout('https://codeforces.com/api/user.status?handle=Pri8899&from=1&count=1000', {}, 5000);
        if (!res.ok) return;
        const data = await res.json();
        if (data.status === 'OK' && Array.isArray(data.result) && data.result.length > 0) {
          cpState.cfSubmissions = data.result.length;
          let acSubs = 0;
          const seen = new Set();
          const liveCF = [];
          const tagCounts = {};
          let peak = { rating: 0, id: '25A', name: 'IQ test' };

          data.result.forEach((sub) => {
            if (sub.verdict === 'OK' && sub.problem) {
              acSubs++;
              const cid = sub.problem.contestId || '';
              const idx = sub.problem.index || '';
              const key = `${cid}${idx}`;
              if (!seen.has(key)) {
                seen.add(key);
                const r = sub.problem.rating || 0;
                if (r > peak.rating) {
                  peak = { rating: r, id: key, name: sub.problem.name };
                }
                (sub.problem.tags || []).forEach((t) => {
                  tagCounts[t] = (tagCounts[t] || 0) + 1;
                });
                liveCF.push({
                  platform: 'CF',
                  id: key,
                  title: sub.problem.name,
                  rating: r || 800,
                  tags: sub.problem.tags || [],
                  time: new Date(sub.creationTimeSeconds * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                  contestId: sub.problem.contestId,
                  index: sub.problem.index
                });
              }
            }
          });

          if (liveCF.length > 0) {
            cpState.cfSolves = liveCF;
            cpState.cfCount = Math.max(cpState.cfCount, liveCF.length);
            cpState.cfAcCount = acSubs;
            if (peak.rating > 0) {
              cpState.cfPeakDiff = peak.rating;
              cpState.cfPeakId = peak.id;
              cpState.cfPeakName = peak.name;
            }
            const topTagEntry = Object.entries(tagCounts).sort((a, b) => b[1] - a[1])[0];
            if (topTagEntry) {
              const name = topTagEntry[0].replace(/\b\w/g, (c) => c.toUpperCase());
              cpState.cfTopTag = `${name} (${topTagEntry[1]} AC)`;
              cpState.cfTopTagPct = Math.min(100, Math.round((topTagEntry[1] / liveCF.length) * 100));
            }
            cpState.totalSolved = cpState.cfCount + cpState.lcCount + cpState.csesCount;
            renderAllTelemetryUI();
          }
        }
      })(),

      // 4. Live LeetCode API (isolated so Render.com cold starts never block other platforms)
      (async () => {
        const res = await fetchWithTimeout('https://alfa-leetcode-api.onrender.com/Pri8899/acSubmission?limit=50', {}, 6500);
        if (!res.ok) return;
        const lcData = await res.json();
        if (lcData.submission && Array.isArray(lcData.submission)) {
          let changed = false;
          lcData.submission.forEach((s) => {
            const existing = cpState.lcSolves.find((p) => p.slug === s.titleSlug);
            const formattedTime = s.timestamp
              ? new Date(s.timestamp * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
              : 'Recent';
            if (existing) {
              if (s.timestamp && existing.time !== formattedTime) {
                existing.time = formattedTime;
                changed = true;
              }
            } else {
              cpState.lcSolves.unshift({
                platform: 'LC',
                title: s.title,
                slug: s.titleSlug,
                diff: LEETCODE_DIFFICULTY_MAP[s.titleSlug] || 'Medium',
                tags: [s.lang || 'cpp'],
                time: formattedTime
              });
              changed = true;
            }
          });
          if (changed) {
            cpState.lcCount = Math.max(cpState.lcCount, cpState.lcSolves.length);
            cpState.totalSolved = cpState.cfCount + cpState.lcCount + cpState.csesCount;
            renderAllTelemetryUI();
          }
        }
      })(),

      // 5. Live Pri8899/CP README.md Telemetry (Rate-limit safe via raw.githubusercontent.com)
      (async () => {
        try {
          const mdRes = await fetchWithTimeout(`https://raw.githubusercontent.com/Pri8899/CP/main/README.md?t=${ts}`, { cache: 'no-store' }, 6500);
          if (mdRes.ok) {
            const mdText = await mdRes.text();
            parseCPReadmeMarkdown(mdText);
            cpState.totalSolved = cpState.cfCount + cpState.lcCount + cpState.csesCount;
            renderAllTelemetryUI();
          }
        } catch (e) {}
      })()
    ]);
  }

  let lastSyncTimestamp = Date.now();
  loadAllLiveDataParallel();

  // Continuous live synchronization with Pri8899/CP and Codeforces (every 60s when tab active + on focus)
  setInterval(() => {
    if (document.visibilityState === 'visible') {
      lastSyncTimestamp = Date.now();
      loadAllLiveDataParallel();
    }
  }, 60000);

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && Date.now() - lastSyncTimestamp > 45000) {
      lastSyncTimestamp = Date.now();
      loadAllLiveDataParallel();
    }
  });
})();
