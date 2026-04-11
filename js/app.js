// =====================================================
// app.js — Main controller (4-tab layout)
// Tabs: home | exercises | advice | settings
// =====================================================
import { getOne, putItem } from './db.js';
import { t, setLang, getLang } from './i18n.js';
import { renderRegionBrowser, renderRegionWorkouts } from './screens/home.js';
import { renderExerciseList, renderExerciseForm, renderExerciseSend } from './screens/exercises.js';
import { renderWorkoutEditor, renderWorkoutDetail } from './screens/workouts.js';
import { renderAdviceList, renderAdviceForm } from './screens/advice.js';
import { renderSettings } from './screens/settings.js';

// ─────────────────────────────────────────
// Navigation State
// ─────────────────────────────────────────
const state = {
  tab:    'home',
  screen: null,
  id:     null,
  extra:  null,   // string param (e.g. region name)
};

export function navigate(tab, screen, id, extra = null) {
  state.tab    = tab;
  state.screen = screen;
  state.id     = id ?? null;
  state.extra  = extra ?? null;
  render();
}

export function rerender() { render(); }

// ─────────────────────────────────────────
// Language
// ─────────────────────────────────────────
export async function changeLang(lang) {
  setLang(lang);
  try { await putItem('settings', { key: 'lang', value: lang }); } catch (_) {}
  rerender();
}

// ─────────────────────────────────────────
// Theme
// ─────────────────────────────────────────
let _theme = 'light';
export function getTheme() { return _theme; }
export async function setTheme(theme) {
  _theme = theme;
  document.documentElement.setAttribute('data-theme', theme === 'dark' ? 'dark' : '');
  try { await putItem('settings', { key: 'theme', value: theme }); } catch (_) {}
}

// ─────────────────────────────────────────
// Regions (renamed from Categories)
// ─────────────────────────────────────────
const DEFAULT_REGIONS_NL = ['Rug', 'Benen', 'Armen', 'Schouders', 'Core', 'Borst', 'Overig'];
const DEFAULT_REGIONS_EN = ['Back', 'Legs', 'Arms', 'Shoulders', 'Core', 'Chest', 'Other'];

export async function getRegions() {
  try {
    // Support old key 'categories' for backwards compatibility
    let s = await getOne('settings', 'regions');
    if (!s) s = await getOne('settings', 'categories');
    if (s?.value && Array.isArray(s.value) && s.value.length > 0) return s.value;
  } catch (_) {}
  return getLang() === 'nl' ? [...DEFAULT_REGIONS_NL] : [...DEFAULT_REGIONS_EN];
}

export async function saveRegions(regions) {
  await putItem('settings', { key: 'regions', value: regions });
}

// ─────────────────────────────────────────
// Message Config
// ─────────────────────────────────────────
const DEFAULT_MSG_CONFIG = { greetingNl: '', greetingEn: '', closingNl: '', closingEn: '', showDescriptions: true };

export async function getMsgConfig() {
  try {
    const s = await getOne('settings', 'msgConfig');
    if (s?.value) {
      const v = { ...s.value };
      // Backwards compatibility: migrate single greeting/closing to bilingual fields
      if (v.greeting !== undefined && v.greetingNl === undefined) {
        v.greetingNl = v.greeting || '';
        delete v.greeting;
      }
      if (v.closing !== undefined && v.closingNl === undefined) {
        v.closingNl = v.closing || '';
        delete v.closing;
      }
      return { ...DEFAULT_MSG_CONFIG, ...v };
    }
  } catch (_) {}
  return { ...DEFAULT_MSG_CONFIG };
}

export async function saveMsgConfig(config) {
  await putItem('settings', { key: 'msgConfig', value: config });
}

