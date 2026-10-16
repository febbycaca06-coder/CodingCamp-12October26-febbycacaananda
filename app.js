/* ============================================================
   TO-DO LIST LIFE DASHBOARD  –  app.js
   Vanilla JS | LocalStorage | No dependencies
   ============================================================ */

'use strict';

/* ──────────────────────────────────────────────
   SECTION 1 · GREETING & CLOCK
   ────────────────────────────────────────────── */
(function initClock() {
  const clockEl    = document.getElementById('clock');
  const greetEl    = document.getElementById('greeting-text');
  const dateEl     = document.getElementById('date-text');

  const DAYS   = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  const MONTHS = ['January','February','March','April','May','June',
                  'July','August','September','October','November','December'];

  function getGreeting(h) {
    if (h < 5)  return '🌙 Good night!';
    if (h < 12) return '☀️ Good morning!';
    if (h < 17) return '🌤 Good afternoon!';
    if (h < 21) return '🌆 Good evening!';
    return '🌙 Good night!';
  }

  function pad(n) { return String(n).padStart(2, '0'); }

  function tick() {
    const now  = new Date();
    const h    = now.getHours();
    const m    = now.getMinutes();
    const s    = now.getSeconds();
    const day  = DAYS[now.getDay()];
    const date = now.getDate();
    const mon  = MONTHS[now.getMonth()];
    const yr   = now.getFullYear();

    clockEl.textContent  = `${pad(h)}:${pad(m)}:${pad(s)}`;
    greetEl.textContent  = getGreeting(h);
    dateEl.textContent   = `${day}, ${date} ${mon} ${yr}`;
  }

  tick();
  setInterval(tick, 1000);
})();


/* ──────────────────────────────────────────────
   SECTION 2 · FOCUS TIMER (25 min)
   ────────────────────────────────────────────── */
(function initTimer() {
  const TOTAL_SECONDS = 25 * 60;   // 25 minutes

  const displayEl  = document.getElementById('timer-display');
  const barEl      = document.getElementById('timer-bar');
  const statusEl   = document.getElementById('timer-status');
  const startBtn   = document.getElementById('timer-start');
  const stopBtn    = document.getElementById('timer-stop');
  const resetBtn   = document.getElementById('timer-reset');

  let remaining = TOTAL_SECONDS;
  let interval  = null;
  let running   = false;

  function pad(n) { return String(n).padStart(2, '0'); }

  function render() {
    const m = Math.floor(remaining / 60);
    const s = remaining % 60;
    displayEl.textContent = `${pad(m)}:${pad(s)}`;

    const pct = ((TOTAL_SECONDS - remaining) / TOTAL_SECONDS) * 100;
    barEl.style.width = `${100 - pct}%`;
  }

  function start() {
    if (running) return;
    running = true;
    statusEl.textContent = '🔥 Focusing…';
    interval = setInterval(() => {
      if (remaining <= 0) {
        clearInterval(interval);
        running = false;
        statusEl.textContent = '🎉 Session complete! Take a break.';
        displayEl.textContent = '00:00';
        barEl.style.width = '0%';
        return;
      }
      remaining--;
      render();
    }, 1000);
  }

  function stop() {
    clearInterval(interval);
    running = false;
    statusEl.textContent = '⏸ Paused';
  }

  function reset() {
    clearInterval(interval);
    running   = false;
    remaining = TOTAL_SECONDS;
    statusEl.textContent = 'Ready to focus 🎯';
    render();
  }

  startBtn.addEventListener('click', start);
  stopBtn.addEventListener('click', stop);
  resetBtn.addEventListener('click', reset);

  render(); // initial render
})();


/* ──────────────────────────────────────────────
   SECTION 3 · QUICK LINKS
   ────────────────────────────────────────────── */
