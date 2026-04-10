// =====================================================
// screens/exercises.js — Exercise library
// =====================================================
import { getAll, getOne, addItem, putItem, deleteItem } from '../db.js';
import { t, getLang } from '../i18n.js';
import { showToast, showConfirm } from '../app.js';

export async function renderExerciseList(container, navigate) {
  const exercises = await getAll('exercises');
  const lang = getLang();

  container.innerHTML = `
    <div class="screen-content">
      <div class="search-bar">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input type="search" id="exercise-search" placeholder="${t('search')}" autocomplete="off">
      </div>
      <div id="exercise-list"></div>
    </div>
    <button class="fab" id="fab-add-exercise" aria-label="${t('add_exercise')}">
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
      </svg>
    </button>
  `;

  function renderList(filter = '') {
    const listEl = container.querySelector('#exercise-list');
    const filtered = exercises.filter(ex => {
      const name = lang === 'nl' ? ex.nameNl : ex.nameEn;
      return name.toLowerCase().includes(filter.toLowerCase());
    }).sort((a, b) => (lang === 'nl' ? a.nameNl : a.nameEn).localeCompare(lang === 'nl' ? b.nameNl : b.nameEn));

    if (filtered.length === 0) {
      listEl.innerHTML = `
        <div class="empty-state">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/>
            <line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/>
          </svg>
          <p>${exercises.length === 0 ? t('exercises_empty') : t('no_items')}</p>
        </div>`;
      return;
    }

    // Group by category
    const grouped = {};
    filtered.forEach(ex => {
      const cat = ex.category || (lang === 'nl' ? 'Overig' : 'Other');
      if (!grouped[cat]) grouped[cat] = [];
      grouped[cat].push(ex);
    });

    listEl.innerHTML = Object.entries(grouped).sort(([a],[b]) => a.localeCompare(b)).map(([cat, items]) => `
      <p class="section-title">${cat}</p>
      <div class="card">
        ${items.map(ex => {
          const name = lang === 'nl' ? ex.nameNl : ex.nameEn;
          return `
          <div class="card-item" data-id="${ex.id}">
            <div class="card-item-content">
              <div class="card-item-title">${escHtml(name)}</div>
              <div class="card-item-subtitle">${ex.defaultSets} sets × ${ex.defaultReps} herh.</div>
            </div>
            <div class="card-item-actions">
              <button class="btn-icon btn-icon-danger small" data-delete="${ex.id}" aria-label="${t('delete')}">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
                </svg>
              </button>
            </div>
            <svg class="chevron" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </div>`;
        }).join('')}
      </div>
    `).join('');

    // Tap to edit
    listEl.querySelectorAll('.card-item').forEach(el => {
      el.addEventListener('click', (e) => {
        if (e.target.closest('[data-delete]')) return;
        navigate('exercises', 'form', parseInt(el.dataset.id));
      });
    });

    // Delete buttons
    listEl.querySelectorAll('[data-delete]').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const id = parseInt(btn.dataset.delete);
        const ok = await showConfirm(t('confirm_delete'));
        if (!ok) return;
        await deleteItem('exercises', id);
        const idx = exercises.findIndex(ex => ex.id === id);
        if (idx !== -1) exercises.splice(idx, 1);
        renderList(container.querySelector('#exercise-search').value);
      });
    });
  }

  renderList();

  container.querySelector('#exercise-search').addEventListener('input', (e) => {
    renderList(e.target.value);
  });

  container.querySelector('#fab-add-exercise').addEventListener('click', () => {
    navigate('exercises', 'form', null);
  });
}

