// Renders build/icon.svg -> build/icon.ico (app) + build/tray.png (tray) + preview.
const sharp = require('sharp');
const pngToIco = require('png-to-ico').default;
const fs = require('fs');
const path = require('path');

const dir = __dirname;
const svg = fs.readFileSync(path.join(dir, 'icon.svg'));
const png = (size) => sharp(svg, { density: 512 }).resize(size, size).png().toBuffer();

(async () => {
  const icoSizes = [16, 24, 32, 48, 64, 128, 256];
  const bufs = await Promise.all(icoSizes.map(png));
  fs.writeFileSync(path.join(dir, 'icon.ico'), await pngToIco(bufs));

  fs.writeFileSync(path.join(dir, 'logo.png'), await png(512));
  for (const s of [16, 32]) fs.writeFileSync(path.join(dir, `preview-${s}.png`), bufs[icoSizes.indexOf(s)]);

  // tray needs a 32px png shipped with the app
  fs.writeFileSync(path.join(dir, '..', 'tray.png'), await png(32));
  console.log('icon.ico + tray.png written');
})();
