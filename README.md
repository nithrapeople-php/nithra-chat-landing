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
cp .env.example .env
npm install
npm run dev
```

## Netlify

1. Push this repo to GitHub/GitLab.
2. New Netlify site → import repo.
3. Build: `npm run build`, publish: `dist` (also in `netlify.toml`).
4. Set env vars: `VITE_FRAPPE_API_URL`, `VITE_TENANT_BASE_DOMAIN`.

## Frappe API (central site — `nithra_saas` app)

Whitelisted methods (Phase 3):

- `nithra_saas.api.signup.create_tenant`
- `nithra_saas.api.signup.get_status`
- `nithra_saas.api.signup.resolve_workspace`

On the central site, set `allow_cors` in `site_config.json` to your landing origin(s), e.g.:

```json
{
  "allow_cors": ["https://yoursite.netlify.app", "http://localhost:5173"]
}
```

Without a real `VITE_FRAPPE_API_URL`, signup runs in **demo mode**.

## Rename the brand

Edit `src/config.ts` (`brand.name`, `tagline`).
