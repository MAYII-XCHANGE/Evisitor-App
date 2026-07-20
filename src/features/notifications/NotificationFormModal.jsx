import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Modal } from "../../components/ui/Modal";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Select } from "../../components/ui/Select";
import { notificationService } from "../../services/notificationService";
import { useReferenceData } from "../../hooks/useReferenceData";
import { getApiError } from "../../utils/apiResponse";

export const NotificationFormModal = ({ isOpen, onClose }) => {
  const queryClient = useQueryClient();
  const references = useReferenceData({ includeRecipients: true });
  const { register, handleSubmit, reset, setError, formState: { errors } } = useForm();
  const close = () => { reset(); onClose(); };
  const mutation = useMutation({ mutationFn: notificationService.send, onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["notifications"] }); toast.success("Notification sent"); close(); }, onError: (error) => setError("root", { message: getApiError(error).message }) });
  return <Modal isOpen={isOpen} title="Send notification" description="Send an operational notice to a user in your permitted scope." onClose={close} footer={<><Button variant="secondary" onClick={close}>Cancel</Button><Button type="submit" form="notification-form" disabled={mutation.isPending}>{mutation.isPending ? "Sending..." : "Send notification"}</Button></>}><form id="notification-form" className="space-y-4" onSubmit={handleSubmit((values) => mutation.mutate(values))}><Select label="Recipient" placeholder="Select recipient" options={references.recipientOptions} error={errors.recipientId?.message} {...register("recipientId", { required: "Recipient is required" })} /><Input label="Type" placeholder="GENERAL" error={errors.type?.message} {...register("type", { required: "Type is required" })} /><Input label="Title" error={errors.title?.message} {...register("title", { required: "Title is required" })} /><label className="block"><span className="mb-2 block text-sm font-semibold text-gray-700">Message</span><textarea rows="4" className="w-full rounded-xl border border-gray-300 p-3 text-sm" {...register("message", { required: "Message is required", maxLength: 2000 })} />{errors.message && <span className="text-sm text-danger">{errors.message.message}</span>}</label>{errors.root && <p className="text-sm text-danger">{errors.root.message}</p>}</form></Modal>;
};
