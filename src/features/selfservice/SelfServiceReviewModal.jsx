import { useEffect, useState } from "react";
import { FiCheck, FiXCircle } from "react-icons/fi";
import { Modal } from "../../components/ui/Modal";
import { Button } from "../../components/ui/Button";
import { StatusBadge } from "../../components/ui/StatusBadge";
import { formatDateTime, titleCase } from "../../utils/formatters";
import { PhysicalTagSelect } from "../../components/PhysicalTagSelect";

const Field = ({ label, value }) => <div><dt className="text-xs font-bold uppercase tracking-wide text-gray-500">{label}</dt><dd className="mt-1 text-sm font-medium text-gray-900">{value || "—"}</dd></div>;

export const SelfServiceReviewModal = ({ registration, onClose, onApprove, onReject, isLoading }) => {
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState("");
  const [physicalTagId, setPhysicalTagId] = useState("");
  useEffect(() => { setRejecting(false); setReason(""); setPhysicalTagId(""); }, [registration]);
  if (!registration) return null;
  const pending = registration.status === "PENDING_APPROVAL";
  const reject = () => { if (!rejecting) { setRejecting(true); return; } if (reason.trim()) onReject(registration.id, reason.trim()); };
  return <Modal isOpen title={`Review ${registration.reference}`} description="Verify the visitor's physical identification before approving check-in." onClose={onClose} size="lg" footer={<><Button variant="secondary" onClick={onClose} disabled={isLoading}>Close</Button>{pending&&<><Button requiresOnline variant="danger" onClick={reject} disabled={isLoading||rejecting&&!reason.trim()}><FiXCircle/>{rejecting?"Confirm rejection":"Reject"}</Button><Button requiresOnline onClick={()=>onApprove(registration.id,physicalTagId)} disabled={isLoading||!physicalTagId}><FiCheck/>{isLoading?"Processing...":"Approve and check in"}</Button></>}</>}>
    <div className="space-y-6"><div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-primary-50 p-4"><div><p className="text-sm font-bold text-primary-900">{registration.fullName}</p><p className="text-xs text-primary-700">Submitted {formatDateTime(registration.submittedAt)}</p></div><StatusBadge status={titleCase(registration.status)}/></div>
      <section><h3 className="mb-3 font-bold text-gray-900">Visitor information</h3><dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"><Field label="Phone" value={registration.phoneNumber}/><Field label="Email" value={registration.email}/><Field label="Company" value={registration.company}/><Field label="Visitor type" value={titleCase(registration.visitorType)}/><Field label="ID type" value={titleCase(registration.idType)}/><Field label="ID number" value={registration.maskedIdNumber}/><Field label="Vehicle" value={registration.vehicleNumber}/></dl></section>
      <section><h3 className="mb-3 font-bold text-gray-900">Host and visit</h3><dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"><Field label="Host" value={registration.hostName}/><Field label="Department" value={registration.departmentName}/><Field label="Branch" value={registration.branchName}/><Field label="Date" value={registration.appointmentDate}/><Field label="Time" value={registration.appointmentTime}/><Field label="Purpose" value={registration.purpose}/></dl></section>
      <section><h3 className="mb-3 font-bold text-gray-900">Optional captures</h3><dl className="grid gap-4 sm:grid-cols-3"><Field label="ID document" value={registration.hasIdDocument?"Provided":"Not provided"}/><Field label="Photograph" value={registration.hasPhotograph?"Provided":"Not provided"}/><Field label="Signature" value={registration.hasSignature?"Provided":"Not provided"}/></dl></section>
      <section><h3 className="mb-3 font-bold text-gray-900">Items carried</h3>{registration.items?.length?<div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr className="border-b"><th className="p-2">Item</th><th className="p-2">Description</th><th className="p-2">Quantity</th><th className="p-2">Serial</th></tr></thead><tbody>{registration.items.map((item,index)=><tr key={`${item.itemName}-${index}`} className="border-b"><td className="p-2">{item.itemName}</td><td className="p-2">{item.description||"—"}</td><td className="p-2">{item.quantity}</td><td className="p-2">{item.serialNumber||"—"}</td></tr>)}</tbody></table></div>:<p className="text-sm text-gray-500">No items declared.</p>}</section>
      {pending&&<section><PhysicalTagSelect value={physicalTagId} onChange={(event)=>setPhysicalTagId(event.target.value)}/></section>}
      {rejecting&&<label className="block"><span className="mb-2 block text-sm font-semibold text-gray-700">Rejection reason</span><textarea rows="3" value={reason} onChange={(event)=>setReason(event.target.value)} maxLength="500" className="w-full rounded-xl border border-gray-300 p-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary-100" placeholder="Explain why this submission cannot be approved" autoFocus/></label>}
      {registration.rejectionReason&&<div className="rounded-xl bg-red-50 p-4 text-sm text-red-700"><strong>Rejection reason:</strong> {registration.rejectionReason}</div>}
    </div>
  </Modal>;
};
