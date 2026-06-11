# Bloomify

Bloomify is a Next.js App Router storefront prototype for campus gifting, with customer pages, checkout and tracking flows, local mock persistence, and an admin dashboard.

## Project Structure

- `app/` - Next.js routes and application code.
- `app/_components/` - shared UI/client helpers used across routes.
- `app/_lib/` - local mock store and browser-only persistence helpers.
- `app/admin/` - admin dashboard routes.
- `app/admin/_components/` - admin-only shared shell/layout pieces.
- `public/` - static product and page imagery used by the app.
- `docs/screenshots/` - reference screenshots captured during UI work.
- `backend-laravel12-contract/` - placeholder backend contract structure kept for future API integration.

## Local Usage

```bash
npm install
npm run dev
```

Admin demo login:

- Username: `admin`
- Password: `admin123`

Customer demo login accepts any non-empty username/email and password through the local mock store.

