import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Modal } from "../../components/ui/Modal";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Select } from "../../components/ui/Select";
import { appointmentService } from "../../services/appointmentService";
import { useReferenceData } from "../../hooks/useReferenceData";
import { getApiError } from "../../utils/apiResponse";
import { appointmentRules } from "../../validation/appointmentValidation";
import { VISIT_TYPE_OPTIONS } from "../../validation/visitorValidation";

export const AppointmentFormModal = ({ isOpen, onClose }) => {
  const queryClient = useQueryClient();
  const references = useReferenceData({ includeVisitors: true });
  const { register, handleSubmit, reset, setError, formState: { errors } } = useForm({ defaultValues: { visitType: "APPOINTMENT" } });
  const close = () => { reset({ visitType: "APPOINTMENT" }); onClose(); };
  const mutation = useMutation({
    mutationFn: appointmentService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      toast.success("Appointment created");
      close();
    },
    onError: (error) => {
      const apiError = getApiError(error);
      Object.entries(apiError.fieldErrors).forEach(([field, message]) => setError(field, { message }));
      setError("root", { message: apiError.message });
    },
  });
  return (
    <Modal isOpen={isOpen} title="Create appointment" description="Schedule a registered visitor with a host." onClose={close} size="lg" footer={<><Button variant="secondary" onClick={close}>Cancel</Button><Button type="submit" form="appointment-form" disabled={mutation.isPending || references.isLoading}>{mutation.isPending ? "Creating..." : "Create appointment"}</Button></>}>
      <form id="appointment-form" className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit((values) => mutation.mutate(values))}>
        <Select label="Visitor" placeholder="Select visitor" options={references.visitorOptions} error={errors.visitorId?.message} {...register("visitorId", appointmentRules.visitorId)} />
        <Select label="Host" placeholder="Select host" options={references.hostOptions} error={errors.hostId?.message} {...register("hostId", appointmentRules.hostId)} />
        <Select label="Department" placeholder="Select department" options={references.departmentOptions} error={errors.departmentId?.message} {...register("departmentId", appointmentRules.departmentId)} />
        <Select label="Branch" placeholder="Select branch" options={references.branchOptions} error={errors.branchId?.message} {...register("branchId", appointmentRules.branchId)} />
        <Input label="Date" type="date" error={errors.scheduledDate?.message} {...register("scheduledDate", appointmentRules.scheduledDate)} />
        <Input label="Arrival time" type="time" error={errors.arrivalTime?.message} {...register("arrivalTime", appointmentRules.arrivalTime)} />
        <Select label="Visit type" options={VISIT_TYPE_OPTIONS} error={errors.visitType?.message} {...register("visitType", appointmentRules.visitType)} />
        <label className="md:col-span-2 block"><span className="mb-2 block text-sm font-semibold text-gray-700">Purpose</span><textarea rows="3" className="w-full rounded-xl border border-gray-300 p-3 text-sm" {...register("purpose", appointmentRules.purpose)} />{errors.purpose && <span className="text-sm text-danger">{errors.purpose.message}</span>}</label>
        {errors.root && <p className="md:col-span-2 text-sm text-danger">{errors.root.message}</p>}
      </form>
    </Modal>
  );
};
