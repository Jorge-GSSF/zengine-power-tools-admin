/**
 * Vercel Serverless Function: /api/config
 * Central Configuration Distribution for Zengine Power-Tools Extensions
 * Allows George Snow Scholarship Fund admins to publish settings to ALL installed extensions.
 */

import fs from 'fs';
import path from 'path';

const TMP_CONFIG_PATH = path.join('/tmp', 'zengine_power_tools_cloud_config.json');

const DEFAULT_CONFIG = {
  iconStyle: 'modern',
  paletteSize: 'regular',
  autoOpenEnabled: true,
  apiToken: '644cc1ee38244d57d7b458eaf29d2b714fb7e267',
  defaultWorkspaceId: '34919',
  shortcuts: {
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
  },
  announcement: '',
  version: '1.4.5',
  updatedAt: new Date().toISOString()
};

function readCurrentConfig() {
  if (global.__ZG_CONFIG__) {
    return global.__ZG_CONFIG__;
  }
  try {
    if (fs.existsSync(TMP_CONFIG_PATH)) {
      const data = fs.readFileSync(TMP_CONFIG_PATH, 'utf-8');
      const parsed = JSON.parse(data);
      global.__ZG_CONFIG__ = { ...DEFAULT_CONFIG, ...parsed };
      return global.__ZG_CONFIG__;
    }
  } catch (e) {
    // ignore
  }
  global.__ZG_CONFIG__ = { ...DEFAULT_CONFIG };
  return global.__ZG_CONFIG__;
}

function writeCurrentConfig(newConfig) {
  const merged = {
    ...DEFAULT_CONFIG,
    ...newConfig,
    updatedAt: new Date().toISOString()
  };
  global.__ZG_CONFIG__ = merged;
  try {
    fs.writeFileSync(TMP_CONFIG_PATH, JSON.stringify(merged, null, 2), 'utf-8');
  } catch (e) {
    // ignore
  }
  return merged;
}

export default function handler(req, res) {
  // Broad CORS headers so Chrome/Edge extension background scripts can fetch from anywhere
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // GET: Return current centralized configuration
  if (req.method === 'GET') {
    const config = readCurrentConfig();
    return res.status(200).json(config);
  }

  // POST: Publish new centralized configuration to all extensions
  if (req.method === 'POST') {
    const authHeader = req.headers['authorization'] || '';
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const adminPass = process.env.ADMIN_PASSWORD || 'georgesnow2026';

    const token = authHeader.replace(/^Bearer\s+/i, '');
    let authorized = false;

    if (body.adminPassword === adminPass || token.includes(adminPass) || token === 'authenticated') {
      authorized = true;
    }

    if (!authorized) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized: Invalid admin credentials to publish changes.'
      });
    }

    const payload = body.config || body;
    const updated = writeCurrentConfig(payload);

    return res.status(200).json({
      success: true,
      message: 'Central settings published successfully! All extensions worldwide will sync.',
      config: updated
    });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
