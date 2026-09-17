const { app, BrowserWindow, globalShortcut, clipboard, screen, Tray, Menu, nativeImage, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const keys = require('./keys');
const { clean, toBangla } = require('./translate');

const HOTKEY = 'Alt+B';
const WIDTH = 440;
let win, tray, busy = false;

if (!app.requestSingleInstanceLock()) app.quit();

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function grabSelection() {
  const prev = clipboard.readText();
  const marker = `__bl_${Date.now()}`;
  clipboard.writeText(marker);
  await keys.sendCopy();
  let txt = marker;
  for (let i = 0; i < 24 && txt === marker; i++) { await sleep(20); txt = clipboard.readText(); }
  clipboard.writeText(prev);            // don't clobber user's clipboard
  return txt === marker ? '' : txt;
}

function createWindow() {
  win = new BrowserWindow({
    width: WIDTH, height: 160, show: false, frame: false, transparent: true,
    resizable: false, skipTaskbar: true, alwaysOnTop: true, hasShadow: false,
    webPreferences: { preload: path.join(__dirname, 'preload.js'), contextIsolation: true },
  });
  win.setAlwaysOnTop(true, 'pop-up-menu');
  win.loadFile('popup.html');
  win.on('blur', () => win.hide());
}

function placeNearCursor() {
  const p = screen.getCursorScreenPoint();
  const { workArea: wa } = screen.getDisplayNearestPoint(p);
  const [w, h] = win.getSize();
  const x = Math.min(Math.max(p.x - w / 2, wa.x + 8), wa.x + wa.width - w - 8);
  const y = p.y + 18 + h > wa.y + wa.height ? p.y - h - 12 : p.y + 18;
  win.setPosition(Math.round(x), Math.round(y));
}

async function trigger() {
  if (busy) return;
  busy = true;
  try {
    if (win.isVisible()) win.hide();
    const text = clean(await grabSelection());
    placeNearCursor();
    if (!text) {
      win.webContents.send('update', { state: 'empty' });
      win.show();
      return;
    }
    win.webContents.send('update', { state: 'loading', text });
    win.show();
    try {
      const bn = await toBangla(text);
      win.webContents.send('update', { state: 'done', text, bn });
    } catch (e) {
      win.webContents.send('update', { state: 'error', text, msg: 'Translation failed. Check your internet connection and try again.' });
    }
  } finally { busy = false; }
}

function trayIcon() {
  const logo = nativeImage.createFromPath(path.join(__dirname, 'tray.png'));
  if (!logo.isEmpty()) return logo.resize({ width: 16, height: 16 });
  const s = 16, buf = Buffer.alloc(s * s * 4);
  for (let y = 0; y < s; y++) for (let x = 0; x < s; x++) {
    const i = (y * s + x) * 4, edge = x < 1 || y < 1 || x > 14 || y > 14;
    buf[i] = edge ? 0 : 74; buf[i + 1] = edge ? 0 : 106; buf[i + 2] = edge ? 0 : 0; buf[i + 3] = edge ? 0 : 255; // BGRA: dark green
  }
  return nativeImage.createFromBitmap(buf, { width: s, height: s });
}

// Portable builds run from a temp dir, so point the registry entry at the real .exe.
const exePath = () => process.env.PORTABLE_EXECUTABLE_FILE || process.execPath;
const autoStartOn = () => app.getLoginItemSettings({ path: exePath() }).openAtLogin;
const setAutoStart = (on) =>
  app.setLoginItemSettings({ openAtLogin: on, path: exePath(), args: [] });

// On first run, opt in for the user. After that their tray choice sticks.
function initAutoStart() {
  if (!app.isPackaged) return;
  const flag = path.join(app.getPath('userData'), '.autostart-set');
  if (fs.existsSync(flag)) return;
  setAutoStart(true);
  try { fs.writeFileSync(flag, '1'); } catch {}
}

function buildTray() {
  tray = new Tray(trayIcon());
  tray.setToolTip(`BanglaLens — select text, press ${HOTKEY}`);
  const menu = () => Menu.buildFromTemplate([
    { label: `Translate selection (${HOTKEY})`, click: trigger },
    { type: 'separator' },
    {
      label: 'Start with Windows', type: 'checkbox',
      checked: autoStartOn(),
      click: (m) => setAutoStart(m.checked),
    },
    { label: 'Quit', click: () => app.quit() },
  ]);
  tray.setContextMenu(menu());
}

ipcMain.on('resize', (_e, h) => { win.setSize(WIDTH, Math.min(Math.ceil(h), 520)); placeNearCursorIfOffscreen(); });
ipcMain.on('copy', (_e, t) => clipboard.writeText(t));
ipcMain.on('hide', () => win.hide());

function placeNearCursorIfOffscreen() {
  const [x, y] = win.getPosition(), [, h] = win.getSize();
  const { workArea: wa } = screen.getDisplayNearestPoint({ x, y });
  if (y + h > wa.y + wa.height) win.setPosition(x, wa.y + wa.height - h - 8);
}

app.whenReady().then(() => {
  keys.start();
  initAutoStart();
  createWindow();
  buildTray();
  if (!globalShortcut.register(HOTKEY, trigger)) console.error(`Hotkey ${HOTKEY} is taken`);
});

app.on('window-all-closed', (e) => e.preventDefault());
app.on('will-quit', () => { globalShortcut.unregisterAll(); keys.stop(); });
