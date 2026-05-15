// Generates monochrome app icons (two overlapping circles on white).
// No deps — writes PNG bytes manually.
// Run: node scripts/generate-icons.js
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

function crc32(buf) {
  const table = [];
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c >>> 0;
  }
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) crc = (crc >>> 8) ^ table[(crc ^ buf[i]) & 0xff];
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, 'ascii');
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([len, typeBuf, data, crc]);
}

function makePng(size) {
  const cx1 = size * 0.40, cy1 = size * 0.50;
  const cx2 = size * 0.60, cy2 = size * 0.50;
  const r = size * 0.155;
  const stroke = size * 0.036;
  const corner = size * 0.22;

  // Background is white; foreground draws on top.
  const bg = [255, 255, 255];
  const fg = [29, 29, 31];

  function isOnRoundedRect(x, y) {
    // Inside rounded rect: corner radius `corner`
    const r2 = corner;
    if (x >= r2 && x <= size - r2) return y >= 0 && y <= size;
    if (y >= r2 && y <= size - r2) return x >= 0 && x <= size;
    const corners = [
      [r2, r2], [size - r2, r2], [r2, size - r2], [size - r2, size - r2],
    ];
    return corners.some(([cx, cy]) => (x - cx) ** 2 + (y - cy) ** 2 <= r2 * r2);
  }

  const raw = Buffer.alloc(size * (size * 4 + 1));
  let off = 0;
  for (let y = 0; y < size; y++) {
    raw[off++] = 0;
    for (let x = 0; x < size; x++) {
      if (!isOnRoundedRect(x, y)) {
        // transparent outside rounded mask
        raw[off++] = 0; raw[off++] = 0; raw[off++] = 0; raw[off++] = 0;
        continue;
      }
      let color = bg;
      const d1 = Math.hypot(x - cx1, y - cy1);
      const d2 = Math.hypot(x - cx2, y - cy2);
      if (d1 <= r) {
        color = fg; // filled circle (left)
      } else if (Math.abs(d2 - r) <= stroke / 2) {
        color = fg; // outlined circle (right)
      }
      raw[off++] = color[0]; raw[off++] = color[1]; raw[off++] = color[2]; raw[off++] = 255;
    }
  }

  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; ihdr[9] = 6; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;
  const idat = zlib.deflateSync(raw);
  return Buffer.concat([
    sig,
    chunk('IHDR', ihdr),
    chunk('IDAT', idat),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

const pub = path.join(__dirname, '..', 'public');
fs.writeFileSync(path.join(pub, 'icon-192.png'), makePng(192));
fs.writeFileSync(path.join(pub, 'icon-512.png'), makePng(512));
console.log('Wrote icon-192.png, icon-512.png');
