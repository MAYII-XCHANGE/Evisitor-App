import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FiClock, FiEdit2, FiPlus, FiRefreshCw } from "react-icons/fi";
import toast from "react-hot-toast";
import { PageHeader } from "../../components/ui/PageHeader";
import { Card } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { Select } from "../../components/ui/Select";
import { Button } from "../../components/ui/Button";
import { Modal } from "../../components/ui/Modal";
import { ResourceTable } from "../../components/ui/ResourceTable";
import { Pagination } from "../../components/ui/Pagination";
import { StatusBadge } from "../../components/ui/StatusBadge";
import { TableSkeleton } from "../../components/ui/Skeleton";
import { ApiErrorState } from "../../components/ui/ApiErrorState";
import { physicalTagService } from "../../services/physicalTagService";
import { adminService } from "../../services/adminService";
import { usePagination } from "../../hooks/usePagination";
import { useDebouncedValue } from "../../hooks/useDebouncedValue";
import { useAuth } from "../../hooks/useAuth";
import { USER_ROLES } from "../../config/roles";
import { formatDateTime, titleCase } from "../../utils/formatters";
import { getApiError } from "../../utils/apiResponse";

const STATUS_OPTIONS = ["AVAILABLE", "ASSIGNED", "LOST", "DAMAGED", "INACTIVE"].map((value) => ({ value, label: titleCase(value) }));
const emptyForm = { code: "", description: "", branchId: "" };

