import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { FiDownload, FiEye, FiFilter, FiSearch } from "react-icons/fi";
import { PageHeader } from "../../components/ui/PageHeader";
import { Card } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { Select } from "../../components/ui/Select";
import { Button } from "../../components/ui/Button";
import { ResourceTable } from "../../components/ui/ResourceTable";
import { Pagination } from "../../components/ui/Pagination";
import { StatusBadge } from "../../components/ui/StatusBadge";
import { TableSkeleton } from "../../components/ui/Skeleton";
import { ApiErrorState } from "../../components/ui/ApiErrorState";
import { visitorService } from "../../services/visitorService";
import { usePagination } from "../../hooks/usePagination";
import { useDebouncedValue } from "../../hooks/useDebouncedValue";
import { apiAssetUrl } from "../../utils/apiAsset";
import { formatDateTime, titleCase } from "../../utils/formatters";
import { VISITOR_TYPE_OPTIONS } from "../../validation/visitorValidation";
import { VisitorDetailsModal } from "./VisitorDetailsModal";
import { VisitorExportModal } from "./VisitorExportModal";

const STATUS_OPTIONS = ["PRE_REGISTERED", "REGISTERED", "CHECKED_IN", "CHECKED_OUT", "NO_SHOW", "CANCELLED", "EXPIRED", "ACTIVE", "INACTIVE", "BLACKLISTED"].map((value) => ({ value, label: titleCase(value) }));
const APPOINTMENT_STATUS_OPTIONS = ["PENDING", "APPROVED", "CHECKED_IN", "CHECKED_OUT", "NO_SHOW", "CANCELLED", "EXPIRED", "REJECTED"].map((value) => ({ value, label: titleCase(value) }));
const instantStart = (date) => date ? new Date(`${date}T00:00:00.000`).toISOString() : "";
const instantEnd = (date) => date ? new Date(`${date}T23:59:59.999`).toISOString() : "";

