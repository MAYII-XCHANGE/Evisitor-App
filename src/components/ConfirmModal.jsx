import { isValidElement } from "react";

const ConfirmModal = ({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  children,
  isLoading,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "primary",
}) => {
  if (!isOpen) return null;

  const isTitleElement = isValidElement(title);

  const confirmButtonClass =
    variant === "danger"
      ? "bg-red-600 hover:bg-red-700 focus:ring-red-200"
      : "bg-[#00B0F0] hover:bg-[#0098cf] focus:ring-[#bfefff]";

  const accentClass =
    variant === "danger" ? "bg-red-100 text-red-600" : "bg-sky-100 text-sky-600";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/35 px-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl sm:p-7">
        <div
          className={`mb-5 flex gap-4 ${
            isTitleElement ? "flex-col items-center text-center" : "items-start"
          }`}
        >
          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-lg font-bold ${accentClass}`}
          >
            {isTitleElement ? title : "?"}
          </div>
          <div className={isTitleElement ? "text-center" : ""}>
            {!isTitleElement && (
              <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
            )}
            <p className="mt-2 text-sm leading-6 text-slate-600">{message}</p>
          </div>
        </div>

        {children && <div className="mb-6">{children}</div>}

        <div className="flex flex-col-reverse justify-end gap-3 sm:flex-row">
          <button
            type="button"
            className="cursor-pointer rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            onClick={onCancel}
            disabled={isLoading}
          >
            {cancelText}
          </button>
          <button
            type="button"
            className={`cursor-pointer rounded-xl px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition focus:outline-none focus:ring-4 ${confirmButtonClass}`}
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? "Confirming..." : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
