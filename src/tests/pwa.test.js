import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";

const source = (relativePath) => readFileSync(new URL(relativePath, import.meta.url), "utf8");

test("PWA manifest is installable and uses prompt-based updates", () => {
  const config = source("../../vite.config.js");
  assert.match(config, /VitePWA/);
  assert.match(config, /registerType:\s*"prompt"/);
  assert.match(config, /name:\s*"NOVA Visitor Management Portal"/);
  assert.match(config, /short_name:\s*"NOVA Visitors"/);
  assert.match(config, /display:\s*"standalone"/);
  assert.match(config, /start_url:\s*"\/"/);
  assert.match(config, /scope:\s*"\/"/);
  assert.match(config, /pwa-192x192\.png/);
  assert.match(config, /pwa-512x512\.png/);
  assert.match(config, /maskable-icon-512x512\.png/);
});

test("service worker caches the application shell but keeps every API method network-only", () => {
  const config = source("../../vite.config.js");
  assert.match(config, /globPatterns/);
  assert.match(config, /navigateFallback:\s*"index\.html"/);
  assert.match(config, /navigateFallbackDenylist/);
  assert.match(config, /handler:\s*"NetworkOnly"/);
  assert.match(config, /\["GET",\s*"POST",\s*"PUT",\s*"PATCH",\s*"DELETE"\]/);
  assert.doesNotMatch(config, /backgroundSync|Queue|NetworkFirst/);
});

test("PWA icons exist as PNG files with non-empty content", () => {
  for (const file of [
    "../../public/pwa-192x192.png",
    "../../public/pwa-512x512.png",
    "../../public/maskable-icon-512x512.png",
    "../../public/apple-touch-icon.png",
  ]) {
    const url = new URL(file, import.meta.url);
    assert.equal(existsSync(url), true);
    const bytes = readFileSync(url);
    assert.ok(bytes.length > 1000);
    assert.deepEqual([...bytes.subarray(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10]);
  }
});

test("online state, install prompt, and controlled updates are connected globally", () => {
  const app = source("../App.jsx");
  const context = source("../context/PwaContext.jsx");
  const status = source("../components/pwa/PwaStatus.jsx");
  assert.match(app, /PwaProvider/);
  assert.match(app, /PwaStatus/);
  assert.match(context, /beforeinstallprompt/);
  assert.match(context, /window\.addEventListener\("online"/);
  assert.match(context, /window\.addEventListener\("offline"/);
  assert.match(context, /onNeedRefresh/);
  assert.match(context, /window\.confirm/);
  assert.match(status, /You are offline/);
  assert.match(status, /Install app/);
  assert.match(status, /Update now/);
});

test("offline mutations fail immediately and are not queued for reconnection", () => {
  const main = source("../main.jsx");
  const api = source("../services/apiClient.js");
  const button = source("../components/ui/Button.jsx");
  assert.match(main, /mutations:[\s\S]*retry:\s*0/);
  assert.match(main, /networkMode:\s*"always"/);
  assert.match(api, /unsafeMethods/);
  assert.match(api, /!navigator\.onLine/);
  assert.match(api, /ERR_NETWORK_OFFLINE/);
  assert.match(button, /requiresOnline/);
  assert.match(button, /Internet connection required/);
});

test("unfinished registration forms protect user-controlled application updates", () => {
  const staffRegistration = source("../features/visitors/VisitorRegistrationPage.jsx");
  const selfService = source("../features/selfservice/SelfServicePage.jsx");
  const pwaHook = source("../hooks/usePwa.js");
  assert.match(staffRegistration, /useUnsavedChanges\(isDirty && !success\)/);
  assert.match(selfService, /useUnsavedChanges\(isDirty && !success\)/);
  assert.match(pwaHook, /reportUnsavedChanges/);
});

test("PWA code does not persist visitor or authentication state in browser storage", () => {
  const files = [
    "../context/PwaContext.jsx",
    "../hooks/usePwa.js",
    "../components/pwa/PwaStatus.jsx",
    "../services/apiClient.js",
  ].map(source).join("\n");
  assert.doesNotMatch(files, /localStorage|sessionStorage|indexedDB|caches\.open/);
});

test("deployment configuration preserves API routing and SPA navigation fallback", () => {
  const nginx = source("../../deploy/nginx.conf.example");
  assert.match(nginx, /location \/api\//);
  assert.match(nginx, /proxy_pass/);
  assert.match(nginx, /try_files \$uri \$uri\/ \/index\.html/);
  assert.match(nginx, /location = \/sw\.js[\s\S]*no-cache/);
  assert.match(nginx, /application\/manifest\+json/);
});
