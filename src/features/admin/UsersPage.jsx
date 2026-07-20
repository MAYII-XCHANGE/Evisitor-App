import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { FiUserPlus } from "react-icons/fi";
import ConfirmModal from "../../components/ConfirmModal";
import { ApiErrorState } from "../../components/ui/ApiErrorState";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { PageHeader } from "../../components/ui/PageHeader";
import { Pagination } from "../../components/ui/Pagination";
import { ResourceTable } from "../../components/ui/ResourceTable";
import { TableSkeleton } from "../../components/ui/Skeleton";
import { StatusBadge } from "../../components/ui/StatusBadge";
import { ROLE_LABELS } from "../../config/roles";
import { usePagination } from "../../hooks/usePagination";
import { adminService } from "../../services/adminService";
import { getApiError } from "../../utils/apiResponse";
import { emailDisplayName, formatDateTime, titleCase } from "../../utils/formatters";
import { AdminTableActions } from "./AdminTableActions";
import { ResourceDetailsModal } from "./ResourceDetailsModal";
import { UserFormModal } from "./UserFormModal";

export const UsersPage = () => {
  const queryClient = useQueryClient();
  const pagination = usePagination();
  const [editing, setEditing] = useState(undefined);
  const [viewing, setViewing] = useState(undefined);
  const [confirm, setConfirm] = useState(undefined);
  const params = { ...pagination, sort: "createdAt,desc" };
  const result = useQuery({ queryKey: ["admin-users", params], queryFn: () => adminService.users(params) });
  const actionMutation = useMutation({
    mutationFn: ({ type, row }) => type === "delete"
      ? adminService.deleteUser(row.id)
      : adminService.updateUserStatus({ id: row.id, status: row.status === "ACTIVE" ? "INACTIVE" : "ACTIVE" }),
    onSuccess: (_, action) => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success(action.type === "delete" ? "User deleted" : "User status updated");
      setConfirm(undefined);
    },
    onError: (error) => toast.error(getApiError(error).message),
  });
  const columns = useMemo(() => [
    { header: "Username", accessor: "email", cell: (value) => emailDisplayName(value) },
    { header: "Email", accessor: "email" },
    { header: "Role", accessor: "role", cell: (value) => ROLE_LABELS[value] || titleCase(value) },
    { header: "Department", accessor: "department" },
    { header: "Branch", accessor: "branch" },
    { header: "Status", accessor: "status", cell: (value) => <StatusBadge status={titleCase(value)} /> },
    { header: "Created", accessor: "createdAt", cell: formatDateTime },
    { header: "Actions", accessor: (row) => row, cell: (_, row) => <AdminTableActions row={row} onView={setViewing} onEdit={setEditing} onDelete={(item) => setConfirm({ type: "delete", row: item })} disabled={actionMutation.isPending} showStatus={false} /> },
  ], [actionMutation.isPending]);
  return <div className="space-y-6">
    <PageHeader eyebrow="Super Admin" title="User Management" description="Create, review, and manage portal users and their access assignments." actions={<Button type="button" onClick={() => setEditing(null)}><FiUserPlus /> Create New User</Button>} />
    <Card>{result.isLoading ? <TableSkeleton /> : result.error ? <ApiErrorState error={result.error} onRetry={result.refetch} /> : <><ResourceTable columns={columns} rows={result.data?.content} emptyTitle="No users found" emptyMessage="Try changing your filters or create a user." /><Pagination page={result.data} onPageChange={pagination.setPage} /></>}</Card>
    <UserFormModal isOpen={editing !== undefined} user={editing || undefined} onClose={() => setEditing(undefined)} />
    <ResourceDetailsModal isOpen={Boolean(viewing)} title={viewing ? emailDisplayName(viewing.email) : "User details"} onClose={() => setViewing(undefined)} fields={viewing ? [
      {label:"Username",value:emailDisplayName(viewing.email)},{label:"Email",value:viewing.email},{label:"Role",value:ROLE_LABELS[viewing.role] || titleCase(viewing.role)},{label:"Department",value:viewing.department},{label:"Branch",value:viewing.branch},{label:"Status",value:titleCase(viewing.status)},
    ] : []} />
    <ConfirmModal isOpen={Boolean(confirm)} title={confirm?.type === "delete" ? "Delete user" : "Change user status"} message={confirm?.type === "delete" ? `Delete ${confirm?.row.fullName}? This action is blocked for your own account and the last active Super Admin.` : `${confirm?.row.status === "ACTIVE" ? "Deactivate" : "Activate"} ${confirm?.row.fullName}?`} confirmText={confirm?.type === "delete" ? "Delete user" : "Confirm status"} variant={confirm?.type === "delete" ? "danger" : "primary"} isLoading={actionMutation.isPending} onCancel={() => setConfirm(undefined)} onConfirm={() => actionMutation.mutate(confirm)} />
  </div>;
};
