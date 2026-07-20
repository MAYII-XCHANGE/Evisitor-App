import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Modal } from "../../components/ui/Modal";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Select } from "../../components/ui/Select";
import { adminService } from "../../services/adminService";
import { useAdminOptions } from "../../hooks/useAdminOptions";
import { getApiError } from "../../utils/apiResponse";
import { userRules } from "../../validation/adminValidation";

const defaults = { email: "", role: "", branchId: "", departmentId: "", status: "ACTIVE" };

export const UserFormModal = ({ isOpen, user, onClose }) => {
  const queryClient = useQueryClient();
  const options = useAdminOptions();
  const editing = Boolean(user);
  const { register, handleSubmit, reset, setError, watch, formState: { errors } } = useForm({ defaultValues: defaults });
  const selectedBranchId = watch("branchId");
  const departmentOptions = options.departmentOptions.filter((option) => !selectedBranchId || option.branchId === selectedBranchId);
  useEffect(() => { reset(user ? { ...defaults, ...user, branchId: user.branchId || "", departmentId: user.departmentId || "" } : defaults); }, [reset, user, isOpen]);
  const close = () => { reset(defaults); onClose(); };
  const mutation = useMutation({
    mutationFn: (payload) => editing ? adminService.updateUser({ id: user.id, payload }) : adminService.createUser(payload),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["admin-users"] }); toast.success(editing ? "User updated" : "User created"); close(); },
    onError: (error) => setError("root", { message: getApiError(error).message }),
  });
  const submit = (values) => {
    const payload = { email: values.email.trim(), role: values.role, departmentId: values.departmentId || null, branchId: values.branchId || null, status: values.status };
    mutation.mutate(payload);
  };
  return <Modal isOpen={isOpen} title={editing ? "Edit User" : "Create New User"} description="The username and display name are generated from the email. Assign the user's role, branch, department, and status." onClose={close} size="lg" footer={<><Button variant="secondary" onClick={close}>Cancel</Button><Button type="submit" form="user-form" disabled={mutation.isPending || options.isLoading}>{mutation.isPending ? "Saving..." : editing ? "Save Changes" : "Create User"}</Button></>}><form id="user-form" className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit(submit)}><Input label="Email" type="email" error={errors.email?.message} {...register("email", userRules.email)} /><Select label="Role" placeholder="Select role" options={options.roleOptions} error={errors.role?.message} {...register("role", userRules.role)} /><Select label="Branch" placeholder="No branch (Super Admin only)" options={options.branchOptions} {...register("branchId")} /><Select label="Department" placeholder="No department" options={departmentOptions} {...register("departmentId")} /><Select label="Status" options={[{value:"ACTIVE",label:"Active"},{value:"INACTIVE",label:"Inactive"}]} {...register("status", { required: "Status is required" })} />{errors.root && <p className="md:col-span-2 text-sm text-danger">{errors.root.message}</p>}</form></Modal>;
};
