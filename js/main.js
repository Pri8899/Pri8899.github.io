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
    } else if (action === 'action-view-lc') {
      if ('cp' in slideMap) goToSlide(slideMap['cp'], true);
      setCPMode('lc');
    } else if (action === 'action-view-cf') {
      if ('cp' in slideMap) goToSlide(slideMap['cp'], true);
      setCPMode('cf');
    } else if (action === 'action-view-unified') {
      if ('cp' in slideMap) goToSlide(slideMap['cp'], true);
      setCPMode('unified');
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
  • cf           - View real-time CP metrics & platform breakdown
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
[2] BigOof (Autonomous CP Discord Bot)
[3] CP Archive (Algorithmic Problem Solutions & Templates)`;
    },

    skills: () => {
      setTimeout(() => goToSlide(4, true), 300);
      return `Toolchain: C, C++, Java, Flutter, HTML, iGraphics, Unreal Engine, Roblox Studio, Android Studio, Xcode, VS Code, Git & GitHub.`;
    },

    cf: () => {
      setTimeout(() => {
        goToSlide(3, true);
        setCPMode('cf');
      }, 300);
      return `Codeforces Live Radar (Handle: Pri8899):
Current Rating: 814 (newbie) | Peak: 814 | Target: Pupil (1200) · 67.8% Milestone
Total Solved: 81 problems | Primary Language: C++23 (GCC 14) | Fast I/O · DSA`;
    },

    codeforces: () => terminalCommands.cf(),

    lc: () => {
      setTimeout(() => {
        goToSlide(3, true);
        setCPMode('lc');
      }, 300);
      return `LeetCode Live Telemetry (User: Pri8899):
Total Accepted Solves: 16
• Easy: 6  |  • Medium: 9  |  • Hard: 1
Medium/Hard Ratio: 62.5% | Profile: https://leetcode.com/u/Pri8899/`;
    },

    leetcode: () => terminalCommands.lc(),

    stats: () => {
      setTimeout(() => {
        goToSlide(3, true);
        setCPMode('unified');
      }, 300);
      return `CodeSync Pro Unified Telemetry:
Total Solved: 97 problems (CF: 81 · LC: 16) | Current Streak: 29 days (Active Flame)
AC Accuracy: 57.8% | Submissions: 303 | Status: 100% Synced via CodeSync Pro`;
    },

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

  // ── 8. 100% Fully Automated Multi-Platform Live CP Monitor ──
  // Supports 4 Interactive Views:
  // 1. Unified Multi-Platform Feed (CF: 81 + LC: 16 = 97 Total Solved, 29-day Flame Streak)
  // 2. LeetCode Live Telemetry (16 Solved: 6 Easy, 9 Medium, 1 Hard + Recent AC Stream)
  // 3. Codeforces Radar (814 Rating Newbie, 81 Solved, C++23 Fast I/O + Live API Stream)
  // 4. CodeSync Pro Vector Card (Original animated SVG with electric border & flame streak)

  const cpViewUnified = document.getElementById('cp-view-unified');
  const cpViewLC = document.getElementById('cp-view-lc');
  const cpViewCF = document.getElementById('cp-view-cf');
  const cpCardWrapper = document.getElementById('cp-card-wrapper');

  const btnShowUnified = document.getElementById('btn-show-unified');
  const btnShowLC = document.getElementById('btn-show-lc');
  const btnShowCF = document.getElementById('btn-show-cf');
  const btnShowSVG = document.getElementById('btn-show-svg');

  function setCPMode(mode) {
    playKeyClick();
    const switchBtns = [btnShowUnified, btnShowLC, btnShowCF, btnShowSVG];
    switchBtns.forEach(btn => { if (btn) btn.classList.remove('active'); });

    if (cpViewUnified) cpViewUnified.style.display = 'none';
    if (cpViewLC) cpViewLC.style.display = 'none';
    if (cpViewCF) cpViewCF.style.display = 'none';
    if (cpCardWrapper) cpCardWrapper.style.display = 'none';

    if (mode === 'unified') {
      if (cpViewUnified) cpViewUnified.style.display = 'flex';
      if (btnShowUnified) btnShowUnified.classList.add('active');
    } else if (mode === 'lc') {
      if (cpViewLC) cpViewLC.style.display = 'flex';
      if (btnShowLC) btnShowLC.classList.add('active');
    } else if (mode === 'cf') {
      if (cpViewCF) cpViewCF.style.display = 'flex';
      if (btnShowCF) btnShowCF.classList.add('active');
    } else if (mode === 'svg') {
      if (cpCardWrapper) cpCardWrapper.style.display = 'flex';
      if (btnShowSVG) btnShowSVG.classList.add('active');
      autoSyncCPFromRepo();
    }
  }

  if (btnShowUnified) btnShowUnified.addEventListener('click', () => setCPMode('unified'));
  if (btnShowLC) btnShowLC.addEventListener('click', () => setCPMode('lc'));
  if (btnShowCF) btnShowCF.addEventListener('click', () => setCPMode('cf'));
  if (btnShowSVG) btnShowSVG.addEventListener('click', () => setCPMode('svg'));

  // LeetCode Verified Solves Data (User: Pri8899)
  const leetCodeSolves = [
    { title: 'Search in Rotated Sorted Array', slug: 'search-in-rotated-sorted-array', diff: 'Medium', time: '1d ago' },
    { title: 'Divide Two Integers', slug: 'divide-two-integers', diff: 'Medium', time: '1d ago' },
    { title: 'Remove Duplicates from Sorted Array', slug: 'remove-duplicates-from-sorted-array', diff: 'Easy', time: '1d ago' },
    { title: 'Palindrome Number', slug: 'palindrome-number', diff: 'Easy', time: '1d ago' },
    { title: 'Reverse Integer', slug: 'reverse-integer', diff: 'Medium', time: '1d ago' },
    { title: 'Median of Two Sorted Arrays', slug: 'median-of-two-sorted-arrays', diff: 'Hard', time: '2d ago' },
    { title: 'Two Sum', slug: 'two-sum', diff: 'Easy', time: '2d ago' },
    { title: 'Sort Colors', slug: 'sort-colors', diff: 'Medium', time: '3d ago' },
    { title: 'Search a 2D Matrix', slug: 'search-a-2d-matrix', diff: 'Medium', time: '3d ago' }
  ];

  // Codeforces Default Solves Data (Handle: Pri8899)
  let cfSolves = [
    { id: '1676A', title: 'Lucky?', rating: 800, time: 'Recent' },
    { id: '750A', title: 'New Year and Hurry', rating: 800, time: 'Recent' },
    { id: '1999A', title: 'A+B Again?', rating: 800, time: 'Recent' },
    { id: '230A', title: 'Dragons', rating: 1000, time: 'Recent' },
    { id: '1807A', title: 'Plus or Minus', rating: 800, time: 'Recent' },
    { id: '96A', title: 'Football', rating: 900, time: 'Recent' }
  ];

  function renderLCSolves(mountEl) {
    if (!mountEl) return;
    mountEl.innerHTML = '';
    leetCodeSolves.forEach((s) => {
      const row = document.createElement('div');
      row.className = 'cf-solve-row';
      const diffClass = s.diff.toLowerCase();
      row.innerHTML = `
        <div class="cf-solve-left">
          <span class="platform-tag lc">LC</span>
          <span class="cf-verdict-tag">✓ AC</span>
          <a href="https://leetcode.com/problems/${s.slug}/" target="_blank" rel="noopener noreferrer" class="cf-solve-title">
            ${s.title}
          </a>
        </div>
        <div class="cf-solve-right">
          <span class="lc-diff-badge ${diffClass}">${s.diff}</span>
          <span>${s.time}</span>
        </div>
      `;
      mountEl.appendChild(row);
    });
  }

  function renderCFSolves(mountEl) {
    if (!mountEl) return;
    mountEl.innerHTML = '';
    cfSolves.forEach((s) => {
      const row = document.createElement('div');
      row.className = 'cf-solve-row';
      const contestId = s.id.replace(/[A-Za-z]+/, '');
      const index = s.id.replace(/[0-9]+/, '');
      const cfUrl = contestId ? `https://codeforces.com/contest/${contestId}/problem/${index}` : `https://codeforces.com/problemset`;
      row.innerHTML = `
        <div class="cf-solve-left">
          <span class="platform-tag cf">CF</span>
          <span class="cf-verdict-tag">✓ AC</span>
          <a href="${cfUrl}" target="_blank" rel="noopener noreferrer" class="cf-solve-title">
            ${s.id} · ${s.title}
          </a>
        </div>
        <div class="cf-solve-right">
          <span class="cf-rating-badge">${s.rating ? `${s.rating} pts` : 'Verified'}</span>
          <span>${s.time}</span>
        </div>
      `;
      mountEl.appendChild(row);
    });
  }

  function renderUnifiedSolves(mountEl) {
    if (!mountEl) return;
    mountEl.innerHTML = '';

    // Interleave CF and LC solves for a vibrant, live multi-platform feed
    const combined = [];
    const maxLen = Math.max(cfSolves.length, leetCodeSolves.length);
    for (let i = 0; i < maxLen; i++) {
      if (i < leetCodeSolves.length) combined.push({ type: 'LC', item: leetCodeSolves[i] });
      if (i < cfSolves.length) combined.push({ type: 'CF', item: cfSolves[i] });
    }

    combined.slice(0, 10).forEach(entry => {
      const row = document.createElement('div');
      row.className = 'cf-solve-row';

      if (entry.type === 'LC') {
        const s = entry.item;
        const diffClass = s.diff.toLowerCase();
        row.innerHTML = `
          <div class="cf-solve-left">
            <span class="platform-tag lc">LC</span>
            <span class="cf-verdict-tag">✓ AC</span>
            <a href="https://leetcode.com/problems/${s.slug}/" target="_blank" rel="noopener noreferrer" class="cf-solve-title">
              ${s.title}
            </a>
          </div>
          <div class="cf-solve-right">
            <span class="lc-diff-badge ${diffClass}">${s.diff}</span>
            <span>${s.time}</span>
          </div>
        `;
      } else {
        const s = entry.item;
        const contestId = s.id.replace(/[A-Za-z]+/, '');
        const index = s.id.replace(/[0-9]+/, '');
        const cfUrl = contestId ? `https://codeforces.com/contest/${contestId}/problem/${index}` : `https://codeforces.com/problemset`;
        row.innerHTML = `
          <div class="cf-solve-left">
            <span class="platform-tag cf">CF</span>
            <span class="cf-verdict-tag">✓ AC</span>
            <a href="${cfUrl}" target="_blank" rel="noopener noreferrer" class="cf-solve-title">
              ${s.id} · ${s.title}
            </a>
          </div>
          <div class="cf-solve-right">
            <span class="cf-rating-badge">${s.rating ? `${s.rating} pts` : 'Verified'}</span>
            <span>${s.time}</span>
          </div>
        `;
      }
      mountEl.appendChild(row);
    });
  }

  // Live Codeforces API Streamer
  async function initLiveCPFeeds() {
    const cfMount = document.getElementById('cf-recent-solves-mount');
    const lcMount = document.getElementById('lc-recent-solves-mount');
    const unifiedMount = document.getElementById('unified-recent-solves-mount');

    renderLCSolves(lcMount);
    renderCFSolves(cfMount);
    renderUnifiedSolves(unifiedMount);

    try {
      // 1. Fetch live Codeforces user info
      const uRes = await fetch('https://codeforces.com/api/user.info?handles=Pri8899');
      if (uRes.ok) {
        const uData = await uRes.json();
        if (uData.status === 'OK' && uData.result.length > 0) {
          const user = uData.result[0];
          const ratingEl = document.getElementById('cf-rating-val');
          const maxRatingEl = document.getElementById('cf-max-rating');
          const rankPill = document.getElementById('cf-rank-pill');
          const fillEl = document.getElementById('cf-progress-fill');
          const pctEl = document.getElementById('cf-progress-pct');

          if (ratingEl && user.rating) ratingEl.textContent = user.rating;
          if (maxRatingEl && user.maxRating) maxRatingEl.textContent = `Max: ${user.maxRating}`;
          if (rankPill && user.rank) {
            rankPill.textContent = user.rank.toUpperCase();
            rankPill.className = `cf-rank-pill ${user.rank.toLowerCase()}`;
          }
          if (fillEl && user.rating) {
            const pct = Math.min(100, Math.round((user.rating / 1200) * 100));
            fillEl.style.width = `${pct}%`;
            if (pctEl) pctEl.textContent = `${pct}%`;
          }
        }
      }

      // 2. Fetch live recent Codeforces AC submissions
      const sRes = await fetch('https://codeforces.com/api/user.status?handle=Pri8899&from=1&count=15');
      if (sRes.ok) {
        const sData = await sRes.json();
        if (sData.status === 'OK' && sData.result.length > 0) {
          const liveACs = [];
          const seen = new Set();
          for (const sub of sData.result) {
            if (sub.verdict === 'OK' && sub.problem) {
              const key = `${sub.problem.contestId || ''}${sub.problem.index || ''}`;
              if (!seen.has(key)) {
                seen.add(key);
                liveACs.push({
                  id: key,
                  title: sub.problem.name,
                  rating: sub.problem.rating || 800,
                  time: `${Math.round(sub.timeConsumedMillis || 30)}ms`
                });
              }
            }
          }
          if (liveACs.length > 0) {
            cfSolves = liveACs.slice(0, 6);
            renderCFSolves(cfMount);
            renderUnifiedSolves(unifiedMount);
          }
        }
      }
    } catch (err) {
      console.warn('Codeforces live API stream running on cached telemetry fallback:', err);
    }
  }

  // Auto-Sync SVG inliner
  async function autoSyncCPFromRepo() {
    const mount = document.getElementById('cp-svg-mount');
    if (!mount) return;

    const urls = [
      `codesync-stats.svg?t=${Date.now()}`,
      `https://raw.githubusercontent.com/Pri8899/CP/main/codesync-stats.svg?t=${Date.now()}`
    ];

    for (const url of urls) {
      try {
        const res = await fetch(url, { cache: 'no-store' });
        if (!res.ok) continue;
        const svgText = await res.text();

        if (svgText.includes('<svg') && svgText.includes('</svg>')) {
          mount.innerHTML = svgText;
          const svgEl = mount.querySelector('svg');
          if (svgEl) {
            svgEl.removeAttribute('width');
            svgEl.removeAttribute('height');
            svgEl.setAttribute('preserveAspectRatio', 'xMidYMid meet');
            svgEl.style.width = '100%';
            svgEl.style.maxWidth = '680px';
            svgEl.style.height = 'auto';
            svgEl.style.display = 'block';
          }
          console.log('✅ CP Monitor: 100% automated live SVG loaded from CodeSync Pro');
          return;
        }
      } catch (err) {}
    }

    const img = document.getElementById('codesync-live-img');
    if (img) img.src = `codesync-stats.svg?t=${Date.now()}`;
  }

  // ── 9. BigOof 3x3 Battle Grid Simulator Modal ───────────────────
  const openSimBtn = document.getElementById('btn-open-grid-sim');
  const closeSimBtn = document.getElementById('close-sim-btn');
  const resetSimBtn = document.getElementById('sim-reset-btn');
  const gridSimModal = document.getElementById('grid-sim-modal');
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
          state.p1 = true;
          p1Score += prob.pts;
          updateSimScoreboard();
          setSimLog('FIRST BLOOD', `Player 1 solved ${prob.id} (${prob.title}) for FULL ${prob.pts} pts!`);
        } else if (!state.p2) {
          state.p2 = true;
          const dropPts = Math.round(prob.pts / 3);
          p2Score += dropPts;
          updateSimScoreboard();
          setSimLog('1/3 DROP', `Player 2 solved ${prob.id} after first blood! Awarded ${dropPts} pts (1/3 value).`);
        } else {
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

  // Initialize Features
  initLiveCPFeeds();
})();
