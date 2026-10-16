# Bio-System

## Biological research operations, rebuilt for Cloudflare

Bio-System is a responsive specimen registry, observation log, and research analytics workspace. The previous version was a Vite visual mockup with invented metrics, fixed desktop navigation, and GitHub Pages deployment. This version introduces persistent Cloudflare D1 storage, a protected Worker API, and a complete interface for managing actual research records.

### What works

- Create, search, filter, reclassify, and delete specimens
- Record or delete timestamped observations (temperature, humidity, pH, growth, notes)
- Derived metrics and charts that recalculate from records
- Export specimens and observations to CSV, with spreadsheet-formula injection protection
- Desktop and mobile UI; responsive sidebar, forms, tables and charts
- Clearly marked demo mode, persistent locally in browser storage
- Same-origin Cloudflare Worker API with bearer token authentication
- D1 SQL schema, migrations, and regression smoke tests
- GitHub Actions quality checks on PRs and deployment from master

No fake live sensor readings are presented as real data. Example data only appears in clearly labeled demo mode.

## 100% free infrastructure

React 19, Vite 6, and vanilla CSS compile to static assets served by Cloudflare Workers. The Worker serves authenticated API endpoints. Cloudflare D1 stores the application state, and GitHub Actions builds, tests, migrates, and deploys. No paid third-party API, hosted server, or subscription is required for usage within the free quotas. Cloudflare free usage limits still apply.

### Running locally

Node 22 or newer is recommended.

1. Install packages: npm ci
2. Start the frontend: npm run dev
3. Open http://localhost:3000 for the fully functional local demo.
4. Optional: For local D1 API development, run npx wrangler@4.45.0 d1 migrations apply DB --local and npx wrangler@4.45.0 dev. Vite proxies API calls to port 8787.
5. For local API authentication, create an ignored .dev.vars file containing APP_ACCESS_TOKEN=your_private_random_token.
6. Validate: npx tsc --noEmit; node --test tests/*.test.mjs; npm run build.

The zero UUID in versioned wrangler.jsonc is exclusively for local development. Production uses a generated Wrangler config that receives the actual D1 database ID from GitHub Secrets.

### One-time production setup

1. Create a free Cloudflare account with Workers enabled and a free workers.dev subdomain.
2. Create a D1 database named bio-system. Run npx wrangler@4.45.0 d1 create bio-system after logging in with Wrangler, or use the Cloudflare dashboard.
3. Copy the generated D1 database UUID.
4. Create a scoped Cloudflare API token that can edit Workers and D1 resources in your account. Keep it secret.
5. Open repository Settings > Secrets and variables > Actions. Create four repository secrets:

| Secret | Value |
| --- | --- |
| CLOUDFLARE_API_TOKEN | Scoped Cloudflare API deployment token |
| CLOUDFLARE_ACCOUNT_ID | Cloudflare account identifier |
| D1_DATABASE_ID | UUID of the bio-system D1 database |
| BIO_SYSTEM_ACCESS_TOKEN | A new strong random application password/token, preferably 32+ random bytes |

6. Merge the restoration pull request into master or run the Cloudflare production deployment workflow manually. It typechecks, tests, builds, migrates D1, deploys the Worker with assets, and sets APP_ACCESS_TOKEN as a Worker secret.
7. Open the workers.dev deployment URL printed by the workflow. In Workspace settings, enter the BIO_SYSTEM_ACCESS_TOKEN value and connect.

**Security:** Do not store secrets in repository source or Vite variables. The deploy workflow passes the app token as a GitHub Actions secret and writes it to Cloudflare through Wrangler. The browser keeps the access token only in tab-level sessionStorage. The API rejects anonymous requests except its minimal /api/health endpoint. No CORS allowlist is added for other origins.

### Project organization

- App.tsx and styles.css — complete responsive application
- worker/index.js — authenticated API and validations
- migrations/0001_initial.sql — SQL schema and indexes
- wrangler.jsonc — Cloudflare Worker Assets and D1 binding template
- scripts/prepare-config.mjs — injects D1 UUID at deploy time
- tests/api.test.mjs — API security and response smoke tests
- .github/workflows/ci.yml — PR tests
- .github/workflows/deploy.yml — Cloudflare production automation

### Limitations

The Cloudflare account, API token, D1 database, and GitHub Actions secrets must be provisioned by an account administrator before the first real deployment. This repository alone cannot create credentials or prove live production availability.

This is a research-specimen tracking tool, not a medical or health information system. Do not enter patient information or other sensitive personal records. A single shared token is appropriate only for a small trusted environment. For public or multi-user deployments, add Cloudflare Access, individual identities, and appropriate authorization before inviting users.
