// =====================================================
// screens/advice.js — Standard advice management
// advice entry: { id, region, titleNl, titleEn, textNl, textEn, createdAt }
// (backward compat: old entries may have title/text instead)
// =====================================================
import { getAll, getOne, addItem, putItem, deleteItem } from '../db.js';
import { t, getLang } from '../i18n.js';
import { showToast, showConfirm, getRegions, esc } from '../app.js';

// Helper: get display title in the given language (falls back to other lang or legacy field)
export function advTitle(adv, lang) {
  if (lang === 'nl') return adv.titleNl || adv.titleEn || adv.title || '';
  return adv.titleEn || adv.titleNl || adv.title || '';
}

// Helper: get text in the given language (falls back gracefully)
export function advText(adv, lang) {
  if (lang === 'nl') return adv.textNl || adv.textEn || adv.text || '';
  return adv.textEn || adv.textNl || adv.text || '';
}

// ─────────────────────────────────────────
// Advice List
// ─────────────────────────────────────────
export async function renderAdviceList(container, navigate) {
  const adviceList = await getAll('advice');
  const lang       = getLang();

  adviceList.sort((a, b) =>
    (a.region || '').localeCompare(b.region || '') ||
    advTitle(a, lang).localeCompare(advTitle(b, lang))
  );

  container.innerHTML = `
    <div class="screen-content">
      <div id="advice-list"></div>
    </div>
    <button class="fab" id="fab-add-advice" aria-label="${t('add_advice')}">
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
      </svg>
    </button>
  `;

  const listEl = container.querySelector('#advice-list');

  if (adviceList.length === 0) {
    listEl.innerHTML = `
      <div class="empty-state">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </svg>
        <p>${t('advice_empty')}</p>
      </div>`;
  } else {
    // Group by region
    const grouped = {};
    adviceList.forEach(a => {
      const key = a.region || '—';
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(a);
    });

    listEl.innerHTML = Object.entries(grouped).sort(([a],[b]) => a.localeCompare(b)).map(([region, items]) => `
      <p class="section-title">${esc(region)}</p>
      <div class="card">
        ${items.map(a => {
          const title    = advTitle(a, lang);
          const preview  = advText(a, lang);
          const missingEn = !a.titleEn && !a.textEn;
          return `
          <div class="advice-card-item" data-id="${a.id}">
            <div style="display:flex;align-items:flex-start;gap:8px">
              <div style="flex:1;min-width:0">
                <div class="advice-card-title">${esc(title)}${missingEn ? ' <span style="color:var(--warning,#f59e0b);font-size:11px">EN?</span>' : ''}</div>
                <div class="advice-card-preview">${esc(preview)}</div>
              </div>
              <button class="btn-icon btn-icon-danger small" data-delete="${a.id}" aria-label="${t('delete')}">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/>
                  <path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
                </svg>
              </button>
              <svg class="chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </div>
          </div>`;
        }).join('')}
      </div>`).join('');

    // Tap to edit
    listEl.querySelectorAll('.advice-card-item').forEach(el => {
      el.addEventListener('click', (e) => {
        if (e.target.closest('[data-delete]')) return;
        navigate('advice', 'form', parseInt(el.dataset.id));
      });
    });

    // Delete
    listEl.querySelectorAll('[data-delete]').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const ok = await showConfirm(t('confirm_delete'));
        if (!ok) return;
        await deleteItem('advice', parseInt(btn.dataset.delete));
        navigate('advice', null, null);
      });
    });
  }

  container.querySelector('#fab-add-advice').addEventListener('click', () => {
    navigate('advice', 'form', null);
  });
}

// ─────────────────────────────────────────
// Advice Form (add / edit) — bilingual
// ─────────────────────────────────────────
export async function renderAdviceForm(container, navigate, editId) {
  const entry   = editId ? await getOne('advice', editId) : null;
  const regions = await getRegions();

  container.innerHTML = `
    <div class="screen-content">
      <div class="form-section">
        <div class="form-section-title">${t('advice_info')}</div>

        <div class="form-group">
          <label class="form-label" for="advice-region">${t('advice_region')}</label>
          <select class="form-select" id="advice-region">
            <option value="">—</option>
            ${regions.map(r => `<option value="${esc(r)}" ${entry?.region === r ? 'selected' : ''}>${esc(r)}</option>`).join('')}
          </select>
        </div>

        <div class="form-group">
          <label class="form-label" for="advice-title-nl">🇳🇱 ${t('advice_title_nl')}</label>
          <input class="form-input" id="advice-title-nl" type="text" value="${esc(entry?.titleNl || entry?.title || '')}" autocomplete="off">
          <div class="form-error hidden" id="err-advice-title-nl">${t('required_field')}</div>
        </div>

        <div class="form-group">
          <label class="form-label" for="advice-text-nl">🇳🇱 ${t('advice_text_nl')}</label>
          <textarea class="form-textarea" id="advice-text-nl" rows="4">${esc(entry?.textNl || entry?.text || '')}</textarea>
        </div>

        <div class="form-group">
          <label class="form-label" for="advice-title-en">🇬🇧 ${t('advice_title_en')}</label>
          <input class="form-input" id="advice-title-en" type="text" value="${esc(entry?.titleEn || '')}" autocomplete="off">
          <div class="form-error hidden" id="err-advice-title-en">${t('required_field')}</div>
        </div>

        <div class="form-group">
          <label class="form-label" for="advice-text-en">🇬🇧 ${t('advice_text_en')}</label>
          <textarea class="form-textarea" id="advice-text-en" rows="4">${esc(entry?.textEn || '')}</textarea>
        </div>
      </div>

      <div class="form-section">
        <button class="btn btn-primary btn-full" id="btn-save-advice">${t('save')}</button>
        ${editId ? `<button class="btn btn-danger-outline btn-full mt-8" id="btn-delete-advice">${t('delete')}</button>` : ''}
      </div>
    </div>
  `;

  container.querySelector('#btn-save-advice').addEventListener('click', async () => {
    const titleNl = container.querySelector('#advice-title-nl').value.trim();
    const titleEn = container.querySelector('#advice-title-en').value.trim();
    let valid = true;

    if (!titleNl) { container.querySelector('#err-advice-title-nl').classList.remove('hidden'); valid = false; }
    else            container.querySelector('#err-advice-title-nl').classList.add('hidden');
    if (!titleEn) { container.querySelector('#err-advice-title-en').classList.remove('hidden'); valid = false; }
    else            container.querySelector('#err-advice-title-en').classList.add('hidden');

    if (!valid) return;

    const data = {
      region:   container.querySelector('#advice-region').value,
      titleNl,
      titleEn,
      textNl:   container.querySelector('#advice-text-nl').value.trim(),
      textEn:   container.querySelector('#advice-text-en').value.trim(),
      createdAt: entry?.createdAt || Date.now(),
    };

    if (editId) await putItem('advice', { ...data, id: editId });
    else        await addItem('advice', data);

    showToast(t('save') + ' ✓', 'success');
    navigate('advice', null, null);
  });

  const delBtn = container.querySelector('#btn-delete-advice');
  if (delBtn) {
    delBtn.addEventListener('click', async () => {
      const ok = await showConfirm(t('confirm_delete'));
      if (!ok) return;
      await deleteItem('advice', editId);
      navigate('advice', null, null);
    });
  }
}
