import { useQuery } from "@tanstack/react-query";
import { PageHeader } from "../../components/ui/PageHeader";
import { Card } from "../../components/ui/Card";
import { ResourceTable } from "../../components/ui/ResourceTable";
import { StatusBadge } from "../../components/ui/StatusBadge";
import { TableSkeleton } from "../../components/ui/Skeleton";
import { ApiErrorState } from "../../components/ui/ApiErrorState";
import { appointmentService } from "../../services/appointmentService";
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
  const result = useQuery({ queryKey: ["appointments", "expected"], queryFn: appointmentService.expected });
  return <div className="space-y-6"><PageHeader eyebrow="Host schedule" title="Expected Visitors" description="Upcoming visitors assigned to you." /><Card>{result.isLoading ? <TableSkeleton /> : result.error ? <ApiErrorState error={result.error} onRetry={result.refetch} /> : <ResourceTable columns={columns} rows={result.data} emptyTitle="No expected visitors" />}</Card></div>;
};
