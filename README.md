<div align="center">

<img src="build/logo.png" width="128" alt="BanglaLens logo">

# BanglaLens

**Select English text anywhere on Windows, press `Alt+B`, read it in Bangla.**

Works in Edge PDFs, Chrome, Word, Excel, Notepad — anywhere you can select text.

[![Download](https://img.shields.io/github/v/release/bipro-b/bangla-lens-desktop?label=Download&style=for-the-badge&color=00A86B)](https://github.com/bipro-b/bangla-lens-desktop/releases/latest)
[![Downloads](https://img.shields.io/github/downloads/bipro-b/bangla-lens-desktop/total?style=for-the-badge)](https://github.com/bipro-b/bangla-lens-desktop/releases)
[![License](https://img.shields.io/badge/license-MIT-blue?style=for-the-badge)](LICENSE)

</div>

---

## Download

**[⬇ Download BanglaLens for Windows](https://github.com/bipro-b/bangla-lens-desktop/releases/latest)**

| File | Use this if… |
|---|---|
| **BanglaLens-Setup-1.0.0.exe** | You want it installed properly, with a Start Menu shortcut and auto-start. **Recommended.** |
| **BanglaLens-1.0.0-portable.exe** | You'd rather not install anything. Runs from the file itself (slower to start). |

Windows 10 or 11, 64-bit. No account, no setup, no API key.

### "Windows protected your PC"

You will see this warning the first time you run it. BanglaLens is not signed with a
code-signing certificate (those cost a few hundred dollars a year), so Windows shows
this for any small independent app.

Click **More info** → **Run anyway**.

If you'd rather verify the download yourself first, every release includes
`SHA256SUMS.txt`. Check your file against it in PowerShell:

```powershell
Get-FileHash .\BanglaLens-Setup-1.0.0.exe -Algorithm SHA256
```

## How to use

1. **Select** any English text — in a PDF, a web page, an email, a Word document.
2. Press **`Alt+B`**.
3. The Bangla translation appears in a small popup next to your cursor.

Press `Esc` or click anywhere else to close it.

BanglaLens lives in your system tray and starts with Windows, so it's always one
keypress away. Right-click the tray icon to turn auto-start off or to quit.

## Features

- **Works everywhere** — any app you can select text in, including Edge PDF viewer.
- **One keypress** — no copying, pasting, or switching windows.
- **Cleans up PDF text** — joins hyphenated line breaks (`mechan-\nism` → `mechanism`) so
  translations of PDF text actually read properly.
- **Leaves your clipboard alone** — whatever you had copied is still there afterwards.
- **Starts with Windows** — on by default, switch it off from the tray.
- **Falls back automatically** — if one translation service fails, it tries another.

## Privacy

BanglaLens sends **only the text you select** to a translation service — Google Translate,
falling back to MyMemory if that fails — and shows you the result. Nothing else leaves
your computer. There is no account, no analytics, and no telemetry. Translations are
cached in memory while the app runs and are never written to disk.

Because selected text is sent to a third-party service, avoid using it on passwords,
personal identification, or confidential documents.

## Build from source

```bash
git clone https://github.com/bipro-b/bangla-lens-desktop.git
cd bangla-lens-desktop
npm install

npm start          # run in development
npm run dist       # build the portable .exe
npm run dist:setup # build the installer
npm run icon       # regenerate the icon from build/icon.svg
```

Built with [Electron](https://www.electronjs.org/) and packaged with
[electron-builder](https://www.electron.build/). Output lands in `dist/`.

### Changing the hotkey

Edit `HOTKEY` at the top of `main.js` (default `'Alt+B'`), then rebuild.
Any [Electron accelerator](https://www.electronjs.org/docs/latest/api/accelerator) works.

## License

[MIT](LICENSE) © Bipro
