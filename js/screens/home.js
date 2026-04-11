// =====================================================
// screens/home.js — Region browser + workout list
// =====================================================
import { getAll, deleteItem } from '../db.js';
import { t, getLang } from '../i18n.js';
import { showToast, showConfirm, getRegions, esc } from '../app.js';

// ─────────────────────────────────────────
// Region Browser Grid
// ─────────────────────────────────────────
export async function renderRegionBrowser(container, navigate) {
  const regions  = await getRegions();
  const workouts = await getAll('workouts');

  function countForRegion(r) {
    return workouts.filter(w => w.region === r).length;
  }

  container.innerHTML = `
    <div class="screen-content">
      <div class="search-bar" style="margin-bottom:16px">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input type="search" id="region-search" placeholder="${t('search')}" autocomplete="off">
      </div>

      <div id="region-content"></div>
    </div>
  `;

  function renderContent(query = '') {
    const el = container.querySelector('#region-content');

    if (query.trim()) {
      // Search mode — show matching workouts directly
      const q = query.toLowerCase();
      const matches = workouts.filter(w =>
        w.name.toLowerCase().includes(q) ||
        (w.region || '').toLowerCase().includes(q)
      ).sort((a, b) => a.name.localeCompare(b.name));

      if (matches.length === 0) {
        el.innerHTML = `<div class="empty-state"><p>${t('no_items')}</p></div>`;
        return;
      }

      el.innerHTML = `<div class="card">${matches.map(w => workoutRow(w)).join('')}</div>`;
      bindWorkoutRows(el, navigate);
      return;
    }

    // Normal mode — all workouts button + region grid
    const hasRegions = regions.length > 0;

    el.innerHTML = `
      <button class="all-workouts-btn" id="btn-all-workouts">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/>
          <line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/>
          <line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
        </svg>
        <div>
          <div class="all-workouts-btn-title">${t('all_workouts')}</div>
          <div class="all-workouts-btn-sub">${t('exercise_count', workouts.length)}</div>
        </div>
      </button>

      ${hasRegions ? `
        <div class="region-grid">
          ${regions.map(r => `
            <div class="region-card" data-region="${esc(r)}">
              <div class="region-card-name">${esc(r)}</div>
              <div class="region-card-count">${t('exercise_count', countForRegion(r))}</div>
            </div>`).join('')}
        </div>` : `
        <div class="empty-state" style="padding:32px 16px">
          <p>${t('no_regions')}</p>
        </div>`}

      <button class="btn btn-secondary btn-full" id="btn-add-workout" style="margin-top:16px">
        + ${t('add_workout')}
      </button>
    `;

    el.querySelector('#btn-all-workouts').addEventListener('click', () => {
      navigate('home', 'regionList', null, '__all__');
    });

    el.querySelectorAll('.region-card').forEach(card => {
      card.addEventListener('click', () => {
        navigate('home', 'regionList', null, card.dataset.region);
      });
    });

    el.querySelector('#btn-add-workout').addEventListener('click', () => {
      navigate('home', 'editor', null);
    });
  }

  renderContent();

  container.querySelector('#region-search').addEventListener('input', (e) => {
    renderContent(e.target.value);
  });
}

// ─────────────────────────────────────────
// Workout List for a Region
// ─────────────────────────────────────────
export async function renderRegionWorkouts(container, navigate, region) {
  const allWorkouts = await getAll('workouts');
  const isAll = region === '__all__';

  const filtered = isAll
    ? allWorkouts
    : allWorkouts.filter(w => w.region === region);

  filtered.sort((a, b) => a.name.localeCompare(b.name));

  container.innerHTML = `
    <div class="screen-content">
      <div class="search-bar" style="margin-bottom:12px">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input type="search" id="workout-search" placeholder="${t('search')}" autocomplete="off">
      </div>
      <div id="workout-list"></div>
    </div>
    <button class="fab" id="fab-add-workout" aria-label="${t('add_workout')}">
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
      </svg>
    </button>
  `;

  let workouts = [...filtered];

  function renderList(query = '') {
    const listEl = container.querySelector('#workout-list');
    const visible = query
      ? workouts.filter(w => w.name.toLowerCase().includes(query.toLowerCase()))
      : workouts;

    if (visible.length === 0) {
      listEl.innerHTML = `
        <div class="empty-state">
          <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
          </svg>
          <p>${query ? t('no_items') : t('no_workouts_in_region')}</p>
        </div>`;
      return;
    }

    listEl.innerHTML = `<div class="card">${visible.map(w => workoutRow(w)).join('')}</div>`;
    bindWorkoutRows(listEl, navigate, region);

    listEl.querySelectorAll('[data-edit]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        navigate('home', 'editor', parseInt(btn.dataset.edit), region);
      });
    });

    listEl.querySelectorAll('[data-delete]').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const ok = await showConfirm(t('confirm_delete'));
        if (!ok) return;
        const id = parseInt(btn.dataset.delete);
        await deleteItem('workouts', id);
        workouts = workouts.filter(w => w.id !== id);
        renderList(container.querySelector('#workout-search').value);
      });
    });
  }

  renderList();

  container.querySelector('#workout-search').addEventListener('input', (e) => {
    renderList(e.target.value);
  });

  container.querySelector('#fab-add-workout').addEventListener('click', () => {
    navigate('home', 'editor', null, region === '__all__' ? null : region);
  });
}

// ─────────────────────────────────────────
// Shared helpers
// ─────────────────────────────────────────
function workoutRow(w) {
  return `
    <div class="card-item" data-id="${w.id}">
      <div class="card-item-content">
        <div class="card-item-title">${esc(w.name)}</div>
        <div class="workout-card-meta">
          <span style="font-size:13px;color:var(--text-secondary)">${t('exercise_count', w.items?.length || 0)}</span>
          ${w.region ? `<span class="badge">${esc(w.region)}</span>` : ''}
        </div>
      </div>
      <div class="card-item-actions">
        <button class="btn-icon small" data-edit="${w.id}" aria-label="${t('edit')}">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
          </svg>
        </button>
        <button class="btn-icon btn-icon-danger small" data-delete="${w.id}" aria-label="${t('delete')}">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/>
            <path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
          </svg>
        </button>
      </div>
      <svg class="chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="9 18 15 12 9 6"/>
      </svg>
    </div>`;
}

function bindWorkoutRows(el, navigate, region) {
  el.querySelectorAll('.card-item[data-id]').forEach(row => {
    row.addEventListener('click', (e) => {
      if (e.target.closest('[data-edit]') || e.target.closest('[data-delete]')) return;
      navigate('home', 'detail', parseInt(row.dataset.id), region);
    });
  });
}
