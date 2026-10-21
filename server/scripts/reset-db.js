// CLI utility: reset the JSON database to fresh seed data.
// Demonstrates process.argv, process.exit and the fs/path modules.
//
//   npm run seed                 -> reset (asks nothing, prints a summary)
//   node scripts/reset-db.js --dry-run   -> show what would be written
const fs = require('fs/promises');
const path = require('path');
const config = require('../src/config');
const store = require('../src/db/store');
const { buildSeedData } = require('../src/db/seed');

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');

async function main() {
  if (dryRun) {
    const seed = buildSeedData();
    const counts = Object.entries(seed)
      .filter(([, value]) => Array.isArray(value))
      .map(([key, value]) => `${key}: ${value.length}`);
    console.log(`Dry run — would write to ${path.relative(process.cwd(), config.dbFile)}`);
    console.log(counts.join('\n'));
    return;
  }

  await store.init({ reset: true });
  const { size } = await fs.stat(config.dbFile);
  console.log(`Database reset with seed data → ${config.dbFile} (${(size / 1024).toFixed(1)} KB)`);
}

main().catch((err) => {
  console.error('Reset failed:', err.message);
  process.exit(1);
});
