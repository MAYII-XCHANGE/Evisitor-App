import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { PageHeader } from "../../components/ui/PageHeader";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Modal } from "../../components/ui/Modal";
import { Select } from "../../components/ui/Select";
import { Input } from "../../components/ui/Input";
import { ResourceTable } from "../../components/ui/ResourceTable";
import { Pagination } from "../../components/ui/Pagination";
import { StatusBadge } from "../../components/ui/StatusBadge";
import { TableSkeleton } from "../../components/ui/Skeleton";
import { ApiErrorState } from "../../components/ui/ApiErrorState";
import { visitService } from "../../services/visitService";
import { usePagination } from "../../hooks/usePagination";
import { useAuth } from "../../hooks/useAuth";
import { PERMISSIONS, USER_ROLES } from "../../config/roles";
import { formatDateTime, titleCase } from "../../utils/formatters";
import { getApiError } from "../../utils/apiResponse";

export const ActiveVisitsPage = ({ checkoutMode = false, afterHoursOnly = false }) => {
  const { can, user } = useAuth();
  const queryClient = useQueryClient();
  const pagination = usePagination();
  const [checkoutTarget, setCheckoutTarget] = useState(null);
  const [returnStatus, setReturnStatus] = useState("RETURNED");
  const [tagComment, setTagComment] = useState("");
  const [extendTarget, setExtendTarget] = useState(null);
  const [expectedCheckOutAt, setExpectedCheckOutAt] = useState("");
  const [extensionReason, setExtensionReason] = useState("");
  const result = useQuery({ queryKey: ["active-visits", pagination.page, pagination.size], queryFn: () => visitService.active(pagination) });
  const handover = useQuery({ queryKey: ["handover-status"], queryFn: visitService.handoverStatus, refetchInterval: 60_000 });
  const checkout = useMutation({
    mutationFn: ({ id, payload }) => visitService.checkOut(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["active-visits"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["physical-tags"] });
      toast.success("Visitor checked out");
      setCheckoutTarget(null);
      setReturnStatus("RETURNED");
      setTagComment("");
    },
    onError: (error) => toast.error(getApiError(error).message),
  });
  const extend = useMutation({
    mutationFn: () => visitService.extendExpectedCheckOut(extendTarget.id, { expectedCheckOutAt: new Date(expectedCheckOutAt).toISOString(), reason: extensionReason.trim() }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["active-visits"] }); setExtendTarget(null); setExpectedCheckOutAt(""); setExtensionReason(""); toast.success("Expected checkout time extended"); },
    onError: (error) => toast.error(getApiError(error).message),
  });
  const canExtend = [USER_ROLES.EMPLOYEE_HOST, USER_ROLES.BRANCH_ADMIN].includes(user?.role);
  const columns = [
    { header: "Visitor tag", accessor: "tagNumber", cell: (value) => <span className="font-semibold text-primary-700">{value || "—"}</span> },
    { header: "Physical tag", accessor: "physicalTagCode", cell: (value) => <span className="font-semibold text-emerald-700">{value || "—"}</span> },
    { header: "Visitor", accessor: "visitor" },
    { header: "Company", accessor: "company" },
    { header: "Host", accessor: "host" },
    { header: "Branch", accessor: "branch" },
    { header: "Check-in", accessor: "checkInAt", cell: formatDateTime },
    { header: "Expected checkout", accessor: "expectedCheckOutAt", cell: formatDateTime },
    { header: "Status", accessor: "status", cell: (value) => <StatusBadge status={titleCase(value)} /> },
    ...((checkoutMode || can(PERMISSIONS.CHECK_OUT)) ? [{
      header: "Action",
      accessor: (row) => row,
      cell: (visit) => (
        <div className="flex flex-wrap gap-2"><Button
          requiresOnline
          variant="danger"
          className="px-3"
          disabled={checkout.isPending}
          onClick={() => { setCheckoutTarget(visit); setReturnStatus("RETURNED"); setTagComment(""); }}
        >
          Check out
        </Button>{canExtend && <Button variant="secondary" className="px-3" onClick={() => setExtendTarget(visit)}>Extend</Button>}</div>
      ),
    }] : []),
  ];
  const displayedPage = afterHoursOnly && result.data ? { ...result.data, content: (result.data.content || []).filter((visit) => ["AFTER_HOURS_ONSITE", "OVERDUE"].includes(visit.status)) } : result.data;
  return (
    <div className="space-y-6">
      <PageHeader title={afterHoursOnly ? "After-Hours Visitor Queue" : checkoutMode ? "Check Visitor Out" : "Active Visitors"} description={afterHoursOnly ? "Security-owned queue for visitors still onsite after Front Desk closes." : "Monitor visitors currently onsite and close completed visits."} />
      {handover.data?.handoverWarning && <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm font-semibold text-amber-800">Front Desk closes soon. {handover.data.activeVisitors} active visitor(s) must be checked out or handed over to Security.</div>}
      <Card>
        {result.isLoading
          ? <TableSkeleton />
          : result.error
            ? <ApiErrorState error={result.error} onRetry={result.refetch} />
            : (
              <>
                <ResourceTable columns={columns} rows={displayedPage?.content} emptyTitle={afterHoursOnly ? "No after-hours visitors" : "No active visitors"} />
                <Pagination page={displayedPage} onPageChange={pagination.setPage} />
              </>
            )}
      </Card>
      <Modal
        isOpen={Boolean(checkoutTarget)}
        title="Confirm visitor checkout"
        description={`Record the return status of physical tag ${checkoutTarget?.physicalTagCode || "—"} before checking out ${checkoutTarget?.visitor || "this visitor"}.`}
        onClose={() => setCheckoutTarget(null)}
        footer={(
          <>
            <Button variant="secondary" onClick={() => setCheckoutTarget(null)} disabled={checkout.isPending}>Cancel</Button>
            <Button
              variant="danger"
              requiresOnline
              disabled={checkout.isPending || (["LOST", "DAMAGED"].includes(returnStatus) && !tagComment.trim())}
              onClick={() => checkout.mutate({
                id: checkoutTarget.id,
                payload: { notes: "", physicalTagReturnStatus: returnStatus, physicalTagComment: tagComment.trim() || null },
              })}
            >
              {checkout.isPending ? "Checking out..." : "Confirm checkout"}
            </Button>
          </>
        )}
      >
        <div className="space-y-4">
          <div className="rounded-xl bg-primary-50 p-4 text-sm text-primary-800">
            <p><strong>System tag:</strong> {checkoutTarget?.tagNumber || "—"}</p>
            <p className="mt-1"><strong>Physical tag:</strong> {checkoutTarget?.physicalTagCode || "—"}</p>
          </div>
          <Select
            label="Physical-tag return status"
            required
            value={returnStatus}
            onChange={(event) => setReturnStatus(event.target.value)}
            options={[
              { value: "RETURNED", label: "Returned" },
              { value: "LOST", label: "Lost" },
              { value: "DAMAGED", label: "Damaged" },
              { value: "NOT_RETURNED", label: "Not yet returned" },
            ]}
          />
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-gray-700">
              Reason or comment{["LOST", "DAMAGED"].includes(returnStatus) && <span className="ml-1 text-danger">*</span>}
            </span>
            <textarea
              rows="3"
              maxLength="1000"
              value={tagComment}
              onChange={(event) => setTagComment(event.target.value)}
              placeholder={returnStatus === "NOT_RETURNED" ? "Add follow-up details" : "Add a comment"}
              className="w-full rounded-xl border border-gray-300 p-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary-100"
            />
          </label>
          {returnStatus === "NOT_RETURNED" && <p className="rounded-xl bg-amber-50 p-3 text-sm text-amber-700">The visit will close, but the physical tag remains assigned and appears in “Awaiting Tag Return”.</p>}
        </div>
      </Modal>
      <Modal isOpen={Boolean(extendTarget)} title="Extend expected checkout" description={extendTarget ? `${extendTarget.visitor} · currently ${formatDateTime(extendTarget.expectedCheckOutAt)}` : ""} onClose={() => setExtendTarget(null)} footer={<><Button variant="secondary" onClick={() => setExtendTarget(null)}>Cancel</Button><Button disabled={!expectedCheckOutAt || !extensionReason.trim() || extend.isPending} onClick={() => extend.mutate()}>{extend.isPending ? "Extending..." : "Approve extension"}</Button></>}>
        <div className="space-y-4"><Input label="New expected checkout" type="datetime-local" required value={expectedCheckOutAt} onChange={(event) => setExpectedCheckOutAt(event.target.value)} /><label className="block"><span className="mb-2 block text-sm font-semibold">Reason</span><textarea rows="3" maxLength="1000" className="w-full rounded-xl border border-gray-300 p-3" value={extensionReason} onChange={(event) => setExtensionReason(event.target.value)} /></label></div>
      </Modal>
    </div>
  );
};
