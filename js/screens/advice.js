// =====================================================
// screens/advice.js — Standard advice management
// advice entry: { id, region, title, text, createdAt }
// =====================================================
import { getAll, getOne, addItem, putItem, deleteItem } from '../db.js';
import { t, getLang } from '../i18n.js';
import { showToast, showConfirm, getRegions, esc } from '../app.js';

// ─────────────────────────────────────────
// Advice List
// ─────────────────────────────────────────
export async function renderAdviceList(container, navigate) {
  const adviceList = await getAll('advice');
  const regions    = await getRegions();

  adviceList.sort((a, b) => (a.region || '').localeCompare(b.region || '') || a.title.localeCompare(b.title));

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
        ${items.map(a => `
          <div class="advice-card-item" data-id="${a.id}">
            <div style="display:flex;align-items:flex-start;gap:8px">
              <div style="flex:1;min-width:0">
                <div class="advice-card-title">${esc(a.title)}</div>
                <div class="advice-card-preview">${esc(a.text)}</div>
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
          </div>`).join('')}
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
// Advice Form (add / edit)
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
          <label class="form-label" for="advice-title">${t('advice_title_field')} *</label>
          <input class="form-input" id="advice-title" type="text" value="${esc(entry?.title || '')}" autocomplete="off">
          <div class="form-error hidden" id="err-advice-title">${t('required_field')}</div>
        </div>

        <div class="form-group">
          <label class="form-label" for="advice-text">${t('advice_text_field')} *</label>
          <textarea class="form-textarea" id="advice-text" rows="6">${esc(entry?.text || '')}</textarea>
          <div class="form-error hidden" id="err-advice-text">${t('required_field')}</div>
        </div>
      </div>

      <div class="form-section">
        <button class="btn btn-primary btn-full" id="btn-save-advice">${t('save')}</button>
        ${editId ? `<button class="btn btn-danger-outline btn-full mt-8" id="btn-delete-advice">${t('delete')}</button>` : ''}
      </div>
    </div>
  `;

  container.querySelector('#btn-save-advice').addEventListener('click', async () => {
    const title  = container.querySelector('#advice-title').value.trim();
    const text   = container.querySelector('#advice-text').value.trim();
    let valid = true;

    if (!title) { container.querySelector('#err-advice-title').classList.remove('hidden'); valid = false; }
    else          container.querySelector('#err-advice-title').classList.add('hidden');
    if (!text)  { container.querySelector('#err-advice-text').classList.remove('hidden'); valid = false; }
    else          container.querySelector('#err-advice-text').classList.add('hidden');

    if (!valid) return;

    const data = {
      region: container.querySelector('#advice-region').value,
      title,
      text,
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
