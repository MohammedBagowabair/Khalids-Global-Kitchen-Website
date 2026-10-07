// node scripts/img.mjs -> src-images/*.jpg -> public/images/<name>-<w>.webp  (Unsplash, illustrative only)
import sharp from 'sharp'
import fs from 'node:fs'
const src = 'src-images', out = 'public/images'
fs.rmSync(out, { recursive: true, force: true }); fs.mkdirSync(out, { recursive: true })
// [file, name, crop|null, aspect [w,h]|null, sizes [[w,q]]]
const jobs = [
  ['hero', 'plate', { left: 170, top: 170, width: 1660, height: 1660 }, null, [[560, 44], [880, 46]]],
  ['chicken', 'chicken', null, [4, 5], [[440, 58], [720, 56]]],
  ['fish', 'fish', null, [4, 5], [[440, 58], [720, 56]]],
  ['grill', 'grill', null, [4, 5], [[440, 58], [720, 56]]],
  ['shawarma', 'shawarma', null, [4, 5], [[440, 58], [720, 56]]],
  ['biryani', 'biryani', null, [4, 5], [[440, 58], [720, 56]]],
]
for (const [file, name, crop, aspect, sizes] of jobs) {
  for (const [w, q] of sizes) {
    let s = sharp(`${src}/${file}.jpg`); if (crop) s = s.extract(crop)
    s = aspect ? s.resize({ width: w, height: Math.round((w * aspect[1]) / aspect[0]), fit: 'cover', position: 'centre' }) : s.resize({ width: w })
    await s.webp({ quality: q, effort: 6 }).toFile(`${out}/${name}-${w}.webp`)
  }
}
for (const f of fs.readdirSync(out)) { const m = await sharp(`${out}/${f}`).metadata(); console.log(f, m.width + 'x' + m.height, (fs.statSync(`${out}/${f}`).size / 1024).toFixed(0) + 'KB') }
