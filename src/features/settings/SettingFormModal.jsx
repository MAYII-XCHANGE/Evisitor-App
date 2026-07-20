import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Modal } from "../../components/ui/Modal";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { settingService } from "../../services/settingService";
import { getApiError } from "../../utils/apiResponse";

export const SettingFormModal = ({ setting, isOpen, onClose }) => {
  const queryClient = useQueryClient();
  const { register, handleSubmit, reset, setError, formState: { errors } } = useForm();
  useEffect(() => { reset(setting || {}); }, [reset, setting]);
  const close = () => { reset(); onClose(); };
  const mutation = useMutation({ mutationFn: settingService.save, onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["settings"] }); toast.success("Setting saved"); close(); }, onError: (error) => setError("root", { message: getApiError(error).message }) });
  return <Modal isOpen={isOpen} title={setting ? "Edit setting" : "Add setting"} description="Update a system preference and its owning team." onClose={close} footer={<><Button variant="secondary" onClick={close}>Cancel</Button><Button type="submit" form="setting-form" disabled={mutation.isPending}>{mutation.isPending ? "Saving..." : "Save setting"}</Button></>}><form id="setting-form" className="space-y-4" onSubmit={handleSubmit((values) => mutation.mutate({ id: setting?.id || null, ...values }))}><Input label="Key" disabled={Boolean(setting)} error={errors.key?.message} {...register("key", { required: "Key is required" })} /><Input label="Value" error={errors.value?.message} {...register("value", { required: "Value is required", maxLength: 2000 })} /><Input label="Owner" error={errors.owner?.message} {...register("owner", { required: "Owner is required" })} />{errors.root && <p className="text-sm text-danger">{errors.root.message}</p>}</form></Modal>;
};
