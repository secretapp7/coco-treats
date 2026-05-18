# Coco Treats backend roadmap

## Current phase

**Phase 4A — Admin products & categories management (completed)**

- **Routes:** `/admin/products`, `/admin/products/new`, `/admin/products/[id]`, `/admin/categories`, `/admin/categories/new`, `/admin/categories/[id]`.
- **Data:** Lists and forms read/write real `Product`, `ProductSize`, `ProductImage`, and `Category` records via Prisma.
- **Server actions:** `createProduct`, `updateProduct`, size and image CRUD, `createCategory`, `updateCategory` — all gated with `requireAdmin()`, Zod validation, `revalidatePath` for `/admin` and relevant admin URLs, friendly errors (including duplicate slug), no client-facing stack traces.
- **Images:** Admin stores image **URL/path strings** (for example `/images/products/tiramisu/main.jpg`). There is no file upload or cloud storage in this phase.
- **Public storefront:** The customer menu and ordering flow **still use static** catalog data (`data/products.ts`, etc.). Syncing the live site to database products is a **later phase**; this phase only delivers the admin catalog UI.

**Phase 3 — Admin login, dashboard shell, order management (completed)**

- **Authentication:** bcrypt (`bcryptjs`) password check against `ADMIN_PASSWORD_HASH`; HTTP-only cookie with HS256 JWT signed by `ADMIN_SESSION_SECRET` (library: `jose`). Same email must match `ADMIN_EMAIL`.
- **Protection:** `middleware.ts` gates `/admin/*` except `/admin/login`. Dashboard routes also call `requireAdmin()` in the admin shell layout.
- **Routes live:** `/admin/login`, `/admin` (metrics + recent orders), `/admin/orders` (filters, search, pagination), `/admin/orders/[id]` (detail, status/fee updates, cancel, WhatsApp/maps/copy).
- **Admin nav:** Dashboard, Orders, **Categories**, and **Products** are enabled; Offers, Expenses, Reviews, and Settings remain placeholders (“soon”) until later phases.
- **Customer storefront** unchanged; no payment gateway or customer accounts.

**Phase 2 — Persist customer orders before WhatsApp (completed)**

- See “Order flow” below.

**Phase 1 — Database foundation (done)**

- PostgreSQL + Prisma, `lib/db/prisma.ts`, seed script.

---

## Admin environment variables

Set in `.env.local` (local) and in **Vercel → Project → Settings → Environment Variables** for Production (and Preview if needed):

| Variable | Purpose |
|----------|---------|
| `ADMIN_EMAIL` | Allowed login email (compared case-insensitively). |
| `ADMIN_PASSWORD_HASH` | bcrypt hash of the admin password (never the plain password). |
| `ADMIN_SESSION_SECRET` | Secret for signing the session JWT — **at least 32 characters** (e.g. `openssl rand -hex 32`). |

**Generate `ADMIN_PASSWORD_HASH` (run locally, after `npm install`):**

```bash
node -e "const b=require('bcryptjs'); console.log(b.hashSync('YOUR_STRONG_PASSWORD', 12));"
```

Copy the printed string into `ADMIN_PASSWORD_HASH` (one line, no quotes in `.env` unless the value itself needs escaping).

**Generate `ADMIN_SESSION_SECRET`:**

```bash
openssl rand -hex 32
```

Do **not** commit real secrets. Keep `.env.example` as placeholders only.

---

## How to test admin locally

1. Set `DATABASE_URL`, `ADMIN_EMAIL`, `ADMIN_PASSWORD_HASH`, `ADMIN_SESSION_SECRET` in `.env.local`.
2. `npm run dev`
3. Open `http://localhost:3000/admin` — you should redirect to `/admin/login`.
4. Sign in with the email and **plain** password matching your hash.
5. Use **Dashboard** and **Orders**; open an order, change statuses or delivery fee, verify updates in `npm run prisma:studio` or by reloading the list.
6. Use **Categories** and **Products** to create and edit records; confirm changes in Prisma Studio. **Do not** expect the public `/menu` to change until a future storefront sync phase.

**Logout** clears the session cookie via server action.

---

## Database setup (unchanged)

1. Neon PostgreSQL + `DATABASE_URL` with `sslmode=require`.
2. `npm run prisma:generate` → `npm run prisma:push` → `npm run prisma:seed` when needed.

---

## Order flow (customer)

1. Customer submits the order form (EN/AR).
2. **`createOrderAction`** validates and saves to Neon (`Customer`, `Order`, `OrderItem`), then returns a WhatsApp URL.
3. Client opens WhatsApp; optional fallback if save fails.

---

## Next (not implemented)

- Admin CRUD for offers, expenses, reviews, settings (nav placeholders only).
- Optional: migrate from `middleware` to Next.js “proxy” if/when required by your Next version.
- Storefront: load catalog from database (replace static `data/products.ts`), after Phase 4A stabilization.
- Payments, customer login, `prisma migrate` hardening for production.