(function initLinks() {
  const LS_KEY  = 'dashboard_links';
  const form    = document.getElementById('link-form');
  const nameIn  = document.getElementById('link-name');
  const urlIn   = document.getElementById('link-url');
  const listEl  = document.getElementById('links-list');

  /* ── helpers ── */
  function load() {
    try { return JSON.parse(localStorage.getItem(LS_KEY)) || []; }
    catch { return []; }
  }

  function save(data) {
    localStorage.setItem(LS_KEY, JSON.stringify(data));
  }

  function getFavicon(url) {
    try {
      const host = new URL(url).hostname;
      return `https://www.google.com/s2/favicons?domain=${host}&sz=16`;
    } catch {
      return null;
    }
  }

  /* ── render ── */
  function render() {
    const links = load();
    listEl.innerHTML = '';

    if (links.length === 0) {
      listEl.innerHTML = `
        <li class="empty-state">
          <span class="empty-state__icon">🔗</span>
          No links yet. Add your favorites!
        </li>`;
      return;
    }

    links.forEach((link, idx) => {
      const li  = document.createElement('li');
      li.className = 'link-item';

      const favicon = getFavicon(link.url);
      const imgTag  = favicon
        ? `<img src="${favicon}" width="14" height="14" alt="" style="border-radius:3px" />`
        : '';

      li.innerHTML = `
        ${imgTag}
        <a href="${escHtml(link.url)}" target="_blank" rel="noopener noreferrer">
          ${escHtml(link.name)}
        </a>
        <button class="link-item__delete" data-idx="${idx}" title="Remove">✕</button>`;

      listEl.appendChild(li);
    });
  }

  /* ── add ── */
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = nameIn.value.trim();
    let   url  = urlIn.value.trim();

    if (!name || !url) return;

    // auto-prepend https:// if missing
    if (!/^https?:\/\//i.test(url)) url = 'https://' + url;

    const links = load();
    links.push({ name, url });
    save(links);
    render();

    nameIn.value = '';
    urlIn.value  = '';
    nameIn.focus();
  });

  /* ── delete ── */
  listEl.addEventListener('click', (e) => {
    const btn = e.target.closest('.link-item__delete');
    if (!btn) return;
    const idx   = Number(btn.dataset.idx);
    const links = load();
    links.splice(idx, 1);
    save(links);
    render();
  });

  render(); // initial
})();


/* ──────────────────────────────────────────────
   SECTION 4 · TO-DO LIST
   ────────────────────────────────────────────── */
