// =====================================================
// screens/settings.js — Language, dark mode, categories, export/import
// =====================================================
import { exportDB, importDB } from '../db.js';
import { t, getLang, setLang } from '../i18n.js';
import { showToast, showConfirm, rerender, changeLang,
         getTheme, setTheme, getCategories, saveCategories } from '../app.js';

export async function renderSettings(container, navigate) {
  const lang       = getLang();
  const theme      = getTheme();
  const categories = await getCategories();

  function buildHTML() {
    return `
    <div class="screen-content">

      <!-- Language -->
      <div class="settings-section">
        <div class="settings-section-title">${t('language_section')}</div>
        <div class="settings-item">
          <span class="settings-item-label">${t('language_label')}</span>
          <div class="lang-toggle">
            <button id="lang-nl" class="${getLang() === 'nl' ? 'active' : ''}">🇳🇱 NL</button>
            <button id="lang-en" class="${getLang() === 'en' ? 'active' : ''}">🇬🇧 EN</button>
          </div>
        </div>
      </div>

      <!-- Appearance -->
      <div class="settings-section">
        <div class="settings-section-title">${t('appearance_section')}</div>
        <div class="settings-item">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
          </svg>
          <span class="settings-item-label">${t('dark_mode_label')}</span>
          <label class="toggle-switch">
            <input type="checkbox" id="dark-mode-toggle" ${getTheme() === 'dark' ? 'checked' : ''}>
            <span class="toggle-track"></span>
          </label>
        </div>
      </div>

      <!-- Categories -->
      <div class="settings-section">
        <div class="settings-section-title">${t('categories_section')}</div>
        <div id="category-list">
          ${buildCategoryList(categories)}
        </div>
        <div class="add-category-row">
          <input type="text" id="new-category-input" placeholder="${t('category_placeholder')}" autocomplete="off" maxlength="40">
          <button class="btn btn-primary" id="btn-add-category">${t('add_category')}</button>
        </div>
      </div>

      <!-- Data -->
      <div class="settings-section">
        <div class="settings-section-title">${t('data_section')}</div>

        <div class="settings-item tappable" id="btn-export">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          <div style="flex:1">
            <div class="settings-item-label">${t('export_db')}</div>
            <div style="font-size:12px;color:var(--text-secondary)">${t('export_db_sub')}</div>
          </div>
          <svg class="chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </div>

        <div class="settings-item tappable" id="btn-import">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
          </svg>
          <div style="flex:1">
            <div class="settings-item-label">${t('import_db')}</div>
            <div style="font-size:12px;color:var(--text-secondary)">${t('import_db_sub')}</div>
          </div>
          <svg class="chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </div>

        <input type="file" id="import-file-input" accept=".json" style="display:none">
      </div>

      <!-- About -->
      <div class="settings-section">
        <div class="settings-section-title">${t('about_section')}</div>
        <div class="settings-item">
          <div>
            <div class="settings-item-label">${t('about_label')}</div>
            <div style="font-size:12px;color:var(--text-secondary)">${t('about_sub')}</div>
          </div>
        </div>
      </div>

    </div>`;
  }

  function buildCategoryList(cats) {
    if (!cats.length) return `<p style="padding:12px 16px;font-size:14px;color:var(--text-secondary)">${t('no_items')}</p>`;
    return cats.map((cat, idx) => `
      <div class="category-item" data-idx="${idx}">
        <span class="category-item-name">${escHtml(cat)}</span>
        <button class="btn-icon btn-icon-danger small" data-cat-delete="${idx}" aria-label="${t('delete')}">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>`).join('');
  }

  container.innerHTML = buildHTML();

  // Working copy of categories (avoid mutating while rendering)
  let cats = [...categories];

  function refreshCategoryList() {
    container.querySelector('#category-list').innerHTML = buildCategoryList(cats);
    bindCategoryDeleteBtns();
  }

  function bindCategoryDeleteBtns() {
    container.querySelectorAll('[data-cat-delete]').forEach(btn => {
      btn.addEventListener('click', async () => {
        const idx = parseInt(btn.dataset.catDelete);
        cats.splice(idx, 1);
        await saveCategories(cats);
        refreshCategoryList();
      });
    });
  }

  bindCategoryDeleteBtns();

  // Add category
  container.querySelector('#btn-add-category').addEventListener('click', async () => {
    const input = container.querySelector('#new-category-input');
    const name = input.value.trim();
    if (!name) return;
    if (cats.includes(name)) {
      showToast('Al bestaat', 'error');
      return;
    }
    cats.push(name);
    await saveCategories(cats);
    input.value = '';
    refreshCategoryList();
  });

  container.querySelector('#new-category-input').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') container.querySelector('#btn-add-category').click();
  });

  // Language toggle
  container.querySelector('#lang-nl').addEventListener('click', () => changeLang('nl'));
  container.querySelector('#lang-en').addEventListener('click', () => changeLang('en'));

  // Dark mode toggle
  container.querySelector('#dark-mode-toggle').addEventListener('change', async (e) => {
    await setTheme(e.target.checked ? 'dark' : 'light');
  });

  // Export
  container.querySelector('#btn-export').addEventListener('click', async () => {
    try {
      const data = await exportDB();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url  = URL.createObjectURL(blob);
      const date = new Date().toISOString().slice(0, 10);
      const a    = document.createElement('a');
      a.href = url;
      a.download = `fysio-backup-${date}.json`;
      a.click();
      URL.revokeObjectURL(url);
      showToast(t('export_success'), 'success');
    } catch (err) {
      console.error(err);
      showToast('Export mislukt', 'error');
    }
  });

  // Import
  container.querySelector('#btn-import').addEventListener('click', () => {
    container.querySelector('#import-file-input').click();
  });

  container.querySelector('#import-file-input').addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const ok = await showConfirm(t('import_confirm'));
    if (!ok) { e.target.value = ''; return; }

    try {
      const data = JSON.parse(await file.text());
      if (!data.exercises && !data.workouts) throw new Error('Invalid format');
      await importDB(data);

      // Apply imported language if present
      const langSetting = data.settings?.find(s => s.key === 'lang');
      if (langSetting?.value) {
        await changeLang(langSetting.value);
      } else {
        rerender();
      }

      showToast(t('import_success'), 'success');
    } catch (err) {
      console.error(err);
      showToast(t('import_error'), 'error');
    }

    e.target.value = '';
  });
}

function escHtml(str) {
  return String(str ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
