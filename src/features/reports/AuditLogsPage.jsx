import { useQuery } from "@tanstack/react-query";
import { PageHeader } from "../../components/ui/PageHeader";
import { Card } from "../../components/ui/Card";
import { ResourceTable } from "../../components/ui/ResourceTable";
import { Pagination } from "../../components/ui/Pagination";
import { TableSkeleton } from "../../components/ui/Skeleton";
import { ApiErrorState } from "../../components/ui/ApiErrorState";
import { reportService } from "../../services/reportService";
import { usePagination } from "../../hooks/usePagination";
import { formatDateTime, titleCase } from "../../utils/formatters";

const columns = [{ header: "Time", accessor: "occurredAt", cell: formatDateTime }, { header: "Actor", accessor: "actorName" }, { header: "Action", accessor: "action", cell: titleCase }, { header: "Entity", accessor: "entityType" }, { header: "Entity ID", accessor: "entityId" }, { header: "IP address", accessor: "ipAddress" }];

export const AuditLogsPage = () => {
  const pagination = usePagination(50);
  const result = useQuery({ queryKey: ["audit-logs", pagination.page], queryFn: () => reportService.audit(pagination) });
  return <div className="space-y-6"><PageHeader eyebrow="Compliance" title="Audit Logs" description="Inspect immutable authentication and operational events." /><Card>{result.isLoading ? <TableSkeleton /> : result.error ? <ApiErrorState error={result.error} onRetry={result.refetch} /> : <><ResourceTable columns={columns} rows={result.data?.content} emptyTitle="No audit events" /><Pagination page={result.data} onPageChange={pagination.setPage} /></>}</Card></div>;
};
