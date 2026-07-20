import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { FiDownload, FiFilter } from "react-icons/fi";
import toast from "react-hot-toast";
import { PageHeader } from "../../components/ui/PageHeader";
import { Card } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { ApiErrorState } from "../../components/ui/ApiErrorState";
import { TableSkeleton } from "../../components/ui/Skeleton";
import { reportService } from "../../services/reportService";
import { downloadBlob } from "../../utils/download";
import { toDateInput } from "../../utils/formatters";
import { getApiError } from "../../utils/apiResponse";

export const ReportsPage = () => {
  const [filters, setFilters] = useState({ startDate: toDateInput(new Date(Date.now() - 30 * 86400000)), endDate: toDateInput(), date: toDateInput() });
  const [applied, setApplied] = useState(filters);
  const volume = useQuery({ queryKey: ["reports", "volume", applied], queryFn: () => reportService.visitorVolume(applied) });
  const performance = useQuery({ queryKey: ["reports", "performance", applied.date], queryFn: () => reportService.branchPerformance(applied.date) });
  const exportAudit = async () => {
    try { downloadBlob(await reportService.exportAudit(), "nova-audit-report.csv"); toast.success("Audit report downloaded"); }
    catch (error) { toast.error(getApiError(error).message); }
  };
  return <div className="space-y-6"><PageHeader eyebrow="Reporting" title="Operational Reports" description="Review visitor volume and branch throughput for the selected period." actions={<Button variant="secondary" onClick={exportAudit}><FiDownload /> Export audit CSV</Button>} /><Card><div className="grid gap-4 md:grid-cols-3"><Input label="Start date" type="date" value={filters.startDate} onChange={(event) => setFilters((current) => ({ ...current, startDate: event.target.value }))} /><Input label="End date" type="date" value={filters.endDate} onChange={(event) => setFilters((current) => ({ ...current, endDate: event.target.value }))} /><Input label="Performance date" type="date" value={filters.date} onChange={(event) => setFilters((current) => ({ ...current, date: event.target.value }))} /></div><Button className="mt-4" onClick={() => setApplied(filters)}><FiFilter /> Apply dates</Button></Card>{volume.isLoading ? <TableSkeleton /> : volume.error ? <ApiErrorState error={volume.error} onRetry={volume.refetch} /> : <div className="grid gap-4 sm:grid-cols-2"><Card><p className="text-sm font-semibold text-gray-500">Visits</p><p className="mt-3 text-3xl font-bold">{volume.data?.visits ?? 0}</p><p className="mt-2 text-sm text-gray-500">{volume.data?.startDate} to {volume.data?.endDate}</p></Card><Card><p className="text-sm font-semibold text-gray-500">Appointments</p><p className="mt-3 text-3xl font-bold">{volume.data?.appointments ?? 0}</p><p className="mt-2 text-sm text-gray-500">Scheduled in selected period</p></Card></div>}{performance.isLoading ? <TableSkeleton /> : performance.error ? <ApiErrorState error={performance.error} onRetry={performance.refetch} /> : <Card><h3 className="font-bold text-gray-900">Branch performance · {performance.data?.date}</h3><div className="mt-5 space-y-4">{(performance.data?.branches || []).map((branch) => <div key={branch.branch}><div className="mb-1 flex justify-between text-sm"><span className="font-semibold">{branch.branch}</span><span>{branch.visitors} visits · {branch.active} active</span></div><div className="h-3 rounded-full bg-primary-100"><div className="h-3 rounded-full bg-primary" style={{ width: `${Math.min(100, branch.visitors * 2)}%` }} /></div></div>)}</div></Card>}</div>;
};
