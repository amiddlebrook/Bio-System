# Bio-System — Cloudflare-native research workspace

Bio-System is a responsive biological specimen and observation registry. The rebuilt UI replaces the original nonfunctional mock telemetry with real CRUD operations, observations, charts and CSV exports.

**Live app:** https://bio-system.averymiddlebrook2014.workers.dev

## Features
- Cloudflare Workers hosts the frontend and API on the same origin
- Cloudflare D1 stores specimens and observations
- Specimen search, classification, status updates, deletion and CSV export
- Timestamped temperature, humidity, growth, pH and note observations
- Charts and KPIs derived from real saved records
- Secure random, per-workspace **recovery keys** generated in the browser; no login or additional API access secret required
- Private, independent record sets scoped to SHA-256 hashes of workspace keys
- Automatic, idempotent D1 provisioning and schema migrations with Wrangler
- GitHub Actions CI/CD: tests on pull requests, deploy on pushes to master
- Fully functional local demo mode when Cloudflare is unavailable

## $0 installation / deployment

Requires a free Cloudflare Workers + D1 account and GitHub Actions. Free tiers have usage caps; no paid subscriptions or per-request model API are required.

Repository secrets under Settings > Secrets and variables > Actions:

- `CLOUDFLARE_ACCOUNT_ID`
- `CLOUDFLARE_API_TOKEN`: a scoped token with Workers Scripts edit and D1 edit rights

**That's all.** Pushing to master automatically:
1. Installs dependencies and runs the TypeScript check, Worker API tests and Vite build.
2. Uses `wrangler d1 list --json` to discover a database named `bio-system`, creating it with `wrangler d1 create bio-system` when absent.
3. Injects its UUID into an ignored generated config, never requiring a `D1_DATABASE_ID` secret.
4. Applies `migrations/` to the remote D1.
5. Deploys the Worker and static UI to the workers.dev subdomain.

The workflow is idempotent: subsequent deployments reuse the database and preserve records.

## Private workspace keys

On first visit, the browser generates a random 256-bit key using `crypto.getRandomValues`. It is stored in localStorage and sent as a bearer token to your Cloudflare Worker over HTTPS. The Worker hashes the key with SHA-256 and uses the hash to isolate that workspace's records in D1.

In Settings, click **Copy private recovery key** and store it somewhere safe. To open the same records from a different browser/device, paste that key into **Restore another workspace**. If you lose the key and clear browser storage, you cannot regain access to the workspace; there is no central user account or password reset. Keep the key private. Anyone with it can read, edit and delete the associated workspace records. Do not use this app for patient information or other sensitive regulated data.

This capability-key model eliminates the additional `BIO_SYSTEM_ACCESS_TOKEN` setup required by the previous revision. Because the public Worker permits creating isolated workspaces without registration, free-tier D1 usage may be depleted by abuse; this is an availability risk, not an unlimited-cost service. Per-workspace record caps and API payload limits help but are not global rate limits.

## Development

Requires Node.js 22+.

```bash
npm ci
npm run dev
```

Open http://localhost:3000 for demo mode. To test the Worker and D1 locally, run:

```bash
npx wrangler@4.45.0 d1 migrations apply DB --local
npx wrangler@4.45.0 dev
```

Vite proxies `/api` calls to the local Worker on port 8787. Run checks:

```bash
npx tsc --noEmit
node --test tests/*.test.mjs
npm run build
```

The committed `wrangler.jsonc` has a placeholder D1 UUID for local use; production uses a generated `wrangler.deploy.json` which is ignored by git.

## Architecture and limitations

- `App.tsx`, `styles.css`: React interface
- `worker/index.js`: capability-token-authenticated API
- `migrations/0001_initial.sql`: baseline database schema
- `migrations/0002_workspace_scoping.sql`: scoped workspace data
- `scripts/prepare-config.mjs`: idempotent Wrangler D1 provisioning
- `.github/workflows/deploy.yml`: one-push deployment
- `.github/workflows/ci.yml`: tests and build on PRs

This is a small research operations app, not a live sensor platform or a clinical health records system. Deployed storage is on Cloudflare's free tier with daily and total resource limits.
