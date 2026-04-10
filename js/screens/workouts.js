// =====================================================
// screens/workouts.js — Workout list, editor, detail
// =====================================================
import { getAll, getOne, addItem, putItem, deleteItem } from '../db.js';
import { t, getLang } from '../i18n.js';
import { showToast, showConfirm, openModal, closeModal } from '../app.js';

// ─────────────────────────────────────────
// Workout List
// ─────────────────────────────────────────
export async function renderWorkoutList(container, navigate) {
  const workouts = await getAll('workouts');
  workouts.sort((a, b) => b.createdAt - a.createdAt);

  container.innerHTML = `
    <div class="screen-content">
      <div id="workout-list"></div>
    </div>
    <button class="fab" id="fab-add-workout" aria-label="${t('add_workout')}">
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
      </svg>
    </button>
  `;

  const listEl = container.querySelector('#workout-list');

  if (workouts.length === 0) {
    listEl.innerHTML = `
      <div class="empty-state">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/>
          <line x1="16" y1="17" x2="8" y2="17"/>
        </svg>
        <p>${t('workouts_empty')}</p>
      </div>`;
  } else {
    listEl.innerHTML = `
      <div class="card">
        ${workouts.map(w => `
          <div class="card-item" data-id="${w.id}">
            <div class="card-item-content">
              <div class="card-item-title">${escHtml(w.name)}</div>
              <div class="card-item-subtitle">${t('exercise_count', w.items?.length || 0)}</div>
            </div>
            <div class="card-item-actions">
              <button class="btn-icon small" data-edit="${w.id}" aria-label="${t('edit')}">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
              </button>
              <button class="btn-icon btn-icon-danger small" data-delete="${w.id}" aria-label="${t('delete')}">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/>
                  <path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
                </svg>
              </button>
            </div>
            <svg class="chevron" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </div>`).join('')}
      </div>`;

    listEl.querySelectorAll('.card-item').forEach(el => {
      el.addEventListener('click', (e) => {
        if (e.target.closest('[data-edit]') || e.target.closest('[data-delete]')) return;
        navigate('workouts', 'detail', parseInt(el.dataset.id));
      });
    });

    listEl.querySelectorAll('[data-edit]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        navigate('workouts', 'editor', parseInt(btn.dataset.edit));
      });
    });

    listEl.querySelectorAll('[data-delete]').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const ok = await showConfirm(t('confirm_delete'));
        if (!ok) return;
        await deleteItem('workouts', parseInt(btn.dataset.delete));
        navigate('workouts', null, null);
      });
    });
  }

  container.querySelector('#fab-add-workout').addEventListener('click', () => {
    navigate('workouts', 'editor', null);
  });
}

