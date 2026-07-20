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

- `/` — public visitor self-registration landing page; any staff session on that device is cleared
- `/login` — staff login, linked from the Self-Service landing page
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
npm run build
```