(function initTodo() {
  const LS_KEY    = 'dashboard_todos';
  const form      = document.getElementById('todo-form');
  const taskInput = document.getElementById('task-input');
  const listEl    = document.getElementById('todo-list');
  const clearBtn  = document.getElementById('clear-done');
  const statTotal = document.getElementById('stats-total');
  const statDone  = document.getElementById('stats-done');
  const statPend  = document.getElementById('stats-pending');
  const filterBtns= document.querySelectorAll('.filter-btn');

  // Modal
  const overlay    = document.getElementById('modal-overlay');
  const modalInput = document.getElementById('modal-input');
  const saveBtn    = document.getElementById('modal-save');
  const cancelBtn  = document.getElementById('modal-cancel');

  let activeFilter = 'all';
  let editingId    = null;

  /* ── persistence ── */
  function load() {
    try { return JSON.parse(localStorage.getItem(LS_KEY)) || []; }
    catch { return []; }
  }

  function save(tasks) {
    localStorage.setItem(LS_KEY, JSON.stringify(tasks));
  }

  function uid() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2);
  }

  /* ── stats ── */
  function updateStats(tasks) {
    const done    = tasks.filter(t => t.done).length;
    const pending = tasks.length - done;
    statTotal.textContent = `${tasks.length} task${tasks.length !== 1 ? 's' : ''}`;
    statDone.textContent  = `${done} done`;
    statPend.textContent  = `${pending} pending`;
  }

  /* ── render ── */
  function render() {
    const tasks   = load();
    const visible = tasks.filter(t => {
      if (activeFilter === 'done')    return t.done;
      if (activeFilter === 'pending') return !t.done;
      return true;
    });

    updateStats(tasks);
    listEl.innerHTML = '';

    if (visible.length === 0) {
      const msg = activeFilter === 'done'
        ? 'No completed tasks yet.'
        : activeFilter === 'pending'
        ? '🎉 All tasks done!'
        : '✨ No tasks yet. Add one above!';

      listEl.innerHTML = `
        <li class="empty-state">
          <span class="empty-state__icon">${activeFilter === 'done' ? '🏆' : '📝'}</span>
          ${msg}
        </li>`;
      return;
    }

    visible.forEach((task) => {
      const li = document.createElement('li');
      li.className = `task-item${task.done ? ' done' : ''}`;
      li.dataset.id = task.id;

      li.innerHTML = `
        <input
          type="checkbox"
          class="task-check"
          ${task.done ? 'checked' : ''}
          aria-label="Mark as ${task.done ? 'pending' : 'done'}"
        />
        <span class="task-text">${escHtml(task.text)}</span>
        <div class="task-actions">
          <button class="btn--icon" data-action="edit" title="Edit task">✏️</button>
          <button class="btn--icon" data-action="delete" title="Delete task">🗑️</button>
        </div>`;

      listEl.appendChild(li);
    });
  }

  /* ── add task ── */
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = taskInput.value.trim();
    if (!text) return;

    const tasks = load();
    tasks.unshift({ id: uid(), text, done: false, createdAt: Date.now() });
    save(tasks);
    render();

    taskInput.value = '';
    taskInput.focus();
  });

  /* ── list actions: toggle / edit / delete ── */
  listEl.addEventListener('click', (e) => {
    const li = e.target.closest('.task-item');
    if (!li) return;
    const id = li.dataset.id;

    // Toggle done
    if (e.target.classList.contains('task-check')) {
      const tasks = load();
      const t = tasks.find(t => t.id === id);
      if (t) { t.done = !t.done; save(tasks); render(); }
      return;
    }

    // Edit
    if (e.target.dataset.action === 'edit') {
      const tasks = load();
      const t = tasks.find(t => t.id === id);
      if (!t) return;
      editingId = id;
      modalInput.value = t.text;
      openModal();
      return;
    }

    // Delete
    if (e.target.dataset.action === 'delete') {
      const tasks = load().filter(t => t.id !== id);
      save(tasks);
      render();
    }
  });

  /* ── clear done ── */
  clearBtn.addEventListener('click', () => {
    const tasks = load().filter(t => !t.done);
    save(tasks);
    render();
  });

  /* ── filter ── */
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeFilter = btn.dataset.filter;
      render();
    });
  });

  /* ── modal: open / close / save ── */
  function openModal() {
    overlay.classList.add('active');
    overlay.setAttribute('aria-hidden', 'false');
    setTimeout(() => modalInput.focus(), 50);
  }

  function closeModal() {
    overlay.classList.remove('active');
    overlay.setAttribute('aria-hidden', 'true');
    editingId = null;
  }

  saveBtn.addEventListener('click', () => {
    const newText = modalInput.value.trim();
    if (!newText || !editingId) return;
    const tasks = load();
    const t = tasks.find(t => t.id === editingId);
    if (t) { t.text = newText; save(tasks); render(); }
    closeModal();
  });

  cancelBtn.addEventListener('click', closeModal);

  // Close on overlay backdrop click
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeModal();
  });

  // Save on Enter key in modal
  modalInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') saveBtn.click();
    if (e.key === 'Escape') closeModal();
  });

  render(); // initial
})();


/* ──────────────────────────────────────────────
   UTILITY
   ────────────────────────────────────────────── */
/**
 * Escape HTML special chars to prevent XSS from user-input text.
 * @param {string} str
 * @returns {string}
 */
function escHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
