// Fails when manifest.json or any _locales/*/messages.json is invalid JSON,
// or when a locale's keys differ from the default (en) locale.
import { readFileSync, readdirSync } from 'node:fs';

const readJson = (file) => JSON.parse(readFileSync(file, 'utf8'));

readJson('manifest.json');
const baseKeys = Object.keys(readJson('_locales/en/messages.json')).sort();
let failed = false;

const langs = readdirSync('_locales', { withFileTypes: true })
  .filter((d) => d.isDirectory())
  .map((d) => d.name);

for (const lang of langs) {
  const keys = Object.keys(readJson(`_locales/${lang}/messages.json`));
  const missing = baseKeys.filter((k) => !keys.includes(k));
  const extra = keys.filter((k) => !baseKeys.includes(k));
  if (missing.length || extra.length) {
    failed = true;
    console.error(`❌ ${lang}: missing [${missing}] extra [${extra}]`);
  }
}

if (failed) process.exit(1);
console.log(`✅ Locales in sync (${baseKeys.length} keys)`);
