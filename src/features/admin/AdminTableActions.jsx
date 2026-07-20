import { FiEdit2, FiEye, FiPower, FiTrash2 } from "react-icons/fi";
import { Button } from "../../components/ui/Button";

export const AdminTableActions = ({ row, onView, onEdit, onStatus, onDelete, disabled, showStatus = true }) => (
  <div className="flex flex-wrap gap-2">
    <Button variant="ghost" className="px-2" onClick={() => onView(row)} disabled={disabled} aria-label="View"><FiEye /></Button>
    <Button variant="ghost" className="px-2" onClick={() => onEdit(row)} disabled={disabled} aria-label="Edit"><FiEdit2 /></Button>
    {showStatus && <Button variant="secondary" className="px-2" onClick={() => onStatus(row)} disabled={disabled} aria-label="Change status"><FiPower /></Button>}
    <Button variant="danger" className="px-2" onClick={() => onDelete(row)} disabled={disabled} aria-label="Delete"><FiTrash2 /></Button>
  </div>
);
