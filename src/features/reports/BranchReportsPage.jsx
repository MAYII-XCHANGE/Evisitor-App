import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Cell, CartesianGrid, Legend, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { FiCalendar, FiDownload, FiEye, FiFilter, FiSearch, FiTrendingDown, FiTrendingUp } from "react-icons/fi";
import { PageHeader } from "../../components/ui/PageHeader";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Select } from "../../components/ui/Select";
import { ResourceTable } from "../../components/ui/ResourceTable";
import { Pagination } from "../../components/ui/Pagination";
import { StatusBadge } from "../../components/ui/StatusBadge";
import { TableSkeleton } from "../../components/ui/Skeleton";
import { ApiErrorState } from "../../components/ui/ApiErrorState";
import { usePagination } from "../../hooks/usePagination";
import { useDebouncedValue } from "../../hooks/useDebouncedValue";
import { reportService } from "../../services/reportService";
import { formatDate, formatDateTime, titleCase, toDateInput } from "../../utils/formatters";
import { VisitorDetailsModal } from "../visitors/VisitorDetailsModal";
import { BranchReportExportModal } from "./BranchReportExportModal";

const COLORS = ["#01B0F1", "#10B981", "#F59E0B", "#8B5CF6", "#EF4444", "#0EA5E9", "#64748B"];
const VISITOR_TYPES = ["GUEST", "CONTRACTOR", "VENDOR", "INTERVIEW_CANDIDATE", "DELIVERY_PERSONNEL", "GOVERNMENT_OFFICIAL", "OTHER"];
const VISIT_STATUSES = ["PENDING_HOST", "ONSITE", "ESCORTED", "AFTER_HOURS_ONSITE", "OVERDUE", "CHECKED_OUT"];

const shiftDate = (date, days) => {
  const value = new Date(`${date}T12:00:00`);
  value.setDate(value.getDate() + days);
  return toDateInput(value);
};

const presetRange = (preset) => {
  const today = toDateInput();
  if (preset === "today") return { startDate: today, endDate: today };
  if (preset === "7days") return { startDate: shiftDate(today, -6), endDate: today };
  if (preset === "month") return { startDate: `${today.slice(0, 7)}-01`, endDate: today };
  return { startDate: shiftDate(today, -29), endDate: today };
};

