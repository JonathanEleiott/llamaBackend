import { readFile } from 'node:fs/promises';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { query } from './database.js';

const run = promisify(execFile);

// Auto-init for deploys: apply the (idempotent) schema every boot, then seed
// ONLY when the database is empty. seed.js does DELETE-then-INSERT on every
// table, so re-running it on a populated DB would wipe live data — the
// COUNT(users) guard is what makes this safe to run on every deploy.
export async function initDb() {
  const schema = await readFile(new URL('./schema.sql', import.meta.url), 'utf8');
  await query(schema);
  console.log('DB init: schema applied (idempotent).');

  // Gauge "already seeded" by products, not users: schema used to insert a
  // placeholder admin, so a users-based check would never trigger. seed.js
  // clears all tables (incl. that stale admin) before inserting real data.
  const { rows } = await query('SELECT COUNT(*)::int AS n FROM products');
  if (rows[0].n > 0) {
    console.log(`DB init: ${rows[0].n} products present — skipping seed.`);
    return;
  }

  console.log('DB init: database empty — seeding...');
  // ponytail: spawn seed.js as-is instead of importing — it self-runs on load
  // and manages its own pool/exit. Reuse over rewrite.
  const seedPath = new URL('./seed.js', import.meta.url).pathname;
  const { stdout } = await run(process.execPath, [seedPath], { env: process.env });
  if (stdout) console.log(stdout.trim());
  console.log('DB init: seed complete.');
}
