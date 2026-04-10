// =====================================================
// app.js — Main controller
// =====================================================
import { getOne, putItem } from './db.js';
import { t, setLang, getLang } from './i18n.js';
import { renderExerciseList, renderExerciseForm } from './screens/exercises.js';
import { renderWorkoutList, renderWorkoutEditor, renderWorkoutDetail } from './screens/workouts.js';
import { renderSettings } from './screens/settings.js';

// ─────────────────────────────────────────
// App State
// ─────────────────────────────────────────
const state = {
  tab: 'exercises',
  screen: null,
  id: null,
};

// ─────────────────────────────────────────
// Navigation
// ─────────────────────────────────────────
export function navigate(tab, screen, id) {
  state.tab = tab;
  state.screen = screen;
  state.id = id ?? null;
  render();
}

export function rerender() { render(); }

// ─────────────────────────────────────────
// Language (persisted to DB)
// ─────────────────────────────────────────
export async function changeLang(lang) {
  setLang(lang);
  try { await putItem('settings', { key: 'lang', value: lang }); } catch (_) {}
  rerender();
}

// ─────────────────────────────────────────
// Theme (dark / light, persisted to DB)
// ─────────────────────────────────────────
let _theme = 'light';

export function getTheme() { return _theme; }

export async function setTheme(theme) {
  _theme = theme;
  document.documentElement.setAttribute('data-theme', theme === 'dark' ? 'dark' : '');
  try { await putItem('settings', { key: 'theme', value: theme }); } catch (_) {}
}

// ─────────────────────────────────────────
// Categories (stored in DB, with defaults)
// ─────────────────────────────────────────
const DEFAULT_CATEGORIES_NL = ['Rug', 'Benen', 'Armen', 'Schouders', 'Core', 'Borst', 'Overig'];
const DEFAULT_CATEGORIES_EN = ['Back', 'Legs', 'Arms', 'Shoulders', 'Core', 'Chest', 'Other'];

export async function getCategories() {
  try {
    const s = await getOne('settings', 'categories');
    if (s?.value && Array.isArray(s.value) && s.value.length > 0) return s.value;
  } catch (_) {}
  return getLang() === 'nl' ? [...DEFAULT_CATEGORIES_NL] : [...DEFAULT_CATEGORIES_EN];
}

export async function saveCategories(cats) {
  await putItem('settings', { key: 'categories', value: cats });
}

// ─────────────────────────────────────────
// Render
// ─────────────────────────────────────────
async function render() {
  const content = document.getElementById('app-content');
  const backBtn = document.getElementById('header-back');
  const titleEl = document.getElementById('header-title');

  // Active nav tab highlight
  document.querySelectorAll('.nav-btn').forEach(btn =>
    btn.classList.toggle('active', btn.dataset.tab === state.tab)
  );

  // Update nav labels for current language
  document.querySelectorAll('[data-i18n]').forEach(el => {
    el.textContent = t(el.dataset.i18n);
  });

  // Back button visibility
  const isSubScreen = state.screen !== null;
  backBtn.classList.toggle('hidden', !isSubScreen);

  // Title
  const screenTitle = (() => {
    if (state.tab === 'exercises') {
      if (!state.screen) return t('exercises_title');
      return state.id ? t('edit_exercise') : t('add_exercise');
    }
    if (state.tab === 'workouts') {
      if (!state.screen) return t('workouts_title');
      if (state.screen === 'editor') return state.id ? t('edit_workout') : t('add_workout');
      if (state.screen === 'detail') return t('workout_detail_title');
    }
    if (state.tab === 'settings') return t('settings_title');
    return 'FysioApp';
  })();
  titleEl.textContent = screenTitle;

  // Spinner while loading
  content.innerHTML = '<div class="loading-spinner"><div class="spinner"></div></div>';

  if (state.tab === 'exercises') {
    if (!state.screen)              await renderExerciseList(content, navigate);
    else if (state.screen === 'form') await renderExerciseForm(content, navigate, state.id);

  } else if (state.tab === 'workouts') {
    if (!state.screen)                await renderWorkoutList(content, navigate);
    else if (state.screen === 'editor') await renderWorkoutEditor(content, navigate, state.id);
    else if (state.screen === 'detail') await renderWorkoutDetail(content, navigate, state.id);

  } else if (state.tab === 'settings') {
    await renderSettings(content, navigate);
  }
}

// ─────────────────────────────────────────
// Toast
// ─────────────────────────────────────────
let _toastTimer = null;
export function showToast(message, type = '') {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.className = `toast${type ? ' ' + type : ''}`;
  if (_toastTimer) clearTimeout(_toastTimer);
  _toastTimer = setTimeout(() => { toast.classList.add('hidden'); }, 2500);
}

// ─────────────────────────────────────────
// Confirm dialog
// ─────────────────────────────────────────
export function showConfirm(message) {
  return new Promise((resolve) => {
    const overlay = document.getElementById('modal-overlay');
    const box     = document.getElementById('modal-box');

    box.innerHTML = `
      <div class="modal-header">
        <span class="modal-title" style="font-size:15px;font-weight:500">${escHtml(message)}</span>
      </div>
      <div class="modal-body" style="padding:16px 20px 24px">
        <div style="display:flex;gap:10px">
          <button class="btn btn-secondary" style="flex:1" id="confirm-no">${t('cancel')}</button>
          <button class="btn btn-danger"    style="flex:1" id="confirm-yes">${t('delete')}</button>
        </div>
      </div>`;

    overlay.classList.remove('hidden');

    function done(result) { overlay.classList.add('hidden'); resolve(result); }

    box.querySelector('#confirm-yes').onclick = () => done(true);
    box.querySelector('#confirm-no').onclick  = () => done(false);
    overlay.onclick = (e) => { if (e.target === overlay) done(false); };
  });
}

// ─────────────────────────────────────────
// Generic modal
// ─────────────────────────────────────────
export function openModal(html, onRender) {
  const overlay = document.getElementById('modal-overlay');
  const box     = document.getElementById('modal-box');
  box.innerHTML = html;
  overlay.classList.remove('hidden');
  overlay.onclick = (e) => { if (e.target === overlay) closeModal(); };
  if (onRender) onRender(box);
}

export function closeModal() {
  const overlay = document.getElementById('modal-overlay');
  overlay.classList.add('hidden');
  overlay.onclick = null;
}

// ─────────────────────────────────────────
// Init
// ─────────────────────────────────────────
async function init() {
  // Restore language
  try {
    const langSetting = await getOne('settings', 'lang');
    if (langSetting?.value) setLang(langSetting.value);
  } catch (_) {}

  // Restore theme
  try {
    const themeSetting = await getOne('settings', 'theme');
    if (themeSetting?.value) {
      _theme = themeSetting.value;
      if (_theme === 'dark') document.documentElement.setAttribute('data-theme', 'dark');
    }
  } catch (_) {}

  // Bottom nav
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => navigate(btn.dataset.tab, null, null));
  });

  // Back button
  document.getElementById('header-back').addEventListener('click', () => {
    navigate(state.tab, null, null);
  });

  // Register service worker
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').catch(console.warn);
  }

  await render();
}

function escHtml(str) {
  return String(str ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

init();