// ─────────────────────────────────────────
// Workout Editor (create + edit)
// ─────────────────────────────────────────
export async function renderWorkoutEditor(container, navigate, editId) {
  const workout = editId ? await getOne('workouts', editId) : null;
  const allExercises = await getAll('exercises');
  const lang = getLang();

  // Working copy of items
  let items = workout?.items ? workout.items.map(i => ({ ...i })) : [];

  function getExerciseName(id) {
    const ex = allExercises.find(e => e.id === id);
    if (!ex) return '?';
    return lang === 'nl' ? ex.nameNl : ex.nameEn;
  }

  function renderItems() {
    const listEl = container.querySelector('#workout-items');

    if (items.length === 0) {
      listEl.innerHTML = `<p style="color:var(--text-secondary);font-size:14px;padding:8px 0">${t('no_exercises_added')}</p>`;
      return;
    }

    listEl.innerHTML = items.map((item, idx) => `
      <div class="workout-exercise-item" data-idx="${idx}">
        <div class="workout-exercise-header">
          <div class="workout-exercise-name">${idx + 1}. ${escHtml(getExerciseName(item.exerciseId))}</div>
          <button class="btn-icon btn-icon-danger small" data-remove="${idx}" aria-label="${t('delete')}">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        <div class="workout-exercise-controls">
          <label>${t('sets')}</label>
          <input type="number" min="1" max="20" value="${item.sets}" data-field="sets" data-idx="${idx}">
          <label style="margin-left:8px">${t('reps')}</label>
          <input type="number" min="1" max="100" value="${item.reps}" data-field="reps" data-idx="${idx}">
          <div style="flex:1"></div>
          <button class="btn-icon small" data-up="${idx}" ${idx === 0 ? 'disabled' : ''} aria-label="Omhoog">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="18 15 12 9 6 15"/>
            </svg>
          </button>
          <button class="btn-icon small" data-down="${idx}" ${idx === items.length - 1 ? 'disabled' : ''} aria-label="Omlaag">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </button>
        </div>
      </div>`).join('');

    // Sets/reps live update
    listEl.querySelectorAll('input[data-field]').forEach(inp => {
      inp.addEventListener('change', () => {
        const idx = parseInt(inp.dataset.idx);
        items[idx][inp.dataset.field] = parseInt(inp.value) || 1;
      });
    });

    listEl.querySelectorAll('[data-remove]').forEach(btn => {
      btn.addEventListener('click', () => {
        items.splice(parseInt(btn.dataset.remove), 1);
        renderItems();
      });
    });

    listEl.querySelectorAll('[data-up]').forEach(btn => {
      btn.addEventListener('click', () => {
        const i = parseInt(btn.dataset.up);
        [items[i - 1], items[i]] = [items[i], items[i - 1]];
        renderItems();
      });
    });

    listEl.querySelectorAll('[data-down]').forEach(btn => {
      btn.addEventListener('click', () => {
        const i = parseInt(btn.dataset.down);
        [items[i], items[i + 1]] = [items[i + 1], items[i]];
        renderItems();
      });
    });
  }

  container.innerHTML = `
    <div class="screen-content">
      <div class="form-section">
        <div class="form-group">
          <label class="form-label" for="workout-name">${t('workout_name')} *</label>
          <input class="form-input" id="workout-name" type="text" value="${escHtml(workout?.name || '')}" autocomplete="off">
          <div class="form-error hidden" id="err-workout-name">${t('required_field')}</div>
        </div>
      </div>

      <div class="form-section">
        <div class="form-section-title">${t('workout_exercises')}</div>
        <div id="workout-items"></div>
        <button class="btn btn-secondary btn-full mt-8" id="btn-add-exercise">
          + ${t('add_exercise_btn')}
        </button>
      </div>

      <div class="form-section">
        <button class="btn btn-primary btn-full" id="btn-save-workout">${t('save')}</button>
      </div>
    </div>
  `;

  renderItems();

  // Add exercise modal
  container.querySelector('#btn-add-exercise').addEventListener('click', () => {
    if (allExercises.length === 0) {
      showToast(t('no_exercises_available'), 'error');
      return;
    }

    let searchQuery = '';
    function getFiltered() {
      return allExercises.filter(ex => {
        const name = lang === 'nl' ? ex.nameNl : ex.nameEn;
        return name.toLowerCase().includes(searchQuery.toLowerCase());
      }).sort((a, b) => (lang === 'nl' ? a.nameNl : a.nameEn).localeCompare(lang === 'nl' ? b.nameNl : b.nameEn));
    }

    function buildModalContent() {
      const filtered = getFiltered();
      return `
        <div class="modal-header">
          <span class="modal-title">${t('select_exercise')}</span>
          <button class="btn-icon" id="modal-close">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        <div class="modal-body">
          <div class="search-bar modal-search">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input type="search" id="modal-search-input" placeholder="${t('search')}" autocomplete="off" value="${searchQuery}">
          </div>
          <div class="card">
            ${filtered.length === 0 ? `<div style="padding:16px;color:var(--text-secondary);font-size:14px">${t('no_items')}</div>` :
              filtered.map(ex => {
                const name = lang === 'nl' ? ex.nameNl : ex.nameEn;
                return `
                <div class="card-item" data-pick="${ex.id}" data-sets="${ex.defaultSets}" data-reps="${ex.defaultReps}">
                  <div class="card-item-content">
                    <div class="card-item-title">${escHtml(name)}</div>
                    <div class="card-item-subtitle">${ex.defaultSets}×${ex.defaultReps} · <span class="badge">${escHtml(ex.category || '')}</span></div>
                  </div>
                </div>`;
              }).join('')}
          </div>
        </div>`;
    }

    openModal(buildModalContent(), (modalBox) => {
      modalBox.querySelector('#modal-close').addEventListener('click', closeModal);

      modalBox.querySelector('#modal-search-input').addEventListener('input', (e) => {
        searchQuery = e.target.value;
        modalBox.innerHTML = buildModalContent();
        rebind(modalBox);
        modalBox.querySelector('#modal-search-input').focus();
        modalBox.querySelector('#modal-search-input').value = searchQuery;
      });

      rebind(modalBox);
    });

    function rebind(modalBox) {
      modalBox.querySelector('#modal-close')?.addEventListener('click', closeModal);
      modalBox.querySelectorAll('[data-pick]').forEach(el => {
        el.addEventListener('click', () => {
          items.push({
            exerciseId: parseInt(el.dataset.pick),
            sets: parseInt(el.dataset.sets) || 3,
            reps: parseInt(el.dataset.reps) || 10,
          });
          closeModal();
          renderItems();
        });
      });
    }
  });

  // Save
  container.querySelector('#btn-save-workout').addEventListener('click', async () => {
    const name = container.querySelector('#workout-name').value.trim();
    if (!name) {
      container.querySelector('#err-workout-name').classList.remove('hidden');
      return;
    }
    container.querySelector('#err-workout-name').classList.add('hidden');

    const data = { name, items, createdAt: workout?.createdAt || Date.now() };

    if (editId) {
      await putItem('workouts', { ...data, id: editId });
    } else {
      await addItem('workouts', data);
    }

    showToast(t('save') + ' ✓', 'success');
    navigate('workouts', null, null);
  });
}

