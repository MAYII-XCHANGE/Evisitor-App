import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { PageHeader } from "../../components/ui/PageHeader";
import { Card } from "../../components/ui/Card";
import { Select } from "../../components/ui/Select";
import { ResourceTable } from "../../components/ui/ResourceTable";
import { Pagination } from "../../components/ui/Pagination";
import { StatusBadge } from "../../components/ui/StatusBadge";
import { TableSkeleton } from "../../components/ui/Skeleton";
import { ApiErrorState } from "../../components/ui/ApiErrorState";
import { useReferenceData } from "../../hooks/useReferenceData";
import { usePagination } from "../../hooks/usePagination";
import { visitorService } from "../../services/visitorService";
import { formatDateTime, titleCase } from "../../utils/formatters";

const columns = [
  { header: "Visit", accessor: "visitCode" },
  { header: "Visitor", accessor: "visitor" },
  { header: "Host", accessor: "host" },
  { header: "Branch", accessor: "branch" },
  { header: "Check-in", accessor: "checkInAt", cell: formatDateTime },
  { header: "Check-out", accessor: "checkOutAt", cell: formatDateTime },
  { header: "Status", accessor: "status", cell: (value) => <StatusBadge status={titleCase(value)} /> },
];

export const VisitorHistoryPage = () => {
  const [visitorId, setVisitorId] = useState("");
  const pagination = usePagination();
  const references = useReferenceData({ includeVisitors: true });
  const result = useQuery({
    queryKey: ["visitor-history", visitorId, pagination.page],
    queryFn: () => visitorService.history(visitorId, pagination),
    enabled: Boolean(visitorId),
  });
  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Audit trail" title="Visitor History" description="Select a visitor to review previous visits." />
      <Card><Select label="Visitor" placeholder="Select visitor" options={references.visitorOptions} value={visitorId} onChange={(event) => { setVisitorId(event.target.value); pagination.resetPage(); }} /></Card>
      {visitorId && <Card>{result.isLoading ? <TableSkeleton /> : result.error ? <ApiErrorState error={result.error} onRetry={result.refetch} /> : <><ResourceTable columns={columns} rows={result.data?.content} /><Pagination page={result.data} onPageChange={pagination.setPage} /></>}</Card>}
    </div>
  );
};
