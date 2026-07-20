import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Modal } from "../../components/ui/Modal";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { visitorService } from "../../services/visitorService";
import { getApiError } from "../../utils/apiResponse";

export const VisitorEditModal = ({ visitor, onClose }) => {
  const queryClient = useQueryClient();
  const { register, handleSubmit, reset, setError, formState: { errors } } = useForm();
  useEffect(() => {
    reset(visitor ? { visitorName: visitor.fullName, phoneNumber: visitor.phoneNumber, email: visitor.email || "", company: visitor.company || "" } : {});
  }, [reset, visitor]);

  const mutation = useMutation({
    mutationFn: (payload) => visitorService.update(visitor.id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["visitors"] });
      toast.success("Visitor updated");
      onClose();
    },
    onError: (error) => setError("root", { message: getApiError(error).message }),
  });

  return (
    <Modal isOpen={Boolean(visitor)} title="Edit visitor" description="Update the visitor's contact and organisation details." onClose={onClose} footer={<><Button variant="secondary" onClick={onClose}>Cancel</Button><Button type="submit" form="visitor-edit-form" disabled={mutation.isPending}>{mutation.isPending ? "Saving..." : "Save changes"}</Button></>}>
      <form id="visitor-edit-form" className="grid gap-4 sm:grid-cols-2" onSubmit={handleSubmit((values) => mutation.mutate(values))}>
        <Input label="Full name" error={errors.visitorName?.message} {...register("visitorName", { required: "Full name is required" })} />
        <Input label="Phone number" error={errors.phoneNumber?.message} {...register("phoneNumber", { required: "Phone number is required" })} />
        <Input label="Email" type="email" error={errors.email?.message} {...register("email", { pattern: { value: /^$|^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Enter a valid email" } })} />
        <Input label="Company" {...register("company")} />
        {errors.root && <p className="sm:col-span-2 text-sm text-danger">{errors.root.message}</p>}
      </form>
    </Modal>
  );
};
