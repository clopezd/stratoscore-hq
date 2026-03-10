/**
 * Patch next/dist/compiled/cookie to remove bare __dirname usage.
 *
 * next/dist/compiled/cookie is ncc-compiled and contains:
 *   if(typeof __nccwpck_require__!=="undefined")__nccwpck_require__.ab=__dirname+"/";
 *
 * Turbopack replaces __dirname in local builds but not in Vercel's edge
 * build environment, causing: ReferenceError: __dirname is not defined
 *
 * This postinstall script replaces __dirname with "/" so the ncc wrapper
 * works safely in Edge Runtime on Vercel.
 */

const fs = require('fs')
const path = require('path')

const target = path.join(__dirname, '../node_modules/next/dist/compiled/cookie/index.js')

if (!fs.existsSync(target)) {
  console.log('patch-edge-compat: cookie not found, skipping')
  process.exit(0)
}

const original = fs.readFileSync(target, 'utf8')

const PATTERN = '__nccwpck_require__.ab=__dirname+"/"'
const REPLACEMENT = '__nccwpck_require__.ab="/"'

if (!original.includes(PATTERN)) {
  if (original.includes(REPLACEMENT)) {
    console.log('patch-edge-compat: already patched, skipping')
  } else {
    console.warn('patch-edge-compat: pattern not found, may need update')
  }
  process.exit(0)
}

const patched = original.replace(PATTERN, REPLACEMENT)
fs.writeFileSync(target, patched, 'utf8')
console.log('patch-edge-compat: patched next/dist/compiled/cookie (__dirname → "/")')
