import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
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
  const result = useQuery({ queryKey: ["active-visits", pagination.page, pagination.size], queryFn: () => visitService.active(pagination) });
  const checkout = useMutation({
    mutationFn: (id) => visitService.checkOut(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["active-visits"] }); queryClient.invalidateQueries({ queryKey: ["dashboard"] }); toast.success("Visitor checked out"); },
    onError: (error) => toast.error(getApiError(error).message),
  });
  const columns = [
    { header: "Visit", accessor: "visitCode" },
    { header: "Visitor", accessor: "visitor" },
    { header: "Company", accessor: "company" },
    { header: "Host", accessor: "host" },
    { header: "Branch", accessor: "branch" },
    { header: "Check-in", accessor: "checkInAt", cell: formatDateTime },
    { header: "Status", accessor: "status", cell: (value) => <StatusBadge status={titleCase(value)} /> },
    ...((checkoutMode || can(PERMISSIONS.CHECK_OUT)) ? [{ header: "Action", accessor: "id", cell: (id) => <Button variant="danger" className="px-3" disabled={checkout.isPending} onClick={() => checkout.mutate(id)}>Check out</Button> }] : []),
  ];
  return <div className="space-y-6"><PageHeader title={checkoutMode ? "Check Visitor Out" : "Active Visitors"} description="Monitor visitors currently onsite and close completed visits." /><Card>{result.isLoading ? <TableSkeleton /> : result.error ? <ApiErrorState error={result.error} onRetry={result.refetch} /> : <><ResourceTable columns={columns} rows={result.data?.content} emptyTitle="No active visitors" /><Pagination page={result.data} onPageChange={pagination.setPage} /></>}</Card></div>;
};
