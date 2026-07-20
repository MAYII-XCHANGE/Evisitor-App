import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Modal } from "../../components/ui/Modal";
import { Button } from "../../components/ui/Button";
import { appointmentService } from "../../services/appointmentService";
import { getApiError } from "../../utils/apiResponse";
import { rejectionRules } from "../../validation/appointmentValidation";

export const AppointmentDecisionModal = ({ appointment, action, onClose }) => {
  const queryClient = useQueryClient();
  const { register, handleSubmit, reset, setError, formState: { errors } } = useForm();
  const close = () => { reset(); onClose(); };
  const mutation = useMutation({
    mutationFn: ({ reason }) => action === "approve" ? appointmentService.approve(appointment.id, reason) : appointmentService.reject(appointment.id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      toast.success(`Appointment ${action}d`);
      close();
    },
    onError: (error) => setError("root", { message: getApiError(error).message }),
  });
  return (
    <Modal isOpen={Boolean(appointment)} title={`${action === "approve" ? "Approve" : "Reject"} appointment`} description={appointment ? `${appointment.visitor} · ${appointment.appointmentCode}` : ""} onClose={close} footer={<><Button variant="secondary" onClick={close}>Cancel</Button><Button variant={action === "reject" ? "danger" : "primary"} type="submit" form="decision-form" disabled={mutation.isPending}>{mutation.isPending ? "Saving..." : action === "approve" ? "Approve" : "Reject"}</Button></>}>
      <form id="decision-form" onSubmit={handleSubmit((values) => mutation.mutate(values))}>
        <label className="block"><span className="mb-2 block text-sm font-semibold text-gray-700">{action === "reject" ? "Reason" : "Approval note (optional)"}</span><textarea rows="4" className="w-full rounded-xl border border-gray-300 p-3 text-sm" {...register("reason", action === "reject" ? rejectionRules : {})} />{errors.reason && <span className="text-sm text-danger">{errors.reason.message}</span>}</label>
        {errors.root && <p className="mt-3 text-sm text-danger">{errors.root.message}</p>}
      </form>
    </Modal>
  );
};
