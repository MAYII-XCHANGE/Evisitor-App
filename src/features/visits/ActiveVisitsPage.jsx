import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import ConfirmModal from "../../components/ConfirmModal";
import { PageHeader } from "../../components/ui/PageHeader";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { ResourceTable } from "../../components/ui/ResourceTable";
import { Pagination } from "../../components/ui/Pagination";
import { StatusBadge } from "../../components/ui/StatusBadge";
import { TableSkeleton } from "../../components/ui/Skeleton";
import { ApiErrorState } from "../../components/ui/ApiErrorState";
import { visitService } from "../../services/visitService";
import { usePagination } from "../../hooks/usePagination";
import { useAuth } from "../../hooks/useAuth";
import { PERMISSIONS } from "../../config/roles";
import { formatDateTime, titleCase } from "../../utils/formatters";
import { getApiError } from "../../utils/apiResponse";

export const ActiveVisitsPage = ({ checkoutMode = false }) => {
  const { can } = useAuth();
  const queryClient = useQueryClient();
  const pagination = usePagination();
  const [checkoutTarget, setCheckoutTarget] = useState(null);
  const result = useQuery({ queryKey: ["active-visits", pagination.page, pagination.size], queryFn: () => visitService.active(pagination) });
  const checkout = useMutation({
    mutationFn: (id) => visitService.checkOut(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["active-visits"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("Visitor checked out");
      setCheckoutTarget(null);
    },
    onError: (error) => toast.error(getApiError(error).message),
  });
  const columns = [
    { header: "Visitor tag", accessor: "tagNumber", cell: (value) => <span className="font-semibold text-primary-700">{value || "—"}</span> },
    { header: "Visitor", accessor: "visitor" },
    { header: "Company", accessor: "company" },
    { header: "Host", accessor: "host" },
    { header: "Branch", accessor: "branch" },
    { header: "Check-in", accessor: "checkInAt", cell: formatDateTime },
    { header: "Status", accessor: "status", cell: (value) => <StatusBadge status={titleCase(value)} /> },
    ...((checkoutMode || can(PERMISSIONS.CHECK_OUT)) ? [{
      header: "Action",
      accessor: (row) => row,
      cell: (visit) => (
        <Button
          requiresOnline
          variant="danger"
          className="px-3"
          disabled={checkout.isPending}
          onClick={() => setCheckoutTarget(visit)}
        >
          Check out
        </Button>
      ),
    }] : []),
  ];
  return (
    <div className="space-y-6">
      <PageHeader title={checkoutMode ? "Check Visitor Out" : "Active Visitors"} description="Monitor visitors currently onsite and close completed visits." />
      <Card>
        {result.isLoading
          ? <TableSkeleton />
          : result.error
            ? <ApiErrorState error={result.error} onRetry={result.refetch} />
            : (
              <>
                <ResourceTable columns={columns} rows={result.data?.content} emptyTitle="No active visitors" />
                <Pagination page={result.data} onPageChange={pagination.setPage} />
              </>
            )}
      </Card>
      <ConfirmModal
        requiresOnline
        isOpen={Boolean(checkoutTarget)}
        title="Confirm visitor checkout"
        message={`Are you sure you want to check out ${checkoutTarget?.visitor || "this visitor"}${checkoutTarget?.tagNumber ? ` (${checkoutTarget.tagNumber})` : ""}? This will end their active visit.`}
        confirmText="Yes, check out visitor"
        cancelText="Cancel"
        variant="danger"
        isLoading={checkout.isPending}
        onCancel={() => setCheckoutTarget(null)}
        onConfirm={() => checkout.mutate(checkoutTarget.id)}
      />
    </div>
  );
};
