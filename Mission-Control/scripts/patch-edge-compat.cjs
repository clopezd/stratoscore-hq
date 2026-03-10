/**
 * Patch all ncc-compiled packages in next/dist/compiled that use bare __dirname.
 *
 * ncc-compiled packages contain:
 *   if(typeof __nccwpck_require__!=="undefined")__nccwpck_require__.ab=__dirname+"/";
 *
 * Turbopack replaces __dirname in local builds but not in Vercel's edge
 * build environment, causing: ReferenceError: __dirname is not defined
 * → MIDDLEWARE_INVOCATION_FAILED
 *
 * This postinstall script replaces ALL occurrences across next/dist/compiled
 * so the ncc wrapper works safely in Edge Runtime on Vercel.
 */

const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

const PATTERN = '__nccwpck_require__.ab=__dirname+"/"'
const REPLACEMENT = '__nccwpck_require__.ab="/"'
// Some compiled files use __dirname+"/" without the ncc check
const PATTERN2 = '(__dirname+"/")'
const REPLACEMENT2 = '("/")'

const compiledDir = path.join(__dirname, '../node_modules/next/dist/compiled')

if (!fs.existsSync(compiledDir)) {
  console.log('patch-edge-compat: next/dist/compiled not found, skipping')
  process.exit(0)
}

let patchedCount = 0

function patchFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8')
    let modified = content

    if (modified.includes(PATTERN)) {
      modified = modified.split(PATTERN).join(REPLACEMENT)
    }

    if (modified !== content) {
      fs.writeFileSync(filePath, modified, 'utf8')
      patchedCount++
      console.log(`patch-edge-compat: patched ${path.relative(compiledDir, filePath)}`)
    }
  } catch (e) {
    // Skip files we can't read/write
  }
}

function walkDir(dir) {
  let entries
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true })
  } catch {
    return
  }
  for (const entry of entries) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      walkDir(full)
    } else if (entry.isFile() && entry.name.endsWith('.js')) {
      patchFile(full)
    }
  }
}

walkDir(compiledDir)

if (patchedCount > 0) {
  console.log(`patch-edge-compat: patched ${patchedCount} file(s) — __dirname → "/" in ncc wrappers`)
} else {
  console.log('patch-edge-compat: no files needed patching (already clean or pattern changed)')
}
