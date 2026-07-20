import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { Modal } from "../../components/ui/Modal";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { authService } from "../../services/authService";
import { getApiError } from "../../utils/apiResponse";
import { passwordRules } from "../../validation/authValidation";

export const ChangePasswordModal = ({ isOpen, onClose }) => {
  const { register, handleSubmit, reset, setError, formState: { errors, isSubmitting } } = useForm();
  const close = () => { reset(); onClose(); };
  const submit = async (values) => {
    if (values.newPassword !== values.confirmPassword) {
      setError("confirmPassword", { message: "Passwords do not match" });
      return;
    }
    try {
      await authService.changePassword({ currentPassword: values.currentPassword, newPassword: values.newPassword });
      toast.success("Password changed successfully");
      close();
    } catch (error) {
      setError("root", { message: getApiError(error).message });
    }
  };
  return (
    <Modal isOpen={isOpen} title="Change password" description="Use at least 12 characters." onClose={close} footer={<><Button variant="secondary" onClick={close}>Cancel</Button><Button type="submit" form="change-password-form" disabled={isSubmitting}>{isSubmitting ? "Saving..." : "Change password"}</Button></>}>
      <form id="change-password-form" className="space-y-4" onSubmit={handleSubmit(submit)}>
        <Input label="Current password" type="password" autoComplete="current-password" error={errors.currentPassword?.message} {...register("currentPassword", passwordRules.currentPassword)} />
        <Input label="New password" type="password" autoComplete="new-password" error={errors.newPassword?.message} {...register("newPassword", passwordRules.newPassword)} />
        <Input label="Confirm new password" type="password" autoComplete="new-password" error={errors.confirmPassword?.message} {...register("confirmPassword", { required: "Confirm the new password" })} />
        {errors.root && <p className="text-sm text-danger">{errors.root.message}</p>}
      </form>
    </Modal>
  );
};
