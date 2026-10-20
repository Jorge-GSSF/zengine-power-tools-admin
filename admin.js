/**
 * Zengine Power-Tools Central Admin Portal
 * Controls, Icon Styles, Hotkeys & Live Palette Simulator
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. DEFAULT VALUES
  const DEFAULT_SHORTCUTS = {
    commandPalette: { id: 'commandPalette', label: 'Command Palette', desc: 'Live search students, awards & disbursements', enabled: true, key: 'ctrl+k', display: 'Ctrl + K' },
    navDown:        { id: 'navDown', label: 'Next Record', desc: 'Move to next record (table or drawer)', enabled: true, key: 'j', display: 'J' },
    navUp:          { id: 'navUp', label: 'Previous Record', desc: 'Move to previous record (table or drawer)', enabled: true, key: 'k', display: 'K' },
    openRecord:     { id: 'openRecord', label: 'Open Selected Record', desc: 'Open side panel for highlighted row', enabled: true, key: 'enter', display: 'Enter' },
    closePanel:     { id: 'closePanel', label: 'Close Panel / Escape', desc: 'Dismiss side panel or modal', enabled: true, key: 'escape', display: 'Esc' },
    cycleTabNext:   { id: 'cycleTabNext', label: 'Next Side Tab', desc: 'Cycle forward through side panel tabs', enabled: true, key: ']', display: ']' },
    cycleTabPrev:   { id: 'cycleTabPrev', label: 'Previous Side Tab', desc: 'Cycle backward through side panel tabs', enabled: true, key: '[', display: '[' },
    copyLink:       { id: 'copyLink', label: 'Copy Clean Record Link', desc: 'Direct URL to current record', enabled: true, key: 'alt+l', display: 'Alt + L' },
    copySummary:    { id: 'copySummary', label: 'Copy Scholar Summary', desc: 'Scholar Name, ID & balance card', enabled: true, key: 'alt+c', display: 'Alt + C' },
    copyId:         { id: 'copyId', label: 'Copy Record ID Only', desc: 'Copy clean numeric ID to clipboard', enabled: true, key: 'alt+i', display: 'Alt + I' },
    focusSearch:    { id: 'focusSearch', label: 'Focus Table Search', desc: 'Open and focus table search bar', enabled: true, key: '/', display: '/' },
    addNewRecord:   { id: 'addNewRecord', label: 'Add New Record', desc: 'Trigger "+ Add Record" button', enabled: true, key: 'alt+n', display: 'Alt + N' },
    refreshData:    { id: 'refreshData', label: 'Refresh Table Data', desc: 'Reload current table data without page refresh', enabled: true, key: 'alt+r', display: 'Alt + R' },
    toggleFilters:  { id: 'toggleFilters', label: 'Toggle Table Filters', desc: 'Open/close Form Tools filter sidebar', enabled: true, key: 'alt+f', display: 'Alt + F' },
    quickSave:      { id: 'quickSave', label: 'Quick Save Record', desc: 'Trigger save on current form', enabled: true, key: 'ctrl+s', display: 'Ctrl + S' }
  };

  const DEFAULT_ACCESS_TOKEN = '644cc1ee38244d57d7b458eaf29d2b714fb7e267';
  const DEFAULT_REMOTE_CONFIG_URL = 'https://jorge-gssf.github.io/zengine-power-tools-admin/config.json';

  let currentSettings = {
    autoOpenEnabled: true,
    paletteSize: 'regular',
    iconStyle: 'modern', // 'modern' | 'none' | 'emoji'
    apiToken: DEFAULT_ACCESS_TOKEN,
    defaultWorkspaceId: '34919',
    shortcuts: JSON.parse(JSON.stringify(DEFAULT_SHORTCUTS)),
    announcement: '',
    remoteConfigUrl: DEFAULT_REMOTE_CONFIG_URL
  };

  // Modern Minimalist Outline SVG Dictionary
  const MODERN_ICONS = {
    students: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"></path><path d="M6 12v5c3 3 9 3 12 0v-5"></path></svg>`,
    disbursements: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="12" x="2" y="6" rx="2"></rect><circle cx="12" cy="12" r="2"></circle><path d="M6 12h.01M18 12h.01"></path></svg>`,
    awards: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="6"></circle><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"></path></svg>`,
    emergency: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m13 2-2 10h5L11 22l2-10H8z"></path></svg>`,
    payees: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="16" height="18" x="4" y="3" rx="2"></rect><line x1="8" y1="7" x2="8" y2="7"></line><line x1="16" y1="7" x2="16" y2="7"></line><line x1="8" y1="11" x2="8" y2="11"></line><line x1="16" y1="11" x2="16" y2="11"></line><line x1="8" y1="15" x2="8" y2="15"></line><line x1="16" y1="15" x2="16" y2="15"></line></svg>`,
    link: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>`,
    form: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" x2="8" y1="13" y2="13"></line><line x1="16" x2="8" y1="17" y2="17"></line></svg>`
  };

  const EMOJI_MAP = {
    students: '🎓',
    disbursements: '💰',
    awards: '🏆',
    emergency: '🚨',
    payees: '🏛️',
    link: '🔗',
    form: '📄'
  };

  const hasExtensionStorage = typeof chrome !== 'undefined' && chrome.storage && chrome.storage.sync;

  // 2. DOM REFERENCES
  const navTabs = document.querySelectorAll('.admin-nav-tab');
  const tabContents = document.querySelectorAll('.tab-content');
  const storageStatusEl = document.getElementById('storageStatus');
  const toggleAutoOpen = document.getElementById('toggleAutoOpen');
  const selectPaletteSize = document.getElementById('selectPaletteSize');
  const selectPrimaryWs = document.getElementById('selectPrimaryWs');
  const inputApiToken = document.getElementById('inputApiToken');
  const btnSaveToken = document.getElementById('btnSaveToken');
  const btnTestToken = document.getElementById('btnTestToken');
  const tokenTestResult = document.getElementById('tokenTestResult');
  const iconStyleCards = document.querySelectorAll('.icon-style-card');
  const hotkeyTableBody = document.getElementById('hotkeyTableBody');
  const btnResetAllHotkeys = document.getElementById('btnResetAllHotkeys');
  const btnExportJson = document.getElementById('btnExportJson');
  const btnImportJson = document.getElementById('btnImportJson');

  // Cloud & Login Controls
  const btnPublishCloud = document.getElementById('btnPublishCloud');
  const adminLockBadge = document.getElementById('adminLockBadge');
  const adminLockText = document.getElementById('adminLockText');
  const adminLoginModal = document.getElementById('adminLoginModal');
  const btnAdminModalClose = document.getElementById('btnAdminModalClose');
  const btnAdminModalCancel = document.getElementById('btnAdminModalCancel');
  const adminLoginForm = document.getElementById('adminLoginForm');
  const inputAdminPassword = document.getElementById('inputAdminPassword');
  const adminModalError = document.getElementById('adminModalError');
  const inputCloudUrl = document.getElementById('inputCloudUrl');
  const btnTestCloudUrl = document.getElementById('btnTestCloudUrl');
  const cloudTestResult = document.getElementById('cloudTestResult');
  const inputAnnouncement = document.getElementById('inputAnnouncement');
  const inputGhToken = document.getElementById('inputGhToken');
  const btnSaveGhToken = document.getElementById('btnSaveGhToken');

  // Simulator DOM
  const simulatorInput = document.getElementById('mockupSearchInput');
  const simulatorList = document.getElementById('mockupSearchList');
  const simulatorCloseBtn = document.getElementById('mockupCloseBtn');

  // Pending publish action when authenticating
  let pendingPublishAfterAuth = false;

  // 3. ADMIN AUTHENTICATION
  function isAdminAuthenticated() {
    return !!sessionStorage.getItem('zg_admin_session_token');
  }

  function updateAuthBadge() {
    if (!adminLockBadge || !adminLockText) return;
    if (isAdminAuthenticated()) {
      adminLockBadge.className = 'admin-lock-badge unlocked';
      adminLockBadge.innerHTML = `
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 9.9-1"></path></svg>
        <span id="adminLockText">Admin: Unlocked</span>
      `;
      adminLockBadge.title = 'Administrator Authenticated. Click to log out.';
    } else {
      adminLockBadge.className = 'admin-lock-badge locked';
      adminLockBadge.innerHTML = `
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
        <span id="adminLockText">Admin Login</span>
      `;
      adminLockBadge.title = 'Click to log in as administrator';
    }
  }

  function openLoginModal() {
    if (adminLoginModal) {
      if (adminModalError) adminModalError.style.display = 'none';
      if (inputAdminPassword) inputAdminPassword.value = '';
      adminLoginModal.classList.add('active');
      setTimeout(() => inputAdminPassword && inputAdminPassword.focus(), 100);
    }
  }

  function closeLoginModal() {
    if (adminLoginModal) {
      adminLoginModal.classList.remove('active');
      pendingPublishAfterAuth = false;
    }
  }

  if (adminLockBadge) {
    adminLockBadge.addEventListener('click', () => {
      if (isAdminAuthenticated()) {
        if (confirm('Log out from administrator mode?')) {
          sessionStorage.removeItem('zg_admin_session_token');
          sessionStorage.removeItem('zg_admin_pass');
          updateAuthBadge();
          showToast('Logged out from admin mode.');
        }
      } else {
        openLoginModal();
      }
    });
  }

  if (btnAdminModalClose) btnAdminModalClose.addEventListener('click', closeLoginModal);
  if (btnAdminModalCancel) btnAdminModalCancel.addEventListener('click', closeLoginModal);

  if (adminLoginForm) {
    adminLoginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const pw = (inputAdminPassword.value || '').trim();
      if (!pw) return;

      const endpoint = (inputCloudUrl && inputCloudUrl.value.trim()) || currentSettings.remoteConfigUrl || '/api/config';
      const loginEndpoint = endpoint.replace(/\/config\/?$/, '/login');

      try {
        let authOk = false;
        let token = 'authenticated';

        // Try API login if reachable
        try {
          const resp = await fetch(loginEndpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ password: pw })
          });
          if (resp.ok) {
            const data = await resp.json();
            if (data && data.success) {
              authOk = true;
              token = data.token || 'authenticated';
            }
          }
        } catch (apiErr) {
          // Fallback direct password check for offline/standalone
          if (pw === 'georgesnow2026') {
            authOk = true;
            token = 'offline_auth_' + Date.now();
          }
        }

        if (pw === 'georgesnow2026') {
          authOk = true;
        }

        if (authOk) {
          sessionStorage.setItem('zg_admin_session_token', token);
          sessionStorage.setItem('zg_admin_pass', pw);
          updateAuthBadge();
          closeLoginModal();
          showToast('✓ Administrator access unlocked!');
          if (pendingPublishAfterAuth) {
            pendingPublishAfterAuth = false;
            publishSettingsToCloud();
          }
        } else {
          if (adminModalError) {
            adminModalError.textContent = 'Incorrect passphrase. Please try again.';
            adminModalError.style.display = 'block';
          }
        }
      } catch (err) {
        if (adminModalError) {
          adminModalError.textContent = 'Error: ' + err.message;
          adminModalError.style.display = 'block';
        }
      }
    });
  }

  // 4. PUBLISH SETTINGS TO CLOUD (AFFECTS ALL USERS)
  async function publishSettingsToCloud() {
    if (!isAdminAuthenticated()) {
      pendingPublishAfterAuth = true;
      openLoginModal();
      return;
    }

    const endpoint = (inputCloudUrl && inputCloudUrl.value.trim()) || currentSettings.remoteConfigUrl || DEFAULT_REMOTE_CONFIG_URL;
    const pw = sessionStorage.getItem('zg_admin_pass') || 'georgesnow2026';
    const token = sessionStorage.getItem('zg_admin_session_token') || 'authenticated';
    const ghToken = localStorage.getItem('zg_gh_token') || (inputGhToken ? inputGhToken.value.trim() : '');

    if (btnPublishCloud) {
      btnPublishCloud.disabled = true;
      btnPublishCloud.innerHTML = `
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="zg-spin" style="animation:spin 1s linear infinite;"><path d="M21 12a9 9 0 1 1-6.219-8.56"></path></svg>
        Publishing...
      `;
    }

    const payloadConfig = {
      iconStyle: currentSettings.iconStyle,
      paletteSize: currentSettings.paletteSize,
      autoOpenEnabled: currentSettings.autoOpenEnabled,
      apiToken: currentSettings.apiToken,
      defaultWorkspaceId: currentSettings.defaultWorkspaceId,
      shortcuts: currentSettings.shortcuts,
      announcement: currentSettings.announcement || '',
      version: '1.4.5',
      updatedAt: new Date().toISOString()
    };

    try {
      let published = false;

      // Option A: If GitHub Token is available, push directly to GitHub repository config.json
      if (ghToken) {
        try {
          const repoApiUrl = 'https://api.github.com/repos/Jorge-GSSF/zengine-power-tools-admin/contents/config.json';
          // 1. Get current SHA
          const getResp = await fetch(repoApiUrl, {
            headers: {
              'Authorization': `token ${ghToken}`,
              'Accept': 'application/vnd.github.v3+json'
            }
          });
          let sha = '';
          if (getResp.ok) {
            const getData = await getResp.json();
            sha = getData.sha;
          }

          // 2. Put file with base64 encoded content
          const contentStr = JSON.stringify(payloadConfig, null, 2);
          const b64 = btoa(unescape(encodeURIComponent(contentStr)));

          const putResp = await fetch(repoApiUrl, {
            method: 'PUT',
            headers: {
              'Authorization': `token ${ghToken}`,
              'Content-Type': 'application/json',
              'Accept': 'application/vnd.github.v3+json'
            },
            body: JSON.stringify({
              message: `Update central config via Live Admin Portal (${new Date().toLocaleString()})`,
              content: b64,
              sha: sha || undefined
            })
          });

          if (!putResp.ok) {
            const errData = await putResp.json().catch(() => ({}));
            throw new Error(errData.message || `GitHub error ${putResp.status}`);
          }

          published = true;
          showToast('☁ Successfully Published to GitHub Cloud! Extensions will sync.');
        } catch (ghErr) {
          console.warn('GitHub API publish failed, trying standard endpoint:', ghErr);
        }
      }

      // Option B: If not pushed to GitHub, try posting to cloud endpoint
      if (!published && endpoint && !endpoint.endsWith('.json')) {
        const resp = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            config: payloadConfig,
            adminPassword: pw
          })
        });

        if (!resp.ok) {
          const errorData = await resp.json().catch(() => ({}));
          throw new Error(errorData.error || `Server responded with ${resp.status}`);
        }

        published = true;
        showToast('☁ Successfully Published to Cloud! All extensions will sync.');
      }

      // Always save locally to extension/browser storage
      saveSettings(payloadConfig);

      if (!published) {
        // Fallback for static GitHub Pages when no GitHub Token is entered yet
        showToast('Settings saved locally! To publish live to GitHub Pages, enter your GitHub token below.');
      }

      if (storageStatusEl) {
        storageStatusEl.innerHTML = '<span class="status-dot" style="background:#10b981;"></span> Synced Live';
      }
    } catch (err) {
      alert(`Publish Notice:\n${err.message}\n\nYour settings have been saved locally. To push directly to the live GitHub repository, please enter a GitHub Publisher Token in Tab 5.`);
    } finally {
      if (btnPublishCloud) {
        btnPublishCloud.disabled = false;
        btnPublishCloud.innerHTML = `
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"></path><path d="m12 12 0 9"></path><path d="m16 16-4-4-4 4"></path></svg>
          Publish to All Users
        `;
      }
    }
  }

  if (btnPublishCloud) {
    btnPublishCloud.addEventListener('click', publishSettingsToCloud);
  }

  // 5. INITIALIZE & LOAD SETTINGS
  async function loadSettings() {
    if (hasExtensionStorage) {
      chrome.storage.sync.get({
        autoOpenEnabled: true,
        paletteSize: 'regular',
        iconStyle: 'modern',
        apiToken: DEFAULT_ACCESS_TOKEN,
        defaultWorkspaceId: '34919',
        shortcuts: DEFAULT_SHORTCUTS,
        announcement: '',
        remoteConfigUrl: DEFAULT_REMOTE_CONFIG_URL
      }, (items) => {
        currentSettings = {
          autoOpenEnabled: items.autoOpenEnabled !== false,
          paletteSize: items.paletteSize || 'regular',
          iconStyle: items.iconStyle || 'modern',
          apiToken: items.apiToken || DEFAULT_ACCESS_TOKEN,
          defaultWorkspaceId: items.defaultWorkspaceId || '34919',
          shortcuts: { ...DEFAULT_SHORTCUTS, ...(items.shortcuts || {}) },
          announcement: items.announcement || '',
          remoteConfigUrl: items.remoteConfigUrl || DEFAULT_REMOTE_CONFIG_URL
        };
        updateUiFromSettings();
        if (storageStatusEl) {
          storageStatusEl.innerHTML = '<span class="status-dot"></span> Extension Synced';
        }
      });
    } else {
      // LocalStorage fallback for standalone web app / Vercel
      try {
        const stored = localStorage.getItem('zg_powertools_admin_settings');
        if (stored) {
          currentSettings = { ...currentSettings, ...JSON.parse(stored) };
        }
      } catch (e) {}

      // In web mode, also try to fetch initial settings from /api/config
      try {
        const cloudResp = await fetch('/api/config').catch(() => null);
        if (cloudResp && cloudResp.ok) {
          const cloudData = await cloudResp.json();
          if (cloudData && typeof cloudData === 'object') {
            currentSettings = { ...currentSettings, ...cloudData };
          }
        }
      } catch (e) {}

      updateUiFromSettings();
      if (storageStatusEl) {
        storageStatusEl.innerHTML = '<span class="status-dot" style="background:#3b82f6;box-shadow:0 0 6px #3b82f6;"></span> Standalone Web Mode';
        storageStatusEl.style.color = '#1d4ed8';
        storageStatusEl.style.background = '#eff6ff';
        storageStatusEl.style.borderColor = '#bfdbfe';
      }
    }
    updateAuthBadge();
  }

  function saveSettings(partial) {
    currentSettings = { ...currentSettings, ...partial };
    if (hasExtensionStorage) {
      chrome.storage.sync.set(partial, () => {
        showToast('Settings saved to extension storage!');
      });
    } else {
      try {
        localStorage.setItem('zg_powertools_admin_settings', JSON.stringify(currentSettings));
        showToast('Saved to local browser storage!');
      } catch (e) {}
    }
    renderSimulator();
  }

  function updateUiFromSettings() {
    if (toggleAutoOpen) toggleAutoOpen.checked = currentSettings.autoOpenEnabled;
    if (selectPaletteSize) selectPaletteSize.value = currentSettings.paletteSize;
    if (selectPrimaryWs) selectPrimaryWs.value = currentSettings.defaultWorkspaceId;
    if (inputApiToken) inputApiToken.value = currentSettings.apiToken;
    if (inputCloudUrl) inputCloudUrl.value = currentSettings.remoteConfigUrl || DEFAULT_REMOTE_CONFIG_URL;
    if (inputAnnouncement) inputAnnouncement.value = currentSettings.announcement || '';
    if (inputGhToken) inputGhToken.value = localStorage.getItem('zg_gh_token') || '';

    // Update Icon Style Cards
    iconStyleCards.forEach(card => {
      const style = card.getAttribute('data-style');
      card.classList.toggle('selected', style === currentSettings.iconStyle);
    });

    renderHotkeyTable();
    renderSimulator();
    updateAuthBadge();
  }

  if (btnSaveGhToken) {
    btnSaveGhToken.addEventListener('click', () => {
      const val = (inputGhToken ? inputGhToken.value.trim() : '');
      if (val) {
        localStorage.setItem('zg_gh_token', val);
        showToast('✓ GitHub Publisher Token saved securely in browser!');
      } else {
        localStorage.removeItem('zg_gh_token');
        showToast('GitHub Publisher Token removed.');
      }
    });
  }

  // 4. TAB NAVIGATION
  navTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.getAttribute('data-tab');
      navTabs.forEach(t => t.classList.toggle('active', t === tab));
      tabContents.forEach(c => c.classList.toggle('active', c.id === `tab-${target}`));
    });
  });

  // 5. ICON STYLE SWITCHING
  iconStyleCards.forEach(card => {
    card.addEventListener('click', () => {
      const style = card.getAttribute('data-style');
      iconStyleCards.forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      saveSettings({ iconStyle: style });
    });
  });

  // 6. TOGGLE CONTROLS
  if (toggleAutoOpen) {
    toggleAutoOpen.addEventListener('change', () => {
      saveSettings({ autoOpenEnabled: toggleAutoOpen.checked });
    });
  }

  if (selectPaletteSize) {
    selectPaletteSize.addEventListener('change', () => {
      saveSettings({ paletteSize: selectPaletteSize.value });
    });
  }

  if (selectPrimaryWs) {
    selectPrimaryWs.addEventListener('change', () => {
      saveSettings({ defaultWorkspaceId: selectPrimaryWs.value });
    });
  }

  if (btnSaveToken) {
    btnSaveToken.addEventListener('click', () => {
      const token = (inputApiToken.value || '').trim();
      if (!token) return;
      saveSettings({ apiToken: token });
      showToast('Zengine API Access Token updated!');
    });
  }

  // 7. LIVE SIMULATOR LOGIC
  const SAMPLE_ITEMS = [
    {
      category: 'Students',
      iconKey: 'students',
      title: 'Ava Allen',
      desc: 'Form 185591 • Balance: $4,500.00 • Class of 2024',
      badge: 'Student #89302',
      hasDisb: true
    },
    {
      category: 'Disbursements',
      iconKey: 'disbursements',
      title: 'Disbursement $1,250.00',
      desc: 'Form 185672 • Florida Atlantic University • Fall 2024',
      badge: '$1,250.00',
      hasDisb: false
    },
    {
      category: 'Awards',
      iconKey: 'awards',
      title: 'George Snow Endowed Excellence Grant',
      desc: 'Form 185593 • Scholar: Ava Allen • Year: 2024',
      badge: '$5,000.00',
      hasDisb: true
    },
    {
      category: 'Emergency Grants',
      iconKey: 'emergency',
      title: 'Emergency Assistance — Ava Allen',
      desc: 'Form 370408 • Rapid Relief • Approved',
      badge: '$750.00',
      hasDisb: false
    },
    {
      category: 'Payees & Vendors',
      iconKey: 'payees',
      title: 'Florida Atlantic University',
      desc: 'Form 185766 • Boca Raton, FL • Approved College',
      badge: 'Payee #1842',
      hasDisb: false
    },
    {
      category: 'Quick Actions',
      iconKey: 'link',
      title: 'Copy Clean Record Link',
      desc: 'Direct permalink to current record without tracking hashes',
      badge: 'Alt + L',
      hasDisb: false
    }
  ];

  function getMockIconHtml(item) {
    const style = currentSettings.iconStyle || 'modern';
    if (style === 'none') {
      return '';
    }
    if (style === 'emoji') {
      return `<span class="mockup-item-icon emoji">${EMOJI_MAP[item.iconKey] || '📄'}</span>`;
    }
    return `<span class="mockup-item-icon modern">${MODERN_ICONS[item.iconKey] || MODERN_ICONS['form']}</span>`;
  }

  function renderSimulator() {
    if (!simulatorList) return;
    const q = (simulatorInput ? simulatorInput.value : '').toLowerCase().trim();
    simulatorList.innerHTML = '';

    const filtered = SAMPLE_ITEMS.filter(item => 
      !q || item.title.toLowerCase().includes(q) || item.desc.toLowerCase().includes(q) || item.category.toLowerCase().includes(q)
    );

    let currentCat = '';
    filtered.forEach((item, idx) => {
      if (item.category !== currentCat) {
        currentCat = item.category;
        const catLi = document.createElement('li');
        catLi.className = 'mockup-category';
        catLi.textContent = currentCat;
        simulatorList.appendChild(catLi);
      }

      const li = document.createElement('li');
      li.className = `mockup-item ${idx === 0 ? 'active' : ''}`;
      li.innerHTML = `
        <div class="mockup-item-left">
          ${getMockIconHtml(item)}
          <div class="mockup-item-text">
            <span class="mockup-item-title">${item.title}</span>
            <span class="mockup-item-desc">${item.desc}</span>
          </div>
        </div>
        <div class="mockup-item-right">
          ${item.hasDisb ? `
            <button type="button" class="mockup-disb-btn">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
              + Disb
            </button>
          ` : ''}
          <span class="mockup-badge">${item.badge}</span>
        </div>
      `;
      simulatorList.appendChild(li);
    });
  }

  if (simulatorInput) {
    simulatorInput.addEventListener('input', renderSimulator);
  }

  if (simulatorCloseBtn) {
    simulatorCloseBtn.addEventListener('click', () => {
      showToast('Close button [✕] clicked! (Simulates dismissing search popup)');
    });
  }

  // 8. HOTKEY TABLE
  let activeRecordingId = null;

  function renderHotkeyTable() {
    if (!hotkeyTableBody) return;
    hotkeyTableBody.innerHTML = '';

    const list = Object.values(currentSettings.shortcuts);
    list.forEach(sc => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>
          <div class="hotkey-name">${sc.label}</div>
          <div class="hotkey-desc">${sc.desc}</div>
        </td>
        <td>
          <button type="button" class="hotkey-badge ${activeRecordingId === sc.id ? 'recording' : ''}" data-id="${sc.id}">
            ${activeRecordingId === sc.id ? 'Press keys...' : sc.display}
          </button>
        </td>
        <td>
          <label class="switch">
            <input type="checkbox" data-id="${sc.id}" class="hotkey-toggle" ${sc.enabled ? 'checked' : ''}>
            <span class="slider"></span>
          </label>
        </td>
      `;
      hotkeyTableBody.appendChild(tr);
    });

    // Wire up toggles
    hotkeyTableBody.querySelectorAll('.hotkey-toggle').forEach(chk => {
      chk.addEventListener('change', () => {
        const id = chk.getAttribute('data-id');
        if (currentSettings.shortcuts[id]) {
          currentSettings.shortcuts[id].enabled = chk.checked;
          saveSettings({ shortcuts: currentSettings.shortcuts });
        }
      });
    });

    // Wire up badges for recording
    hotkeyTableBody.querySelectorAll('.hotkey-badge').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        if (activeRecordingId === id) {
          activeRecordingId = null;
          renderHotkeyTable();
          return;
        }
        activeRecordingId = id;
        renderHotkeyTable();
      });
    });
  }

  // Window keydown listener for remapping hotkeys
  window.addEventListener('keydown', (e) => {
    if (!activeRecordingId) return;
    e.preventDefault();
    e.stopPropagation();

    if (e.key === 'Escape') {
      activeRecordingId = null;
      renderHotkeyTable();
      return;
    }

    const key = e.key.toLowerCase();
    if (['control', 'shift', 'alt', 'meta'].includes(key)) return;

    const parts = [];
    if (e.ctrlKey) parts.push('ctrl');
    if (e.altKey) parts.push('alt');
    if (e.shiftKey) parts.push('shift');
    if (e.metaKey) parts.push('meta');
    parts.push(key);

    const combo = parts.join('+');
    const display = parts.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' + ');

    if (currentSettings.shortcuts[activeRecordingId]) {
      currentSettings.shortcuts[activeRecordingId].key = combo;
      currentSettings.shortcuts[activeRecordingId].display = display;
      saveSettings({ shortcuts: currentSettings.shortcuts });
      showToast(`Hotkey for "${currentSettings.shortcuts[activeRecordingId].label}" updated to ${display}!`);
    }

    activeRecordingId = null;
    renderHotkeyTable();
  }, true);

  if (btnResetAllHotkeys) {
    btnResetAllHotkeys.addEventListener('click', () => {
      currentSettings.shortcuts = JSON.parse(JSON.stringify(DEFAULT_SHORTCUTS));
      saveSettings({ shortcuts: currentSettings.shortcuts });
      renderHotkeyTable();
      showToast('All hotkeys restored to factory defaults!');
    });
  }

  // 9. API TOKEN TESTER
  if (btnTestToken) {
    btnTestToken.addEventListener('click', async () => {
      const token = (inputApiToken.value || '').trim();
      if (!token) {
        showToast('Please enter an API Token to test.');
        return;
      }
      tokenTestResult.style.display = 'block';
      tokenTestResult.innerHTML = '<span style="color:#64748b;">Testing connection to Zengine API (https://api.zenginehq.com)...</span>';

      const startTime = Date.now();
      try {
        const testUrl = `https://api.zenginehq.com/v1/forms/185591/records.json?access_token=${token}&limit=1`;
        const resp = await fetch(testUrl);
        const duration = Date.now() - startTime;
        if (resp.ok) {
          const data = await resp.json();
          tokenTestResult.innerHTML = `
            <div style="color:#047857;background:#ecfdf5;border:1px solid #a7f3d0;padding:10px 14px;border-radius:6px;font-size:12.5px;">
              <strong>✓ Connection Successful!</strong> Connected in ${duration}ms.<br>
              Workspace 34919 Form 185591 verified. Total records accessible.
            </div>
          `;
        } else {
          tokenTestResult.innerHTML = `
            <div style="color:#b91c1c;background:#fee2e2;border:1px solid #fca5a5;padding:10px 14px;border-radius:6px;font-size:12.5px;">
              <strong>✕ Connection Failed:</strong> HTTP Status ${resp.status} (${resp.statusText})<br>
              Check if the access token is valid and has permissions for workspace 34919.
            </div>
          `;
        }
      } catch (err) {
        tokenTestResult.innerHTML = `
          <div style="color:#b91c1c;background:#fee2e2;border:1px solid #fca5a5;padding:10px 14px;border-radius:6px;font-size:12.5px;">
            <strong>✕ Network Error:</strong> ${err.message}<br>
            If testing from a standard browser tab, ensure CORS or extension host permissions allow platform.zenginehq.com.
          </div>
        `;
      }
    });
  }

  // 10. EXPORT & IMPORT JSON
  if (btnExportJson) {
    btnExportJson.addEventListener('click', () => {
      const json = JSON.stringify(currentSettings, null, 2);
      navigator.clipboard.writeText(json).then(() => {
        showToast('✓ Settings JSON copied to clipboard!');
      }).catch(() => {
        prompt('Copy your settings JSON:', json);
      });
    });
  }

  if (btnImportJson) {
    btnImportJson.addEventListener('click', () => {
      const input = prompt('Paste your settings JSON profile here:');
      if (!input) return;
      try {
        const parsed = JSON.parse(input);
        saveSettings(parsed);
        updateUiFromSettings();
        showToast('✓ Settings imported successfully!');
      } catch (e) {
        alert('Invalid JSON format: ' + e.message);
      }
    });
  }

  // 11. CLOUD ENDPOINT & BROADCAST TEST
  if (btnTestCloudUrl) {
    btnTestCloudUrl.addEventListener('click', async () => {
      const url = (inputCloudUrl ? inputCloudUrl.value.trim() : '') || currentSettings.remoteConfigUrl;
      if (!cloudTestResult) return;
      cloudTestResult.style.display = 'block';
      cloudTestResult.innerHTML = '<span style="color:#2563eb;">Connecting to cloud endpoint...</span>';
      const start = Date.now();
      try {
        const resp = await fetch(url, { cache: 'no-store' });
        const latency = Date.now() - start;
        if (!resp.ok) {
          throw new Error(`HTTP ${resp.status} ${resp.statusText}`);
        }
        const data = await resp.json();
        cloudTestResult.innerHTML = `
          <div style="color:#047857; background:#ecfdf5; border:1px solid #a7f3d0; padding:10px 14px; border-radius:6px;">
            <strong>✓ Cloud Endpoint Connected (${latency}ms)</strong><br>
            Current Icon Style: <code>${data.iconStyle || 'modern'}</code> | Default Workspace: <code>${data.defaultWorkspaceId || '34919'}</code><br>
            Last Published: <code>${data.updatedAt || 'Default'}</code>
          </div>
        `;
      } catch (err) {
        cloudTestResult.innerHTML = `
          <div style="color:#b91c1c; background:#fee2e2; border:1px solid #fca5a5; padding:10px 14px; border-radius:6px;">
            <strong>✕ Cloud Connection Failed:</strong> ${err.message}<br>
            Ensure the server is running or deployed on Vercel with CORS enabled.
          </div>
        `;
      }
    });
  }

  if (inputCloudUrl) {
    inputCloudUrl.addEventListener('change', () => {
      saveSettings({ remoteConfigUrl: inputCloudUrl.value.trim() });
    });
  }

  if (inputAnnouncement) {
    inputAnnouncement.addEventListener('change', () => {
      saveSettings({ announcement: inputAnnouncement.value.trim() });
    });
  }

  // 12. TOAST HELPER
  function showToast(msg) {
    let container = document.getElementById('adminToastContainer');
    if (!container) {
      container = document.createElement('div');
      container.id = 'adminToastContainer';
      container.className = 'admin-toast-container';
      document.body.appendChild(container);
    }
    const toast = document.createElement('div');
    toast.className = 'admin-toast';
    toast.innerHTML = `<span>⚡</span><span>${msg}</span>`;
    container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.2s ease';
      setTimeout(() => toast.remove(), 200);
    }, 2800);
  }

  // Run on start
  loadSettings();
});
