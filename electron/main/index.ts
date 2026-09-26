import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import fs from 'node:fs/promises';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const isDev = !app.isPackaged;

const PREFABS_DIR = path.join(app.getPath('userData'), 'prefabs');

async function ensurePrefabsDir() {
  await fs.mkdir(PREFABS_DIR, { recursive: true });
}

function createWindow(): BrowserWindow {
  const win = new BrowserWindow({
    width: 1600,
    height: 960,
    minWidth: 1024,
    minHeight: 640,
    backgroundColor: '#0a0b0f',
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  });

  if (isDev && process.env['ELECTRON_RENDERER_URL']) {
    void win.loadURL(process.env['ELECTRON_RENDERER_URL']);
  } else {
    void win.loadFile(path.join(__dirname, '../renderer/index.html'));
  }

  return win;
}

app.whenReady().then(async () => {
  await ensurePrefabsDir();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

ipcMain.handle('prefabs:list', async () => {
  await ensurePrefabsDir();
  const entries = await fs.readdir(PREFABS_DIR, { withFileTypes: true });
  return entries.filter((e) => e.isFile() && e.name.endsWith('.json')).map((e) => e.name.replace(/\.json$/, ''));
});

ipcMain.handle('prefabs:save', async (_event, name: string, data: unknown) => {
  if (!/^[a-zA-Z0-9_-]{1,64}$/.test(name)) {
    throw new Error('Invalid prefab name: use letters, numbers, dashes, underscores only.');
  }
  await ensurePrefabsDir();
  const filePath = path.join(PREFABS_DIR, `${name}.json`);
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
  return filePath;
});

ipcMain.handle('prefabs:load', async (_event, name: string) => {
  if (!/^[a-zA-Z0-9_-]{1,64}$/.test(name)) {
    throw new Error('Invalid prefab name.');
  }
  const filePath = path.join(PREFABS_DIR, `${name}.json`);
  const raw = await fs.readFile(filePath, 'utf-8');
  return JSON.parse(raw);
});

ipcMain.handle('prefabs:export', async (_event, name: string, data: unknown) => {
  const result = await dialog.showSaveDialog({
    title: 'Export Prefab',
    defaultPath: `${name}.json`,
    filters: [{ name: 'BlockForge Prefab', extensions: ['json'] }]
  });
  if (result.canceled || !result.filePath) return null;
  await fs.writeFile(result.filePath, JSON.stringify(data, null, 2), 'utf-8');
  return result.filePath;
});
