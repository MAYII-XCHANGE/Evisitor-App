import { useQuery } from "@tanstack/react-query";
import { PageHeader } from "../../components/ui/PageHeader";
import { Card } from "../../components/ui/Card";
import { ResourceTable } from "../../components/ui/ResourceTable";
import { Pagination } from "../../components/ui/Pagination";
import { StatusBadge } from "../../components/ui/StatusBadge";
import { TableSkeleton } from "../../components/ui/Skeleton";
import { ApiErrorState } from "../../components/ui/ApiErrorState";
import { appointmentService } from "../../services/appointmentService";
import { usePagination } from "../../hooks/usePagination";
import { titleCase } from "../../utils/formatters";

const columns = [
  { header: "Reference", accessor: "appointmentCode" },
  { header: "Visitor", accessor: "visitor" },
  { header: "Branch", accessor: "branch" },
  { header: "Department", accessor: "department" },
  { header: "Arrival", accessor: (row) => `${row.date} ${row.arrivalTime}` },
  { header: "Status", accessor: "status", cell: (value) => <StatusBadge status={titleCase(value)} /> },
];

export const ExpectedVisitorsPage = () => {
  const pagination = usePagination();
  const result = useQuery({ queryKey: ["appointments", "expected", pagination.page, pagination.size], queryFn: () => appointmentService.expected(pagination) });
  return <div className="space-y-6"><PageHeader eyebrow="Host schedule" title="Today's Expected Visitors" description="Visitors assigned to you for today." /><Card>{result.isLoading ? <TableSkeleton /> : result.error ? <ApiErrorState error={result.error} onRetry={result.refetch} /> : <><ResourceTable columns={columns} rows={result.data?.content} emptyTitle="No visitors expected today" /><Pagination page={result.data} onPageChange={pagination.setPage} /></>}</Card></div>;
};
