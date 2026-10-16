import { readFileSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

function wrangler(...args) {
  return execFileSync('npx', ['--yes', 'wrangler@4.45.0', ...args], {
    encoding: 'utf8', env: process.env, maxBuffer: 1024 * 1024 * 10
  });
}
function databases() {
  const result = JSON.parse(wrangler('d1', 'list', '--json'));
  return Array.isArray(result) ? result : Array.isArray(result.result) ? result.result :
    Array.isArray(result.databases) ? result.databases : [];
}
if (!process.env.CLOUDFLARE_API_TOKEN || !process.env.CLOUDFLARE_ACCOUNT_ID) {
  throw new Error('Configure CLOUDFLARE_API_TOKEN and CLOUDFLARE_ACCOUNT_ID as repository secrets.');
}
let entry = databases().find(item => item.name === 'bio-system');
if (!entry) {
  console.log('Creating free-tier D1 database bio-system with Wrangler...');
  wrangler('d1', 'create', 'bio-system');
  entry = databases().find(item => item.name === 'bio-system');
}
const id = entry?.uuid || entry?.id;
if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id || '')) {
  throw new Error('Wrangler did not return a valid D1 database UUID.');
}
const config = JSON.parse(readFileSync('wrangler.jsonc', 'utf8'));
config.d1_databases[0].database_id = id;
writeFileSync('wrangler.deploy.json', JSON.stringify(config, null, 2) + '\n');
console.log('Cloudflare D1 database ready. Deployment configuration generated.');