export async function renderExerciseForm(container, navigate, editId) {
  const exercise = editId ? await getOne('exercises', editId) : null;
  const lang = getLang();

  const categories = t('exercise_categories');

  container.innerHTML = `
    <div class="screen-content">
      <div class="form-section">
        <div class="form-section-title">${t('exercise_info')}</div>

        <div class="form-group">
          <label class="form-label" for="nameNl">${t('exercise_name_nl')} *</label>
          <input class="form-input" id="nameNl" type="text" value="${escHtml(exercise?.nameNl || '')}" autocomplete="off">
          <div class="form-error hidden" id="err-nameNl">${t('required_field')}</div>
        </div>

        <div class="form-group">
          <label class="form-label" for="nameEn">${t('exercise_name_en')} *</label>
          <input class="form-input" id="nameEn" type="text" value="${escHtml(exercise?.nameEn || '')}" autocomplete="off">
          <div class="form-error hidden" id="err-nameEn">${t('required_field')}</div>
        </div>

        <div class="form-group">
          <label class="form-label" for="category">${t('exercise_category')}</label>
          <select class="form-select" id="category">
            ${categories.map(cat => `<option value="${cat}" ${exercise?.category === cat ? 'selected' : ''}>${cat}</option>`).join('')}
          </select>
        </div>

        <div class="form-group">
          <label class="form-label" for="url">${t('exercise_url')}</label>
          <input class="form-input" id="url" type="url" value="${escHtml(exercise?.url || '')}" placeholder="https://" autocomplete="off">
        </div>
      </div>

      <div class="form-section">
        <div class="form-section-title">${t('exercise_defaults')}</div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label" for="defaultSets">${t('exercise_default_sets')}</label>
            <input class="form-input" id="defaultSets" type="number" min="1" max="20" value="${exercise?.defaultSets ?? 3}">
          </div>
          <div class="form-group">
            <label class="form-label" for="defaultReps">${t('exercise_default_reps')}</label>
            <input class="form-input" id="defaultReps" type="number" min="1" max="100" value="${exercise?.defaultReps ?? 10}">
          </div>
        </div>
      </div>

      <div class="form-section">
        <div class="form-section-title">${lang === 'nl' ? 'Instructies' : 'Instructions'}</div>
        <div class="form-group">
          <label class="form-label" for="descNl">${t('exercise_desc_nl')}</label>
          <textarea class="form-textarea" id="descNl" rows="3">${escHtml(exercise?.descriptionNl || '')}</textarea>
        </div>
        <div class="form-group">
          <label class="form-label" for="descEn">${t('exercise_desc_en')}</label>
          <textarea class="form-textarea" id="descEn" rows="3">${escHtml(exercise?.descriptionEn || '')}</textarea>
        </div>
      </div>

      <div class="form-section">
        <button class="btn btn-primary btn-full" id="btn-save-exercise">${t('save')}</button>
        ${editId ? `<button class="btn btn-danger-outline btn-full mt-8" id="btn-delete-exercise">${t('delete')}</button>` : ''}
      </div>
    </div>
  `;

  container.querySelector('#btn-save-exercise').addEventListener('click', async () => {
    const nameNl = container.querySelector('#nameNl').value.trim();
    const nameEn = container.querySelector('#nameEn').value.trim();
    let valid = true;

    if (!nameNl) { container.querySelector('#err-nameNl').classList.remove('hidden'); valid = false; }
    else container.querySelector('#err-nameNl').classList.add('hidden');
    if (!nameEn) { container.querySelector('#err-nameEn').classList.remove('hidden'); valid = false; }
    else container.querySelector('#err-nameEn').classList.add('hidden');

    if (!valid) return;

    const data = {
      nameNl,
      nameEn,
      category: container.querySelector('#category').value,
      url: container.querySelector('#url').value.trim(),
      defaultSets: parseInt(container.querySelector('#defaultSets').value) || 3,
      defaultReps: parseInt(container.querySelector('#defaultReps').value) || 10,
      descriptionNl: container.querySelector('#descNl').value.trim(),
      descriptionEn: container.querySelector('#descEn').value.trim(),
      createdAt: exercise?.createdAt || Date.now(),
    };

    if (editId) {
      await putItem('exercises', { ...data, id: editId });
    } else {
      await addItem('exercises', data);
    }

    showToast(t('save') + ' ✓', 'success');
    navigate('exercises', null, null);
  });

  const delBtn = container.querySelector('#btn-delete-exercise');
  if (delBtn) {
    delBtn.addEventListener('click', async () => {
      const ok = await showConfirm(t('confirm_delete'));
      if (!ok) return;
      await deleteItem('exercises', editId);
      navigate('exercises', null, null);
    });
  }
}

function escHtml(str) {
  return String(str ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
