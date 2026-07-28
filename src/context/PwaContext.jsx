import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { PwaContext } from "./pwaContextValue";

const onlineStatus = () => typeof navigator === "undefined" || navigator.onLine;
const standaloneStatus = () => typeof window !== "undefined"
  && (window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true);

export const PwaProvider = ({ children }) => {
  const [isOnline, setIsOnline] = useState(onlineStatus);
  const [installEvent, setInstallEvent] = useState(null);
  const [installDismissed, setInstallDismissed] = useState(false);
  const [isInstalled, setIsInstalled] = useState(standaloneStatus);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [offlineReady, setOfflineReady] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const updateServiceWorkerRef = useRef(null);
  const unsavedSourcesRef = useRef(new Set());

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    const handleInstallPrompt = (event) => {
      event.preventDefault();
      setInstallEvent(event);
      setInstallDismissed(false);
    };
    const handleInstalled = () => {
      setInstallEvent(null);
      setIsInstalled(true);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    window.addEventListener("beforeinstallprompt", handleInstallPrompt);
    window.addEventListener("appinstalled", handleInstalled);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("beforeinstallprompt", handleInstallPrompt);
      window.removeEventListener("appinstalled", handleInstalled);
    };
  }, []);

  useEffect(() => {
    if (!import.meta.env.PROD || !("serviceWorker" in navigator)) return undefined;
    let active = true;

    import("virtual:pwa-register").then(({ registerSW }) => {
      if (!active) return;
      updateServiceWorkerRef.current = registerSW({
        immediate: true,
        onNeedRefresh: () => active && setUpdateAvailable(true),
        onOfflineReady: () => active && setOfflineReady(true),
        onRegisterError: (error) => console.error("PWA registration failed", error),
      });
    });

    return () => {
      active = false;
    };
  }, []);

  const reportUnsavedChanges = useCallback((sourceId, dirty) => {
    if (dirty) unsavedSourcesRef.current.add(sourceId);
    else unsavedSourcesRef.current.delete(sourceId);
    setHasUnsavedChanges(unsavedSourcesRef.current.size > 0);
  }, []);

  const installApp = useCallback(async () => {
    if (!installEvent) return false;
    await installEvent.prompt();
    const result = await installEvent.userChoice;
    setInstallEvent(null);
    if (result.outcome === "accepted") setIsInstalled(true);
    return result.outcome === "accepted";
  }, [installEvent]);

  const activateUpdate = useCallback(async () => {
    if (hasUnsavedChanges) {
      const confirmed = window.confirm("You have an unfinished form. Updating now will reload the application and discard the information entered. Continue?");
      if (!confirmed) return false;
    }
    await updateServiceWorkerRef.current?.(true);
    return true;
  }, [hasUnsavedChanges]);

  const value = useMemo(() => ({
    isOnline,
    isInstalled,
    canInstall: Boolean(installEvent) && !installDismissed && !isInstalled,
    installApp,
    dismissInstall: () => setInstallDismissed(true),
    updateAvailable,
    activateUpdate,
    dismissUpdate: () => setUpdateAvailable(false),
    offlineReady,
    dismissOfflineReady: () => setOfflineReady(false),
    hasUnsavedChanges,
    reportUnsavedChanges,
  }), [
    activateUpdate,
    hasUnsavedChanges,
    installApp,
    installDismissed,
    installEvent,
    isInstalled,
    isOnline,
    offlineReady,
    reportUnsavedChanges,
    updateAvailable,
  ]);

  return <PwaContext.Provider value={value}>{children}</PwaContext.Provider>;
};