// ─────────────────────────────────────────
// Workout Detail + WhatsApp generator
// ─────────────────────────────────────────
export async function renderWorkoutDetail(container, navigate, workoutId) {
  const workout  = await getOne('workouts', workoutId);
  const allExercises = await getAll('exercises');
  const lang = getLang();

  if (!workout) {
    navigate('workouts', null, null);
    return;
  }

  function getExercise(id) { return allExercises.find(e => e.id === id); }

  // Build WhatsApp message
  function buildMessage() {
    const header = t('wa_header', workout.name);
    const lines = workout.items.map((item, idx) => {
      const ex = getExercise(item.exerciseId);
      if (!ex) return '';
      const name = lang === 'nl' ? ex.nameNl : ex.nameEn;
      let line = `${idx + 1}. *${name}*\n   ${item.sets} ${t('wa_sets')} × ${item.reps} ${t('wa_reps')}`;
      if (ex.url) line += `\n   ${t('wa_link_label')}: ${ex.url}`;
      return line;
    }).filter(Boolean).join('\n\n');

    return `${header}\n\n${lines}\n\n${t('wa_footer')}`;
  }

  const message = buildMessage();

  container.innerHTML = `
    <div class="screen-content">
      <div class="card" style="padding:16px;margin-bottom:12px">
        <div style="display:flex;align-items:center;justify-content:space-between">
          <div>
            <div style="font-size:17px;font-weight:600;color:var(--text)">${escHtml(workout.name)}</div>
            <div style="font-size:13px;color:var(--text-secondary);margin-top:2px">${t('exercise_count', workout.items?.length || 0)}</div>
          </div>
          <button class="btn btn-secondary" id="btn-edit-workout">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
            ${t('edit')}
          </button>
        </div>
      </div>

      ${workout.items?.length > 0 ? `
        <p class="section-title">${t('workout_exercises')}</p>
        ${workout.items.map((item, idx) => {
          const ex = getExercise(item.exerciseId);
          if (!ex) return '';
          const name = lang === 'nl' ? ex.nameNl : ex.nameEn;
          return `
          <div class="workout-detail-exercise">
            <div class="workout-detail-exercise-name">${idx + 1}. ${escHtml(name)}</div>
            <div class="workout-detail-exercise-meta">${item.sets} sets × ${item.reps} ${lang === 'nl' ? 'herhalingen' : 'reps'}</div>
            ${ex.url ? `<div class="workout-detail-exercise-link mt-8"><a href="${escHtml(ex.url)}" target="_blank" rel="noopener">📹 ${escHtml(ex.url)}</a></div>` : ''}
          </div>`;
        }).join('')}
      ` : `<p style="color:var(--text-secondary);font-size:14px;padding:8px 0">${t('no_exercises_added')}</p>`}

      <p class="section-title mt-16">${t('whatsapp_preview_title')}</p>
      <div class="whatsapp-preview" id="wa-preview">${escHtml(message)}</div>

      <button class="btn btn-primary btn-full" id="btn-copy-message">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
        </svg>
        ${t('copy_message')}
      </button>
    </div>
  `;

  container.querySelector('#btn-edit-workout').addEventListener('click', () => {
    navigate('workouts', 'editor', workoutId);
  });

  container.querySelector('#btn-copy-message').addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(message);
      showToast(t('message_copied'), 'success');
    } catch {
      showToast(t('copy_failed'), 'error');
      // Fallback: select the text
      const el = container.querySelector('#wa-preview');
      const range = document.createRange();
      range.selectNodeContents(el);
      window.getSelection().removeAllRanges();
      window.getSelection().addRange(range);
    }
  });
}

function escHtml(str) {
  return String(str ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
