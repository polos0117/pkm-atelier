/* prompt-spec.js is authoritative. Keep the lightweight registry for the
   gallery and Python image tools generated from the prompt's actual choices.
   node tools/sync-styles.cjs --check   (default; read-only)
   node tools/sync-styles.cjs --write */
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');

const ROOT = path.resolve(__dirname, '..');
function registry() {
  const ctx = { window: {} };
  vm.createContext(ctx);
  vm.runInContext(fs.readFileSync(path.join(ROOT, 'lib/prompt-spec.js'), 'utf8'), ctx);
  const S = ctx.window.AtelierSpec;
  const styles = Array.from(S.ART_STYLES, ([key, name]) => ({ key, name }));
  assert.equal(new Set(styles.map(s => s.key)).size, styles.length, 'Duplicate style key');
  for (const { key, name } of styles) {
    assert(/^[a-z][a-z0-9_]*$/.test(key) && name, 'Invalid style row: ' + key);
    for (const part of ['core', 'anthro', 'lifestyle'])
      assert(typeof S.STYLE_PROFILES[key]?.[part] === 'string' && S.STYLE_PROFILES[key][part],
        'Missing prompt profile: ' + key + '/' + part);
  }
  assert(styles.some(s => s.key === S.DEFAULT_STYLE), 'Default style is not selectable');
  return {
    version: 1,
    note: 'Generated from lib/prompt-spec.js ART_STYLES. Do not edit separately. Run node tools/sync-styles.cjs --write after changing prompt styles. Keys are shared by prompts, gallery, image registration and filenames.',
    styles,
  };
}

function main() {
  const args = process.argv.slice(2);
  assert(args.length <= 1 && (!args.length || ['--check', '--write'].includes(args[0])),
    'Usage: node tools/sync-styles.cjs [--check|--write]');
  const file = path.join(ROOT, 'data/style.json');
  const expected = registry();
  if (args[0] === '--write') fs.writeFileSync(file, JSON.stringify(expected, null, 2) + '\n');
  else assert.deepEqual(JSON.parse(fs.readFileSync(file, 'utf8')), expected,
    'Style registry drift: run node tools/sync-styles.cjs --write');
  console.log('PASS: ' + expected.styles.length + ' prompt styles synchronized');
}
if (require.main === module) main();
module.exports = { registry };
