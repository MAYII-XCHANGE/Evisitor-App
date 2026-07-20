import { Modal } from "../../components/ui/Modal";
import { Button } from "../../components/ui/Button";

export const ResourceDetailsModal = ({ isOpen, title, fields = [], onClose }) => (
  <Modal isOpen={isOpen} title={title} onClose={onClose} footer={<Button variant="secondary" onClick={onClose}>Close</Button>}>
    <dl className="grid gap-4 sm:grid-cols-2">
      {fields.map(({ label, value }) => <div key={label}><dt className="text-xs font-bold uppercase tracking-wide text-gray-500">{label}</dt><dd className="mt-1 text-sm text-gray-900">{value || "—"}</dd></div>)}
    </dl>
  </Modal>
);
