import { FiX } from "react-icons/fi";
import { Button } from "./Button";

export const Modal = ({
  isOpen,
  title,
  description,
  children,
  onClose,
  footer,
  size = "md",
}) => {
  if (!isOpen) return null;

  const sizeClass = {
    sm: "max-w-md",
    md: "max-w-xl",
    lg: "max-w-3xl",
  }[size];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/45 px-4 py-6">
      <div className={`flex max-h-[calc(100vh-48px)] w-full ${sizeClass} flex-col rounded-xl bg-white shadow-card`}>
        <div className="flex shrink-0 items-start justify-between gap-4 border-b border-gray-100 px-6 py-5">
          <div>
            <h2 className="text-lg font-bold text-gray-900">{title}</h2>
            {description && <p className="mt-1 text-sm text-gray-500">{description}</p>}
          </div>
          <button
            type="button"
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
            onClick={onClose}
            aria-label="Close modal"
          >
            <FiX className="h-5 w-5" />
          </button>
        </div>
        <div className="overflow-y-auto px-6 py-5">{children}</div>
        {footer && <div className="flex shrink-0 flex-col-reverse justify-end gap-3 border-t border-gray-100 px-6 py-4 sm:flex-row">{footer}</div>}
      </div>
    </div>
  );
};

export const ConfirmationModal = ({
  isOpen,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "primary",
  onConfirm,
  onCancel,
}) => (
  <Modal
    isOpen={isOpen}
    title={title}
    description={description}
    onClose={onCancel}
    size="sm"
    footer={
      <>
        <Button variant="secondary" onClick={onCancel}>
          {cancelText}
        </Button>
        <Button variant={variant} onClick={onConfirm}>
          {confirmText}
        </Button>
      </>
    }
  >
    <p className="text-sm text-gray-600">This action will take effect immediately.</p>
  </Modal>
);
