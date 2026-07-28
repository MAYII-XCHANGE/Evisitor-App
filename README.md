# NOVA Visitor Management Frontend

React frontend for the Spring Boot service in `../visitor-management-portal`.

## Local development

1. Start the backend on `http://localhost:8080/api`.
2. Copy `.env.example` to `.env.local` if you need to override the API URL.
3. Install dependencies and start Vite:

```bash
npm install
npm run dev
```

## Session security

Access and refresh tokens are held only in secure `HttpOnly` cookies issued by the backend. They are never returned to JavaScript and are never written to local storage or session storage. The frontend restores the current user through `/auth/me`, includes credentials and CSRF protection on API calls, retries one expired session through the refresh cookie, and returns failed sessions to login.

## Front Desk routes

- `/` — public visitor self-registration landing page and PWA start screen
- `/staff/login` — canonical staff login, linked from the Self-Service landing page
- `/login` — legacy staff-login URL; redirects to `/staff/login`
- `/dashboard` — existing Front Desk dashboard
- `/visitors/register` — six-step walk-in registration and check-in
- `/appointments` — today's searchable visitor appointments
- `/visitors` — paginated visitor directory, filters, CSV export, and details
- `/self-service-registrations` — Front Desk review, approval/check-in, and rejection queue
- `/visitors/check-out` — active visitor checkout

Self-Service submissions remain separate from visitor and visit records until a Front Desk officer approves them. Registration state remains in React Hook Form while navigating steps; sensitive capture data and session credentials are not persisted in browser storage.

## Verification

```bash
npm run lint
npm test
npm run build
```

## Progressive Web App

The portal remains a normal browser application and can optionally be installed as a PWA. The service worker precaches only the frontend application shell and versioned static assets. All `/api` traffic—including authentication, visitor data, files, reports, and mutations—uses the network and is never written to Cache Storage.

Offline users can open the application shell and continue entering an already-open form, but submission and upload controls remain disabled until connectivity returns. Forms and visitor PII are not persisted in local storage, IndexedDB, or the service-worker cache. Application updates are user-confirmed so an unfinished registration is not reloaded unexpectedly.

See [`docs/PWA.md`](docs/PWA.md) for caching, testing, update, and deployment details. An HTTPS same-origin Nginx example is available at [`deploy/nginx.conf.example`](deploy/nginx.conf.example).
