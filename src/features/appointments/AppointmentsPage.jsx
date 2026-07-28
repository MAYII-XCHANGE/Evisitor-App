import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FiCheck, FiPlus, FiX } from "react-icons/fi";
import toast from "react-hot-toast";
import { PageHeader } from "../../components/ui/PageHeader";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { ResourceTable } from "../../components/ui/ResourceTable";
import { Pagination } from "../../components/ui/Pagination";
import { StatusBadge } from "../../components/ui/StatusBadge";
import { TableSkeleton } from "../../components/ui/Skeleton";
import { ApiErrorState } from "../../components/ui/ApiErrorState";
import { appointmentService } from "../../services/appointmentService";
import { usePagination } from "../../hooks/usePagination";
import { useAuth } from "../../hooks/useAuth";
import { PERMISSIONS } from "../../config/roles";
import { titleCase } from "../../utils/formatters";
import { getApiError } from "../../utils/apiResponse";
import { AppointmentFormModal } from "./AppointmentFormModal";
import { AppointmentDecisionModal } from "./AppointmentDecisionModal";
import { FrontDeskAppointmentsPage } from "./FrontDeskAppointmentsPage";
import { USER_ROLES } from "../../config/roles";

export const AppointmentsPage = ({ approvalsOnly = false }) => {
  const { can, user } = useAuth();
  const queryClient = useQueryClient();
  const pagination = usePagination();
  const [formOpen, setFormOpen] = useState(false);
  const [decision, setDecision] = useState(null);
  const result = useQuery({ queryKey: ["appointments", pagination.page, pagination.size], queryFn: () => appointmentService.list(pagination) });
  const cancel = useMutation({
    mutationFn: appointmentService.cancel,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["appointments"] }); toast.success("Appointment cancelled"); },
    onError: (error) => toast.error(getApiError(error).message),
  });
  const rows = approvalsOnly ? (result.data?.content || []).filter((row) => row.status === "PENDING") : result.data?.content;
  const columns = [
    { header: "Reference", accessor: "appointmentCode" },
    { header: "Visitor", accessor: "visitor" },
    { header: "Host", accessor: "host" },
    { header: "Branch", accessor: "branch" },
    { header: "Date", accessor: (row) => `${row.date} ${row.arrivalTime}` },
    { header: "Status", accessor: "status", cell: (value) => <StatusBadge status={titleCase(value)} /> },
    ...(can(PERMISSIONS.DECIDE_APPOINTMENTS) ? [{
      header: "Actions", accessor: "id", cell: (_value, row) => row.status === "PENDING" ? <div className="flex flex-wrap gap-2"><Button className="px-3" onClick={() => setDecision({ appointment: row, action: "approve" })}><FiCheck /> Approve</Button><Button variant="danger" className="px-3" onClick={() => setDecision({ appointment: row, action: "reject" })}><FiX /> Reject</Button><Button requiresOnline variant="secondary" className="px-3" disabled={cancel.isPending} onClick={() => cancel.mutate(row.id)}>Cancel</Button></div> : "—",
    }] : []),
  ];
  if (!approvalsOnly && user?.role === USER_ROLES.FRONTDESK) return <FrontDeskAppointmentsPage />;

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Scheduling" title={approvalsOnly ? "Visitor Approvals" : "Appointments"} description={approvalsOnly ? "Review pending visitor requests assigned to you or your branch." : "Schedule and manage visitor appointments."} actions={!approvalsOnly && can(PERMISSIONS.MANAGE_APPOINTMENTS) ? <Button onClick={() => setFormOpen(true)}><FiPlus /> Create appointment</Button> : null} />
      <Card>{result.isLoading ? <TableSkeleton /> : result.error ? <ApiErrorState error={result.error} onRetry={result.refetch} /> : <><ResourceTable columns={columns} rows={rows} emptyTitle={approvalsOnly ? "No pending approvals" : "No appointments"} /><Pagination page={result.data} onPageChange={pagination.setPage} /></>}</Card>
      <AppointmentFormModal isOpen={formOpen} onClose={() => setFormOpen(false)} />
      <AppointmentDecisionModal appointment={decision?.appointment} action={decision?.action} onClose={() => setDecision(null)} />
    </div>
  );
};
