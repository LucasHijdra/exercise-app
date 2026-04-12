// =====================================================
// screens/exercises.js — Exercise library + individual send
// =====================================================
import { getAll, getOne, addItem, putItem, deleteItem } from '../db.js';
import { t, tLang, getLang } from '../i18n.js';
import { showToast, showConfirm, getRegions, getMsgConfig, esc } from '../app.js';

// ─────────────────────────────────────────
// Exercise List
// ─────────────────────────────────────────
export async function renderExerciseList(container, navigate) {
  const exercises = await getAll('exercises');
  const regions   = await getRegions();
  const lang      = getLang();

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
    }).sort((a, b) => {
      const na = lang === 'nl' ? a.nameNl : a.nameEn;
      const nb = lang === 'nl' ? b.nameNl : b.nameEn;
      return na.localeCompare(nb);
    });

    if (filtered.length === 0) {
      listEl.innerHTML = `
        <div class="empty-state">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <rect x="2" y="9.5" width="4" height="5" rx="1"/>
            <rect x="18" y="9.5" width="4" height="5" rx="1"/>
            <line x1="6" y1="12" x2="18" y2="12" stroke-width="2"/>
            <rect x="6" y="10.5" width="2" height="3" rx="0.5"/>
            <rect x="16" y="10.5" width="2" height="3" rx="0.5"/>
          </svg>
          <p>${exercises.length === 0 ? t('exercises_empty') : t('no_items')}</p>
        </div>`;
      return;
    }

    // Group by region
    const grouped = {};
    filtered.forEach(ex => {
      const cat = ex.category || (lang === 'nl' ? 'Overig' : 'Other');
      if (!grouped[cat]) grouped[cat] = [];
      grouped[cat].push(ex);
    });

    listEl.innerHTML = Object.entries(grouped).sort(([a], [b]) => {
      const idxA = regions.indexOf(a);
      const idxB = regions.indexOf(b);
      if (idxA === -1 && idxB === -1) return a.localeCompare(b);
      if (idxA === -1) return 1;
      if (idxB === -1) return -1;
      return idxA - idxB;
    }).map(([region, items]) => `
      <p class="section-title">${esc(region)}</p>
      <div class="card">
        ${items.map(ex => {
          const name = lang === 'nl' ? ex.nameNl : ex.nameEn;
          return `
          <div class="card-item" data-id="${ex.id}">
            <div class="card-item-content">
              <div class="card-item-title">${esc(name)}</div>
              <div class="card-item-subtitle">${ex.defaultSets} sets × ${ex.defaultReps} herh.</div>
            </div>
            <div class="card-item-actions">
              <button class="btn-icon small" data-send="${ex.id}" title="${t('send_exercise')}" aria-label="${t('send_exercise')}">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
                </svg>
              </button>
              <button class="btn-icon btn-icon-danger small" data-delete="${ex.id}" aria-label="${t('delete')}">
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
        }).join('')}
      </div>`).join('');

    listEl.querySelectorAll('.card-item').forEach(el => {
      el.addEventListener('click', (e) => {
        if (e.target.closest('[data-send]') || e.target.closest('[data-delete]')) return;
        navigate('exercises', 'form', parseInt(el.dataset.id));
      });
    });

    listEl.querySelectorAll('[data-send]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        navigate('exercises', 'send', parseInt(btn.dataset.send));
      });
    });

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
  container.querySelector('#exercise-search').addEventListener('input', (e) => renderList(e.target.value));
  container.querySelector('#fab-add-exercise').addEventListener('click', () => navigate('exercises', 'form', null));
}

// ─────────────────────────────────────────
// Exercise Form (add / edit)
// ─────────────────────────────────────────
export async function renderExerciseForm(container, navigate, editId) {
  const exercise = editId ? await getOne('exercises', editId) : null;
  const regions  = await getRegions();

  container.innerHTML = `
    <div class="screen-content">
      <div class="form-section">
        <div class="form-section-title">${t('exercise_info')}</div>
        <div class="form-group">
          <label class="form-label" for="nameNl">${t('exercise_name_nl')} *</label>
          <input class="form-input" id="nameNl" type="text" value="${esc(exercise?.nameNl || '')}" autocomplete="off">
          <div class="form-error hidden" id="err-nameNl">${t('required_field')}</div>
        </div>
        <div class="form-group">
          <label class="form-label" for="nameEn">${t('exercise_name_en')} *</label>
          <input class="form-input" id="nameEn" type="text" value="${esc(exercise?.nameEn || '')}" autocomplete="off">
          <div class="form-error hidden" id="err-nameEn">${t('required_field')}</div>
        </div>
        <div class="form-group">
          <label class="form-label" for="region">${t('exercise_region')}</label>
          <select class="form-select" id="region">
            ${regions.map(r => `<option value="${esc(r)}" ${exercise?.category === r ? 'selected' : ''}>${esc(r)}</option>`).join('')}
          </select>
        </div>
        <div class="form-group">
          <label class="form-label" for="url">${t('exercise_url')}</label>
          <input class="form-input" id="url" type="url" value="${esc(exercise?.url || '')}" placeholder="https://" autocomplete="off">
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
        <div class="form-group">
          <label class="form-label">${t('exercise_default_freq')}</label>
          ${renderFreqUI('def-freq', exercise?.defaultFrequency || { type: 'daily', timesPerWeek: 1 })}
        </div>
      </div>

      <div class="form-section">
        <div class="form-section-title">${getLang() === 'nl' ? 'Instructies' : 'Instructions'}</div>
        <div class="form-group">
          <label class="form-label" for="descNl">${t('exercise_desc_nl')}</label>
          <textarea class="form-textarea" id="descNl" rows="3">${esc(exercise?.descriptionNl || '')}</textarea>
        </div>
        <div class="form-group">
          <label class="form-label" for="descEn">${t('exercise_desc_en')}</label>
          <textarea class="form-textarea" id="descEn" rows="3">${esc(exercise?.descriptionEn || '')}</textarea>
        </div>
      </div>

      <div class="form-section">
        <button class="btn btn-primary btn-full" id="btn-save-exercise">${t('save')}</button>
        ${editId ? `<button class="btn btn-danger-outline btn-full mt-8" id="btn-delete-exercise">${t('delete')}</button>` : ''}
      </div>
    </div>
  `;

  // Track default frequency via freq UI binding
  let defFreq = { ...(exercise?.defaultFrequency || { type: 'daily', timesPerWeek: 1 }) };
  bindFreqUI('def-freq', defFreq, (f) => { defFreq = f; });

  container.querySelector('#btn-save-exercise').addEventListener('click', async () => {
    const nameNl = container.querySelector('#nameNl').value.trim();
    const nameEn = container.querySelector('#nameEn').value.trim();
    let valid = true;
    if (!nameNl) { container.querySelector('#err-nameNl').classList.remove('hidden'); valid = false; }
    else          container.querySelector('#err-nameNl').classList.add('hidden');
    if (!nameEn) { container.querySelector('#err-nameEn').classList.remove('hidden'); valid = false; }
    else          container.querySelector('#err-nameEn').classList.add('hidden');
    if (!valid) return;

    const data = {
      nameNl,
      nameEn,
      category: container.querySelector('#region').value,
      url: container.querySelector('#url').value.trim(),
      defaultSets: parseInt(container.querySelector('#defaultSets').value) || 3,
      defaultReps: parseInt(container.querySelector('#defaultReps').value) || 10,
      defaultFrequency: { ...defFreq },
      descriptionNl: container.querySelector('#descNl').value.trim(),
      descriptionEn: container.querySelector('#descEn').value.trim(),
      createdAt: exercise?.createdAt || Date.now(),
    };

    if (editId) await putItem('exercises', { ...data, id: editId });
    else        await addItem('exercises', data);

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

// ─────────────────────────────────────────
// Exercise Send (individual exercise message)
// ─────────────────────────────────────────
export async function renderExerciseSend(container, navigate, exerciseId) {
  const exercise  = await getOne('exercises', exerciseId);
  const msgConfig = await getMsgConfig();
  if (!exercise) { navigate('exercises', null, null); return; }

  const uiLang = getLang();
  let msgLang  = uiLang;

  let item = {
    exerciseId,
    sets: exercise.defaultSets || 3,
    reps: exercise.defaultReps || 10,
    frequency: { ...(exercise.defaultFrequency || { type: 'daily', timesPerWeek: 1 }) },
  };

  function buildMessage(lang) {
    const name = lang === 'nl' ? exercise.nameNl : exercise.nameEn;
    const freq = item.frequency.type === 'daily'
      ? tLang('wa_freq_daily', lang)
      : tLang('wa_freq_weekly', lang, item.frequency.timesPerWeek);
    const setsReps = `${item.sets} ${tLang('wa_sets', lang)} x ${item.reps} ${tLang('wa_reps', lang)}`;
    const desc = lang === 'nl' ? exercise.descriptionNl : exercise.descriptionEn;

    const lines = [`${name}`, `${freq} - ${setsReps}`];
    if (msgConfig.showDescriptions && desc?.trim()) lines.push(desc.trim());
    if (exercise.url?.trim()) lines.push(`${tLang('wa_link_label', lang)}: ${exercise.url}`);

    const greeting      = lang === 'nl' ? (msgConfig.greetingNl      || '') : (msgConfig.greetingEn      || '');
    const exerciseIntro = lang === 'nl' ? (msgConfig.exerciseIntroNl || '') : (msgConfig.exerciseIntroEn || '');
    const closing       = lang === 'nl' ? (msgConfig.closingNl       || '') : (msgConfig.closingEn       || '');
    const parts = [];
    if (greeting.trim()) parts.push(greeting.trim());
    if (exerciseIntro.trim()) parts.push(exerciseIntro.trim());
    parts.push(lines.join('\n'));
    if (closing.trim()) parts.push(closing.trim());
    return parts.join('\n\n');
  }

  function render() {
    const exName = uiLang === 'nl' ? exercise.nameNl : exercise.nameEn;
    container.innerHTML = `
      <div class="screen-content">
        <!-- Exercise info -->
        <div class="card" style="padding:16px;margin-bottom:12px">
          <div style="font-size:16px;font-weight:700;color:var(--text)">${esc(exName)}</div>
          ${exercise.category ? `<span class="badge" style="margin-top:4px">${esc(exercise.category)}</span>` : ''}
        </div>

        <!-- Sets / Reps -->
        <div class="form-section">
          <div class="form-section-title">Sets & Herhalingen</div>
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">${t('sets')}</label>
              <input class="form-input" id="sets-input" type="number" min="1" max="20" value="${item.sets}">
            </div>
            <div class="form-group">
              <label class="form-label">${t('reps')}</label>
              <input class="form-input" id="reps-input" type="number" min="1" max="100" value="${item.reps}">
            </div>
          </div>
        </div>

        <!-- Frequency -->
        <div class="form-section">
          <div class="form-section-title">${t('frequency_label')}</div>
          ${renderFreqUI('ex-freq', item.frequency)}
        </div>

        <!-- Message preview -->
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;margin-top:8px">
          <p class="section-title" style="margin:0">${t('whatsapp_preview_title')}</p>
          <div class="msg-lang-row" style="margin:0">
            <span class="msg-lang-label">${t('msg_lang_label')}:</span>
            <div class="lang-toggle" style="margin:0">
              <button id="msg-nl" class="${msgLang === 'nl' ? 'active' : ''}">🇳🇱 NL</button>
              <button id="msg-en" class="${msgLang === 'en' ? 'active' : ''}">🇬🇧 EN</button>
            </div>
          </div>
        </div>

        <textarea class="msg-preview" id="msg-preview" rows="10">${esc(buildMessage(msgLang))}</textarea>

        <button class="btn btn-primary btn-full" id="btn-copy">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
          </svg>
          ${t('copy_message')}
        </button>
      </div>
    `;

    bindFreqUI('ex-freq', item.frequency, (freq) => {
      item.frequency = freq;
      updatePreview();
    });

    container.querySelector('#sets-input').addEventListener('change', (e) => {
      item.sets = parseInt(e.target.value) || 1;
      updatePreview();
    });
    container.querySelector('#reps-input').addEventListener('change', (e) => {
      item.reps = parseInt(e.target.value) || 1;
      updatePreview();
    });

    container.querySelector('#msg-nl').addEventListener('click', () => { msgLang = 'nl'; updateLangToggle(); updatePreview(); });
    container.querySelector('#msg-en').addEventListener('click', () => { msgLang = 'en'; updateLangToggle(); updatePreview(); });

    container.querySelector('#btn-copy').addEventListener('click', async () => {
      const text = container.querySelector('#msg-preview').value;
      try {
        await navigator.clipboard.writeText(text);
        showToast(t('message_copied'), 'success');
      } catch {
        showToast(t('copy_failed'), 'error');
        container.querySelector('#msg-preview').select();
      }
    });
  }

  function updatePreview() {
    const el = container.querySelector('#msg-preview');
    if (el) el.value = buildMessage(msgLang);
  }

  function updateLangToggle() {
    container.querySelector('#msg-nl')?.classList.toggle('active', msgLang === 'nl');
    container.querySelector('#msg-en')?.classList.toggle('active', msgLang === 'en');
  }

  render();
}

// ─────────────────────────────────────────
// Shared: frequency UI builder
// ─────────────────────────────────────────
export function renderFreqUI(prefix, freq) {
  const isDaily = freq.type === 'daily';
  return `
    <div class="freq-selector">
      <span class="freq-label">${t('frequency_label')}:</span>
      <div class="freq-toggle">
        <button class="${isDaily ? 'active' : ''}" data-freq-type="daily" data-prefix="${prefix}">${t('frequency_daily_short')}</button>
        <button class="${!isDaily ? 'active' : ''}" data-freq-type="weekly" data-prefix="${prefix}">Per week</button>
      </div>
      <input type="number" class="freq-times-input ${isDaily ? 'hidden' : ''}" id="${prefix}-times"
             min="1" max="6" value="${freq.timesPerWeek || 1}">
      <span class="freq-times-label ${isDaily ? 'hidden' : ''}">x</span>
    </div>`;
}

export function bindFreqUI(prefix, freq, onChange) {
  document.querySelectorAll(`[data-prefix="${prefix}"][data-freq-type]`).forEach(btn => {
    btn.addEventListener('click', () => {
      freq.type = btn.dataset.freqType;
      const timesInput = document.getElementById(`${prefix}-times`);
      const timesLabel = timesInput?.nextElementSibling;
      document.querySelectorAll(`[data-prefix="${prefix}"][data-freq-type]`).forEach(b =>
        b.classList.toggle('active', b.dataset.freqType === freq.type)
      );
      timesInput?.classList.toggle('hidden', freq.type === 'daily');
      timesLabel?.classList.toggle('hidden', freq.type === 'daily');
      onChange({ ...freq });
    });
  });

  const timesInput = document.getElementById(`${prefix}-times`);
  if (timesInput) {
    timesInput.addEventListener('change', () => {
      freq.timesPerWeek = parseInt(timesInput.value) || 1;
      onChange({ ...freq });
    });
  }
}

