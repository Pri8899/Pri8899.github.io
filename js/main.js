/* ══════════════════════════════════════════════════════════════
   Partho Paul — Developer Portfolio Scripts
   Interactive Background Grid, Spotlight, Terminal, Live CF Sync
   ══════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  // ── Audio FX Synthesizer (Mechanical Key Switch Sounds) ───
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  let audioCtx = null;
  let soundEnabled = localStorage.getItem('pri_sound_fx') === 'true';

  function playKeyClick() {
    if (!soundEnabled) return;
    try {
      if (!audioCtx) audioCtx = new AudioContext();
      if (audioCtx.state === 'suspended') audioCtx.resume();
      
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      
      const baseFreq = 180 + Math.random() * 90;
      osc.frequency.setValueAtTime(baseFreq, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(45, audioCtx.currentTime + 0.035);
      
      gain.gain.setValueAtTime(0.06, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.035);
      
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      
      osc.start();
      osc.stop(audioCtx.currentTime + 0.04);
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
      localStorage.setItem('pri_sound_fx', soundEnabled);
      updateSoundBtn();
      if (soundEnabled) playKeyClick();
    });
  }

  // ── System Theme Engine ─────────────────────────────────────
  function setTheme(themeName) {
    if (!themeName || themeName === 'macos' || themeName === 'default') {
      document.documentElement.removeAttribute('data-theme');
      localStorage.removeItem('pri_theme');
      return 'Restored default Apple Sonoma Dark theme.';
    }
    const validThemes = ['tokyo', 'catppuccin', 'matrix', 'cyber'];
    if (!validThemes.includes(themeName)) {
      return `Unknown theme '${themeName}'. Available: tokyo, catppuccin, matrix, cyber, macos`;
    }
    document.documentElement.setAttribute('data-theme', themeName);
    localStorage.setItem('pri_theme', themeName);
    return `Theme switched to '${themeName}'.`;
  }

  const savedTheme = localStorage.getItem('pri_theme');
  if (savedTheme) {
    document.documentElement.setAttribute('data-theme', savedTheme);
  }

  // ── 1. Live Top Menu Bar Clock ──────────────────────────────
  function updateSystemClock() {
    const clockEl = document.getElementById('system-clock');
    if (!clockEl) return;

    const now = new Date();
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    const dayName = days[now.getDay()];
    const monthName = months[now.getMonth()];
    const dateNum = now.getDate();

    let hours = now.getHours();
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;

    clockEl.textContent = `${dayName} ${monthName} ${dateNum}  ${hours}:${minutes} ${ampm}`;
  }
  updateSystemClock();
  setInterval(updateSystemClock, 1000);

  // Set current year in footer
  const yearEl = document.getElementById('current-year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // ── 2. Interactive Info Desk Slide Controller ───────────────
  const slideMap = {
    'terminal': 0,
    'about': 1,
    'projects': 2,
    'cp': 3,
    'skills': 4,
    'contact': 5
  };

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
  const menuNavItems = document.querySelectorAll('.menubar-item[href^="#"]');
  const prevBtn = document.getElementById('desk-prev-btn');
  const nextBtn = document.getElementById('desk-next-btn');

  function updateGlider(activeItem) {
    if (!glider || !activeItem) return;
    const left = activeItem.offsetLeft;
    const width = activeItem.offsetWidth;
    glider.style.left = `${left}px`;
    glider.style.width = `${width}px`;
  }

  function goToSlide(targetIdx, smoothScroll = false) {
    if (isNaN(targetIdx)) return;
    const index = (targetIdx % 6 + 6) % 6; // wrap around cleanly
    currentSlideIndex = index;

    // Shift 600% track: each slide is 16.6667% (100% / 6)
    if (deskTrack) {
      deskTrack.style.transform = `translateX(-${(index * (100 / 6)).toFixed(4)}%)`;
    }

    // Update active slide class
    deskSlides.forEach((s, i) => {
      s.classList.toggle('active-slide', i === index);
    });

    // Update sections-box buttons & sliding glider
    boxItems.forEach((btn, i) => {
      const isActive = i === index;
      btn.classList.toggle('active', isActive);
      if (isActive) {
        updateGlider(btn);
      }
    });

    // Update top menubar navigation links
    menuNavItems.forEach((m) => {
      const href = m.getAttribute('href');
      const targetKey = href ? href.replace('#', '') : '';
      m.classList.toggle('active', slideMap[targetKey] === index);
    });

    // Update status counter
    if (deskCounter) {
      deskCounter.textContent = `DESK 0${index + 1} / 06 · ${slideTitles[index]}`;
    }

    // Smooth scroll into viewport if needed
    if (smoothScroll) {
      const viewport = document.getElementById('desk-slider-viewport');
      if (viewport) {
        const rect = viewport.getBoundingClientRect();
        if (rect.top < 0 || rect.top > 300) {
          window.scrollTo({ top: viewport.offsetTop - 120, behavior: 'smooth' });
        }
      }
    }
  }

  // Initial Glider setup
  setTimeout(() => {
    const initialActive = document.querySelector('.section-box-item.active') || boxItems[0];
    if (initialActive) updateGlider(initialActive);
  }, 100);

  // Resize listener to re-align glider
  window.addEventListener('resize', () => {
    const active = boxItems[currentSlideIndex];
    if (active) updateGlider(active);
  }, { passive: true });

  // Hover & Click on Section Boxes ("when I hover the mouse in the sections box, it slide to the exact side")
  boxItems.forEach((btn) => {
    btn.addEventListener('mouseenter', () => {
      const idx = parseInt(btn.getAttribute('data-index'), 10);
      goToSlide(idx, false);
    });
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const idx = parseInt(btn.getAttribute('data-index'), 10);
      goToSlide(idx, false);
    });
  });

  // Next & Prev Chevrons (Pill arrows & Floating Side arrows)
  const prevBtns = document.querySelectorAll('.desk-prev-action, #desk-prev-btn');
  const nextBtns = document.querySelectorAll('.desk-next-action, #desk-next-btn');

  prevBtns.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      goToSlide(currentSlideIndex - 1);
    });
  });
  nextBtns.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      goToSlide(currentSlideIndex + 1);
    });
  });

  // Keyboard Navigation: Left/Right arrows & 1-6 keys
  window.addEventListener('keydown', (e) => {
    if (document.activeElement && (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA')) {
      return;
    }
    if (e.key === 'ArrowLeft') {
      goToSlide(currentSlideIndex - 1);
    } else if (e.key === 'ArrowRight') {
      goToSlide(currentSlideIndex + 1);
    } else if (e.key >= '1' && e.key <= '6') {
      goToSlide(parseInt(e.key, 10) - 1);
    }
  });

  // Touch Swipe on mobile
  const sliderViewport = document.getElementById('desk-slider-viewport');
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
      if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy)) {
        if (dx < 0) goToSlide(currentSlideIndex + 1);
        else goToSlide(currentSlideIndex - 1);
      }
    }, { passive: true });
  }

  // Menubar and In-Page Anchor Links
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const href = anchor.getAttribute('href');
      if (!href || href === '#') return;
      const key = href.replace('#', '');
      if (key in slideMap) {
        e.preventDefault();
        goToSlide(slideMap[key], true);
      }
    });
  });

  // ── 3. macOS Spotlight Search (⌘K / Ctrl+K) ──────────────────
  const spotlightBtn = document.getElementById('spotlight-btn');
  const spotlightOverlay = document.getElementById('spotlight-overlay');
  const spotlightInput = document.getElementById('spotlight-input');
  const spotlightResults = document.getElementById('spotlight-results');

  function openSpotlight() {
    if (!spotlightOverlay) return;
    spotlightOverlay.classList.add('open');
    if (spotlightInput) {
      spotlightInput.value = '';
      spotlightInput.focus();
      filterSpotlight('');
    }
  }

  function closeSpotlight() {
    if (!spotlightOverlay) return;
    spotlightOverlay.classList.remove('open');
  }

  if (spotlightBtn) {
    spotlightBtn.addEventListener('click', openSpotlight);
  }

  if (spotlightOverlay) {
    spotlightOverlay.addEventListener('click', (e) => {
      if (e.target === spotlightOverlay) closeSpotlight();
    });
  }

  window.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      if (spotlightOverlay && spotlightOverlay.classList.contains('open')) {
        closeSpotlight();
      } else {
        openSpotlight();
      }
    } else if (e.key === 'Escape' && spotlightOverlay && spotlightOverlay.classList.contains('open')) {
      closeSpotlight();
    }
  });

  function filterSpotlight(query) {
    if (!spotlightResults) return;
    const items = spotlightResults.querySelectorAll('.spotlight-item');
    const q = query.toLowerCase().trim();
    let hasVisible = false;

    items.forEach((item, index) => {
      const text = item.textContent.toLowerCase();
      const match = !q || text.includes(q);
      item.style.display = match ? 'flex' : 'none';
      if (match && !hasVisible) {
        items.forEach((i) => i.classList.remove('selected'));
        item.classList.add('selected');
        hasVisible = true;
      }
    });
  }

  function handleSpotlightAction(action) {
    if (!action) return;
    closeSpotlight();
    if (action === 'action-grid-sim') {
      openGridSimulator();
    } else if (action.startsWith('theme:')) {
      const th = action.replace('theme:', '');
      setTheme(th);
    } else if (action.startsWith('#')) {
      const key = action.replace('#', '');
      if (key in slideMap) {
        goToSlide(slideMap[key], true);
      }
    }
  }

  if (spotlightInput) {
    spotlightInput.addEventListener('input', (e) => {
      filterSpotlight(e.target.value);
    });

    spotlightInput.addEventListener('keydown', (e) => {
      playKeyClick();
      const items = Array.from(spotlightResults.querySelectorAll('.spotlight-item')).filter(
        (i) => i.style.display !== 'none'
      );
      const currentIndex = items.findIndex((i) => i.classList.contains('selected'));

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        const nextIndex = (currentIndex + 1) % items.length;
        items.forEach((i) => i.classList.remove('selected'));
        if (items[nextIndex]) items[nextIndex].classList.add('selected');
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        const prevIndex = (currentIndex - 1 + items.length) % items.length;
        items.forEach((i) => i.classList.remove('selected'));
        if (items[prevIndex]) items[prevIndex].classList.add('selected');
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const active = items[currentIndex] || items[0];
        if (active) {
          const action = active.getAttribute('data-action');
          handleSpotlightAction(action);
        }
      }
    });
  }

  if (spotlightResults) {
    spotlightResults.querySelectorAll('.spotlight-item').forEach((item) => {
      item.addEventListener('click', () => {
        const action = item.getAttribute('data-action');
        handleSpotlightAction(action);
      });
    });
  }

  // ── 4. Interactive macOS Terminal Command Runner ────────────
  const termInput = document.getElementById('term-input');
  const termHistory = document.getElementById('term-history');
  const commandHistory = [];
  let historyIdx = -1;

  function runMatrixRain() {
    if (!termHistory) return;
    const rainEl = document.createElement('pre');
    rainEl.style.color = '#00ff66';
    rainEl.style.fontFamily = 'var(--font-mono)';
    rainEl.style.fontSize = '11px';
    rainEl.style.lineHeight = '1.3';
    rainEl.style.textShadow = '0 0 8px #00ff66';
    rainEl.textContent = '01010101 MATRIX RECOGNIZED 01010101\n';
    termHistory.appendChild(rainEl);

    let frames = 0;
    const chars = '010101100101010101010123456789ABCDEF@#$%&*';
    const interval = setInterval(() => {
      let line = '';
      for (let i = 0; i < 48; i++) {
        line += chars[Math.floor(Math.random() * chars.length)];
      }
      rainEl.textContent += line + '\n';
      termHistory.scrollTop = termHistory.scrollHeight;
      frames++;
      if (frames > 12) {
        clearInterval(interval);
        rainEl.textContent += '\n[SYSTEM] Neural link calibrated. Type "theme macos" to restore.\n';
        setTheme('matrix');
      }
    }, 120);
  }

  const terminalCommands = {
    help: () => `Available terminal commands:
  • projects     - Inspect featured software & bot projects
  • skills       - View languages, frameworks, & CS toolchain
  • cf           - Fetch real-time Codeforces API metrics & recent ACs
  • battle / vs  - Launch interactive 3x3 Lockout Grid battle simulator
  • theme <name> - Switch theme (tokyo, catppuccin, matrix, cyber, macos)
  • sound        - Toggle mechanical keyboard audio FX (ON/OFF)
  • matrix       - Execute neural digital rain sequence
  • about        - View academic degree & student credentials
  • whoami       - Partho Prithom Paul Sujoy (AUST CSE)
  • contact      - Reach out directly via email
  • clear        - Clear the terminal console output`,

    whoami: () => `Partho Paul
B.Sc. in Computer Science and Engineering · CSE Batch 54
Ahsanullah University of Science and Technology · 2nd Year, 1st Semester`,

    projects: () => {
      setTimeout(() => goToSlide(2, true), 300);
      return `Navigating to Projects Explorer...
[1] CodeSync Pro Extension (Universal Browser CP Auto-Sync)
[2] BigOof (Production Discord Bot with 3x3 Battle Grid & 9AM Upsolve Radar)
[3] CP Archive (Algorithmic Problem Solutions & Templates)`;
    },

    skills: () => {
      setTimeout(() => goToSlide(4, true), 300);
      return `Toolchain: C, C++, Java, Flutter, HTML, iGraphics, Unreal Engine, Roblox Studio, Android Studio, Xcode, VS Code, Git & GitHub.`;
    },

    cf: async () => {
      setTimeout(() => goToSlide(3, true), 400);
      try {
        const res = await fetch('https://codeforces.com/api/user.info?handles=Pri8899');
        const data = await res.json();
        if (data.status === 'OK' && data.result.length > 0) {
          const u = data.result[0];
          return `[OK] Codeforces Live Telemetry (Handle: ${u.handle})
Current Rating: ${u.rating || 0} (${u.rank || 'newbie'}) | Peak: ${u.maxRating || 0} (${u.maxRank || 'newbie'})
Target: Pupil (1200) · 67.8% Milestone
Status: Active Contender · Telemetry 100% Synced from Official API`;
        }
      } catch (err) {}
      return `Codeforces Handle: pri8899
Total Solved: 52+ problems | Current Rating: 814 (newbie) | Peak: 814 | Target: Pupil (1200)`;
    },

    codeforces: () => terminalCommands.cf(),

    battle: () => {
      setTimeout(openGridSimulator, 300);
      return `Launching BigOof 3x3 Lockout Grid Simulator (Option B: 1/3 Point Drop Active)...`;
    },

    vs: () => terminalCommands.battle(),

    theme: (arg) => {
      if (!arg) return `Usage: theme <name>\nAvailable themes: tokyo, catppuccin, matrix, cyber, macos`;
      return setTheme(arg.toLowerCase());
    },

    sound: () => {
      soundEnabled = !soundEnabled;
      localStorage.setItem('pri_sound_fx', soundEnabled);
      updateSoundBtn();
      if (soundEnabled) playKeyClick();
      return `Mechanical sound effects: ${soundEnabled ? 'ENABLED' : 'DISABLED'}`;
    },

    matrix: () => {
      runMatrixRain();
      return `Initiating Neural Digital Rain sequence...`;
    },

    about: () => {
      setTimeout(() => goToSlide(1, true), 300);
      return `Ahsanullah University of Science and Technology
Degree: B.Sc. in Computer Science & Engineering (2nd Year, 1st Semester · CSE Batch 54)
Location: Dhaka, Bangladesh`;
    },

    contact: () => {
      setTimeout(() => goToSlide(5, true), 300);
      return `Email: parthopaul8899@gmail.com | GitHub: https://github.com/Pri8899`;
    },

    sudo: () => `Permission denied: Partho Paul is already root administrator.`,

    clear: () => {
      if (termHistory) termHistory.innerHTML = '';
      return '';
    }
  };

  if (termInput) {
    termInput.addEventListener('keydown', async (e) => {
      playKeyClick();

      // Tab completion
      if (e.key === 'Tab') {
        e.preventDefault();
        const current = termInput.value.trim().toLowerCase();
        if (!current) return;
        const available = Object.keys(terminalCommands);
        const matches = available.filter(cmd => cmd.startsWith(current));
        if (matches.length === 1) {
          termInput.value = matches[0];
        } else if (matches.length > 1) {
          const entry = document.createElement('div');
          entry.className = 'term-hist-item';
          entry.innerHTML = `<pre class="term-hist-out" style="color: #79c0ff; font-weight: 600;">${matches.join('   ')}</pre>`;
          termHistory.appendChild(entry);
          termHistory.scrollTop = termHistory.scrollHeight;
        }
        return;
      }

      if (e.key === 'Enter') {
        const rawLine = termInput.value.trim();
        if (!rawLine) return;

        commandHistory.push(rawLine);
        historyIdx = commandHistory.length;
        termInput.value = '';

        const parts = rawLine.split(/\s+/);
        const cmd = parts[0].toLowerCase();
        const arg = parts.slice(1).join(' ');

        if (cmd === 'clear') {
          terminalCommands.clear();
          return;
        }

        const entry = document.createElement('div');
        entry.className = 'term-hist-item';
        entry.innerHTML = `
          <div class="term-hist-cmd">pri8899@aust:~$ ${rawLine}</div>
          <pre class="term-hist-out" style="color: #8b949e;">⚡ Processing...</pre>
        `;
        termHistory.appendChild(entry);
        termHistory.scrollTop = termHistory.scrollHeight;

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

        entry.querySelector('.term-hist-out').style.color = '';
        entry.querySelector('.term-hist-out').textContent = output;
        termHistory.scrollTop = termHistory.scrollHeight;
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

  // ── 5. Finder Sidebar Category Filter ─────────────────────────
  const sidebarItems = document.querySelectorAll('.finder-sidebar .sidebar-item');
  const projectTiles = document.querySelectorAll('.project-tile');
  const finderContent = document.querySelector('.finder-content');
  const finderItemCount = document.getElementById('finder-item-count');

  sidebarItems.forEach((item) => {
    item.addEventListener('click', () => {
      sidebarItems.forEach((i) => i.classList.remove('active'));
      item.classList.add('active');

      const filter = item.getAttribute('data-filter');
      let visibleCount = 0;

      projectTiles.forEach((tile) => {
        const cat = tile.getAttribute('data-cat');
        if (filter === 'all' || cat === filter) {
          tile.style.display = 'flex';
          tile.style.opacity = '0';
          tile.style.transform = 'scale(0.96)';
          visibleCount++;
          setTimeout(() => {
            tile.style.transition = 'opacity 0.25s ease, transform 0.25s var(--spring-ease)';
            tile.style.opacity = '1';
            tile.style.transform = 'scale(1)';
          }, 15);
        } else {
          tile.style.display = 'none';
        }
      });

      if (finderContent) {
        if (visibleCount === 1) {
          finderContent.classList.add('single-item');
        } else {
          finderContent.classList.remove('single-item');
        }
      }

      if (finderItemCount) {
        finderItemCount.textContent = `${visibleCount} Item${visibleCount === 1 ? '' : 's'}`;
      }
    });
  });

  // ── 6. Interactive 3D Card Tilt & Cursor Spotlight Follower ───
  const tiltCards = document.querySelectorAll('[data-tilt]');
  tiltCards.forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Update CSS variables for radial spotlight glare
      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);

      // 3D Tilt calculation
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = ((y - centerY) / centerY) * -3;
      const rotateY = ((x - centerX) / centerX) * 3;

      card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(1.005, 1.005, 1.005)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
      card.style.transition = 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)';
    });

    card.addEventListener('mouseenter', () => {
      card.style.transition = 'none';
    });
  });

  // ── 6A. Magnetic Button Hover Interaction ───────────────────
  const magneticElements = document.querySelectorAll('.mac-btn, .spotlight-trigger, .desk-nav-btn');
  magneticElements.forEach((el) => {
    el.addEventListener('mousemove', (e) => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      el.style.transform = `translate3d(${(x * 0.22).toFixed(1)}px, ${(y * 0.22).toFixed(1)}px, 0) scale(1.04)`;
    });
    el.addEventListener('mouseleave', () => {
      el.style.transform = '';
    });
  });

  // ── 6B. Dynamic Background Hover & Fluid Particle Matrix ────────
  (function initBackgroundInteractive() {
    const root = document.documentElement;
    const aurora1 = document.getElementById('aurora-1');
    const aurora2 = document.getElementById('aurora-2');
    const aurora3 = document.getElementById('aurora-3');
    const aurora4 = document.getElementById('aurora-4');
    const canvas = document.getElementById('bg-canvas');

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let targetX = mouseX;
    let targetY = mouseY;
    let prevMouseX = mouseX;
    let prevMouseY = mouseY;
    let mouseSpeed = 0;

    // Interactive Shockwaves, Sparks & Fluid Cursor Wake
    const ripples = [];
    const sparks = [];
    const cursorTrails = [];

    // Track mouse with velocity & passive listener
    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      const vx = mouseX - prevMouseX;
      const vy = mouseY - prevMouseY;
      mouseSpeed = Math.min(Math.hypot(vx, vy), 60);
      prevMouseX = mouseX;
      prevMouseY = mouseY;

      // Spawn fluid cursor trailing stardust when sweeping across background
      if (mouseSpeed > 2 && cursorTrails.length < 50) {
        const count = Math.min(3, Math.max(1, Math.floor(mouseSpeed / 10)));
        for (let i = 0; i < count; i++) {
          cursorTrails.push({
            x: mouseX + (Math.random() - 0.5) * 10,
            y: mouseY + (Math.random() - 0.5) * 10,
            vx: vx * 0.12 + (Math.random() - 0.5) * 1.4,
            vy: vy * 0.12 + (Math.random() - 0.5) * 1.4,
            radius: Math.random() * 2.2 + 1.2,
            alpha: 0.85,
            decay: Math.random() * 0.025 + 0.02,
            color: Math.random() > 0.45 ? '0, 242, 254' : '191, 90, 242'
          });
        }
      }
    }, { passive: true });

    // Smooth Lerp Engine for Aurora Parallax & Spotlight Aura
    function updateCursorLighting() {
      targetX += (mouseX - targetX) * 0.12;
      targetY += (mouseY - targetY) * 0.12;

      root.style.setProperty('--cursor-x', `${targetX.toFixed(1)}px`);
      root.style.setProperty('--cursor-y', `${targetY.toFixed(1)}px`);

      // Gentle organic parallax shift on ambient aurora orbs
      const normX = (targetX / window.innerWidth) - 0.5;
      const normY = (targetY / window.innerHeight) - 0.5;

      if (aurora1) aurora1.style.transform = `translate3d(${(normX * 45).toFixed(1)}px, ${(normY * 35).toFixed(1)}px, 0)`;
      if (aurora2) aurora2.style.transform = `translate3d(${(-normX * 55).toFixed(1)}px, ${(normY * 40).toFixed(1)}px, 0)`;
      if (aurora3) aurora3.style.transform = `translate3d(${(normX * 35).toFixed(1)}px, ${(-normY * 45).toFixed(1)}px, 0)`;
      if (aurora4) aurora4.style.transform = `translate3d(${(-normX * 40).toFixed(1)}px, ${(-normY * 30).toFixed(1)}px, 0)`;

      requestAnimationFrame(updateCursorLighting);
    }
    requestAnimationFrame(updateCursorLighting);

    function triggerShockwave(x, y) {
      ripples.push({
        x,
        y,
        radius: 6,
        maxRadius: Math.min(window.innerWidth, window.innerHeight) * 0.45,
        alpha: 0.9,
        speed: 7.5
      });

      // Spawn radiant starburst sparks
      for (let i = 0; i < 18; i++) {
        const angle = (Math.PI * 2 * i) / 18 + (Math.random() - 0.5) * 0.35;
        const speed = Math.random() * 5 + 2.5;
        sparks.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          radius: Math.random() * 2.2 + 1,
          alpha: 1,
          decay: Math.random() * 0.024 + 0.016,
          color: i % 2 === 0 ? '0, 242, 254' : '191, 90, 242'
        });
      }
    }

    window.addEventListener('click', (e) => {
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

    // 80 Deep Cyber Cosmic Nodes with 3D Depth Planes
    const particleCount = Math.min(85, Math.max(45, Math.floor(window.innerWidth / 18)));
    const particles = [];
    const colors = [
      'rgba(0, 242, 254, ',   // Neon Cyan
      'rgba(191, 90, 242, ',  // Neon Purple
      'rgba(0, 122, 255, ',   // Electric Blue
      'rgba(255, 255, 255, '   // Star White
    ];

    for (let i = 0; i < particleCount; i++) {
      const z = Math.random() * 1.5 + 0.5; // 3D depth layer
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.35 * z,
        vy: (Math.random() - 0.5) * 0.35 * z,
        fx: 0, // fluid force offset
        fy: 0,
        z: z,
        radius: (Math.random() * 1.5 + 0.8) * Math.min(z, 1.4),
        colorBase: colors[Math.floor(Math.random() * colors.length)],
        baseAlpha: (Math.random() * 0.3 + 0.2) * Math.min(z, 1.2),
        pulseSpeed: Math.random() * 0.02 + 0.01,
        pulseOffset: Math.random() * Math.PI * 2
      });
    }

    let time = 0;
    function renderCanvasScene() {
      if (document.hidden) {
        requestAnimationFrame(renderCanvasScene);
        return;
      }

      ctx.clearRect(0, 0, width, height);
      time += 1;

      // 1. Draw Shockwave Rings & Particle Deflection
      for (let i = ripples.length - 1; i >= 0; i--) {
        const rip = ripples[i];
        rip.radius += rip.speed;
        rip.alpha -= 0.016;

        if (rip.alpha <= 0 || rip.radius > rip.maxRadius) {
          ripples.splice(i, 1);
          continue;
        }

        ctx.beginPath();
        ctx.arc(rip.x, rip.y, rip.radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(0, 242, 254, ${(rip.alpha * 0.5).toFixed(3)})`;
        ctx.lineWidth = 1.8;
        ctx.stroke();

        // Push nearby particles outward in a physical impulse wave
        for (let p of particles) {
          const d = Math.hypot(p.x - rip.x, p.y - rip.y);
          if (Math.abs(d - rip.radius) < 40 && d > 0) {
            const push = (1 - Math.abs(d - rip.radius) / 40) * 4.5 * rip.alpha;
            p.fx += ((p.x - rip.x) / d) * push;
            p.fy += ((p.y - rip.y) / d) * push;
          }
        }
      }

      // 2. Draw Cursor Wake Trails (Fluid Glowing Stardust Wake)
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
        ctx.shadowColor = `rgba(${t.color}, 0.8)`;
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // 3. Draw Sparks Burst
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

      // 4. Update & Render Background Particles with Fluid Swirl
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Natural organic drift + fluid displacement
        p.x += p.vx + p.fx;
        p.y += p.vy + p.fy;

        // Spring damping on fluid forces
        p.fx *= 0.92;
        p.fy *= 0.92;

        // Wrap around boundaries
        if (p.x < -20) p.x = width + 20;
        else if (p.x > width + 20) p.x = -20;
        if (p.y < -20) p.y = height + 20;
        else if (p.y > height + 20) p.y = -20;

        // Distance from smoothed cursor position
        const dx = targetX - p.x;
        const dy = targetY - p.y;
        const dist = Math.hypot(dx, dy);
        const maxDist = 180;

        let alpha = p.baseAlpha + Math.sin(time * p.pulseSpeed + p.pulseOffset) * 0.12;
        let radius = p.radius;

        // Proximity hover interaction: Fluid Vortex Swirl & Laser Glow
        if (dist < maxDist && dist > 0) {
          const prox = 1 - dist / maxDist;
          alpha = Math.min(0.95, alpha + prox * 0.55);
          radius = p.radius * (1 + prox * 0.8);

          // Glowing laser filament connection to cursor
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(targetX, targetY);
          ctx.strokeStyle = `rgba(0, 242, 254, ${(prox * 0.25).toFixed(3)})`;
          ctx.lineWidth = 0.9;
          ctx.stroke();

          // Fluid vortex swirl velocity around cursor
          const normalX = dx / dist;
          const normalY = dy / dist;
          const tangentX = -normalY;
          const tangentY = normalX;

          // Gentle repulsion + swirl eddy
          p.fx -= normalX * prox * 0.4;
          p.fy -= normalY * prox * 0.4;
          p.fx += tangentX * prox * 0.35;
          p.fy += tangentY * prox * 0.35;
        }

        // Draw particle dot with glow
        ctx.beginPath();
        ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
        ctx.fillStyle = `${p.colorBase}${alpha.toFixed(3)})`;
        if (dist < maxDist) {
          ctx.shadowColor = 'rgba(0, 242, 254, 0.7)';
          ctx.shadowBlur = 12;
        }
        ctx.fill();
        ctx.shadowBlur = 0;

        // Constellation filaments between neighboring particles
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const pDist = Math.hypot(p.x - p2.x, p.y - p2.y);
          if (pDist < 95) {
            const lineAlpha = (1 - pDist / 95) * 0.12 * Math.min(p.z, p2.z);
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(160, 210, 255, ${lineAlpha.toFixed(3)})`;
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }
      }

      requestAnimationFrame(renderCanvasScene);
    }
    requestAnimationFrame(renderCanvasScene);
  })();

  // ── 7. Number Counting Animation ─────────────────────────────
  function animateValue(el, target, isDecimal = false) {
    if (!el || isNaN(target)) return;
    const duration = 1200;
    const startTime = performance.now();

    function step(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = eased * target;

      el.textContent = isDecimal ? current.toFixed(1) : Math.round(current);

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        el.textContent = isDecimal ? target.toFixed(1) : target;
      }
    }

    requestAnimationFrame(step);
  }

  // ── 8. Live Codeforces Telemetry & Dual-Mode CP Activity Monitor ──
  async function initLiveCodeforcesHUD() {
    const hudContainer = document.getElementById('cf-dynamic-hud');
    const svgWrapper = document.getElementById('cp-card-wrapper');
    const btnHud = document.getElementById('btn-show-hud');
    const btnSvg = document.getElementById('btn-show-svg');

    // View Switcher logic
    function setCpMode(mode) {
      if (mode === 'svg') {
        if (hudContainer) hudContainer.style.display = 'none';
        if (svgWrapper) svgWrapper.style.display = 'flex';
        if (btnHud) btnHud.classList.remove('active');
        if (btnSvg) btnSvg.classList.add('active');
      } else {
        if (hudContainer) hudContainer.style.display = 'flex';
        if (svgWrapper) svgWrapper.style.display = 'none';
        if (btnHud) btnHud.classList.add('active');
        if (btnSvg) btnSvg.classList.remove('active');
      }
      playKeyClick();
    }

    if (btnHud) btnHud.addEventListener('click', () => setCpMode('hud'));
    if (btnSvg) btnSvg.addEventListener('click', () => setCpMode('svg'));

    // 1. Fetch User Info from Codeforces API
    try {
      const infoRes = await fetch('https://codeforces.com/api/user.info?handles=Pri8899');
      const infoData = await infoRes.json();
      if (infoData.status === 'OK' && infoData.result.length > 0) {
        const user = infoData.result[0];
        const rating = user.rating || 0;
        const maxRating = user.maxRating || rating;
        const rank = user.rank || 'newbie';

        const ratingEl = document.getElementById('cf-rating-val');
        if (ratingEl) ratingEl.textContent = rating;

        const maxRatingEl = document.getElementById('cf-max-rating');
        if (maxRatingEl) maxRatingEl.textContent = `Max: ${maxRating}`;

        const rankPill = document.getElementById('cf-rank-pill');
        if (rankPill) {
          rankPill.textContent = rank.toUpperCase();
          rankPill.className = `cf-rank-pill ${rank.toLowerCase()}`;
        }

        // Target milestone progress (Pupil @ 1200)
        const targetRating = 1200;
        const pct = Math.min(Math.max((rating / targetRating) * 100, 15), 100).toFixed(1);
        const progressFill = document.getElementById('cf-progress-fill');
        if (progressFill) progressFill.style.width = `${pct}%`;

        const progressPct = document.getElementById('cf-progress-pct');
        if (progressPct) progressPct.textContent = `${pct}%`;

        // Relative last online time
        const lastOnlineTime = user.lastOnlineTimeSeconds;
        if (lastOnlineTime) {
          const diffHours = Math.floor((Date.now() / 1000 - lastOnlineTime) / 3600);
          const timeEl = document.getElementById('cf-last-active-time');
          if (timeEl) {
            timeEl.textContent = diffHours <= 4 ? 'Active Recently' : `Active ${diffHours}h ago`;
          }
        }
      }
    } catch (err) {
      console.warn('CF user.info API fallback:', err);
    }

    // 2. Fetch Recent Submissions & Calculate Solved Count
    try {
      const statusRes = await fetch('https://codeforces.com/api/user.status?handle=Pri8899&from=1&count=25');
      const statusData = await statusRes.json();
      if (statusData.status === 'OK' && statusData.result) {
        const subs = statusData.result;
        const acceptedMap = new Map();

        subs.forEach((sub) => {
          if (sub.verdict === 'OK' && sub.problem) {
            const key = `${sub.problem.contestId || ''}${sub.problem.index}`;
            if (!acceptedMap.has(key)) {
              acceptedMap.set(key, sub);
            }
          }
        });

        // Update verified solve count
        const solvedCountEl = document.getElementById('cf-solved-count');
        if (solvedCountEl) {
          const totalAC = Math.max(acceptedMap.size, 52);
          solvedCountEl.textContent = `${totalAC}+`;
        }

        // Render Recent Solves List
        const mountEl = document.getElementById('cf-recent-solves-mount');
        if (mountEl && acceptedMap.size > 0) {
          mountEl.innerHTML = '';
          const recentList = Array.from(acceptedMap.values()).slice(0, 4);

          recentList.forEach((sub) => {
            const p = sub.problem;
            const cid = p.contestId;
            const idx = p.index;
            const probLink = cid ? `https://codeforces.com/contest/${cid}/problem/${idx}` : '#';
            const ratingBadge = p.rating ? `<span class="cf-rating-badge">${p.rating} pts</span>` : '';
            const execTime = `${sub.timeConsumedMillis || 0}ms`;

            const row = document.createElement('div');
            row.className = 'cf-solve-row';
            row.innerHTML = `
              <div class="cf-solve-left">
                <span class="cf-verdict-tag">✓ AC</span>
                <a href="${probLink}" target="_blank" rel="noopener noreferrer" class="cf-solve-title">
                  ${cid ? `${cid}${idx} · ` : ''}${p.name}
                </a>
              </div>
              <div class="cf-solve-right">
                ${ratingBadge}
                <span>${execTime}</span>
              </div>
            `;
            mountEl.appendChild(row);
          });
        }
      }
    } catch (err) {
      console.warn('CF user.status API fallback:', err);
    }

    // 3. Background attempt to load SVG from Pri8899/CP (for SVG view mode)
    const svgMount = document.getElementById('cp-svg-mount');
    if (svgMount) {
      const SVG_URL = `https://raw.githubusercontent.com/Pri8899/CP/main/codesync-stats.svg?t=${Date.now()}`;
      try {
        const res = await fetch(SVG_URL, { cache: 'no-store' });
        if (res.ok) {
          const svgText = await res.text();
          if (svgText.includes('<svg') && svgText.includes('</svg>')) {
            svgMount.innerHTML = svgText;
            const svgEl = svgMount.querySelector('svg');
            if (svgEl) {
              svgEl.removeAttribute('width');
              svgEl.removeAttribute('height');
              svgEl.setAttribute('preserveAspectRatio', 'xMidYMid meet');
              svgEl.style.width = '100%';
              svgEl.style.maxWidth = '680px';
              svgEl.style.height = 'auto';
              svgEl.style.display = 'block';
            }
          }
        }
      } catch (err) {}
    }
  }

  // ── 9. BigOof 3x3 Lockout Grid Simulator (Option B: 1/3 Drop) ──
  const gridSimModal = document.getElementById('grid-sim-modal');
  const openSimBtn = document.getElementById('btn-open-grid-sim');
  const closeSimBtn = document.getElementById('close-sim-btn');
  const resetSimBtn = document.getElementById('sim-reset-btn');
  const simGridMount = document.getElementById('sim-grid-3x3');
  const simP1ScoreEl = document.getElementById('sim-p1-score');
  const simP2ScoreEl = document.getElementById('sim-p2-score');
  const simLogMsg = document.querySelector('#sim-battle-log .log-msg');
  const simLogTime = document.querySelector('#sim-battle-log .log-time');

  const simProblems = [
    { id: '1807A', title: 'Plus or Minus', pts: 100, rating: 800 },
    { id: '1676A', title: 'Lucky?', pts: 100, rating: 800 },
    { id: '750A', title: 'New Year and Hurry', pts: 200, rating: 800 },
    { id: '1999A', title: 'A+B Again?', pts: 200, rating: 800 },
    { id: '230A', title: 'Dragons', pts: 300, rating: 1000 },
    { id: '96A', title: 'Football', pts: 300, rating: 900 },
    { id: '69A', title: 'Young Physicist', pts: 400, rating: 1000 },
    { id: '1899A', title: 'Game with Integers', pts: 400, rating: 900 },
    { id: '158A', title: 'Next Round', pts: 500, rating: 800 }
  ];

  let p1Score = 0;
  let p2Score = 0;
  const tileStates = simProblems.map(() => ({ p1: false, p2: false }));

  function updateSimScoreboard() {
    if (simP1ScoreEl) simP1ScoreEl.textContent = `${p1Score} pts`;
    if (simP2ScoreEl) simP2ScoreEl.textContent = `${p2Score} pts`;
  }

  function setSimLog(tag, msg) {
    if (simLogTime) simLogTime.textContent = `[${tag}]`;
    if (simLogMsg) simLogMsg.textContent = msg;
  }

  function renderSimGrid() {
    if (!simGridMount) return;
    simGridMount.innerHTML = '';

    simProblems.forEach((prob, idx) => {
      const state = tileStates[idx];
      const tile = document.createElement('div');
      tile.className = 'sim-tile';

      let statusText = 'UNSOLVED';
      if (state.p1 && state.p2) {
        tile.classList.add('both-solved');
        const p2Pts = Math.round(prob.pts / 3);
        statusText = `P1: ${prob.pts} | P2: ${p2Pts} (1/3)`;
      } else if (state.p1) {
        tile.classList.add('p1-first');
        statusText = `👑 P1 Solved (+${prob.pts})`;
      }

      tile.innerHTML = `
        <div class="tile-pts">${prob.pts} PTS</div>
        <div class="tile-rating">${prob.id} · ${prob.rating}r</div>
        <div class="tile-status">${statusText}</div>
      `;

      tile.addEventListener('click', () => {
        playKeyClick();
        if (!state.p1) {
          // First Blood: Player 1 solves for 100% full points
          state.p1 = true;
          p1Score += prob.pts;
          updateSimScoreboard();
          setSimLog('FIRST BLOOD', `Player 1 solved ${prob.id} (${prob.title}) for FULL ${prob.pts} pts!`);
        } else if (!state.p2) {
          // Option B: Player 2 solves without lockout, gets 1/3 point drop!
          state.p2 = true;
          const dropPts = Math.round(prob.pts / 3);
          p2Score += dropPts;
          updateSimScoreboard();
          setSimLog('1/3 DROP', `Player 2 solved ${prob.id} after first blood! Awarded ${dropPts} pts (1/3 value).`);
        } else {
          // Third click: Reset tile
          p1Score -= prob.pts;
          p2Score -= Math.round(prob.pts / 3);
          state.p1 = false;
          state.p2 = false;
          updateSimScoreboard();
          setSimLog('RESET', `Tile ${prob.id} reset to unsolved state.`);
        }
        renderSimGrid();
      });

      simGridMount.appendChild(tile);
    });
  }

  function openGridSimulator() {
    if (!gridSimModal) return;
    gridSimModal.classList.add('open');
    renderSimGrid();
    playKeyClick();
  }

  function closeGridSimulator() {
    if (!gridSimModal) return;
    gridSimModal.classList.remove('open');
    playKeyClick();
  }

  function resetGridSimulator() {
    p1Score = 0;
    p2Score = 0;
    tileStates.forEach((s) => {
      s.p1 = false;
      s.p2 = false;
    });
    updateSimScoreboard();
    setSimLog('RESET', '3x3 Grid Battle reset. Click tiles to start battle simulation!');
    renderSimGrid();
    playKeyClick();
  }

  if (openSimBtn) openSimBtn.addEventListener('click', openGridSimulator);
  if (closeSimBtn) closeSimBtn.addEventListener('click', closeGridSimulator);
  if (resetSimBtn) resetSimBtn.addEventListener('click', resetGridSimulator);
  if (gridSimModal) {
    gridSimModal.addEventListener('click', (e) => {
      if (e.target === gridSimModal) closeGridSimulator();
    });
  }

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && gridSimModal && gridSimModal.classList.contains('open')) {
      closeGridSimulator();
    }
  });

  // Initialize features
  initLiveCodeforcesHUD();
})();
