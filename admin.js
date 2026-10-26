/**
 * Zengine Power-Tools Central Admin Portal
 * Controls, Icon Styles, Hotkeys, Cloud Sync & PIN Protection
 */

document.addEventListener('DOMContentLoaded', () => {
  const ADMIN_PIN = '010902';

  // 1. DEFAULT VALUES
  const DEFAULT_SHORTCUTS = {
    commandPalette: { id: 'commandPalette', label: 'Quick Search', desc: 'Live search students, awards & disbursements', enabled: true, key: 'ctrl+k', display: 'Ctrl + K' },
    navDown:        { id: 'navDown', label: 'Next Record', desc: 'Move to next record (table or drawer)', enabled: true, key: 'j', display: 'J' },
    navUp:          { id: 'navUp', label: 'Previous Record', desc: 'Move to previous record (table or drawer)', enabled: true, key: 'k', display: 'K' },
    openRecord:     { id: 'openRecord', label: 'Open Selected Record', desc: 'Open side panel for highlighted row', enabled: true, key: 'enter', display: 'Enter' },
    closePanel:     { id: 'closePanel', label: 'Close Panel / Escape', desc: 'Dismiss side panel or modal', enabled: true, key: 'escape', display: 'Esc' },
    cycleTabNext:   { id: 'cycleTabNext', label: 'Next Side Tab', desc: 'Cycle forward through side panel tabs', enabled: true, key: ']', display: ']' },
    cycleTabPrev:   { id: 'cycleTabPrev', label: 'Previous Side Tab', desc: 'Cycle backward through side panel tabs', enabled: true, key: '[', display: '[' },
    copyLink:       { id: 'copyLink', label: 'Copy record link', desc: 'Direct URL to current record', enabled: true, key: 'alt+l', display: 'Alt + L' },
    copySummary:    { id: 'copySummary', label: 'Copy Scholar Summary', desc: 'Scholar Name, ID & balance card', enabled: true, key: 'alt+c', display: 'Alt + C' },
    copyId:         { id: 'copyId', label: 'Copy Record ID Only', desc: 'Copy clean numeric ID to clipboard', enabled: true, key: 'alt+i', display: 'Alt + I' },
    focusSearch:    { id: 'focusSearch', label: 'Focus Table Search', desc: 'Open and focus table search bar', enabled: true, key: '/', display: '/' },
    addNewRecord:   { id: 'addNewRecord', label: 'Add New Record', desc: 'Trigger "+ Add Record" button', enabled: true, key: 'alt+n', display: 'Alt + N' },
    bulkEdit:       { id: 'bulkEdit', label: 'Bulk Actions', desc: 'Open Bulk Actions for current form', enabled: true, key: 'shift+e', display: 'Shift + E' },
    toggleFilters:  { id: 'toggleFilters', label: 'Toggle Table Filters', desc: 'Open/close Form Tools filter sidebar or Bulk Edit custom filter', enabled: true, key: '=', display: '=' },
    toggleDarkMode: { id: 'toggleDarkMode', label: 'Toggle Dark Mode', desc: 'Toggle Dark / Light theme', enabled: true, key: 'ctrl+q', display: 'Ctrl + Q' }
  };

  const DEFAULT_ACCESS_TOKEN = '';
  const DEFAULT_GH_PAT = '';
  const DEFAULT_REMOTE_CONFIG_URL = 'https://jorge-gssf.github.io/zengine-power-tools-admin/config.json';
  const FIRESTORE_SETTINGS_URL = 'https://firestore.googleapis.com/v1/projects/jorge-portfolio-site/databases/(default)/documents/portfolio_config/zengine_settings';
  const FIRESTORE_SECRET_KEY = '01Imre38!@' + String.fromCharCode(36);

  let currentSettings = {
    strictWorkspaceEnforcement: true,
    hideDarkMode: true,
    darkModeFeatureEnabled: false,
    autoOpenEnabled: true,
    fallbackApiTokenEnabled: true,
    paletteSize: 'regular',
    iconStyle: 'modern', // 'modern' | 'none' | 'emoji'
    apiToken: DEFAULT_ACCESS_TOKEN,
    defaultWorkspaceId: '34919',
    shortcuts: JSON.parse(JSON.stringify(DEFAULT_SHORTCUTS)),
    announcement: '',
    version: '1.8.30',
    remoteConfigUrl: DEFAULT_REMOTE_CONFIG_URL
  };

  function parseFirestoreSettings(doc) {
    if (!doc || !doc.fields) return null;
    const f = doc.fields;
    const res = {};
    if (f.hideDarkMode !== undefined) res.hideDarkMode = Boolean(f.hideDarkMode.booleanValue);
    if (f.darkModeFeatureEnabled !== undefined) res.darkModeFeatureEnabled = Boolean(f.darkModeFeatureEnabled.booleanValue);
    if (f.strictWorkspaceEnforcement !== undefined) res.strictWorkspaceEnforcement = Boolean(f.strictWorkspaceEnforcement.booleanValue);
    if (f.autoOpenEnabled !== undefined) res.autoOpenEnabled = Boolean(f.autoOpenEnabled.booleanValue);
    if (f.fallbackApiTokenEnabled !== undefined) res.fallbackApiTokenEnabled = Boolean(f.fallbackApiTokenEnabled.booleanValue);
    if (f.paletteSize && f.paletteSize.stringValue) res.paletteSize = f.paletteSize.stringValue;
    if (f.iconStyle && f.iconStyle.stringValue) res.iconStyle = f.iconStyle.stringValue;
    if (f.apiToken && f.apiToken.stringValue) res.apiToken = f.apiToken.stringValue;
    if (f.defaultWorkspaceId && f.defaultWorkspaceId.stringValue) res.defaultWorkspaceId = f.defaultWorkspaceId.stringValue;
    if (f.announcement && f.announcement.stringValue) res.announcement = f.announcement.stringValue;
    if (f.version && f.version.stringValue) res.version = f.version.stringValue;
    if (f.shortcuts_json && f.shortcuts_json.stringValue) {
      try { res.shortcuts = JSON.parse(f.shortcuts_json.stringValue); } catch(e) {}
    }
    return res;
  }

  async function saveToFirebase(updates) {
    try {
      const fields = {
        secret_key: { stringValue: FIRESTORE_SECRET_KEY }
      };
      if (updates.hideDarkMode !== undefined) {
        fields.hideDarkMode = { booleanValue: Boolean(updates.hideDarkMode) };
        fields.darkModeFeatureEnabled = { booleanValue: !updates.hideDarkMode };
      }
      if (updates.strictWorkspaceEnforcement !== undefined) {
        fields.strictWorkspaceEnforcement = { booleanValue: Boolean(updates.strictWorkspaceEnforcement) };
      }
      if (updates.fallbackApiTokenEnabled !== undefined) {
        fields.fallbackApiTokenEnabled = { booleanValue: Boolean(updates.fallbackApiTokenEnabled) };
      }
      if (updates.autoOpenEnabled !== undefined) {
        fields.autoOpenEnabled = { booleanValue: Boolean(updates.autoOpenEnabled) };
      }
      if (updates.paletteSize !== undefined) {
        fields.paletteSize = { stringValue: String(updates.paletteSize) };
      }
      if (updates.iconStyle !== undefined) {
        fields.iconStyle = { stringValue: String(updates.iconStyle) };
      }
      if (updates.apiToken !== undefined) {
        fields.apiToken = { stringValue: String(updates.apiToken) };
      }
      if (updates.defaultWorkspaceId !== undefined) {
        fields.defaultWorkspaceId = { stringValue: String(updates.defaultWorkspaceId) };
      }
      if (updates.announcement !== undefined) {
        fields.announcement = { stringValue: String(updates.announcement) };
      }
      if (updates.shortcuts !== undefined) {
        fields.shortcuts_json = { stringValue: JSON.stringify(updates.shortcuts) };
      }
      fields.updatedAt = { stringValue: new Date().toISOString() };
      fields.version = { stringValue: '1.8.30' };

      const resp = await fetch(FIRESTORE_SETTINGS_URL, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fields })
      });
      if (resp.ok) {
        if (storageStatusText) storageStatusText.textContent = 'Firebase Synced';
      }
    } catch (err) {
      console.warn('Firebase save failed:', err);
    }
  }

  // 2. DOM REFERENCES
  const pinGateOverlay = document.getElementById('adminPinGate');
  const pinCard = document.querySelector('.pin-gate-card');
  const pinHiddenInput = document.getElementById('pinHiddenInput');
  const pinDots = document.querySelectorAll('.pin-dot');
  const pinErrorMsg = document.getElementById('pinErrorMsg');
  const pinKeypad = document.querySelector('.pin-keypad');
  const btnPinClear = document.getElementById('btnPinClear');
  const btnPinBackspace = document.getElementById('btnPinBackspace');

  const adminMainApp = document.getElementById('adminMainApp');
  const btnLockAdmin = document.getElementById('btnLockAdmin');
  const storageStatusText = document.getElementById('storageStatusText');
  const btnPublishCloud = document.getElementById('btnPublishCloud');
  const btnExportJson = document.getElementById('btnExportJson');
  const btnImportJson = document.getElementById('btnImportJson');

  const navTabs = document.querySelectorAll('.admin-nav-tab');
  const tabContents = document.querySelectorAll('.tab-content');
  const iconStyleCards = document.querySelectorAll('.icon-style-card');
  const selectPaletteSize = document.getElementById('selectPaletteSize');
  const toggleStrictWorkspace = document.getElementById('toggleStrictWorkspace');
  const toggleHideDarkMode = document.getElementById('toggleHideDarkMode');
  const toggleAutoOpen = document.getElementById('toggleAutoOpen');
  const toggleFallbackApiToken = document.getElementById('toggleFallbackApiToken');

  const hotkeyTableBody = document.getElementById('hotkeyTableBody');
  const btnResetAllHotkeys = document.getElementById('btnResetAllHotkeys');

  const inputApiToken = document.getElementById('inputApiToken');
  const btnSaveToken = document.getElementById('btnSaveToken');
  const btnTestToken = document.getElementById('btnTestToken');
  const tokenTestResult = document.getElementById('tokenTestResult');

  const inputCloudUrl = document.getElementById('inputCloudUrl');
  const btnTestCloudUrl = document.getElementById('btnTestCloudUrl');
  const cloudTestResult = document.getElementById('cloudTestResult');
  const inputAnnouncement = document.getElementById('inputAnnouncement');
  const inputGhToken = document.getElementById('inputGhToken');
  const btnSaveGhToken = document.getElementById('btnSaveGhToken');

  // =========================================================================
  // 3. PIN GATE SECURITY ENGINE ("010902")
  // =========================================================================
  let enteredPin = '';

  function isPinUnlocked() {
    return sessionStorage.getItem('zg_admin_pin_auth') === ADMIN_PIN;
  }

  function updatePinDots() {
    pinDots.forEach((dot, idx) => {
      dot.classList.toggle('filled', idx < enteredPin.length);
      dot.classList.remove('success');
    });
  }

  function verifyPin() {
    if (enteredPin.length < 6) return;

    if (enteredPin === ADMIN_PIN) {
      pinDots.forEach(dot => dot.classList.add('success'));
      if (pinErrorMsg) {
        pinErrorMsg.style.color = 'var(--success)';
        pinErrorMsg.textContent = '✓ Access Granted';
      }

      sessionStorage.setItem('zg_admin_pin_auth', ADMIN_PIN);
      sessionStorage.setItem('zg_admin_session_token', 'pin_unlocked');

      setTimeout(() => {
        pinGateOverlay.classList.add('hidden');
        adminMainApp.classList.add('unlocked');
        showToast('✓ Welcome, Administrator');
      }, 200);

    } else {
      if (pinCard) pinCard.classList.add('shake');
      if (pinErrorMsg) {
        pinErrorMsg.style.color = 'var(--danger)';
        pinErrorMsg.textContent = 'Incorrect PIN. Access Denied.';
      }
      setTimeout(() => {
        if (pinCard) pinCard.classList.remove('shake');
        enteredPin = '';
        updatePinDots();
        if (pinHiddenInput) {
          pinHiddenInput.value = '';
          pinHiddenInput.focus();
        }
      }, 450);
    }
  }

  function handleDigitInput(digit) {
    if (enteredPin.length >= 6) return;
    if (pinErrorMsg) pinErrorMsg.textContent = '';
    enteredPin += digit;
    updatePinDots();
    if (enteredPin.length === 6) {
      verifyPin();
    }
  }

  function handleBackspace() {
    if (enteredPin.length > 0) {
      enteredPin = enteredPin.slice(0, -1);
      if (pinErrorMsg) pinErrorMsg.textContent = '';
      updatePinDots();
    }
  }

  function handleClear() {
    enteredPin = '';
    if (pinErrorMsg) pinErrorMsg.textContent = '';
    updatePinDots();
    if (pinHiddenInput) {
      pinHiddenInput.value = '';
      pinHiddenInput.focus();
    }
  }

  // Keypad clicks
  if (pinKeypad) {
    pinKeypad.addEventListener('click', (e) => {
      const btn = e.target.closest('button');
      if (!btn) return;
      const digit = btn.getAttribute('data-digit');
      if (digit !== null) {
        handleDigitInput(digit);
      }
    });
  }

  if (btnPinBackspace) btnPinBackspace.addEventListener('click', handleBackspace);
  if (btnPinClear) btnPinClear.addEventListener('click', handleClear);

  // Keyboard entry
  document.addEventListener('keydown', (e) => {
    if (isPinUnlocked()) return;

    if (e.key >= '0' && e.key <= '9') {
      handleDigitInput(e.key);
    } else if (e.key === 'Backspace') {
      handleBackspace();
    } else if (e.key === 'Escape' || e.key === 'Delete') {
      handleClear();
    }
  });

  // Keep hidden input focused for mobile or screen readers
  if (pinGateOverlay) {
    pinGateOverlay.addEventListener('click', () => {
      if (!isPinUnlocked() && pinHiddenInput) pinHiddenInput.focus();
    });
  }

  // Lock button
  if (btnLockAdmin) {
    btnLockAdmin.addEventListener('click', () => {
      sessionStorage.removeItem('zg_admin_pin_auth');
      sessionStorage.removeItem('zg_admin_session_token');
      enteredPin = '';
      updatePinDots();
      if (pinErrorMsg) pinErrorMsg.textContent = '';
      adminMainApp.classList.remove('unlocked');
      pinGateOverlay.classList.remove('hidden');
      if (pinHiddenInput) {
        pinHiddenInput.value = '';
        pinHiddenInput.focus();
      }
      showToast('Admin session locked');
    });
  }

  // Initialize PIN state
  if (isPinUnlocked()) {
    pinGateOverlay.classList.add('hidden');
    adminMainApp.classList.add('unlocked');
  } else {
    adminMainApp.classList.remove('unlocked');
    pinGateOverlay.classList.remove('hidden');
    setTimeout(() => pinHiddenInput && pinHiddenInput.focus(), 150);
  }

  // =========================================================================
  // 4. TAB NAVIGATION
  // =========================================================================
  navTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.getAttribute('data-tab');
      navTabs.forEach(t => t.classList.toggle('active', t === tab));
      tabContents.forEach(c => c.classList.toggle('active', c.id === `tab-${target}`));
    });
  });

  // =========================================================================
  // 5. STORAGE & INITIAL LOAD
  // =========================================================================
  const hasExtensionStorage = typeof chrome !== 'undefined' && chrome.storage && chrome.storage.sync;

  async function loadInitialSettings() {
    let loaded = false;

    // 0. FIRST: Immediately load cached settings from localStorage for instant zero-flicker persistence on refresh!
    const cached = localStorage.getItem('zg_admin_cached_config');
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (parsed && typeof parsed === 'object') {
          currentSettings = { ...currentSettings, ...parsed };
          applySettingsToUI();
          loaded = true;
        }
      } catch (e) {}
    }

    // A. Check extension storage if running inside extension
    if (hasExtensionStorage) {
      await new Promise(resolve => {
        chrome.storage.sync.get(null, (items) => {
          if (items && Object.keys(items).length > 0) {
            currentSettings = { ...currentSettings, ...items };
            loaded = true;
          }
          resolve();
        });
      });
    }

    // B. Fetch live cloud config from Firebase Firestore (Instant zero-delay cloud sync)
    try {
      const fbResp = await fetch(FIRESTORE_SETTINGS_URL + '?_t=' + Date.now(), { cache: 'no-store' });
      if (fbResp.ok) {
        const fbDoc = await fbResp.json();
        const fbSettings = parseFirestoreSettings(fbDoc);
        if (fbSettings && Object.keys(fbSettings).length > 0) {
          currentSettings = { ...currentSettings, ...fbSettings };
          if (storageStatusText) storageStatusText.textContent = 'Firebase Live';
          localStorage.setItem('zg_admin_cached_config', JSON.stringify(currentSettings));
          if (hasExtensionStorage) chrome.storage.sync.set(currentSettings);
          loaded = true;
        }
      }
    } catch (fbErr) {
      console.warn('Firebase sync failed, falling back to GitHub:', fbErr);
      try {
        const cloudUrl = (inputCloudUrl && inputCloudUrl.value.trim()) || DEFAULT_REMOTE_CONFIG_URL;
        const resp = await fetch(cloudUrl + '?_t=' + Date.now(), { cache: 'no-store' });
        if (resp.ok) {
          const cloudData = await resp.json();
          if (cloudData && typeof cloudData === 'object') {
            currentSettings = { ...currentSettings, ...cloudData };
            if (storageStatusText) storageStatusText.textContent = 'Live Synced';
            loaded = true;
          }
        }
      } catch (e) {
        console.warn('Could not fetch cloud config on load:', e);
      }
    }

    // C. Check saved GitHub PAT token
    const savedGh = localStorage.getItem('zg_admin_gh_token') || '';
    
    if (inputGhToken) {
      inputGhToken.value = savedGh;
      inputGhToken.addEventListener('input', () => {
        const v = inputGhToken.value.trim();
        localStorage.setItem('zg_admin_gh_token', v);
        try { chrome.storage.local.set({ zg_admin_gh_token: v }); } catch(e) {}
      });
    }

    // Normalize shortcuts: remove removed refreshData and update labels
    if (currentSettings.shortcuts) {
      delete currentSettings.shortcuts.refreshData;
      if (currentSettings.shortcuts.commandPalette) currentSettings.shortcuts.commandPalette.label = 'Quick Search';
      if (currentSettings.shortcuts.copyLink) currentSettings.shortcuts.copyLink.label = 'Copy record link';
    }

    applySettingsToUI();
  }

  function applySettingsToUI() {
    // Icon Style
    iconStyleCards.forEach(c => {
      c.classList.toggle('selected', c.getAttribute('data-style') === (currentSettings.iconStyle || 'modern'));
    });

    // Palette Size
    if (selectPaletteSize) selectPaletteSize.value = currentSettings.paletteSize || 'regular';

    // Global Feature Policies
    if (toggleStrictWorkspace) toggleStrictWorkspace.checked = currentSettings.strictWorkspaceEnforcement !== false;
    if (toggleHideDarkMode) toggleHideDarkMode.checked = currentSettings.hideDarkMode === true || currentSettings.darkModeFeatureEnabled === false;
    if (toggleAutoOpen) toggleAutoOpen.checked = currentSettings.autoOpenEnabled !== false;
    if (toggleFallbackApiToken) toggleFallbackApiToken.checked = currentSettings.fallbackApiTokenEnabled !== false;

    // API Token
    if (inputApiToken) inputApiToken.value = currentSettings.apiToken || DEFAULT_ACCESS_TOKEN;

    // Announcement
    if (inputAnnouncement) inputAnnouncement.value = currentSettings.announcement || '';

    // Version pill
    const versionPill = document.querySelector('.version-pill');
    if (versionPill) {
      const currentAppVersion = (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.getManifest)
        ? chrome.runtime.getManifest().version
        : '1.8.21';
      versionPill.textContent = 'v' + (currentSettings.version || currentAppVersion);
    }

    // Hotkey table
    renderHotkeyTable();
  }

  function saveLocalSettings(updates) {
    currentSettings = { ...currentSettings, ...updates };
    if (hasExtensionStorage) {
      chrome.storage.sync.set(updates);
    }
    localStorage.setItem('zg_admin_cached_config', JSON.stringify(currentSettings));
    saveToFirebase(updates);
  }

  // =========================================================================
  // 6. ICON DESIGN SYSTEM CONTROLS
  // =========================================================================
  iconStyleCards.forEach(card => {
    card.addEventListener('click', () => {
      const style = card.getAttribute('data-style');
      iconStyleCards.forEach(c => c.classList.toggle('selected', c === card));
      currentSettings.iconStyle = style;
      saveLocalSettings({ iconStyle: style });
      showToast(`Quick Search Icon style set to ${card.querySelector('h3').textContent}`);
    });
  });

  if (selectPaletteSize) {
    selectPaletteSize.addEventListener('change', () => {
      currentSettings.paletteSize = selectPaletteSize.value;
      saveLocalSettings({ paletteSize: selectPaletteSize.value });
      showToast(`Quick Search size set to ${selectPaletteSize.value === 'large' ? 'Expanded (920px)' : 'Regular (640px)'}`);
    });
  }

  if (toggleStrictWorkspace) {
    toggleStrictWorkspace.addEventListener('change', () => {
      currentSettings.strictWorkspaceEnforcement = toggleStrictWorkspace.checked;
      saveLocalSettings({ strictWorkspaceEnforcement: toggleStrictWorkspace.checked });
      showToast(`Strict Workspace Enforcement ${toggleStrictWorkspace.checked ? 'Enabled' : 'Disabled'}`);
    });
  }

  if (toggleHideDarkMode) {
    toggleHideDarkMode.addEventListener('change', () => {
      const isHidden = toggleHideDarkMode.checked;
      currentSettings.hideDarkMode = isHidden;
      currentSettings.darkModeFeatureEnabled = !isHidden;
      saveLocalSettings({
        hideDarkMode: isHidden,
        darkModeFeatureEnabled: !isHidden
      });
      showToast(`Dark Mode ${isHidden ? 'Hidden Globally' : 'Visible for Users'}`);
    });
  }

  if (toggleFallbackApiToken) {
    toggleFallbackApiToken.addEventListener('change', () => {
      currentSettings.fallbackApiTokenEnabled = toggleFallbackApiToken.checked;
      saveLocalSettings({ fallbackApiTokenEnabled: toggleFallbackApiToken.checked });
      showToast(`Fallback API Token ${toggleFallbackApiToken.checked ? 'Enabled' : 'Disabled'}`);
    });
  }

  if (toggleAutoOpen) {
    toggleAutoOpen.addEventListener('change', () => {
      currentSettings.autoOpenEnabled = toggleAutoOpen.checked;
      saveLocalSettings({ autoOpenEnabled: toggleAutoOpen.checked });
      showToast(`Auto-open Disbursements Tab ${toggleAutoOpen.checked ? 'Enabled' : 'Disabled'}`);
    });
  }

  // =========================================================================
  // 7. HOTKEYS REMAPPING & TABLE
  // =========================================================================
  let activeRecordingId = null;

  function renderHotkeyTable() {
    if (!hotkeyTableBody) return;
    hotkeyTableBody.innerHTML = '';

    const shortcuts = currentSettings.shortcuts || DEFAULT_SHORTCUTS;

    Object.values(shortcuts).forEach(sc => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>
          <div class="hotkey-action-title">${sc.label}</div>
          <div class="hotkey-action-desc">${sc.desc}</div>
        </td>
        <td>
          <span class="hotkey-badge ${activeRecordingId === sc.id ? 'recording' : ''}" data-id="${sc.id}">
            ${activeRecordingId === sc.id ? 'Press Key...' : sc.display}
          </span>
        </td>
        <td style="text-align:right;">
          <label class="switch">
            <input type="checkbox" data-id="${sc.id}" class="hotkey-toggle" ${sc.enabled ? 'checked' : ''}>
            <span class="slider"></span>
          </label>
        </td>
      `;
      hotkeyTableBody.appendChild(tr);
    });

    // Remap badge clicks
    hotkeyTableBody.querySelectorAll('.hotkey-badge').forEach(badge => {
      badge.addEventListener('click', () => {
        const id = badge.getAttribute('data-id');
        if (activeRecordingId === id) {
          activeRecordingId = null;
          renderHotkeyTable();
          return;
        }
        activeRecordingId = id;
        renderHotkeyTable();
      });
    });

    // Toggle switch listeners
    hotkeyTableBody.querySelectorAll('.hotkey-toggle').forEach(t => {
      t.addEventListener('change', () => {
        const id = t.getAttribute('data-id');
        if (currentSettings.shortcuts && currentSettings.shortcuts[id]) {
          currentSettings.shortcuts[id].enabled = t.checked;
          saveLocalSettings({ shortcuts: currentSettings.shortcuts });
          showToast(`${currentSettings.shortcuts[id].label} ${t.checked ? 'enabled' : 'disabled'}`);
        }
      });
    });
  }

  // Key Recording Listener
  document.addEventListener('keydown', (e) => {
    if (!activeRecordingId) return;

    e.preventDefault();
    e.stopPropagation();

    if (e.key === 'Escape') {
      activeRecordingId = null;
      renderHotkeyTable();
      return;
    }

    const parts = [];
    if (e.ctrlKey) parts.push('ctrl');
    if (e.altKey) parts.push('alt');
    if (e.shiftKey) parts.push('shift');
    if (e.metaKey) parts.push('meta');

    let mainKey = e.key.toLowerCase();
    if (['control', 'alt', 'shift', 'meta'].includes(mainKey)) {
      return; // Wait for non-modifier key
    }

    if (mainKey === ' ') mainKey = 'space';
    parts.push(mainKey);

    const comboKey = parts.join('+');
    const displayCombo = parts.map(p => {
      if (p === 'ctrl') return 'Ctrl';
      if (p === 'alt') return 'Alt';
      if (p === 'shift') return 'Shift';
      if (p === 'meta') return 'Cmd';
      return p.toUpperCase();
    }).join(' + ');

    if (currentSettings.shortcuts && currentSettings.shortcuts[activeRecordingId]) {
      currentSettings.shortcuts[activeRecordingId].key = comboKey;
      currentSettings.shortcuts[activeRecordingId].display = displayCombo;
      saveLocalSettings({ shortcuts: currentSettings.shortcuts });
      showToast(`Key recorded: ${displayCombo}`);
    }

    activeRecordingId = null;
    renderHotkeyTable();
  }, true);

  if (btnResetAllHotkeys) {
    btnResetAllHotkeys.addEventListener('click', () => {
      if (confirm('Reset all keyboard shortcuts to factory defaults?')) {
        currentSettings.shortcuts = JSON.parse(JSON.stringify(DEFAULT_SHORTCUTS));
        saveLocalSettings({ shortcuts: currentSettings.shortcuts });
        renderHotkeyTable();
        showToast('All shortcuts reset to defaults.');
      }
    });
  }

  // =========================================================================
  // 8. CLOUD PUBLISHING ENGINE (1-CLICK DIRECT GITHUB COMMIT)
  // =========================================================================
  async function publishToCloud() {
    let ghToken = (inputGhToken ? inputGhToken.value.trim() : '') || localStorage.getItem('zg_admin_gh_token') || DEFAULT_GH_PAT;

    if (!ghToken) {
      ghToken = prompt('Enter your GitHub Personal Access Token (PAT) with repo permissions to publish:');
      if (!ghToken) return;
      localStorage.setItem('zg_admin_gh_token', ghToken);
      if (inputGhToken) inputGhToken.value = ghToken;
    }

    if (btnPublishCloud) {
      btnPublishCloud.disabled = true;
      btnPublishCloud.innerHTML = `
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="zg-spin" style="animation:spin 1s linear infinite;"><path d="M21 12a9 9 0 1 1-6.219-8.56"></path></svg>
        Publishing...
      `;
    }

    const payloadConfig = {
      strictWorkspaceEnforcement: currentSettings.strictWorkspaceEnforcement !== false,
      iconStyle: currentSettings.iconStyle,
      paletteSize: currentSettings.paletteSize,
      autoOpenEnabled: currentSettings.autoOpenEnabled,
      fallbackApiTokenEnabled: currentSettings.fallbackApiTokenEnabled !== false,
      hideDarkMode: Boolean(currentSettings.hideDarkMode),
      darkModeFeatureEnabled: !currentSettings.hideDarkMode,
      apiToken: currentSettings.apiToken || DEFAULT_ACCESS_TOKEN,
      defaultWorkspaceId: currentSettings.defaultWorkspaceId || '34919',
      shortcuts: (() => {
        const sc = { ...currentSettings.shortcuts };
        delete sc.refreshData;
        if (sc.commandPalette) sc.commandPalette.label = 'Quick Search';
        if (sc.copyLink) sc.copyLink.label = 'Copy record link';
        return sc;
      })(),
      announcement: (inputAnnouncement ? inputAnnouncement.value.trim() : '') || currentSettings.announcement || '',
      version: '1.8.30',
      updatedAt: new Date().toISOString()
    };

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

      // Save to Firebase and locally
      saveToFirebase(payloadConfig);
      saveLocalSettings(payloadConfig);
      localStorage.setItem('zg_admin_gh_token', ghToken);

      showToast('☁ Successfully Published to Cloud! Extensions will sync.');
      if (storageStatusText) storageStatusText.textContent = 'Live Synced';

    } catch (err) {
      alert(`Publish failed: ${err.message}. If token expired, clear it and re-enter.`);
      console.error(err);
    } finally {
      if (btnPublishCloud) {
        btnPublishCloud.disabled = false;
        btnPublishCloud.innerHTML = `
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"></path><path d="m12 12 0 9"></path><path d="m16 16-4-4-4 4"></path></svg>
          Publish to All Users
        `;
      }
    }
  }

  if (btnPublishCloud) btnPublishCloud.addEventListener('click', publishToCloud);

  if (btnSaveGhToken && inputGhToken) {
    btnSaveGhToken.addEventListener('click', () => {
      const val = inputGhToken.value.trim();
      localStorage.setItem('zg_admin_gh_token', val);
      showToast(val ? 'GitHub PAT token saved!' : 'GitHub PAT cleared.');
    });
  }

  // =========================================================================
  // 9. API TOKEN & DIAGNOSTICS
  // =========================================================================
  if (btnSaveToken && inputApiToken) {
    btnSaveToken.addEventListener('click', () => {
      const token = inputApiToken.value.trim();
      currentSettings.apiToken = token;
      saveLocalSettings({ apiToken: token });
      showToast('API Access Token saved!');
    });
  }

  if (btnTestToken && inputApiToken) {
    btnTestToken.addEventListener('click', async () => {
      const token = inputApiToken.value.trim();
      if (!token) {
        alert('Please enter an API token to test.');
        return;
      }
      btnTestToken.disabled = true;
      btnTestToken.textContent = 'Testing...';
      if (tokenTestResult) tokenTestResult.style.display = 'none';

      try {
        const resp = await fetch('https://api.zenginehq.com/v1/workspaces/34919.json', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await resp.json();
        if (resp.ok && data && data.data) {
          if (tokenTestResult) {
            tokenTestResult.style.display = 'block';
            tokenTestResult.style.color = '#059669';
            tokenTestResult.innerHTML = `✓ Connected to Workspace <strong>${data.data.name || '34919'}</strong> successfully!`;
          }
          showToast('✓ Zengine API Connection Verified!');
        } else {
          throw new Error(data?.userMessage || `API returned status ${resp.status}`);
        }
      } catch (err) {
        if (tokenTestResult) {
          tokenTestResult.style.display = 'block';
          tokenTestResult.style.color = '#dc2626';
          tokenTestResult.innerHTML = `⚠️ Connection error: ${err.message}`;
        }
      } finally {
        btnTestToken.disabled = false;
        btnTestToken.textContent = 'Test Connection';
      }
    });
  }

  // =========================================================================
  // 10. CLOUD ENDPOINT TEST
  // =========================================================================
  if (btnTestCloudUrl && inputCloudUrl) {
    btnTestCloudUrl.addEventListener('click', async () => {
      const url = inputCloudUrl.value.trim();
      btnTestCloudUrl.disabled = true;
      btnTestCloudUrl.textContent = 'Testing...';
      if (cloudTestResult) cloudTestResult.style.display = 'none';

      try {
        const resp = await fetch(`${url}?_t=${Date.now()}`, { cache: 'no-store' });
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        const data = await resp.json();
        if (cloudTestResult) {
          cloudTestResult.style.display = 'block';
          cloudTestResult.style.background = '#ecfdf5';
          cloudTestResult.style.color = '#047857';
          cloudTestResult.style.border = '1px solid #a7f3d0';
          cloudTestResult.innerHTML = `✓ Cloud endpoint active! Icon Style: <strong>${data.iconStyle || 'none'}</strong>, Updated: ${new Date(data.updatedAt || Date.now()).toLocaleTimeString()}`;
        }
      } catch (e) {
        if (cloudTestResult) {
          cloudTestResult.style.display = 'block';
          cloudTestResult.style.background = '#fef2f2';
          cloudTestResult.style.color = '#b91c1c';
          cloudTestResult.style.border = '1px solid #fecaca';
          cloudTestResult.textContent = `⚠️ Cloud test failed: ${e.message}`;
        }
      } finally {
        btnTestCloudUrl.disabled = false;
        btnTestCloudUrl.textContent = 'Test Cloud API';
      }
    });
  }

  // =========================================================================
  // 11. IMPORT / EXPORT JSON
  // =========================================================================
  if (btnExportJson) {
    btnExportJson.addEventListener('click', () => {
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(currentSettings, null, 2));
      const a = document.createElement('a');
      a.setAttribute('href', dataStr);
      a.setAttribute('download', `zengine-settings-${new Date().toISOString().slice(0, 10)}.json`);
      document.body.appendChild(a);
      a.click();
      a.remove();
      showToast('Settings exported as JSON!');
    });
  }

  if (btnImportJson) {
    btnImportJson.addEventListener('click', () => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.json,application/json';
      input.onchange = (e) => {
        const file = e.target.files && e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (re) => {
          try {
            const parsed = JSON.parse(re.target.result);
            if (parsed && typeof parsed === 'object') {
              currentSettings = { ...currentSettings, ...parsed };
              saveLocalSettings(currentSettings);
              applySettingsToUI();
              showToast('Settings successfully imported!');
            }
          } catch (err) {
            alert('Invalid JSON file.');
          }
        };
        reader.readAsText(file);
      };
      input.click();
    });
  }

  // =========================================================================
  // 12. TOAST SYSTEM
  // =========================================================================
  function showToast(msg) {
    const container = document.getElementById('adminToastContainer');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = 'admin-toast';
    toast.textContent = msg;
    container.appendChild(toast);
    setTimeout(() => {
      toast.remove();
    }, 2400);
  }

  // Load everything
  loadInitialSettings();
});
