# NOVA Visitor Portal PWA

## What changes for users

The deployed portal continues to work as a standard website. Supported browsers may additionally offer an install prompt. An installed copy uses the same frontend, backend, authentication, roles, routes, and visitor workflows as the browser version.

PWA support provides:

- optional installation;
- precaching of the application shell and versioned frontend assets;
- a visible online/offline state;
- a controlled application-update prompt; and
- an offline shell explaining which operations require the backend.

It does not provide offline visitor operations or offline submission queues.

## Cache boundary

The service worker may precache generated frontend files such as HTML, JavaScript, CSS, fonts, icons, and public images. These assets contain application code and branding only.

Every URL whose path begins with `/api` uses Workbox `NetworkOnly` handling for `GET`, `POST`, `PUT`, `PATCH`, and `DELETE`. Consequently, the service worker does not cache:

- login, logout, refresh, CSRF, or current-user responses;
- visitor and appointment information;
- photographs, identification documents, or signatures;
- reports and audit records;
- uploads, email responses, or external API responses; or
- any mutation request or response.

React Query mutations use `networkMode: "always"` so an offline mutation fails immediately instead of being paused and replayed after reconnection. Axios also rejects unsafe offline requests as a second guard.

The application does not persist form values, query data, tokens, or visitor PII to local storage, session storage, IndexedDB, or Cache Storage.

## Offline behavior

When connectivity is lost:

1. A global offline banner is displayed.
2. Existing form state remains in React memory.
3. Users can continue moving through non-network form steps.
4. Submit, upload, approval, check-in, checkout, and other mutation controls are disabled.
5. Network reads show their existing API error state.
6. Controls become available automatically after the browser emits an `online` event.

Closing or refreshing the page clears unsubmitted visitor information because sensitive form data is deliberately not persisted.

## Updates

The service worker uses prompt-based updates. It never forces a refresh while a user is completing a form.

When a new build is ready, the application displays an update notice. If a walk-in or self-service registration is dirty, selecting **Update now** requires explicit confirmation that the unfinished form will be discarded. Selecting **Later** keeps the current version active until a convenient time.

Each production deployment should:

1. Build the frontend with `npm run build`.
2. Publish the entire new `dist` directory atomically.
3. Serve hashed `/assets` files with long-lived immutable caching.
4. Serve `sw.js` and `manifest.webmanifest` with revalidation/no-cache headers.
5. Keep old hashed assets briefly during rolling deployments when instances are not updated atomically.

Workbox removes caches owned by older portal service workers through `cleanupOutdatedCaches`.

## Production URL layout

Use one HTTPS origin when possible:

```text
https://visitors.example.com/       frontend
https://visitors.example.com/api/   Spring Boot backend
```

Build the frontend with:

```bash
VITE_API_BASE_URL=/api npm run build
```

The web server must return `index.html` for frontend navigation routes that do not match a physical file. It must not apply that fallback to `/api`.

See `deploy/nginx.conf.example`.

## Local verification

Service workers require HTTPS, except that browsers allow them on `localhost`.

```bash
npm test
npm run build
npm run preview
```

In browser developer tools:

1. Open **Application → Manifest** and verify all icons.
2. Open **Application → Service Workers** and confirm `sw.js` controls the page.
3. Inspect **Cache Storage** and confirm it contains only static application assets.
4. Confirm no `/api` response appears in Cache Storage.
5. Switch the Network panel to **Offline**.
6. Confirm the offline banner appears and mutation buttons are disabled.
7. Return online and confirm controls are restored without losing the open form.

## Uninstalling or clearing development workers

During local PWA development, old service workers may continue controlling a preview origin. Use **Application → Service Workers → Unregister**, then clear the site data for that local origin. This affects only the selected development origin.
