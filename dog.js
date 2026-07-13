/* =========================================================
   CHRONOMATIC 3000 — retro multi-tool device
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {

  /* ---------- mode switching ---------- */
  const modes = ['clock', 'calendar', 'stopwatch', 'advent'];
  let modeIndex = 0;

  const led = document.getElementById('led');
  const ledColors = {
    clock:      { bg: '#39ff14' },
    calendar:   { bg: '#ffb000' },
    stopwatch:  { bg: '#ff3b3b' },
    advent:     { bg: '#3ba7ff' }
  };

  const views = document.querySelectorAll('.view');
  const dots  = document.querySelectorAll('.dot');

  function showMode(index) {
    modeIndex = (index + modes.length) % modes.length;
    const mode = modes[modeIndex];

    views.forEach(v => v.classList.toggle('active', v.dataset.view === mode));
    dots.forEach(d => d.classList.toggle('active', d.dataset.mode === mode));

    const c = ledColors[mode];
    led.style.background = c.bg;
    led.style.boxShadow = `0 0 6px 2px ${c.bg}, inset 0 0 2px #000`;
  }

  document.getElementById('btnLeft').addEventListener('click', () => showMode(modeIndex - 1));
  document.getElementById('btnRight').addEventListener('click', () => showMode(modeIndex + 1));
  dots.forEach(d => d.addEventListener('click', () => showMode(modes.indexOf(d.dataset.mode))));

  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') showMode(modeIndex - 1);
    if (e.key === 'ArrowRight') showMode(modeIndex + 1);
  });

  showMode(0);

  /* ---------- CLOCK ---------- */
  const clockTimeEl  = document.getElementById('clockTime');
  const clockAmPmEl  = document.getElementById('clockAmPm');
  const clockDateEl  = document.getElementById('clockDate');
  const dowNames = ['SUN','MON','TUE','WED','THU','FRI','SAT'];
  const monNames = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];

  function pad(n) { return n.toString().padStart(2, '0'); }

  function updateClock() {
    const now = new Date();
    let h = now.getHours();
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12; if (h === 0) h = 12;
    const m = pad(now.getMinutes());
    const s = pad(now.getSeconds());
    const colon = (now.getSeconds() % 2 === 0) ? ':' : ' ';
    clockTimeEl.textContent = `${pad(h)}${colon}${m}${colon}${s}`;
    clockAmPmEl.textContent = ampm;
    clockDateEl.textContent = `${dowNames[now.getDay()]} ${monNames[now.getMonth()]} ${pad(now.getDate())}, ${now.getFullYear()}`;
  }
  updateClock();
  setInterval(updateClock, 1000);

  /* ---------- CALENDAR ---------- */
  const calMonthYearEl = document.getElementById('calMonthYear');
  const calGridEl = document.getElementById('calGrid');
  const realToday = new Date();
  let viewYear = realToday.getFullYear();
  let viewMonth = realToday.getMonth();

  function renderCalendar() {
    calMonthYearEl.textContent = `${monNames[viewMonth]} ${viewYear}`;
    calGridEl.innerHTML = '';

    ['S','M','T','W','T','F','S'].forEach(d => {
      const el = document.createElement('div');
      el.className = 'cal-dow';
      el.textContent = d;
      calGridEl.appendChild(el);
    });

    const firstDay = new Date(viewYear, viewMonth, 1).getDay();
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

    for (let i = 0; i < firstDay; i++) {
      const blank = document.createElement('div');
      blank.className = 'cal-day blank';
      calGridEl.appendChild(blank);
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const cell = document.createElement('div');
      cell.className = 'cal-day';
      cell.textContent = d;
      if (d === realToday.getDate() && viewMonth === realToday.getMonth() && viewYear === realToday.getFullYear()) {
        cell.classList.add('today');
      }
      calGridEl.appendChild(cell);
    }
  }

  document.getElementById('calPrev').addEventListener('click', (e) => {
    e.stopPropagation();
    viewMonth--;
    if (viewMonth < 0) { viewMonth = 11; viewYear--; }
    renderCalendar();
  });
  document.getElementById('calNext').addEventListener('click', (e) => {
    e.stopPropagation();
    viewMonth++;
    if (viewMonth > 11) { viewMonth = 0; viewYear++; }
    renderCalendar();
  });

  renderCalendar();

  /* ---------- STOPWATCH ---------- */
  const swTimeEl = document.getElementById('swTime');
  const swStartStopBtn = document.getElementById('swStartStop');
  const swResetBtn = document.getElementById('swReset');

  let swRunning = false;
  let swElapsed = 0;      // ms accumulated
  let swStartedAt = 0;
  let swInterval = null;

  function formatStopwatch(ms) {
    const totalCentis = Math.floor(ms / 10);
    const centis = totalCentis % 100;
    const totalSeconds = Math.floor(totalCentis / 100);
    const seconds = totalSeconds % 60;
    const minutes = Math.floor(totalSeconds / 60);
    return `${pad(minutes)}:${pad(seconds)}.${pad(centis)}`;
  }

  function tickStopwatch() {
    const now = Date.now();
    swTimeEl.textContent = formatStopwatch(swElapsed + (now - swStartedAt));
  }

  swStartStopBtn.addEventListener('click', () => {
    if (!swRunning) {
      swRunning = true;
      swStartedAt = Date.now();
      swInterval = setInterval(tickStopwatch, 30);
      swStartStopBtn.textContent = 'STOP';
    } else {
      swRunning = false;
      swElapsed += Date.now() - swStartedAt;
      clearInterval(swInterval);
      swStartStopBtn.textContent = 'START';
    }
  });

  swResetBtn.addEventListener('click', () => {
    swRunning = false;
    clearInterval(swInterval);
    swElapsed = 0;
    swTimeEl.textContent = formatStopwatch(0);
    swStartStopBtn.textContent = 'START';
  });

  /* ---------- ADVENT CALENDAR ---------- */
  // 25 original fun facts — door N unlocks when N <= today's day-of-month (capped at 25)
  const adventFacts = [
    "Honey found in ancient tombs is still edible today — it basically never spoils.",
    "Octopuses have three hearts, and two of them stop beating when they swim.",
    "A day on Venus is longer than a year on Venus.",
    "Bananas are berries, but strawberries technically aren't.",
    "The Eiffel Tower grows about 6 inches taller in summer heat.",
    "Wombat droppings are cube-shaped, which stops them from rolling away.",
    "Sharks existed before trees appeared on Earth.",
    "A bolt of lightning is roughly five times hotter than the sun's surface.",
    "Some cats are allergic to humans due to our skin cells and dander.",
    "The shortest war on record lasted under 40 minutes.",
    "Butterflies taste with their feet instead of a tongue.",
    "There are more possible chess games than atoms in the observable universe.",
    "A single cloud can weigh over a million pounds.",
    "Sea otters hold hands while sleeping so they don't drift apart.",
    "The inventor of the Pringles can is now buried in one.",
    "Hot water can freeze faster than cold water under certain conditions.",
    "Your nose can remember about 50,000 different scents.",
    "A group of flamingos is called a flamboyance.",
    "The Great Wall of China isn't actually visible from space with the naked eye.",
    "Slugs have four noses.",
    "It rains diamonds on Jupiter and Saturn, according to atmospheric models.",
    "Koalas have fingerprints so similar to humans they can confuse crime scenes.",
    "The longest recorded flight of a chicken is about 13 seconds.",
    "Some turtles breathe through their rear ends when submerged.",
    "The first computer 'bug' was an actual moth stuck in a relay."
  ];

  const adventGridEl = document.getElementById('adventGrid');
  const adventRevealEl = document.getElementById('adventReveal');
  const adventDayEl = document.getElementById('adventDay');

  const todaysDay = Math.min(realToday.getDate(), 25);
  adventDayEl.textContent = todaysDay;

  let openedDoors = new Set();
  try {
    const saved = localStorage.getItem('chronomatic-advent-opened');
    if (saved) openedDoors = new Set(JSON.parse(saved));
  } catch (err) { /* localStorage unavailable — proceed without persistence */ }

  function saveOpened() {
    try {
      localStorage.setItem('chronomatic-advent-opened', JSON.stringify([...openedDoors]));
    } catch (err) { /* ignore */ }
  }

  function renderAdvent() {
    adventGridEl.innerHTML = '';
    for (let n = 1; n <= 25; n++) {
      const door = document.createElement('button');
      door.className = 'door';
      door.textContent = n;

      const unlocked = n <= todaysDay;
      if (!unlocked) {
        door.classList.add('locked');
        door.disabled = true;
      } else if (openedDoors.has(n)) {
        door.classList.add('opened');
      }

      door.addEventListener('click', () => {
        if (!unlocked) return;
        openedDoors.add(n);
        door.classList.add('opened');
        adventRevealEl.textContent = `Day ${n}: ${adventFacts[n - 1]}`;
        saveOpened();
      });

      adventGridEl.appendChild(door);
    }
  }

  renderAdvent();
});