// ─────────────────────────────────────────
// Render
// ─────────────────────────────────────────
async function render() {
  const content = document.getElementById('app-content');
  const backBtn = document.getElementById('header-back');
  const titleEl = document.getElementById('header-title');

  // Active tab
  document.querySelectorAll('.nav-btn').forEach(btn =>
    btn.classList.toggle('active', btn.dataset.tab === state.tab)
  );

  // Nav labels (for lang changes)
  document.querySelectorAll('[data-i18n]').forEach(el => {
    el.textContent = t(el.dataset.i18n);
  });

  // Back button
  backBtn.classList.toggle('hidden', state.screen === null);

  // Title
  const title = getTitle();
  titleEl.textContent = title;

  // Spinner
  content.innerHTML = '<div class="loading-spinner"><div class="spinner"></div></div>';

  // Route
  if (state.tab === 'home') {
    if (!state.screen)                        await renderRegionBrowser(content, navigate);
    else if (state.screen === 'regionList')   await renderRegionWorkouts(content, navigate, state.extra);
    else if (state.screen === 'detail')       await renderWorkoutDetail(content, navigate, state.id, 'home');
    else if (state.screen === 'editor')       await renderWorkoutEditor(content, navigate, state.id, 'home');

  } else if (state.tab === 'exercises') {
    if (!state.screen)                        await renderExerciseList(content, navigate);
    else if (state.screen === 'form')         await renderExerciseForm(content, navigate, state.id);
    else if (state.screen === 'send')         await renderExerciseSend(content, navigate, state.id);

  } else if (state.tab === 'advice') {
    if (!state.screen)                        await renderAdviceList(content, navigate);
    else if (state.screen === 'form')         await renderAdviceForm(content, navigate, state.id);

  } else if (state.tab === 'settings') {
    await renderSettings(content, navigate);
  }
}

function getTitle() {
  if (state.tab === 'home') {
    if (!state.screen) return t('home_title');
    if (state.screen === 'regionList') return state.extra === '__all__' ? t('all_workouts') : (state.extra || t('home_title'));
    if (state.screen === 'detail')  return t('workout_detail_title');
    if (state.screen === 'editor')  return state.id ? t('edit_workout') : t('add_workout');
  }
  if (state.tab === 'exercises') {
    if (!state.screen) return t('exercises_title');
    if (state.screen === 'form')  return state.id ? t('edit_exercise') : t('add_exercise');
    if (state.screen === 'send')  return t('send_exercise');
  }
  if (state.tab === 'advice') {
    if (!state.screen) return t('advice_title');
    return state.id ? t('edit_advice') : t('add_advice');
  }
  if (state.tab === 'settings') return t('settings_title');
  return 'FysioApp';
}

// ─────────────────────────────────────────
// Toast
// ─────────────────────────────────────────
let _toastTimer = null;
export function showToast(msg, type = '') {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.className = `toast${type ? ' ' + type : ''}`;
  if (_toastTimer) clearTimeout(_toastTimer);
  _toastTimer = setTimeout(() => el.classList.add('hidden'), 2500);
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
        <span class="modal-title" style="font-size:15px;font-weight:500">${esc(message)}</span>
      </div>
      <div class="modal-body" style="padding:16px 20px 24px">
        <div style="display:flex;gap:10px">
          <button class="btn btn-secondary" style="flex:1" id="confirm-no">${t('cancel')}</button>
          <button class="btn btn-danger"    style="flex:1" id="confirm-yes">${t('delete')}</button>
        </div>
      </div>`;
    overlay.classList.remove('hidden');
    const done = (r) => { overlay.classList.add('hidden'); resolve(r); };
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
  try {
    const lang = await getOne('settings', 'lang');
    if (lang?.value) setLang(lang.value);
  } catch (_) {}

  try {
    const theme = await getOne('settings', 'theme');
    if (theme?.value) {
      _theme = theme.value;
      if (_theme === 'dark') document.documentElement.setAttribute('data-theme', 'dark');
    }
  } catch (_) {}

  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => navigate(btn.dataset.tab, null, null));
  });

  document.getElementById('header-back').addEventListener('click', () => {
    // Smart back: go to the right parent screen
    if (state.tab === 'home' && state.screen === 'detail') {
      navigate('home', 'regionList', null, state.extra);
    } else if (state.tab === 'home' && state.screen === 'editor') {
      navigate('home', 'regionList', null, state.extra);
    } else {
      navigate(state.tab, null, null);
    }
  });

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').catch(console.warn);
  }

  await render();
}

export function esc(str) {
  return String(str ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

init();
