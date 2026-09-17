// Persistent PowerShell worker: releases held hotkey modifiers, then injects Ctrl+C.
// Kept warm so each copy is ~10ms instead of ~400ms PowerShell cold start.
const { spawn } = require('child_process');

const PS = `
Add-Type @"
using System; using System.Runtime.InteropServices;
public class K { [DllImport("user32.dll")] public static extern void keybd_event(byte v, byte s, uint f, UIntPtr e); }
"@
function Up($v){ [K]::keybd_event($v,0,2,[UIntPtr]::Zero) }
function Dn($v){ [K]::keybd_event($v,0,0,[UIntPtr]::Zero) }
[Console]::Out.WriteLine('ready'); [Console]::Out.Flush()
while ($true) {
  $l = [Console]::In.ReadLine()
  if ($l -eq $null) { break }
  if ($l -eq 'copy') {
    foreach ($k in 0x10,0x11,0x12,0x5B,0x5C) { Up $k }
    Dn 0x11; Dn 0x43; Up 0x43; Up 0x11
    [Console]::Out.WriteLine('ok'); [Console]::Out.Flush()
  }
}
`;

let proc = null;
let waiters = [];

function start() {
  if (process.platform !== 'win32' || proc) return;
  const encoded = Buffer.from(PS, 'utf16le').toString('base64');
  proc = spawn('powershell.exe',
    ['-NoProfile', '-NonInteractive', '-ExecutionPolicy', 'Bypass', '-EncodedCommand', encoded],
    { windowsHide: true });
  proc.stdout.on('data', (d) => {
    if (d.toString().includes('ok')) waiters.splice(0).forEach((r) => r());
  });
  proc.on('exit', () => { proc = null; });
}

function sendCopy(timeout = 600) {
  if (process.platform !== 'win32') return Promise.resolve();
  if (!proc) start();
  return new Promise((resolve) => {
    const t = setTimeout(resolve, timeout);
    waiters.push(() => { clearTimeout(t); resolve(); });
    proc.stdin.write('copy\n');
  });
}

function stop() { proc?.kill(); }

module.exports = { start, sendCopy, stop };
