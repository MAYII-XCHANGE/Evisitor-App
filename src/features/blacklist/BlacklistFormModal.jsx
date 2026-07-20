import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Modal } from "../../components/ui/Modal";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Select } from "../../components/ui/Select";
import { adminService } from "../../services/adminService";
import { useReferenceData } from "../../hooks/useReferenceData";
import { getApiError } from "../../utils/apiResponse";
import { blacklistRules } from "../../validation/adminValidation";

export const BlacklistFormModal = ({ isOpen, onClose }) => {
  const queryClient = useQueryClient();
  const references = useReferenceData({ includeVisitors: true });
  const { register, handleSubmit, reset, setError, formState: { errors } } = useForm({ defaultValues: { severity: "MEDIUM" } });
  const close = () => { reset({ severity: "MEDIUM" }); onClose(); };
  const mutation = useMutation({ mutationFn: adminService.addToBlacklist, onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["blacklist"] }); toast.success("Visitor added to blacklist"); close(); }, onError: (error) => setError("root", { message: getApiError(error).message }) });
  return <Modal isOpen={isOpen} title="Add blacklist entry" description="Restrict a visitor globally or within an assigned branch." onClose={close} footer={<><Button variant="secondary" onClick={close}>Cancel</Button><Button variant="danger" type="submit" form="blacklist-form" disabled={mutation.isPending}>{mutation.isPending ? "Saving..." : "Add entry"}</Button></>}><form id="blacklist-form" className="space-y-4" onSubmit={handleSubmit((values) => mutation.mutate({ ...values, branchId: values.branchId || null, expiresAt: values.expiresAt ? new Date(values.expiresAt).toISOString() : null }))}><Select label="Visitor" placeholder="Select visitor" options={references.visitorOptions} error={errors.visitorId?.message} {...register("visitorId", blacklistRules.visitorId)} /><Select label="Severity" options={["LOW", "MEDIUM", "HIGH", "CRITICAL"].map((value) => ({ value, label: value }))} error={errors.severity?.message} {...register("severity", blacklistRules.severity)} /><Select label="Branch scope" placeholder="Global (super admin only)" options={references.branchOptions} {...register("branchId")} /><Input label="Expires at" type="datetime-local" {...register("expiresAt")} /><label className="block"><span className="mb-2 block text-sm font-semibold text-gray-700">Reason</span><textarea rows="4" className="w-full rounded-xl border border-gray-300 p-3 text-sm" {...register("reason", blacklistRules.reason)} />{errors.reason && <span className="text-sm text-danger">{errors.reason.message}</span>}</label>{errors.root && <p className="text-sm text-danger">{errors.root.message}</p>}</form></Modal>;
};
