import { useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PageHeader } from "../../components/ui/PageHeader";
import { Card } from "../../components/ui/Card";
import { Select } from "../../components/ui/Select";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { appointmentService } from "../../services/appointmentService";
import { visitService } from "../../services/visitService";
import { useReferenceData } from "../../hooks/useReferenceData";
import { getApiError } from "../../utils/apiResponse";
import { PassDetailsCard } from "../passes/PassDetailsCard";

export const CheckInPage = () => {
  const queryClient = useQueryClient();
  const [mode, setMode] = useState("appointment");
  const [pass, setPass] = useState(null);
  const references = useReferenceData({ includeVisitors: true });
  const appointments = useQuery({ queryKey: ["appointments", "approved-options"], queryFn: () => appointmentService.list({ page: 0, size: 200 }) });
  const { register, handleSubmit, reset, setError, formState: { errors } } = useForm();
  const mutation = useMutation({
    mutationFn: visitService.checkIn,
    onSuccess: (result) => {
      setPass(result);
      reset();
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      queryClient.invalidateQueries({ queryKey: ["active-visits"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
    onError: (error) => setError("root", { message: getApiError(error).message }),
  });
  const approvedOptions = (appointments.data?.content || []).filter((row) => row.status === "APPROVED").map((row) => ({ label: `${row.appointmentCode} · ${row.visitor}`, value: row.id }));
  const submit = (values) => mutation.mutate(mode === "appointment" ? { appointmentId: values.appointmentId, notes: values.notes || null } : values);
  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Reception" title="Check Visitor In" description="Check in an approved appointment or a registered walk-in visitor." />
      <Card>
        <form className="space-y-5" onSubmit={handleSubmit(submit)}>
          <Select label="Check-in type" value={mode} onChange={(event) => setMode(event.target.value)} options={[{ label: "Approved appointment", value: "appointment" }, { label: "Walk-in", value: "walkin" }]} />
          {mode === "appointment" ? <Select label="Approved appointment" placeholder="Select appointment" options={approvedOptions} error={errors.appointmentId?.message} {...register("appointmentId", { required: "Appointment is required" })} /> : <div className="grid gap-4 md:grid-cols-2"><Select label="Visitor" placeholder="Select visitor" options={references.visitorOptions} error={errors.visitorId?.message} {...register("visitorId", { required: "Visitor is required" })} /><Select label="Host" placeholder="Select host" options={references.hostOptions} error={errors.hostId?.message} {...register("hostId", { required: "Host is required" })} /><Select label="Department" placeholder="Select department" options={references.departmentOptions} error={errors.departmentId?.message} {...register("departmentId", { required: "Department is required" })} /><Select label="Branch" placeholder="Select branch" options={references.branchOptions} error={errors.branchId?.message} {...register("branchId", { required: "Branch is required" })} /><Input label="Purpose" error={errors.purpose?.message} {...register("purpose", { required: "Purpose is required" })} /></div>}
          <Input label="Notes" {...register("notes")} />
          {errors.root && <p className="text-sm text-danger">{errors.root.message}</p>}
          <Button type="submit" disabled={mutation.isPending}>{mutation.isPending ? "Checking in..." : "Check in visitor"}</Button>
        </form>
      </Card>
      <PassDetailsCard pass={pass} />
    </div>
  );
};
