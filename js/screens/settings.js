// =====================================================
// screens/settings.js — Language, export, import
// =====================================================
import { exportDB, importDB } from '../db.js';
import { t, getLang, setLang } from '../i18n.js';
import { showToast, showConfirm, rerender, changeLang } from '../app.js';

export async function renderSettings(container, navigate) {
  const lang = getLang();

  container.innerHTML = `
    <div class="screen-content">

      <div class="settings-section">
        <div class="settings-section-title">${t('language_section')}</div>
        <div class="settings-item" style="cursor:default">
          <span class="settings-item-label">${t('language_label')}</span>
          <div class="lang-toggle">
            <button id="lang-nl" class="${lang === 'nl' ? 'active' : ''}">🇳🇱 NL</button>
            <button id="lang-en" class="${lang === 'en' ? 'active' : ''}">🇬🇧 EN</button>
          </div>
        </div>
      </div>

      <div class="settings-section">
        <div class="settings-section-title">${t('data_section')}</div>

        <div class="settings-item" id="btn-export">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          <div style="flex:1">
            <div class="settings-item-label">${t('export_db')}</div>
            <div style="font-size:12px;color:var(--text-secondary)">${t('export_db_sub')}</div>
          </div>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--border)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </div>

        <div class="settings-item" id="btn-import">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
          </svg>
          <div style="flex:1">
            <div class="settings-item-label">${t('import_db')}</div>
            <div style="font-size:12px;color:var(--text-secondary)">${t('import_db_sub')}</div>
          </div>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--border)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </div>

        <!-- Hidden file input for import -->
        <input type="file" id="import-file-input" accept=".json" style="display:none">
      </div>

      <div class="settings-section">
        <div class="settings-section-title">${t('about_section')}</div>
        <div class="settings-item" style="cursor:default">
          <div>
            <div class="settings-item-label">${t('about_label')}</div>
            <div style="font-size:12px;color:var(--text-secondary)">${t('about_sub')}</div>
          </div>
        </div>
      </div>

    </div>
  `;

  // Language toggle
  container.querySelector('#lang-nl').addEventListener('click', () => changeLang('nl'));
  container.querySelector('#lang-en').addEventListener('click', () => changeLang('en'));

  // Export
  container.querySelector('#btn-export').addEventListener('click', async () => {
    try {
      const data = await exportDB();
      const json = JSON.stringify(data, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const date = new Date().toISOString().slice(0, 10);
      const a = document.createElement('a');
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
      const text = await file.text();
      const data = JSON.parse(text);
      if (!data.exercises && !data.workouts) throw new Error('Invalid format');
      await importDB(data);

      // If lang changed in import, apply it
      const langSetting = data.settings?.find(s => s.key === 'lang');
      if (langSetting?.value) setLang(langSetting.value);

      showToast(t('import_success'), 'success');
      if (langSetting?.value) await changeLang(langSetting.value);
      else rerender();
    } catch (err) {
      console.error(err);
      showToast(t('import_error'), 'error');
    }

    e.target.value = '';
  });
}