export const VisitorsPage = () => {
  const pagination = usePagination();
  const [search, setSearch] = useState("");
  const emptyFilters = { visitorType: "", status: "", appointmentStatus: "", departmentId: "", hostId: "", registeredBy: "", company: "", vehicleNumber: "", createdFrom: "", createdTo: "", appointmentFrom: "", appointmentTo: "", checkInFrom: "", checkInTo: "", checkOutFrom: "", checkOutTo: "" };
  const [filters, setFilters] = useState(emptyFilters);
  const [selectedId, setSelectedId] = useState(null);
  const [exportOpen, setExportOpen] = useState(false);
  const term = useDebouncedValue(search, 350);
  const company = useDebouncedValue(filters.company, 350);
  const vehicleNumber = useDebouncedValue(filters.vehicleNumber, 350);
  const params = useMemo(() => ({
    ...(term ? { search: term } : {}),
    ...(filters.visitorType ? { visitorType: filters.visitorType } : {}),
    ...(filters.status ? { status: filters.status } : {}),
    ...(filters.appointmentStatus ? { appointmentStatus: filters.appointmentStatus } : {}),
    ...(filters.departmentId ? { departmentId: filters.departmentId } : {}),
    ...(filters.hostId ? { hostId: filters.hostId } : {}),
    ...(filters.registeredBy ? { registeredBy: filters.registeredBy } : {}),
    ...(company ? { company } : {}),
    ...(vehicleNumber ? { vehicleNumber } : {}),
    ...(filters.createdFrom ? { createdFrom: instantStart(filters.createdFrom) } : {}),
    ...(filters.createdTo ? { createdTo: instantEnd(filters.createdTo) } : {}),
    ...(filters.appointmentFrom ? { appointmentFrom: filters.appointmentFrom } : {}),
    ...(filters.appointmentTo ? { appointmentTo: filters.appointmentTo } : {}),
    ...(filters.checkInFrom ? { checkInFrom: instantStart(filters.checkInFrom) } : {}),
    ...(filters.checkInTo ? { checkInTo: instantEnd(filters.checkInTo) } : {}),
    ...(filters.checkOutFrom ? { checkOutFrom: instantStart(filters.checkOutFrom) } : {}),
    ...(filters.checkOutTo ? { checkOutTo: instantEnd(filters.checkOutTo) } : {}),
  }), [term, company, vehicleNumber, filters]);
  const result = useQuery({ queryKey: ["visitors", "directory", pagination.page, pagination.size, params], queryFn: () => visitorService.directory({ page: pagination.page, size: pagination.size, ...params }) });
  const hasRegistrationDateFilter = Boolean(filters.createdFrom || filters.createdTo);
  const invalidRegistrationDateRange = Boolean(filters.createdFrom && filters.createdTo && filters.createdFrom > filters.createdTo);
  const updateRegistrationDate = (field, value) => {
    setFilters((current) => ({ ...current, [field]: value }));
    pagination.resetPage();
  };
  const clearRegistrationDates = () => {
    setFilters((current) => ({ ...current, createdFrom: "", createdTo: "" }));
    pagination.resetPage();
  };
  const columns = useMemo(() => [
    { header: "Tags", accessor: (row) => <div><span className="font-semibold text-primary-700">{row.tagNumber || row.visitorCode}</span><span className="mt-1 block text-xs font-semibold text-emerald-700">Physical: {row.physicalTagCode || "—"}</span></div> },
    { header: "Photo", accessor: (row) => row.photographUrl ? <img src={apiAssetUrl(row.photographUrl)} crossOrigin="use-credentials" alt="" className="h-10 w-10 rounded-lg object-cover" /> : <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-50 font-bold text-primary">{row.fullName?.charAt(0)}</span> },
    { header: "Visitor Name", accessor: (row) => <div><p className="font-semibold text-gray-900 dark:text-slate-100">{row.fullName}</p><p className="text-xs text-gray-500">{row.phoneNumber} · {row.email || "No email"}</p></div> },
    { header: "Company / Type", accessor: (row) => <div>{row.company || "—"}<p className="text-xs text-gray-500">{titleCase(row.visitorType)}</p></div> },
    { header: "Purpose", accessor: "purpose" },
    { header: "Host / Department", accessor: (row) => <div>{row.host || "—"}<p className="text-xs text-gray-500">{row.department || "—"}</p></div> },
    { header: "Appointment", accessor: (row) => row.appointmentDate ? `${row.appointmentDate} ${row.appointmentTime || ""}` : "—" },
    { header: "Check-in / out", accessor: (row) => <div>{formatDateTime(row.checkInAt)}<p className="text-xs text-gray-500">Out: {formatDateTime(row.checkOutAt)}</p></div> },
    { header: "Vehicle", accessor: "vehicleNumber" },
    { header: "Status", accessor: "status", cell: (value) => <StatusBadge status={titleCase(value)} /> },
    { header: "Registered by", accessor: "registeredBy" },
    { header: "Registered", accessor: "createdAt", cell: formatDateTime },
    { header: "Action", accessor: "id", cell: (id) => <Button variant="secondary" className="px-3" onClick={() => setSelectedId(id)}><FiEye /> View details</Button> },
  ], []);
  return (
    <div className="space-y-6">
      <PageHeader
        title="View All Visitors"
        description="Search, review, filter, and export established visitor records."
        actions={(
          <Button variant="secondary" onClick={() => setExportOpen(true)}>
            <FiDownload /> Export visitors
          </Button>
        )}
      />
      <Card className="space-y-4">
        <div className="grid gap-4 lg:grid-cols-3">
          <Input label="Search" icon={FiSearch} value={search} onChange={(event) => { setSearch(event.target.value); pagination.resetPage(); }} placeholder="Name, phone, email, visitor code, company, or vehicle" />
          <Input
            label="from"
            type="date"
            value={filters.createdFrom}
            max={filters.createdTo || undefined}
            onChange={(event) => updateRegistrationDate("createdFrom", event.target.value)}
          />
          <Input
            label="to"
            type="date"
            value={filters.createdTo}
            min={filters.createdFrom || undefined}
            onChange={(event) => updateRegistrationDate("createdTo", event.target.value)}
          />
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className={`text-sm ${invalidRegistrationDateRange ? "text-danger" : "text-gray-500 dark:text-slate-400"}`}>
            {invalidRegistrationDateRange
              ? "The end date must be on or after the start date."
              : hasRegistrationDateFilter
                ? "The visitor list and current filtered export use this registration date range."
                : "No date range is applied; the visitor list includes all registration dates."}
          </p>
          {hasRegistrationDateFilter && <Button variant="ghost" onClick={clearRegistrationDates}><FiFilter /> Clear dates</Button>}
        </div>
      </Card>
      <Card>{result.isLoading ? <TableSkeleton /> : result.error ? <ApiErrorState error={result.error} onRetry={result.refetch} /> : <><ResourceTable columns={columns} rows={result.data?.content} emptyTitle="No visitors found" emptyMessage="Try changing the search term or filters." /><Pagination page={result.data} onPageChange={pagination.setPage} /></>}</Card>
      <VisitorDetailsModal visitorId={selectedId} onClose={() => setSelectedId(null)} />
      <VisitorExportModal
        isOpen={exportOpen}
        onClose={() => setExportOpen(false)}
        currentParams={params}
        currentFiltersValid={!invalidRegistrationDateRange}
      />
    </div>
  );
};
