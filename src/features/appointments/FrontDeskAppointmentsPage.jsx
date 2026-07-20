import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { FiClock, FiSearch, FiUserX } from "react-icons/fi";
import { PageHeader } from "../../components/ui/PageHeader";
import { Card } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { ResourceTable } from "../../components/ui/ResourceTable";
import { Pagination } from "../../components/ui/Pagination";
import { StatusBadge } from "../../components/ui/StatusBadge";
import { TableSkeleton } from "../../components/ui/Skeleton";
import { ApiErrorState } from "../../components/ui/ApiErrorState";
import { appointmentService } from "../../services/appointmentService";
import { usePagination } from "../../hooks/usePagination";
import { useDebouncedValue } from "../../hooks/useDebouncedValue";
import { getApiError } from "../../utils/apiResponse";
import { titleCase } from "../../utils/formatters";
import { AppointmentOperationsModal } from "./AppointmentOperationsModal";
import { useReferenceData } from "../../hooks/useReferenceData";

const localDate = () => {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60_000;
  return new Date(now.getTime() - offset).toISOString().slice(0, 10);
};

export const FrontDeskAppointmentsPage = () => {
  const queryClient = useQueryClient();
  const pagination = usePagination();
  const references = useReferenceData();
  const [search, setSearch] = useState("");
  const [operation, setOperation] = useState(null);
  const term = useDebouncedValue(search, 350);
  const result = useQuery({
    queryKey: ["appointments", "frontdesk", "today", pagination.page, pagination.size, term],
    queryFn: () => {
      const today = localDate();
      return appointmentService.frontDesk({ ...pagination, ...(term ? { search: term } : {}), from: today, to: today });
    },
  });

  const refresh = () => queryClient.invalidateQueries({ queryKey: ["appointments"] });
  const noShow = useMutation({
    mutationFn: ({ appointment, payload }) => appointmentService.markNoShow({ id: appointment.id, reason: payload.reason }),
    onSuccess: () => { refresh(); setOperation(null); toast.success("Appointment marked as no-show"); },
    onError: (error) => toast.error(getApiError(error).message),
  });
  const reschedule = useMutation({
    mutationFn: ({ appointment, payload }) => appointmentService.frontDeskReschedule({ id: appointment.id, payload }),
    onSuccess: () => { refresh(); setOperation(null); toast.success("Appointment rescheduled"); },
    onError: (error) => toast.error(getApiError(error).message),
  });

  const columns = useMemo(() => [
    { header: "Visitor", accessor: (row) => <div><p className="font-semibold text-gray-900 dark:text-slate-100">{row.visitor}</p><p className="text-xs text-gray-500">{row.phoneNumber} · {row.company || "No company"}</p></div> },
    { header: "Reference", accessor: "appointmentCode" },
    { header: "Host / Department", accessor: (row) => <div>{row.host}<p className="text-xs text-gray-500">{row.department}</p></div> },
    { header: "Schedule", accessor: (row) => <div>{row.date}<p className="text-xs text-gray-500">{row.arrivalTime}</p></div> },
    { header: "Type", accessor: "visitorType", cell: titleCase },
    { header: "Status", accessor: "status", cell: (value) => <StatusBadge status={titleCase(value)} /> },
    { header: "Actions", accessor: "id", cell: (_value, row) => {
      const actionable = ["PENDING", "APPROVED"].includes(row.status);
      if (!actionable) return row.tagNumber ? <span className="font-semibold text-primary-700">{row.tagNumber}</span> : "—";
      return <div className="flex min-w-[210px] flex-wrap gap-2"><Button variant="secondary" className="px-3" onClick={() => setOperation({ type: "reschedule", appointment: row })}><FiClock /> Reschedule</Button><Button variant="danger" className="px-3" onClick={() => setOperation({ type: "no-show", appointment: row })}><FiUserX /> No-show</Button></div>;
    } },
  ], []);

  return (
    <div className="space-y-6">
      <PageHeader title="Today's Appointments" description="Review today's scheduled visitors, reschedule appointments, and record no-shows." />
      <Card className="space-y-5">
        <Input label="Search today's appointments" icon={FiSearch} value={search} onChange={(event) => { setSearch(event.target.value); pagination.resetPage(); }} placeholder="Visitor, phone, email, reference, host, or department" />
      </Card>
      <Card>{result.isLoading ? <TableSkeleton /> : result.error ? <ApiErrorState error={result.error} onRetry={result.refetch} /> : <><ResourceTable columns={columns} rows={result.data?.content} emptyTitle="No appointments found" emptyMessage="Appointments matching this view will appear here." /><Pagination page={result.data} onPageChange={pagination.setPage} /></>}</Card>
      <AppointmentOperationsModal operation={operation?.type} appointment={operation?.appointment} hostOptions={references.hostOptions} isPending={noShow.isPending || reschedule.isPending} onClose={() => setOperation(null)} onSubmit={(payload) => operation.type === "reschedule" ? reschedule.mutate({ appointment: operation.appointment, payload }) : noShow.mutate({ appointment: operation.appointment, payload })} />
    </div>
  );
};
