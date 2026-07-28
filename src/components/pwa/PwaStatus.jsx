import { FiDownload, FiRefreshCw, FiWifi, FiWifiOff, FiX } from "react-icons/fi";
import { usePwa } from "../../hooks/usePwa";
import { Button } from "../ui/Button";

const Notice = ({ icon, title, message, children, onDismiss }) => (
  <section className="w-[min(24rem,calc(100vw-2rem))] rounded-2xl border border-gray-200 bg-white p-4 shadow-xl dark:border-slate-700 dark:bg-slate-900" role="status">
    <div className="flex items-start gap-3">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-700 dark:bg-slate-800 dark:text-primary-100">{icon}</span>
      <div className="min-w-0 flex-1">
        <h2 className="text-sm font-bold text-gray-900 dark:text-slate-100">{title}</h2>
        <p className="mt-1 text-xs leading-5 text-gray-600 dark:text-slate-400">{message}</p>
      </div>
      {onDismiss && (
        <button type="button" onClick={onDismiss} className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-slate-800" aria-label={`Dismiss ${title}`}>
          <FiX aria-hidden="true" />
        </button>
      )}
    </div>
    {children && <div className="mt-4 flex justify-end gap-2">{children}</div>}
  </section>
);

export const PwaStatus = () => {
  const {
    isOnline,
    canInstall,
    installApp,
    dismissInstall,
    updateAvailable,
    activateUpdate,
    dismissUpdate,
    offlineReady,
    dismissOfflineReady,
    hasUnsavedChanges,
  } = usePwa();

  return (
    <>
      {!isOnline && (
        <div className="fixed inset-x-0 top-0 z-[80] flex items-center justify-center gap-2 bg-amber-500 px-4 py-2 text-center text-sm font-semibold text-amber-950 shadow-md" role="alert">
          <FiWifiOff className="shrink-0" aria-hidden="true" />
          You are offline. Entered form data stays on this device, but submissions, uploads, and other server actions require a connection.
        </div>
      )}

      <div className="pointer-events-none fixed bottom-4 right-4 z-[75] flex flex-col items-end gap-3">
        {updateAvailable && (
          <div className="pointer-events-auto">
            <Notice
              icon={<FiRefreshCw aria-hidden="true" />}
              title="A new version is available"
              message={hasUnsavedChanges ? "Finish your current form before updating, or confirm that you want to discard it." : "Update when convenient to load the latest portal version."}
              onDismiss={dismissUpdate}
            >
              <Button variant="secondary" onClick={dismissUpdate}>Later</Button>
              <Button onClick={activateUpdate}>Update now</Button>
            </Notice>
          </div>
        )}

        {!updateAvailable && canInstall && (
          <div className="pointer-events-auto">
            <Notice
              icon={<FiDownload aria-hidden="true" />}
              title="Install NOVA Visitors"
              message="Install this portal for quick access. It will continue to work normally in your browser."
              onDismiss={dismissInstall}
            >
              <Button onClick={installApp}><FiDownload aria-hidden="true" /> Install app</Button>
            </Notice>
          </div>
        )}

        {!updateAvailable && !canInstall && offlineReady && (
          <div className="pointer-events-auto">
            <Notice
              icon={<FiWifi aria-hidden="true" />}
              title="Application shell is ready"
              message="The portal can open without a connection. Secure visitor operations still require the backend."
              onDismiss={dismissOfflineReady}
            />
          </div>
        )}
      </div>
    </>
  );
};
