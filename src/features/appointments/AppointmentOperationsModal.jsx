import { useEffect, useState } from "react";
import { Modal } from "../../components/ui/Modal";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { Select } from "../../components/ui/Select";

export const AppointmentOperationsModal = ({ operation, appointment, hostOptions = [], isPending, onClose, onSubmit }) => {
  const [reason, setReason] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [hostId, setHostId] = useState("");
  const [errors, setErrors] = useState({});

  useEffect(() => {
    setReason("");
    setDate(appointment?.date || "");
    setTime(appointment?.arrivalTime?.slice(0, 5) || "");
    setHostId(appointment?.hostId || "");
    setErrors({});
  }, [appointment, operation]);

  if (!appointment || !operation) return null;
  const rescheduling = operation === "reschedule";
  const submit = () => {
    const nextErrors = {};
    if (rescheduling && !date) nextErrors.date = "New date is required";
    if (rescheduling && !time) nextErrors.time = "New time is required";
    if (rescheduling && !reason.trim()) nextErrors.reason = "Reason is required";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    onSubmit(rescheduling ? { scheduledDate: date, arrivalTime: time, reason: reason.trim(), hostId: hostId === appointment.hostId ? null : hostId } : { reason: reason.trim() || null });
  };

  return (
    <Modal
      isOpen
      title={rescheduling ? "Reschedule appointment" : "Mark visitor as no-show"}
      description={`${appointment.visitor} · ${appointment.appointmentCode}`}
      onClose={onClose}
      footer={<><Button variant="secondary" onClick={onClose} disabled={isPending}>Cancel</Button><Button variant={rescheduling ? "primary" : "danger"} onClick={submit} disabled={isPending}>{isPending ? "Saving..." : rescheduling ? "Save new schedule" : "Mark no-show"}</Button></>}
    >
      <div className="space-y-4">
        {rescheduling && <><div className="grid gap-4 sm:grid-cols-2"><Input label="New date" type="date" min={new Date(Date.now() + 86_400_000).toISOString().slice(0, 10)} value={date} onChange={(event) => setDate(event.target.value)} error={errors.date} /><Input label="New time" type="time" value={time} onChange={(event) => setTime(event.target.value)} error={errors.time} /></div><div className="grid gap-4 sm:grid-cols-2"><Select label="Host (optional change)" options={hostOptions} value={hostId} onChange={(event) => setHostId(event.target.value)} /><Input label="Department" value={hostOptions.find((host) => host.value === hostId)?.department || appointment.department || ""} readOnly /></div></>}
        <label className="block"><span className="mb-2 block text-sm font-semibold text-gray-700">{rescheduling ? "Reason" : "Reason (optional)"}</span><textarea rows="4" value={reason} onChange={(event) => setReason(event.target.value)} className={`w-full rounded-xl border p-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary-100 ${errors.reason ? "border-danger" : "border-gray-300"}`} />{errors.reason && <span className="mt-2 block text-sm text-danger">{errors.reason}</span>}</label>
      </div>
    </Modal>
  );
};
