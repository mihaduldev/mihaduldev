# Deployment — Cloudflare Workers + D1

The site runs on Cloudflare via the `@opennextjs/cloudflare` adapter, with content
stored in a **Cloudflare D1** database and a password-protected admin panel.

## 1. Local development

```bash
npm install
npm run db:migrate:local      # creates + seeds the local D1 (.wrangler/state)
cp .dev.vars.example .dev.vars # then edit values (ADMIN_PASSWORD, AUTH_SECRET)
npm run dev                    # http://localhost:3000  (D1 wired automatically)
```

- Admin: visit `/admin` → enter the password from `.dev.vars` (`ADMIN_PASSWORD`).
- `AUTH_SECRET` signs the session cookie — generate one with
  `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`.
- If D1 is ever unreachable, the public site gracefully falls back to built-in
  seed content, so it never breaks.

## 2. One-time Cloudflare setup

```bash
npx wrangler login

# Create the production D1 database, then paste the printed database_id
# into wrangler.jsonc -> d1_databases[0].database_id (replacing the placeholder).
npx wrangler d1 create mihaduldev-db

# Apply schema + seed to the REMOTE database
npm run db:migrate            # = wrangler d1 migrations apply DB --remote

# Set production secrets (entered securely, never committed)
npx wrangler secret put ADMIN_PASSWORD
npx wrangler secret put AUTH_SECRET
```

### Visitor analytics (Cloudflare Web Analytics)
Cloudflare dashboard → **Analytics → Web Analytics** → add your site → copy the
**beacon token**. Put it in `wrangler.jsonc` → `vars.NEXT_PUBLIC_CF_BEACON` (and in
`.dev.vars` for local). The beacon then loads automatically and the report appears
in that Cloudflare dashboard (linked from the admin **Analytics** page).

## 3. Deploy

```bash
npm run deploy                # builds the worker and deploys to Cloudflare
```

Use `npm run preview` to run the production worker locally before deploying.

## 4. After deploy
- Public site is fully server-rendered from D1, cached (ISR ~1h), revalidated
  instantly when you edit content in the admin.
- `/admin` is `noindex` and excluded in `robots.txt`; `/sitemap.xml` lists all
  published posts from D1.
- Manage everything at `/admin`: **Experience, Projects, Skills, Blog** (Markdown,
  draft/publish), read **Contacts**, and open **Analytics**.

## Notes
- Schema/seed live in `migrations/`. Add new tables/changes as `migrations/000N_*.sql`
  and run the migrate commands again.
- Content data layer: `src/server/db/*`. Auth: `src/server/auth.ts`.
- To change the admin password later: `npx wrangler secret put ADMIN_PASSWORD`.