const formatMetric = (kpi) => {
  if (kpi.format !== "MINUTES") return Math.round(kpi.value).toLocaleString();
  const minutes = Math.round(kpi.value);
  if (minutes < 60) return `${minutes} min`;
  return `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
};

const KpiCard = ({ kpi }) => {
  const rising = (kpi.percentageChange || 0) >= 0;
  const comparison = kpi.percentageChange == null
    ? "New activity"
    : `${Math.abs(kpi.percentageChange).toFixed(1)}% ${rising ? "increase" : "decrease"}`;
  return (
    <Card>
      <p className="text-sm font-semibold text-gray-500 dark:text-slate-400">{kpi.label}</p>
      <p className="mt-3 text-3xl font-bold text-gray-900 dark:text-white">{formatMetric(kpi)}</p>
      <p className={`mt-3 flex items-center gap-1 text-xs font-semibold ${rising ? "text-emerald-600" : "text-rose-600"}`}>
        {rising ? <FiTrendingUp /> : <FiTrendingDown />} {comparison} vs previous period
      </p>
    </Card>
  );
};

const BreakdownChart = ({ title, data }) => {
  const visibleData = (data || []).filter((item) => item.count > 0).map((item) => ({ ...item, label: titleCase(item.name) }));
  return (
    <Card>
      <h3 className="font-bold text-gray-900 dark:text-white">{title}</h3>
      {visibleData.length ? (
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={visibleData} dataKey="count" nameKey="label" innerRadius={56} outerRadius={92} paddingAngle={2}>
                {visibleData.map((item, index) => <Cell key={item.name} fill={COLORS[index % COLORS.length]} />)}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      ) : <p className="py-16 text-center text-sm text-gray-500">No data for this reporting period.</p>}
    </Card>
  );
};

export const BranchReportsPage = () => {
  const pagination = usePagination();
  const initialRange = presetRange("30days");
  const [preset, setPreset] = useState("30days");
  const [draftRange, setDraftRange] = useState(initialRange);
  const [range, setRange] = useState(initialRange);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({ visitorType: "", status: "", departmentId: "" });
  const [visitorId, setVisitorId] = useState(null);
  const [exportOpen, setExportOpen] = useState(false);
  const term = useDebouncedValue(search, 350);
  const invalidRange = Boolean(draftRange.startDate && draftRange.endDate && draftRange.startDate > draftRange.endDate);

  const summary = useQuery({
    queryKey: ["reports", "branch-summary", range],
    queryFn: () => reportService.branchSummary(range),
  });
  const visitorParams = useMemo(() => ({
    ...range,
    ...(term ? { search: term } : {}),
    ...(filters.visitorType ? { visitorType: filters.visitorType } : {}),
    ...(filters.status ? { status: filters.status } : {}),
    ...(filters.departmentId ? { departmentId: filters.departmentId } : {}),
  }), [range, term, filters]);
  const visitorRows = useQuery({
    queryKey: ["reports", "branch-visitors", pagination.page, pagination.size, visitorParams],
    queryFn: () => reportService.branchVisitors({ page: pagination.page, size: pagination.size, ...visitorParams }),
  });

  const selectPreset = (value) => {
    const selectedRange = presetRange(value);
    setPreset(value);
    setDraftRange(selectedRange);
    setRange(selectedRange);
    pagination.resetPage();
  };
  const applyCustomRange = () => {
    if (invalidRange || !draftRange.startDate || !draftRange.endDate) return;
    setPreset("custom");
    setRange(draftRange);
    pagination.resetPage();
  };
  const updateFilter = (name, value) => {
    setFilters((current) => ({ ...current, [name]: value }));
    pagination.resetPage();
  };

  const departmentOptions = (summary.data?.departmentTraffic || [])
    .filter((department) => department.departmentId)
    .map((department) => ({ value: department.departmentId, label: department.department }));
  const periodCount = summary.data?.kpis?.find((kpi) => kpi.key === "visitors")?.value || 0;
  const tableColumns = [
    { header: "Visitor", accessor: (row) => <div><p className="font-semibold text-gray-900 dark:text-white">{row.visitorName}</p><p className="mt-1 text-xs text-gray-500">{row.phoneNumber}</p></div> },
    { header: "Type", accessor: "visitorType", cell: titleCase },
    { header: "Host / Department", accessor: (row) => <div>{row.host || "—"}<p className="mt-1 text-xs text-gray-500">{row.department || "—"}</p></div> },
    { header: "Purpose", accessor: "purpose" },
    { header: "Appointment", accessor: "appointmentDate", cell: formatDate },
    { header: "Check-in", accessor: "checkInAt", cell: formatDateTime },
    { header: "Check-out", accessor: "checkOutAt", cell: formatDateTime },
    { header: "Status", accessor: "status", cell: (value) => <StatusBadge status={titleCase(value)} /> },
    { header: "Physical tag", accessor: "physicalTag" },
    { header: "Action", accessor: (row) => <Button variant="secondary" className="px-3" onClick={() => setVisitorId(row.visitorId)}><FiEye /> View visitor</Button> },
  ];
  const departmentColumns = [
    { header: "Department", accessor: "department" },
    { header: "Visitors", accessor: "visitors" },
    { header: "Appointments", accessor: "appointments" },
    { header: "Walk-ins", accessor: "walkIns" },
    { header: "No-shows", accessor: "noShows" },
  ];
  const tagMetrics = summary.data?.physicalTags;

  if (summary.isLoading) return <TableSkeleton />;
  if (summary.error) return <ApiErrorState error={summary.error} onRetry={summary.refetch} />;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Branch reporting"
        title={`Branch Operations Report — ${summary.data?.branchName || "Assigned Branch"}`}
        description="Branch-scoped visitor traffic, appointment performance, department activity, and physical-tag accountability."
        actions={<Button variant="secondary" onClick={() => setExportOpen(true)}><FiDownload /> Export branch report</Button>}
      />

      <Card className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {[
            ["today", "Today"],
            ["7days", "Last 7 days"],
            ["30days", "Last 30 days"],
            ["month", "This month"],
            ["custom", "Custom range"],
          ].map(([value, label]) => (
            <Button key={value} variant={preset === value ? "primary" : "secondary"} onClick={() => value === "custom" ? setPreset("custom") : selectPreset(value)}>
              {value === "custom" && <FiCalendar />} {label}
            </Button>
          ))}
        </div>
        <div className="grid gap-4 md:grid-cols-[1fr_1fr_auto] md:items-end">
          <Input label="Start date" type="date" value={draftRange.startDate} max={draftRange.endDate || undefined} onChange={(event) => { setPreset("custom"); setDraftRange((current) => ({ ...current, startDate: event.target.value })); }} />
          <Input label="End date" type="date" value={draftRange.endDate} min={draftRange.startDate || undefined} error={invalidRange ? "End date must be on or after start date" : undefined} onChange={(event) => { setPreset("custom"); setDraftRange((current) => ({ ...current, endDate: event.target.value })); }} />
          <Button onClick={applyCustomRange} disabled={invalidRange || !draftRange.startDate || !draftRange.endDate}><FiFilter /> Apply period</Button>
        </div>
        <p className="text-xs text-gray-500">Comparing {formatDate(range.startDate)}–{formatDate(range.endDate)} with {formatDate(summary.data?.previousStartDate)}–{formatDate(summary.data?.previousEndDate)}.</p>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {(summary.data?.kpis || []).map((kpi) => <KpiCard key={kpi.key} kpi={kpi} />)}
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <BreakdownChart title="Visit status breakdown" data={summary.data?.visitStatuses} />
        <BreakdownChart title="Visitor type breakdown" data={summary.data?.visitorTypes} />
      </div>

      <Card>
        <h3 className="mb-4 font-bold text-gray-900 dark:text-white">Department traffic</h3>
        <ResourceTable columns={departmentColumns} rows={summary.data?.departmentTraffic} rowKey="department" emptyTitle="No department traffic" emptyMessage="No department activity was recorded in this period." />
      </Card>

      <Card>
        <div className="mb-4">
          <h3 className="font-bold text-gray-900 dark:text-white">Physical tag accountability</h3>
          <p className="mt-1 text-sm text-gray-500">Current tag inventory and unresolved returns for this branch.</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          {[
            ["Available", tagMetrics?.available, "bg-emerald-50 text-emerald-700"],
            ["Assigned", tagMetrics?.assigned, "bg-sky-50 text-sky-700"],
            ["Lost", tagMetrics?.lost, "bg-rose-50 text-rose-700"],
            ["Damaged", tagMetrics?.damaged, "bg-amber-50 text-amber-700"],
            ["Not returned", tagMetrics?.notReturned, "bg-violet-50 text-violet-700"],
          ].map(([label, value, style]) => <div key={label} className={`rounded-xl p-4 ${style}`}><p className="text-sm font-semibold">{label}</p><p className="mt-2 text-2xl font-bold">{value || 0}</p></div>)}
        </div>
      </Card>

      <Card className="space-y-4">
        <div>
          <h3 className="font-bold text-gray-900 dark:text-white">Detailed visitor report</h3>
          <p className="mt-1 text-sm text-gray-500">Search and filter checked-in visitor records within the reporting period.</p>
        </div>
        <div className="grid gap-4 lg:grid-cols-4">
          <Input label="Search" icon={FiSearch} value={search} onChange={(event) => { setSearch(event.target.value); pagination.resetPage(); }} placeholder="Visitor, phone, company, tag or purpose" />
          <Select label="Visitor type" value={filters.visitorType} onChange={(event) => updateFilter("visitorType", event.target.value)} options={[{ value: "", label: "All visitor types" }, ...VISITOR_TYPES.map((value) => ({ value, label: titleCase(value) }))]} />
          <Select label="Visit status" value={filters.status} onChange={(event) => updateFilter("status", event.target.value)} options={[{ value: "", label: "All visit statuses" }, ...VISIT_STATUSES.map((value) => ({ value, label: titleCase(value) }))]} />
          <Select label="Department" value={filters.departmentId} onChange={(event) => updateFilter("departmentId", event.target.value)} options={[{ value: "", label: "All departments" }, ...departmentOptions]} />
        </div>
        {visitorRows.isLoading ? <TableSkeleton /> : visitorRows.error ? <ApiErrorState error={visitorRows.error} onRetry={visitorRows.refetch} /> : (
          <>
            <ResourceTable columns={tableColumns} rows={visitorRows.data?.content} emptyTitle="No visitor records found" emptyMessage="Try another reporting period or change the table filters." />
            <Pagination page={visitorRows.data} onPageChange={pagination.setPage} />
          </>
        )}
      </Card>

      <VisitorDetailsModal visitorId={visitorId} onClose={() => setVisitorId(null)} />
      <BranchReportExportModal
        isOpen={exportOpen}
        onClose={() => setExportOpen(false)}
        range={range}
        filters={{
          ...(term ? { search: term } : {}),
          ...(filters.visitorType ? { visitorType: filters.visitorType } : {}),
          ...(filters.status ? { status: filters.status } : {}),
          ...(filters.departmentId ? { departmentId: filters.departmentId } : {}),
        }}
        periodCount={periodCount}
        filteredCount={visitorRows.data?.totalElements || 0}
      />
    </div>
  );
};
