import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { FiCalendar, FiCheckCircle, FiClock, FiSearch, FiUserX } from "react-icons/fi";
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
import { Select } from "../../components/ui/Select";
import { useReferenceData } from "../../hooks/useReferenceData";
import { VISIT_TYPE_OPTIONS } from "../../validation/visitorValidation";

const TABS = [
  { value: "today", label: "Today's Appointments" },
  { value: "upcoming", label: "Upcoming Appointments" },
  { value: "search", label: "Search Appointments" },
];

export const FrontDeskAppointmentsPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const pagination = usePagination();
  const references = useReferenceData();
  const [tab, setTab] = useState("today");
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({ status: "", hostId: "", departmentId: "", visitorType: "", arrivalStatus: "", from: "", to: "" });
  const [operation, setOperation] = useState(null);
  const term = useDebouncedValue(search, 350);
  const result = useQuery({
    queryKey: ["appointments", "frontdesk", tab, pagination.page, pagination.size, term, filters],
    queryFn: () => {
      const today = new Date().toISOString().slice(0, 10);
      const tomorrow = new Date(Date.now() + 86_400_000).toISOString().slice(0, 10);
      return appointmentService.frontDesk({ ...pagination, ...(term ? { search: term } : {}), ...Object.fromEntries(Object.entries(filters).filter(([, value]) => value)), ...(tab === "today" ? { from: today, to: today } : tab === "upcoming" ? { from: filters.from || tomorrow, ...(filters.to ? { to: filters.to } : {}) } : {}) });
    },
  });

  const refresh = () => queryClient.invalidateQueries({ queryKey: ["appointments"] });
  const arrive = useMutation({
    mutationFn: appointmentService.confirmArrival,
    onSuccess: (appointment) => {
      refresh();
      toast.success("Arrival confirmed. Complete the visitor's capture details.");
      navigate("/visitors/register", { state: { preRegisteredAppointment: appointment } });
    },
    onError: (error) => toast.error(getApiError(error).message),
  });
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
      return <div className="flex min-w-[290px] flex-wrap gap-2"><Button className="px-3" onClick={() => arrive.mutate(row.id)} disabled={arrive.isPending}><FiCheckCircle /> Confirm arrival</Button><Button variant="secondary" className="px-3" onClick={() => setOperation({ type: "reschedule", appointment: row })}><FiClock /> Reschedule</Button><Button variant="danger" className="px-3" onClick={() => setOperation({ type: "no-show", appointment: row })}><FiUserX /> No-show</Button></div>;
    } },
  ], [arrive]);
  const updateFilter = (name, value) => { setFilters((current) => ({ ...current, [name]: value })); pagination.resetPage(); };
  const statusOptions = ["PENDING", "APPROVED", "CHECKED_IN", "CHECKED_OUT", "NO_SHOW", "CANCELLED", "EXPIRED", "REJECTED"].map((value) => ({ value, label: titleCase(value) }));
  const arrivalOptions = ["REGISTERED", "CHECKED_IN", "CHECKED_OUT", "PENDING_HOST", "ESCORTED", "OVERDUE"].map((value) => ({ value, label: titleCase(value) }));

  return (
    <div className="space-y-6">
      <PageHeader title="Visitor Appointments" description="Manage today's arrivals, future appointments, rescheduling, and no-shows." />
      <Card className="space-y-5">
        <div className="flex flex-wrap gap-2" role="tablist">{TABS.map((item) => <Button key={item.value} variant={tab === item.value ? "primary" : "secondary"} onClick={() => { setTab(item.value); pagination.resetPage(); }}>{item.value === "today" ? <FiCalendar /> : item.value === "upcoming" ? <FiClock /> : <FiSearch />}{item.label}</Button>)}</div>
        {tab === "search" && <Input label="Search appointments" icon={FiSearch} value={search} onChange={(event) => { setSearch(event.target.value); pagination.resetPage(); }} placeholder="Visitor, phone, email, reference, host, or department" />}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"></div>
      </Card>
      <Card>{result.isLoading ? <TableSkeleton /> : result.error ? <ApiErrorState error={result.error} onRetry={result.refetch} /> : <><ResourceTable columns={columns} rows={result.data?.content} emptyTitle="No appointments found" emptyMessage="Appointments matching this view will appear here." /><Pagination page={result.data} onPageChange={pagination.setPage} /></>}</Card>
      <AppointmentOperationsModal operation={operation?.type} appointment={operation?.appointment} hostOptions={references.hostOptions} isPending={noShow.isPending || reschedule.isPending} onClose={() => setOperation(null)} onSubmit={(payload) => operation.type === "reschedule" ? reschedule.mutate({ appointment: operation.appointment, payload }) : noShow.mutate({ appointment: operation.appointment, payload })} />
    </div>
  );
};
