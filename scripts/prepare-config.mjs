import { readFileSync, writeFileSync } from 'node:fs';
const id = process.env.D1_DATABASE_ID || '';
if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id) || /^0+$/.test(id.replace(/-/g, ''))) throw Error('Set a valid D1_DATABASE_ID GitHub Actions secret');
const config = JSON.parse(readFileSync('wrangler.jsonc', 'utf8'));
config.d1_databases[0].database_id = id;
writeFileSync('wrangler.deploy.json', JSON.stringify(config, null, 2) + '\n');
console.log('Cloudflare D1 binding prepared.');
