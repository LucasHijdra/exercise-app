// =====================================================
// screens/workouts.js — Workout editor + detail/send
// =====================================================
import { getAll, getOne, addItem, putItem, deleteItem } from '../db.js';
import { t, tLang, getLang } from '../i18n.js';
import { showToast, showConfirm, openModal, closeModal,
         getRegions, getMsgConfig, esc } from '../app.js';
import { renderFreqUI, bindFreqUI } from './exercises.js';
import { advTitle, advText } from './advice.js';

// ─────────────────────────────────────────
// Workout Editor (create + edit)
// ─────────────────────────────────────────
export async function renderWorkoutEditor(container, navigate, editId, returnRegion) {
  const workout    = editId ? await getOne('workouts', editId) : null;
  const all        = await getAll('exercises');
  const allAdvice  = await getAll('advice');
  const regions    = await getRegions();
  const lang       = getLang();

  let items       = (workout?.items || []).map(i => ({ ...i }));
  let adviceItems = (workout?.adviceItems || []).map(a => ({ ...a }));

  function exName(id) {
    const ex = all.find(e => e.id === id);
    return ex ? (lang === 'nl' ? ex.nameNl : ex.nameEn) : '?';
  }

  function adviceName(adviceId) {
    const adv = allAdvice.find(a => a.id === adviceId);
    return adv ? advTitle(adv, lang) : '?';
  }

  function renderItems() {
    const listEl = container.querySelector('#workout-items');
    if (items.length === 0) {
      listEl.innerHTML = `<p style="color:var(--text-secondary);font-size:14px;padding:4px 0">${t('no_exercises_added')}</p>`;
      return;
    }
    listEl.innerHTML = items.map((item, idx) => `
      <div class="workout-exercise-item" data-idx="${idx}">
        <div class="workout-exercise-header">
          <div class="workout-exercise-name">${idx + 1}. ${esc(exName(item.exerciseId))}</div>
          <button class="btn-icon btn-icon-danger small" data-remove="${idx}">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        <div class="workout-exercise-controls">
          <label>${t('sets')}</label>
          <input type="number" min="1" max="20" value="${item.sets}" data-field="sets" data-idx="${idx}">
          <label style="margin-left:6px">${t('reps')}</label>
          <input type="number" min="1" max="100" value="${item.reps}" data-field="reps" data-idx="${idx}">
          <div style="flex:1"></div>
          <button class="btn-icon small" data-up="${idx}" ${idx === 0 ? 'disabled' : ''}>↑</button>
          <button class="btn-icon small" data-down="${idx}" ${idx === items.length - 1 ? 'disabled' : ''}>↓</button>
        </div>
      </div>`).join('');

    listEl.querySelectorAll('input[data-field]').forEach(inp => {
      inp.addEventListener('change', () => {
        items[parseInt(inp.dataset.idx)][inp.dataset.field] = parseInt(inp.value) || 1;
      });
    });
    listEl.querySelectorAll('[data-remove]').forEach(btn => {
      btn.addEventListener('click', () => { items.splice(parseInt(btn.dataset.remove), 1); renderItems(); });
    });
    listEl.querySelectorAll('[data-up]').forEach(btn => {
      btn.addEventListener('click', () => {
        const i = parseInt(btn.dataset.up);
        [items[i-1], items[i]] = [items[i], items[i-1]]; renderItems();
      });
    });
    listEl.querySelectorAll('[data-down]').forEach(btn => {
      btn.addEventListener('click', () => {
        const i = parseInt(btn.dataset.down);
        [items[i], items[i+1]] = [items[i+1], items[i]]; renderItems();
      });
    });
  }

  function renderAdviceItems() {
    const el = container.querySelector('#workout-advice-items');
    if (!adviceItems.length) {
      el.innerHTML = `<p style="color:var(--text-secondary);font-size:14px;padding:4px 0">${t('no_advice_added')}</p>`;
      return;
    }
    el.innerHTML = adviceItems.map((a, idx) => `
      <div class="workout-exercise-item" data-advidx="${idx}">
        <div class="workout-exercise-header">
          <div class="workout-exercise-name">${esc(adviceName(a.adviceId))}</div>
          <button class="btn-icon btn-icon-danger small" data-remove-adv="${idx}">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
      </div>`).join('');

    el.querySelectorAll('[data-remove-adv]').forEach(btn => {
      btn.addEventListener('click', () => {
        adviceItems.splice(parseInt(btn.dataset.removeAdv), 1);
        renderAdviceItems();
      });
    });
  }

  container.innerHTML = `
    <div class="screen-content">
      <div class="form-section">
        <div class="form-group">
          <label class="form-label" for="workout-name">${t('workout_name')} *</label>
          <input class="form-input" id="workout-name" type="text" value="${esc(workout?.name || '')}" autocomplete="off">
          <div class="form-error hidden" id="err-name">${t('required_field')}</div>
        </div>
        <div class="form-group">
          <label class="form-label" for="workout-region">${t('workout_region')}</label>
          <select class="form-select" id="workout-region">
            <option value="">—</option>
            ${regions.map(r => `<option value="${esc(r)}" ${workout?.region === r ? 'selected' : ''}>${esc(r)}</option>`).join('')}
          </select>
        </div>
      </div>

      <div class="form-section">
        <div class="form-section-title">${t('workout_exercises')}</div>
        <div id="workout-items"></div>
        <button class="btn btn-secondary btn-full mt-8" id="btn-add-ex">+ ${t('add_exercise_btn')}</button>
      </div>

      <div class="form-section">
        <div class="form-section-title">${t('session_advice_title')}</div>
        <div id="workout-advice-items"></div>
        <button class="btn btn-secondary btn-full mt-8" id="btn-add-adv-editor">+ ${t('add_advice_btn')}</button>
      </div>

      <div class="form-section">
        <button class="btn btn-primary btn-full" id="btn-save">${t('save')}</button>
      </div>
    </div>
  `;

  renderItems();
  renderAdviceItems();

  // Exercise picker modal
  container.querySelector('#btn-add-ex').addEventListener('click', () => {
    if (!all.length) { showToast(t('no_exercises_available'), 'error'); return; }
    let q = '';

    // Sort exercises by region then name
    function filtered() {
      return all.filter(ex => {
        const name = lang === 'nl' ? ex.nameNl : ex.nameEn;
        return name.toLowerCase().includes(q.toLowerCase());
      }).sort((a, b) => {
        const ra = a.category || '';
        const rb = b.category || '';
        if (ra !== rb) return ra.localeCompare(rb);
        return (lang === 'nl' ? a.nameNl : a.nameEn).localeCompare(lang === 'nl' ? b.nameNl : b.nameEn);
      });
    }

    function modalHTML() {
      const list = filtered();
      // Group by region for display
      const grouped = {};
      list.forEach(ex => {
        const r = ex.category || '—';
        if (!grouped[r]) grouped[r] = [];
        grouped[r].push(ex);
      });
      const groupedHTML = Object.entries(grouped).map(([region, exs]) => `
        <div class="section-title" style="padding:8px 4px 4px;font-size:12px;font-weight:600;color:var(--text-secondary)">${esc(region)}</div>
        ${exs.map(ex => {
          const name = lang === 'nl' ? ex.nameNl : ex.nameEn;
          return `<div class="card-item" data-pick="${ex.id}" data-sets="${ex.defaultSets}" data-reps="${ex.defaultReps}">
            <div class="card-item-content">
              <div class="card-item-title">${esc(name)}</div>
              <div class="card-item-subtitle">${ex.defaultSets}×${ex.defaultReps}</div>
            </div>
          </div>`;
        }).join('')}`
      ).join('');

      return `
        <div class="modal-header">
          <span class="modal-title">${t('select_exercise')}</span>
          <button class="btn-icon" id="modal-close">✕</button>
        </div>
        <div class="modal-body">
          <div class="search-bar" style="margin-bottom:10px">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input type="search" id="modal-search" placeholder="${t('search')}" value="${q}" autocomplete="off">
          </div>
          <div class="card">
            ${list.length === 0 ? `<div style="padding:16px;color:var(--text-secondary);font-size:14px">${t('no_items')}</div>` : groupedHTML}
          </div>
        </div>`;
    }

    openModal(modalHTML(), (box) => { bindModal(box); });

    function bindModal(box) {
      box.querySelector('#modal-close')?.addEventListener('click', closeModal);
      box.querySelector('#modal-search')?.addEventListener('input', (e) => {
        q = e.target.value;
        box.innerHTML = modalHTML();
        bindModal(box);
        box.querySelector('#modal-search').focus();
        box.querySelector('#modal-search').value = q;
      });
      box.querySelectorAll('[data-pick]').forEach(el => {
        el.addEventListener('click', () => {
          const ex = all.find(e => e.id === parseInt(el.dataset.pick));
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

  // Advice picker modal for editor
  container.querySelector('#btn-add-adv-editor').addEventListener('click', () => {
    if (!allAdvice.length) { showToast(t('no_advice_available'), 'error'); return; }

    openModal(`
      <div class="modal-header">
        <span class="modal-title">${t('select_advice')}</span>
        <button class="btn-icon" id="modal-close">✕</button>
      </div>
      <div class="modal-body">
        <div class="card">
          ${allAdvice.map(a => {
            const title = advTitle(a, lang);
            const preview = advText(a, lang);
            return `<div class="card-item" data-pick-adv="${a.id}">
              <div class="card-item-content">
                <div class="card-item-title">${esc(title)}</div>
                <div class="card-item-subtitle">${esc(preview.substring(0, 60))}${preview.length > 60 ? '…' : ''}</div>
              </div>
            </div>`;
          }).join('')}
        </div>
      </div>`, (box) => {
        box.querySelector('#modal-close').addEventListener('click', closeModal);
        box.querySelectorAll('[data-pick-adv]').forEach(el => {
          el.addEventListener('click', () => {
            const id = parseInt(el.dataset.pickAdv);
            if (!adviceItems.find(a => a.adviceId === id)) {
              adviceItems.push({ adviceId: id });
              renderAdviceItems();
            }
            closeModal();
          });
        });
      });
  });

  container.querySelector('#btn-save').addEventListener('click', async () => {
    const name = container.querySelector('#workout-name').value.trim();
    if (!name) { container.querySelector('#err-name').classList.remove('hidden'); return; }
    container.querySelector('#err-name').classList.add('hidden');

    const data = {
      name,
      region: container.querySelector('#workout-region').value,
      items,
      adviceItems,
      createdAt: workout?.createdAt || Date.now(),
    };

    if (editId) await putItem('workouts', { ...data, id: editId });
    else        await addItem('workouts', data);

    showToast(t('save') + ' ✓', 'success');
    navigate('home', 'regionList', null, returnRegion || data.region || '__all__');
  });
}

// ─────────────────────────────────────────
// Workout Detail / Send page
// ─────────────────────────────────────────
export async function renderWorkoutDetail(container, navigate, workoutId, returnRegion) {
  const workout      = await getOne('workouts', workoutId);
  const allExercises = await getAll('exercises');
  const allAdvice    = await getAll('advice');
  const msgConfig    = await getMsgConfig();
  const uiLang       = getLang();

  if (!workout) { navigate('home', null, null); return; }

  // Session state — starts as copy of workout, changes not saved to DB
  let sessionItems = (workout.items || []).map(item => {
    const ex = allExercises.find(e => e.id === item.exerciseId);
    return {
      ...item,
      frequency: item.frequency || ex?.defaultFrequency || { type: 'daily', timesPerWeek: 1 },
    };
  });

  // Pre-populate advice from workout's saved adviceItems
  let sessionAdvice = (workout.adviceItems || []).map(a => allAdvice.find(adv => adv.id === a.adviceId)).filter(Boolean);

  let msgLang = uiLang;

  function getEx(id) { return allExercises.find(e => e.id === id); }

  // ── Message builder (no title, bilingual advice) ──
  function buildMessage(lang) {
    const parts = [];
    if (msgConfig.greeting?.trim()) parts.push(msgConfig.greeting.trim());
    // NOTE: workout title intentionally NOT included

    // Group exercises by region for display
    const byRegion = {};
    sessionItems.forEach((item) => {
      const ex = getEx(item.exerciseId);
      if (!ex) return;
      const region = ex.category || '';
      if (!byRegion[region]) byRegion[region] = [];
      byRegion[region].push(item);
    });

    const regionOrder = Object.keys(byRegion).sort();
    let exNumber = 1;

    const exLines = [];
    regionOrder.forEach(region => {
      byRegion[region].forEach(item => {
        const ex = getEx(item.exerciseId);
        if (!ex) return;
        const name = lang === 'nl' ? ex.nameNl : ex.nameEn;
        const freq = item.frequency.type === 'daily'
          ? tLang('wa_freq_daily', lang)
          : tLang('wa_freq_weekly', lang, item.frequency.timesPerWeek);
        const setsReps = `${item.sets} ${tLang('wa_sets', lang)} x ${item.reps} ${tLang('wa_reps', lang)}`;
        const lines = [`${exNumber}. ${name}`, `${freq} - ${setsReps}`];
        const desc = lang === 'nl' ? ex.descriptionNl : ex.descriptionEn;
        if (msgConfig.showDescriptions && desc?.trim()) lines.push(desc.trim());
        if (ex.url?.trim()) lines.push(`${tLang('wa_link_label', lang)}: ${ex.url}`);
        exLines.push(lines.join('\n'));
        exNumber++;
      });
    });

    if (exLines.length) parts.push(exLines.join('\n\n'));

    for (const adv of sessionAdvice) {
      const title = advTitle(adv, lang);
      const text  = advText(adv, lang);
      const lines = [];
      if (title?.trim()) lines.push(title.trim());
      if (text?.trim())  lines.push(text.trim());
      if (lines.length) parts.push(lines.join('\n'));
    }

    if (msgConfig.closing?.trim()) parts.push(msgConfig.closing.trim());
    return parts.join('\n\n');
  }

  // ── Full render ──
  function render() {
    container.innerHTML = `
      <div class="screen-content">

        <!-- Workout header -->
        <div class="card" style="padding:14px 16px;margin-bottom:4px">
          <div style="display:flex;align-items:center;gap:10px">
            <div style="flex:1;min-width:0">
              <div style="font-size:16px;font-weight:700;color:var(--text)">${esc(workout.name)}</div>
              <div style="font-size:12px;color:var(--text-secondary);margin-top:2px">${t('session_exercises_hint')}</div>
            </div>
            <button class="btn btn-secondary" id="btn-edit-workout" style="flex-shrink:0;font-size:13px;padding:7px 12px">
              ${t('edit')}
            </button>
          </div>
        </div>

        <!-- Session exercises -->
        <div class="session-section-header">
          <span class="session-section-title">${t('session_exercises_title')}</span>
        </div>
        <div id="session-items"></div>
        <button class="btn btn-secondary btn-full" id="btn-add-ex-session" style="margin-bottom:4px">
          + ${t('add_exercise_btn')}
        </button>

        <!-- Session advice -->
        <div class="session-section-header">
          <span class="session-section-title">${t('session_advice_title')}</span>
        </div>
        <div id="session-advice"></div>
        <button class="btn btn-secondary btn-full" id="btn-add-advice-session">
          + ${t('add_advice_btn')}
        </button>

        <!-- Message preview -->
        <div style="display:flex;align-items:center;justify-content:space-between;margin-top:20px;margin-bottom:8px">
          <span class="session-section-title" style="margin:0">${t('whatsapp_preview_title')}</span>
          <div class="msg-lang-row" style="margin:0">
            <span class="msg-lang-label">${t('msg_lang_label')}:</span>
            <div class="lang-toggle" style="margin:0">
              <button id="msg-lang-nl" class="${msgLang === 'nl' ? 'active' : ''}">🇳🇱 NL</button>
              <button id="msg-lang-en" class="${msgLang === 'en' ? 'active' : ''}">🇬🇧 EN</button>
            </div>
          </div>
        </div>

        <div class="msg-preview" id="msg-preview">${esc(buildMessage(msgLang))}</div>

        <button class="btn btn-primary btn-full" id="btn-copy-msg">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
          </svg>
          ${t('copy_message')}
        </button>
      </div>
    `;

    renderSessionItems();
    renderSessionAdvice();
    bindActions();
  }

  // ── Session items — sorted by region ──
  function renderSessionItems() {
    const el = container.querySelector('#session-items');
    if (!sessionItems.length) {
      el.innerHTML = `<p style="color:var(--text-secondary);font-size:13px;padding:4px 0 8px">${t('no_exercises_added')}</p>`;
      return;
    }

    // Sort by exercise region, then by current order within region
    const sorted = [...sessionItems].sort((a, b) => {
      const exA = getEx(a.exerciseId);
      const exB = getEx(b.exerciseId);
      return (exA?.category || '').localeCompare(exB?.category || '');
    });

    // Group by region for rendering
    const grouped = {};
    sorted.forEach(item => {
      const ex = getEx(item.exerciseId);
      const region = ex?.category || '—';
      if (!grouped[region]) grouped[region] = [];
      grouped[region].push({ item, originalIdx: sessionItems.indexOf(item) });
    });

    let numberCounter = 1;
    let html = '';
    Object.entries(grouped).sort(([a],[b]) => a.localeCompare(b)).forEach(([region, entries]) => {
      html += `<div class="session-region-label" style="font-size:12px;font-weight:600;color:var(--text-secondary);padding:8px 0 4px;text-transform:uppercase;letter-spacing:0.04em">${esc(region)}</div>`;
      entries.forEach(({ item, originalIdx }) => {
        const ex = getEx(item.exerciseId);
        if (!ex) return;
        const name = uiLang === 'nl' ? ex.nameNl : ex.nameEn;
        const num = numberCounter++;
        html += `
          <div class="session-exercise-item" data-idx="${originalIdx}">
            <div class="session-exercise-name">${num}. ${esc(name)}</div>
            <div class="session-exercise-controls">
              <label>${t('sets')}</label>
              <input type="number" min="1" max="20" value="${item.sets}" data-sets="${originalIdx}">
              <label>${t('reps')}</label>
              <input type="number" min="1" max="100" value="${item.reps}" data-reps="${originalIdx}">
              <div style="flex:1"></div>
              <button class="btn-icon btn-icon-danger small" data-remove-ex="${originalIdx}">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            ${renderFreqUI(`freq-${originalIdx}`, item.frequency)}
          </div>`;
      });
    });
    el.innerHTML = html;

    // Bind sets/reps
    el.querySelectorAll('[data-sets]').forEach(inp => {
      inp.addEventListener('change', () => {
        sessionItems[parseInt(inp.dataset.sets)].sets = parseInt(inp.value) || 1;
        updatePreview();
      });
    });
    el.querySelectorAll('[data-reps]').forEach(inp => {
      inp.addEventListener('change', () => {
        sessionItems[parseInt(inp.dataset.reps)].reps = parseInt(inp.value) || 1;
        updatePreview();
      });
    });
    // Bind frequency for each item
    sessionItems.forEach((item, idx) => {
      bindFreqUI(`freq-${idx}`, item.frequency, (freq) => {
        sessionItems[idx].frequency = freq;
        updatePreview();
      });
    });
    // Remove
    el.querySelectorAll('[data-remove-ex]').forEach(btn => {
      btn.addEventListener('click', () => {
        sessionItems.splice(parseInt(btn.dataset.removeEx), 1);
        renderSessionItems();
        updatePreview();
      });
    });
  }

  // ── Session advice list ──
  function renderSessionAdvice() {
    const el = container.querySelector('#session-advice');
    if (!sessionAdvice.length) {
      el.innerHTML = `<p style="color:var(--text-secondary);font-size:13px;padding:4px 0 8px">${t('no_advice_added')}</p>`;
      return;
    }
    el.innerHTML = sessionAdvice.map((adv, idx) => {
      const title   = advTitle(adv, uiLang);
      const preview = advText(adv, uiLang);
      return `
        <div class="session-advice-item">
          <div class="session-advice-content">
            <div class="session-advice-title">${esc(title)}</div>
            <div class="session-advice-preview">${esc(preview)}</div>
          </div>
          <button class="btn-icon btn-icon-danger small" data-remove-adv="${idx}">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>`;
    }).join('');

    el.querySelectorAll('[data-remove-adv]').forEach(btn => {
      btn.addEventListener('click', () => {
        sessionAdvice.splice(parseInt(btn.dataset.removeAdv), 1);
        renderSessionAdvice();
        updatePreview();
      });
    });
  }

  // ── Bind all actions ──
  function bindActions() {
    container.querySelector('#btn-edit-workout').addEventListener('click', () => {
      navigate('home', 'editor', workoutId, returnRegion);
    });

    // Add exercise to session
    container.querySelector('#btn-add-ex-session').addEventListener('click', () => {
      if (!allExercises.length) { showToast(t('no_exercises_available'), 'error'); return; }
      const lang = getLang();
      let q = '';

      function filtered() {
        return allExercises.filter(ex => {
          const n = lang === 'nl' ? ex.nameNl : ex.nameEn;
          return n.toLowerCase().includes(q.toLowerCase());
        }).sort((a, b) => {
          const ra = a.category || '';
          const rb = b.category || '';
          if (ra !== rb) return ra.localeCompare(rb);
          return (lang === 'nl' ? a.nameNl : a.nameEn).localeCompare(lang === 'nl' ? b.nameNl : b.nameEn);
        });
      }

      function mHTML() {
        const list = filtered();
        const grouped = {};
        list.forEach(ex => {
          const r = ex.category || '—';
          if (!grouped[r]) grouped[r] = [];
          grouped[r].push(ex);
        });
        const groupedHTML = Object.entries(grouped).map(([region, exs]) => `
          <div style="padding:8px 4px 4px;font-size:12px;font-weight:600;color:var(--text-secondary);text-transform:uppercase">${esc(region)}</div>
          ${exs.map(ex => {
            const n = lang === 'nl' ? ex.nameNl : ex.nameEn;
            return `<div class="card-item" data-pick="${ex.id}" data-sets="${ex.defaultSets}" data-reps="${ex.defaultReps}">
              <div class="card-item-content">
                <div class="card-item-title">${esc(n)}</div>
                <div class="card-item-subtitle">${ex.defaultSets}×${ex.defaultReps}</div>
              </div>
            </div>`;
          }).join('')}`
        ).join('');

        return `
          <div class="modal-header">
            <span class="modal-title">${t('select_exercise')}</span>
            <button class="btn-icon" id="modal-close">✕</button>
          </div>
          <div class="modal-body">
            <div class="search-bar" style="margin-bottom:10px">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input type="search" id="modal-search" placeholder="${t('search')}" value="${q}" autocomplete="off">
            </div>
            <div class="card">
              ${!list.length ? `<div style="padding:16px;color:var(--text-secondary)">${t('no_items')}</div>` : groupedHTML}
            </div>
          </div>`;
      }

      openModal(mHTML(), (box) => bindModal(box));

      function bindModal(box) {
        box.querySelector('#modal-close')?.addEventListener('click', closeModal);
        box.querySelector('#modal-search')?.addEventListener('input', (e) => {
          q = e.target.value;
          box.innerHTML = mHTML();
          bindModal(box);
          box.querySelector('#modal-search').focus();
          box.querySelector('#modal-search').value = q;
        });
        box.querySelectorAll('[data-pick]').forEach(el => {
          el.addEventListener('click', () => {
            const ex = allExercises.find(e => e.id === parseInt(el.dataset.pick));
            sessionItems.push({
              exerciseId: parseInt(el.dataset.pick),
              sets: parseInt(el.dataset.sets) || 3,
              reps: parseInt(el.dataset.reps) || 10,
              frequency: { ...(ex?.defaultFrequency || { type: 'daily', timesPerWeek: 1 }) },
            });
            closeModal();
            renderSessionItems();
            updatePreview();
          });
        });
      }
    });

    // Add advice to session
    container.querySelector('#btn-add-advice-session').addEventListener('click', () => {
      if (!allAdvice.length) { showToast(t('no_advice_available'), 'error'); return; }
      const display = workout.region
        ? allAdvice.filter(a => !a.region || a.region === workout.region)
        : allAdvice;
      const list = display.length ? display : allAdvice;

      openModal(`
        <div class="modal-header">
          <span class="modal-title">${t('select_advice')}</span>
          <button class="btn-icon" id="modal-close">✕</button>
        </div>
        <div class="modal-body">
          <div class="card">
            ${list.map(a => {
              const title   = advTitle(a, uiLang);
              const preview = advText(a, uiLang);
              return `<div class="card-item" data-pick-adv="${a.id}">
                <div class="card-item-content">
                  <div class="card-item-title">${esc(title)}</div>
                  <div class="card-item-subtitle">${esc(preview.substring(0, 60))}${preview.length > 60 ? '…' : ''}</div>
                </div>
              </div>`;
            }).join('')}
          </div>
        </div>`, (box) => {
          box.querySelector('#modal-close').addEventListener('click', closeModal);
          box.querySelectorAll('[data-pick-adv]').forEach(el => {
            el.addEventListener('click', () => {
              const adv = allAdvice.find(a => a.id === parseInt(el.dataset.pickAdv));
              if (adv) { sessionAdvice.push(adv); renderSessionAdvice(); updatePreview(); }
              closeModal();
            });
          });
        });
    });

    // Language toggle
    container.querySelector('#msg-lang-nl').addEventListener('click', () => { msgLang = 'nl'; updateLangToggle(); updatePreview(); });
    container.querySelector('#msg-lang-en').addEventListener('click', () => { msgLang = 'en'; updateLangToggle(); updatePreview(); });

    // Copy
    container.querySelector('#btn-copy-msg').addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(buildMessage(msgLang));
        showToast(t('message_copied'), 'success');
      } catch {
        showToast(t('copy_failed'), 'error');
        const el = container.querySelector('#msg-preview');
        const range = document.createRange();
        range.selectNodeContents(el);
        window.getSelection().removeAllRanges();
        window.getSelection().addRange(range);
      }
    });
  }

  function updatePreview() {
    const el = container.querySelector('#msg-preview');
    if (el) el.textContent = buildMessage(msgLang);
  }

  function updateLangToggle() {
    container.querySelector('#msg-lang-nl')?.classList.toggle('active', msgLang === 'nl');
    container.querySelector('#msg-lang-en')?.classList.toggle('active', msgLang === 'en');
  }

  render();
}
