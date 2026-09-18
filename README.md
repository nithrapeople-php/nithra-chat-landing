# Nithra Chat marketing site (Netlify)

Vite + React landing for Frappe multi-tenant signup.

## Pages

| Route | Page |
|-------|------|
| `/` | Home / landing |
| `/features` | Features |
| `/pricing` | Pricing |
| `/signup` | Sign up → creates Frappe site (API) |
| `/signin` | Go to workspace |
| `/provisioning` | Thank you / site status |
| `/contact` | Contact |
| `/privacy` | Privacy Policy |
| `/terms` | Terms of Service |

## Local

```bash
cp .env.example .env.local
# .env.local is gitignored — use raven.local for local Frappe
npm install
npm run dev
```

Open http://localhost:5173 — signup hits `http://raven.local:8000/api/method/nithra_saas.api.signup.*`.

## Env: local vs server (yes, manage separately)

Same variable **names**, different **values**:

| Variable | Local | Production (Netlify) |
|----------|--------|----------------------|
| `VITE_FRAPPE_API_URL` | `http://raven.local:8000` | `https://saas.nithrateams.com` (your central site) |
| `VITE_TENANT_BASE_DOMAIN` | `nithrateams.com` | `nithrateams.com` |

- **Local:** `.env.local` (not committed)
- **Server:** Netlify → Site settings → Environment variables → set both, then redeploy  
- Vite bakes these in at **build** time — changing Netlify env requires a new deploy

## Netlify

1. Push this repo to GitHub/GitLab.
2. New Netlify site → import repo.
3. Build: `npm run build`, publish: `dist` (also in `netlify.toml`).
4. Set env vars: `VITE_FRAPPE_API_URL`, `VITE_TENANT_BASE_DOMAIN`.

## Frappe API (central site — `nithra_saas` app)

Whitelisted methods:

- `nithra_saas.api.signup.create_tenant`
- `nithra_saas.api.signup.get_status`
- `nithra_saas.api.signup.resolve_workspace`
- `nithra_saas.api.auth.login` / `logout` / `me`
- `nithra_saas.api.auth.get_app_handoff` — SSO Open Chat/CRM (not `/raven/login`)

On the central site, set `allow_cors` in `site_config.json` to your landing origin(s), e.g.:

```json
{
  "allow_cors": ["https://yoursite.netlify.app", "http://localhost:5173"]
}
```

Also set Desk → Nithra SaaS Settings → **Central Public URL** and **Portal Login URL**. Tenant sites need the `nithra_tenant_auth` app.

Without a real `VITE_FRAPPE_API_URL`, signup runs in **demo mode**.

## Rename the brand

Edit `src/config.ts` (`brand.name`, `tagline`).