export const PhysicalTagsPage = () => {
  const queryClient = useQueryClient();
  const pagination = usePagination();
  const { user } = useAuth();
  const isSuperAdmin = user?.role === USER_ROLES.SUPER_ADMIN;
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [editing, setEditing] = useState(undefined);
  const [form, setForm] = useState(emptyForm);
  const [statusAction, setStatusAction] = useState(null);
  const [comment, setComment] = useState("");
  const [historyTarget, setHistoryTarget] = useState(null);
  const debouncedSearch = useDebouncedValue(search);
  const result = useQuery({
    queryKey: ["physical-tags", "management", pagination.page, pagination.size, debouncedSearch, status],
    queryFn: () => physicalTagService.list({ page: pagination.page, size: pagination.size, search: debouncedSearch, ...(status ? { status } : {}) }),
  });
  const branches = useQuery({
    queryKey: ["admin-options", "physical-tag-branches"],
    queryFn: () => adminService.adminBranches({ page: 0, size: 200, status: "ACTIVE", sort: "name,asc" }),
    enabled: isSuperAdmin,
  });
  const history = useQuery({
    queryKey: ["physical-tags", "history", historyTarget?.id],
    queryFn: () => physicalTagService.history(historyTarget.id, { page: 0, size: 100 }),
    enabled: Boolean(historyTarget),
  });
  const branchOptions = isSuperAdmin
    ? (branches.data?.content || []).map((branch) => ({ value: branch.id, label: branch.name }))
    : user?.branch ? [{ value: user.branch.id, label: user.branch.name }] : [];

  useEffect(() => {
    if (editing === undefined) return;
    setForm(editing ? { code: editing.code, description: editing.description || "", branchId: editing.branchId } : { ...emptyForm, branchId: user?.branch?.id || "" });
  }, [editing, user?.branch?.id]);

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ["physical-tags"] });
    queryClient.invalidateQueries({ queryKey: ["dashboard"] });
  };
  const save = useMutation({
    mutationFn: (payload) => editing ? physicalTagService.update({ id: editing.id, payload }) : physicalTagService.create(payload),
    onSuccess: () => { toast.success(editing ? "Physical tag updated" : "Physical tag created"); setEditing(undefined); refresh(); },
    onError: (error) => toast.error(getApiError(error).message),
  });
  const changeStatus = useMutation({
    mutationFn: ({ id, nextStatus, reason }) => physicalTagService.changeStatus({ id, status: nextStatus, comment: reason }),
    onSuccess: () => { toast.success("Physical tag status updated"); setStatusAction(null); setComment(""); refresh(); },
    onError: (error) => toast.error(getApiError(error).message),
  });

  const openStatus = (tag, nextStatus) => { setStatusAction({ tag, nextStatus }); setComment(""); };
  const statusButtons = (tag) => {
    if (tag.status === "ASSIGNED") return <><Button variant="danger" className="px-3" onClick={() => openStatus(tag, "LOST")}>Mark lost</Button><Button variant="secondary" className="px-3" onClick={() => openStatus(tag, "DAMAGED")}>Mark damaged</Button></>;
    if (tag.status === "AVAILABLE") return <Button variant="secondary" className="px-3" onClick={() => openStatus(tag, "INACTIVE")}>Deactivate</Button>;
    return <Button variant="secondary" className="px-3" onClick={() => openStatus(tag, "AVAILABLE")}><FiRefreshCw /> Restore</Button>;
  };
  const columns = [
    { header: "Tag code", accessor: "code", cell: (value) => <span className="font-bold text-primary-700">{value}</span> },
    { header: "Description", accessor: "description" },
    { header: "Branch", accessor: "branch" },
    { header: "Status", accessor: "status", cell: (value) => <StatusBadge status={titleCase(value)} /> },
    { header: "Current visitor", accessor: (row) => row.currentVisitor || "—" },
    { header: "Assigned", accessor: "assignedAt", cell: formatDateTime },
    { header: "Created", accessor: "createdAt", cell: formatDateTime },
    { header: "Created by", accessor: "createdBy" },
    { header: "Last updated", accessor: "updatedAt", cell: formatDateTime },
    { header: "Updated by", accessor: "updatedBy" },
    { header: "Actions", accessor: (row) => row, cell: (_, row) => <div className="flex min-w-max flex-wrap gap-2"><Button variant="secondary" className="px-3" disabled={row.status === "ASSIGNED"} onClick={() => setEditing(row)}><FiEdit2 /> Edit</Button>{statusButtons(row)}<Button variant="ghost" className="px-3" onClick={() => setHistoryTarget(row)}><FiClock /> History</Button></div> },
  ];

  const requiresComment = ["LOST", "DAMAGED"].includes(statusAction?.nextStatus);
  return (
    <div className="space-y-6">
      <PageHeader title="Physical Tag Management" description="Create, assign, monitor, and recover branch-owned physical visitor tags." actions={<Button onClick={() => setEditing(null)}><FiPlus /> Create physical tag</Button>} />
      <Card className="grid gap-4 md:grid-cols-2">
        <Input label="Search" value={search} onChange={(event) => { setSearch(event.target.value); pagination.resetPage(); }} placeholder="Tag code, description, or branch" />
        <Select label="Status" value={status} onChange={(event) => { setStatus(event.target.value); pagination.resetPage(); }} options={[{ value: "", label: "All statuses" }, ...STATUS_OPTIONS]} />
      </Card>
      <Card>{result.isLoading ? <TableSkeleton /> : result.error ? <ApiErrorState error={result.error} onRetry={result.refetch} /> : <><ResourceTable columns={columns} rows={result.data?.content} emptyTitle="No physical tags found" emptyMessage="Create a physical tag or change the filters." /><Pagination page={result.data} onPageChange={pagination.setPage} /></>}</Card>

      <Modal isOpen={editing !== undefined} title={editing ? "Edit physical tag" : "Create physical tag"} description="Tag codes must be unique and tags are owned by one branch." onClose={() => setEditing(undefined)} footer={<><Button variant="secondary" onClick={() => setEditing(undefined)}>Cancel</Button><Button requiresOnline disabled={save.isPending || !form.code.trim() || !form.branchId} onClick={() => save.mutate({ code: form.code.trim(), description: form.description.trim() || null, branchId: form.branchId })}>{save.isPending ? "Saving..." : "Save tag"}</Button></>}>
        <div className="space-y-4">
          <Input label="Tag code or number" required value={form.code} maxLength="40" onChange={(event) => setForm((current) => ({ ...current, code: event.target.value }))} placeholder="TAG-015" />
          <Input label="Description" value={form.description} maxLength="500" onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} placeholder="Blue visitor badge" />
          <Select label="Branch" required value={form.branchId} disabled={!isSuperAdmin} options={branchOptions} placeholder="Select branch" onChange={(event) => setForm((current) => ({ ...current, branchId: event.target.value }))} />
        </div>
      </Modal>

      <Modal isOpen={Boolean(statusAction)} title={`${titleCase(statusAction?.nextStatus || "")} ${statusAction?.tag?.code || "physical tag"}`} description="This status change is recorded in the physical-tag audit history." onClose={() => setStatusAction(null)} footer={<><Button variant="secondary" onClick={() => setStatusAction(null)}>Cancel</Button><Button requiresOnline variant={requiresComment ? "danger" : "primary"} disabled={changeStatus.isPending || (requiresComment && !comment.trim())} onClick={() => changeStatus.mutate({ id: statusAction.tag.id, nextStatus: statusAction.nextStatus, reason: comment.trim() || null })}>{changeStatus.isPending ? "Updating..." : "Confirm status"}</Button></>}>
        <label className="block"><span className="mb-2 block text-sm font-semibold text-gray-700">Reason or comment{requiresComment && <span className="ml-1 text-danger">*</span>}</span><textarea rows="4" maxLength="1000" value={comment} onChange={(event) => setComment(event.target.value)} className="w-full rounded-xl border border-gray-300 p-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary-100" /></label>
      </Modal>

      <Modal isOpen={Boolean(historyTarget)} title={`${historyTarget?.code || "Physical tag"} history`} description="Complete assignment, return, loss, damage, and status history." onClose={() => setHistoryTarget(null)} size="lg">
        {history.isLoading ? <TableSkeleton /> : history.error ? <ApiErrorState error={history.error} onRetry={history.refetch} /> : <ResourceTable columns={[
          { header: "Event", accessor: "eventType", cell: titleCase },
          { header: "Visitor", accessor: "visitor" },
          { header: "From", accessor: "previousStatus", cell: titleCase },
          { header: "To", accessor: "newStatus", cell: titleCase },
          { header: "Performed by", accessor: "performedBy" },
          { header: "Date / time", accessor: "occurredAt", cell: formatDateTime },
          { header: "Comment", accessor: "comment" },
        ]} rows={history.data?.content} emptyTitle="No history recorded" />}
      </Modal>
    </div>
  );
};
